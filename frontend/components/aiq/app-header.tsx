import { SCHOOLS } from "@/lib/mock-data";

export default function AppHeader({ schoolId }: { schoolId?: string }) {
  const school = SCHOOLS.find((s) => s.id === schoolId) ?? SCHOOLS[0];
  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <p className="font-heading text-lg font-bold leading-none">AIQ</p>
          <p className="text-xs text-muted-foreground">Air Intelligence Quotient</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{school.name}</p>
          <p className="text-xs text-muted-foreground">{school.locality}, {school.city}</p>
        </div>
      </div>
    </header>
  );
}
