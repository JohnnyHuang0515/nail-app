import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { format } from 'date-fns';

const router = Router();

// Validation Schema - matching actual Prisma Coupon model
const couponSchema = z.object({
    code: z.string().min(1, "Code is required"),
    discountType: z.string(), // 'percentage' or 'fixed_amount'
    discountValue: z.number().min(0),
    validFrom: z.string(), // ISO date string
    validUntil: z.string(), // ISO date string
    isActive: z.boolean().default(true),
    usageLimit: z.number().int().optional(),
    minPurchaseAmount: z.number().optional(),
    maxDiscountAmount: z.number().optional(),
});

/**
 * GET /api/coupons - List all coupons
 */
router.get('/', async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Transform to frontend format
        const formatted = coupons.map(coupon => ({
            id: coupon.id,
            title: coupon.code, // Use code as title
            discount: coupon.discountType === 'percentage'
                ? `${(100 - coupon.discountValue.toNumber())}折`
                : `折抵 $${coupon.discountValue.toNumber()}`,
            expiry: format(coupon.validUntil, 'yyyy/MM/dd'),
            isActive: coupon.isActive,
            usedCount: coupon.usageCount,
            // Raw data for editing
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toNumber(),
            validFrom: coupon.validFrom.toISOString(),
            validUntil: coupon.validUntil.toISOString(),
            usageLimit: coupon.usageLimit,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

/**
 * POST /api/coupons - Create a new coupon
 */
router.post('/', async (req, res) => {
    try {
        const data = couponSchema.parse(req.body);

        const newCoupon = await prisma.coupon.create({
            data: {
                code: data.code,
                discountType: data.discountType,
                discountValue: data.discountValue,
                validFrom: new Date(data.validFrom),
                validUntil: new Date(data.validUntil),
                isActive: data.isActive,
                usageLimit: data.usageLimit,
                minPurchaseAmount: data.minPurchaseAmount,
                maxDiscountAmount: data.maxDiscountAmount,
            },
        });

        res.status(201).json({
            id: newCoupon.id,
            title: newCoupon.code,
            discount: newCoupon.discountType === 'percentage'
                ? `${(100 - newCoupon.discountValue.toNumber())}折`
                : `折抵 $${newCoupon.discountValue.toNumber()}`,
            expiry: format(newCoupon.validUntil, 'yyyy/MM/dd'),
            isActive: newCoupon.isActive,
            usedCount: newCoupon.usageCount,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: (error as any).errors });
        } else {
            console.error('Error creating coupon:', error);
            res.status(500).json({ error: 'Failed to create coupon' });
        }
    }
});

/**
 * PUT /api/coupons/:id - Update a coupon
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = couponSchema.partial().parse(req.body);

        const updateData: any = {};
        if (data.code !== undefined) updateData.code = data.code;
        if (data.discountType !== undefined) updateData.discountType = data.discountType;
        if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
        if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom);
        if (data.validUntil !== undefined) updateData.validUntil = new Date(data.validUntil);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;

        const updatedCoupon = await prisma.coupon.update({
            where: { id },
            data: updateData,
        });

        res.json({
            id: updatedCoupon.id,
            title: updatedCoupon.code,
            discount: updatedCoupon.discountType === 'percentage'
                ? `${(100 - updatedCoupon.discountValue.toNumber())}折`
                : `折抵 $${updatedCoupon.discountValue.toNumber()}`,
            expiry: format(updatedCoupon.validUntil, 'yyyy/MM/dd'),
            isActive: updatedCoupon.isActive,
            usedCount: updatedCoupon.usageCount,
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
});

/**
 * PATCH /api/coupons/:id/toggle - Toggle coupon active status
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const updated = await prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive },
        });

        res.json({ id: updated.id, isActive: updated.isActive });
    } catch (error) {
        console.error('Error toggling coupon:', error);
        res.status(500).json({ error: 'Failed to toggle coupon' });
    }
});

/**
 * DELETE /api/coupons/:id - Delete a coupon
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.coupon.delete({ where: { id } });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

export default router;
