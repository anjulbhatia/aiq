"use client";

import { useState } from "react";
import { CheckCircle, Siren } from "@phosphor-icons/react";
import AppLayout from "../layouts/app-layout";
import ProtocolBadge from "../aiq/protocol-badge";
import UneasyReportContent from "../aiq/uneasy-report-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { reportUneasy } from "@/lib/api";
import { STUDENTS } from "@/lib/mock-data";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";

export default function TeacherScreen({ briefing }: { briefing: Briefing }) {
  const [sheet, setSheet] = useState(false);
  const [filter, setFilter] = useState("");
  const [reported, setReported] = useState<string[]>([]);
  const roster = STUDENTS.filter((s) => s.schoolId === briefing.schoolId).filter((s) =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );
  const uneasyCount = roster.filter((s) => s.status === "uneasy").length + reported.length;
  const meta = LEVEL_META[briefing.level];

  return (
    <AppLayout schoolId={briefing.schoolId} level={briefing.level} role="teacher" theme="theme-01">
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Class 5-B · {uneasyCount} uneasy</CardTitle>
            <ProtocolBadge level={briefing.level} />
          </div>
          <p className="text-sm text-muted-foreground">AQI {briefing.aqi} — {meta.headline}. Shorten outdoor time.</p>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter students…" className="rounded-2xl" />
          <Button onClick={() => setSheet(true)} variant="destructive" className="shrink-0 rounded-2xl">
            <Siren className="size-4" /> Report
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {roster.map((s) => {
          const done = reported.includes(s.id);
          return (
            <Card key={s.id} className="rounded-2xl">
              <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.className}{s.flags.length > 0 ? ` · ${s.flags.join(", ")}` : ""}</p>
                </div>
                <Button
                  size="sm"
                  variant={done ? "secondary" : "outline"}
                  className="shrink-0 rounded-xl transition-all duration-200"
                  disabled={done}
                  onClick={async () => {
                    await reportUneasy(s.id);
                    setReported((r) => [...r, s.id]);
                  }}
                >
                  {done ? <><CheckCircle className="size-3.5" /> Reported</> : "Uneasy"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Drawer open={sheet} onOpenChange={setSheet} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Report uneasy</DrawerTitle><DrawerDescription>Select student + optional note</DrawerDescription></DrawerHeader>
          <div className="p-4 pt-0"><UneasyReportContent schoolId={briefing.schoolId} onDone={() => setSheet(false)} /></div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}
