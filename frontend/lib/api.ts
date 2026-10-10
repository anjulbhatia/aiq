// API client stub. Points at FastAPI service once live.
// Falls back to seeded mock data so frontend works standalone.

import { BRIEFINGS } from "./mock-data";
import type { Briefing } from "./types";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getBriefing(schoolId: string): Promise<Briefing> {
  try {
    const res = await fetch(`${BASE}/api/briefing/${schoolId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as Briefing;
  } catch {
    // Offline / backend not built yet → mock
    const mock = BRIEFINGS[schoolId] ?? Object.values(BRIEFINGS)[0];
    return Promise.resolve(mock);
  }
}

export async function reportUneasy(studentId: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${BASE}/api/report-uneasy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return { ok: true };
  } catch {
    return { ok: true }; // optimistic mock
  }
}
