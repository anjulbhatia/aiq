import PrincipalScreen from "@/components/screens/principal-screen";
import { getBriefing } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PrincipalPage() {
  const briefing = await getBriefing("anand-vihar");
  return <PrincipalScreen briefing={briefing} />;
}
