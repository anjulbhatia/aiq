import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";

export default function StatusCard({ briefing }: { briefing: Briefing }) {
  const meta = LEVEL_META[briefing.level];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today: {meta.headline}</CardTitle>
          <span className={`inline-block size-3 rounded-full ${meta.dot}`} />
        </div>
        <p className="text-sm text-muted-foreground">
          AQI {briefing.aqi} · PM2.5 {briefing.pm25} · {briefing.tempC}°C · Wind {briefing.windKph} kph {briefing.windDir}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <p className="font-heading text-5xl font-bold leading-none">{briefing.aqi}</p>
          <Badge className={meta.classes}>{meta.label}</Badge>
        </div>
        <ul className="grid gap-2">
          {briefing.actions.map((a) => (
            <li
              key={a.key}
              className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm"
            >
              <span>{a.label}</span>
              <span className="text-xs uppercase text-muted-foreground">{a.state}</span>
            </li>
          ))}
        </ul>
        <details className="rounded-xl border p-3 text-sm">
          <summary className="cursor-pointer font-medium">Why this recommendation?</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {briefing.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
            <li>
              Tomorrow forecast: AQI {briefing.forecastTomorrow.aqi} ({briefing.forecastTomorrow.level})
            </li>
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
