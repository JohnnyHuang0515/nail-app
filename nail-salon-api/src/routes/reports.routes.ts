import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const router = Router();

type Period = 'this-week' | 'this-month' | 'last-month' | 'custom';

interface DateRange {
    start: Date;
    end: Date;
}

function getDateRange(period: Period, customStart?: string, customEnd?: string): DateRange {
    const now = new Date();

    switch (period) {
        case 'this-week':
            return {
                start: startOfWeek(now, { weekStartsOn: 1 }),
                end: endOfWeek(now, { weekStartsOn: 1 }),
            };
        case 'this-month':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
            };
        case 'last-month':
            const lastMonth = subMonths(now, 1);
            return {
                start: startOfMonth(lastMonth),
                end: endOfMonth(lastMonth),
            };
        case 'custom':
            return {
                start: customStart ? startOfDay(new Date(customStart)) : startOfMonth(now),
                end: customEnd ? endOfDay(new Date(customEnd)) : endOfMonth(now),
            };
        default:
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
            };
    }
}

/**
 * GET /api/admin/reports
 * Query params:
 *   - period: 'this-week' | 'this-month' | 'last-month' | 'custom'
 *   - startDate: ISO date (for custom)
 *   - endDate: ISO date (for custom)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as Period) || 'this-month';
        const customStart = req.query.startDate as string | undefined;
        const customEnd = req.query.endDate as string | undefined;

        const { start, end } = getDateRange(period, customStart, customEnd);

        // 1. Get completed bookings in date range
        const bookings = await prisma.booking.findMany({
            where: {
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
                status: 'COMPLETED',
            },
            include: {
                items: { include: { service: true } },
                stylist: true,
                customer: true,
            },
        });

        // 2. Calculate total sales
        const totalSales = bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);

        // 3. Count new customers (first booking in this period)
        const customerIds = [...new Set(bookings.map(b => b.customerId))];
        let newCustomers = 0;

        for (const customerId of customerIds) {
            const firstBooking = await prisma.booking.findFirst({
                where: {
                    customerId,
                    status: 'COMPLETED',
                },
                orderBy: { scheduledAt: 'asc' },
            });

            if (firstBooking && new Date(firstBooking.scheduledAt) >= start) {
                newCustomers++;
            }
        }

        // 4. Calculate average ticket
        const avgTicket = bookings.length > 0 ? Math.round(totalSales / bookings.length) : 0;

        // 5. Service breakdown by category
        const serviceCounts: Record<string, number> = {};
        bookings.forEach(booking => {
            booking.items.forEach(item => {
                const category = item.service.category;
                serviceCounts[category] = (serviceCounts[category] || 0) + 1;
            });
        });

        const totalServices = Object.values(serviceCounts).reduce((a, b) => a + b, 0);
        const categoryColors: Record<string, string> = {
            '手部': 'hsl(34, 36%, 68%)',
            '足部': 'hsl(340, 75%, 85%)',
            '保養': 'hsl(210, 70%, 85%)',
            '加購': 'hsl(160, 50%, 75%)',
        };

        const serviceBreakdown = Object.entries(serviceCounts).map(([name, count]) => ({
            name,
            value: totalServices > 0 ? Math.round((count / totalServices) * 100) : 0,
            color: categoryColors[name] || 'hsl(0, 0%, 70%)',
        }));

        // 6. Staff ranking by revenue
        const staffRevenue: Record<string, { id: string; name: string; revenue: number }> = {};
        bookings.forEach(booking => {
            const staffId = booking.stylistId;
            const staffName = booking.stylist?.displayName || '未知';

            if (!staffRevenue[staffId]) {
                staffRevenue[staffId] = { id: staffId, name: staffName, revenue: 0 };
            }
            staffRevenue[staffId].revenue += Number(booking.totalPrice);
        });

        const avatarColors = [
            'bg-primary/30 text-primary',
            'bg-accent/30 text-accent',
            'bg-pink-200 text-pink-600',
            'bg-purple-200 text-purple-600',
        ];

        const staffRanking = Object.values(staffRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map((staff, index) => ({
                id: staff.id,
                name: staff.name,
                revenue: staff.revenue,
                avatar: staff.name.substring(0, 2).toUpperCase(),
                color: avatarColors[index % avatarColors.length],
            }));

        // 7. Daily/Weekly breakdown for charts
        const dailyBreakdown: { day: string; revenue: number; bookingCount: number }[] = [];

        if (period === 'this-week' || (period === 'custom' && (end.getTime() - start.getTime()) <= 7 * 24 * 60 * 60 * 1000)) {
            // Group by day for weekly view
            const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
            const dailyData: Record<string, { revenue: number; count: number }> = {};

            bookings.forEach(b => {
                const day = dayNames[new Date(b.scheduledAt).getDay()];
                if (!dailyData[day]) dailyData[day] = { revenue: 0, count: 0 };
                dailyData[day].revenue += Number(b.totalPrice);
                dailyData[day].count++;
            });

            // Ensure all days are present
            dayNames.slice(1).concat(dayNames.slice(0, 1)).forEach(day => {
                dailyBreakdown.push({
                    day,
                    revenue: dailyData[day]?.revenue || 0,
                    bookingCount: dailyData[day]?.count || 0,
                });
            });
        } else {
            // Group by week for monthly view
            const weeklyData: Record<string, { revenue: number; count: number }> = {};

            bookings.forEach(b => {
                const date = new Date(b.scheduledAt);
                const weekOfMonth = Math.ceil(date.getDate() / 7);
                const weekLabel = `第${weekOfMonth}週`;
                if (!weeklyData[weekLabel]) weeklyData[weekLabel] = { revenue: 0, count: 0 };
                weeklyData[weekLabel].revenue += Number(b.totalPrice);
                weeklyData[weekLabel].count++;
            });

            ['第1週', '第2週', '第3週', '第4週', '第5週'].forEach(week => {
                if (weeklyData[week] || week !== '第5週') {
                    dailyBreakdown.push({
                        day: week,
                        revenue: weeklyData[week]?.revenue || 0,
                        bookingCount: weeklyData[week]?.count || 0,
                    });
                }
            });
        }

        res.json({
            period,
            dateRange: {
                start: start.toISOString(),
                end: end.toISOString(),
            },
            totalSales,
            newCustomers,
            avgTicket,
            serviceBreakdown,
            staffRanking,
            dailyBreakdown,
        });
    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).json({ error: 'Failed to generate reports' });
    }
});

export default router;
