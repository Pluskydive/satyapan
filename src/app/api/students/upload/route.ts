import { dataProvider } from "@/lib/supabase";
import { sanitizeRecordRow } from "@/lib/security";
import { apiFailure, demoApiUnavailable, readJsonBody, RequestInputError, sameOriginFailure } from "@/lib/api-utils";

const MAX_ROWS = 100;
const MAX_BODY_BYTES = 1_000_000;

function validateRows(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new RequestInputError("Select a CSV file with at least one student record.");
  }
  if (value.length > MAX_ROWS) {
    throw new RequestInputError(`A demonstration upload can contain up to ${MAX_ROWS} rows.`);
  }

  const allowed = new Set([
    "apaar_id", "institutional_student_id", "full_name", "dob_year", "gender",
    "social_category", "nationality_type", "program", "admission_year", "admission_date",
  ]);
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new RequestInputError(`Student row ${index + 1} is not a valid record.`);
    }
    const source = item as Record<string, unknown>;
    const row: Record<string, string | number | null> = {};
    for (const [key, raw] of Object.entries(source)) {
      if (!allowed.has(key)) continue;
      if (raw === null || raw === undefined || raw === "") {
        row[key] = null;
        continue;
      }
      if (key === "dob_year" || key === "admission_year") {
        const number = Number(raw);
        if (!Number.isInteger(number) || number < 1900 || number > new Date().getFullYear() + 5) {
          throw new RequestInputError(`Check the year entered in student row ${index + 1}.`);
        }
        row[key] = number;
        continue;
      }
      if (typeof raw !== "string" || raw.length > 160) {
        throw new RequestInputError(`Check the text fields in student row ${index + 1}.`);
      }
      row[key] = raw.trim();
    }

    if (typeof row.institutional_student_id !== "string" || !row.institutional_student_id ||
        typeof row.full_name !== "string" || !row.full_name ||
        typeof row.program !== "string" || !row.program) {
      throw new RequestInputError(`Student row ${index + 1} needs a roll ID, name, and programme.`);
    }
    if (typeof row.admission_year !== "number") {
      throw new RequestInputError(`Student row ${index + 1} needs a valid admission year.`);
    }
    if (row.apaar_id && !/^\d{12}$/.test(String(row.apaar_id))) {
      throw new RequestInputError(`Enter all 12 digits of the APAAR number in student row ${index + 1}, or leave it blank.`);
    }
    if (row.admission_date !== null && row.admission_date !== undefined) {
      const date = String(row.admission_date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
        throw new RequestInputError(`Enter the admission date as YYYY-MM-DD in student row ${index + 1}.`);
      }
    }
    if (row.nationality_type && !["indian", "nri", "oci", "foreign_national"].includes(String(row.nationality_type))) {
      throw new RequestInputError(`Check the nationality category in student row ${index + 1}.`);
    }
    return sanitizeRecordRow(row);
  });
}

export async function POST(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;
  try {
    const body = await readJsonBody<{ rows?: unknown; institution_id?: unknown }>(request, MAX_BODY_BYTES);
    const institutionId = typeof body.institution_id === "string" ? body.institution_id.trim() : "";

    if (!institutionId) {
      throw new RequestInputError("Choose an institution before uploading records.");
    }

    const rows = validateRows(body.rows);
    const result = await dataProvider.uploadStudents(institutionId, rows);

    return Response.json({
      inserted: result.inserted,
      mode: result.mode,
      notice: result.mode === "demo"
        ? "Sample records are held in temporary demonstration memory and are not saved to a database."
        : "Records were submitted to the institution assigned to your account. A review process must verify them before they are treated as confirmed.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't process this upload. Check the file and try again.");
  }
}
