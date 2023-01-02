<script lang="ts" context="module">
  import { writable } from "svelte/store";
  import { handleScroll } from "./router.helpers";

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

  export function push(locationString: string) {
    setLocationFromString(locationString);
    window.history.pushState({}, "", locationString);
  }

  export function replace(locationString: string) {
    setLocationFromString(locationString);
    window.history.replaceState({}, "", locationString);
  }

  export function back() {
    window.history.back();
  }

  export function forward() {
    window.history.forward();
  }

  function setLocationFromString(locationString: string) {
    const url = new URL(window.location.origin + locationString);
    location.set({ path: url.pathname, search: url.search, hash: url.hash });
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
  import { createEventDispatcher, getContext, setContext } from "svelte";
  import type { z } from "zod";
  import { checkConditions } from "./conditions.js";
  import type { PathParams, SearchParams } from "./models/params";
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

    const parsedPathParams = parseParams(rawPathParams, pathParamsSchema);
    if (parsedPathParams === null) return;

    if (!areSuperficialyEqual(pathParams, parsedPathParams))
      pathParams = parsedPathParams;

    const parsedSearchParams = parseParams(rawSearchParams, seachParamsSchema);
    if (parsedSearchParams === null) return;

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
          replace(conditionsResult);
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
        // Cancelling if another navigation has been triggered
        if (currentNavigationSymbol !== currentNavigationSymbolReference.get())
          return;

        component = matchedComponent;
        handleScroll(loc.hash);
        dispatch("navigationFinish");
        return;
      }

      const currentNavigationData = await loadData({
        location: loc,
        pathParams,
        searchParams,
      });

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
      // Cancelling if another navigation has been triggered
      if (currentNavigationSymbol !== currentNavigationSymbolReference.get())
        return;

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

  function parseParams<T extends PathParams | SearchParams>(
    rawParams: T,
    paramsSchema: z.SomeZodObject | undefined
  ): T | null {
    let parsedParams: T;

    if (paramsSchema !== undefined) {
      try {
        parsedParams = paramsSchema.parse(rawParams);
      } catch (e) {
        return null;
      }
    } else {
      parsedParams = rawParams;
    }

    return parsedParams;
  }
</script>

{#if displayedErrorComponent}
  <svelte:component this={displayedErrorComponent} {error} />
{:else if displayedLoadingComponent}
  <svelte:component this={displayedLoadingComponent} />
{:else}
  <svelte:component this={component} {data} {pathParams} {searchParams} />
{/if}
