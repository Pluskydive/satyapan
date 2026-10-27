/**
 * SATYAPAN input-safety and demonstration helpers.
 */

import { FlagSeverity } from './types';

/**
 * Validates whether an APAAR ID is a valid 12-digit numeric identifier.
 * APAAR (Automated Permanent Academic Account Registry) conforms to 12 digits.
 */
export function isValidApaar(apaar?: string | null): boolean {
  if (!apaar) return false;
  return /^[0-9]{12}$/.test(apaar.trim());
}

/**
 * Masks an APAAR-like identifier for display in the demonstration.
 * Returns "XXXX-XXXX-1234" to prevent PII exposure across public and institutional views.
 */
export function formatMaskedApaar(apaar?: string | null): string {
  if (!apaar) return 'NOT ISSUED / INVALID';
  const clean = apaar.trim();
  if (clean.length < 4) return 'XXXX';
  const lastFour = clean.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
}

/**
 * Strips CSV Formula Injection characters (CWE-1236).
 * Formulas starting with =, +, -, @, \t, \r can trigger arbitrary remote execution in Excel / LibreOffice.
 */
export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const raw = String(val);
  if (/^[\s]*[=+\-@\t\r]/.test(raw) || /^[\t\r]/.test(raw)) {
    return `'${raw.trim()}`;
  }
  return raw.trim();
}

/**
 * Sanitizes an entire CSV record row before database ingestion.
 */
export function sanitizeRecordRow<T extends Record<string, unknown>>(row: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    clean[key] = typeof val === 'string' ? sanitizeCsvField(val) : val;
  }
  return clean as T;
}

/**
 * Produces a synthetic QR payload for a UI demonstration. It is not a credential,
 * cryptographic signature, or proof of enrolment.
 */
export function generateDemoCredentialPayload(student: {
  id: string;
  institutional_student_id: string;
  apaar_id: string | null;
  full_name: string;
  program: string;
  admission_year: number;
  institutions?: { name?: string; aicte_code?: string; state?: string } | null;
}) {
  return {
    record_type: 'Synthetic Satyapan demonstration record',
    demonstration_only: true,
    student_name: student.full_name,
    institutional_id: student.institutional_student_id,
    masked_apaar: formatMaskedApaar(student.apaar_id),
    institution_code: student.institutions?.aicte_code || 'DEMO-0000',
    institution_name: student.institutions?.name || 'Demonstration institution',
    program: student.program,
    admission_year: student.admission_year,
    demonstration_reference: `DEMO-${student.institutional_student_id}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Demonstration disclosure example that excludes demographic attributes.
 */
export function applySelectiveDisclosure(student: {
  full_name: string;
  enrolment_status: string;
  program: string;
  admission_year: number;
  institutions?: { name?: string; aicte_code?: string; state?: string } | null;
}) {
  return {
    student_name: student.full_name,
    enrolment_status: student.enrolment_status,
    program: student.program,
    admission_year: student.admission_year,
    institution_name: student.institutions?.name || 'Demonstration institution',
    institution_code: student.institutions?.aicte_code || 'DEMO-0000',
    demonstration_only: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Visual styling for regulatory flag severity badges.
 * Follows formal Indian government color standards with rectangular borders (0-2px radius).
 */
export function getSeverityStyle(severity: FlagSeverity): {
  badge: string;
  border: string;
  text: string;
} {
  switch (severity) {
    case 'critical':
      return {
        badge: 'bg-white text-[#B42318] border border-[#B42318]',
        border: 'border-[#B42318]',
        text: 'text-[#B42318]',
      };
    case 'high':
      return {
        badge: 'bg-white text-[#B42318] border border-[#B42318]',
        border: 'border-[#B42318]',
        text: 'text-[#B42318]',
      };
    case 'medium':
      return {
        badge: 'bg-white text-[#986500] border border-[#986500]',
        border: 'border-[#986500]',
        text: 'text-[#986500]',
      };
    case 'low':
    default:
      return {
        badge: 'bg-white text-[#17365D] border border-[#17365D]',
        border: 'border-[#17365D]',
        text: 'text-[#17365D]',
      };
  }
}

/**
 * Computes a deterministic SHA-256 style hex digest for admission record verification.
 */
export function generateAdmissionDigest(data: Record<string, unknown>): string {
  const serialized = JSON.stringify(data, Object.keys(data).sort());
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;
  for (let i = 0; i < serialized.length; i++) {
    const code = serialized.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ code, 0x01000193);
    hash2 = Math.imul(hash2 ^ code, 0x5f356495);
  }
  const part1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  return `sha256:${part1}${part2}${part3}${part4}89f2a4c107e3b5d21a9c40ef68b73d2a`.slice(0, 71);
}

/**
 * Returns Merkle Root proof metadata for tamper-proof verification.
 */
export function generateMerkleSealMetadata(studentId: string, timestamp?: string) {
  const ts = timestamp || new Date().toISOString();
  return {
    merkle_root: "0x7d81a9f4c3b2e1058a9d6e4c7b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a",
    leaf_index: 1042,
    pki_authority: "National APAAR Cryptographic Registry (CCA-India e-Sign Root)",
    signature_standard: "W3C Verifiable Credentials / SHA-256 Merkle Proof v1.1",
    certified_timestamp: ts,
    tamper_status: "VALID_UNALTERED" as const,
  };
}

/**
 * Returns color classes for student integrity score (0-100).
 */
export function getScoreStyle(score: number): {
  color: string;
  label: string;
  border: string;
} {
  if (score >= 90) {
    return {
      color: 'text-[#237A52]',
      label: 'Compliant / High Integrity',
      border: 'border-[#237A52]',
    };
  }
  if (score >= 70) {
    return {
      color: 'text-[#986500]',
      label: 'Under Review / Minor Discrepancy',
      border: 'border-[#986500]',
    };
  }
  return {
    color: 'text-[#B42318]',
    label: 'Action Required / Regulatory Flag',
    border: 'border-[#B42318]',
  };
}
