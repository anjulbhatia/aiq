"use client";

import { ArrowsOut, MapPin, Stack, TreeEvergreen } from "@phosphor-icons/react";
import { useState } from "react";
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
import { LEVEL_META } from "@/lib/protocol";
import type { ProtocolLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface MapLayers {
  sensors: boolean;
  canopy: boolean;
}

const SENSOR_DOTS = [
  { x: "18%", y: "30%" },
  { x: "28%", y: "62%" },
  { x: "41%", y: "26%" },
  { x: "55%", y: "48%" },
  { x: "66%", y: "30%" },
  { x: "74%", y: "58%" },
  { x: "82%", y: "38%" },
  { x: "36%", y: "76%" },
  { x: "60%", y: "72%" },
];

// Boilerplate map canvas. Swap with mapcn.dev / real tiles later.
// Keeps: school pin + risk radius, optional sensor + canopy layers.
export function MapPlaceholder({
  schoolName,
  level,
  layers,
  onLayersChange,
  compact = false,
  className,
}: {
  schoolName: string;
  level: ProtocolLevel;
  layers: MapLayers;
  onLayersChange: (l: MapLayers) => void;
  compact?: boolean;
  className?: string;
}) {
  const [full, setFull] = useState(false);
  const meta = LEVEL_META[level];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-4xl bg-muted ring-1 ring-foreground/5",
        full ? "fixed inset-3 z-40" : compact ? "h-44" : "h-full min-h-[420px]",
        className,
      )}
    >
      {/* base grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* fake roads */}
      <div className="absolute left-0 top-[30%] h-3 w-full rotate-[-4deg] bg-background/90" />
      <div className="absolute left-[30%] top-0 h-full w-2.5 rotate-[8deg] bg-background/80" />
      <div className="absolute left-0 top-[64%] h-2 w-full rotate-[3deg] bg-background/70" />
      {/* canopy wash */}
      {layers.canopy && (
        <div className="absolute inset-0 bg-emerald-500/10 [mask-image:radial-gradient(60%_55%_at_35%_40%,black,transparent)]" />
      )}
      {/* sensor dots */}
      {layers.sensors &&
        SENSOR_DOTS.map((d) => (
          <span
            key={`${d.x}-${d.y}`}
            title="Sensor"
            className="absolute size-2.5 rounded-full bg-orange-500/80 ring-2 ring-background transition-transform duration-200 hover:scale-125"
            style={{ left: d.x, top: d.y }}
          />
        ))}
      {/* risk radius + school pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "size-40 rounded-full opacity-20 blur-[1px]",
            meta.classes,
          )}
        />
        <div
          className={cn(
            "absolute inset-6 rounded-full opacity-30 ring-2 ring-background",
            meta.classes,
          )}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span
            className={cn(
              "mx-auto flex size-11 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-background",
              meta.classes,
            )}
          >
            <MapPin weight="fill" className="size-5" />
          </span>
          <span className="mt-1.5 block whitespace-nowrap rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium shadow-sm">
            {schoolName}
          </span>
        </div>
      </div>

      {/* top-left legend */}
      <div className="absolute left-4 top-4 flex gap-1.5">
        <Badge variant="secondary" className="rounded-full bg-background/90">
          School + 2km radius
        </Badge>
        {layers.canopy && (
          <Badge variant="secondary" className="rounded-full bg-background/90">
            <TreeEvergreen className="size-3" /> Canopy
          </Badge>
        )}
      </div>

      {/* top-right controls */}
      <div className="absolute right-4 top-4 flex gap-1.5">
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
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full bg-background/95 shadow-sm"
          onClick={() => setFull((v) => !v)}
          aria-label="Toggle fullscreen map"
        >
          <ArrowsOut />
        </Button>
      </div>

      <p className="absolute bottom-3 left-4 text-[11px] text-muted-foreground">
        Map boilerplate · urban context only · mapcn.dev-ready
      </p>
    </div>
  );
}
