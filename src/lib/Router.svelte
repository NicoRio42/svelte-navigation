<script lang="ts" context="module">
  import { writable } from "svelte/store";
  import { handleScroll, searchParamsToString } from "./router.helpers";

  const currentNavigationSymbolReference = createReference<Symbol>(Symbol());

  const location = writable<RouterLocation>({
    path: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });

  window.addEventListener("popstate", () => {
    location.set({
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });
  });

  export function push(
    path: string,
    options?: { queryParams?: Record<string, string>; hash?: string }
  ) {
    navigate("push", path, options);
  }

  export function replace(
    path: string,
    options?: { queryParams?: Record<string, string>; hash?: string }
  ) {
    navigate("replace", path, options);
  }

  export function back() {
    window.history.back();
  }

  export function forward() {
    window.history.forward();
  }

  function navigate(
    mode: "push" | "replace",
    path: string,
    options?: { queryParams?: Record<string, string>; hash?: string }
  ) {
    const search =
      options?.queryParams === undefined
        ? ""
        : searchParamsToString(options.queryParams);

    const hash =
      options?.hash === undefined || options?.hash === ""
        ? ""
        : `#${options.hash}`;

    location.set({
      path,
      search,
      hash,
    });

    let uri = path + search + hash;

    if (mode === "push") {
      window.history.pushState({}, "", uri);
    } else {
      window.history.replaceState({}, "", uri);
    }
  }

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    const currentTarget = event.currentTarget as HTMLAnchorElement;
    const path = currentTarget.pathname;
    const search = currentTarget.search;
    const hash = currentTarget.hash;

    if (
      path === window.location.pathname &&
      search === window.location.search &&
      hash === window.location.hash
    )
      return;

    window.history.pushState({}, "", path + search + hash);
    location.set({ path, search, hash });
  }

  export function link(node: HTMLAnchorElement): { destroy: () => void } {
    node.addEventListener("click", handleClick);

    return { destroy: () => node.removeEventListener("click", handleClick) };
  }
</script>

<script lang="ts">
  import { parse } from "regexparam";
  import { getContext, setContext } from "svelte";
  import { checkConditions } from "./conditions.js";
  import {
    isAsyncRoute,
    isSyncRoute,
    type AsyncRoute,
    type RouterLocation,
    type Routes,
    type RoutesPatterns,
  } from "./models/route.js";
  import { extractParamsFromPath } from "./params.js";
  import { createReference, type Reference } from "./reference.js";
  import {
    areSuperficialyEqual,
    createAsyncRouteFromSyncRoute,
    extractSearchParamsFromSearchSting,
  } from "./router.helpers.js";
  import { createEventDispatcher } from "svelte";
  import type { PathParams, SearchParams } from "./models/params";

  export let routes: Routes;
  export let loadingComponent: ConstructorOfATypedSvelteComponent | null = null;
  export let errorComponent: ConstructorOfATypedSvelteComponent | null = null;

  const dispatch = createEventDispatcher();

  const prefixReference = getContext<Reference<string> | undefined>("prefix");
  const prefixForChildrenReference = createReference("");
  setContext("prefix", prefixForChildrenReference);

  let component: ConstructorOfATypedSvelteComponent | null = null;

  let displayedLoadingComponent: ConstructorOfATypedSvelteComponent | null =
    null;

  let displayedErrorComponent: ConstructorOfATypedSvelteComponent | null = null;
  let data: unknown;
  let pathParams: PathParams;
  let searchParams: SearchParams;
  let error: unknown;

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
    displayedErrorComponent = null;
    displayedLoadingComponent = null;

    const matchedRoute = routePatterns.find((route) =>
      route.pathMatcher.pattern.test(loc.path)
    );

    if (matchedRoute === undefined) return;

    const currentNavigationSymbol = Symbol();
    currentNavigationSymbolReference.set(currentNavigationSymbol);

    const prefixForChildren = matchedRoute.path.endsWith("/*")
      ? matchedRoute.path.slice(0, -2)
      : matchedRoute.path;

    const rawPathParams = extractParamsFromPath(
      loc.path,
      matchedRoute.pathMatcher
    );

    const rawSearchParams = extractSearchParamsFromSearchSting(loc.search);

    // Simple component
    if (!isAsyncRoute(matchedRoute.route) && !isSyncRoute(matchedRoute.route)) {
      dispatch("navigationStart");

      if (!areSuperficialyEqual(pathParams, rawPathParams))
        pathParams = rawPathParams;

      if (!areSuperficialyEqual(pathParams, rawSearchParams))
        searchParams = rawSearchParams;

      component = matchedRoute.route;
      prefixForChildrenReference.set(prefixForChildren);
      handleScroll(loc.hash);
      dispatch("navigationFinish");
      return;
    }

    // Transforming syncRoute to asyncRoute
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

    let parsedPathParams: PathParams;

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

    let parsedSearchParams: SearchParams;

    if (seachParamsSchema !== undefined) {
      try {
        parsedSearchParams = seachParamsSchema.parse(rawSearchParams);
      } catch (e) {
        return;
      }
    } else {
      parsedSearchParams = rawSearchParams;
    }

    if (!areSuperficialyEqual(searchParams, parsedSearchParams))
      searchParams = parsedSearchParams;

    prefixForChildrenReference.set(prefixForChildren);

    dispatch("navigationStart");

    if (matchedLoadingComponent !== undefined)
      displayedLoadingComponent = matchedLoadingComponent;
    else if (loadingComponent !== null)
      displayedLoadingComponent = loadingComponent;

    try {
      if (conditions !== undefined) {
        const conditionsResult = await checkConditions(
          conditions,
          loc,
          pathParams,
          searchParams
        );

        if (typeof conditionsResult !== "boolean") {
          displayedLoadingComponent = null;
          replace(conditionsResult.path, conditionsResult.options);
          dispatch("navigationFinish");
          return;
        }

        if (!conditionsResult) {
          dispatch("navigationFinish");
          return;
        }
      }

      const { default: matchedComponent, loadData } = await asyncComponent();

      if (loadData === undefined) {
        component = matchedComponent;
        handleScroll(loc.hash);
        dispatch("navigationFinish");
        return;
      }

      const currentNavigationData = await loadData(pathParams, searchParams);

      // Cancelling if another navigation has been triggered
      if (currentNavigationSymbol !== currentNavigationSymbolReference.get())
        return;

      data = currentNavigationData;

      component = matchedComponent;
      displayedLoadingComponent = null;

      handleScroll(loc.hash);
      dispatch("navigationFinish");
      return;
    } catch (e) {
      console.error(e);
      error = e;
      displayedLoadingComponent = null;

      if (matchedErrorComponent !== undefined)
        displayedErrorComponent = matchedErrorComponent;
      else if (errorComponent !== null)
        displayedErrorComponent = errorComponent;

      dispatch("navigationFinish");
      return;
    }
  }
</script>

{#if displayedErrorComponent}
  <svelte:component this={displayedErrorComponent} {error} />
{:else if displayedLoadingComponent}
  <svelte:component this={displayedLoadingComponent} />
{:else}
  <svelte:component this={component} {data} {pathParams} {searchParams} />
{/if}
