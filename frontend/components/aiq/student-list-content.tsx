"use client";

import { useState } from "react";
import { PencilSimple, Siren } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { STUDENTS } from "@/lib/mock-data";

export function StudentListContent({ schoolId }: { schoolId: string }) {
  const [flags, setFlags] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState("");
  const roster = STUDENTS.filter((s) => s.schoolId === schoolId);

  return (
    <div className="grid gap-2">
      {roster.map((s) => {
        const merged = flags[s.id] ?? s.flags;
        return (
          <Card key={s.id} className="rounded-2xl">
            <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {s.name}
                  {s.status === "uneasy" && <Siren className="size-3.5 text-destructive" />}
                </p>
                <p className="text-xs text-muted-foreground">{s.className}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {merged.length > 0 ? (
                    merged.map((f) => (
                      <Badge key={f} variant="destructive" className="rounded-full text-[11px]">{f}</Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="rounded-full text-[11px]">No flags</Badge>
                  )}
                </div>
              </div>
              <Dialog>
                <DialogTrigger render={<Button size="sm" variant="outline" className="shrink-0 rounded-xl" />}>
                  <PencilSimple className="size-3.5" /> Flags
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Medical flags — {s.name}</DialogTitle>
                    <DialogDescription>Comma-separated. e.g. asthma, breathing issues</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Label htmlFor={`flags-${s.id}`}>Flags</Label>
                    <Input
                      id={`flags-${s.id}`}
                      defaultValue={merged.join(", ")}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="asthma"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        setFlags((f) => ({ ...f, [s.id]: draft.split(",").map((x) => x.trim()).filter(Boolean) }));
                        toast.add({ title: "Flags updated", description: `${s.name} saved.`, type: "success" });
                      }}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
