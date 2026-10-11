"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { reportUneasy } from "@/lib/api";
import type { Student } from "@/lib/types";

export function UneasySheet({
  open,
  onOpenChange,
  students,
  presetId,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  students: Student[];
  presetId?: string;
  side?: "right" | "bottom";
}) {
  const [id, setId] = useState(presetId ?? students[0]?.id ?? "");
  const [note, setNote] = useState("");

  const submit = async () => {
    await reportUneasy(id);
    onOpenChange(false);
    setNote("");
    toast.add({
      title: "Uneasy report logged",
      description: "Teacher and school notified.",
      type: "success",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={side === "bottom" ? "rounded-t-4xl" : "sm:max-w-md"}
      >
        <SheetHeader className="text-left">
          <SheetTitle>I feel uneasy</SheetTitle>
          <SheetDescription>
            Simple flow: pick student, optional note, submit.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-6 pt-0">
          <div className="grid gap-1.5">
            <Label>Student</Label>
            <Select value={id} onValueChange={(v) => setId(v ?? "")}>
              <SelectTrigger className="w-full rounded-3xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Coughing after outdoor break…"
              className="rounded-3xl"
            />
          </div>
          <Button size="lg" onClick={submit}>
            Submit report
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
