export type AdmissionStatus =
  | 'draft'
  | 'pending_apaar_validation'
  | 'verified'
  | 'flagged'
  | 'withdrawn'
  | 'migrated';

export type NationalityType =
  | 'indian'
  | 'nri'
  | 'oci'
  | 'foreign_national';

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Institution {
  id: string;
  aicte_code: string;
  name: string;
  state: string;
  district?: string | null;
  approved_intake: number;
  supernumerary_capacity: number;
  status: 'active' | 'suspended' | 'under_review';
  created_at: string;
}

export interface Student {
  id: string;
  apaar_id: string | null;
  institutional_student_id: string;
  institution_id: string;
  full_name: string;
  dob_year?: number | null;
  gender?: string | null;
  social_category?: string | null;
  nationality_type: NationalityType;
  program: string;
  admission_year: number;
  admission_date?: string | null;
  enrolment_status: AdmissionStatus;
  integrity_score: number;
  created_at: string;
  updated_at: string;
  institutions?: Partial<Institution>;
}

export type StudentRosterRecord = Omit<Student, 'apaar_id'> & { masked_apaar: string };

export interface ValidationFlag {
  id: string;
  student_id: string;
  institution_id: string;
  rule_code: string;
  severity: FlagSeverity;
  title: string;
  explanation: string;
  recommended_action: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  students?: Partial<Student> | null;
  institutions?: Partial<Institution> | null;
}

export interface VerificationRequest {
  id: string;
  student_id: string;
  verifier_type: string;
  verifier_name?: string | null;
  purpose: string;
  requested_fields: string[];
  disclosed_fields: Record<string, unknown>;
  consent_granted: boolean;
  result: 'pending' | 'verified' | 'rejected' | 'consent_denied';
  verification_code: string;
  created_at: string;
  students?: Partial<Student>;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_role: 'aicte_admin' | 'institution_staff' | 'verifier_employer' | 'system_integrity_engine' | 'student';
  action: string;
  entity: string;
  entity_id?: string | null;
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
  created_at: string;
}

export interface AdmissionEvent {
  id: string;
  student_id: string;
  institution_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  actor_role: string;
  created_at: string;
}

export interface InstitutionSummary {
  id: string;
  aicte_code: string;
  name: string;
  state: string;
  approved_intake: number;
  supernumerary_capacity: number;
  actual_enrolment: number;
  flagged_students: number;
  nri_students: number;
  oci_students: number;
  fn_students: number;
  avg_integrity_score: number;
}

export interface NationalSummary {
  institutions_reporting: number;
  total_students: number;
  verified_students: number;
  flagged_students: number;
  nri_students: number;
  oci_students: number;
  fn_students: number;
  avg_integrity_score: number;
}

export interface StateSummary {
  state: string;
  institutions: number;
  students: number;
  flagged_students: number;
  avg_integrity_score: number;
}
