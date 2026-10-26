import { NextResponse } from "next/server";
import { getSatyapanStore } from "@/lib/mockData";
import { applySelectiveDisclosure } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Verification code required" }, { status: 400 });
    }

    const store = getSatyapanStore();

    // Look for existing verification request or match student directly
    let verReq = store.verificationRequests.find(
      (v) => v.verification_code.toUpperCase() === code
    );

    // If code matches a student ID or APAAR, dynamically generate or fetch a request
    if (!verReq) {
      const student = store.students.find(
        (s) =>
          s.id.toUpperCase() === code ||
          s.institutional_student_id.toUpperCase() === code ||
          s.apaar_id === code
      );

      if (student) {
        verReq = {
          id: `ver-${Date.now()}`,
          student_id: student.id,
          verifier_type: "Standard Employer Verification",
          verifier_name: "Industry Recruitment Partner",
          purpose: "Pre-employment academic credential check",
          requested_fields: ["enrolment_status", "program", "institution", "admission_year"],
          disclosed_fields: {},
          consent_granted: false,
          result: "pending",
          verification_code: `SATYA-${student.institutional_student_id}`,
          created_at: new Date().toISOString(),
        };
        store.verificationRequests.push(verReq);
      }
    }

    if (!verReq) {
      return NextResponse.json(
        { error: "Invalid verification code or QR token" },
        { status: 404 }
      );
    }

    const student = store.students.find((s) => s.id === verReq!.student_id);
    const institution = student
      ? store.institutions.find((i) => i.id === student.institution_id)
      : null;

    const studentWithInst = student
      ? { ...student, institutions: institution }
      : null;

    return NextResponse.json({
      request: verReq,
      student_preview: {
        masked_name: student
          ? student.full_name.charAt(0) + "••••• " + student.full_name.split(" ").slice(-1)[0]
          : "••••",
        program: student?.program,
        institution_name: institution?.name,
        admission_year: student?.admission_year,
      },
      disclosed_data: verReq.consent_granted && studentWithInst
        ? applySelectiveDisclosure(studentWithInst)
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Verification failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, code } = body;

    const store = getSatyapanStore();
    const verReq = store.verificationRequests.find(
      (v) => v.verification_code.toUpperCase() === code?.toUpperCase()
    );

    if (!verReq) {
      return NextResponse.json({ error: "Verification request not found" }, { status: 404 });
    }

    if (action === "grant_consent") {
      verReq.consent_granted = true;
      verReq.result = "verified";

      const student = store.students.find((s) => s.id === verReq.student_id);
      const institution = student
        ? store.institutions.find((i) => i.id === student.institution_id)
        : null;

      const selective = student
        ? applySelectiveDisclosure({ ...student, institutions: institution })
        : {};

      verReq.disclosed_fields = selective;

      // Log in audit trail
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actor_role: "student",
        action: "CONSENT_GRANTED_VERIFICATION",
        entity: "verification_requests",
        entity_id: verReq.id,
        created_at: new Date().toISOString(),
        after_data: {
          verifier: verReq.verifier_name,
          verification_code: verReq.verification_code,
        },
      });

      return NextResponse.json({
        success: true,
        request: verReq,
        disclosed_data: selective,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Consent operation failed" }, { status: 500 });
  }
}
