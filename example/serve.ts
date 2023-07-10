import { serve } from "https://deno.land/std@0.177.0/http/mod.ts";
import {
  fourceInstantiateWasm,
  serveDirWithTs,
  serveFileWithTs,
} from "../mod.ts";

// load the wasm file in the background when the server starts.
console.time("fourceInstantiateWasm");
fourceInstantiateWasm().then(() => {
  console.timeEnd("fourceInstantiateWasm");
});

serve((req) => serveDirWithTs(req, { fsRoot: "example", isBundle: true }));
// serve(req => serveFileWithTs(req, "example/main.ts"));
