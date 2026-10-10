"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/principal", label: "Principal" },
  { href: "/parent", label: "Parent" },
  { href: "/teacher", label: "Teacher" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "py-3 text-center text-xs font-medium text-muted-foreground",
              pathname === t.href && "text-primary"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
