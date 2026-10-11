"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppRole } from "@/components/aiq/app-topbar";
import { getAttendance, getHistory } from "@/lib/api";
import {
  BRIEFINGS,
  SCHOOLS,
  STUDENTS,
  TEACHERS,
  attendanceFor,
  historyFor,
  type AttendanceRoster,
} from "@/lib/mock-data";
import { roleTheme } from "@/lib/theme";

interface AppState {
  role: AppRole;
  setRole: (r: AppRole) => void;
  schoolId: string;
  setSchoolId: (id: string) => void;
  school: (typeof SCHOOLS)[number];
  briefing: (typeof BRIEFINGS)[string];
  students: typeof STUDENTS;
  teachers: typeof TEACHERS;
  history: ReturnType<typeof historyFor>;
  attendance: AttendanceRoster;
  themeClass: string;
}

const Ctx = createContext<AppState | null>(null);

const ROLE_KEY = "aiq-role";
const SCHOOL_KEY = "aiq-school";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("school");
  const [schoolId, setSchoolId] = useState("anand-vihar");

  useEffect(() => {
    const r = localStorage.getItem(ROLE_KEY) as AppRole | null;
    const s = localStorage.getItem(SCHOOL_KEY);
    if (r) setRole(r);
    if (s) setSchoolId(s);
  }, []);

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, role);
  }, [role]);
  useEffect(() => {
    localStorage.setItem(SCHOOL_KEY, schoolId);
  }, [schoolId]);

  const school = useMemo(
    () => SCHOOLS.find((s) => s.id === schoolId) ?? SCHOOLS[0],
    [schoolId],
  );
  const briefing = BRIEFINGS[school.id];
  const students = useMemo(
    () => STUDENTS.filter((s) => s.schoolId === school.id),
    [school.id],
  );
  const teachers = useMemo(
    () => TEACHERS.filter((t) => t.schoolId === school.id),
    [school.id],
  );

  // Live history/attendance when the backend is up, seeded mocks offline.
  const [history, setHistory] = useState(() => historyFor(briefing));
  const [attendance, setAttendance] = useState(() => attendanceFor(school.id));
  useEffect(() => {
    let live = true;
    getHistory(school.id).then((d) => live && setHistory(d));
    getAttendance(school.id).then((d) => live && setAttendance(d));
    return () => {
      live = false;
    };
  }, [school.id, briefing]);

  const value: AppState = {
    role,
    setRole,
    schoolId,
    setSchoolId,
    school,
    briefing,
    students,
    teachers,
    history,
    attendance,
    themeClass: roleTheme(role),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
