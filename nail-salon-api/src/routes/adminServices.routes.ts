import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createServiceSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional(),
    durationMinutes: z.number().int().positive(),
    price: z.number().positive(),
    imageUrl: z.string().url().optional(),
});

/**
 * GET /api/admin/services/categories - List all categories
 */
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        const categories = services.map(s => s.category);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

/**
 * GET /api/admin/services - List all services
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, includeInactive } = req.query;

        const where: any = {};
        if (category) {
            where.category = category;
        }
        if (includeInactive !== 'true') {
            where.isActive = true;
        }

        const services = await prisma.service.findMany({
            where,
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        // Format for frontend compatibility
        const formatted = services.map(s => ({
            id: s.id,
            name: s.name,
            duration: s.durationMinutes,
            price: Number(s.price),
            category: s.category,
            description: s.description,
            isActive: s.isActive,
            imageUrl: s.imageUrl,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

/**
 * POST /api/admin/services - Create a new service
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = createServiceSchema.parse(req.body);

        const service = await prisma.service.create({
            data: {
                name: data.name,
                category: data.category,
                description: data.description,
                durationMinutes: data.durationMinutes,
                price: data.price,
                imageUrl: data.imageUrl,
                isActive: true,
            },
        });

        res.status(201).json({
            id: service.id,
            name: service.name,
            duration: service.durationMinutes,
            price: Number(service.price),
            category: service.category,
            imageUrl: service.imageUrl,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: (error as any).errors });
        } else {
            console.error('Error creating service:', error);
            res.status(500).json({ error: 'Failed to create service' });
        }
    }
});

/**
 * PUT /api/admin/services/:id - Update a service
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = createServiceSchema.partial().parse(req.body);

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

        const service = await prisma.service.update({
            where: { id },
            data: updateData,
        });

        res.json({
            id: service.id,
            name: service.name,
            duration: service.durationMinutes,
            price: Number(service.price),
            category: service.category,
            imageUrl: service.imageUrl,
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

/**
 * PATCH /api/admin/services/:id/toggle - Toggle service active status
 */
router.patch('/:id/toggle', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const service = await prisma.service.findUnique({ where: { id } });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const updated = await prisma.service.update({
            where: { id },
            data: { isActive: !service.isActive },
        });

        res.json({
            id: updated.id,
            name: updated.name,
            isActive: updated.isActive,
        });
    } catch (error) {
        console.error('Error toggling service:', error);
        res.status(500).json({ error: 'Failed to toggle service' });
    }
});

/**
 * DELETE /api/admin/services/:id - Hard delete a service
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.service.delete({ where: { id } });

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

export default router;
