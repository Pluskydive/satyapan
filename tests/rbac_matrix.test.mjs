import test from "node:test";
import assert from "node:assert/strict";

/**
 * SATYAPAN Role-Based Access Control (RBAC) Permission Matrix
 *
 * Roles:
 * 1. platform_admin (Platform Administrator)
 * 2. institution_admin (Institution Administrator / Registrar)
 * 3. institution_staff (Institution Staff)
 * 4. reviewer (Reviewer / Auditor)
 * 5. public_verifier (Public / Employer Verifier)
 */

const ROLE_PERMISSIONS = {
  platform_admin: {
    canViewNationalDashboard: true,
    canRunIntegrityEngine: true,
    canViewAllInstitutions: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canUploadStudentsAnyInstitution: false, // strictly scoped
    canConfigureAnyInstitutionApiKey: true,
    canVerifyPublicCredentials: true,
  },
  institution_admin: {
    canViewNationalDashboard: true, // read overview
    canRunIntegrityEngine: false, // central only
    canViewAllInstitutions: false, // scoped to assigned inst
    canManageUsers: false, // platform admin only
    canViewAuditLogs: false, // platform admin / reviewer only
    canUploadStudentsOwnInstitution: true,
    canConfigureOwnInstitutionApiKey: true,
    canVerifyPublicCredentials: true,
  },
  institution_staff: {
    canViewNationalDashboard: true,
    canRunIntegrityEngine: false,
    canViewAllInstitutions: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canUploadStudentsOwnInstitution: true,
    canConfigureOwnInstitutionApiKey: false, // admin only
    canVerifyPublicCredentials: true,
  },
  reviewer: {
    canViewNationalDashboard: true,
    canRunIntegrityEngine: false,
    canViewAllInstitutions: true, // read-only across institutions
    canManageUsers: false,
    canViewAuditLogs: true, // read audit history
    canUploadStudentsOwnInstitution: false,
    canConfigureOwnInstitutionApiKey: false,
    canVerifyPublicCredentials: true,
  },
  public_verifier: {
    canViewNationalDashboard: false,
    canRunIntegrityEngine: false,
    canViewAllInstitutions: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canUploadStudentsOwnInstitution: false,
    canConfigureOwnInstitutionApiKey: false,
    canVerifyPublicCredentials: true,
  },
};

function checkPermission(role, action) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return Boolean(perms[action]);
}

function checkInstitutionAccess(user, targetInstitutionId) {
  if (user.role === "platform_admin" || user.role === "reviewer") {
    return true; // global read oversight
  }
  if (user.role === "institution_admin" || user.role === "institution_staff") {
    return user.institution_id === targetInstitutionId;
  }
  return false;
}

test("Platform Administrator has full governance and audit access", () => {
  assert.equal(checkPermission("platform_admin", "canViewNationalDashboard"), true);
  assert.equal(checkPermission("platform_admin", "canRunIntegrityEngine"), true);
  assert.equal(checkPermission("platform_admin", "canManageUsers"), true);
  assert.equal(checkPermission("platform_admin", "canViewAuditLogs"), true);
  assert.equal(checkPermission("platform_admin", "canViewAllInstitutions"), true);
});

test("Institution Administrator is strictly isolated to assigned institution", () => {
  const adminA = { role: "institution_admin", institution_id: "inst-1001" };
  assert.equal(checkPermission("institution_admin", "canManageUsers"), false);
  assert.equal(checkPermission("institution_admin", "canRunIntegrityEngine"), false);
  assert.equal(checkPermission("institution_admin", "canViewAuditLogs"), false);
  assert.equal(checkInstitutionAccess(adminA, "inst-1001"), true, "Access own institution");
  assert.equal(checkInstitutionAccess(adminA, "inst-1002"), false, "Cannot access institution B");
});

test("Institution Staff cannot configure API keys or manage users", () => {
  const staffA = { role: "institution_staff", institution_id: "inst-1001" };
  assert.equal(checkPermission("institution_staff", "canConfigureOwnInstitutionApiKey"), false);
  assert.equal(checkPermission("institution_staff", "canManageUsers"), false);
  assert.equal(checkPermission("institution_staff", "canUploadStudentsOwnInstitution"), true);
  assert.equal(checkInstitutionAccess(staffA, "inst-1001"), true);
  assert.equal(checkInstitutionAccess(staffA, "inst-1002"), false);
});

test("Reviewer has read-only oversight without mutation privileges", () => {
  const reviewer = { role: "reviewer", institution_id: null };
  assert.equal(checkPermission("reviewer", "canViewAuditLogs"), true);
  assert.equal(checkPermission("reviewer", "canViewAllInstitutions"), true);
  assert.equal(checkPermission("reviewer", "canRunIntegrityEngine"), false);
  assert.equal(checkPermission("reviewer", "canManageUsers"), false);
  assert.equal(checkPermission("reviewer", "canUploadStudentsOwnInstitution"), false);
  assert.equal(checkInstitutionAccess(reviewer, "inst-1001"), true, "Global read allowed");
});

test("Public Verifier is denied access to internal dashboards and audit records", () => {
  const publicUser = { role: "public_verifier", institution_id: null };
  assert.equal(checkPermission("public_verifier", "canVerifyPublicCredentials"), true);
  assert.equal(checkPermission("public_verifier", "canViewNationalDashboard"), false);
  assert.equal(checkPermission("public_verifier", "canViewAuditLogs"), false);
  assert.equal(checkPermission("public_verifier", "canManageUsers"), false);
  assert.equal(checkInstitutionAccess(publicUser, "inst-1001"), false);
});
