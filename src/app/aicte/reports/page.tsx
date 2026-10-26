import { dataProvider } from "@/lib/supabase";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const [natRes, stateRes, instRes] = await Promise.all([
    dataProvider.getNationalSummary(),
    dataProvider.getStateSummary(),
    dataProvider.getInstitutionSummary(),
  ]);

  return (
    <ReportsClient
      national={natRes.data}
      states={stateRes.data || []}
      institutions={instRes.data || []}
    />
  );
}
