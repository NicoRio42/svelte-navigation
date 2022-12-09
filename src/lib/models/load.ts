import type { Params } from "./params";

export type LoadData = (params?: Params) => Promise<unknown>;
