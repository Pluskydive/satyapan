/**
 * SATYAPAN Security, Privacy & Integrity Utilities
 * Digital Personal Data Protection (DPDP) Act 2023 Compliance
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
 * Masks a 12-digit APAAR ID in compliance with DPDP Act 2023.
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
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
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
 * DPDP Act 2023 Selective Disclosure Filter for Employer Verifiers.
 * Strictly withholds personal identifiers (caste, gender, DOB) from third parties.
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
    institution_name: student.institutions?.name || 'Verified AICTE Institution',
    institution_code: student.institutions?.aicte_code || 'AICTE-XXXX',
    verification_standard: 'AICTE-APAAR Enrolment Integrity Standard v2.4',
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
