import test from "node:test";
import assert from "node:assert/strict";

// Replicate core pure algorithms for isolation testing
function isValidApaar(apaar) {
  if (!apaar) return false;
  return /^[0-9]{12}$/.test(apaar.trim());
}

function formatMaskedApaar(apaar) {
  if (!apaar) return "NOT ISSUED / INVALID";
  const clean = apaar.trim();
  if (clean.length < 4) return "XXXX";
  const lastFour = clean.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
}

function sanitizeCsvField(val) {
  if (val === null || val === undefined) return "";
  const raw = String(val);
  if (/^[\s]*[=+\-@\t\r]/.test(raw) || /^[\t\r]/.test(raw)) {
    return `'${raw.trim()}`;
  }
  return raw.trim();
}

function sanitizeRecordRow(row) {
  const clean = {};
  for (const [key, val] of Object.entries(row)) {
    clean[key] = typeof val === "string" ? sanitizeCsvField(val) : val;
  }
  return clean;
}

function safeNextPath(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

function validatePhoneNumber(countryCode, number) {
  const clean = number.replace(/\D/g, "");
  if (countryCode === "+91") {
    return /^[6-9]\d{9}$/.test(clean);
  }
  return clean.length >= 6 && clean.length <= 15;
}

test("APAAR ID validation conforms to 12 digits", () => {
  assert.equal(isValidApaar("100000000001"), true);
  assert.equal(isValidApaar("987654321098"), true);
  assert.equal(isValidApaar("10000000001"), false, "11 digits must fail");
  assert.equal(isValidApaar("1000000000001"), false, "13 digits must fail");
  assert.equal(isValidApaar("10000000000A"), false, "Alphanumeric must fail");
  assert.equal(isValidApaar(""), false, "Empty must fail");
  assert.equal(isValidApaar(null), false, "Null must fail");
});

test("APAAR ID masking prevents raw PII exposure", () => {
  assert.equal(formatMaskedApaar("100000000001"), "XXXX-XXXX-0001");
  assert.equal(formatMaskedApaar("987654321098"), "XXXX-XXXX-1098");
  assert.equal(formatMaskedApaar(null), "NOT ISSUED / INVALID");
  assert.equal(formatMaskedApaar(""), "NOT ISSUED / INVALID");
});

test("CSV formula injection mitigation neutralizes CWE-1236 triggers", () => {
  assert.equal(sanitizeCsvField("=SUM(A1:A10)"), "'=SUM(A1:A10)");
  assert.equal(sanitizeCsvField("+cmd|' /C calc'!A0"), "'+cmd|' /C calc'!A0");
  assert.equal(sanitizeCsvField("-2+3*cmd"), "'-2+3*cmd");
  assert.equal(sanitizeCsvField("@SUM(1,2)"), "'@SUM(1,2)");
  assert.equal(sanitizeCsvField("\tTabAttack"), "'TabAttack");
  assert.equal(sanitizeCsvField("\rReturnAttack"), "'ReturnAttack");
  assert.equal(sanitizeCsvField("   =SPACED_FORMULA()"), "'=SPACED_FORMULA()");
  assert.equal(sanitizeCsvField("Standard Student Name"), "Standard Student Name");
  assert.equal(sanitizeCsvField("1234567890"), "1234567890");
});

test("sanitizeRecordRow protects every column in a record", () => {
  const row = {
    full_name: "=cmd|' /C calc'!A0",
    roll_id: "+STU-100",
    program: "@BTech",
    year: 2026,
    safe_val: "Valid Value",
  };
  const sanitized = sanitizeRecordRow(row);
  assert.equal(sanitized.full_name, "'=cmd|' /C calc'!A0");
  assert.equal(sanitized.roll_id, "'+STU-100");
  assert.equal(sanitized.program, "'@BTech");
  assert.equal(sanitized.year, 2026);
  assert.equal(sanitized.safe_val, "Valid Value");
});

test("Safe redirect path blocks Open Redirect and path traversal", () => {
  assert.equal(safeNextPath("/aicte"), "/aicte");
  assert.equal(safeNextPath("/institution"), "/institution");
  assert.equal(safeNextPath("//evil.com"), "/", "Protocol-relative URL must be neutralized");
  assert.equal(safeNextPath("https://evil.com"), "/", "External absolute URL must be neutralized");
  assert.equal(safeNextPath("/\\evil.com"), "/", "Backslash tricks must be neutralized");
  assert.equal(safeNextPath(""), "/");
  assert.equal(safeNextPath(null), "/");
});

test("Phone number validation enforces Indian and international standards", () => {
  assert.equal(validatePhoneNumber("+91", "9876543210"), true, "Valid Indian 10-digit mobile");
  assert.equal(validatePhoneNumber("+91", "8123456789"), true, "Valid 8-prefix mobile");
  assert.equal(validatePhoneNumber("+91", "7000000000"), true, "Valid 7-prefix mobile");
  assert.equal(validatePhoneNumber("+91", "6999999999"), true, "Valid 6-prefix mobile");
  assert.equal(validatePhoneNumber("+91", "5555555555"), false, "Invalid 5-prefix Indian mobile");
  assert.equal(validatePhoneNumber("+91", "987654321"), false, "Short Indian number");
  assert.equal(validatePhoneNumber("+91", "98765432100"), false, "Long Indian number");
  assert.equal(validatePhoneNumber("+1", "4155552671"), true, "Valid US 10-digit");
  assert.equal(validatePhoneNumber("+44", "7911123456"), true, "Valid UK 10-digit");
});
