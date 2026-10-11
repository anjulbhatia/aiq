"use client";

import { useState } from "react";
import { ChartLine, Spinner } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppRole } from "@/components/aiq/app-topbar";
import { getAnalysis } from "@/lib/api";
import type { AnalysisResult, Briefing } from "@/lib/types";
import { cn } from "@/lib/utils";

const VERDICT_TONE: Record<string, string> = {
  "outdoor-okay": "bg-emerald-600",
  smooth: "bg-yellow-500",
  "indoor-only": "bg-red-600",
};

export function AnalysisPanel({
  schoolId,
  role,
  briefing,
}: {
  schoolId: string;
  role: AppRole;
  briefing: Briefing;
}) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      setResult(await getAnalysis(schoolId, role, briefing));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>ML Analysis</CardTitle>
        <div className="flex items-center gap-2">
          {result && (
            <Badge variant={result.live ? "default" : "secondary"}>
              {result.live ? "live model" : "offline mock"}
            </Badge>
          )}
          <Button size="sm" onClick={run} disabled={running}>
            {running ? <Spinner className="animate-spin" /> : <ChartLine />}
            {running ? "Running…" : result ? "Re-run" : "Run analysis"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {!result && !running && (
          <p className="text-muted-foreground">
            Runs the backend pipeline on this school: briefing join, urban
            form, exposure verdicts, v0 vs v1 model read, and a live eval
            snapshot. Falls back to offline mock without the API.
          </p>
        )}
        {running && !result && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        )}
        {result && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium text-white",
                  VERDICT_TONE[result.exposure.typical.verdict] ?? "bg-muted",
                )}
              >
                {result.exposure.typical.verdict}
              </span>
              <Badge variant="outline">
                ahead: {result.exposure.typical.day_ahead.replace("-", " ")}
              </Badge>
              <Badge variant="outline">
                sensitive: {result.exposure.sensitive.verdict}
              </Badge>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              {result.exposure.feels_like}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-muted p-2">
                <p className="text-lg font-semibold tabular-nums">
                  {result.exposure.visibility_km}
                </p>
                <p className="text-[11px] text-muted-foreground">km visibility</p>
              </div>
              <div className="rounded-2xl bg-muted p-2">
                <p className="text-lg font-semibold tabular-nums">
                  {result.exposure.typical.max_outdoor_h}h
                </p>
                <p className="text-[11px] text-muted-foreground">outdoor cap</p>
              </div>
              <div className="rounded-2xl bg-muted p-2">
                <p className="text-lg font-semibold tabular-nums">
                  {result.exposure.typical.dose_ug}
                </p>
                <p className="text-[11px] text-muted-foreground">µg dose</p>
              </div>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {result.exposure.guidance.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                model v0 {result.model.v0} / v1 {result.model.v1}
                {result.model.agree ? " (agree)" : " (differ)"}
              </span>
              <span>
                eval acc {result.eval.level_accuracy} · stability{" "}
                {result.eval.verdict_stability} (n={result.eval.n})
              </span>
              <span>
                urban {result.urbanForm.source} · canopy{" "}
                {Math.round(result.urbanForm.canopyDensity * 100)}% · built{" "}
                {Math.round(result.urbanForm.builtUpRatio * 100)}%
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
