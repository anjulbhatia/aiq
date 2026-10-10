"use client";

import { ArrowsOut, MapPin } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Briefing, School } from "@/lib/types";

// Boilerplate map canvas. Swap with mapcn.dev / react-map-gl later.
// Keeps school pin + risk radius + sensor dots + canopy wash in same contract.
export default function MapPlaceholder({
  school,
  briefing,
  showSensors = true,
  showCanopy = true,
  className,
  onExpand,
}: {
  school: School;
  briefing: Briefing;
  showSensors?: boolean;
  showCanopy?: boolean;
  className?: string;
  onExpand?: () => void;
}) {
  const sensors = [
    { x: "18%", y: "22%", aqi: 312 },
    { x: "34%", y: "38%", aqi: 342 },
    { x: "62%", y: "28%", aqi: 196 },
    { x: "74%", y: "55%", aqi: 128 },
    { x: "48%", y: "66%", aqi: 284 },
    { x: "28%", y: "74%", aqi: 356 },
    { x: "82%", y: "34%", aqi: 172 },
  ];

  const dotColor = (aqi: number) =>
    aqi > 300 ? "bg-red-500" : aqi > 200 ? "bg-orange-400" : aqi > 100 ? "bg-yellow-400" : "bg-emerald-500";

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl border bg-[#eef1ea]",
        "bg-[linear-gradient(#dfe4d8_1px,transparent_1px),linear-gradient(90deg,#dfe4d8_1px,transparent_1px)] bg-[size:44px_44px]",
        className
      )}
      aria-label={`Map context near ${school.name}`}
    >
      {/* road wash */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" aria-hidden>
        <path d="M-20 220 C 200 200, 320 300, 700 240 S 1100 180, 1300 260" stroke="#ffffff" strokeWidth="18" fill="none" />
        <path d="M200 -20 C 240 200, 180 420, 260 700" stroke="#ffffff" strokeWidth="12" fill="none" />
        <path d="M520 -20 C 500 240, 560 480, 520 760" stroke="#ffffff" strokeWidth="8" fill="none" />
        <path d="M-20 420 C 300 400, 600 460, 1300 400" stroke="#ffffff" strokeWidth="10" fill="none" />
      </svg>

      {/* canopy wash */}
      {showCanopy && (
        <>
          <div className="absolute left-[8%] top-[10%] size-36 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="absolute right-[12%] top-[18%] size-44 rounded-full bg-emerald-600/15 blur-2xl" />
          <div className="absolute bottom-[14%] left-[30%] size-40 rounded-full bg-lime-500/15 blur-2xl" />
        </>
      )}

      {/* sensor dots */}
      {showSensors &&
        sensors.map((s, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: s.x, top: s.y }}
            title={`Sensor AQI ${s.aqi}`}
          >
            <span className={cn("block size-2.5 rounded-full ring-2 ring-white shadow-sm", dotColor(s.aqi))} />
          </div>
        ))}

      {/* risk radius + school pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -inset-16 rounded-full border-2 border-dashed border-red-500/30 bg-red-500/10 sm:-inset-20" />
        <div className="absolute -inset-8 rounded-full bg-red-500/10" />
        <div className="relative flex size-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg transition-transform duration-200 hover:scale-105">
          <MapPin weight="fill" className="size-5" />
        </div>
      </div>

      {/* footer chips */}
      <div className="absolute bottom-3 left-3 flex gap-1.5">
        <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur">
          {school.locality} · AQI {briefing.aqi}
        </span>
        <span className="hidden rounded-full bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur sm:inline">
          mapcn.dev placeholder
        </span>
      </div>

      {onExpand && (
        <button
          onClick={onExpand}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        >
          <ArrowsOut className="size-3.5" /> Full screen
        </button>
      )}
    </div>
  );
}
