"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CaretLeft,
  MapPin,
  Siren,
  Sparkle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { AppRole } from "@/components/aiq/app-topbar";
import { AnalysisPanel } from "@/components/aiq/analysis-panel";
import { AppTopbar } from "@/components/aiq/app-topbar";
import { EmergencyButton } from "@/components/aiq/emergency-button";
import { ExposureChart } from "@/components/aiq/exposure-chart";
import { Gauge } from "@/components/aiq/gauge";
import { SchoolMapPreview } from "@/components/aiq/school-map";
import { StatusCard } from "@/components/aiq/status-card";
import { WaffleBoard } from "@/components/aiq/waffle-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MapLayers } from "@/components/aiq/school-map";
import { LEVEL_META } from "@/lib/protocol";
import type {
  AttendancePerson,
  Briefing,
  HistoryDay,
  ProtocolLevel,
  Student,
} from "@/lib/types";
import type { Teacher } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function BackBar({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
        <ArrowLeft />
      </Button>
      <p className="font-heading text-base font-semibold">{title}</p>
    </div>
  );
}

export interface StackProps {
  role: AppRole;
  onRoleChange: (r: AppRole) => void;
  school: { lat: number; lng: number };
  schoolId: string;
  schoolName: string;
  locality: string;
  level: ProtocolLevel;
  briefing: Briefing;
  history: HistoryDay[];
  attendance: { dates: string[]; teachers: AttendancePerson[]; students: AttendancePerson[] };
  students: Student[];
  teachers: Teacher[];
  layers: MapLayers;
  onLayersChange: (l: MapLayers) => void;
  onOpenBriefing: () => void;
  onOpenStudents: () => void;
  onUneasy: (id?: string) => void;
  sheets: ReactNode;
  desktopVisible?: boolean;
}

// Single home stack — no tab bar. Map / chat / profile live on routes.
export function MobileLayout({
  role,
  onRoleChange,
  school,
  schoolId,
  schoolName,
  locality,
  level,
  briefing,
  history,
  attendance,
  students,
  teachers,
  onOpenBriefing,
  onOpenStudents,
  onUneasy,
  sheets,
  desktopVisible = false,
}: StackProps) {
  const uneasyCount = students.filter((s) => s.status === "uneasy").length;
  const isPrincipal = role === "school" || role === "authority";
  const router = useRouter();

  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-3 pb-10 pt-3",
        !desktopVisible && "md:hidden",
      )}
    >
      <AppTopbar
        role={role}
        onRoleChange={onRoleChange}
        schoolName={schoolName}
        level={level}
        onOpenBriefing={onOpenBriefing}
        onOpenStudents={onOpenStudents}
        onOpenProfile={() => router.push("/profile")}
      />

      <StatusCard briefing={briefing} locality={locality} />

      {!isPrincipal && <EmergencyButton onRecord={() => onUneasy()} />}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin /> Travelling?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check air where you go
            </p>
            <Link href="/map" className="mt-2 block">
              <Button variant="outline" size="sm" className="w-full">
                Check map
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Siren /> {role === "teacher" ? "Class risk" : "Log today"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {role === "teacher"
                ? `${uneasyCount} uneasy in class`
                : "Cough, wheeze, headache?"}
            </p>
            {role === "teacher" ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onUneasy()}
              >
                Report
              </Button>
            ) : (
              <Link href="/chat" className="mt-2 block">
                <Button variant="outline" size="sm" className="w-full">
                  Open chat
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Gauge aqi={briefing.aqi} />
          <p className="mt-2 bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">AI agent: </span>
            {LEVEL_META[level].headline}. {briefing.reasons[0]}. Tomorrow{" "}
            {briefing.forecastTomorrow.aqi} AQI.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <ExposureChart days={history} />
        </CardContent>
      </Card>

      <AnalysisPanel schoolId={schoolId} role={role} briefing={briefing} />

      {role === "teacher" && (
        <Card>
          <CardContent className="flex flex-col gap-2 p-4">
            <p className="text-sm font-medium">
              Class attendance · {teachers[0]?.className ?? ""}
            </p>
            <WaffleBoard people={attendance.students} dates={attendance.dates} />
          </CardContent>
        </Card>
      )}

      <Link href="/map" className="block">
        <SchoolMapPreview
          role={role}
          school={school}
          schoolName={schoolName}
          level={level}
        />
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <p className="text-sm font-medium">Log today</p>
          <p className="text-xs text-muted-foreground">
            Record the ward&apos;s day — get guidance: see doctor, or take
            leave if uneasy.
          </p>
          <Link href="/chat" className="block">
            <Button className="w-full">
              <Sparkle /> Log today · chat
            </Button>
          </Link>
          <Link
            href="/profile"
            className="inline-flex w-full items-center justify-center gap-1 py-1 text-xs text-muted-foreground"
          >
            <CaretLeft className="size-3" /> Profile
          </Link>
        </CardContent>
      </Card>

      {sheets}
    </div>
  );
}
