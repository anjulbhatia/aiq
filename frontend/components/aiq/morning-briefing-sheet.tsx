"use client";

import { CheckCircle, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { LEVEL_META } from "@/lib/protocol";
import type { Briefing } from "@/lib/types";
import { ProtocolBadge } from "./protocol-badge";

export function MorningBriefingSheet({
  open,
  onOpenChange,
  briefing,
  published,
  onPublish,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  briefing: Briefing;
  published: boolean;
  onPublish: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const meta = LEVEL_META[briefing.level];

  const publish = () => {
    onPublish();
    setConfirmOpen(false);
    onOpenChange(false);
    toast.add({
      title: "Protocol published",
      description: "Parents notified (mock push).",
      type: "success",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle className="font-heading text-2xl">
            Morning Briefing
          </SheetTitle>
          <SheetDescription>
            Review the decision, then publish to parents.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 p-6 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <ProtocolBadge level={briefing.level} />
            {published && (
              <Badge variant="secondary" className="gap-1 rounded-full">
                <CheckCircle className="size-3" /> Published
              </Badge>
            )}
          </div>

          <Card className="gap-2 p-5">
            <p className="text-xs text-muted-foreground">
              Recommendation for the day
            </p>
            <p className="font-heading text-xl font-semibold">
              {meta.headline}
            </p>
            <ul className="mt-1 space-y-1.5 text-sm">
              {briefing.actions.map((a) => (
                <li key={a.key} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {a.label}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-2 border-dashed p-5">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkle className="size-4 text-primary" /> Generative briefing
              (principal only)
            </p>
            <p className="text-sm leading-relaxed">
              AQI {briefing.aqi} with {briefing.windKph} kph {briefing.windDir}{" "}
              wind is trapping PM2.5 near ground level. With{" "}
              {Math.round(briefing.builtUpRatio * 100)}% built-up cover and thin
              canopy, keep exertion indoors before noon. Reassess after 2pm.
            </p>
          </Card>

          <Accordion>
            <AccordionItem value="why">
              <AccordionTrigger>Why this recommendation?</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-5">
                  {briefing.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="forecast">
              <AccordionTrigger>Tomorrow forecast</AccordionTrigger>
              <AccordionContent>
                {briefing.forecastTomorrow.aqi} AQI ·{" "}
                {briefing.forecastTomorrow.level}. Plan outdoor events
                tentatively; confirm in tomorrow&apos;s briefing.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger
              render={
                <Button size="lg" className="w-full">
                  {published ? "Republish protocol" : "Publish protocol"}
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish {meta.headline}?</DialogTitle>
                <DialogDescription>
                  This notifies all parents and teachers (mocked push). You can
                  republish later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="secondary">Cancel</Button>}
                />
                <Button onClick={publish}>Confirm publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
