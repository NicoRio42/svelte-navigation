import { derived, writable } from "svelte/store";
import { getConfig } from "./config";

export const location = writable(window.location.pathname);

export const queryString = writable(window.location.search);

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

export const hashString = writable(window.location.hash);
export const hash = derived(hashString, ($hashstring) =>
  $hashstring.length === 0 ? "" : $hashstring.slice(1)
);

if (getConfig().hashMode) {
  window.addEventListener("hashchange", () => {
    const [path, search, hash] = extractPathQueryStringAndFakeHashFromHash(
      window.location.hash
    );

    location.set(path);
    queryString.set(search);
    hashString.set(hash);
  });
} else {
  window.addEventListener("popstate", () => {
    location.set(window.location.pathname);
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
