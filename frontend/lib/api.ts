// API client. Points at FastAPI/Lambda service once live.
// Falls back to seeded mock data so frontend works standalone.

import {
  BRIEFINGS,
  DEMO_ACCOUNTS,
  analysisFor,
  attendanceFor,
  historyFor,
  type AttendanceRoster,
} from "./mock-data";
import type { AnalysisResult, Briefing, HistoryDay } from "./types";
import type { AppRole } from "@/components/aiq/app-topbar";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Demo identity per role so the UI authenticates against the backend
// (Bearer email). Falls back by role, then principal anand-vihar.
export function demoEmailFor(role: AppRole, schoolId: string): string {
  const byRole =
    role === "school" || role === "authority" ? "principal"
    : role === "student" ? "parent"
    : role;
  return (
    DEMO_ACCOUNTS.find((a) => a.role === byRole && a.schoolId === schoolId)?.email ??
    DEMO_ACCOUNTS.find((a) => a.role === byRole)?.email ??
    "principal@vidyamandir.edu"
  );
}

function auth(role: AppRole, schoolId: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${demoEmailFor(role, schoolId)}`,
  };
}

// Module identity so every call carries backend auth (else live 401s).
// AppStateProvider configures this on role/school change.
let identity: { role: AppRole; schoolId: string } = {
  role: "school",
  schoolId: "anand-vihar",
};

export function configureApi(id: { role: AppRole; schoolId: string }) {
  identity = id;
}

function headers(): Record<string, string> {
  return auth(identity.role, identity.schoolId);
}

export async function getBriefing(schoolId: string): Promise<Briefing> {
  try {
    const res = await fetch(`${BASE}/api/briefing/${schoolId}`, {
      headers: headers(),
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

export async function reportUneasy(studentId: string, note = ""): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${BASE}/api/report-uneasy`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ studentId, note }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return { ok: true };
  } catch {
    return { ok: true }; // optimistic mock
  }
}

export async function getHistory(schoolId: string): Promise<HistoryDay[]> {
  try {
    const res = await fetch(`${BASE}/api/history/${schoolId}?days=7`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as { days: HistoryDay[] };
    if (data.days.length >= 7) return data.days;
    throw new Error("history incomplete");
  } catch {
    const mock = BRIEFINGS[schoolId] ?? Object.values(BRIEFINGS)[0];
    return Promise.resolve(historyFor(mock));
  }
}

export async function getAttendance(
  schoolId: string,
): Promise<AttendanceRoster> {
  try {
    const res = await fetch(`${BASE}/api/attendance/${schoolId}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as AttendanceRoster;
  } catch {
    return Promise.resolve(attendanceFor(schoolId));
  }
}

export async function postDaylog(input: {
  studentId: string;
  entries: string[];
  unease: boolean;
  note: string;
}): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${BASE}/api/daylog`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return { ok: true };
  } catch {
    return { ok: true }; // optimistic mock
  }
}

export async function getAnalysis(
  schoolId: string,
  role: AppRole,
  briefing: Briefing,
): Promise<AnalysisResult> {
  try {
    const res = await fetch(`${BASE}/api/analysis/${schoolId}`, {
      headers: auth(role, schoolId),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return { ...((await res.json()) as AnalysisResult), live: true };
  } catch {
    return Promise.resolve({ ...analysisFor(briefing), live: false });
  }
}
