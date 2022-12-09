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

export type RoutePreCondition = (() => boolean) | (() => Promise<boolean>);

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
