"use client";

import Link from "next/link";
import { Buildings, SmileyWink, Users } from "@phosphor-icons/react";
import AppLayout from "../layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = [
  { href: "/principal", title: "Principal / Admin", desc: "Morning briefing + one-click publish", icon: Buildings, theme: "theme-02" },
  { href: "/teacher", title: "Teacher", desc: "Class risk view + uneasy reporting", icon: Users, theme: "theme-01" },
  { href: "/parent", title: "Parent / Student", desc: "Status card + medical flags + SOS", icon: SmileyWink, theme: "theme-00" },
];

export default function HomeScreen() {
  return (
    <AppLayout role="home" theme="theme-00">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-bold">Protect school day from bad air</CardTitle>
          <CardDescription>Live AQI + weather + urban form → clear daily protocol. Pick a role to preview.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2.5">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <Link key={r.href + r.title} href={r.href} className={r.theme}>
                <Button variant="outline" className="h-auto w-full justify-start gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-md active:scale-[0.99]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{r.title}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">{r.desc}</span>
                  </span>
                </Button>
              </Link>
            );
          })}
        </CardContent>
      </Card>
      <p className="px-1 text-center text-xs text-muted-foreground">
        Seeded Delhi schools · hierarchy: Authority → Institution → Parent → Student
      </p>
    </AppLayout>
  );
}
