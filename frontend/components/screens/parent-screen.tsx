"use client";

import { useState } from "react";
import StatusCard from "@/components/aiq/status-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "../layouts/app-layout";
import { reportUneasy } from "@/lib/api";
import { STUDENTS } from "@/lib/mock-data";
import type { Briefing } from "@/lib/types";

export default function ParentScreen({ briefing }: { briefing: Briefing }) {
  const [sent, setSent] = useState(false);
  const child = STUDENTS.find((s) => s.schoolId === briefing.schoolId) ?? STUDENTS[0];

  return (
    <AppLayout schoolId={briefing.schoolId} theme="theme-00">
      <StatusCard briefing={briefing} />
      <Card>
        <CardHeader>
          <CardTitle>{child.name} · {child.className}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            {child.flags.length > 0 ? (
              child.flags.map((f) => <Badge key={f} variant="destructive">{f}</Badge>)
            ) : (
              <Badge variant="secondary">No medical flags</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {child.flags.length > 0
              ? "Sensitive group: follow mask + indoor guidance strictly today."
              : "No extra restrictions beyond school protocol."}
          </p>
          <Button
            variant={sent ? "secondary" : "destructive"}
            onClick={async () => {
              await reportUneasy(child.id);
              setSent(true);
            }}
          >
            {sent ? "Uneasy reported ✓" : "I feel uneasy"}
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
