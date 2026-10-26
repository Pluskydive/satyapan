import { dataProvider } from "@/lib/supabase";
import { getSatyapanStore } from "@/lib/mockData";
import InstitutionClient from "./InstitutionClient";


export default async function InstitutionPage() {
  const [instRes] = await Promise.all([
    dataProvider.getInstitutionSummary(),
  ]);

  const store = getSatyapanStore();
  const students = store.students;

  return (
    <InstitutionClient
      initialInstitutions={instRes.data || []}
      initialStudents={students}
    />
  );
}
