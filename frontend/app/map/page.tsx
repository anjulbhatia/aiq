"use client";

import { useState } from "react";
import { BackBar } from "@/components/layouts/mobile-layout";
import { useAppState } from "@/components/aiq/app-state";
import {
  type MapLayers,
  SchoolMapView,
} from "@/components/aiq/school-map";
import { LEVEL_META } from "@/lib/protocol";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const { role, school, briefing, themeClass } = useAppState();
  const [layers, setLayers] = useState<MapLayers>({
    sensors: true,
    canopy: false,
  });

  return (
    <div className={cn("min-h-dvh bg-background text-foreground", themeClass)}>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-3 px-3 pb-6 pt-3">
        <BackBar title="Map" />
        <SchoolMapView
          role={role}
          school={{ lat: school.lat, lng: school.lng }}
          schoolName={school.name}
          aqi={briefing.aqi}
          headline={LEVEL_META[briefing.level].headline}
          level={briefing.level}
          layers={layers}
          onLayersChange={setLayers}
          zoom={13}
          className="min-h-[70dvh]"
        />
      </div>
    </div>
  );
}
