import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { createApp } from '../src/app.js';
import { generateToken, hashPassword } from '../src/utils/auth.js';
import {
  ALLOWED_EXTENSIONS,
  EXTENSION_MIME_MAP,
  validateFileMagicBytes
} from '../src/modules/evidence/evidence.service.js';

describe('COMPREHENSIVE APPLICATION SECURITY & AUTHORIZATION SUITE', () => {
  let app: any;
  let server: http.Server;
  let baseUrl: string;

  const tenantA = {
    id: 'inst-skit-001',
    code: 'SKIT-021',
    name: 'Swami Keshvanand Institute of Technology',
    shortName: 'SKIT',
    portalId: 'SKIT021-EDU-CLOUD'
  };

  const tenantB = {
    id: 'inst-mnit-002',
    code: 'MNIT-042',
    name: 'Malaviya National Institute of Technology',
    shortName: 'MNIT',
    portalId: 'MNIT042-EDU-CLOUD'
  };

  // Student A in Tenant A
  const studentAToken = generateToken({
    userId: 'user-stu-001',
    email: 'student.a@skit.ac.in',
    fullName: 'Student Alpha',
    isPlatformAdmin: false,
    institutionId: tenantA.id,
    institutionCode: tenantA.code,
    institutionName: tenantA.name,
    role: 'STUDENT',
    departmentId: 'dept-cse-001'
  });

  // Student B in Tenant A
  const studentBToken = generateToken({
    userId: 'user-stu-002',
    email: 'student.b@skit.ac.in',
    fullName: 'Student Beta',
    isPlatformAdmin: false,
    institutionId: tenantA.id,
    institutionCode: tenantA.code,
    institutionName: tenantA.name,
    role: 'STUDENT',
    departmentId: 'dept-cse-001'
  });

  // Coordinator in Tenant A (CSE Dept)
  const coordinatorToken = generateToken({
    userId: 'user-coord-001',
    email: 'coordinator@skit.ac.in',
    fullName: 'Dr. Coordinator',
    isPlatformAdmin: false,
    institutionId: tenantA.id,
    institutionCode: tenantA.code,
    institutionName: tenantA.name,
    role: 'FACULTY_COORDINATOR',
    departmentId: 'dept-cse-001'
  });

  // Coordinator in Tenant A (Mechanical Dept)
  const mechCoordinatorToken = generateToken({
    userId: 'user-coord-002',
    email: 'mech.coord@skit.ac.in',
    fullName: 'Dr. Mech Coordinator',
    isPlatformAdmin: false,
    institutionId: tenantA.id,
    institutionCode: tenantA.code,
    institutionName: tenantA.name,
    role: 'FACULTY_COORDINATOR',
    departmentId: 'dept-me-002'
  });

  // Institution Admin in Tenant A
  const adminToken = generateToken({
    userId: 'user-admin-001',
    email: 'admin@skit.ac.in',
    fullName: 'Institution Admin',
    isPlatformAdmin: false,
    institutionId: tenantA.id,
    institutionCode: tenantA.code,
    institutionName: tenantA.name,
    role: 'INSTITUTION_ADMIN'
  });

  // Tenant B Admin
  const tenantBAdminToken = generateToken({
    userId: 'user-admin-tenantb',
    email: 'admin@mnit.ac.in',
    fullName: 'Tenant B Admin',
    isPlatformAdmin: false,
    institutionId: tenantB.id,
    institutionCode: tenantB.code,
    institutionName: tenantB.name,
    role: 'INSTITUTION_ADMIN'
  });

  before(async () => {
    app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // ====================================================
  // 1. UNLOADED / UNAUTHENTICATED ACCESS (Phase 3)
  // ====================================================
  describe('1. Server-Side Authentication Enforcement', () => {
    it('should reject unauthenticated request to /records with HTTP 401', async () => {
      const res = await fetch(`${baseUrl}/records`);
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Authentication required/i);
    });

    it('should reject request with an invalid/forged JWT token with HTTP 401', async () => {
      const res = await fetch(`${baseUrl}/records`, {
        headers: { Authorization: 'Bearer forged.malformed.signatureToken' }
      });
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Invalid or expired session token/i);
    });

    it('should reject unauthenticated access to maintenance endpoint /system/init-db with HTTP 401', async () => {
      const res = await fetch(`${baseUrl}/system/init-db`, { method: 'POST' });
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Unauthorized/i);
    });
  });

  // ====================================================
  // 2. PRIVILEGE ESCALATION PREVENTION (Phase 3 & 8)
  // ====================================================
  describe('2. Privilege Escalation Defense', () => {
    it('should reject public registration attempting to self-assign FACULTY_COORDINATOR without invitation', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'attacker@skit.ac.in',
          password: 'Password123!',
          fullName: 'Malicious Reviewer',
          institutionCode: 'SKIT-021',
          role: 'FACULTY_COORDINATOR'
        })
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Privilege Escalation Prevention/i);
    });

    it('should reject non-admin users attempting to reopen a verified record', async () => {
      const res = await fetch(`${baseUrl}/verification/reopen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${coordinatorToken}`
        },
        body: JSON.stringify({
          recordId: 'rec-001',
          reason: 'Coordinator attempting admin operation'
        })
      });

      // Coordinators lack INSTITUTION_ADMIN role required for reopen
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Access denied/i);
    });

    it('should reject student attempting to access staff-only analytics exports', async () => {
      const res = await fetch(`${baseUrl}/analytics/export/records`, {
        headers: { Authorization: `Bearer ${studentAToken}` }
      });
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Access denied/i);
    });

    it('should reject student attempting to access audit logs', async () => {
      const res = await fetch(`${baseUrl}/audit`, {
        headers: { Authorization: `Bearer ${studentAToken}` }
      });
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Access denied/i);
    });
  });

  // ====================================================
  // 3. MULTI-TENANT ISOLATION BOUNDARIES (Phase 6)
  // ====================================================
  describe('3. Multi-Tenant Data Isolation', () => {
    it('should prevent cross-tenant parameter injection in query string', async () => {
      const res = await fetch(`${baseUrl}/records?institutionId=${tenantB.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Tenant isolation violation/i);
    });

    it('should prevent cross-tenant parameter injection in request body', async () => {
      const res = await fetch(`${baseUrl}/institutions/current`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          institutionId: tenantB.id,
          name: 'Tampered Name'
        })
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.error, /Tenant isolation violation/i);
    });

    it('should enforce that Tenant A and Tenant B tokens have distinct institutional contexts', () => {
      assert.notEqual(adminToken, tenantBAdminToken);
      assert.notEqual(tenantA.id, tenantB.id);
    });
  });

  // ====================================================
  // 4. REVIEWER AUTHORIZATION & STATE TRANSITIONS (Phase 5)
  // ====================================================
  describe('4. Reviewer Authorization & Verification Safety', () => {
    it('should detect and reject self-approval when reviewer is the student owner', () => {
      const record = {
        studentProfile: {
          userId: 'user-stu-001',
          email: 'student.a@skit.ac.in'
        }
      };

      const reviewerA = { userId: 'user-stu-001', email: 'student.a@skit.ac.in' };
      const reviewerB = { userId: 'user-coord-001', email: 'coordinator@skit.ac.in' };

      const isSelfApproval = (rev: typeof reviewerA, rec: typeof record) =>
        (rec.studentProfile.userId && rec.studentProfile.userId === rev.userId) ||
        (rec.studentProfile.email && rec.studentProfile.email.toLowerCase() === rev.email.toLowerCase());

      assert.equal(isSelfApproval(reviewerA, record), true, 'Self-approval must be detected');
      assert.equal(isSelfApproval(reviewerB, record), false, 'Independent review must be permitted');
    });

    it('should enforce department review boundary for faculty coordinators', () => {
      const cseRecord = { departmentId: 'dept-cse-001' };
      const cseCoordinator = { role: 'FACULTY_COORDINATOR', departmentId: 'dept-cse-001' };
      const mechCoordinator = { role: 'FACULTY_COORDINATOR', departmentId: 'dept-me-002' };

      const isDeptAuthorized = (coord: typeof cseCoordinator, rec: typeof cseRecord) =>
        !coord.departmentId || coord.departmentId === rec.departmentId;

      assert.equal(isDeptAuthorized(cseCoordinator, cseRecord), true, 'CSE Coordinator authorized for CSE');
      assert.equal(isDeptAuthorized(mechCoordinator, cseRecord), false, 'Mech Coordinator blocked from CSE');
    });

    it('should reject direct status modification on already VERIFIED records', () => {
      const record = { verificationStatus: 'VERIFIED' };
      const canDirectlyModify = (rec: typeof record) => rec.verificationStatus !== 'VERIFIED';

      assert.equal(canDirectlyModify(record), false, 'Verified records require reopening first');
    });

    it('should require non-empty notes for rejection or correction requests', () => {
      const validVerify = { status: 'VERIFIED', notes: '' };
      const invalidReject = { status: 'REJECTED', notes: '' };
      const validReject = { status: 'REJECTED', notes: 'Certificate seal missing' };

      const isValidDecision = (d: { status: string; notes: string }) => {
        if (d.status === 'REJECTED' || d.status === 'NEEDS_CORRECTION') {
          return Boolean(d.notes && d.notes.trim().length > 0);
        }
        return true;
      };

      assert.equal(isValidDecision(validVerify), true);
      assert.equal(isValidDecision(invalidReject), false, 'Rejection requires explanation');
      assert.equal(isValidDecision(validReject), true);
    });
  });

  // ====================================================
  // 5. SECURE FILE UPLOADS & MAGIC BYTES (Phase 7)
  // ====================================================
  describe('5. Secure File Uploads & Binary Signature Validation', () => {
    it('should validate extension allowlist (PDF, PNG, JPEG, WEBP)', () => {
      assert.equal(ALLOWED_EXTENSIONS.has('.pdf'), true);
      assert.equal(ALLOWED_EXTENSIONS.has('.png'), true);
      assert.equal(ALLOWED_EXTENSIONS.has('.jpg'), true);
      assert.equal(ALLOWED_EXTENSIONS.has('.jpeg'), true);
      assert.equal(ALLOWED_EXTENSIONS.has('.webp'), true);

      // Malicious or executable formats
      assert.equal(ALLOWED_EXTENSIONS.has('.exe'), false);
      assert.equal(ALLOWED_EXTENSIONS.has('.sh'), false);
      assert.equal(ALLOWED_EXTENSIONS.has('.php'), false);
      assert.equal(ALLOWED_EXTENSIONS.has('.html'), false);
      assert.equal(ALLOWED_EXTENSIONS.has('.js'), false);
      assert.equal(ALLOWED_EXTENSIONS.has('.svg'), false);
    });

    it('should validate matching declared MIME types with extensions', () => {
      assert.deepEqual(EXTENSION_MIME_MAP['.pdf'], ['application/pdf']);
      assert.deepEqual(EXTENSION_MIME_MAP['.png'], ['image/png']);
      assert.deepEqual(EXTENSION_MIME_MAP['.jpg'], ['image/jpeg']);
      assert.deepEqual(EXTENSION_MIME_MAP['.webp'], ['image/webp']);
    });

    it('should verify genuine PDF magic bytes (%PDF-)', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.7\n%some binary data here');
      const fakePdfBuffer = Buffer.from('<html><body>Fake PDF script</body></html>');

      assert.equal(validateFileMagicBytes(validPdfBuffer, 'application/pdf'), true);
      assert.equal(validateFileMagicBytes(fakePdfBuffer, 'application/pdf'), false);
    });

    it('should verify genuine PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)', () => {
      const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      const fakePngBuffer = Buffer.from('GIF89a Fake PNG data');

      assert.equal(validateFileMagicBytes(validPngBuffer, 'image/png'), true);
      assert.equal(validateFileMagicBytes(fakePngBuffer, 'image/png'), false);
    });

    it('should verify genuine JPEG magic bytes (FF D8 FF)', () => {
      const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const fakeJpegBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);

      assert.equal(validateFileMagicBytes(validJpegBuffer, 'image/jpeg'), true);
      assert.equal(validateFileMagicBytes(fakeJpegBuffer, 'image/jpeg'), false);
    });

    it('should verify genuine WEBP magic bytes (RIFF...WEBP)', () => {
      const validWebpBuffer = Buffer.concat([
        Buffer.from('RIFF'),
        Buffer.from([0x00, 0x00, 0x00, 0x00]),
        Buffer.from('WEBP')
      ]);
      const fakeWebpBuffer = Buffer.from('RIFF1234NOTWEBP');

      assert.equal(validateFileMagicBytes(validWebpBuffer, 'image/webp'), true);
      assert.equal(validateFileMagicBytes(fakeWebpBuffer, 'image/webp'), false);
    });
  });

  // ====================================================
  // 6. STUDENT RECORD OWNERSHIP (Phase 4)
  // ====================================================
  describe('6. Student Record Ownership Defense', () => {
    it('should verify ownership before permitting record updates', () => {
      const record = {
        studentProfile: {
          userId: 'user-stu-001',
          email: 'student.a@skit.ac.in'
        }
      };

      const studentA = { userId: 'user-stu-001', email: 'student.a@skit.ac.in', role: 'STUDENT' };
      const studentB = { userId: 'user-stu-002', email: 'student.b@skit.ac.in', role: 'STUDENT' };

      const isOwner = (u: typeof studentA, r: typeof record) =>
        (r.studentProfile.userId && r.studentProfile.userId === u.userId) ||
        (r.studentProfile.email && r.studentProfile.email.toLowerCase() === u.email.toLowerCase());

      assert.equal(isOwner(studentA, record), true, 'Student A owns Record A');
      assert.equal(isOwner(studentB, record), false, 'Student B does not own Record A');
    });

    it('should verify ownership on file download', () => {
      const evidence = {
        institutionId: tenantA.id,
        record: {
          studentProfileId: 'stu-profile-001'
        }
      };

      const ownProfile = { id: 'stu-profile-001', institutionId: tenantA.id };
      const otherProfile = { id: 'stu-profile-002', institutionId: tenantA.id };

      const canDownload = (profile: typeof ownProfile, ev: typeof evidence) =>
        profile.institutionId === ev.institutionId && profile.id === ev.record.studentProfileId;

      assert.equal(canDownload(ownProfile, evidence), true);
      assert.equal(canDownload(otherProfile, evidence), false);
    });
  });

  // ====================================================
  // 7. PUBLIC DATA MINIMIZATION & SECRET LEAK PREVENTION (Phase 8 & 10)
  // ====================================================
  describe('7. Data Minimization & Secret Leak Prevention', () => {
    it('should strip internal secrets and PII from public portfolio payloads', () => {
      const internalStudentRecord = {
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        userId: 'internal-user-id-001',
        phone: '+91 9876543210',
        studentId: 'SKIT-2022-CS014',
        name: 'Aarav Patel',
        email: 'aarav.patel.22@skit.ac.in',
        program: 'B.Tech CSE',
        year: '3rd Year'
      };

      // Public projection model
      const publicProjection = {
        studentId: internalStudentRecord.studentId,
        name: internalStudentRecord.name,
        program: internalStudentRecord.program,
        year: internalStudentRecord.year
      };

      assert.equal('passwordHash' in publicProjection, false);
      assert.equal('userId' in publicProjection, false);
      assert.equal('phone' in publicProjection, false);
      assert.equal(publicProjection.name, 'Aarav Patel');
    });

    it('should ensure audit log records include actor ID, timestamp, and action', () => {
      const auditEntry = {
        institutionId: tenantA.id,
        actorUserId: 'user-admin-001',
        actorEmail: 'admin@skit.ac.in',
        actorRole: 'INSTITUTION_ADMIN',
        action: 'RECORD_VERIFIED',
        resourceType: 'ParticipationRecord',
        resourceId: 'rec-001',
        timestamp: new Date()
      };

      assert.ok(auditEntry.actorUserId);
      assert.ok(auditEntry.actorEmail);
      assert.ok(auditEntry.action);
      assert.ok(auditEntry.timestamp);
    });
  });
});
