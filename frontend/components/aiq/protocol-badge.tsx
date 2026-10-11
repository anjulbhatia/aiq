"use client";

import { Badge } from "@/components/ui/badge";
import { LEVEL_META } from "@/lib/protocol";
import type { ProtocolLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProtocolBadge({
  level,
  className,
}: {
  level: ProtocolLevel;
  className?: string;
}) {
  const meta = LEVEL_META[level];
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 rounded-full px-3 py-1", className)}
    >
      <span className={cn("size-2 rounded-full", meta.dot)} />
      {meta.label} · {meta.headline}
    </Badge>
  );
}
