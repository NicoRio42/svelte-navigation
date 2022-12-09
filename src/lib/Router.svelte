<script lang="ts">
  import { parse } from "regexparam";
  import { location } from "./location";
  import type { Params } from "./models/params";
  import {
    isAsyncRoute,
    isSyncRoute,
    type Routes,
    type RoutesPatterns,
  } from "./models/route";
  import { extractParamsFromPath } from "./params";

  export let routes: Routes;

  let component: ConstructorOfATypedSvelteComponent | null = null;
  let loadingComponent: ConstructorOfATypedSvelteComponent | null = null;
  let data: unknown;
  let params: Params;

  let routePatterns: RoutesPatterns;

  $: routePatterns = Object.entries(routes).map(([path, route]) => {
    const pathMatcher = parse(path);
    return { pathMatcher, route };
  });

  $: handleMatchedRoute(routePatterns, $location);

  async function handleMatchedRoute(routes: RoutesPatterns, location: string) {
    const matchedRoute = routes.find((route) =>
      route.pathMatcher.pattern.test(location)
    );

    if (matchedRoute === undefined) return;
    params = extractParamsFromPath(location, matchedRoute.pathMatcher);

    if (isSyncRoute(matchedRoute.route)) {
      const {
        component: matchedComponent,
        loadData,
        loadingComponent: matchedLoadingComponent,
      } = matchedRoute.route;

      component = matchedComponent;
      if (loadData === undefined) return;

      if (matchedLoadingComponent !== undefined)
        loadingComponent = matchedLoadingComponent;

      data = await loadData(params);
      loadingComponent = null;
      return;
    }

    if (isAsyncRoute(matchedRoute.route)) {
      const { asyncComponent, loadingComponent: matchedLoadingComponent } =
        matchedRoute.route;

      if (matchedLoadingComponent !== undefined)
        loadingComponent = matchedLoadingComponent;

      const { default: matchedComponent, loadData } = await asyncComponent();

      if (loadData === undefined) {
        component = matchedComponent;
        return;
      }

      data = await loadData(params);
      component = matchedComponent;
      loadingComponent = null;

      return;
    }

    component = matchedRoute.route;
  }
</script>

{#if loadingComponent}
  <svelte:component this={loadingComponent} />
{:else}
  <svelte:component this={component} {data} {params} />
{/if}
