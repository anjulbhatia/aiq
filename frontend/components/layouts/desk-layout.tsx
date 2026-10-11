"use client";

import { Bell, CaretDown, SignOut, UserCircle } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import type { AppRole } from "@/components/aiq/app-topbar";
import { AnalysisPanel } from "@/components/aiq/analysis-panel";
import { useDataReady } from "@/components/aiq/app-state";
import {
  BriefingPopover,
  UneasyPopover,
} from "@/components/aiq/desk-popovers";
import { GaugeAnalysisCard } from "@/components/aiq/gauge-analysis-card";
import { PrincipalAside } from "@/components/aiq/principal-sidebar";
import { RollTable } from "@/components/aiq/roll-table";
import { type MapLayers, SchoolMapView } from "@/components/aiq/school-map";
import { StatusCard } from "@/components/aiq/status-card";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Teacher } from "@/lib/mock-data";
import { LEVEL_META } from "@/lib/protocol";
import type {
  AttendancePerson,
  Briefing,
  HistoryDay,
  ProtocolLevel,
  Student,
} from "@/lib/types";

function DeskHeader({
  schoolName,
  level,
}: {
  schoolName: string;
  level: ProtocolLevel;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{schoolName}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {LEVEL_META[level].label} protocol
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <Bell />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-72">
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
              <Button variant="ghost" size="sm" className="gap-1.5 pr-2">
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
            <DropdownMenuItem>Edit profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DeskLayout({
  role,
  onRoleChange,
  school,
  schoolId,
  schoolName,
  locality,
  level,
  briefing,
  history,
  attendance,
  students,
  teachers,
  layers,
  onLayersChange,
  published,
  onPublish,
  onOpenBriefing,
  onOpenStudents,
  onUneasy,
  sheets,
}: {
  role: AppRole;
  onRoleChange: (r: AppRole) => void;
  school: { lat: number; lng: number };
  schoolId: string;
  schoolName: string;
  locality: string;
  level: ProtocolLevel;
  briefing: Briefing;
  history: HistoryDay[];
  attendance: { dates: string[]; teachers: AttendancePerson[]; students: AttendancePerson[] };
  students: Student[];
  teachers: Teacher[];
  layers: MapLayers;
  onLayersChange: (l: MapLayers) => void;
  published: boolean;
  onPublish: () => void;
  onOpenBriefing: () => void;
  onOpenStudents: () => void;
  onUneasy: (id?: string) => void;
  sheets: ReactNode;
}) {
  const [tab, setTab] = useState("overview");
  const ready = useDataReady();
  const isPrincipal = role === "school" || role === "authority";

  if (!isPrincipal) {
    return (
      <div className="hidden justify-center bg-muted/40 md:flex">
        <div className="w-2/3 max-w-2xl border-x bg-background">
            <MobileLayout
              desktopVisible
              role={role}
              onRoleChange={onRoleChange}
              school={school}
              schoolId={schoolId}
            schoolName={schoolName}
            locality={locality}
            level={level}
            briefing={briefing}
            history={history}
            attendance={attendance}
            students={students}
            teachers={teachers}
            layers={layers}
            onLayersChange={onLayersChange}
            onOpenBriefing={onOpenBriefing}
            onOpenStudents={onOpenStudents}
            onUneasy={onUneasy}
            sheets={sheets}
          />
        </div>
      </div>
    );
  }

  const uneasy = students.filter((s) => s.status === "uneasy").length;
  const briefingBtn = (label: string) => (
    <BriefingPopover
      briefing={briefing}
      published={published}
      onPublish={onPublish}
      trigger={<Button className="w-full">{label}</Button>}
    />
  );

  return (
    <div className="hidden h-dvh overflow-hidden md:flex">
      <aside className="w-[30%] shrink-0 overflow-y-auto border-r bg-sidebar p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PrincipalAside
          role={role}
          onRoleChange={onRoleChange}
          briefing={briefing}
          history={history}
          onOpenBriefing={() => {}}
          onUneasy={() => {}}
          briefingTrigger={briefingBtn}
          publishTrigger={(label) => (
            <BriefingPopover
              briefing={briefing}
              published={published}
              onPublish={onPublish}
              trigger={<Button className="flex-1">{label}</Button>}
            />
          )}
          uneasyTrigger={(label) => (
            <UneasyPopover
              students={students}
              trigger={
                <Button variant="outline" className="flex-1">
                  {label}
                </Button>
              }
            />
          )}
        />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/40">
        <DeskHeader schoolName={schoolName} level={level} />

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="w-fit shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="teachers">
                Teachers · {teachers.length}
              </TabsTrigger>
              <TabsTrigger value="students">
                Students · {uneasy}/{students.length}
              </TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="mt-3 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
            >
              <div className="grid shrink-0 grid-cols-5 gap-4">
                <div className="col-span-2">
                  <StatusCard briefing={briefing} locality={locality} />
                </div>
                <div className="col-span-3">
                  <GaugeAnalysisCard briefing={briefing} />
                </div>
              </div>
              <SchoolMapView
                role={role}
                school={school}
                schoolName={schoolName}
                aqi={briefing.aqi}
                headline={LEVEL_META[level].headline}
                level={level}
                layers={layers}
                onLayersChange={onLayersChange}
                onOpenStudents={() => setTab("students")}
                minMapHeight="min-h-[280px]"
                className="min-h-0 flex-1"
              />
            </TabsContent>
            <TabsContent value="teachers" className="mt-3 min-h-0">
              <RollTable
                kind="teachers"
                teachers={teachers}
                students={students}
                attendance={attendance.teachers}
                loading={!ready}
                onUneasy={() => {}}
                uneasyTrigger={(_id, label) => (
                  <UneasyPopover
                    students={students}
                    trigger={
                      <Button size="sm" variant="outline">
                        {label}
                      </Button>
                    }
                  />
                )}
              />
            </TabsContent>
            <TabsContent value="students" className="mt-3 min-h-0">
              <RollTable
                kind="students"
                teachers={teachers}
                students={students}
                attendance={attendance.students}
                loading={!ready}
                onUneasy={() => {}}
                uneasyTrigger={(id, label) => (
                  <UneasyPopover
                    students={students}
                    presetId={id}
                    trigger={
                      <Button size="sm" variant="outline">
                        {label}
                      </Button>
                    }
                  />
                )}
              />
            </TabsContent>
            <TabsContent value="analysis" className="mt-3 min-h-0 overflow-y-auto">
              <AnalysisPanel schoolId={schoolId} role={role} briefing={briefing} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
