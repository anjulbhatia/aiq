"use client";

import { Sparkle, Stack, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FloatingActions({
  onBriefing,
  onStudents,
  layers,
  onLayers,
}: {
  onBriefing: () => void;
  onStudents: () => void;
  layers: { sensors: boolean; canopy: boolean };
  onLayers: (l: { sensors: boolean; canopy: boolean }) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onBriefing} size="lg" className="rounded-2xl shadow-lg transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
        <Sparkle className="size-4" /> Morning Briefing
      </Button>
      <div className="flex gap-2">
        <Button onClick={onStudents} variant="secondary" className="flex-1 rounded-2xl shadow-md backdrop-blur">
          <Users className="size-4" /> Students
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" size="icon" className="rounded-2xl shadow-md" />}>
            <Stack className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Map layers</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={layers.sensors} onCheckedChange={(v) => onLayers({ ...layers, sensors: !!v })}>
              Nearby sensors
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={layers.canopy} onCheckedChange={(v) => onLayers({ ...layers, canopy: !!v })}>
              Tree canopy
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
