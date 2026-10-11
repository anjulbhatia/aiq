"use client";

import { useState } from "react";
import { Siren, Sparkle } from "@phosphor-icons/react";
import { useAppState } from "@/components/aiq/app-state";
import { BackBar } from "@/components/layouts/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toast";
import { postDaylog } from "@/lib/api";
import { cn } from "@/lib/utils";

const SYMPTOMS = ["cough", "wheeze", "headache", "itchy eyes", "tired"];

export default function ChatPage() {
  const { students, themeClass } = useAppState();
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [unease, setUnease] = useState(false);
  const [logged, setLogged] = useState(false);

  const toggle = (s: string) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = async () => {
    await postDaylog({
      studentId: students[0]?.id ?? "na",
      entries: picked,
      unease,
      note,
    });
    setLogged(true);
    toast.add({
      title: "Day logged",
      description: unease ? "Take leave + see a doctor." : "Okay for school.",
      type: unease ? "error" : "success",
    });
  };

  return (
    <Toaster>
      <div className={cn("min-h-dvh bg-background text-foreground", themeClass)}>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-3 pb-6 pt-3">
          <BackBar title="Log today · chat" />

          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-sm font-medium">
                How was {students[0]?.name ?? "the ward"} today?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOMS.map((s) => (
                  <button key={s} type="button" onClick={() => toggle(s)}>
                    <Badge variant={picked.includes(s) ? "default" : "outline"}>
                      {s}
                    </Badge>
                  </button>
                ))}
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything else…"
                rows={3}
              />
              <button
                type="button"
                onClick={() => setUnease((v) => !v)}
                className={cn(
                  "flex items-center gap-2 border p-3 text-left text-sm",
                  unease
                    ? "border-destructive bg-destructive/10"
                    : "text-muted-foreground",
                )}
              >
                <Siren className={unease ? "text-destructive" : ""} />
                Feeling uneasy today
              </button>
              <Button onClick={submit}>
                <Sparkle /> Submit log
              </Button>
            </CardContent>
          </Card>

          {logged && (
            <Card
              className={cn(unease && "border-destructive/40 bg-destructive/5")}
            >
              <CardContent className="p-4 text-sm">
                {unease || picked.length >= 2 ? (
                  <>
                    <p className="font-medium">See a doctor, take leave.</p>
                    <p className="text-muted-foreground">
                      {picked.join(", ") || "Unease"} on a{" "}
                      {students[0]?.flags.join(", ") || "sensitive"} profile —
                      rest indoors, reassess tomorrow.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Okay for school.</p>
                    <p className="text-muted-foreground">
                      No concerning pattern. Keep masks handy if AQI rises.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Toaster>
  );
}
