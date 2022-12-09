import { hashString, location, queryString } from "./location";

export function link(node: HTMLAnchorElement): { destroy: () => void } {
  function handleClick(event: MouseEvent) {
    const currentTarget = event.currentTarget as HTMLAnchorElement;
    if (currentTarget.origin !== window.location.origin) return;

    event.preventDefault();
    const path = currentTarget.pathname;

    window.history.pushState(
      {},
      "",
      path + currentTarget.search + currentTarget.hash
    );

    location.set(path);
    queryString.set(currentTarget.search);
    hashString.set(currentTarget.hash);
  }

  node.addEventListener("click", handleClick);

  return { destroy: () => node.removeEventListener("click", handleClick) };
}
