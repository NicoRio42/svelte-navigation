import type { PathParams, SearchParams } from "./params";

export type LoadData =
  | (() => Promise<unknown>)
  | ((pathParams: PathParams) => Promise<unknown>)
  | ((pathParams: PathParams, searchParams: SearchParams) => Promise<unknown>);
