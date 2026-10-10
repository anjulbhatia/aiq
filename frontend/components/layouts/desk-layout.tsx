import AppHeader from "@/components/aiq/app-header";
import { cn } from "@/lib/utils";

// Wide desktop shell for principal admin view. Mobile uses AppLayout.
export default function DeskLayout({
  children,
  schoolId,
  theme = "theme-02",
}: {
  children: React.ReactNode;
  schoolId?: string;
  theme?: string;
}) {
  return (
    <div className={cn("flex min-h-screen w-full flex-col bg-muted/40", theme)}>
      <AppHeader schoolId={schoolId} />
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-4 px-4 py-6 md:grid-cols-[1.2fr_1fr]">
        {children}
      </main>
    </div>
  );
}