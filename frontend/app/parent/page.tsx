import ParentScreen from "@/components/screens/parent-screen";
import { getBriefing } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const briefing = await getBriefing("anand-vihar");
  return <ParentScreen briefing={briefing} />;
}
