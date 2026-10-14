import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { portfolioService } from './portfolio.service.js';
import {
  updatePortfolioSettingsSchema,
  updatePortfolioCredentialsSchema
} from './portfolio.schemas.js';

export async function getMyPortfolio(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const email = req.user!.email;
    const institutionId = req.user!.institutionId;

    const student = await portfolioService.resolveStudentProfile(userId, email, institutionId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'No student profile found associated with your authenticated account.'
      });
      return;
    }

    const portfolio = await portfolioService.getOrCreatePortfolio(student.id, institutionId);
    const eligibleCredentials = await portfolioService.getMyVerifiedCredentials(student.id, institutionId);

    res.json({
      success: true,
      data: {
        portfolio,
        student: {
          id: student.id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          program: student.program,
          year: student.year,
          departmentName: student.department.name,
          avatar: student.avatar,
          institutionName: student.institution.name,
          institutionShortName: student.institution.shortName
        },
        stats: {
          totalEligible: eligibleCredentials.length,
          totalSelected: portfolio.credentials.length,
          template: portfolio.template,
          visibility: portfolio.visibility
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyPortfolioSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const email = req.user!.email;
    const institutionId = req.user!.institutionId;

    const student = await portfolioService.resolveStudentProfile(userId, email, institutionId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'No student profile found associated with your authenticated account.'
      });
      return;
    }

    const validatedInput = updatePortfolioSettingsSchema.parse(req.body);
    const updated = await portfolioService.updatePortfolioSettings(student.id, institutionId, validatedInput);

    res.json({
      success: true,
      message: 'Portfolio settings updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyCredentials(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const email = req.user!.email;
    const institutionId = req.user!.institutionId;

    const student = await portfolioService.resolveStudentProfile(userId, email, institutionId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'No student profile found associated with your authenticated account.'
      });
      return;
    }

    const credentials = await portfolioService.getMyVerifiedCredentials(student.id, institutionId);

    res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyCredentials(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const email = req.user!.email;
    const institutionId = req.user!.institutionId;

    const student = await portfolioService.resolveStudentProfile(userId, email, institutionId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'No student profile found associated with your authenticated account.'
      });
      return;
    }

    const { credentialIds } = updatePortfolioCredentialsSchema.parse(req.body);
    const updated = await portfolioService.updatePortfolioCredentials(student.id, institutionId, credentialIds);

    res.json({
      success: true,
      message: 'Portfolio credential selections updated successfully.',
      data: {
        selectedCount: updated.length,
        credentials: updated
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicPortfolio(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId) ? rawStudentId[0] : rawStudentId;
    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'Student identifier is required.'
      });
      return;
    }

    const publicPortfolio = await portfolioService.getPublicPortfolio(String(studentId));

    res.json({
      success: true,
      data: publicPortfolio
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }
    console.error('Public portfolio query error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve public portfolio at this time.'
    });
  }
}
