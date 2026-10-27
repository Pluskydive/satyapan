import "server-only";

import { AuthorizationError, getCurrentUserContext, requireRole } from "@/lib/authz";
import { getSatyapanStore } from "@/lib/mockData";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { formatMaskedApaar } from "@/lib/security";
import type { AuditLog, Student, StudentRosterRecord, ValidationFlag } from "@/lib/types";

function assertAvailable() {
  if (getRuntimeMode() === "disabled") throw new Error("SATYAPAN_RUNTIME_DISABLED");
}

/**
 * Server-side repository. The demo store is synthetic and in-memory. Live mode
 * uses the signed-in user's cookie-backed Supabase session so RLS remains active.
 */
export const dataProvider = {
  get isLive() {
    return getRuntimeMode() === "live";
  },

  async runIntegrityChecks() {
    assertAvailable();
    if (getRuntimeMode() === "live") throw new Error("SATYAPAN_LIVE_OPERATION_DISABLED");
    const result = getSatyapanStore().runIntegrityChecks();
    return { success: true, mode: "demo" as const, ...result };
  },

  async getNationalSummary() {
    assertAvailable();
    if (getRuntimeMode() === "demo") {
      return { data: getSatyapanStore().getNationalSummary(), mode: "demo" as const };
    }
    const { supabase } = await getCurrentUserContext();
    const { data, error } = await supabase.from("v_national_summary").select("*").single();
    if (error || !data) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    return { data, mode: "live" as const };
  },

  async getStateSummary() {
    assertAvailable();
    if (getRuntimeMode() === "demo") {
      return { data: getSatyapanStore().getStateSummary(), mode: "demo" as const };
    }
    const { supabase } = await getCurrentUserContext();
    const { data, error } = await supabase
      .from("v_state_summary")
      .select("*")
      .order("students", { ascending: false })
      .limit(100);
    if (error || !data) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    return { data, mode: "live" as const };
  },

  async getInstitutionSummary(institutionId?: string) {
    assertAvailable();
    if (getRuntimeMode() === "demo") {
      return { data: getSatyapanStore().getInstitutionSummary(institutionId), mode: "demo" as const };
    }

    const { supabase, profile } = await getCurrentUserContext();
    const isGlobal = profile.role === "platform_admin" || profile.role === "reviewer";
    if (!isGlobal && institutionId && institutionId !== profile.institution_id) {
      throw new AuthorizationError(403);
    }

    let query = supabase.from("v_institution_summary").select("*");
    const target = isGlobal ? institutionId : profile.institution_id;
    if (target) {
      query = /^[0-9a-f-]{36}$/i.test(target)
        ? query.eq("id", target)
        : query.eq("aicte_code", target);
    }
    const { data, error } = await query.order("name", { ascending: true }).limit(500);
    if (error || !data) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    return { data, mode: "live" as const };
  },

  async getOpenFlags() {
    assertAvailable();
    if (getRuntimeMode() === "demo") {
      const store = getSatyapanStore();
      const data = store.flags
        .filter((flag) => flag.status === "open")
        .map((flag) => {
          const student = store.students.find((item) => item.id === flag.student_id);
          const institution = store.institutions.find((item) => item.id === flag.institution_id);
          return {
            ...flag,
            students: student
              ? { id: student.id, full_name: student.full_name, apaar_id: formatMaskedApaar(student.apaar_id), program: student.program, integrity_score: student.integrity_score }
              : null,
            institutions: institution ? { id: institution.id, name: institution.name, state: institution.state } : null,
          };
        })
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 200);
      return { data, mode: "demo" as const };
    }

    const { supabase } = await getCurrentUserContext();
    const { data, error } = await supabase
      .from("validation_flags")
      .select("id,student_id,institution_id,rule_code,severity,title,explanation,recommended_action,status,created_at,students(id,full_name,institutional_student_id,program,integrity_score),institutions(id,name,state)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    const safeData = data.map((row) => ({
      ...row,
      students: Array.isArray(row.students) ? row.students[0] ?? null : row.students,
      institutions: Array.isArray(row.institutions) ? row.institutions[0] ?? null : row.institutions,
    })) as ValidationFlag[];
    return { data: safeData, mode: "live" as const };
  },

  async getStudentById(idOrInstitutionalId: string) {
    assertAvailable();
    if (getRuntimeMode() === "demo") {
      const store = getSatyapanStore();
      const student = store.students.find(
        (item) => item.id === idOrInstitutionalId || item.institutional_student_id === idOrInstitutionalId
      );
      if (!student) return { data: null, mode: "demo" as const };
      const institution = store.institutions.find((item) => item.id === student.institution_id);
      const flags = store.flags.filter((flag) => flag.student_id === student.id);
      const apaarId = student.apaar_id;
      const safeStudent = {
        id: student.id,
        institutional_student_id: student.institutional_student_id,
        institution_id: student.institution_id,
        full_name: student.full_name,
        nationality_type: student.nationality_type,
        program: student.program,
        admission_year: student.admission_year,
        admission_date: student.admission_date,
        enrolment_status: student.enrolment_status,
        integrity_score: student.integrity_score,
        created_at: student.created_at,
        updated_at: student.updated_at,
      };
      return {
        data: { ...safeStudent, apaar_id: null, masked_apaar: formatMaskedApaar(apaarId), institutions: institution, flags },
        mode: "demo" as const,
      };
    }

    const { supabase } = await getCurrentUserContext();
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrInstitutionalId);
    let query = supabase
      .from("v_student_records")
      .select("id,masked_apaar,institutional_student_id,institution_id,full_name,nationality_type,program,admission_year,admission_date,enrolment_status,integrity_score,created_at,updated_at");
    query = isUuid ? query.eq("id", idOrInstitutionalId) : query.eq("institutional_student_id", idOrInstitutionalId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    if (!data) return { data: null, mode: "live" as const };
    const [institutionResult, flagsResult] = await Promise.all([
      supabase.from("institutions")
        .select("id,name,aicte_code,state,approved_intake,supernumerary_capacity")
        .eq("id", data.institution_id)
        .maybeSingle(),
      supabase.from("validation_flags")
        .select("id,student_id,institution_id,rule_code,severity,title,explanation,recommended_action,status,created_at")
        .eq("student_id", data.id)
        .order("created_at", { ascending: false }),
    ]);
    if (institutionResult.error || flagsResult.error) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    return {
      data: {
        ...data,
        apaar_id: null,
        institutions: institutionResult.data,
        flags: flagsResult.data ?? [],
      },
      mode: "live" as const,
    };
  },

  async getInstitutionStudents(institutionId?: string, limit = 50, offset = 0, search = "", status = "ALL") {
    assertAvailable();
    const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor(offset));
    if (getRuntimeMode() === "demo") {
      const store = getSatyapanStore();
      const target = institutionId || store.institutions[0]?.id;
      const queryText = search.trim().toLocaleLowerCase();
      const filtered = store.students.filter((student) => {
        if (student.institution_id !== target) return false;
        if (status !== "ALL" && student.enrolment_status.toUpperCase() !== status) return false;
        if (!queryText) return true;
        return student.full_name.toLocaleLowerCase().includes(queryText)
          || student.institutional_student_id.toLocaleLowerCase().includes(queryText)
          || student.program.toLocaleLowerCase().includes(queryText)
          || Boolean(student.apaar_id?.includes(queryText));
      });
      const safeRows: StudentRosterRecord[] = filtered.slice(safeOffset, safeOffset + safeLimit).map((student) => {
        const { apaar_id, ...safeStudent } = student;
        return { ...safeStudent, masked_apaar: formatMaskedApaar(apaar_id) };
      });
      return {
        data: safeRows,
        total: filtered.length,
        mode: "demo" as const,
      };
    }

    const { supabase, profile } = await getCurrentUserContext();
    const isGlobal = profile.role === "platform_admin" || profile.role === "reviewer";
    if (!isGlobal && institutionId && institutionId !== profile.institution_id) {
      throw new AuthorizationError(403);
    }
    const target = isGlobal ? institutionId : profile.institution_id;
    let query = supabase
      .from("v_student_records")
      .select("id,masked_apaar,institutional_student_id,institution_id,full_name,program,admission_year,enrolment_status,integrity_score,nationality_type,created_at,updated_at", { count: "exact" })
      .order("institutional_student_id", { ascending: true })
      .range(safeOffset, safeOffset + safeLimit - 1);
    if (target) query = query.eq("institution_id", target);
    if (status !== "ALL" && ["VERIFIED", "FLAGGED", "PENDING_APAAR_VALIDATION"].includes(status)) {
      query = query.eq("enrolment_status", status.toLocaleLowerCase());
    }
    const safeSearch = search.trim().slice(0, 80).replace(/[^\p{L}\p{N} ._@-]/gu, "");
    if (safeSearch) {
      query = query.or(`full_name.ilike.%${safeSearch}%,institutional_student_id.ilike.%${safeSearch}%,program.ilike.%${safeSearch}%`);
    }
    const { data, error, count } = await query;
    if (error || !data) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    const safeRows = data as unknown as StudentRosterRecord[];
    return { data: safeRows, total: count ?? data.length, mode: "live" as const };
  },

  async getAuditLogs(limit = 200) {
    assertAvailable();
    const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
    if (getRuntimeMode() === "demo") {
      return { data: getSatyapanStore().auditLogs.slice(0, safeLimit), mode: "demo" as const };
    }
    const { supabase } = await requireRole("platform_admin", "reviewer");
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id,actor_id,actor_role,action,entity,entity_id,created_at")
      .order("created_at", { ascending: false })
      .limit(safeLimit);
    if (error || !data) throw new Error("SATYAPAN_DATA_UNAVAILABLE");
    return { data: data as AuditLog[], mode: "live" as const };
  },

  async uploadStudents(institutionId: string, rows: Array<Partial<Student>>) {
    assertAvailable();
    if (getRuntimeMode() === "demo") {
      const store = getSatyapanStore();
      if (!store.institutions.some((institution) => institution.id === institutionId)) {
        throw new Error("SATYAPAN_INVALID_INSTITUTION");
      }
      const result = store.upsertStudents(institutionId, rows);
      return { inserted: result.inserted + result.updated, mode: "demo" as const };
    }

    const { supabase, profile } = await requireRole("institution_admin", "institution_staff");
    if (profile.institution_id !== institutionId) throw new AuthorizationError(403);
    const formatted = rows.map((row) => ({
      apaar_id: row.apaar_id || null,
      institutional_student_id: row.institutional_student_id,
      institution_id: institutionId,
      full_name: row.full_name,
      dob_year: row.dob_year ? Number(row.dob_year) : null,
      gender: row.gender || null,
      social_category: row.social_category || null,
      nationality_type: row.nationality_type || "indian",
      program: row.program,
      admission_year: Number(row.admission_year),
      admission_date: row.admission_date || null,
    }));
    const query = supabase.from("students");
    const { data, error } = profile.role === "institution_admin"
      ? await query.upsert(formatted, { onConflict: "institution_id,institutional_student_id,admission_year" }).select("id")
      : await query.insert(formatted).select("id");
    if (error?.code === "23505") throw new Error("SATYAPAN_DUPLICATE_UPLOAD");
    if (error || !data) throw new Error("SATYAPAN_UPLOAD_FAILED");
    return { inserted: data.length, mode: "live" as const };
  },
};
