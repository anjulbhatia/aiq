import DeskLayout from "../layouts/desk-layout";
import type { Briefing } from "@/lib/types";

export default function PrincipalScreen({ briefing }: { briefing: Briefing }) {
  return <DeskLayout briefing={briefing} schoolId={briefing.schoolId} />;
}
