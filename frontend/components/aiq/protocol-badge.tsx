"use client";

import { Badge } from "@/components/ui/badge";
import { LEVEL_META } from "@/lib/protocol";
import type { ProtocolLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProtocolBadge({ level, className }: { level: ProtocolLevel; className?: string }) {
  const meta = LEVEL_META[level];
  return (
    <Badge className={cn("gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white", meta.classes, className)}>
      <span className="size-1.5 rounded-full bg-white/90" />
      {meta.label}
    </Badge>
  );
}
