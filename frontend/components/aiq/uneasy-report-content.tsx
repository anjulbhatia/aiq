"use client";

import { useState } from "react";
import { Siren } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { reportUneasy } from "@/lib/api";
import { STUDENTS } from "@/lib/mock-data";

export default function UneasyReportContent({
  schoolId,
  defaultStudentId,
  onDone,
}: {
  schoolId: string;
  defaultStudentId?: string;
  onDone?: () => void;
}) {
  const roster = STUDENTS.filter((s) => s.schoolId === schoolId);
  const [studentId, setStudentId] = useState(defaultStudentId ?? roster[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await reportUneasy(studentId);
    setSending(false);
    toast.add({ title: "Uneasy reported", description: "Teacher + principal notified.", type: "success" });
    onDone?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-destructive/10 p-4 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-destructive"><Siren className="size-4" /> Feeling unsure?</p>
        <p className="mt-1 text-muted-foreground">Pick student + optional note. One tap, no friction.</p>
      </div>
      <div className="grid gap-2">
        <Label>Student</Label>
        <Select value={studentId} onValueChange={(v) => setStudentId(v ?? "")}>
          <SelectTrigger className="w-full rounded-2xl"><SelectValue placeholder="Select student" /></SelectTrigger>
          <SelectContent>
            {roster.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name} · {s.className}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="uneasy-note">Note (optional)</Label>
        <Textarea id="uneasy-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Coughing after assembly…" className="rounded-2xl" />
      </div>
      <Button onClick={submit} disabled={sending || !studentId} variant="destructive" className="rounded-2xl">
        {sending ? "Sending…" : "Report uneasy"}
      </Button>
    </div>
  );
}
