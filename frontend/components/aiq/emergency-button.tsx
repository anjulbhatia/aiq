"use client";

import { Siren } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

// Full-bleed red canvas: emergency record for parent / teacher / student.
export function EmergencyButton({ onRecord }: { onRecord: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-destructive p-4 text-destructive-foreground">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive-foreground/15">
        <Siren weight="fill" className="size-5" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-sm font-semibold">Feeling uneasy?</p>
        <p className="text-xs opacity-80">
          Record now — school and teacher are notified instantly.
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0"
        onClick={onRecord}
      >
        Record
      </Button>
    </div>
  );
}
