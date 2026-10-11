"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { getLevel } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const LEVEL_FILL: Record<string, string> = {
  Good: "var(--chart-2)",
  Moderate: "var(--chart-1)",
  Poor: "var(--chart-3)",
  VeryPoor: "var(--chart-4)",
  Severe: "var(--chart-5)",
};

// Semicircle gauge, 0–500 AQI, via recharts RadialBar inside shadcn ChartContainer.
export function Gauge({ aqi, className }: { aqi: number; className?: string }) {
  const clamped = Math.max(0, Math.min(500, aqi));
  const level = getLevel(clamped);
  const config = {
    aqi: { label: "AQI", color: LEVEL_FILL[level] },
  } satisfies ChartConfig;

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer config={config} className="aspect-square max-h-48 w-full">
        <RadialBarChart
          data={[{ name: "aqi", value: clamped, fill: "var(--color-aqi)" }]}
          innerRadius="72%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          barSize={18}
        >
          <PolarAngleAxis type="number" domain={[0, 500]} angleAxisId={0} tick={false} />
          <RadialBar
            dataKey="value"
            angleAxisId={0}
            background={{ fill: "var(--muted)" }}
            cornerRadius={9}
            isAnimationActive
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="-mt-10 flex items-baseline justify-center gap-1.5">
        <span className="font-heading text-3xl font-semibold tabular-nums">
          {aqi}
        </span>
        <span className="text-xs text-muted-foreground">AQI · {level}</span>
      </div>
    </div>
  );
}
