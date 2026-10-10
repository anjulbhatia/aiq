"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toast";
import { SCHOOLS } from "@/lib/mock-data";
import type { Briefing } from "@/lib/types";
import { cn } from "@/lib/utils";
import AppHeader from "../aiq/app-header";
import FloatingActions from "../aiq/floating-actions";
import MapPlaceholder from "../aiq/map-placeholder";
import MorningBriefingContent from "../aiq/morning-briefing-content";
import StatusStrip from "../aiq/status-strip";
import { StudentListContent } from "../aiq/student-list-content";

// Desktop SPA: map permanent background, everything else overlays. No sidebar.
export default function DeskLayout({
  briefing,
  schoolId,
}: {
  briefing: Briefing;
  schoolId?: string;
}) {
  const school = SCHOOLS.find((s) => s.id === (schoolId ?? briefing.schoolId)) ?? SCHOOLS[0];
  const [sheet, setSheet] = useState<"briefing" | "students" | null>(null);
  const [layers, setLayers] = useState({ sensors: true, canopy: true });
  const [publishedTick, setPublishedTick] = useState(0);

  return (
    <Toaster>
      <div className={cn("theme-02 flex h-dvh w-full flex-col bg-muted/40")}>
        <AppHeader schoolId={school.id} level={briefing.level} role="principal" />

        <div className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-4">
          {/* MAP full bleed */}
          <div className="absolute inset-x-4 inset-y-4 overflow-hidden">
            <MapPlaceholder school={school} briefing={briefing} showSensors={layers.sensors} showCanopy={layers.canopy} className="h-full rounded-3xl" />
          </div>

          {/* floating action cluster */}
          <div className="absolute right-6 top-6 w-60 sm:right-8">
            <FloatingActions
              onBriefing={() => setSheet("briefing")}
              onStudents={() => setSheet("students")}
              layers={layers}
              onLayers={setLayers}
            />
          </div>

          {/* status strip */}
          <div className="absolute inset-x-4 bottom-6 mx-auto max-w-3xl sm:inset-x-8">
            <StatusStrip key={publishedTick} briefing={briefing} />
          </div>
        </div>

        {/* Morning briefing hero sheet */}
        <Sheet open={sheet === "briefing"} onOpenChange={(o) => !o && setSheet(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto rounded-l-3xl p-0 sm:max-w-xl">
            <SheetHeader className="sticky top-0 z-10 border-b bg-popover/95 p-6 pb-4 backdrop-blur">
              <SheetTitle className="font-heading text-xl font-bold">Morning Briefing</SheetTitle>
              <SheetDescription>{school.name} · {school.locality} · decides today's protocol</SheetDescription>
            </SheetHeader>
            <div className="p-6 pt-4">
              <MorningBriefingContent briefing={briefing} onPublished={() => setPublishedTick((t) => t + 1)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Student list sheet */}
        <Sheet open={sheet === "students"} onOpenChange={(o) => !o && setSheet(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto rounded-l-3xl p-0 sm:max-w-md">
            <SheetHeader className="p-6 pb-2 text-left">
              <SheetTitle>Students · {school.locality}</SheetTitle>
              <SheetDescription>Risk + medical flags. Edits stay local for demo.</SheetDescription>
            </SheetHeader>
            <div className="p-6 pt-2">
              <StudentListContent schoolId={school.id} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Toaster>
  );
}
