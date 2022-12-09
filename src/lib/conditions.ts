import {
  isNavigationParams,
  type NavigationParams,
  type RoutePreCondition,
} from "./models/route";

export async function checkConditions(
  conditions: RoutePreCondition | RoutePreCondition[]
): Promise<boolean | NavigationParams> {
  if (!Array.isArray(conditions)) {
    return checkSingleCondition(conditions);
  }

  for (const condition of conditions) {
    const result = checkSingleCondition(condition);
    if ((await result) !== true) return result;
  }

  return Promise.resolve(true);
}

function checkSingleCondition(
  conditions: RoutePreCondition
): Promise<boolean | NavigationParams> {
  const conditionResult = conditions();
  if (
    typeof conditionResult === "boolean" ||
    isNavigationParams(conditionResult)
  )
    return Promise.resolve(conditionResult);
  return conditionResult;
}
