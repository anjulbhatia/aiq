"use client";

import type { AttendancePerson } from "@/lib/types";
import { cn } from "@/lib/utils";

// Waffle attendance board: one row per person, 7 day cells.
export function WaffleBoard({
  people,
  dates,
}: {
  people: AttendancePerson[];
  dates: string[];
}) {
  const total = people.length * 7;
  const present = people.reduce(
    (s, p) => s + p.week.filter(Boolean).length,
    0,
  );
  const pct = total === 0 ? 0 : Math.round((present / total) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground tabular-nums">
        <span className="flex gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-[2px] bg-primary" /> present
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-[2px] bg-muted" /> absent
          </span>
        </span>
        <span className="font-medium text-foreground">{pct}% present</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-[1fr_repeat(7,1.25rem)] items-center gap-1">
          <span />
          {dates.map((d) => (
            <span
              key={d}
              className="text-center text-[10px] text-muted-foreground tabular-nums"
            >
              {d.slice(8)}
            </span>
          ))}
        </div>
        {people.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[1fr_repeat(7,1.25rem)] items-center gap-1"
          >
            <span className="truncate text-xs">
              {p.name}{" "}
              <span className="text-muted-foreground">· {p.className}</span>
            </span>
            {p.week.map((day, i) => (
              <span
                key={i}
                title={`${p.name} ${dates[i]}: ${day ? "present" : "absent"}`}
                className={cn(
                  "size-5 rounded-[4px]",
                  day ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact 7-dot week strip for table rows / panels.
export function WeekDots({ week }: { week: boolean[] }) {
  return (
    <span className="inline-flex gap-1">
      {week.map((day, i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full",
            day ? "bg-primary" : "bg-destructive",
          )}
        />
      ))}
    </span>
  );
}
