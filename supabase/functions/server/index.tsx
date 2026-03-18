import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Global error handler to catch broken pipe and other errors
app.onError((err, c) => {
  console.log("Server error:", err.message);
  try {
    return c.json({ ok: false, error: err.message }, 500);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c8f2251b/health", (c) => {
  return c.json({ status: "ok" });
});

/* ─── 범용 KV 저장소 API ─── */

// 단일 키 읽기
app.get("/make-server-c8f2251b/store/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const value = await kv.get(key);
    return c.json({ ok: true, value: value ?? null });
  } catch (e: any) {
    console.log("KV GET error:", e.message);
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// 단일 키 저장
app.put("/make-server-c8f2251b/store/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const body = await c.req.json();
    await kv.set(key, body.value);
    return c.json({ ok: true });
  } catch (e: any) {
    console.log("KV PUT error:", e.message);
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// 여러 키 한번에 읽기
app.post("/make-server-c8f2251b/store/batch-get", async (c) => {
  try {
    const { keys } = await c.req.json();
    const results = await Promise.all(
      keys.map(async (key: string) => {
        try {
          const value = await kv.get(key);
          return [key, value ?? null] as const;
        } catch {
          return [key, null] as const;
        }
      })
    );
    const result: Record<string, any> = {};
    for (const [key, value] of results) {
      result[key] = value;
    }
    return c.json({ ok: true, data: result });
  } catch (e: any) {
    console.log("KV BATCH-GET error:", e.message);
    return c.json({ ok: false, error: e.message }, 500);
  }
});

Deno.serve({
  onError(err) {
    console.log("Deno.serve connection error (safe to ignore):", (err as Error).message);
    return new Response("Internal Server Error", { status: 500 });
  },
}, app.fetch);