"use client";

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartLegend, ChartTooltip } from "@/components/ui/chart";
import type { HistoryDay } from "@/lib/types";

const config = {
  aqi: { label: "AQI", color: "var(--chart-4)" },
  dose: { label: "Dose µg", color: "var(--chart-2)" },
} satisfies ChartConfig;

// 7-day pollution-exposure view: daily AQI bars + inhaled child-dose line.
// Colors resolve from theme tokens (theme-03 amber for schools).
export function ExposureChart({ days }: { days: HistoryDay[] }) {
  const data = days.map((d) => ({
    day: d.date.slice(5),
    aqi: d.aqi,
    dose: d.doseUg,
  }));
  const peak = days.reduce((m, d) => (d.aqi > m.aqi ? d : m), days[0]);
  const avg = Math.round(days.reduce((s, d) => s + d.aqi, 0) / days.length);

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-44 w-full">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            yAxisId="aqi"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={40}
          />
          <YAxis yAxisId="dose" orientation="right" hide />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar
            yAxisId="aqi"
            dataKey="aqi"
            fill="var(--color-aqi)"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
          <Line
            yAxisId="dose"
            type="monotone"
            dataKey="dose"
            stroke="var(--color-dose)"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </ComposedChart>
      </ChartContainer>
      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
        7-day avg {avg} AQI · peak {peak.aqi} on {peak.date.slice(5)}
      </p>
    </div>
  );
}
