import { prisma } from '../../db/client.js';
import {
  UpdatePortfolioSettingsInput,
  PublicPortfolioResponse,
  EligibleCredentialItem,
  PublicCredentialItem
} from './portfolio.types.js';

export class PortfolioService {
  /**
   * Resolves the student profile for an authenticated user within a tenant institution.
   */
  async resolveStudentProfile(userId: string, email: string, institutionId: string) {
    let student = await prisma.studentProfile.findFirst({
      where: {
        institutionId,
        userId
      },
      include: {
        department: true,
        institution: true
      }
    });

    if (!student && email) {
      student = await prisma.studentProfile.findFirst({
        where: {
          institutionId,
          email: { equals: email, mode: 'insensitive' }
        },
        include: {
          department: true,
          institution: true
        }
      });
    }

    return student;
  }

  /**
   * Retrieves or creates a default StudentPortfolio for the student.
   */
  async getOrCreatePortfolio(studentProfileId: string, institutionId: string) {
    let portfolio = await prisma.studentPortfolio.findUnique({
      where: { studentProfileId },
      include: {
        credentials: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!portfolio) {
      portfolio = await prisma.studentPortfolio.create({
        data: {
          institutionId,
          studentProfileId,
          template: 'CLEAN_MINIMAL',
          visibility: 'PRIVATE'
        },
        include: {
          credentials: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });
    }

    return portfolio;
  }

  /**
   * Loads all authoritatively verified credentials eligible for portfolio inclusion.
   * Excludes any pending, needs correction, or rejected records.
   */
  async getMyVerifiedCredentials(studentProfileId: string, institutionId: string): Promise<EligibleCredentialItem[]> {
    const portfolio = await this.getOrCreatePortfolio(studentProfileId, institutionId);

    const selectedMap = new Map<string, { displayOrder: number; highlighted: boolean }>();
    for (const cred of portfolio.credentials) {
      selectedMap.set(cred.recordId, {
        displayOrder: cred.displayOrder,
        highlighted: cred.highlighted
      });
    }

    // Only load records with authoritative VERIFIED status for this student in this institution
    const records = await prisma.participationRecord.findMany({
      where: {
        studentProfileId,
        institutionId,
        verificationStatus: 'VERIFIED'
      },
      include: {
        activity: true,
        department: true
      },
      orderBy: {
        participationDate: 'desc'
      }
    });

    return records.map((r, index) => {
      const selected = selectedMap.get(r.id);
      return {
        id: r.id,
        recordNumber: r.recordNumber,
        title: r.activity.name,
        category: r.category,
        participationDate: r.participationDate,
        achievementLevel: r.achievementLevel,
        certificateRef: r.certificateRef,
        description: r.description,
        departmentName: r.department.name,
        verificationStatus: 'VERIFIED',
        isVerified: true,
        isSelected: !!selected,
        displayOrder: selected ? selected.displayOrder : index
      };
    });
  }

  /**
   * Updates portfolio layout template, visibility, and presentation copy.
   */
  async updatePortfolioSettings(
    studentProfileId: string,
    institutionId: string,
    input: UpdatePortfolioSettingsInput
  ) {
    if (input.customSlug) {
      const existing = await prisma.studentPortfolio.findFirst({
        where: {
          customSlug: input.customSlug,
          NOT: { studentProfileId }
        }
      });
      if (existing) {
        throw new Error('Custom shareable URL slug is already taken. Please choose another.');
      }
    }

    const current = await this.getOrCreatePortfolio(studentProfileId, institutionId);
    const isNowPublic = input.visibility === 'PUBLIC';

    const updated = await prisma.studentPortfolio.update({
      where: { id: current.id },
      data: {
        template: input.template,
        visibility: input.visibility,
        headline: input.headline !== undefined ? input.headline : current.headline,
        bio: input.bio !== undefined ? input.bio : current.bio,
        customSlug: input.customSlug !== undefined ? input.customSlug : current.customSlug,
        publishedAt: isNowPublic && !current.publishedAt ? new Date() : current.publishedAt
      },
      include: {
        credentials: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    return updated;
  }

  /**
   * Saves student credential selections and display order.
   * Strictly validates eligibility: only authoritatively VERIFIED records belonging to this
   * student and institution may be selected.
   */
  async updatePortfolioCredentials(
    studentProfileId: string,
    institutionId: string,
    credentialIds: string[]
  ) {
    const portfolio = await this.getOrCreatePortfolio(studentProfileId, institutionId);

    // If empty array, clear selections
    if (credentialIds.length === 0) {
      await prisma.portfolioCredential.deleteMany({
        where: { portfolioId: portfolio.id }
      });
      return [];
    }

    // Verify all requested credential IDs exist, belong to this student, and are VERIFIED
    const validRecords = await prisma.participationRecord.findMany({
      where: {
        id: { in: credentialIds },
        studentProfileId,
        institutionId,
        verificationStatus: 'VERIFIED'
      },
      select: { id: true }
    });

    const validRecordIds = new Set(validRecords.map((r) => r.id));

    // Reject if any invalid/unverified credential was supplied
    const invalidIds = credentialIds.filter((id) => !validRecordIds.has(id));
    if (invalidIds.length > 0) {
      throw new Error(
        `Selection rejected: ${invalidIds.length} credential(s) are either unverified, do not belong to you, or do not exist.`
      );
    }

    // Atomically replace selections in transaction
    await prisma.$transaction(async (tx) => {
      await tx.portfolioCredential.deleteMany({
        where: { portfolioId: portfolio.id }
      });

      for (let i = 0; i < credentialIds.length; i++) {
        await tx.portfolioCredential.create({
          data: {
            portfolioId: portfolio.id,
            recordId: credentialIds[i],
            displayOrder: i
          }
        });
      }
    });

    const refreshed = await prisma.portfolioCredential.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { displayOrder: 'asc' },
      include: {
        record: {
          include: { activity: true, department: true }
        }
      }
    });

    return refreshed;
  }

  /**
   * Fetches public portfolio for an unauthenticated visitor.
   * Returns sanitized public representation ONLY if published.
   * Never leaks internal passwords, tokens, private evidence storage paths, or audit notes.
   */
  async getPublicPortfolio(studentIdentifier: string): Promise<PublicPortfolioResponse> {
    // Lookup student by roll number (e.g. SKIT-2022-CS014), CUID id, or customSlug
    const student = await prisma.studentProfile.findFirst({
      where: {
        OR: [
          { studentId: studentIdentifier },
          { id: studentIdentifier },
          { portfolio: { customSlug: studentIdentifier } }
        ]
      },
      include: {
        institution: true,
        department: true,
        portfolio: {
          include: {
            credentials: {
              orderBy: { displayOrder: 'asc' },
              include: {
                record: {
                  include: {
                    activity: true,
                    department: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student || !student.portfolio) {
      const error: any = new Error('Portfolio not found or has not been created.');
      error.statusCode = 404;
      throw error;
    }

    if (student.portfolio.visibility !== 'PUBLIC') {
      const error: any = new Error('This portfolio is currently private and has not been published.');
      error.statusCode = 403;
      throw error;
    }

    // Filter to ensure only authoritatively VERIFIED records are shown
    const validCredentials: PublicCredentialItem[] = [];

    for (const item of student.portfolio.credentials) {
      const rec = item.record;
      // Active verification check: ensure status has not been revoked or marked pending
      if (rec && rec.verificationStatus === 'VERIFIED') {
        validCredentials.push({
          id: rec.id,
          recordNumber: rec.recordNumber,
          title: rec.activity.name,
          category: rec.category,
          participationDate: rec.participationDate,
          achievementLevel: rec.achievementLevel,
          certificateRef: rec.certificateRef,
          description: rec.description,
          departmentName: rec.department.name,
          issuer: student.institution.shortName,
          isVerified: true,
          verificationBadge: `Authoritatively Verified by ${student.institution.shortName}`
        });
      }
    }

    return {
      student: {
        studentId: student.studentId,
        name: student.name,
        program: student.program,
        year: student.year,
        departmentName: student.department.name,
        avatar: student.avatar,
        headline: student.portfolio.headline,
        bio: student.portfolio.bio || student.bio
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
      credentials: validCredentials
    };
  }
}

export const portfolioService = new PortfolioService();
