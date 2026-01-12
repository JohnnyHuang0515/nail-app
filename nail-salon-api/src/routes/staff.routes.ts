import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/staff - Get all active staff (for LIFF frontend)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const staffList = await prisma.staff.findMany({
            where: { isActive: true },
            include: {
                user: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        author: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
            orderBy: { rating: 'desc' },
        });

        // Format to match LIFF frontend structure
        const formatted = staffList.map(staff => ({
            id: staff.id,
            name: staff.displayName,
            nameEn: staff.displayNameEn || null,
            title: staff.title || 'Nail Artist',
            avatar: staff.avatarUrl || staff.user.avatarUrl || '',
            rating: staff.rating,
            reviewCount: staff.reviewCount,
            tags: staff.specialties,
            bio: staff.bio || '',
            reviews: staff.reviews.map(r => ({
                id: r.id,
                author: r.author,
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt.toISOString().split('T')[0],
            })),
            portfolio: staff.portfolio,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/staff/:id - Get single staff member
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const staff = await prisma.staff.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        author: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!staff) {
            res.status(404).json({ error: 'Staff not found' });
            return;
        }

        // Format response
        const formatted = {
            id: staff.id,
            name: staff.displayName,
            nameEn: staff.displayNameEn || null,
            title: staff.title || 'Nail Artist',
            avatar: staff.avatarUrl || staff.user.avatarUrl || '',
            rating: staff.rating,
            reviewCount: staff.reviewCount,
            tags: staff.specialties,
            bio: staff.bio || '',
            reviews: staff.reviews.map(r => ({
                id: r.id,
                author: r.author,
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt.toISOString().split('T')[0],
            })),
            portfolio: staff.portfolio,
            workingHours: staff.workingHours,
            slotIntervalMins: staff.slotIntervalMins,
        };

        res.json(formatted);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
