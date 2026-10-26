import { notFound } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import CertificateClient from "./CertificateClient";

export async function generateStaticParams() {
  return [
    { id: "stu-1" },
    { id: "stu-10" },
    { id: "stu-20" },
    { id: "stu-30" },
    { id: "stu-40" },
  ];
}

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
