"use client";

import { useState } from "react";
import { CaretDown, CaretUp, MaskHappy, SunHorizon, Wind, WindowsLogo } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Briefing } from "@/lib/types";
import ProtocolBadge from "./protocol-badge";

export default function StatusStrip({ briefing, className }: { briefing: Briefing; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("rounded-3xl border bg-background/92 shadow-lg backdrop-blur-md", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-muted/40 rounded-3xl"
      >
        <ProtocolBadge level={briefing.level} />
        <span className="min-w-0 flex-1 truncate text-[13px]">
          <strong>Today: {briefing.level === "VeryPoor" ? "Indoor" : briefing.level}</strong>
          <span className="text-muted-foreground"> · Indoor PE · Masks · Wind {briefing.windKph} kph {briefing.windDir}</span>
        </span>
        {open ? <CaretUp className="size-4 text-muted-foreground" /> : <CaretDown className="size-4 text-muted-foreground" />}
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-1.5 px-4 pb-3.5">
            {[
              { icon: <SunHorizon className="size-3.5" />, t: briefing.actions[0]?.label ?? "Indoor PE" },
              { icon: <MaskHappy className="size-3.5" />, t: briefing.actions[1]?.label ?? "Masks" },
              { icon: <WindowsLogo className="size-3.5" />, t: briefing.actions[2]?.label ?? "Windows closed" },
              { icon: <Wind className="size-3.5" />, t: `AQI ${briefing.aqi} · PM2.5 ${briefing.pm25}` },
            ].map((c) => (
              <span key={c.t} className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                {c.icon}{c.t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
