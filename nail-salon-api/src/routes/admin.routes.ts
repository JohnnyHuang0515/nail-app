import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

const router = Router();

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        // 1. Calculate Revenue Today
        const todayBookings = await prisma.booking.findMany({
            where: {
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
                status: 'COMPLETED', // Use completed for revenue
            },
            select: {
                totalPrice: true,
            }
        });

        const revenueToday = todayBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);

        // 2. Count Total Bookings Today (All statuses)
        const bookingsCount = await prisma.booking.count({
            where: {
                scheduledAt: {
                    gte: start,
                    lte: end,
                }
            }
        });

        // 3. Count Pending Bookings (Future dates included generally or just today? usually pending queue is global or today. Let's do Global Pending for "Inbox" feel, or Today's pending. The UI said "Pending", let's assume global pending for action items)
        // However, "Revenue Today" implies today context. 
        // Let's stick to "Pending appointments" generally requiring attention, but maybe just for today for now to be safe, or global.
        // Let's look at the UI screenshot or logic. "Pending" usually means "To be confirmed".
        // Let's do Global Pending for now as it's an inbox count.
        const pendingCount = await prisma.booking.count({
            where: {
                status: 'PENDING'
            }
        });

        res.json({
            revenue: revenueToday,
            bookings: bookingsCount,
            pending: pendingCount
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/today-bookings
router.get('/today-bookings', async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        const bookings = await prisma.booking.findMany({
            where: {
                scheduledAt: {
                    gte: start,
                    lte: end,
                }
            },
            include: {
                customer: true,
                stylist: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Get today bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
