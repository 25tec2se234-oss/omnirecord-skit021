import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';

export async function getCurrentSubscription(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;

    let subscription = await prisma.subscription.findUnique({
      where: { institutionId },
      include: {
        events: {
          orderBy: { processedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!subscription) {
      // Create initial trial/community subscription if missing
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      subscription = await prisma.subscription.create({
        data: {
          institutionId,
          plan: 'CAMPUS_PRO',
          status: 'ACTIVE',
          currentPeriodEnd: oneYearFromNow,
          maxStudents: 5000,
          maxActivities: 1000
        },
        include: { events: true }
      });
    }

    const [currentStudentsCount, currentActivitiesCount] = await Promise.all([
      prisma.studentProfile.count({ where: { institutionId, status: 'ACTIVE' } }),
      prisma.activity.count({ where: { institutionId, isArchived: false } })
    ]);

    res.json({
      success: true,
      data: {
        ...subscription,
        usage: {
          studentsCount: currentStudentsCount,
          maxStudents: subscription.maxStudents,
          activitiesCount: currentActivitiesCount,
          maxActivities: subscription.maxActivities,
          studentUsagePercent: Math.round((currentStudentsCount / subscription.maxStudents) * 100)
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Idempotent webhook receiver
    const { eventId, eventType, provider = 'stripe', payload } = req.body;

    if (!eventId || !eventType) {
      res.status(400).json({ success: false, error: 'eventId and eventType are required for webhook' });
      return;
    }

    // Check idempotency: if event already processed, return 200 immediately
    const existingEvent = await prisma.subscriptionEvent.findUnique({
      where: { eventId }
    });

    if (existingEvent) {
      res.json({ success: true, message: 'Event already processed (idempotent)' });
      return;
    }

    // Process event payload if valid institution is referenced
    const institutionId = payload?.institutionId;
    if (institutionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { institutionId }
      });

      if (subscription) {
        await prisma.subscriptionEvent.create({
          data: {
            subscriptionId: subscription.id,
            eventType,
            provider,
            eventId,
            payload: payload || {},
            status: 'PROCESSED'
          }
        });
      }
    }

    res.json({ success: true, message: 'Webhook event recorded' });
  } catch (err) {
    next(err);
  }
}
