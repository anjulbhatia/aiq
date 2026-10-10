import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "../layouts/app-layout";

const ROLES = [
  {
    href: "/principal",
    title: "Principal / Admin",
    desc: "Morning briefing + one-click publish of daily protocol",
  },
  {
    href: "/teacher",
    title: "Teacher",
    desc: "Class risk view + student uneasy reporting",
  },
  {
    href: "/parent",
    title: "Parent / Student",
    desc: "Personal status card + medical flags + uneasy button",
  },
];

export default function HomeScreen() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle>Protect school day from bad air</CardTitle>
          <CardDescription>
            Live AQI + weather + local urban form → clear daily safety protocol. Pick a role to preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {ROLES.map((r) => (
            <Link key={r.href} href={r.href}>
              <Button variant="outline" className="h-auto w-full justify-start px-4 py-3 text-left">
                <span>
                  <span className="block font-semibold">{r.title}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{r.desc}</span>
                </span>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
      <p className="px-1 text-xs text-muted-foreground">
        Demo uses seeded Delhi schools. Backend ML + live APIs plug into lib/api.ts later.
      </p>
    </AppLayout>
  );
}
