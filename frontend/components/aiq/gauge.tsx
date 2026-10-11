"use client";

import { cn } from "@/lib/utils";

const SEGMENTS = [
  "#34d399",
  "#a3e635",
  "#facc15",
  "#fb923c",
  "#f87171",
  "#881337",
];

// Semicircle gauge, 0–500 AQI. Needle eases to value (single tasteful motion).
export function Gauge({ aqi, className }: { aqi: number; className?: string }) {
  const clamped = Math.max(0, Math.min(500, aqi));
  const angle = -90 + (clamped / 500) * 180; // -90..90
  const cx = 100;
  const cy = 92;
  const r = 72;

  const arc = (from: number, to: number) => {
    const p = (deg: number) => {
      // map -90..90 onto semicircle
      const a = Math.PI + ((deg + 90) / 180) * Math.PI;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    };
    return `M ${p(from)} A ${r} ${r} 0 0 1 ${p(to)}`;
  };

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox="0 110 200 100"
        className="w-full"
        role="img"
        aria-label={`AQI ${aqi}`}
      >
        {SEGMENTS.map((c, i) => (
          <path
            key={c}
            d={arc(-90 + i * 30, -90 + (i + 1) * 30)}
            fill="none"
            stroke={c}
            strokeWidth={13}
            strokeLinecap="round"
            opacity={0.9}
          />
        ))}
        <g
          className="transition-transform duration-700 ease-out"
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "100px 92px",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 16}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={5} className="fill-foreground" />
          <circle cx={cx} cy={cy} r={2.2} className="fill-background" />
        </g>
      </svg>
      <div className="mt-1 flex items-baseline justify-center gap-1.5">
        <span className="font-heading text-3xl font-semibold tabular-nums">
          {aqi}
        </span>
        <span className="text-xs text-muted-foreground">AQI</span>
      </div>
    </div>
  );
}
