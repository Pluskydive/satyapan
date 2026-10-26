/**
 * SATYAPAN Security, Privacy & Integrity Utilities
 * DPDP Act 2023 Compliance & Zero-Trust Defense Layer
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
 * Masks a 12-digit APAAR ID in compliance with Digital Personal Data Protection Act (DPDP) 2023.
 * Returns "XXXX-XXXX-1234" or "•••• •••• 1234" to prevent PII exposure across verifiers & public views.
 */
export function formatMaskedApaar(apaar?: string | null): string {
  if (!apaar) return 'NOT ISSUED / INVALID';
  const clean = apaar.trim();
  if (clean.length < 4) return '••••';
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
  // If the cell begins with dangerous formula triggers, prepend a single quote to neutralise
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
 * Strictly withholds caste, gender, DOB year, and raw IDs from unconsented third parties.
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
 * UI visual helper for Severity Badges
 */
export function getSeverityStyle(severity: FlagSeverity): {
  badge: string;
  bg: string;
  border: string;
  text: string;
  iconName: string;
} {
  switch (severity) {
    case 'critical':
      return {
        badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/40',
        text: 'text-rose-500',
        iconName: 'AlertOctagon',
      };
    case 'high':
      return {
        badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        text: 'text-amber-500',
        iconName: 'AlertTriangle',
      };
    case 'medium':
      return {
        badge: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/40',
        text: 'text-yellow-500',
        iconName: 'AlertCircle',
      };
    case 'low':
    default:
      return {
        badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/40',
        text: 'text-blue-500',
        iconName: 'Info',
      };
  }
}

/**
 * Returns color classes for student integrity score (0-100)
 */
export function getScoreStyle(score: number): {
  color: string;
  label: string;
  bg: string;
  ring: string;
} {
  if (score >= 90) {
    return {
      color: 'text-emerald-500',
      label: 'Optimal / High Integrity',
      bg: 'bg-emerald-500/10',
      ring: 'ring-emerald-500/30',
    };
  }
  if (score >= 70) {
    return {
      color: 'text-amber-500',
      label: 'Satisfactory / Minor Flags',
      bg: 'bg-amber-500/10',
      ring: 'ring-amber-500/30',
    };
  }
  return {
    color: 'text-rose-500',
    label: 'High Risk / Non-Compliant',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/30',
  };
}
