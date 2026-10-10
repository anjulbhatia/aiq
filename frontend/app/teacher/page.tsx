import TeacherScreen from "@/components/screens/teacher-screen";
import { getBriefing } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const briefing = await getBriefing("anand-vihar");
  return <TeacherScreen briefing={briefing} />;
}
