import type { PathParams, SearchParams } from "./params";

export type LoadData =
  | (() => Promise<any>)
  | ((pathParams: PathParams) => Promise<any>)
  | ((pathParams: PathParams, searchParams: SearchParams) => Promise<any>);
