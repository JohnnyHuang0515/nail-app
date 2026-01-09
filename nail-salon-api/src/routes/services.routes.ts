import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
    createServiceSchema,
    updateServiceSchema,
    queryServicesSchema,
    type CreateServiceInput,
    type UpdateServiceInput,
} from '../schemas/service.schema';

const router = Router();

// GET /api/services/categories - 獲取所有服務分類（用於下拉選單）
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
    try {
        const { includeInactive } = req.query;

        const where: any = {};
        if (includeInactive !== 'true') {
            where.isActive = true;
        }

        // 獲取所有不重複的分類
        const services = await prisma.service.findMany({
            where,
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });

        const categories = services.map(s => s.category);
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/services - 列出所有服務（支援篩選和搜尋）
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, isActive, search } = queryServicesSchema.parse(req.query);

        const where: any = {};

        // 分類篩選
        if (category) {
            where.category = category;
        }

        // 啟用狀態篩選
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        // 搜尋功能（名稱或描述）
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const services = await prisma.service.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });

        res.json(services);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/services/:id - 獲取單一服務詳情
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const service = await prisma.service.findUnique({
            where: { id: req.params.id },
        });

        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        res.json(service);
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/services - 新增服務（僅 MANAGER/ADMIN）
router.post('/', authMiddleware, requireRole('MANAGER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
    try {
        const data: CreateServiceInput = createServiceSchema.parse(req.body);

        const service = await prisma.service.create({
            data: {
                name: data.name,
                category: data.category,
                description: data.description,
                durationMinutes: data.durationMinutes,
                price: data.price,
                imageUrl: data.imageUrl,
            },
        });

        res.status(201).json(service);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/services/:id - 更新服務（僅 MANAGER/ADMIN）
router.put('/:id', authMiddleware, requireRole('MANAGER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
    try {
        const data: UpdateServiceInput = updateServiceSchema.parse(req.body);

        // 檢查服務是否存在
        const existingService = await prisma.service.findUnique({
            where: { id: req.params.id },
        });

        if (!existingService) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        const service = await prisma.service.update({
            where: { id: req.params.id },
            data,
        });

        res.json(service);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/services/:id - 刪除服務（軟刪除，設為 inactive）
router.delete('/:id', authMiddleware, requireRole('MANAGER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
    try {
        const existingService = await prisma.service.findUnique({
            where: { id: req.params.id },
        });

        if (!existingService) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        // 軟刪除：設置 isActive = false
        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });

        res.json({
            message: 'Service deactivated successfully',
            service,
        });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
