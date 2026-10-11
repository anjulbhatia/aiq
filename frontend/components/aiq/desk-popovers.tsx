"use client";

import { useState } from "react";
import { Siren } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { reportUneasy } from "@/lib/api";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing, Student } from "@/lib/types";

export function BriefingPopover({
  briefing,
  published,
  onPublish,
  trigger,
}: {
  briefing: Briefing;
  published: boolean;
  onPublish: () => void;
  trigger: React.ReactElement;
}) {
  const meta = LEVEL_META[briefing.level];
  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-96 max-w-[90vw]">
        <div className="flex items-center gap-2">
          <PopoverTitle>{meta.headline}</PopoverTitle>
          {published && <Badge variant="secondary">Published</Badge>}
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {briefing.actions.map((a) => (
            <p key={a.key} className="bg-muted px-3 py-2 text-sm">
              {a.label}
            </p>
          ))}
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {briefing.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <Button
          className="mt-3 w-full"
          onClick={() => {
            onPublish();
            toast.add({
              title: "Protocol published",
              description: "Parents notified (mock push).",
              type: "success",
            });
          }}
        >
          {published ? "Republish protocol" : "Publish protocol"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function StudentsPopover({
  students,
  onUneasy,
  trigger,
}: {
  students: Student[];
  onUneasy: (id: string) => void;
  trigger: React.ReactElement;
}) {
  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-96 max-w-[90vw]">
        <PopoverTitle>Students</PopoverTitle>
        <div className="mt-2 flex max-h-72 flex-col gap-2 overflow-y-auto">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {s.name} · {s.className}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.flags.map((f) => (
                    <Badge key={f} variant="outline">
                      {f}
                    </Badge>
                  ))}
                  {s.status === "uneasy" && (
                    <Badge variant="destructive">uneasy</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUneasy(s.id)}
              >
                <Siren /> Uneasy
              </Button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function UneasyPopover({
  students,
  presetId,
  trigger,
}: {
  students: Student[];
  presetId?: string;
  trigger: React.ReactElement;
}) {
  const [id, setId] = useState(presetId ?? students[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  const submit = async () => {
    await reportUneasy(id);
    setOpen(false);
    setNote("");
    toast.add({
      title: "Uneasy report logged",
      description: "Teacher and school notified.",
      type: "success",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-80 max-w-[90vw]">
        <PopoverTitle>I feel uneasy</PopoverTitle>
        <div className="mt-2 flex flex-col gap-2">
          <Select value={id} onValueChange={(v) => setId(v ?? "")}>
            <SelectTrigger className="w-full">
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
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Coughing after outdoor break…"
          />
          <Button onClick={submit}>Submit report</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
