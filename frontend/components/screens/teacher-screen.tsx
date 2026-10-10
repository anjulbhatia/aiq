"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "../layouts/app-layout";
import { reportUneasy } from "@/lib/api";
import { STUDENTS } from "@/lib/mock-data";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";

export default function TeacherScreen({ briefing }: { briefing: Briefing }) {
  const [reported, setReported] = useState<string[]>([]);
  const roster = STUDENTS.filter((s) => s.schoolId === briefing.schoolId);
  const uneasyCount = roster.filter((s) => s.status === "uneasy").length + reported.length;
  const meta = LEVEL_META[briefing.level];

  return (
    <AppLayout schoolId={briefing.schoolId} theme="theme-01">
      <Card>
        <CardHeader>
          <CardTitle>Class 5-B · {uneasyCount} uneasy · {meta.label}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          AQI {briefing.aqi} — {meta.headline}. Shorten outdoor time, watch flagged students.
        </CardContent>
      </Card>
      <div className="grid gap-2">
        {roster.map((s) => (
          <Card key={s.id} data-size="sm">
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.className}{s.flags.length > 0 ? ` · ${s.flags.join(", ")}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant={reported.includes(s.id) ? "secondary" : "outline"}
                onClick={async () => {
                  await reportUneasy(s.id);
                  setReported((r) => [...r, s.id]);
                }}
              >
                {reported.includes(s.id) ? "Reported" : "Uneasy"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
