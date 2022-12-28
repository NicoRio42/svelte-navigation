<script lang="ts">
  import { parse } from "regexparam";
  import { getContext, setContext } from "svelte";
  import { checkConditions } from "./conditions.js";
  import type { Params } from "./models/params";
  import {
    isAsyncRoute,
    isSyncRoute,
    type AsyncRoute,
    type RouterLocation,
    type Routes,
    type RoutesPatterns,
  } from "./models/route.js";
  import { location, replace } from "./navigation.js";
  import { extractParamsFromPath } from "./params.js";
  import { createReference, type Reference } from "./reference.js";
  import {
    areSuperficialyEqual,
    createAsyncRouteFromSyncRoute,
    extractSearchParamsFromSearchSting,
  } from "./router.helpers.js";

  export let routes: Routes;

  const prefixReference = getContext<Reference<string> | undefined>("prefix");
  const prefixForChildrenReference = createReference("");
  setContext("prefix", prefixForChildrenReference);

  let component: ConstructorOfATypedSvelteComponent | null = null;
  let loadingComponent: ConstructorOfATypedSvelteComponent | null = null;
  let errorComponent: ConstructorOfATypedSvelteComponent | null = null;
  let data: unknown;
  let pathParams: Params;
  let searchParams: Params;

  const routePatterns: RoutesPatterns = Object.entries(routes).map(
    ([path, route]) => {
      const prefix = prefixReference !== undefined ? prefixReference.get() : "";
      const prefixedPath = prefix + path;
      const pathMatcher = parse(prefixedPath);
      return { pathMatcher, route, path: prefixedPath };
    }
  );

  location.subscribe((loc) => handleMatchedRoute(loc));

  async function handleMatchedRoute(loc: RouterLocation) {
    errorComponent = null;
    loadingComponent = null;

    const matchedRoute = routePatterns.find((route) =>
      route.pathMatcher.pattern.test(loc.path)
    );

    if (matchedRoute === undefined) return;

    const prefixForChildren = matchedRoute.path.endsWith("/*")
      ? matchedRoute.path.slice(0, -2)
      : matchedRoute.path;

    if (!isAsyncRoute(matchedRoute.route) && !isSyncRoute(matchedRoute.route)) {
      component = matchedRoute.route;
      prefixForChildrenReference.set(prefixForChildren);
      return;
    }

    const asyncRoute: AsyncRoute = isAsyncRoute(matchedRoute.route)
      ? matchedRoute.route
      : createAsyncRouteFromSyncRoute(matchedRoute.route);

    const {
      asyncComponent,
      loadingComponent: matchedLoadingComponent,
      conditions,
      errorComponent: matchedErrorComponent,
      pathParamsSchema,
      seachParamsSchema,
    } = asyncRoute;

    const rawPathParams = extractParamsFromPath(
      loc.path,
      matchedRoute.pathMatcher
    );

    let parsedPathParams: Params;

    if (pathParamsSchema !== undefined) {
      try {
        parsedPathParams = pathParamsSchema.parse(rawPathParams);
      } catch (e) {
        return;
      }
    } else {
      parsedPathParams = rawPathParams;
    }

    if (!areSuperficialyEqual(pathParams, parsedPathParams))
      pathParams = parsedPathParams;

    const rawSearchParams = extractSearchParamsFromSearchSting(loc.search);
    let parsedSearchParams: Params;

    if (seachParamsSchema !== undefined) {
      try {
        parsedSearchParams = seachParamsSchema.parse(rawSearchParams);
      } catch (e) {
        return;
      }
    } else {
      parsedSearchParams = rawSearchParams;
    }

    if (!areSuperficialyEqual(pathParams, parsedPathParams))
      searchParams = parsedSearchParams;

    prefixForChildrenReference.set(prefixForChildren);

    if (matchedLoadingComponent !== undefined)
      loadingComponent = matchedLoadingComponent;

    try {
      if (conditions !== undefined) {
        const conditionsResult = await checkConditions(conditions);

        if (typeof conditionsResult !== "boolean") {
          loadingComponent = null;
          replace(conditionsResult.path, conditionsResult.options);
          return;
        }

        if (!conditionsResult) return;
      }

      const { default: matchedComponent, loadData } = await asyncComponent();

      if (loadData === undefined) {
        component = matchedComponent;
        return;
      }

      data = await loadData(pathParams, searchParams);
      component = matchedComponent;
      loadingComponent = null;

      return;
    } catch (error) {
      console.error(error);
      loadingComponent = null;

      if (matchedErrorComponent !== undefined)
        errorComponent = matchedErrorComponent;

      return;
    }
  }
</script>

{#if errorComponent}
  <svelte:component this={errorComponent} />
{:else if loadingComponent}
  <svelte:component this={loadingComponent} />
{:else}
  <svelte:component this={component} {data} {pathParams} {searchParams} />
{/if}
