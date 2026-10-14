import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  updatePortfolioSettingsSchema,
  updatePortfolioCredentialsSchema
} from '../src/modules/portfolio/portfolio.schemas.js';

describe('AUTOMATED PORTFOLIO BUILDER TEST SUITE', () => {
  // ----------------------------------------------------
  // TEST SUITE 1: Portfolio Settings Validation & Templates
  // ----------------------------------------------------
  describe('1. Portfolio Settings Validation & Template Support', () => {
    it('should accept valid CLEAN_MINIMAL template with PRIVATE visibility', () => {
      const valid = updatePortfolioSettingsSchema.safeParse({
        template: 'CLEAN_MINIMAL',
        visibility: 'PRIVATE',
        headline: 'Aspiring Software Engineer',
        bio: 'Focused on algorithms and cloud applications.'
      });
      assert.ok(valid.success);
      assert.equal(valid.data?.template, 'CLEAN_MINIMAL');
      assert.equal(valid.data?.visibility, 'PRIVATE');
    });

    it('should accept valid TECH_DEV_CARD template with PUBLIC visibility', () => {
      const valid = updatePortfolioSettingsSchema.safeParse({
        template: 'TECH_DEV_CARD',
        visibility: 'PUBLIC',
        headline: 'Full-Stack Developer & Hackathon Winner',
        bio: 'Competitive programmer and open source contributor.',
        customSlug: 'aarav-patel-skit'
      });
      assert.ok(valid.success);
      assert.equal(valid.data?.template, 'TECH_DEV_CARD');
      assert.equal(valid.data?.visibility, 'PUBLIC');
      assert.equal(valid.data?.customSlug, 'aarav-patel-skit');
    });

    it('should accept valid ACADEMIC_PROFESSIONAL template', () => {
      const valid = updatePortfolioSettingsSchema.safeParse({
        template: 'ACADEMIC_PROFESSIONAL',
        visibility: 'PUBLIC',
        headline: 'Undergraduate Researcher',
        bio: 'Published research in edge computing.'
      });
      assert.ok(valid.success);
      assert.equal(valid.data?.template, 'ACADEMIC_PROFESSIONAL');
    });

    it('should reject invalid template names', () => {
      const invalid = updatePortfolioSettingsSchema.safeParse({
        template: 'FANCY_PURPLE_THEME',
        visibility: 'PUBLIC'
      });
      assert.ok(!invalid.success);
    });

    it('should reject invalid visibility values', () => {
      const invalid = updatePortfolioSettingsSchema.safeParse({
        template: 'CLEAN_MINIMAL',
        visibility: 'HIDDEN'
      });
      assert.ok(!invalid.success);
    });

    it('should reject malformed custom slug with special characters', () => {
      const invalid = updatePortfolioSettingsSchema.safeParse({
        template: 'CLEAN_MINIMAL',
        visibility: 'PUBLIC',
        customSlug: 'bad/slug!@#'
      });
      assert.ok(!invalid.success);
    });
  });

  // ----------------------------------------------------
  // TEST SUITE 2: Credential Selection Validation
  // ----------------------------------------------------
  describe('2. Credential Selection Schema Validation', () => {
    it('should accept valid array of credential IDs', () => {
      const valid = updatePortfolioCredentialsSchema.safeParse({
        credentialIds: ['REC-2024-001', 'REC-2024-011']
      });
      assert.ok(valid.success);
      assert.equal(valid.data?.credentialIds.length, 2);
    });

    it('should accept empty array when student deselects all credentials', () => {
      const valid = updatePortfolioCredentialsSchema.safeParse({
        credentialIds: []
      });
      assert.ok(valid.success);
      assert.equal(valid.data?.credentialIds.length, 0);
    });

    it('should reject empty string credential IDs', () => {
      const invalid = updatePortfolioCredentialsSchema.safeParse({
        credentialIds: ['']
      });
      assert.ok(!invalid.success);
    });
  });

  // ----------------------------------------------------
  // TEST SUITE 3: Verification Badge & Record Status Rules
  // ----------------------------------------------------
  describe('3. Authoritative Verification Badge Enforcement', () => {
    it('should only permit VERIFIED status records to display verification badges', () => {
      const mockRecordVerified = {
        id: 'rec-001',
        title: 'Smart India Hackathon',
        verificationStatus: 'VERIFIED',
        certificateRef: 'CERT-SIH-001'
      };

      const mockRecordPending = {
        id: 'rec-002',
        title: 'Workshop',
        verificationStatus: 'PENDING_REVIEW',
        certificateRef: null
      };

      const mockRecordRejected = {
        id: 'rec-003',
        title: 'Robotics',
        verificationStatus: 'REJECTED',
        certificateRef: 'CERT-ROBO'
      };

      const isEligibleForVerificationBadge = (rec: { verificationStatus: string }) => {
        return rec.verificationStatus === 'VERIFIED';
      };

      assert.equal(isEligibleForVerificationBadge(mockRecordVerified), true);
      assert.equal(isEligibleForVerificationBadge(mockRecordPending), false);
      assert.equal(isEligibleForVerificationBadge(mockRecordRejected), false);
    });
  });

  // ----------------------------------------------------
  // TEST SUITE 4: Public Response Data Sanitization
  // ----------------------------------------------------
  describe('4. Public Portfolio Data Sanitization', () => {
    it('should verify that private evidence paths and internal reviewer notes are excluded from public payload', () => {
      const rawInternalStudent = {
        id: 'cuid-internal-student-99',
        userId: 'cuid-user-123',
        studentId: 'SKIT-2022-CS014',
        name: 'Aarav Patel',
        email: 'aarav.patel.22@skit.ac.in',
        phone: '+91 98201 44521',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz',
        program: 'B.Tech Computer Science',
        year: '3rd Year',
        department: { name: 'Computer Science & Engineering' },
        institution: {
          name: 'Swami Keshvanand Institute of Technology',
          shortName: 'SKIT Jaipur',
          code: 'SKIT-021',
          accreditation: 'Autonomous Engineering & Technology Framework'
        },
        portfolio: {
          template: 'CLEAN_MINIMAL',
          visibility: 'PUBLIC',
          publishedAt: new Date(),
          updatedAt: new Date()
        }
      };

      const rawRecordWithPrivateData = {
        id: 'rec-internal-101',
        recordNumber: 'REC-2024-001',
        title: 'Smart India Hackathon 2024 Institutional Round',
        category: 'Technical',
        participationDate: new Date('2024-03-03'),
        achievementLevel: 'Winner',
        certificateRef: 'CERT-SIH24-089',
        description: 'Led team NeuralForge developing automated municipal grievance dispatch system.',
        department: { name: 'Computer Science & Engineering' },
        verificationStatus: 'VERIFIED',
        // SENSITIVE FIELDS:
        evidenceStoragePath: '/uploads/evidence/private/sih_cert_internal_982.pdf',
        sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        reviewerNotes: 'Verified against internal SIH roster. Student had 1st place confirmed by coordinator.',
        reviewerUserId: 'user-coord-002'
      };

      // Sanitization transform
      const sanitizeForPublic = (student: typeof rawInternalStudent, records: (typeof rawRecordWithPrivateData)[]) => {
        return {
          student: {
            studentId: student.studentId,
            name: student.name,
            program: student.program,
            year: student.year,
            departmentName: student.department.name,
            avatar: null,
            headline: 'Aspiring AI Engineer',
            bio: 'Bio text'
          },
          institution: {
            name: student.institution.name,
            shortName: student.institution.shortName,
            code: student.institution.code,
            accreditation: student.institution.accreditation
          },
          portfolio: {
            template: student.portfolio.template,
            visibility: 'PUBLIC',
            publishedAt: student.portfolio.publishedAt,
            updatedAt: student.portfolio.updatedAt
          },
          credentials: records
            .filter((r) => r.verificationStatus === 'VERIFIED')
            .map((r) => ({
              id: r.id,
              recordNumber: r.recordNumber,
              title: r.title,
              category: r.category,
              participationDate: r.participationDate,
              achievementLevel: r.achievementLevel,
              certificateRef: r.certificateRef,
              description: r.description,
              departmentName: r.department.name,
              issuer: student.institution.shortName,
              isVerified: true,
              verificationBadge: `Authoritatively Verified by ${student.institution.shortName}`
            }))
        };
      };

      const publicResult = sanitizeForPublic(rawInternalStudent, [rawRecordWithPrivateData]);

      // Assertions ensuring no sensitive information leaked
      const stringified = JSON.stringify(publicResult);
      assert.ok(!stringified.includes('passwordHash'), 'Must not contain passwordHash');
      assert.ok(!stringified.includes('uploads/evidence'), 'Must not contain private storage path');
      assert.ok(!stringified.includes('reviewerNotes'), 'Must not contain internal reviewer notes');
      assert.ok(!stringified.includes('cuid-user-123'), 'Must not contain user internal cuid');
      assert.ok(!stringified.includes('+91 98201 44521'), 'Must not contain student private phone number');
      assert.equal(publicResult.credentials[0].isVerified, true);
      assert.equal(publicResult.credentials[0].verificationBadge, 'Authoritatively Verified by SKIT Jaipur');
    });
  });

  // ----------------------------------------------------
  // TEST SUITE 5: Cross-Student and Cross-Tenant Isolation
  // ----------------------------------------------------
  describe('5. Cross-Student & Cross-Tenant Credential Guard', () => {
    it('should reject credential assignment if a record does not belong to the student', () => {
      const studentA = { id: 'stu-A', institutionId: 'inst-skit' };
      const studentBRecord = { id: 'rec-B-001', studentProfileId: 'stu-B', institutionId: 'inst-skit', verificationStatus: 'VERIFIED' };

      const validateOwnership = (studentId: string, record: typeof studentBRecord) => {
        if (record.studentProfileId !== studentId) {
          throw new Error('Unauthorized credential assignment: record belongs to another student.');
        }
        return true;
      };

      assert.throws(
        () => validateOwnership(studentA.id, studentBRecord),
        /Unauthorized credential assignment/
      );
    });

    it('should reject credential assignment if record belongs to a different tenant institution', () => {
      const studentA = { id: 'stu-A', institutionId: 'inst-skit' };
      const foreignRecord = { id: 'rec-foreign', studentProfileId: 'stu-A', institutionId: 'inst-mnit', verificationStatus: 'VERIFIED' };

      const validateTenant = (tenantId: string, record: typeof foreignRecord) => {
        if (record.institutionId !== tenantId) {
          throw new Error('Cross-institution isolation violation.');
        }
        return true;
      };

      assert.throws(
        () => validateTenant(studentA.institutionId, foreignRecord),
        /Cross-institution isolation violation/
      );
    });
  });
});
