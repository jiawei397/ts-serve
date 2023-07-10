import type { ServeDirOptions as OriginServeDirOptions, ServeFileOptions as OriginServeFileOptions } from "./deps.ts";

export type ServeDirOptions = OriginServeDirOptions & {
    isBundle?: boolean;
};

export type ServeFileOptions = OriginServeFileOptions & {
    isBundle?: boolean;
};