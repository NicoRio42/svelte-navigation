import type { PathParams, SearchParams } from "./models/params.js";
import type { RoutePreCondition, RouterLocation } from "./models/route.js";

export async function checkConditions(
  conditions: RoutePreCondition | RoutePreCondition[],
  location: RouterLocation,
  pathParams: PathParams,
  searchParams: SearchParams
): Promise<boolean | string> {
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
  condition: RoutePreCondition,
  location: RouterLocation,
  pathParams: PathParams,
  searchParams: SearchParams
): Promise<boolean | string> {
  const conditionResult = condition({ location, pathParams, searchParams });

  if (
    typeof conditionResult === "boolean" ||
    typeof conditionResult === "string"
  )
    return Promise.resolve(conditionResult);

  return conditionResult;
}
