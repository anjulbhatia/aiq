"use client";

import { cn } from "@/lib/utils";

// Semicircular AQI gauge. Calm, single transition on value change.
export default function Gauge({ aqi, className }: { aqi: number; className?: string }) {
  const pct = Math.min(1, aqi / 500);
  const angle = -90 + pct * 180;
  const segments = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#22c55e"];
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative h-24 w-48 overflow-hidden">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          {segments.map((c, i) => {
            const start = 180 - (i + 1) * 36;
            return (
              <path
                key={c}
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={c}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(36 / 180) * Math.PI * 80 - 6} ${Math.PI * 80}`}
                strokeDashoffset={-(i * (36 / 180) * Math.PI * 80)}
                opacity={0.9}
              />
            );
          })}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px", transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)" }}>
            <line x1="100" y1="100" x2="100" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="currentColor" />
          </g>
        </svg>
      </div>
      <p className="font-heading text-3xl font-bold leading-none tabular-nums">{aqi}</p>
      <p className="text-xs text-muted-foreground">AQI · US scale</p>
    </div>
  );
}
