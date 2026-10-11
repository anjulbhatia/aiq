"use client";

import { House, MapPin, Stack, TreeEvergreen } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapControls,
  MapGeoJSON,
  MapMarker,
  Map as MapRoot,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import type { ProtocolLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { AppRole } from "./app-topbar";

export interface MapLayers {
  sensors: boolean;
  canopy: boolean;
}

export const LEVEL_HEX: Record<ProtocolLevel, string> = {
  Good: "#10b981",
  Moderate: "#eab308",
  Poor: "#f97316",
  VeryPoor: "#dc2626",
  Severe: "#881337",
};

// Demo stand-in until login provides real home coords: parent/student
// centers ~500m off the school so home-vs-school context reads on map.
const HOME_OFFSET = { dLat: 0.0045, dLng: 0.0035 };

export function resolveMapCenter(
  role: AppRole,
  school: { lat: number; lng: number },
) {
  if (role === "parent" || role === "student") {
    return {
      lat: school.lat + HOME_OFFSET.dLat,
      lng: school.lng + HOME_OFFSET.dLng,
      home: true,
    };
  }
  return { lat: school.lat, lng: school.lng, home: false };
}

function circleGeoJSON(lng: number, lat: number, radiusM: number, points = 64) {
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    const dLat = (radiusM / 111320) * Math.sin(a);
    const dLng =
      (radiusM / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.cos(a);
    coords.push([lng + dLng, lat + dLat]);
  }
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Polygon" as const, coordinates: [coords] },
      },
    ],
  };
}

// Demo sensor ring ~0.5–1.5km around center. Replace with live sensor feed.
const SENSOR_OFFSETS: [number, number][] = [
  [0.008, 0.005],
  [-0.007, 0.009],
  [0.011, -0.006],
  [-0.009, -0.008],
  [0.004, 0.012],
  [-0.012, 0.002],
  [0.013, 0.009],
  [-0.005, -0.013],
];

function SensorDots({ lng, lat }: { lng: number; lat: number }) {
  return (
    <>
      {SENSOR_OFFSETS.map(([dlng, dlat]) => (
        <MapMarker
          key={`${dlng}-${dlat}`}
          longitude={lng + dlng}
          latitude={lat + dlat}
        >
          <MarkerContent>
            <span className="block size-2.5 rounded-full bg-orange-500 ring-2 ring-white transition-transform duration-200 hover:scale-125" />
          </MarkerContent>
          <MarkerTooltip>Sensor · demo</MarkerTooltip>
        </MapMarker>
      ))}
    </>
  );
}

export function SchoolMapView({
  role,
  school,
  schoolName,
  aqi,
  headline,
  level,
  layers,
  onLayersChange,
  onOpenStudents,
  zoom = 12.5,
  className,
}: {
  role: AppRole;
  school: { lat: number; lng: number };
  schoolName: string;
  aqi: number;
  headline: string;
  level: ProtocolLevel;
  layers: MapLayers;
  onLayersChange: (l: MapLayers) => void;
  onOpenStudents: () => void;
  zoom?: number;
  className?: string;
}) {
  const center = resolveMapCenter(role, school);
  const hex = LEVEL_HEX[level];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-4xl ring-1 ring-foreground/5",
        className,
      )}
    >
      <MapRoot
        key={`${center.lng}-${center.lat}-${zoom}`}
        center={[center.lng, center.lat]}
        zoom={zoom}
        className="h-full min-h-[420px] w-full"
      >
        <MapGeoJSON
          data={circleGeoJSON(school.lng, school.lat, 2000)}
          fillPaint={{ "fill-color": hex, "fill-opacity": 0.12 }}
          linePaint={{
            "line-color": hex,
            "line-width": 1.5,
            "line-opacity": 0.6,
          }}
        />
        {layers.canopy && (
          <MapGeoJSON
            data={circleGeoJSON(school.lng, school.lat, 1200)}
            fillPaint={{ "fill-color": "#10b981", "fill-opacity": 0.1 }}
            linePaint={false}
          />
        )}
        {layers.sensors && <SensorDots lng={school.lng} lat={school.lat} />}

        <MapMarker longitude={school.lng} latitude={school.lat}>
          <MarkerContent>
            <span
              className="flex size-9 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white transition-transform duration-200 hover:scale-110"
              style={{ backgroundColor: hex }}
            >
              <MapPin weight="fill" className="size-5" />
            </span>
            <MarkerLabel position="bottom">{schoolName}</MarkerLabel>
          </MarkerContent>
          <MarkerPopup>
            <div className="w-52 space-y-1.5 rounded-3xl border bg-card p-3.5 shadow-lg">
              <p className="text-sm font-semibold">{schoolName}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {aqi} AQI · {headline}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="w-full rounded-full"
                onClick={onOpenStudents}
              >
                Open students
              </Button>
            </div>
          </MarkerPopup>
        </MapMarker>

        {center.home && (
          <MapMarker longitude={center.lng} latitude={center.lat}>
            <MarkerContent>
              <span className="flex size-8 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg ring-4 ring-white">
                <House weight="fill" className="size-4" />
              </span>
              <MarkerLabel position="bottom">Home</MarkerLabel>
            </MarkerContent>
            <MarkerTooltip>Home · demo location</MarkerTooltip>
          </MapMarker>
        )}

        <MapControls position="bottom-right" showZoom showFullscreen />
      </MapRoot>

      <div className="absolute top-4 left-4 flex gap-1.5">
        <Badge variant="secondary" className="rounded-full bg-background/90">
          School + 2km radius
        </Badge>
        {layers.canopy && (
          <Badge variant="secondary" className="rounded-full bg-background/90">
            <TreeEvergreen className="size-3" /> Canopy
          </Badge>
        )}
      </div>

      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                size="icon-sm"
                className="rounded-full bg-background/95 shadow-sm"
              >
                <Stack />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Map layers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={layers.sensors}
              onCheckedChange={(v) =>
                onLayersChange({ ...layers, sensors: v === true })
              }
            >
              Nearby sensors
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={layers.canopy}
              onCheckedChange={(v) =>
                onLayersChange({ ...layers, canopy: v === true })
              }
            >
              Tree canopy
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Compact phone preview: non-interactive, tap wraps to full map tab.
export function SchoolMapPreview({
  role,
  school,
  schoolName,
  level,
  className,
}: {
  role: AppRole;
  school: { lat: number; lng: number };
  schoolName: string;
  level: ProtocolLevel;
  className?: string;
}) {
  const center = resolveMapCenter(role, school);
  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden rounded-4xl ring-1 ring-foreground/5",
        className,
      )}
    >
      <MapRoot
        key={`preview-${center.lng}-${center.lat}`}
        center={[center.lng, center.lat]}
        zoom={12}
        interactive={false}
        className="pointer-events-none h-full w-full"
      >
        <MapGeoJSON
          data={circleGeoJSON(school.lng, school.lat, 2000)}
          fillPaint={{ "fill-color": LEVEL_HEX[level], "fill-opacity": 0.12 }}
          linePaint={false}
          interactive={false}
        />
        <MapMarker longitude={school.lng} latitude={school.lat}>
          <MarkerContent>
            <span
              className="flex size-7 items-center justify-center rounded-full text-white shadow ring-2 ring-white"
              style={{ backgroundColor: LEVEL_HEX[level] }}
            >
              <MapPin weight="fill" className="size-4" />
            </span>
          </MarkerContent>
        </MapMarker>
      </MapRoot>
      <span className="absolute bottom-2.5 left-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium shadow-sm">
        {schoolName} · tap for full map
      </span>
    </div>
  );
}
