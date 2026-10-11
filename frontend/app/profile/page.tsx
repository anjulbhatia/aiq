"use client";

import { useState } from "react";
import { SignOut } from "@phosphor-icons/react";
import { useAppState } from "@/components/aiq/app-state";
import { BackBar } from "@/components/layouts/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toast";
import { SCHOOLS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { role, schoolId, setSchoolId, students, themeClass } = useAppState();
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState(
    students[0]?.flags.join(", ") ?? "",
  );

  return (
    <Toaster>
      <div className={cn("min-h-dvh bg-background text-foreground", themeClass)}>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-3 pb-6 pt-3">
          <BackBar title="Profile" />
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 text-sm">
              <p className="font-medium capitalize">{role}</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
              />
              <Input
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Conditions, e.g. asthma"
              />
              <Select value={schoolId} onValueChange={(v) => setSchoolId(v ?? "anand-vihar")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() =>
                  toast.add({ title: "Profile saved", type: "success" })
                }
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.add({ title: "Signed out (mock)", type: "info" })
                }
              >
                <SignOut /> Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Toaster>
  );
}
