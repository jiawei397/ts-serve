import { MediaType } from "../utils/transpile.ts";
import { bundle, transpile } from "../deps.ts";
import path from "node:path";
import { ServeDirOptions } from "../types.ts";

const jsContentType = "application/javascript; charset=UTF-8";

/**
 * Transpile the body of the response and return a new response.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.177.0/http/mod.ts";
 * import { serveFile } from "https://deno.land/std@0.177.0/http/file_server.ts";
 *
 * import { transpileResponse } from "https://deno.land/x/ts_serve@$MODULE_VERSION/utils/transpile_response.ts"
 *
 * serve(async (request) => {
 *   const filePath = "./mod.ts";
 *   const response = await serveFile(request, filePath);
 *   return await transpileResponse(response, request.url, filePath);
 * });
 * ```
 *
 * @param  response The response you want to transpile
 * @param  requestUrl The URL used to construct the source map URL
 * @param  filepath If specified, the file path extension is used to determine the file type.
 */
export async function transpileResponse(
  response: Response,
  requestUrl: string,
  filepath?: string,
  options?: ServeDirOptions,
): Promise<Response> {
  if (response.status !== 200) {
    return response;
  }
  const { realPath } = getRealPathByUrl(requestUrl, filepath, options);
  if (realPath.endsWith(".ts")) {
    return await rewriteTsResponse(
      response,
      realPath,
      MediaType.TypeScript,
      options?.isBundle,
    );
  } else if (realPath.endsWith(".tsx")) {
    return await rewriteTsResponse(
      response,
      realPath,
      MediaType.Tsx,
      options?.isBundle,
    );
  } else if (realPath.endsWith(".jsx")) {
    return await rewriteTsResponse(
      response,
      realPath,
      MediaType.Jsx,
      options?.isBundle,
    );
  } else {
    return response;
  }
}

export function getRealPathByUrl(
  requestUrl: string,
  filepath?: string,
  options?: ServeDirOptions,
) {
  const url = new URL(requestUrl);
  const pathname = url.pathname;
  const realPathname = filepath !== undefined
    ? filepath
    : (options?.fsRoot ?? "") + pathname; // ex: example/main.ts
  const realPath = path.resolve(realPathname);
  return { url, pathname, realPathname, realPath };
}

export async function transpileOrBundle(
  realPath: string | URL,
  isBundle: boolean,
) {
  let code: string | undefined;
  if (isBundle) {
    const result = await bundle(realPath, {});
    code = result.code;
  } else {
    const result = await transpile(realPath, {});
    if (realPath instanceof URL) { // TODO: check
      code = result.get(realPath.href);
    } else {
      const key = "file://" + path.resolve(realPath);
      code = result.get(key);
    }
  }
  return code;
}

async function rewriteTsResponse(
  response: Response,
  url: string,
  mediaType: MediaType,
  isBundle = false, // default is transpile
) {
  const code = await transpileOrBundle(url, isBundle);
  const { headers } = response;
  headers.set("content-type", jsContentType);
  headers.delete("content-length");
  headers.set("x-media-type", mediaType + "");
  return new Response(code, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
