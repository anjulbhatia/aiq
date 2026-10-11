#!/usr/bin/env bun
/**
 * run.ts — local dev entrypoint. Spawns backend (uvicorn) + frontend
 * (next dev) together with prefixed logs. Reads base URLs from .env
 * (see .examples.env). Stdlib-only Bun, no new deps.
 *
 *   bun run.ts                 # both, backend :8000 + frontend :3000
 *   bun run.ts --backend-only  # API only
 *   bun run.ts --frontend-only # UI only (talks to NEXT_PUBLIC_API_URL)
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = import.meta.dir;

// Tiny .env loader (KEY=VALUE, skips blanks and # comments).
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    process.env[k] ??= v;
  }
}
loadEnvFile(join(ROOT, ".env"));

const BACKEND_PORT = process.env.BACKEND_PORT ?? "8000";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${BACKEND_PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

const only = process.argv[2] as string | undefined;
const wantBackend = !only || only === "--backend-only";
const wantFrontend = !only || only === "--frontend-only";
if (!wantBackend && !wantFrontend) {
  console.error("usage: bun run.ts [--backend-only|--frontend-only]");
  process.exit(1);
}

type Child = ReturnType<typeof Bun.spawn>;
const children: Array<{ name: string; proc: Child }> = [];

function spawnPrefixed(name: string, cmd: string[], opts: { cwd: string; env?: Record<string, string> }): void {
  const proc = Bun.spawn(cmd, {
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
    stdout: "pipe",
    stderr: "pipe",
  });
  const pump = async (stream: ReadableStream<Uint8Array> | null, err: boolean) => {
    if (!stream) return;
    const reader = stream.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const l of lines) (err ? console.error : console.log)(`[${name}] ${l}`);
    }
    if (buf) (err ? console.error : console.log)(`[${name}] ${buf}`);
  };
  void pump(proc.stdout, false);
  void pump(proc.stderr, true);
  children.push({ name, proc });
}

if (wantBackend) {
  spawnPrefixed("api", ["python", "-m", "uvicorn", "app.main:app", "--port", BACKEND_PORT], {
    cwd: join(ROOT, "backend"),
  });
}
if (wantFrontend) {
  spawnPrefixed("web", ["bun", "run", "dev"], {
    cwd: join(ROOT, "frontend"),
    env: { NEXT_PUBLIC_API_URL: API_URL, PORT: new URL(FRONTEND_URL).port || "3000" },
  });
}

console.log(`api  -> http://localhost:${BACKEND_PORT}/health`);
console.log(`web  -> ${FRONTEND_URL} (API: ${API_URL})`);
console.log("Ctrl-C stops both.");

const stop = () => {
  for (const { proc } of children) proc.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await Promise.all(children.map(({ proc }) => proc.exited));
