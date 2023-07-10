import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { tsMiddleware } from "../mod.ts";

const app = new Application();

// use middleware and transpile TS code
app.use(tsMiddleware);

// serve static file
app.use(async (ctx, next) => {
  try {
    await ctx.send({ root: "./example" });
  } catch {
    await next();
  }
});
await app.listen({ port: 8000 });
