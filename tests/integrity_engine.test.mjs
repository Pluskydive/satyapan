import test from "node:test";
import assert from "node:assert/strict";

function detectMultipleInstitutions(students) {
  const apaarMap = new Map();
  const flags = [];

  for (const s of students) {
    if (!s.apaar_id) continue;
    if (!apaarMap.has(s.apaar_id)) {
      apaarMap.set(s.apaar_id, []);
    }
    apaarMap.get(s.apaar_id).push(s);
  }

  for (const [apaar, list] of apaarMap.entries()) {
    const instIds = new Set(list.map((item) => item.institution_id));
    if (instIds.size > 1) {
      flags.push({
        rule: "MULTIPLE_INSTITUTIONS_SAME_ACADEMIC_YEAR",
        severity: "critical",
        apaar,
        count: list.length,
      });
    }
  }

  return flags;
}

function detectIntakeExceeded(institutions, students) {
  const flags = [];
  const instMap = new Map();

  for (const s of students) {
    instMap.set(s.institution_id, (instMap.get(s.institution_id) || 0) + 1);
  }

  for (const inst of institutions) {
    const count = instMap.get(inst.id) || 0;
    const capacity = inst.approved_intake + (inst.supernumerary_capacity || 0);
    if (count > capacity) {
      flags.push({
        rule: "INTAKE_LIMIT_EXCEEDED",
        severity: "high",
        institution_id: inst.id,
        excess: count - capacity,
      });
    }
  }

  return flags;
}

function calculateIntegrityScore(penalties) {
  const totalPenalty = penalties.reduce((sum, p) => {
    const cost = p === "critical" ? 50 : p === "high" ? 30 : p === "medium" ? 15 : 5;
    return sum + cost;
  }, 0);
  return Math.max(0, 100 - totalPenalty);
}

test("Integrity Engine detects duplicate student enrolment across multiple institutions", () => {
  const testStudents = [
    { id: "s1", apaar_id: "100000000001", institution_id: "inst-1001" },
    { id: "s2", apaar_id: "100000000001", institution_id: "inst-1002" }, // Duplicate APAAR in another college!
    { id: "s3", apaar_id: "100000000002", institution_id: "inst-1001" },
  ];

  const flags = detectMultipleInstitutions(testStudents);
  assert.equal(flags.length, 1);
  assert.equal(flags[0].rule, "MULTIPLE_INSTITUTIONS_SAME_ACADEMIC_YEAR");
  assert.equal(flags[0].severity, "critical");
  assert.equal(flags[0].apaar, "100000000001");
});

test("Integrity Engine flags colleges exceeding approved intake capacity", () => {
  const institutions = [
    { id: "inst-1", approved_intake: 2, supernumerary_capacity: 1 }, // Total 3
    { id: "inst-2", approved_intake: 5, supernumerary_capacity: 0 }, // Total 5
  ];

  const students = [
    { id: "s1", institution_id: "inst-1" },
    { id: "s2", institution_id: "inst-1" },
    { id: "s3", institution_id: "inst-1" },
    { id: "s4", institution_id: "inst-1" }, // 4th student exceeds 3!
    { id: "s5", institution_id: "inst-2" },
    { id: "s6", institution_id: "inst-2" },
  ];

  const flags = detectIntakeExceeded(institutions, students);
  assert.equal(flags.length, 1);
  assert.equal(flags[0].institution_id, "inst-1");
  assert.equal(flags[0].excess, 1);
});

test("Integrity score calculation correctly reflects penalty severities", () => {
  assert.equal(calculateIntegrityScore([]), 100, "Clean record has 100 score");
  assert.equal(calculateIntegrityScore(["low"]), 95);
  assert.equal(calculateIntegrityScore(["medium"]), 85);
  assert.equal(calculateIntegrityScore(["high"]), 70);
  assert.equal(calculateIntegrityScore(["critical"]), 50);
  assert.equal(calculateIntegrityScore(["critical", "high", "medium"]), 5, "Accumulated penalties deducted");
  assert.equal(calculateIntegrityScore(["critical", "critical", "critical"]), 0, "Floor at 0");
});
