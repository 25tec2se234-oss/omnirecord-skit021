import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../../db/client.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie
} from '../../utils/auth.js';
import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
  changePasswordSchema
} from './auth.schemas.js';
import { AuthenticatedRequest, AuthUserPayload } from '../../types/index.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, institutionCode } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: {
            institution: true
          }
        }
      }
    });

    // Generic error to avoid email enumeration
    const invalidCredentialsResponse = () => {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    };

    if (!user || !user.isActive) {
      invalidCredentialsResponse();
      return;
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      invalidCredentialsResponse();
      return;
    }

    // Determine target institution membership
    let targetMembership = user.memberships[0];

    if (institutionCode) {
      const specific = user.memberships.find(
        (m) => m.institution.code.toLowerCase() === institutionCode.toLowerCase()
      );
      if (specific) {
        targetMembership = specific;
      }
    }

    if (!user.isPlatformAdmin && (!targetMembership || targetMembership.status !== 'ACTIVE')) {
      res.status(403).json({
        success: false,
        error: 'Your account does not have an active institutional membership.'
      });
      return;
    }

    const tokenPayload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      isPlatformAdmin: user.isPlatformAdmin,
      institutionId: targetMembership?.institutionId || 'platform',
      institutionCode: targetMembership?.institution.code || 'PLATFORM',
      institutionName: targetMembership?.institution.name || 'Platform Admin',
      role: targetMembership?.role || 'PLATFORM_SUPER_ADMIN',
      departmentId: targetMembership?.departmentId
    };

    const token = generateToken(tokenPayload);
    setAuthCookie(res, token);

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: targetMembership?.institutionId,
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: tokenPayload.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        action: 'USER_LOGIN',
        resourceType: 'User',
        resourceId: user.id,
        afterState: { loggedInAt: new Date().toISOString() }
      }
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          isPlatformAdmin: user.isPlatformAdmin,
          role: tokenPayload.role,
          institution: targetMembership
            ? {
                id: targetMembership.institution.id,
                code: targetMembership.institution.code,
                name: targetMembership.institution.name,
                shortName: targetMembership.institution.shortName,
                portalId: targetMembership.institution.portalId
              }
            : null
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const institution = await prisma.institution.findUnique({
      where: { code: data.institutionCode }
    });

    if (!institution || institution.status !== 'ACTIVE') {
      res.status(404).json({
        success: false,
        error: 'Institution not found or inactive.'
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
      return;
    }

    let departmentId: string | undefined;
    if (data.departmentCode) {
      const dept = await prisma.department.findUnique({
        where: {
          institutionId_code: {
            institutionId: institution.id,
            code: data.departmentCode
          }
        }
      });
      if (dept) {
        departmentId = dept.id;
      }
    }

    const passwordHash = await hashPassword(data.password);

    // Create user and membership in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          emailVerified: true // Set true for demo/local onboarding
        }
      });

      await tx.institutionMembership.create({
        data: {
          institutionId: institution.id,
          userId: user.id,
          role: data.role,
          departmentId,
          status: 'ACTIVE'
        }
      });

      // If registering as a student with roll number and dept, create student profile
      if (data.role === 'STUDENT' && data.studentId && departmentId) {
        await tx.studentProfile.create({
          data: {
            institutionId: institution.id,
            userId: user.id,
            studentId: data.studentId,
            name: data.fullName,
            email: user.email,
            departmentId,
            program: 'Undergraduate Program',
            year: '1st Year',
            phone: data.phone
          }
        });
      }

      return user;
    });

    const tokenPayload: AuthUserPayload = {
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      isPlatformAdmin: false,
      institutionId: institution.id,
      institutionCode: institution.code,
      institutionName: institution.name,
      role: data.role,
      departmentId
    };

    const token = generateToken(tokenPayload);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: data.role,
          institution: {
            id: institution.id,
            code: institution.code,
            name: institution.name,
            shortName: institution.shortName
          }
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
        isPlatformAdmin: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        user,
        role: req.user.role,
        departmentId: req.user.departmentId,
        institution: req.tenant || {
          id: req.user.institutionId,
          code: req.user.institutionCode,
          name: req.user.institutionName
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = resetPasswordRequestSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt: resetExpires
        }
      });

      // In production, send email with reset link. In dev/test, return token in sanitized log.
      console.log(`🔑 Password reset token generated for ${user.email}: ${resetToken}`);
    }

    // Always respond with success to prevent email discovery
    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.'
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = resetPasswordConfirmSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Password reset token is invalid or has expired.'
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null
      }
    });

    res.json({
      success: true,
      message: 'Password reset successful. You may now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
}
