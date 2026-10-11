"use client";

import { useMemo, useState } from "react";
import type { AppRole } from "@/components/aiq/app-topbar";
import type { MapLayers } from "@/components/aiq/map-placeholder";
import { MorningBriefingSheet } from "@/components/aiq/morning-briefing-sheet";
import { StudentListSheet } from "@/components/aiq/student-list-sheet";
import { UneasySheet } from "@/components/aiq/uneasy-sheet";
import { DeskLayout } from "@/components/layouts/desk-layout";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { Toaster } from "@/components/ui/toast";
import { BRIEFINGS, SCHOOLS, STUDENTS } from "@/lib/mock-data";
import { roleTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function HomeScreen() {
  const [role, setRole] = useState<AppRole>("school");
  const [schoolId] = useState("anand-vihar");
  const [published, setPublished] = useState(false);
  const [layers, setLayers] = useState<MapLayers>({
    sensors: true,
    canopy: false,
  });
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [uneasyOpen, setUneasyOpen] = useState(false);
  const [uneasyId, setUneasyId] = useState<string | undefined>(undefined);

  const school = useMemo(
    () => SCHOOLS.find((s) => s.id === schoolId) ?? SCHOOLS[0],
    [schoolId],
  );
  const briefing = BRIEFINGS[school.id];
  const students = STUDENTS.filter((s) => s.schoolId === school.id);

  const openUneasy = (id?: string) => {
    setUneasyId(id);
    setUneasyOpen(true);
  };

  const sheets = (
    <>
      <MorningBriefingSheet
        open={briefingOpen}
        onOpenChange={setBriefingOpen}
        briefing={briefing}
        published={published}
        onPublish={() => setPublished(true)}
      />
      <StudentListSheet
        open={studentsOpen}
        onOpenChange={setStudentsOpen}
        students={students}
        onUneasy={(id) => {
          setStudentsOpen(false);
          openUneasy(id);
        }}
      />
      <UneasySheet
        key={uneasyId ?? "none"}
        open={uneasyOpen}
        onOpenChange={setUneasyOpen}
        students={students}
        presetId={uneasyId}
        side="bottom"
      />
    </>
  );

  return (
    <Toaster>
      <div
        className={cn(
          "min-h-dvh bg-background text-foreground",
          roleTheme(role),
        )}
      >
        <DeskLayout
          role={role}
          onRoleChange={setRole}
          schoolName={school.name}
          locality={school.locality}
          level={briefing.level}
          briefing={briefing}
          layers={layers}
          onLayersChange={setLayers}
          onOpenBriefing={() => setBriefingOpen(true)}
          onOpenStudents={() => setStudentsOpen(true)}
          sheets={sheets}
        />

        <MobileLayout
          role={role}
          onRoleChange={setRole}
          schoolName={school.name}
          locality={school.locality}
          level={briefing.level}
          briefing={briefing}
          students={students}
          layers={layers}
          onLayersChange={setLayers}
          onOpenBriefing={() => setBriefingOpen(true)}
          onOpenStudents={() => setStudentsOpen(true)}
          onUneasy={openUneasy}
          sheets={sheets}
        />
      </div>
    </Toaster>
  );
}
