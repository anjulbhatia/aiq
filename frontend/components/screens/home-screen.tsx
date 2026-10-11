"use client";

import { useState } from "react";
import { useAppState } from "@/components/aiq/app-state";
import { MorningBriefingSheet } from "@/components/aiq/morning-briefing-sheet";
import type { MapLayers } from "@/components/aiq/school-map";
import { StudentListSheet } from "@/components/aiq/student-list-sheet";
import { UneasySheet } from "@/components/aiq/uneasy-sheet";
import { DeskLayout } from "@/components/layouts/desk-layout";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function HomeScreen() {
  const {
    role,
    setRole,
    school,
    briefing,
    students,
    teachers,
    history,
    attendance,
    themeClass,
  } = useAppState();
  const [published, setPublished] = useState(false);
  const [layers, setLayers] = useState<MapLayers>({
    sensors: true,
    canopy: false,
  });
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [uneasyOpen, setUneasyOpen] = useState(false);
  const [uneasyId, setUneasyId] = useState<string | undefined>(undefined);

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
      <div className={cn("min-h-dvh bg-background text-foreground", themeClass)}>
        <DeskLayout
          role={role}
          onRoleChange={setRole}
          school={{ lat: school.lat, lng: school.lng }}
          schoolId={school.id}
          schoolName={school.name}
          locality={school.locality}
          level={briefing.level}
          briefing={briefing}
          history={history}
          attendance={attendance}
          students={students}
          teachers={teachers}
          layers={layers}
          onLayersChange={setLayers}
          published={published}
          onPublish={() => setPublished(true)}
          onOpenBriefing={() => setBriefingOpen(true)}
          onOpenStudents={() => setStudentsOpen(true)}
          onUneasy={openUneasy}
          sheets={sheets}
        />

        <MobileLayout
          role={role}
          onRoleChange={setRole}
          school={{ lat: school.lat, lng: school.lng }}
          schoolId={school.id}
          schoolName={school.name}
          locality={school.locality}
          level={briefing.level}
          briefing={briefing}
          history={history}
          attendance={attendance}
          students={students}
          teachers={teachers}
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
