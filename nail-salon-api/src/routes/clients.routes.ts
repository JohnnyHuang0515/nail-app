import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Member tier thresholds (based on total spend)
const MEMBER_TIERS = {
    PLATINUM: { minSpend: 10000, name: 'Platinum', nextTier: null, pointsMultiplier: 2.0 },
    GOLD: { minSpend: 5000, name: 'Gold', nextTier: 'Platinum', pointsMultiplier: 1.5 },
    SILVER: { minSpend: 2000, name: 'Silver', nextTier: 'Gold', pointsMultiplier: 1.2 },
    BRONZE: { minSpend: 0, name: 'Bronze', nextTier: 'Silver', pointsMultiplier: 1.0 },
};

function calculateMemberTier(totalSpend: number): { tier: string; nextTier: string | null; toNext: number } {
    if (totalSpend >= MEMBER_TIERS.PLATINUM.minSpend) {
        return { tier: 'Platinum', nextTier: null, toNext: 0 };
    } else if (totalSpend >= MEMBER_TIERS.GOLD.minSpend) {
        return { tier: 'Gold', nextTier: 'Platinum', toNext: MEMBER_TIERS.PLATINUM.minSpend - totalSpend };
    } else if (totalSpend >= MEMBER_TIERS.SILVER.minSpend) {
        return { tier: 'Silver', nextTier: 'Gold', toNext: MEMBER_TIERS.GOLD.minSpend - totalSpend };
    } else {
        return { tier: 'Bronze', nextTier: 'Silver', toNext: MEMBER_TIERS.SILVER.minSpend - totalSpend };
    }
}

// Validation schemas
const createClientSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
});

/**
 * GET /api/clients - List all customers
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        const where: any = {
            role: 'CUSTOMER',
        };

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { phone: { contains: search as string } },
            ];
        }

        const customers = await prisma.user.findMany({
            where,
            include: {
                bookings: {
                    where: { status: 'COMPLETED' },
                    select: { totalPrice: true, scheduledAt: true },
                    orderBy: { scheduledAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = customers.map(customer => {
            const totalSpend = customer.bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
            const visitCount = customer.bookings.length;
            const lastVisit = customer.bookings[0]?.scheduledAt || null;
            const tierInfo = calculateMemberTier(totalSpend);

            // Calculate relative last visit
            let lastVisitText = '新會員';
            if (lastVisit) {
                const daysDiff = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff === 0) lastVisitText = '今天';
                else if (daysDiff === 1) lastVisitText = '昨天';
                else if (daysDiff < 7) lastVisitText = `${daysDiff} 天前`;
                else if (daysDiff < 30) lastVisitText = `${Math.floor(daysDiff / 7)} 週前`;
                else lastVisitText = `${Math.floor(daysDiff / 30)} 個月前`;
            }

            return {
                id: customer.id,
                name: customer.name,
                phone: customer.phone || '',
                avatar: customer.avatarUrl,
                lastVisit: lastVisitText,
                isNew: visitCount === 0,
                totalSpend,
                visitCount,
                memberTier: tierInfo.tier,
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

/**
 * GET /api/clients/:id - Get single client with full details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const customer = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                bookings: {
                    include: {
                        stylist: true,
                        items: { include: { service: true } },
                    },
                    orderBy: { scheduledAt: 'desc' },
                },
            },
        });

        if (!customer || customer.role !== 'CUSTOMER') {
            return res.status(404).json({ error: 'Client not found' });
        }

        const completedBookings = customer.bookings.filter(b => b.status === 'COMPLETED');
        const upcomingBookings = customer.bookings.filter(b =>
            b.status !== 'NO_SHOW' && new Date(b.scheduledAt) > new Date()
        );

        const totalSpend = completedBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
        const visitCount = completedBookings.length;
        const tierInfo = calculateMemberTier(totalSpend);

        // Calculate points (1 point per $10 spent, multiplied by tier bonus)
        const tierData = Object.values(MEMBER_TIERS).find(t => t.name === tierInfo.tier);
        const points = Math.floor(totalSpend / 10 * (tierData?.pointsMultiplier || 1));

        const formatted = {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email,
            avatar: customer.avatarUrl,
            memberTier: tierInfo.tier as 'Bronze' | 'Silver' | 'Gold' | 'Platinum',
            points,
            pointsToNext: tierInfo.toNext,
            nextTier: tierInfo.nextTier || '',
            totalSpend,
            visitCount,
            history: completedBookings.slice(0, 10).map(b => ({
                id: b.id,
                date: new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                service: b.items.map(i => i.service.name).join(', '),
                staff: b.stylist?.displayName || '未指定',
                price: Number(b.totalPrice),
            })),
            upcoming: upcomingBookings.map(b => ({
                id: b.id,
                date: new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: new Date(b.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                service: b.items.map(i => i.service.name).join(', '),
                staff: b.stylist?.displayName || '未指定',
                reminderSent: false, // TODO: Track reminder status
            })),
        };

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Failed to fetch client' });
    }
});

/**
 * POST /api/clients - Create a new client
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = createClientSchema.parse(req.body);

        const customer = await prisma.user.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                role: 'CUSTOMER',
            },
        });

        res.status(201).json({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            isNew: true,
            totalSpend: 0,
            visitCount: 0,
            memberTier: 'Bronze',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: (error as any).errors });
        } else {
            console.error('Error creating client:', error);
            res.status(500).json({ error: 'Failed to create client' });
        }
    }
});

/**
 * PUT /api/clients/:id - Update client info
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const data = createClientSchema.partial().parse(req.body);

        const customer = await prisma.user.update({
            where: { id: req.params.id },
            data,
        });

        res.json({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
        });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Failed to update client' });
    }
});

export default router;
