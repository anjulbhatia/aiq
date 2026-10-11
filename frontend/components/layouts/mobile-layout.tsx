"use client";

import {
  House,
  MapPin,
  Siren,
  Sparkle,
  User,
  UsersThree,
} from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import { type AppRole, AppTopbar } from "@/components/aiq/app-topbar";
import { Gauge } from "@/components/aiq/gauge";
import {
  type MapLayers,
  SchoolMapPreview,
  SchoolMapView,
} from "@/components/aiq/school-map";
import { StatusCard } from "@/components/aiq/status-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing, ProtocolLevel, Student } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "home" | "map" | "people" | "profile";

// Mobile: 3–4 tabs max + bottom sheets / full drawers for flows.
export function MobileLayout({
  role,
  onRoleChange,
  school,
  schoolName,
  locality,
  level,
  briefing,
  students,
  layers,
  onLayersChange,
  onOpenBriefing,
  onOpenStudents,
  onUneasy,
  sheets,
}: {
  role: AppRole;
  onRoleChange: (r: AppRole) => void;
  school: { lat: number; lng: number };
  schoolName: string;
  locality: string;
  level: ProtocolLevel;
  briefing: Briefing;
  students: Student[];
  layers: MapLayers;
  onLayersChange: (l: MapLayers) => void;
  onOpenBriefing: () => void;
  onOpenStudents: () => void;
  onUneasy: (id?: string) => void;
  sheets: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("home");

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "home", label: "Today", icon: <House /> },
    { id: "map", label: "Map", icon: <MapPin /> },
    {
      id: "people",
      label: role === "teacher" ? "Class" : "People",
      icon: <UsersThree />,
    },
    { id: "profile", label: "Profile", icon: <User /> },
  ];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-3 pb-28 pt-3 md:hidden">
      <AppTopbar
        role={role}
        onRoleChange={onRoleChange}
        schoolName={schoolName}
        level={level}
        onOpenBriefing={onOpenBriefing}
        onOpenStudents={onOpenStudents}
      />

      {tab === "home" && (
        <div className="flex flex-col gap-4">
          <StatusCard briefing={briefing} locality={locality} />

          {/* role-specific hero action */}
          {role === "school" || role === "authority" ? (
            <Button
              size="lg"
              onClick={onOpenBriefing}
              className="w-full shadow-md"
            >
              Open Morning Briefing
            </Button>
          ) : role === "teacher" ? (
            <Card className="gap-3 p-5">
              <p className="text-sm font-medium">
                Class risk ·{" "}
                {students.filter((s) => s.status === "uneasy").length} uneasy
              </p>
              <Button
                onClick={() => onUneasy()}
                variant="destructive"
                className="w-full"
              >
                <Siren /> Report Uneasy
              </Button>
            </Card>
          ) : (
            <Card className="gap-3 p-5">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="rounded-full">
                  asthma
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  5-B
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  bus route 4
                </Badge>
              </div>
              <Button
                onClick={() => onUneasy()}
                variant="secondary"
                className="w-full"
              >
                <Siren /> I feel uneasy
              </Button>
            </Card>
          )}

          {/* travelling card */}
          <Card className="p-5">
            <p className="text-sm font-medium">Travelling somewhere?</p>
            <p className="text-xs text-muted-foreground">
              Check if air is safe there.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 rounded-full"
              onClick={() => setTab("map")}
            >
              <MapPin /> Check map
            </Button>
          </Card>

          <Card className="gap-3 p-5">
            <p className="text-sm font-medium">Extended analysis</p>
            <Gauge aqi={briefing.aqi} />
          </Card>

          <button
            type="button"
            onClick={() => setTab("map")}
            className="text-left transition-transform duration-200 active:scale-[0.99]"
          >
            <SchoolMapPreview
              role={role}
              school={school}
              schoolName={schoolName}
              level={level}
            />
          </button>

          <Button
            variant="secondary"
            onClick={onOpenBriefing}
            className="w-full"
          >
            Log today · plan next
          </Button>
        </div>
      )}

      {tab === "map" && (
        <SchoolMapView
          role={role}
          school={school}
          schoolName={schoolName}
          aqi={briefing.aqi}
          headline={LEVEL_META[level].headline}
          level={level}
          layers={layers}
          onLayersChange={onLayersChange}
          onOpenStudents={onOpenStudents}
          zoom={13}
          className="min-h-[60dvh]"
        />
      )}

      {tab === "people" && (
        <div className="flex flex-col gap-2.5">
          {students.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => onUneasy(s.id)}
              className="flex items-center gap-3 rounded-3xl border bg-card p-4 text-left shadow-sm transition-all duration-200 active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {s.name} · {s.className}
                </span>
                <span className="text-xs text-muted-foreground">
                  {s.flags.join(", ") || "no flags"}
                </span>
              </span>
              <Siren className="size-4 text-muted-foreground" />
            </button>
          ))}
          <Button variant="secondary" onClick={onOpenStudents}>
            Open full list
          </Button>
        </div>
      )}

      {tab === "profile" && (
        <Card className="gap-2 p-5 text-sm">
          <p className="font-medium">Profile · {role}</p>
          <p className="text-muted-foreground">
            Edit profile, add conditions, switch school, logout — use the avatar
            menu up top on desktop.
          </p>
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={onOpenBriefing}
          >
            Notification panel
          </Button>
        </Card>
      )}

      {/* bottom tab bar */}
      <nav className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-md rounded-4xl bg-background/95 shadow-lg ring-1 ring-foreground/10 backdrop-blur">
        <div className="grid grid-cols-4 p-1.5">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-3xl py-2 text-[11px] transition-colors duration-200",
                tab === t.id
                  ? "bg-secondary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="[&_svg]:size-5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* AI explainer helper FAB */}
      <button
        type="button"
        aria-label="AI explainer"
        onClick={onOpenBriefing}
        className="fixed bottom-24 right-5 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
      >
        <Sparkle className="size-5" />
      </button>

      {sheets}
    </div>
  );
}
