"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface Result {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Keyless OSM search primitive (Nominatim). Picking a result recenters
// the map — the same location feeds exposure research context.
export function LocationSearch({
  onPick,
}: {
  onPick: (lng: number, lat: number, name: string) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
        );
        const data = (await res.json()) as Result[];
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="relative w-56">
      <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={loading ? "Searching…" : "Search location…"}
        className="rounded-full bg-background/95 pr-3 pl-9 shadow-sm"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-2xl border bg-popover shadow-lg">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => {
                onPick(Number(r.lon), Number(r.lat), r.display_name.split(",").slice(0, 2).join(","));
                setOpen(false);
                setQ("");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted"
            >
              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {r.display_name.split(",").slice(0, 3).join(",")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
