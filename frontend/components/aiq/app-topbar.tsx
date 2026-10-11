"use client";

import {
  Bell,
  CaretDown,
  SignOut,
  UserCircle,
  Wind,
} from "@phosphor-icons/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProtocolLevel } from "@/lib/types";
import { ProtocolBadge } from "./protocol-badge";

export type AppRole = "student" | "parent" | "teacher" | "school" | "authority";

const ROLE_LABEL: Record<AppRole, string> = {
  student: "Student",
  parent: "Parent",
  teacher: "Teacher",
  school: "School",
  authority: "Authority",
};

export function AppTopbar({
  role,
  onRoleChange,
  schoolName,
  level,
  onOpenBriefing,
  onOpenStudents,
}: {
  role: AppRole;
  onRoleChange: (r: AppRole) => void;
  schoolName: string;
  level: ProtocolLevel;
  onOpenBriefing: () => void;
  onOpenStudents: () => void;
}) {
  return (
    <header className="pointer-events-auto flex h-14 items-center gap-3 rounded-4xl bg-background/90 px-4 shadow-md ring-1 ring-foreground/5 backdrop-blur">
      <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Wind weight="fill" className="size-5" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{schoolName}</p>
        <p className="text-xs text-muted-foreground">Sun, Jul 24 · AIQ</p>
      </div>

      <button
        type="button"
        onClick={onOpenBriefing}
        className="ml-1 hidden transition-transform duration-200 hover:-translate-y-px sm:block"
      >
        <ProtocolBadge level={level} />
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Select value={role} onValueChange={(v) => onRoleChange(v as AppRole)}>
          <SelectTrigger size="sm" className="w-32 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Bell />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Protocol published for today</DropdownMenuItem>
            <DropdownMenuItem>2 uneasy reports in 5-B</DropdownMenuItem>
            <DropdownMenuItem>
              Tomorrow forecast: {level === "Good" ? "stable" : "elevated AQI"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full pr-2"
              >
                <Avatar className="size-6">
                  <AvatarFallback>
                    <UserCircle className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <CaretDown className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Profile · {ROLE_LABEL[role]}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenStudents}>
              Open school / students
            </DropdownMenuItem>
            <DropdownMenuItem>Edit profile</DropdownMenuItem>
            <DropdownMenuItem>Add conditions</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOut className="size-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
