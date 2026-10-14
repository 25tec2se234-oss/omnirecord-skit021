import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';

export async function listNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const notifications = await prisma.notification.findMany({
      where: {
        institutionId,
        OR: [
          { recipientUserId: userId },
          { recipientRole: role },
          { recipientUserId: null, recipientRole: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      targetPage: n.targetPage,
      recordId: n.recordId,
      timestamp: n.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: {
        notifications: formatted,
        unreadCount
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const existing = await prisma.notification.findFirst({
      where: { id, institutionId }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;
    const userId = req.user!.userId;
    const role = req.user!.role;

    await prisma.notification.updateMany({
      where: {
        institutionId,
        read: false,
        OR: [
          { recipientUserId: userId },
          { recipientRole: role },
          { recipientUserId: null, recipientRole: null }
        ]
      },
      data: { read: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
}
