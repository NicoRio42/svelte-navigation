import { hashString, location, queryString } from "./location";

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
          keyvalue.map((keyOrValue) => encodeURIComponent(keyOrValue)).join("=")
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

  if (mode === "push") {
    window.history.pushState({}, "", uri);
  } else {
    window.history.replaceState({}, "", uri);
  }
}
