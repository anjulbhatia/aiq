"use client";

import { Siren } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Student } from "@/lib/types";

export function StudentListSheet({
  open,
  onOpenChange,
  students,
  onUneasy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  students: Student[];
  onUneasy: (id: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Students · class risk</SheetTitle>
          <SheetDescription>
            Quick filters via flags. Tap a row to log unease.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2.5 p-6 pt-0">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-3xl border bg-card p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {s.name} · {s.className}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.flags.length === 0 && (
                    <Badge variant="secondary" className="rounded-full">
                      no flags
                    </Badge>
                  )}
                  {s.flags.map((f) => (
                    <Badge key={f} variant="outline" className="rounded-full">
                      {f}
                    </Badge>
                  ))}
                  {s.status === "uneasy" && (
                    <Badge variant="destructive" className="rounded-full">
                      uneasy
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => onUneasy(s.id)}
              >
                <Siren /> Uneasy
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
