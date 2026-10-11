"use client";

import { useState } from "react";
import type { AppRole } from "@/components/aiq/app-topbar";
import { AqiTrendChart } from "@/components/aiq/aqi-trend-chart";
import { ExposureChart } from "@/components/aiq/exposure-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing, HistoryDay } from "@/lib/types";

const ROLE_LABEL: Record<AppRole, string> = {
  student: "Student",
  parent: "Parent",
  teacher: "Teacher",
  school: "Principal",
  authority: "Authority",
};

export function PrincipalAside({
  role,
  onRoleChange,
  briefing,
  history,
  onOpenBriefing,
  onUneasy,
  briefingTrigger,
  publishTrigger,
  uneasyTrigger,
}: {
  role: AppRole;
  onRoleChange: (r: AppRole) => void;
  briefing: Briefing;
  history: HistoryDay[];
  onOpenBriefing: () => void;
  onUneasy: (id?: string) => void;
  briefingTrigger?: (label: string) => React.ReactElement;
  publishTrigger?: (label: string) => React.ReactElement;
  uneasyTrigger?: (label: string) => React.ReactElement;
}) {
  const [draft, setDraft] = useState(
    `Tomorrow: indoor PE only. N95 outdoors. Windows closed till 2pm.`,
  );

  const scrollToPlanning = () => {
    document
      .getElementById("aside-planning")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col gap-4">
      <Select value={role} onValueChange={(v) => onRoleChange(v as AppRole)}>
        <SelectTrigger className="w-fit min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABEL[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-base font-semibold">
              Morning recommendations
            </p>
            <span
              className={`px-2 py-0.5 text-xs font-medium text-white ${LEVEL_META[briefing.level].classes}`}
            >
              {LEVEL_META[briefing.level].label}
            </span>
          </div>
          {briefing.actions.map((a) => (
            <p key={a.key} className="bg-muted px-3 py-2 text-sm">
              {a.label}
            </p>
          ))}
          <p className="text-xs text-muted-foreground tabular-nums">
            Tomorrow {briefing.forecastTomorrow.aqi} AQI ·{" "}
            {briefing.forecastTomorrow.level}
          </p>
          {briefingTrigger ? (
            briefingTrigger("Open briefing")
          ) : (
            <Button onClick={onOpenBriefing}>Open briefing</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex gap-2 p-4">
          {publishTrigger ? (
            publishTrigger("Publish")
          ) : (
            <Button className="flex-1" onClick={onOpenBriefing}>
              Publish
            </Button>
          )}
          {uneasyTrigger ? (
            uneasyTrigger("Flag uneasy")
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onUneasy()}
            >
              Flag uneasy
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={scrollToPlanning}
          >
            Plan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4" id="aside-planning">
          <p className="font-heading text-base font-semibold">
            Planning in advance
          </p>
          <AqiTrendChart aqi={briefing.aqi} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <p className="font-heading text-base font-semibold">
            7-day exposure
          </p>
          <ExposureChart days={history} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <p className="font-heading text-base font-semibold">
            Notify message cooker
          </p>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Write the parent notice…"
          />
          <Button
            variant="secondary"
            onClick={() =>
              toast.add({
                title: "Notice queued",
                description: draft.slice(0, 60),
                type: "success",
              })
            }
          >
            Queue push
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
