import type { Params } from "./models/params";
import type { PathMatcher } from "./models/route";

export function extractParamsFromPath(
  path: string,
  pathMatcher: PathMatcher
): Params {
  let i = 0,
    out: Params = {};

  let matches = pathMatcher.pattern.exec(path);
  if (matches === null) return out;

  while (i < pathMatcher.keys.length) {
    out[pathMatcher.keys[i]] = matches[++i] || null;
  }

  return out;
}
