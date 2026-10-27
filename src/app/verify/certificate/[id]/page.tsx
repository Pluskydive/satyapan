import { notFound } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import CertificateClient from "./CertificateClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { id } = await params;
  const { data: student } = await dataProvider.getStudentById(id);

  if (!student) {
    notFound();
  }

  return <CertificateClient student={student} />;
}
