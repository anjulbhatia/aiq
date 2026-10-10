"use client";

import { useState } from "react";
import {
  Buildings,
  CheckCircle,
  Drop,
  MaskHappy,
  Prohibit,
  Sparkle,
  SunHorizon,
  Thermometer,
  TreeEvergreen,
  Wind,
  WindowsLogo,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";
import Gauge from "./gauge";
import ProtocolBadge from "./protocol-badge";

const ACTION_ICON: Record<string, React.ReactNode> = {
  pe: <SunHorizon className="size-4" />,
  mask: <MaskHappy className="size-4" />,
  windows: <WindowsLogo className="size-4" />,
  assembly: <Prohibit className="size-4" />,
};

export default function MorningBriefingContent({
  briefing,
  onPublished,
}: {
  briefing: Briefing;
  onPublished?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [published, setPublished] = useState(false);
  const meta = LEVEL_META[briefing.level];

  const publish = () => {
    setPublished(true);
    setOpen(false);
    toast.add({ title: "Protocol published", description: "Parents + teachers notified (mocked push).", type: "success" });
    onPublished?.();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* hero */}
      <div className="rounded-3xl bg-muted/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {new Date(briefing.generatedAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {briefing.tempC}°C · AQI {briefing.aqi}
            </p>
            <h3 className="font-heading mt-1 text-2xl font-bold leading-tight">Today: {meta.headline}</h3>
          </div>
          <ProtocolBadge level={briefing.level} />
        </div>
        <Gauge aqi={briefing.aqi} className="mt-2 text-foreground" />
      </div>

      {/* protocol actions */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Protocol for today</p>
        <ul className="grid gap-2">
          {briefing.actions.map((a) => (
            <li
              key={a.key}
              className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 text-sm transition-colors duration-200 hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="text-muted-foreground">{ACTION_ICON[a.key] ?? <CheckCircle className="size-4" />}</span>
                {a.label}
              </span>
              <Badge variant={a.state === "avoid" ? "destructive" : a.state === "do" ? "default" : "secondary"} className="rounded-full">
                {a.state}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* factors */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { icon: <Wind className="size-4" />, label: `Wind ${briefing.windKph} kph ${briefing.windDir}` },
          { icon: <Thermometer className="size-4" />, label: `${briefing.tempC}°C · ${briefing.humidity}% RH` },
          { icon: <TreeEvergreen className="size-4" />, label: `Canopy ${(briefing.canopyDensity * 100).toFixed(0)}%` },
          { icon: <Buildings className="size-4" />, label: `Built-up ${(briefing.builtUpRatio * 100).toFixed(0)}%` },
        ].map((f) => (
          <Card key={f.label} className="rounded-2xl">
            <CardContent className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium">
              <span className="text-muted-foreground">{f.icon}</span>
              {f.label}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* generative briefing */}
      <Card className="rounded-3xl border-dashed">
        <CardContent className="flex flex-col gap-2 p-4 text-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkle className="size-3.5" /> AI briefing (Bedrock-ready)
          </p>
          <p className="leading-relaxed text-foreground/90">
            Smog-trapping is high ({briefing.smogTrapIndex.toFixed(2)}) with only {briefing.windKph} kph {briefing.windDir} wind.
            Keep assembly and PE indoors before noon, run N95s for outdoor movement, and watch asthmatic students closely.
            Conditions ease slightly tomorrow (AQI {briefing.forecastTomorrow.aqi}).
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Drop className="size-3.5" /> Rain chance {briefing.precipProb}% — no washout expected.
          </p>
        </CardContent>
      </Card>

      <details className="rounded-2xl border p-4 text-sm transition-colors duration-200 open:bg-muted/40">
        <summary className="cursor-pointer font-medium">Why this recommendation?</summary>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          {briefing.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
          <li>Tomorrow: AQI {briefing.forecastTomorrow.aqi} ({briefing.forecastTomorrow.level})</li>
        </ul>
      </details>

      <Separator />

      {/* publish */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button size="lg" className="w-full rounded-2xl" />} disabled={published}>
          {published ? "Published for today ✓" : "Publish today's protocol"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish protocol?</DialogTitle>
            <DialogDescription>
              This notifies teachers + parents of {briefing.schoolId} with today's {meta.label} guidance. Mocked push for demo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Review again</Button>
            <Button onClick={publish}>Confirm publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
