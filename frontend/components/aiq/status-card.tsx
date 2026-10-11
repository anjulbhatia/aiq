"use client";

import { SunHorizon, Thermometer, Wind } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";

const HEADLINE: Record<string, string> = {
  Good: "Safe Outside",
  Moderate: "Safe Outside",
  Poor: "Better Inside",
  VeryPoor: "Better Inside",
  Severe: "Stay Inside",
};

export function StatusCard({
  briefing,
  locality,
}: {
  briefing: Briefing;
  locality: string;
}) {
  const meta = LEVEL_META[briefing.level];
  return (
    <Card className="gap-4 p-6 sm:p-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <SunHorizon className="size-4" /> Sun, Jul 24 · {locality}
        </span>
        <span className="inline-flex items-center gap-3 tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="size-4" />
            {briefing.tempC}°C
          </span>
          <span className="font-semibold text-foreground">
            {briefing.aqi} AQI
          </span>
        </span>
      </div>
      <CardContent className="p-0">
        <p className="font-heading text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
          {HEADLINE[briefing.level]}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {meta.headline} · PM2.5 {briefing.pm25} · {briefing.windKph} kph{" "}
          {briefing.windDir} wind. Outdoor exertion{" "}
          {briefing.level === "Good" || briefing.level === "Moderate"
            ? "okay"
            : "limited"}{" "}
          today.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wind className="size-3.5" /> Built-up{" "}
          {Math.round(briefing.builtUpRatio * 100)}% · Canopy{" "}
          {Math.round(briefing.canopyDensity * 100)}%
        </p>
      </CardContent>
    </Card>
  );
}
