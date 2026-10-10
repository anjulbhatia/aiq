"use client";

import { useState } from "react";
import { CaretRight, MapPin, Siren, WarningCircle } from "@phosphor-icons/react";
import AppLayout from "../layouts/app-layout";
import Gauge from "../aiq/gauge";
import MapPlaceholder from "../aiq/map-placeholder";
import MorningBriefingContent from "../aiq/morning-briefing-content";
import ProtocolBadge from "../aiq/protocol-badge";
import UneasyReportContent from "../aiq/uneasy-report-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { SCHOOLS, STUDENTS } from "@/lib/mock-data";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";

export default function ParentScreen({ briefing }: { briefing: Briefing }) {
  const [sheet, setSheet] = useState<"why" | "uneasy" | "map" | null>(null);
  const school = SCHOOLS.find((s) => s.id === briefing.schoolId) ?? SCHOOLS[0];
  const child = STUDENTS.find((s) => s.schoolId === briefing.schoolId) ?? STUDENTS[0];
  const meta = LEVEL_META[briefing.level];

  return (
    <AppLayout schoolId={briefing.schoolId} level={briefing.level} role="parent" theme="theme-00">
      {/* child status hero */}
      <Card className="overflow-hidden rounded-3xl">
        <div className="bg-muted/60 px-5 pb-2 pt-4">
          <p className="text-xs text-muted-foreground">Sun, {briefing.tempC}°C · AQI {briefing.aqi}</p>
          <CardTitle className="font-heading mt-0.5 text-[26px] font-bold leading-tight text-primary">
            {child.flags.length > 0 ? "Better Inside" : meta.headline}
          </CardTitle>
        </div>
        <CardContent className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{child.name} · {child.className}</p>
            <ProtocolBadge level={briefing.level} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {child.flags.length > 0 ? (
              child.flags.map((f) => <Badge key={f} variant="destructive" className="rounded-full">{f}</Badge>)
            ) : (
              <Badge variant="secondary" className="rounded-full">No medical flags</Badge>
            )}
          </div>
          <Gauge aqi={briefing.aqi} />
          <Button variant="outline" className="w-full rounded-2xl" onClick={() => setSheet("why")}>
            Why this recommendation? <CaretRight className="size-4" />
          </Button>
        </CardContent>
      </Card>

      {/* emergency */}
      <Card className="rounded-3xl border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Siren className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Feeling unsure?</p>
            <p className="text-xs text-muted-foreground">Alert teacher + principal in one tap.</p>
          </div>
          <Button variant="destructive" className="rounded-2xl" onClick={() => setSheet("uneasy")}>SOS</Button>
        </CardContent>
      </Card>

      {/* travelling + map preview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-3xl">
          <CardContent className="p-4 text-sm">
            <p className="font-semibold">Travelling somewhere?</p>
            <p className="mt-1 text-xs text-muted-foreground">Check if air is safe there.</p>
          </CardContent>
        </Card>
        <button onClick={() => setSheet("map")} className="overflow-hidden rounded-3xl border text-left transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
          <div className="flex h-24 items-center justify-center gap-1.5 bg-muted text-xs text-muted-foreground">
            <MapPin className="size-4" /> Tap for full map
          </div>
        </button>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="pb-1"><CardTitle className="text-sm">Log today</CardTitle></CardHeader>
        <CardContent className="pb-4 text-xs text-muted-foreground">School protocol auto-saves. Uneasy reports notify class teacher.</CardContent>
      </Card>

      {/* sheets */}
      <Drawer open={sheet === "why"} onOpenChange={(o) => !o && setSheet(null)}>
        <DrawerContent className="max-h-[88dvh]">
          <DrawerHeader><DrawerTitle>Why this recommendation?</DrawerTitle><DrawerDescription>{school.name} · today</DrawerDescription></DrawerHeader>
          <div className="overflow-y-auto p-4 pt-0"><MorningBriefingContent briefing={briefing} /></div>
        </DrawerContent>
      </Drawer>

      <Drawer open={sheet === "uneasy"} onOpenChange={(o) => !o && setSheet(null)} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>I feel uneasy</DrawerTitle><DrawerDescription>{child.name} · {school.name}</DrawerDescription></DrawerHeader>
          <div className="p-4 pt-0"><UneasyReportContent schoolId={school.id} defaultStudentId={child.id} onDone={() => setSheet(null)} /></div>
        </DrawerContent>
      </Drawer>

      <Drawer open={sheet === "map"} onOpenChange={(o) => !o && setSheet(null)}>
        <DrawerContent className="max-h-[88dvh]">
          <DrawerHeader><DrawerTitle>Map view</DrawerTitle><DrawerDescription>{school.locality} risk context</DrawerDescription></DrawerHeader>
          <div className="h-96 p-4 pt-0"><MapPlaceholder school={school} briefing={briefing} className="h-full" /></div>
        </DrawerContent>
      </Drawer>

      <p className="flex items-center justify-center gap-1 px-1 text-[11px] text-muted-foreground">
        <WarningCircle className="size-3.5" /> AI explainer helper · cached last protocol available offline
      </p>
    </AppLayout>
  );
}
