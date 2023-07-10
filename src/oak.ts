import type { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { convertBodyToBodyInit } from "https://deno.land/x/oak@v11.1.0/response.ts";
import { MediaType } from "../utils/transpile.ts";
import {
  getRealPathByUrl,
  transpileOrBundle,
} from "../utils/transpile_response.ts";

// import { MediaType, transpile } from "../utils/transpile.ts";

const decoder = new TextDecoder();
const tsType = new Set<string | undefined>(
  ["ts", ".ts", "mts", ".mts", "video/mp2t"],
);
const tsxType = new Set<string | undefined>(["tsx", ".tsx"]);
const jsxType = new Set<string | undefined>(["jsx", ".jsx", "text/jsx"]);

/**
 * Oak middleware that rewrites TypeScript response to JavaScript response.
 *
 * ```ts
 * import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
 * import { tsMiddleware, fourceInstantiateWasm } from "https://deno.land/x/ts_serve@$MODULE_VERSION/mod.ts";
 *
 * fourceInstantiateWasm();
 * const app = new Application();
 *
 * // use middleware and transpile TS code
 * app.use(tsMiddleware);
 *
 * // serve static file
 * app.use(async (ctx, next) => {
 *   try {
 *     await ctx.send({ root: "./" });
 *   } catch {
 *     await next();
 *   }
 * });
 * await app.listen({ port: 8000 });
 * ```
 */
export async function tsMiddleware(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  if (/\.(ts|tsx|jsx)$/.test(ctx.request.url.pathname) === false) {
    console.log("tsMiddleware ddd", ctx.request.url.pathname);
    return next();
  }

  const specifier = ctx.request.url;
  const { realPath } = getRealPathByUrl(specifier.href, undefined, {
    fsRoot: "example",
    isBundle: true,
  });
  const code = await transpileOrBundle(realPath, true);
  // console.log("tsMiddleware", code);
  // const headers = new Headers();
  // headers.set("content-type", "application/javascript; charset=utf-8");
  // return new Response(code, {
  //   status: 200,
  //   statusText: "OK",
  //   headers,
  // });
  // console.log("tsMiddleware", ctx.request.url.pathname);
  await next();
  ctx.response.body = code;
  // ctx.response.headers = headers;
  ctx.response.type = ".js";
  // next();
}
