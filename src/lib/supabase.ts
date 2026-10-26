import { createClient } from '@supabase/supabase-js';
import { getSatyapanStore } from './mockData';

// Safe URL & Key parsing so createClient never throws an "Invalid supabaseUrl" error
// during static analysis or initial evaluation before real keys are inserted into .env.local
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl =
  rawUrl && rawUrl.startsWith("http") && !rawUrl.includes("your_project_url")
    ? rawUrl
    : "https://placeholder-satyapan.supabase.co";

const rawKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey =
  rawKey && !rawKey.includes("your_") && rawKey.length > 20
    ? rawKey
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-signature-for-satyapan-build";

// Standard Supabase client per Step 18 of build guide
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Checks if live Supabase credentials are configured in the current environment
 */
export function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('your_project_url') || key.includes('your_') || url.includes('placeholder')) {
    return false;
  }
  return true;
}

/**
 * Unified data access helper: Queries Supabase when configured,
 * or effortlessly falls back to Satyapan's high-fidelity in-memory Integrity Engine.
 * This guarantees the system NEVER crashes during SIH live demonstrations.
 */
export const dataProvider = {
  isLive: isLiveSupabaseConfigured(),

  async runIntegrityChecks() {
    if (isLiveSupabaseConfigured()) {
      const { error } = await supabaseAdmin.rpc('run_integrity_checks');
      if (!error) return { success: true, mode: 'supabase_live' };
    }
    // High-Fidelity Local Engine
    const store = getSatyapanStore();
    const result = store.runIntegrityChecks();
    return { success: true, mode: 'local_engine', ...result };
  },

  async getNationalSummary() {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('v_national_summary')
        .select('*')
        .single();
      if (!error && data) return { data, mode: 'supabase_live' };
    }
    const store = getSatyapanStore();
    return { data: store.getNationalSummary(), mode: 'local_engine' };
  },

  async getStateSummary() {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('v_state_summary')
        .select('*');
      if (!error && data) return { data, mode: 'supabase_live' };
    }
    const store = getSatyapanStore();
    return { data: store.getStateSummary(), mode: 'local_engine' };
  },

  async getInstitutionSummary(institutionId?: string) {
    if (isLiveSupabaseConfigured()) {
      let query = supabaseAdmin.from('v_institution_summary').select('*');
      if (institutionId) {
        query = query.or(`id.eq.${institutionId},aicte_code.eq.${institutionId}`);
      }
      const { data, error } = await query;
      if (!error && data) return { data, mode: 'supabase_live' };
    }
    const store = getSatyapanStore();
    return { data: store.getInstitutionSummary(institutionId), mode: 'local_engine' };
  },

  async getOpenFlags() {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('validation_flags')
        .select(`
          *,
          students (
            id,
            full_name,
            apaar_id,
            program,
            integrity_score
          ),
          institutions (
            id,
            name,
            state
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (!error && data) return { data, mode: 'supabase_live' };
    }
    const store = getSatyapanStore();
    const flagsWithRelations = store.flags
      .filter((f) => f.status === 'open')
      .map((f) => {
        const student = store.students.find((s) => s.id === f.student_id);
        const institution = store.institutions.find((i) => i.id === f.institution_id);
        return {
          ...f,
          students: student
            ? {
                id: student.id,
                full_name: student.full_name,
                apaar_id: student.apaar_id,
                program: student.program,
                integrity_score: student.integrity_score,
              }
            : null,
          institutions: institution
            ? {
                id: institution.id,
                name: institution.name,
                state: institution.state,
              }
            : null,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { data: flagsWithRelations, mode: 'local_engine' };
  },

  async getStudentById(idOrInstitutionalId: string) {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('students')
        .select(`
          *,
          institutions (
            id,
            name,
            aicte_code,
            state,
            approved_intake,
            supernumerary_capacity
          )
        `)
        .or(`id.eq.${idOrInstitutionalId},institutional_student_id.eq.${idOrInstitutionalId}`)
        .single();
      if (!error && data) {
        // Also fetch flags
        const { data: flags } = await supabaseAdmin
          .from('validation_flags')
          .select('*')
          .eq('student_id', data.id);
        return { data: { ...data, flags: flags || [] }, mode: 'supabase_live' };
      }
    }
    const store = getSatyapanStore();
    const student = store.students.find(
      (s) => s.id === idOrInstitutionalId || s.institutional_student_id === idOrInstitutionalId
    );
    if (!student) return { data: null, mode: 'local_engine' };
    const institution = store.institutions.find((i) => i.id === student.institution_id);
    const flags = store.flags.filter((f) => f.student_id === student.id);
    return {
      data: {
        ...student,
        institutions: institution,
        flags,
      },
      mode: 'local_engine',
    };
  },

  async uploadStudents(institutionId: string, rows: any[]) {
    if (isLiveSupabaseConfigured()) {
      const formatted = rows.map((r: any) => ({
        apaar_id: r.apaar_id || null,
        institutional_student_id: r.institutional_student_id,
        institution_id: institutionId,
        full_name: r.full_name,
        dob_year: Number(r.dob_year) || null,
        gender: r.gender,
        social_category: r.social_category,
        nationality_type: r.nationality_type || 'indian',
        program: r.program,
        admission_year: Number(r.admission_year),
        admission_date: r.admission_date || null,
        enrolment_status: 'pending_apaar_validation',
      }));

      const { data, error } = await supabaseAdmin
        .from('students')
        .upsert(formatted, {
          onConflict: 'institution_id,institutional_student_id,admission_year',
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      await supabaseAdmin.rpc('run_integrity_checks');
      return { inserted: data?.length ?? 0, mode: 'supabase_live' };
    }

    const store = getSatyapanStore();
    const result = store.upsertStudents(institutionId, rows);
    return { inserted: result.inserted + result.updated, mode: 'local_engine' };
  },
};
