"use client";

import type { ReactNode } from "react";
import { type AppRole, AppTopbar } from "@/components/aiq/app-topbar";
import { FloatingActions } from "@/components/aiq/floating-actions";
import { type MapLayers, SchoolMapView } from "@/components/aiq/school-map";
import { StatusCard } from "@/components/aiq/status-card";
import { StatusStrip } from "@/components/aiq/status-strip";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing, ProtocolLevel } from "@/lib/types";

// Desktop SPA: map is permanent background, everything else overlays. No sidebar.
export function DeskLayout({
  role,
  onRoleChange,
  school,
  schoolName,
  locality,
  level,
  briefing,
  layers,
  onLayersChange,
  onOpenBriefing,
  onOpenStudents,
  sheets,
}: {
  role: AppRole;
  onRoleChange: (r: AppRole) => void;
  school: { lat: number; lng: number };
  schoolName: string;
  locality: string;
  level: ProtocolLevel;
  briefing: Briefing;
  layers: MapLayers;
  onLayersChange: (l: MapLayers) => void;
  onOpenBriefing: () => void;
  onOpenStudents: () => void;
  sheets: ReactNode;
}) {
  return (
    <div className="relative hidden h-dvh flex-col gap-3 overflow-hidden p-4 md:flex">
      <div className="absolute inset-0 p-4">
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
          className="h-full"
        />
      </div>

      <div className="pointer-events-none relative z-10">
        <AppTopbar
          role={role}
          onRoleChange={onRoleChange}
          schoolName={schoolName}
          level={level}
          onOpenBriefing={onOpenBriefing}
          onOpenStudents={onOpenStudents}
        />
      </div>

      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
        <div className="pointer-events-auto w-full max-w-sm transition-transform duration-200">
          <StatusCard briefing={briefing} locality={locality} />
        </div>
        <div className="pointer-events-auto">
          <FloatingActions
            onBriefing={onOpenBriefing}
            onStudents={onOpenStudents}
          />
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-auto">
        <StatusStrip briefing={briefing} />
      </div>

      {sheets}
    </div>
  );
}
