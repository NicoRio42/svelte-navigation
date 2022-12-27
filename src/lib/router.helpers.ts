import type { AsyncRoute, SyncRoute } from "./models/route";

export function createAsyncRouteFromSyncRoute(
  syncRoute: SyncRoute
): AsyncRoute {
  return {
    asyncComponent: () =>
      Promise.resolve({
        default: syncRoute.component,
        loadData: syncRoute.loadData,
      }),
    loadingComponent: syncRoute.loadingComponent,
    conditions: syncRoute.conditions,
    errorComponent: syncRoute.errorComponent,
  };
}

export function extractSearchParamsFromSearchSting(
  searchString: string
): Record<string, string> {
  if (searchString.length === 0) return {};
  const params: Record<string, string> = {};

  searchString
    .slice(1)
    .split("&")
    .map((keyvalue) => keyvalue.split("="))
    .forEach(([key, value]) => (params[key] = value));

  return params;
}

export function extractPathQueryStringAndFakeHashFromHash(
  hash: string
): string[] {
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

export function areSuperficialyEqual(
  object1: Record<string, unknown>,
  object2: Record<string, unknown>
): boolean {
  return (
    Object.entries(object1).every(([key, value]) => object2[key] === value) &&
    Object.entries(object2).every(([key, value]) => object1[key] === value)
  );
}
