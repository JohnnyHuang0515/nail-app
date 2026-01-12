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
                status: { in: ['COMPLETED', 'CONFIRMED'] }, // Calculate projected revenue too
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
        // Count today's bookings that need attention (CONFIRMED but not yet checked in)
        const pendingCount = await prisma.booking.count({
            where: {
                status: 'CONFIRMED',
                scheduledAt: { gte: start, lte: end }
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



// ==================== Booking Management ====================

/**
 * POST /api/admin/bookings - Create a new booking as Admin
 * Allows creating booking for any customer (new or existing)
 */
router.post('/bookings', async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerName, customerPhone, stylistId, serviceIds, scheduledAt, notes } = req.body;

        if (!customerName || !customerPhone || !stylistId || !serviceIds || !scheduledAt) {
            res.status(400).json({ error: '缺少必填欄位 (Missing required fields)' });
            return;
        }

        // Validate scheduledAt is in the future
        const bookingTime = new Date(scheduledAt);
        if (bookingTime <= new Date()) {
            res.status(400).json({ error: '預約時間必須是未來的時間' });
            return;
        }

        // 1. Calculate services price/duration
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds } }
        });

        const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);
        const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

        // 2. Find or Create User (Customer)
        let customer = await prisma.user.findFirst({
            where: { phone: customerPhone }
        });

        if (!customer) {
            customer = await prisma.user.create({
                data: {
                    name: customerName,
                    phone: customerPhone,
                    role: 'CUSTOMER',
                }
            });
        }

        // 3. Handle 'no-preference' stylist
        let assignedStylistId = stylistId;
        if (stylistId === 'no-preference') {
            // Simple auto-assign: find first active staff
            const firstStaff = await prisma.staff.findFirst({
                where: { isActive: true }
            });
            if (!firstStaff) {
                res.status(400).json({ error: '無可用的設計師 (No active staff)' });
                return;
            }
            assignedStylistId = firstStaff.id;
        }

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                customerId: customer.id,
                stylistId: assignedStylistId,
                scheduledAt: scheduledAt,
                status: 'CONFIRMED', // Admin created bookings are usually confirmed
                totalPrice: totalPrice,
                totalDurationMinutes: totalDuration,
                notes: notes,
                items: {
                    create: services.map(s => ({
                        serviceId: s.id,
                        price: s.price,
                        durationMinutes: s.durationMinutes,
                    }))
                }
            },
            include: {
                items: { include: { service: true } },
                stylist: true,
                customer: true,
            }
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error('Admin create booking error:', error);
        res.status(500).json({ error: '建立預約失敗' });
    }
});

/**
 * GET /api/admin/bookings - List all bookings with filters
 * Query params: status, startDate, endDate
 */
router.get('/bookings', async (req: Request, res: Response) => {
    try {
        const { status, startDate, endDate } = req.query;

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (startDate || endDate) {
            where.scheduledAt = {};
            if (startDate) {
                where.scheduledAt.gte = startOfDay(new Date(startDate as string));
            }
            if (endDate) {
                where.scheduledAt.lte = endOfDay(new Date(endDate as string));
            }
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                customer: true,
                stylist: true,
                items: {
                    include: { service: true }
                }
            },
            orderBy: { scheduledAt: 'desc' },
            take: 100, // Limit for performance
        });

        const formatted = bookings.map(b => ({
            id: b.id,
            customerName: b.customer?.name || '未知',
            customerPhone: b.customer?.phone || '',
            stylistName: b.stylist?.displayName || '未指定',
            services: b.items.map(i => i.service.name).join(', '),
            scheduledAt: b.scheduledAt,
            status: b.status,
            totalPrice: Number(b.totalPrice),
            notes: b.notes,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

/**
 * PATCH /api/admin/bookings/:id/status - Update booking status
 */
router.patch('/bookings/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: '無效的狀態' });
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: { status },
        });

        res.json({
            id: booking.id,
            status: booking.status,
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

/**
 * PUT /api/admin/bookings/:id - Update booking details
 */
router.put('/bookings/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { customerName, customerPhone, stylistId, serviceIds, scheduledAt, notes } = req.body;

        // Validate scheduledAt is in the future (if provided)
        if (scheduledAt) {
            const bookingTime = new Date(scheduledAt);
            if (bookingTime <= new Date()) {
                return res.status(400).json({ error: '預約時間必須是未來的時間' });
            }
        }

        // 1. Calculate services price/duration if services changed
        let updateData: any = {
            scheduledAt,
            notes,
            stylistId: stylistId === 'no-preference' ? undefined : stylistId // Handle no-preference logic if needed, simplify for update
        };

        // If stylist is 'no-preference' during update, we should probably pick one? 
        // Or just keep existing if not provided. For now assume explicit stylistId is sent or we skip.
        if (stylistId && stylistId !== 'no-preference') {
            updateData.stylistId = stylistId;
        }

        // If services updated
        if (serviceIds && serviceIds.length > 0) {
            const services = await prisma.service.findMany({
                where: { id: { in: serviceIds } }
            });
            const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);
            const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

            updateData.totalPrice = totalPrice;
            updateData.totalDurationMinutes = totalDuration;

            // Transaction to replace items? Prisma update doesn't support easy replace on relation.
            // We do separate deleteMany and create.
            await prisma.bookingItem.deleteMany({ where: { bookingId: id } });
            await prisma.bookingItem.createMany({
                data: services.map(s => ({
                    bookingId: id,
                    serviceId: s.id,
                    price: s.price,
                    durationMinutes: s.durationMinutes
                }))
            });
        }

        // Update user if name/phone changed? Optional but good for consistency.
        if (customerName || customerPhone) {
            const booking = await prisma.booking.findUnique({ where: { id }, select: { customerId: true } });
            if (booking) {
                await prisma.user.update({
                    where: { id: booking.customerId },
                    data: {
                        name: customerName,
                        phone: customerPhone
                    }
                });
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: updateData,
            include: { items: true, stylist: true, customer: true }
        });

        res.json(updatedBooking);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

/**
 * DELETE /api/admin/bookings/:id - Delete booking
 */
router.delete('/bookings/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.booking.delete({ where: { id } });
        res.json({ message: 'Booking deleted' });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// ==================== Staff Management ====================

/**
 * GET /api/admin/staff - List all staff for admin management
 */
router.get('/staff', async (req: Request, res: Response) => {
    try {
        const staffList = await prisma.staff.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
            orderBy: { displayName: 'asc' },
        });

        const formatted = staffList.map(staff => ({
            id: staff.id,
            name: staff.displayName,
            role: staff.title || '美甲師',
            isOnShift: staff.isActive, // Use isActive as shift status for now
            phone: staff.user?.phone,
            email: staff.user?.email,
            avatarUrl: staff.avatarUrl,
            portfolio: staff.portfolio,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get admin staff error:', error);
        res.status(500).json({ error: '無法取得員工資料' });
    }
});

/**
 * POST /api/admin/staff - Create new staff member
 */
router.post('/staff', async (req: Request, res: Response) => {
    try {
        const { name, role, phone, email } = req.body;

        // Create user first
        const user = await prisma.user.create({
            data: {
                name,
                phone,
                email,
                role: 'STAFF',
            },
        });

        // Create staff record
        const staff = await prisma.staff.create({
            data: {
                userId: user.id,
                displayName: name,
                title: role,
                isActive: true,
                rating: 5.0,
                reviewCount: 0,
                avatarUrl: req.body.avatarUrl,
                portfolio: req.body.portfolio || [],
            },
        });

        res.status(201).json({
            id: staff.id,
            name: staff.displayName,
            role: staff.title,
            isOnShift: staff.isActive,
            avatarUrl: staff.avatarUrl,
            portfolio: staff.portfolio,
        });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ error: '建立員工失敗' });
    }
});

/**
 * PUT /api/admin/staff/:id - Update staff member
 */
router.put('/staff/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, role, isOnShift } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.displayName = name;
        if (role !== undefined) updateData.title = role;
        if (isOnShift !== undefined) updateData.isActive = isOnShift;
        if (req.body.avatarUrl !== undefined) updateData.avatarUrl = req.body.avatarUrl;
        if (req.body.portfolio !== undefined) updateData.portfolio = req.body.portfolio;

        const staff = await prisma.staff.update({
            where: { id },
            data: updateData,
        });

        res.json({
            id: staff.id,
            name: staff.displayName,
            role: staff.title,
            isOnShift: staff.isActive,
            avatarUrl: staff.avatarUrl,
            portfolio: staff.portfolio,
        });
    } catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({ error: '更新員工失敗' });
    }
});

/**
 * PATCH /api/admin/staff/:id/toggle-shift - Toggle staff shift status
 */
router.patch('/staff/:id/toggle-shift', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const staff = await prisma.staff.findUnique({ where: { id } });
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        const updated = await prisma.staff.update({
            where: { id },
            data: { isActive: !staff.isActive },
        });

        res.json({
            id: updated.id,
            name: updated.displayName,
            isOnShift: updated.isActive,
        });
    } catch (error) {
        console.error('Toggle staff shift error:', error);
        res.status(500).json({ error: '切換狀態失敗' });
    }
});

/**
 * DELETE /api/admin/staff/:id - Delete staff member
 */
router.delete('/staff/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get staff to find user ID
        const staff = await prisma.staff.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        // Don't actually delete - just deactivate
        await prisma.staff.update({
            where: { id },
            data: { isActive: false },
        });

        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: '刪除員工失敗' });
    }
});

export default router;
