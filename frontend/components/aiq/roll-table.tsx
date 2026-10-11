"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeekDots } from "@/components/aiq/waffle-board";
import type { Teacher } from "@/lib/mock-data";
import type { AttendancePerson, Student } from "@/lib/types";

export function RollTable({
  kind,
  teachers,
  students,
  attendance,
  loading = false,
  onUneasy,
  uneasyTrigger,
}: {
  kind: "teachers" | "students";
  teachers: Teacher[];
  students: Student[];
  attendance: AttendancePerson[];
  loading?: boolean;
  onUneasy: (id?: string) => void;
  uneasyTrigger?: (studentId: string, label: string) => React.ReactNode;
}) {
  const title = kind === "teachers" ? "Teachers' Roll" : "Students' Roll";
  const sub =
    kind === "teachers"
      ? `${teachers.length} staff`
      : `${students.filter((s) => s.status === "uneasy").length} uneasy / ${students.length}`;
  const weekOf = (id: string, name: string) =>
    attendance.find((a) => a.id === id || a.name === name)?.week;

  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-muted-foreground tabular-nums">{sub}</span>
      </CardHeader>
      <CardContent className="min-h-0">
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        ) : (
        <div className="max-h-[52dvh] overflow-y-auto">
          {kind === "teachers" ? (
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.className}</TableCell>
                    <TableCell>
                      <WeekDots week={weekOf(t.id, t.name) ?? []} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.status === "uneasy" ? "destructive" : "secondary"}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => onUneasy()}>
                        Flag
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.flags.join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <WeekDots week={weekOf(s.id, s.name) ?? []} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={s.status === "uneasy" ? "destructive" : "secondary"}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {uneasyTrigger ? (
                        uneasyTrigger(s.id, "Uneasy")
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => onUneasy(s.id)}>
                          Uneasy
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
