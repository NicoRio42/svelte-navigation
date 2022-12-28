import { derived, writable } from "svelte/store";
import type { RouterLocation } from "./models/route";
import { searchParamsToString } from "./router.helpers";

const _location = writable<RouterLocation>({
  path: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

export const location = derived(_location, ($loc) => $loc);

window.addEventListener("popstate", () => {
  _location.set({
    path: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });
});

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
  const search =
    options?.queryParams === undefined
      ? ""
      : searchParamsToString(options.queryParams);

  const hash =
    options?.hash === undefined || options?.hash === ""
      ? ""
      : `#${options.hash}`;

  _location.set({
    path,
    search,
    hash,
  });

  let uri = path + search + hash;

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
  const search = currentTarget.search;
  const hash = currentTarget.hash;

  if (
    path === window.location.pathname &&
    search === window.location.search &&
    hash === window.location.hash
  )
    return;

  window.history.pushState({}, "", path + search + hash);
  _location.set({ path, search, hash });
}

export function link(node: HTMLAnchorElement): { destroy: () => void } {
  node.addEventListener("click", handleClick);

  return { destroy: () => node.removeEventListener("click", handleClick) };
}
