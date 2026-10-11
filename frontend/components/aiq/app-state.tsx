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
import { getAttendance, getHistory, configureApi } from "@/lib/api";
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
  dataReady: boolean;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (l: { lat: number; lng: number } | null) => void;
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
  // Null until first settle so surfaces can render skeletons.
  const [history, setHistory] = useState<ReturnType<typeof historyFor> | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRoster | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    configureApi({ role, schoolId });
  }, [role, schoolId]);

  useEffect(() => {
    let live = true;
    setDataReady(false);
    Promise.all([getHistory(school.id), getAttendance(school.id)]).then(
      ([h, a]) => {
        if (!live) return;
        setHistory(h);
        setAttendance(a);
        setDataReady(true);
      },
    );
    return () => {
      live = false;
    };
  }, [school.id]);

  const value: AppState = {
    role,
    setRole,
    schoolId,
    setSchoolId,
    school,
    briefing,
    students,
    teachers,
    history: history ?? historyFor(briefing),
    attendance: attendance ?? attendanceFor(school.id),
    dataReady,
    userLocation,
    setUserLocation,
    themeClass: roleTheme(role),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useDataReady(): boolean {
  return useAppState().dataReady;
}
