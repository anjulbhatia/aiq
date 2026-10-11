"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartLegend, ChartTooltip } from "@/components/ui/chart";

function buildTrend(aqi: number) {
  const hours = ["6a", "8a", "10a", "12p", "2p", "4p", "6p"];
  return hours.map((h, i) => {
    const wave = Math.sin(i / 2.2) * 28 + (i > 3 ? -18 : 12);
    const pm25 = Math.max(20, Math.round(aqi * 0.62 + wave));
    return { hour: h, aqi: Math.max(30, Math.round(aqi + wave)), pm25 };
  });
}

const config = {
  aqi: { label: "AQI", color: "var(--chart-4)" },
  pm25: { label: "PM2.5", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function AqiTrendChart({ aqi }: { aqi: number }) {
  const data = buildTrend(aqi);
  return (
    <ChartContainer config={config} className="aspect-auto h-44 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          type="monotone"
          dataKey="aqi"
          stroke="var(--color-aqi)"
          fill="var(--color-aqi)"
          fillOpacity={0.25}
          strokeWidth={2.5}
        />
        <Area
          type="monotone"
          dataKey="pm25"
          stroke="var(--color-pm25)"
          fill="var(--color-pm25)"
          fillOpacity={0.12}
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
