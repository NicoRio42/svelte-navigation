import type z from "zod";
import type { PathParams, SearchParams } from "./params";

export type Route = ConstructorOfATypedSvelteComponent | SyncRoute | AsyncRoute;

interface AbstractRoute {
  loadingComponent?: ConstructorOfATypedSvelteComponent;
  conditions?: RoutePreCondition | RoutePreCondition[];
  errorComponent?: ConstructorOfATypedSvelteComponent;
  pathParamsSchema?: z.SomeZodObject;
  seachParamsSchema?: z.SomeZodObject;
}

export interface SyncRoute extends AbstractRoute {
  component: ConstructorOfATypedSvelteComponent;
  loadData?: LoadData;
}

export interface AsyncRoute extends AbstractRoute {
  asyncComponent: () => Promise<{
    default: ConstructorOfATypedSvelteComponent;
    loadData?: LoadData;
  }>;
}

export type RouterLocation = {
  path: string;
  search: string;
  hash: string;
};

export type RoutePreCondition =
  | ((options?: NavigationInformations) => boolean | string)
  | ((options?: NavigationInformations) => Promise<boolean | string>);

export type NavigationInformations = {
  location?: RouterLocation;
  pathParams?: PathParams;
  searchParams?: SearchParams;
};

export type LoadData = (options?: NavigationInformations) => Promise<any>;

export type Routes = Record<string, Route>;

export type PathMatcher = { pattern: RegExp; keys: string[] };
export type RoutesPatterns = {
  pathMatcher: PathMatcher;
  route: Route;
  path: string;
}[];

export function isSyncRoute(route: Route): route is SyncRoute {
  // @ts-ignore
  return route["component"] !== undefined;
}

export function isAsyncRoute(route: Route): route is AsyncRoute {
  // @ts-ignore
  return route["asyncComponent"] !== undefined;
}
