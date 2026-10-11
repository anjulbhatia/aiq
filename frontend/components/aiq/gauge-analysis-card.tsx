"use client";

import { AqiTrendChart } from "@/components/aiq/aqi-trend-chart";
import { Gauge } from "@/components/aiq/gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";

export function GaugeAnalysisCard({ briefing }: { briefing: Briefing }) {
  const meta = LEVEL_META[briefing.level];
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Gauge Analysis</CardTitle>
        <span className={`px-2 py-0.5 text-xs font-medium text-white ${meta.classes}`}>
          {meta.label}
        </span>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[180px_1fr]">
        <Gauge aqi={briefing.aqi} />
        <div className="min-w-0">
          <AqiTrendChart aqi={briefing.aqi} />
          <p className="mt-2 bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">AI agent: </span>
            {meta.headline} — PM2.5 {briefing.pm25} with {briefing.windKph} kph{" "}
            {briefing.windDir} wind traps pollutants. {briefing.reasons[0]}.
            Reassess after 2pm; tomorrow {briefing.forecastTomorrow.aqi} AQI.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
