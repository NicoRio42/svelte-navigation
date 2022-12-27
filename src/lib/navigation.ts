import { derived, writable } from "svelte/store";
import { getConfig } from "./config.js";

const _location = writable(window.location.pathname);
export const location = derived(_location, ($_location) => $_location);

const queryString = writable(window.location.search);

export const queryParams = derived(queryString, ($queryString) => {
  if ($queryString.length === 0) return {};
  const params: Record<string, string> = {};

  $queryString
    .slice(1)
    .split("&")
    .map((keyvalue) => keyvalue.split("="))
    .forEach(([key, value]) => (params[key] = value));

  return params;
});

const hashString = writable(window.location.hash);

export const hash = derived(hashString, ($hashstring) =>
  $hashstring.length === 0 ? "" : $hashstring.slice(1)
);

if (getConfig().hashMode) {
  window.addEventListener("hashchange", () => {
    const [path, search, hash] = extractPathQueryStringAndFakeHashFromHash(
      window.location.hash
    );

    _location.set(path);
    queryString.set(search);
    hashString.set(hash);
  });
} else {
  window.addEventListener("popstate", () => {
    _location.set(window.location.pathname);
    queryString.set(window.location.search);
    hashString.set(window.location.hash);
  });
}

function extractPathQueryStringAndFakeHashFromHash(hash: string): string[] {
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
  _location.set(path);
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

  if (getConfig().hashMode) {
    uri = "#" + uri;

    if (mode === "push") {
      window.location.hash = uri;
    } else {
      window.history.replaceState({}, "", uri);
      window.dispatchEvent(new Event("hashchange"));
    }

    return;
  }

  if (mode === "push") {
    window.history.pushState({}, "", uri);
  } else {
    window.history.replaceState({}, "", uri);
  }
}

function handleClick(event: MouseEvent) {
  event.preventDefault();
  const currentTarget = event.currentTarget as HTMLAnchorElement;
  const path = currentTarget.pathname;

  window.history.pushState(
    {},
    "",
    path + currentTarget.search + currentTarget.hash
  );

  console.log(path);

  _location.set(path);
  queryString.set(currentTarget.search);
  hashString.set(currentTarget.hash);
}

export function link(node: HTMLAnchorElement): { destroy: () => void } {
  node.addEventListener("click", handleClick);

  return { destroy: () => node.removeEventListener("click", handleClick) };
}
