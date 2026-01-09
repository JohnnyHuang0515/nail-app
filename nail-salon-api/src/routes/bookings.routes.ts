import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { getStaffAvailability } from '../utils/availability';

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
            // Find any active staff member
            // In a real app, this should check availability for the requested timeSlot
            const availableStaff = await prisma.staff.findFirst({
                where: { isActive: true }
            });

            if (!availableStaff) {
                res.status(500).json({ error: 'No staff available to take this booking' });
                return;
            }
            assignedStylistId = availableStaff.id;
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
