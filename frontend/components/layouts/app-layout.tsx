"use client";

import AppHeader from "@/components/aiq/app-header";
import BottomNav from "@/components/aiq/bottom-nav";
import { Toaster } from "@/components/ui/toast";
import type { ProtocolLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
  schoolId,
  level,
  role = "parent",
  theme = "theme-00",
}: {
  children: React.ReactNode;
  schoolId?: string;
  level?: ProtocolLevel;
  role?: string;
  theme?: string;
}) {
  return (
    <Toaster>
      <div className={cn("flex min-h-dvh w-full flex-col bg-muted/40", theme)}>
        <AppHeader schoolId={schoolId} level={level} role={role} compact />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4 pb-8">{children}</main>
        <BottomNav />
      </div>
    </Toaster>
  );
}
