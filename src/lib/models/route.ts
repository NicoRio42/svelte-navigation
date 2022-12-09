import type { LoadData } from "./load";

export type Route = ConstructorOfATypedSvelteComponent | SyncRoute | AsyncRoute;

type SyncRoute = {
  component: ConstructorOfATypedSvelteComponent;
  loadData?: LoadData;
  loadingComponent?: ConstructorOfATypedSvelteComponent;
  conditions?: RoutePreCondition | RoutePreCondition[];
};

type AsyncRoute = {
  asyncComponent: () => Promise<{
    default: ConstructorOfATypedSvelteComponent;
    loadData?: LoadData;
  }>;
  loadingComponent?: ConstructorOfATypedSvelteComponent;
  conditions?: RoutePreCondition | RoutePreCondition[];
};

export type NavigationParams = {
  path: string;
  options?: { queryParams?: Record<string, string>; hash?: string };
};

export type RoutePreCondition =
  | (() => boolean | NavigationParams)
  | (() => Promise<boolean | NavigationParams>);

export type Routes = Record<string, Route>;

export type PathMatcher = { pattern: RegExp; keys: string[] };
export type RoutesPatterns = { pathMatcher: PathMatcher; route: Route }[];

export function isSyncRoute(route: Route): route is SyncRoute {
  // @ts-ignore
  return route["component"] !== undefined;
}

export function isAsyncRoute(route: Route): route is AsyncRoute {
  // @ts-ignore
  return route["asyncComponent"] !== undefined;
}

export function isNavigationParams(
  params: Promise<boolean | NavigationParams> | NavigationParams
): params is NavigationParams {
  // @ts-ignore
  return params["path"] !== undefined;
}
