import type { Params } from "./params";

export type LoadData =
  | (() => Promise<unknown>)
  | ((pathParams: Params) => Promise<unknown>)
  | ((pathParams: Params, searchParams: Params) => Promise<unknown>);
