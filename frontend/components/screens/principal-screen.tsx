import StatusCard from "@/components/aiq/status-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeskLayout from "../layouts/desk-layout";
import type { Briefing } from "@/lib/types";

export default function PrincipalScreen({ briefing }: { briefing: Briefing }) {
  return (
    <DeskLayout schoolId={briefing.schoolId}>
      <div className="flex flex-col gap-4">
        <StatusCard briefing={briefing} />
        <Button size="lg">Publish today's protocol</Button>
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Urban-form context</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Canopy {(briefing.canopyDensity * 100).toFixed(0)}% · Built-up {(briefing.builtUpRatio * 100).toFixed(0)}% · Smog-trap {briefing.smogTrapIndex.toFixed(2)}</p>
            <p className="mt-2">Low wind + high built-up keeps PM2.5 near ground level through noon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tomorrow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Forecast AQI {briefing.forecastTomorrow.aqi} ({briefing.forecastTomorrow.level})
          </CardContent>
        </Card>
      </div>
    </DeskLayout>
  );
}
