<script context="module" lang="ts">
  import { derived, writable } from "svelte/store";
  import { getConfig } from "./config.js";

  export const location = writable(window.location.pathname);

  const queryString = writable(window.location.search);

  export const queryParams = derived(queryString, ($queryString) => {
    if ($queryString.length === 0) return {};
    const params: Record<string, string> = {};

    $queryString
      .slice(1)
      .split("&")
      .map((keyvalue) => keyvalue.split("="))
      .forEach(([key, value]) => (params[key] = value));

    return params;
  });

  const hashString = writable(window.location.hash);

  export const hash = derived(hashString, ($hashstring) =>
    $hashstring.length === 0 ? "" : $hashstring.slice(1)
  );

  if (getConfig().hashMode) {
    window.addEventListener("hashchange", () => {
      const [path, search, hash] = extractPathQueryStringAndFakeHashFromHash(
        window.location.hash
      );

      location.set(path);
      queryString.set(search);
      hashString.set(hash);
    });
  } else {
    window.addEventListener("popstate", () => {
      location.set(window.location.pathname);
      queryString.set(window.location.search);
      hashString.set(window.location.hash);
    });
  }

  function extractPathQueryStringAndFakeHashFromHash(hash: string): string[] {
    if (hash.length === 0) return ["", "", ""];

    const cleanedHash = hash.slice(1);
    const fullLocation = cleanedHash.split("?");

    if (fullLocation.length === 1) fullLocation.push("");
    else fullLocation[1] = "?" + fullLocation[1];

    const fullQueryStr = fullLocation[1].split("#");
    if (fullQueryStr.length === 1) fullLocation.push("");
    else {
      fullLocation[1] = fullQueryStr[0];
      fullLocation.push("#" + fullQueryStr[1]);
    }

    return fullLocation;
  }

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
    location.set(path);
    let uri = path;

    if (options?.queryParams !== undefined) {
      const queryStr =
        "?" +
        Object.entries(options.queryParams)
          .map((keyvalue) =>
            keyvalue
              .map((keyOrValue) => encodeURIComponent(keyOrValue))
              .join("=")
          )
          .join("&");

      queryString.set(queryStr);
      uri += queryStr;
    }

    if (options?.hash !== undefined) {
      const hashStr = "#" + encodeURIComponent(options.hash);
      hashString.set(hashStr);
      uri += hashStr;
    }

    if (getConfig().hashMode) {
      uri = "#" + uri;

      if (mode === "push") {
        window.location.hash = uri;
      } else {
        window.history.replaceState({}, "", uri);
        window.dispatchEvent(new Event("hashchange"));
      }

      return;
    }

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

    window.history.pushState(
      {},
      "",
      path + currentTarget.search + currentTarget.hash
    );

    console.log(path);

    location.set(path);
    queryString.set(currentTarget.search);
    hashString.set(currentTarget.hash);
  }

  export function link(node: HTMLAnchorElement): { destroy: () => void } {
    node.addEventListener("click", handleClick);

    return { destroy: () => node.removeEventListener("click", handleClick) };
  }
</script>

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
