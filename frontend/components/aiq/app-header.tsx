"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CaretDown, CheckCircle, SignOut, SmileyWink, UserCircle, Users } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHOOLS } from "@/lib/mock-data";
import type { ProtocolLevel } from "@/lib/types";
import ProtocolBadge from "./protocol-badge";

const ROLES = [
  { value: "principal", label: "School" },
  { value: "teacher", label: "Teacher" },
  { value: "parent", label: "Parent" },
  { value: "student", label: "Student" },
];

// Thin top bar: logo | school | date | protocol badge | notifications | avatar.
export default function AppHeader({
  schoolId,
  level,
  role = "principal",
}: {
  schoolId?: string;
  level?: ProtocolLevel;
  role?: string;
  compact?: boolean;
}) {
  const school = SCHOOLS.find((s) => s.id === schoolId) ?? SCHOOLS[0];
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">AQ</span>
          <span className="leading-none">
            <span className="font-heading block text-[15px] font-bold">AIQ</span>
            <span className="block text-[11px] text-muted-foreground">{school.name}</span>
          </span>
        </Link>

        <div className="ml-1 hidden items-center gap-2 md:flex">
          <Select value={role}>
            <SelectTrigger className="h-8 rounded-full text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden text-xs text-muted-foreground lg:inline">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {level && <ProtocolBadge level={level} className="hidden sm:inline-flex" />}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="relative rounded-full" />}>
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-3xl p-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {[
                { icon: <CheckCircle className="size-4 text-emerald-600" />, t: "Protocol published for today", s: "Indoor PE · Masks · 7:42 AM" },
                { icon: <Users className="size-4 text-orange-500" />, t: "2 students reported uneasy", s: "Class 5-B · 9:15 AM" },
                { icon: <SmileyWink className="size-4 text-sky-600" />, t: "Tomorrow looks slightly better", s: "Forecast AQI 318" },
              ].map((n) => (
                <DropdownMenuItem key={n.t} className="items-start gap-2.5 rounded-2xl py-2.5">
                  {n.icon}
                  <span><span className="block text-[13px] font-medium">{n.t}</span><span className="block text-xs text-muted-foreground">{n.s}</span></span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="gap-1.5 rounded-full pl-1 pr-2">
                <Avatar className="size-7"><AvatarFallback>PR</AvatarFallback></Avatar>
                <CaretDown className="size-3.5 text-muted-foreground" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Principal · {school.locality}</DropdownMenuLabel>
              <DropdownMenuItem><UserCircle className="size-4" /> Edit profile</DropdownMenuItem>
              <DropdownMenuItem><SmileyWink className="size-4" /> Add conditions</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><SignOut className="size-4" /> Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
