"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MapTrifold, UserCircle, Users } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Today", icon: House },
  { href: "/principal", label: "Map", icon: MapTrifold },
  { href: "/teacher", label: "Class", icon: Users },
  { href: "/parent", label: "Profile", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 border-t bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2">
        {TABS.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href + t.label}
              href={t.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl py-2.5 text-[11px] font-medium transition-all duration-200",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon weight={active ? "fill" : "regular"} className={cn("size-5 transition-transform duration-200", active && "scale-110")} />
              {t.label}
              <span className={cn("h-1 w-1 rounded-full bg-primary transition-opacity duration-200", active ? "opacity-100" : "opacity-0")} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
