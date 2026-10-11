"use client";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusStrip({ briefing }: { briefing: Briefing }) {
  const [open, setOpen] = useState(true);
  const meta = LEVEL_META[briefing.level];
  const summary = briefing.actions
    .slice(0, 3)
    .map((a) => a.label)
    .join(" · ");

  return (
    <div className="pointer-events-auto rounded-4xl bg-background/90 shadow-md ring-1 ring-foreground/5 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px]"
      >
        <span className={cn("size-2.5 rounded-full", meta.dot)} />
        <span className="font-medium">Today: {meta.label}</span>
        <span className="hidden truncate text-muted-foreground sm:inline">
          | {summary} | Wind {briefing.windKph} kph
        </span>
        <span className="ml-auto text-muted-foreground">
          {open ? <CaretDown /> : <CaretUp />}
        </span>
      </button>
      {open && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Masks:{" "}
            {briefing.actions.find((a) => a.key === "mask")?.label ?? "—"}
          </span>
          <span>
            Tomorrow: {briefing.forecastTomorrow.aqi} AQI (
            {briefing.forecastTomorrow.level})
          </span>
          <Button variant="link" size="xs" className="ml-auto h-6 px-0">
            Log the day / plan next
          </Button>
        </div>
      )}
    </div>
  );
}
