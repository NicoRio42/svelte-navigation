import type { PathParams } from "./models/params";
import type { PathMatcher } from "./models/route";

export function extractParamsFromPath(
  path: string,
  pathMatcher: PathMatcher
): PathParams {
  let i = 0,
    out: PathParams = {};

  let matches = pathMatcher.pattern.exec(path);
  if (matches === null) return out;

  while (i < pathMatcher.keys.length) {
    const rawMatch = matches[++i];

    if (rawMatch === undefined) {
      out[pathMatcher.keys[i - 1]] = null;
      continue;
    }

    const numberMatch = Number(rawMatch);
    out[pathMatcher.keys[i - 1]] = isNaN(numberMatch) ? rawMatch : numberMatch;
  }

  return out;
}
