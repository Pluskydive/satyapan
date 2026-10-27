import { NextResponse } from "next/server";
import { getSatyapanStore } from "@/lib/mockData";
import { applySelectiveDisclosure } from "@/lib/security";
import { apiFailure, demoApiUnavailable, readJsonBody, RequestInputError, sameOriginFailure } from "@/lib/api-utils";
import { assertDemoMode } from "@/lib/runtime-mode";

export async function GET(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;

  try {
    assertDemoMode();
    const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
    if (!code || code.length > 64) {
      throw new RequestInputError("Enter a valid demonstration code.");
    }

    const store = getSatyapanStore();
    let verReq = store.verificationRequests.find(
      (item) => item.verification_code.toUpperCase() === code
    );

    // Demo QR codes may use an institution roll number; APAAR values are never lookup keys.
    if (!verReq && /^SATYA-STU-[A-Z0-9-]{1,32}$/.test(code)) {
      const rollId = code.slice("SATYA-".length);
      const student = store.students.find(
        (item) => item.institutional_student_id.toUpperCase() === rollId
      );
      if (student) {
        verReq = {
          id: `demo-ver-${student.id}`,
          student_id: student.id,
          verifier_type: "Demonstration employer",
          verifier_name: "Academic Verification Gateway",
          purpose: "Show the consent-gated verification workflow",
          requested_fields: ["enrolment_status", "program", "institution", "admission_year"],
          disclosed_fields: {},
          consent_granted: false,
          result: "pending",
          verification_code: code,
          created_at: new Date().toISOString(),
        };
        store.verificationRequests.push(verReq);
      }
    }

    if (!verReq) {
      return NextResponse.json({ error: "We couldn't find that demonstration request." }, { status: 404 });
    }

    const student = store.students.find((item) => item.id === verReq!.student_id);
    const institution = student
      ? store.institutions.find((item) => item.id === student.institution_id)
      : null;

    return NextResponse.json(
      {
        request: verReq,
        demonstration: true,
        student_preview: {
          masked_name: student
            ? `${student.full_name.charAt(0)}••••• ${student.full_name.split(" ").slice(-1)[0]}`
            : "••••",
          program: student?.program,
          institution_name: institution?.name,
          admission_year: student?.admission_year,
        },
        disclosed_data:
          verReq.consent_granted && student
            ? applySelectiveDisclosure({ ...student, institutions: institution })
            : null,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't load this request. Check the code and try again.");
  }
}

export async function POST(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  try {
    assertDemoMode();
    const body = await readJsonBody<{ action?: unknown; code?: unknown }>(request, 8_000);
    if (body.action !== "grant_consent" || typeof body.code !== "string" || body.code.length > 64) {
      throw new RequestInputError("This demonstration action is not available.");
    }
    const code = body.code.trim().toUpperCase();

    const store = getSatyapanStore();
    const verReq = store.verificationRequests.find(
      (item) => item.verification_code.toUpperCase() === code
    );
    if (!verReq) {
      return NextResponse.json({ error: "We couldn't find that demonstration request." }, { status: 404 });
    }

    const student = store.students.find((item) => item.id === verReq.student_id);
    const institution = student
      ? store.institutions.find((item) => item.id === student.institution_id)
      : null;
    const disclosed = student
      ? applySelectiveDisclosure({ ...student, institutions: institution })
      : {};

    verReq.consent_granted = true;
    verReq.result = "verified";
    verReq.disclosed_fields = disclosed;
    store.auditLogs.unshift({
      id: `demo-audit-${Date.now()}`,
      actor_role: "student",
      action: "DEMO_CONSENT_GRANTED",
      entity: "verification_requests",
      entity_id: verReq.id,
      created_at: new Date().toISOString(),
      after_data: { demonstration: true, verifier: verReq.verifier_name },
    });

    return NextResponse.json(
      { success: true, request: verReq, disclosed_data: disclosed, demonstration: true },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't complete this demonstration action. Please try again.");
  }
}
