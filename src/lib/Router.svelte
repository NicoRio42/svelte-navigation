<script lang="ts">
  import { parse } from "regexparam";
  import { createEventDispatcher, getContext, setContext } from "svelte";
  import { checkConditions } from "./conditions.js";
  import type { Params } from "./models/params";
  import {
    isAsyncRoute,
    isSyncRoute,
    type Routes,
    type RoutesPatterns,
  } from "./models/route.js";
  import { location, replace } from "./navigation.js";
  import { extractParamsFromPath } from "./params.js";
  import { createReference, type Reference } from "./reference.js";

  export let routes: Routes;
  const dispatch = createEventDispatcher();

  const prefixReference = getContext<Reference<string> | undefined>("prefix");
  const prefixForChildrenReference = createReference("");
  setContext("prefix", prefixForChildrenReference);

  let component: ConstructorOfATypedSvelteComponent | null = null;
  let loadingComponent: ConstructorOfATypedSvelteComponent | null = null;
  let errorComponent: ConstructorOfATypedSvelteComponent | null = null;
  let data: unknown;
  let params: Params;

  const routePatterns: RoutesPatterns = Object.entries(routes).map(
    ([path, route]) => {
      const prefix = prefixReference !== undefined ? prefixReference.get() : "";
      const prefixedPath = prefix + path;
      const pathMatcher = parse(prefixedPath);
      return { pathMatcher, route, path: prefixedPath };
    }
  );

  location.subscribe((loc) => handleMatchedRoute(loc));

  async function handleMatchedRoute(loc: string) {
    console.log(loc);
    errorComponent = null;
    loadingComponent = null;

    const matchedRoute = routePatterns.find((route) =>
      route.pathMatcher.pattern.test(loc)
    );

    if (matchedRoute === undefined) return;

    prefixForChildrenReference.set(
      matchedRoute.path.endsWith("/*")
        ? matchedRoute.path.slice(0, -2)
        : matchedRoute.path
    );

    params = extractParamsFromPath(loc, matchedRoute.pathMatcher);

    if (isSyncRoute(matchedRoute.route)) {
      const {
        component: matchedComponent,
        loadData,
        loadingComponent: matchedLoadingComponent,
        conditions,
        errorComponent: matchedErrorComponent,
      } = matchedRoute.route;

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

        component = matchedComponent;
        if (loadData === undefined) return;

        data = await loadData(params);
        loadingComponent = null;
        return;
      } catch (error) {
        if (matchedErrorComponent !== undefined)
          errorComponent = matchedErrorComponent;
        return;
      }
    }

    if (isAsyncRoute(matchedRoute.route)) {
      const {
        asyncComponent,
        loadingComponent: matchedLoadingComponent,
        conditions,
        errorComponent: matchedErrorComponent,
      } = matchedRoute.route;

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

        data = await loadData(params);
        component = matchedComponent;
        loadingComponent = null;

        return;
      } catch (error) {
        if (matchedErrorComponent !== undefined)
          errorComponent = matchedErrorComponent;
        return;
      }
    }

    component = matchedRoute.route;
  }
</script>

{#if errorComponent}
  <svelte:component this={errorComponent} />
{:else if loadingComponent}
  <svelte:component this={loadingComponent} />
{:else}
  <svelte:component this={component} {data} {params} />
{/if}
