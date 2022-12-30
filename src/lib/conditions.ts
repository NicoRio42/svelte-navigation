import type { PathParams, SearchParams } from "./models/params.js";
import {
  isNavigationParams,
  type NavigationParams,
  type RoutePreCondition,
  type RouterLocation,
} from "./models/route.js";

export async function checkConditions(
  conditions: RoutePreCondition | RoutePreCondition[],
  location: RouterLocation,
  pathParams: PathParams,
  searchParams: SearchParams
): Promise<boolean | NavigationParams> {
  if (!Array.isArray(conditions)) {
    return checkSingleCondition(conditions, location, pathParams, searchParams);
  }

  for (const condition of conditions) {
    const result = checkSingleCondition(
      condition,
      location,
      pathParams,
      searchParams
    );
    if ((await result) !== true) return result;
  }

  return Promise.resolve(true);
}

function checkSingleCondition(
  conditions: RoutePreCondition,
  location: RouterLocation,
  pathParams: PathParams,
  searchParams: SearchParams
): Promise<boolean | NavigationParams> {
  const conditionResult = conditions({ location, pathParams, searchParams });
  if (
    typeof conditionResult === "boolean" ||
    isNavigationParams(conditionResult)
  )
    return Promise.resolve(conditionResult);
  return conditionResult;
}
