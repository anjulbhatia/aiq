"use client";

import { ClipboardText, UsersThree } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function FloatingActions({
  onBriefing,
  onStudents,
}: {
  onBriefing: () => void;
  onStudents: () => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <Button
        onClick={onBriefing}
        size="lg"
        className="shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
      >
        <ClipboardText weight="fill" /> Morning Briefing
      </Button>
      <Button
        onClick={onStudents}
        variant="secondary"
        className="shadow-md backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
      >
        <UsersThree /> Students
      </Button>
    </div>
  );
}
