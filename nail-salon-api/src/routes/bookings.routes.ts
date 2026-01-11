import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { getStaffAvailability } from '../utils/availability';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Validation Schemas
const createBookingSchema = z.object({
    staffId: z.string(),
    serviceIds: z.array(z.string()).min(1),
    scheduledAt: z.string().datetime(),
    customerName: z.string().min(1),
    customerPhone: z.string().min(1),
    lineUserId: z.string().optional(),
    notes: z.string().optional(),
});

// POST /api/bookings - Create a new booking
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const data = createBookingSchema.parse(req.body);

        // 1. Calculate total price and duration
        const services = await prisma.service.findMany({
            where: { id: { in: data.serviceIds } }
        });

        if (services.length !== data.serviceIds.length) {
            res.status(400).json({ error: 'One or more services not found' });
            return;
        }

        const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);
        const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

        // 2. Find or create user (customer)
        // If lineUserId is provided, try to find by that, otherwise create new guest user
        // For simplicity, we'll create a new user or attach to existing one if logged in
        // In real app, we handle guest vs registered better

        let customerId = '';

        // Check if user is authenticated (from middleware)
        // @ts-ignore
        if (req.user) {
            // @ts-ignore
            customerId = req.user.userId;
        } else {
            // Guest booking - create a guest user or find by phone
            // For now, just create a new guest user
            const user = await prisma.user.create({
                data: {
                    name: data.customerName,
                    phone: data.customerPhone,
                    lineUserId: data.lineUserId,
                    role: 'CUSTOMER',
                }
            });
            customerId = user.id;
        }

        // Detect 'no-preference'
        let assignedStylistId = data.staffId;
        if (data.staffId === 'no-preference') {
            // Find all active staff members
            const allActiveStaff = await prisma.staff.findMany({
                where: { isActive: true }
            });

            let foundStaffId = null;

            // Iterate to find the first available staff
            // Note: This logic assumes 'scheduledAt' matches one of the 'startTime' slots exactly.
            // A more robust check would involve checking if the duration fits, but checking slot match is a good start.

            // Format scheduledAt to "YYYY-MM-DD" for availability check
            const dateStr = new Date(data.scheduledAt).toISOString().split('T')[0];
            const timeStr = new Date(data.scheduledAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            // Note: toLocaleTimeString depends on server locale. Better to parse ISO string.
            // data.scheduledAt is ISO8601 string e.g. 2026-01-12T14:00:00.000Z
            // If backend is UTC, we need to be careful. Ideally getStaffAvailability handles the date correctly.
            // Let's assume input date is sufficient.

            // Logic:
            // 1. For each staff, call getStaffAvailability
            // 2. Check if the resulting slots include the requested time

            // We need to know the 'date' component to query availability.
            // data.scheduledAt is full ISO.

            for (const staff of allActiveStaff) {
                const slots = await getStaffAvailability(staff.id, dateStr);
                // slots is array of { time: "10:00", available: true }

                // We need to extract the time part from scheduledAt to compare.
                // Assuming scheduledAt is in UTC, and slots are local time? Or both local?
                // The current system seems to lack strict timezone handling, assuming inputs are relative or handled by Frontend.
                // available-slots API returns "10:00", "10:30".
                // We need to convert scheduledAt to that format.
                // Since this is "no-preference" auto assign, let's keep it simple:
                // Check if the staff has NO conflicting bookings overlapping this time?
                // OR simpler: reuse the slot logic.

                // Let's rely on simple extraction for now, assuming UTC+8 or similar consistency.
                const reqDate = new Date(data.scheduledAt);
                const reqTime = `${reqDate.getHours().toString().padStart(2, '0')}:${reqDate.getMinutes().toString().padStart(2, '0')}`;

                // Correction: getStaffAvailability uses Date object or string.
                // AND it checks existing bookings.

                const isAvailable = slots.some(s => s.time === reqTime && s.available);
                if (isAvailable) {
                    foundStaffId = staff.id;
                    break;
                }
            }

            if (!foundStaffId) {
                // Determine if we should fail or just force assign (overbooking).
                // "No staff available"
                res.status(409).json({ error: 'No staff available for this time slot.' });
                return;
            }
            assignedStylistId = foundStaffId;
        }

        // 3. Create Booking
        const booking = await prisma.booking.create({
            data: {
                customerId,
                stylistId: assignedStylistId,
                scheduledAt: data.scheduledAt,
                status: 'CONFIRMED', // Auto confirm for now
                totalPrice: totalPrice,
                totalDurationMinutes: totalDuration,
                notes: data.notes,
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

        // Send LINE notification when booking is created (if customer has LINE ID)
        if (booking.customer?.lineUserId) {
            const { sendBookingCreatedNotification } = await import('../services/line.service');
            const serviceName = services.map(s => s.name).join(', ');

            sendBookingCreatedNotification(
                booking.customer.lineUserId,
                booking.customer.name || '貴賓',
                serviceName,
                new Date(booking.scheduledAt),
                booking.stylist?.displayName || '設計師',
                Number(booking.totalPrice)
            ).catch(err => console.error('LINE notification failed:', err));
        }

        res.status(201).json(booking);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// GET /api/bookings/my-bookings - Get current user bookings
router.get('/my-bookings', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const userId = req.user!.userId;

        const bookings = await prisma.booking.findMany({
            where: { customerId: userId },
            include: {
                items: { include: { service: true } },
                stylist: true,
            },
            orderBy: { scheduledAt: 'desc' }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Get my-bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/bookings/:id/cancel - Cancel a booking
router.post('/:id/cancel', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const userId = req.user!.userId;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }

        // Verify ownership
        if (booking.customerId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        // Check if cancellable (e.g., > 24 hours before?)
        // For MVP, just allow cancel if not COMPLETED or CANCELLED
        if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)) {
            res.status(400).json({ error: 'Cannot cancel completed or already cancelled booking' });
            return;
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
            },
        });

        res.json(updatedBooking);
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/bookings/available-slots - Get available slots (Query Param Style)
router.get('/available-slots', async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, staffId } = req.query;
        if (!date) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }

        const targetStaffId = (staffId as string) || 'no-preference';

        // Reuse logic from /staff/:staffId/slots
        // 1. If staffId is specific
        if (targetStaffId !== 'no-preference') {
            const slots = await getStaffAvailability(targetStaffId, date as string);
            res.json(slots);
            return;
        }

        // 2. If staffId is 'no-preference'
        const allStaff = await prisma.staff.findMany({
            where: { isActive: true },
            select: { id: true }
        });

        const staffAvailabilities = await Promise.all(
            allStaff.map(staff => getStaffAvailability(staff.id, date as string))
        );

        const allTimes = new Set<string>();
        staffAvailabilities.forEach(slots => {
            slots.forEach(s => allTimes.add(s.time));
        });

        const sortedTimes = Array.from(allTimes).sort();

        const finalSlots = sortedTimes.map(time => {
            const isAvailable = staffAvailabilities.some(slots => {
                const s = slots.find(slot => slot.time === time);
                return s ? s.available : false;
            });
            return { time, available: isAvailable };
        });

        res.json(finalSlots);

    } catch (error) {
        console.error('Get available-slots error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id },
            include: {
                items: { include: { service: true } },
                stylist: true,
                customer: true,
            }
        });

        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/bookings/staff/:staffId/slots - Get available slots
router.get('/staff/:staffId/slots', async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.query;
        if (!date) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }

        // 1. If staffId is specific
        if (req.params.staffId !== 'no-preference') {
            const slots = await getStaffAvailability(req.params.staffId, date as string);
            res.json(slots);
            return;
        }

        // 2. If staffId is 'no-preference', find combined availability
        // Strategy: A slot is available if ANY staff member is available
        const allStaff = await prisma.staff.findMany({
            where: { isActive: true },
            select: { id: true }
        });

        // Initialize with empty slots (assume standard hours 10:00 - 20:00 for simplicity of aggregation base)
        // Or better: Collect all possible slots from all staff

        // For simplicity in this iteration: Get availability for all staff and merge
        const staffAvailabilities = await Promise.all(
            allStaff.map(staff => getStaffAvailability(staff.id, date as string))
        );

        // Merge: Map<Time, boolean>
        const mergedAvailability = new Map<string, boolean>();

        // First pass: Collect all time keys from all staff
        const allTimes = new Set<string>();
        staffAvailabilities.forEach(slots => {
            slots.forEach(s => allTimes.add(s.time));
        });

        // Sort times
        const sortedTimes = Array.from(allTimes).sort();

        // Second pass: Check if available in AT LEAST ONE staff
        const finalSlots = sortedTimes.map(time => {
            const isAvailable = staffAvailabilities.some(slots => {
                const s = slots.find(slot => slot.time === time);
                return s ? s.available : false;
            });
            return { time, available: isAvailable };
        });

        res.json(finalSlots);
    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



export default router;
