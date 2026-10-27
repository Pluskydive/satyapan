/**
 * SATYAPAN High-Fidelity Data Store & In-Memory Integrity Engine
 * Replicates PostgreSQL PL/pgSQL run_integrity_checks() and Views
 * Pre-seeded with the exact SIH Hackathon Demo Dataset (300 students + 4 anomalies)
 */

import {
  Institution,
  Student,
  ValidationFlag,
  VerificationRequest,
  AuditLog,
  AdmissionEvent,
  InstitutionSummary,
  NationalSummary,
  StateSummary,
} from './types';

// Pre-seeded Institutions (Step 10)
export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1001',
    aicte_code: 'AICTE-1001',
    name: 'Sunrise Institute of Technology',
    state: 'Maharashtra',
    district: 'Pune',
    approved_intake: 240,
    supernumerary_capacity: 10,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'inst-1002',
    aicte_code: 'AICTE-1002',
    name: 'Nova Engineering College',
    state: 'Karnataka',
    district: 'Bengaluru',
    approved_intake: 180,
    supernumerary_capacity: 5,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'inst-1003',
    aicte_code: 'AICTE-1003',
    name: 'Ganga Institute of Management',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    approved_intake: 120,
    supernumerary_capacity: 4,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'inst-1004',
    aicte_code: 'AICTE-1004',
    name: 'Deccan Polytechnic',
    state: 'Telangana',
    district: 'Hyderabad',
    approved_intake: 300,
    supernumerary_capacity: 12,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'inst-1005',
    aicte_code: 'AICTE-1005',
    name: 'Kaveri Institute of Technology',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    approved_intake: 200,
    supernumerary_capacity: 8,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Helper to generate 300 baseline students (Step 11)
function generateInitialStudents(): Student[] {
  const students: Student[] = [];
  const inst1 = 'inst-1001';

  for (let i = 1; i <= 300; i++) {
    const rawApaar = (100000000000 + i).toString().padStart(12, '0');
    const gender = i % 2 === 0 ? 'Female' : 'Male';
    const social = i % 4 === 0 ? 'OBC' : i % 4 === 1 ? 'General' : i % 4 === 2 ? 'SC' : 'ST';
    const program = i % 3 === 0 ? 'B.Tech CSE' : i % 3 === 1 ? 'B.Tech ECE' : 'B.Tech Mechanical';
    
    // Admission date: 2026-07-01 + (i % 60) days
    const admDate = new Date(2026, 6, 1 + (i % 60));
    const admDateStr = admDate.toISOString().split('T')[0];

    students.push({
      id: `stu-${i}`,
      apaar_id: rawApaar,
      institutional_student_id: `STU-${i}`,
      institution_id: inst1,
      full_name: `Student ${i}`,
      dob_year: 2004 + (i % 4),
      gender,
      social_category: social,
      nationality_type: 'indian',
      program,
      admission_year: 2026,
      admission_date: admDateStr,
      enrolment_status: 'verified',
      integrity_score: 100,
      created_at: '2026-07-01T08:00:00Z',
      updated_at: '2026-07-01T08:00:00Z',
    });
  }

  // Inject Step 12 Intentional Hackathon Anomalies
  // 12.1 Anomaly 1: Invalid APAAR ID (5 digits instead of 12)
  const stu10 = students.find((s) => s.institutional_student_id === 'STU-10');
  if (stu10) {
    stu10.apaar_id = '12345';
  }

  // 12.2 Anomaly 2: Cross-Institution Overlap (Double Admission)
  // STU-20 also enrolled in Nova Engineering College (AICTE-1002)
  const stu20 = students.find((s) => s.institutional_student_id === 'STU-20');
  if (stu20) {
    students.push({
      id: 'stu-dup-1',
      apaar_id: stu20.apaar_id,
      institutional_student_id: 'STU-DUP-1',
      institution_id: 'inst-1002',
      full_name: stu20.full_name,
      dob_year: stu20.dob_year,
      gender: stu20.gender,
      social_category: stu20.social_category,
      nationality_type: 'indian',
      program: 'B.Tech AI-ML',
      admission_year: 2026,
      admission_date: new Date().toISOString().split('T')[0],
      enrolment_status: 'verified',
      integrity_score: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // 12.3 Anomaly 3: Late admission past October 15 cutoff
  const stu30 = students.find((s) => s.institutional_student_id === 'STU-30');
  if (stu30) {
    stu30.admission_date = '2026-12-01';
  }

  // 12.4 Anomaly 4: Nationality inconsistency (NRI with null social category)
  const stu40 = students.find((s) => s.institutional_student_id === 'STU-40');
  if (stu40) {
    stu40.nationality_type = 'nri';
    stu40.social_category = null;
  }

  return students;
}

// Global in-memory storage singleton for dev/mock runtime
class SatyapanStore {
  institutions: Institution[] = [...INITIAL_INSTITUTIONS];
  students: Student[] = generateInitialStudents();
  flags: ValidationFlag[] = [];
  verificationRequests: VerificationRequest[] = [];
  auditLogs: AuditLog[] = [
    {
      id: 'audit-001',
      actor_role: 'system_integrity_engine',
      action: 'INITIAL_SEED',
      entity: 'institutions_and_students',
      created_at: new Date().toISOString(),
      after_data: { total_institutions: 5, total_students: 301 },
    },
  ];
  admissionEvents: AdmissionEvent[] = [];

  constructor() {
    this.runIntegrityChecks();
    this.seedDemoVerificationRequest();
  }

  seedDemoVerificationRequest() {
    const student = this.students.find((s) => s.institutional_student_id === 'STU-1');
    if (student) {
      this.verificationRequests.push({
        id: 'ver-001',
        student_id: student.id,
        verifier_type: 'TCS Campus Recruitment',
        verifier_name: 'Tata Consultancy Services HR Talent Portal',
        purpose: 'Background check for Software Engineer Graduate Trainee',
        requested_fields: ['enrolment_status', 'program', 'institution_id', 'admission_year'],
        disclosed_fields: {},
        consent_granted: false,
        result: 'pending',
        verification_code: 'SATYA-2026-TCS',
        created_at: new Date().toISOString(),
      });
    }
  }

  // Exact reproduction of run_integrity_checks() PL/pgSQL logic (Step 5)
  runIntegrityChecks(): { flagsCount: number; affectedStudents: number } {
    // 1. Remove open flags
    this.flags = this.flags.filter((f) => f.status !== 'open');

    const newFlags: ValidationFlag[] = [];

    // Rule 1: INVALID_APAAR
    for (const s of this.students) {
      if (!s.apaar_id || !/^[0-9]{12}$/.test(s.apaar_id)) {
        newFlags.push({
          id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          student_id: s.id,
          institution_id: s.institution_id,
          rule_code: 'INVALID_APAAR',
          severity: 'high',
          title: 'Invalid or missing APAAR ID',
          explanation: 'APAAR ID is missing or is not a valid 12-digit identifier.',
          recommended_action: 'Institution should correct the APAAR ID or initiate APAAR creation.',
          status: 'open',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Rule 2: DUPLICATE_APAAR_IN_INSTITUTION
    const apaarInstMap = new Map<string, Student[]>();
    for (const s of this.students) {
      if (!s.apaar_id) continue;
      const key = `${s.apaar_id}___${s.institution_id}`;
      const arr = apaarInstMap.get(key) || [];
      arr.push(s);
      apaarInstMap.set(key, arr);
    }
    for (const [, list] of apaarInstMap.entries()) {
      if (list.length > 1) {
        for (const s of list) {
          newFlags.push({
            id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            student_id: s.id,
            institution_id: s.institution_id,
            rule_code: 'DUPLICATE_APAAR_IN_INSTITUTION',
            severity: 'high',
            title: 'Duplicate APAAR ID within institution',
            explanation: 'The same APAAR ID is used by multiple student records in this institution.',
            recommended_action: 'Merge duplicate records after verification.',
            status: 'open',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Rule 3: CROSS_INSTITUTION_OVERLAP
    const apaarGlobalMap = new Map<string, Set<string>>();
    for (const s of this.students) {
      if (!s.apaar_id) continue;
      if (s.enrolment_status === 'verified' || s.enrolment_status === 'flagged') {
        const set = apaarGlobalMap.get(s.apaar_id) || new Set<string>();
        set.add(s.institution_id);
        apaarGlobalMap.set(s.apaar_id, set);
      }
    }
    for (const [apaar, instSet] of apaarGlobalMap.entries()) {
      if (instSet.size > 1) {
        const matching = this.students.filter(
          (s) => s.apaar_id === apaar && (s.enrolment_status === 'verified' || s.enrolment_status === 'flagged')
        );
        for (const s of matching) {
          newFlags.push({
            id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            student_id: s.id,
            institution_id: s.institution_id,
            rule_code: 'CROSS_INSTITUTION_OVERLAP',
            severity: 'critical',
            title: 'Potential enrolment overlap across institutions',
            explanation: 'The same APAAR ID appears in more than one active institution record.',
            recommended_action: 'Classify as Allowed, Review, or Violation after verification.',
            status: 'open',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Rule 4: EXCESS_ENROLMENT
    const instCountMap = new Map<string, number>();
    for (const s of this.students) {
      if (s.enrolment_status === 'verified' || s.enrolment_status === 'flagged') {
        instCountMap.set(s.institution_id, (instCountMap.get(s.institution_id) || 0) + 1);
      }
    }
    for (const inst of this.institutions) {
      const activeCount = instCountMap.get(inst.id) || 0;
      const allowed = inst.approved_intake + inst.supernumerary_capacity;
      if (activeCount > allowed) {
        // Find students in this institution and flag them
        const instStudents = this.students.filter(
          (s) => s.institution_id === inst.id && (s.enrolment_status === 'verified' || s.enrolment_status === 'flagged')
        );
        for (const s of instStudents) {
          newFlags.push({
            id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            student_id: s.id,
            institution_id: s.institution_id,
            rule_code: 'EXCESS_ENROLMENT',
            severity: 'critical',
            title: 'Enrolment exceeds approved capacity',
            explanation: `Active enrolment (${activeCount}) exceeds approved intake (${inst.approved_intake}) plus supernumerary capacity (${inst.supernumerary_capacity}).`,
            recommended_action: 'AICTE review required; institution must justify additional admissions.',
            status: 'open',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Rule 5: NATIONALITY_INCONSISTENCY
    for (const s of this.students) {
      if (s.nationality_type !== 'indian') {
        if (!s.social_category || s.social_category.trim() === '') {
          newFlags.push({
            id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            student_id: s.id,
            institution_id: s.institution_id,
            rule_code: 'NATIONALITY_INCONSISTENCY',
            severity: 'medium',
            title: 'Nationality/category inconsistency',
            explanation: 'Student is marked NRI, OCI, or Foreign National but category data is missing.',
            recommended_action: 'Request corrected category documentation.',
            status: 'open',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Rule 6: LATE_ADMISSION
    for (const s of this.students) {
      if (s.admission_date && s.admission_year) {
        const cutoff = new Date(s.admission_year, 9, 15); // Month index 9 = October
        const adm = new Date(s.admission_date);
        if (adm > cutoff) {
          newFlags.push({
            id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            student_id: s.id,
            institution_id: s.institution_id,
            rule_code: 'LATE_ADMISSION',
            severity: 'medium',
            title: 'Admission recorded after reporting deadline',
            explanation: 'Admission date is after the standard reporting deadline (October 15).',
            recommended_action: 'Institution must provide approval or correction.',
            status: 'open',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    this.flags.push(...newFlags);

    // Recalculate Student Integrity Scores
    const studentPenaltyMap = new Map<string, number>();
    for (const f of this.flags) {
      if (f.status === 'open') {
        const penalty = f.severity === 'critical' ? 50 : f.severity === 'high' ? 30 : f.severity === 'medium' ? 15 : 5;
        studentPenaltyMap.set(f.student_id, (studentPenaltyMap.get(f.student_id) || 0) + penalty);
      }
    }

    let affected = 0;
    for (const s of this.students) {
      const penalty = studentPenaltyMap.get(s.id) || 0;
      const newScore = Math.max(0, 100 - penalty);
      if (s.integrity_score !== newScore) {
        affected++;
      }
      s.integrity_score = newScore;
      if (s.integrity_score < 70 && s.enrolment_status === 'verified') {
        s.enrolment_status = 'flagged';
      } else if (s.integrity_score >= 70 && s.enrolment_status === 'flagged') {
        s.enrolment_status = 'verified';
      }
    }

    // Add audit log
    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor_role: 'system_integrity_engine',
      action: 'RUN_INTEGRITY_CHECKS',
      entity: 'validation_flags',
      created_at: new Date().toISOString(),
      after_data: { flags_generated: newFlags.length, affected_students: affected },
    });

    return { flagsCount: newFlags.length, affectedStudents: affected };
  }

  // View: v_national_summary (Step 8)
  getNationalSummary(): NationalSummary {
    const reportingInsts = new Set(this.students.map((s) => s.institution_id)).size;
    const total = this.students.length;
    const verified = this.students.filter((s) => s.enrolment_status === 'verified').length;
    const flagged = this.students.filter((s) => s.enrolment_status === 'flagged').length;
    const nri = this.students.filter((s) => s.nationality_type === 'nri').length;
    const oci = this.students.filter((s) => s.nationality_type === 'oci').length;
    const fn = this.students.filter((s) => s.nationality_type === 'foreign_national').length;
    const avgScore = total > 0 ? this.students.reduce((acc, s) => acc + s.integrity_score, 0) / total : 100;

    return {
      institutions_reporting: reportingInsts,
      total_students: total,
      verified_students: verified,
      flagged_students: flagged,
      nri_students: nri,
      oci_students: oci,
      fn_students: fn,
      avg_integrity_score: Number(avgScore.toFixed(1)),
    };
  }

  // View: v_state_summary (Step 9)
  getStateSummary(): StateSummary[] {
    const map = new Map<
      string,
      { insts: Set<string>; students: number; flagged: number; scoreSum: number }
    >();

    for (const inst of this.institutions) {
      if (!map.has(inst.state)) {
        map.set(inst.state, { insts: new Set(), students: 0, flagged: 0, scoreSum: 0 });
      }
      map.get(inst.state)!.insts.add(inst.id);
    }

    for (const s of this.students) {
      const inst = this.institutions.find((i) => i.id === s.institution_id);
      if (inst) {
        const item = map.get(inst.state);
        if (item) {
          item.students++;
          if (s.enrolment_status === 'flagged') item.flagged++;
          item.scoreSum += s.integrity_score;
        }
      }
    }

    const res: StateSummary[] = [];
    for (const [state, d] of map.entries()) {
      const avg = d.students > 0 ? d.scoreSum / d.students : 100;
      res.push({
        state,
        institutions: d.insts.size,
        students: d.students,
        flagged_students: d.flagged,
        avg_integrity_score: Number(avg.toFixed(1)),
      });
    }

    return res.sort((a, b) => b.students - a.students);
  }

  // View: v_institution_summary (Step 7)
  getInstitutionSummary(institutionId?: string): InstitutionSummary[] {
    return this.institutions
      .filter((i) => !institutionId || i.id === institutionId || i.aicte_code === institutionId)
      .map((inst) => {
        const stus = this.students.filter((s) => s.institution_id === inst.id);
        const actual = stus.filter(
          (s) => s.enrolment_status === 'verified' || s.enrolment_status === 'flagged'
        ).length;
        const flagged = stus.filter((s) => s.enrolment_status === 'flagged').length;
        const nri = stus.filter((s) => s.nationality_type === 'nri').length;
        const oci = stus.filter((s) => s.nationality_type === 'oci').length;
        const fn = stus.filter((s) => s.nationality_type === 'foreign_national').length;
        const avgScore = stus.length > 0 ? stus.reduce((a, b) => a + b.integrity_score, 0) / stus.length : 100;

        return {
          id: inst.id,
          aicte_code: inst.aicte_code,
          name: inst.name,
          state: inst.state,
          approved_intake: inst.approved_intake,
          supernumerary_capacity: inst.supernumerary_capacity,
          actual_enrolment: actual,
          flagged_students: flagged,
          nri_students: nri,
          oci_students: oci,
          fn_students: fn,
          avg_integrity_score: Number(avgScore.toFixed(1)),
        };
      });
  }

  // CSV Ingestion logic with deduplication and upsert (Step 22)
  upsertStudents(
    institutionId: string,
    rows: Array<Partial<Student>>
  ): { inserted: number; updated: number } {
    let inserted = 0;
    let updated = 0;

    for (const r of rows) {
      if (!r.institutional_student_id) continue;
      const existing = this.students.find(
        (s) =>
          s.institution_id === institutionId &&
          s.institutional_student_id === r.institutional_student_id &&
          s.admission_year === (r.admission_year || 2026)
      );

      if (existing) {
        Object.assign(existing, {
          ...r,
          institution_id: institutionId,
          updated_at: new Date().toISOString(),
        });
        updated++;
      } else {
        const newStu: Student = {
          id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          apaar_id: r.apaar_id || null,
          institutional_student_id: r.institutional_student_id,
          institution_id: institutionId,
          full_name: r.full_name || 'Enrolled Student',
          dob_year: r.dob_year ? Number(r.dob_year) : null,
          gender: r.gender || 'Other',
          social_category: r.social_category || 'General',
          nationality_type: r.nationality_type || 'indian',
          program: r.program || 'Technical Degree',
          admission_year: Number(r.admission_year) || 2026,
          admission_date: r.admission_date || new Date().toISOString().split('T')[0],
          enrolment_status: 'pending_apaar_validation',
          integrity_score: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.students.push(newStu);
        inserted++;
      }
    }

    // Log to audit
    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor_role: 'institution_staff',
      action: 'CSV_BATCH_UPLOAD',
      entity: 'students',
      created_at: new Date().toISOString(),
      after_data: { institution_id: institutionId, inserted, updated, total_rows: rows.length },
    });

    // Run integrity checks post upload
    this.runIntegrityChecks();

    return { inserted, updated };
  }
}

// Singleton global mock store attached to globalThis in Node to preserve state across API routes
declare global {
  var __SATYAPAN_STORE__: SatyapanStore | undefined;
}

export function getSatyapanStore(): SatyapanStore {
  if (!globalThis.__SATYAPAN_STORE__) {
    globalThis.__SATYAPAN_STORE__ = new SatyapanStore();
  }
  return globalThis.__SATYAPAN_STORE__;
}
