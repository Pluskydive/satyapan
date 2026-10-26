import { dataProvider } from "@/lib/supabase";
import AICTEControlTowerClient from "./AICTEControlTowerClient";


export default async function AICTEPage() {
  const [natRes, stateRes, flagsRes] = await Promise.all([
    dataProvider.getNationalSummary(),
    dataProvider.getStateSummary(),
    dataProvider.getOpenFlags(),
  ]);

  return (
    <AICTEControlTowerClient
      initialNational={natRes.data}
      initialStates={stateRes.data || []}
      initialFlags={flagsRes.data || []}
    />
  );
}
