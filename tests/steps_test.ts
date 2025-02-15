import { createHandler, ServeHandlerInfo } from "$fresh/server.ts";
import manifest from "../fresh.gen.ts";
import config from "../fresh.config.ts";
import { assertEquals } from "https://deno.land/std@0.216.0/assert/mod.ts";

const CONN_INFO: ServeHandlerInfo = {
  remoteAddr: { hostname: "127.0.0.1", port: 8000, transport: "tcp" },
  // @ts-ignore
  completed: () => {},
};

Deno.test("Steps component renders without errors", async (t) => {
  const handler = await createHandler(manifest, config);
  const resp = await handler(new Request("http://127.0.0.1/steps"), CONN_INFO);
  const text = await resp.text();
  assertEquals(text.includes("<div"), true);
});