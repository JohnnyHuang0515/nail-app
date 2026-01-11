import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { startOfDay, endOfDay, parseISO, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const router = Router();

// Timezone for Taiwan
const TIMEZONE = 'Asia/Taipei';

// Staff color mapping
const staffColors: Array<'pink' | 'blue' | 'lavender' | 'peach'> = ['pink', 'blue', 'lavender', 'peach'];

/**
 * GET /api/schedule
 * Query params:
 *   - startDate: ISO date string (required)
 *   - endDate: ISO date string (required)
 * Returns bookings formatted for TimelineView component
 */
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));

        // Fetch bookings with related data
        const bookings = await prisma.booking.findMany({
            where: {
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
                status: {
                    notIn: ['CANCELLED', 'NO_SHOW'],
                },
            },
            include: {
                customer: true,
                stylist: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });

        // Transform to TimelineView format
        const formatted = bookings.map((booking) => {
            // Get staff color based on stylist ID
            const stylistIdHash = booking.stylistId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const staffColor = staffColors[stylistIdHash % staffColors.length];

            // Convert UTC to Taiwan timezone for display
            const scheduledDate = toZonedTime(new Date(booking.scheduledAt), TIMEZONE);
            const endDate = addMinutes(scheduledDate, booking.totalDurationMinutes);

            const startTime = `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`;
            const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

            return {
                id: booking.id,
                clientName: booking.customer?.name || '訪客',
                service: booking.items?.map((item: any) => item.service?.name).join(', ') || '服務',
                startTime,
                endTime,
                staffName: booking.stylist?.displayName || '未指定',
                staffColor,
                date: scheduledDate.toISOString(),
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

export default router;
