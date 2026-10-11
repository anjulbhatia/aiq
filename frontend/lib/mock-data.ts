import type { AnalysisResult, AttendancePerson, Briefing, HistoryDay, School, Student } from "./types";
import { getLevel } from "./protocol";

export const SCHOOLS: School[] = [
  {
    id: "anand-vihar",
    name: "Vidya Mandir Sr. Sec.",
    locality: "Anand Vihar",
    city: "Delhi",
    lat: 28.65,
    lng: 77.31,
    canopyDensity: 0.12,
    builtUpRatio: 0.86,
    smogTrapIndex: 0.82,
  },
  {
    id: "rk-puram",
    name: "Sarvodaya Vidyalaya",
    locality: "R.K. Puram",
    city: "Delhi",
    lat: 28.56,
    lng: 77.17,
    canopyDensity: 0.31,
    builtUpRatio: 0.62,
    smogTrapIndex: 0.45,
  },
  {
    id: "lodhi-road",
    name: "Little Scholars Academy",
    locality: "Lodhi Road",
    city: "Delhi",
    lat: 28.59,
    lng: 77.22,
    canopyDensity: 0.48,
    builtUpRatio: 0.41,
    smogTrapIndex: 0.28,
  },
];

export const STUDENTS: Student[] = [
  { id: "st-01", name: "Aarav Sharma", className: "5-B", schoolId: "anand-vihar", flags: ["asthma"], status: "ok" },
  { id: "st-02", name: "Diya Verma", className: "5-B", schoolId: "anand-vihar", flags: [], status: "ok" },
  { id: "st-03", name: "Kabir Singh", className: "3-A", schoolId: "anand-vihar", flags: ["breathing issues"], status: "uneasy" },
  { id: "st-04", name: "Ananya Iyer", className: "6-A", schoolId: "rk-puram", flags: ["asthma"], status: "ok" },
  { id: "st-05", name: "Vivaan Rao", className: "6-A", schoolId: "rk-puram", flags: [], status: "ok" },
  { id: "st-06", name: "Myra Kapoor", className: "2-C", schoolId: "lodhi-road", flags: [], status: "ok" },
];

export const BRIEFINGS: Record<string, Briefing> = {
  "anand-vihar": {
    schoolId: "anand-vihar",
    aqi: 342,
    pm25: 218,
    pm10: 305,
    tempC: 29,
    windKph: 7,
    windDir: "NW",
    precipProb: 5,
    humidity: 58,
    canopyDensity: 0.12,
    builtUpRatio: 0.86,
    smogTrapIndex: 0.82,
    level: "VeryPoor",
    actions: [
      { key: "pe", label: "Indoor PE only", state: "do" },
      { key: "mask", label: "N95 masks outdoors", state: "do" },
      { key: "windows", label: "Keep windows closed", state: "do" },
      { key: "assembly", label: "No outdoor assembly", state: "avoid" },
    ],
    reasons: [
      "AQI 342 (Very Poor) — PM2.5 218 µg/m³",
      "Low wind 7 kph traps pollutants near ground",
      "Built-up 86% + low canopy 12% raise local exposure",
    ],
    forecastTomorrow: { aqi: 318, level: "VeryPoor" },
    generatedAt: new Date().toISOString(),
  },
  "rk-puram": {
    schoolId: "rk-puram",
    aqi: 196,
    pm25: 112,
    pm10: 178,
    tempC: 30,
    windKph: 11,
    windDir: "W",
    precipProb: 10,
    humidity: 52,
    canopyDensity: 0.31,
    builtUpRatio: 0.62,
    smogTrapIndex: 0.45,
    level: "Poor",
    actions: [
      { key: "pe", label: "Shortened outdoor PE", state: "optional" },
      { key: "mask", label: "Masks for sensitive kids", state: "do" },
      { key: "windows", label: "Windows open morning only", state: "optional" },
      { key: "assembly", label: "Assembly indoors", state: "do" },
    ],
    reasons: [
      "AQI 196 (Poor) — PM2.5 112 µg/m³",
      "Moderate trapping (0.45), some canopy buffer",
      "Vulnerable students need extra protection",
    ],
    forecastTomorrow: { aqi: 172, level: "Poor" },
    generatedAt: new Date().toISOString(),
  },
  "lodhi-road": {
    schoolId: "lodhi-road",
    aqi: 128,
    pm25: 68,
    pm10: 112,
    tempC: 30,
    windKph: 14,
    windDir: "SW",
    precipProb: 15,
    humidity: 49,
    canopyDensity: 0.48,
    builtUpRatio: 0.41,
    smogTrapIndex: 0.28,
    level: "Moderate",
    actions: [
      { key: "pe", label: "Normal PE, reduce exertion", state: "optional" },
      { key: "mask", label: "No masks needed", state: "avoid" },
      { key: "windows", label: "Ventilate classrooms", state: "do" },
      { key: "assembly", label: "Outdoor assembly OK", state: "do" },
    ],
    reasons: [
      "AQI 128 (Moderate)",
      "Good canopy 48% + ventilation from 14 kph wind",
      "Sensitive kids: watch for symptoms only",
    ],
    forecastTomorrow: { aqi: 115, level: "Moderate" },
    generatedAt: new Date().toISOString(),
  },
};

export interface Teacher {
  id: string;
  name: string;
  className: string;
  schoolId: string;
  status: "present" | "uneasy" | "leave";
}

export const TEACHERS: Teacher[] = [
  { id: "t-01", name: "Meera Nair", className: "5-B", schoolId: "anand-vihar", status: "present" },
  { id: "t-02", name: "Rohit Gupta", className: "3-A", schoolId: "anand-vihar", status: "uneasy" },
  { id: "t-03", name: "Sara Thomas", className: "4-C", schoolId: "anand-vihar", status: "present" },
  { id: "t-04", name: "Amit Joshi", className: "6-A", schoolId: "rk-puram", status: "present" },
  { id: "t-05", name: "Neha Khan", className: "2-C", schoolId: "lodhi-road", status: "leave" },
];

export const DEMO_ACCOUNTS = [
  { role: "principal", email: "principal@vidyamandir.edu", schoolId: "anand-vihar" },
  { role: "teacher", email: "teacher@vidyamandir.edu", schoolId: "anand-vihar" },
  { role: "parent", email: "parent@example.com", schoolId: "anand-vihar" },
] as const;

// --- Demo 7-day history + attendance (backend /api/history + /api/attendance
// serve the real store when live; these seed the same shapes offline). ---

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function historyFor(briefing: Briefing): HistoryDay[] {
  const rng = mulberry32(hashStr(briefing.schoolId));
  const days: HistoryDay[] = [];
  for (let back = 6; back >= 0; back--) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    const drift = Math.round((rng() - 0.5) * 56 + Math.sin(back / 1.6) * 22);
    const aqi = Math.max(30, briefing.aqi + (back === 0 ? 0 : drift));
    const pm25 = Math.round(aqi * 0.62);
    const pm10 = Math.round(aqi * 0.9);
    days.push({
      date: d.toISOString().slice(0, 10),
      aqi,
      pm25,
      pm10,
      level: getLevel(aqi),
      doseUg: Math.round(pm25 * 0.9 * 6 * 10) / 10,
    });
  }
  return days;
}

function weekFor(id: string): boolean[] {
  const h = hashStr(id);
  return Array.from({ length: 7 }, (_, i) => ((h >> (3 * i)) % 7 + 7) % 7 !== 0);
}

export interface AttendanceRoster {
  dates: string[];
  teachers: AttendancePerson[];
  students: AttendancePerson[];
}

export function analysisFor(briefing: Briefing): AnalysisResult {
  const doseUg = Math.round(briefing.pm25 * 0.9 * 2 * 10) / 10;
  const verdict =
    briefing.level === "Good" || briefing.level === "Moderate" ? "outdoor-okay"
    : briefing.level === "Poor" ? "smooth"
    : "indoor-only";
  const levels = ["Good", "Moderate", "Poor", "VeryPoor", "Severe"] as const;
  const rough =
    levels.indexOf(briefing.forecastTomorrow.level) > levels.indexOf(briefing.level);
  return {
    schoolId: briefing.schoolId,
    day: new Date().toISOString().slice(0, 10),
    briefing,
    urbanForm: {
      canopyDensity: briefing.canopyDensity,
      builtUpRatio: briefing.builtUpRatio,
      smogTrapIndex: briefing.smogTrapIndex,
      source: "curated",
    },
    exposure: {
      typical: { verdict, day_ahead: rough ? "rough-day-ahead" : "steady", dose_ug: doseUg, max_outdoor_h: 2 },
      sensitive: { verdict: verdict === "outdoor-okay" ? "smooth" : "indoor-only", max_outdoor_h: 1 },
      feels_like: `${briefing.aqi} AQI, ${briefing.windKph} kph ${briefing.windDir} wind.`,
      visibility_km: 3,
      guidance: briefing.reasons.slice(0, 3),
    },
    model: { v0: briefing.level, v1: briefing.level, v1_trained: false, agree: true },
    eval: { n: 0, seed: 7, level_accuracy: 0.946, verdict_stability: 0.987 },
    generatedAt: new Date().toISOString(),
    live: false,
  };
}export function attendanceFor(schoolId: string): AttendanceRoster {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  return {
    dates,
    teachers: TEACHERS.filter((t) => t.schoolId === schoolId).map((t) => ({
      id: t.id,
      name: t.name,
      className: t.className,
      week: weekFor(`te:${t.id}`),
    })),
    students: STUDENTS.filter((s) => s.schoolId === schoolId).map((s) => ({
      id: s.id,
      name: s.name,
      className: s.className,
      week: weekFor(`st:${s.id}`),
    })),
  };
}
