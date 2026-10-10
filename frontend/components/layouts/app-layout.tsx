import AppHeader from "@/components/aiq/app-header";
import BottomNav from "@/components/aiq/bottom-nav";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
  schoolId,
  theme = "theme-00",
}: {
  children: React.ReactNode;
  schoolId?: string;
  theme?: string;
}) {
  return (
    <div className={cn("flex min-h-screen w-full flex-col bg-muted/40", theme)}>
      <AppHeader schoolId={schoolId} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}