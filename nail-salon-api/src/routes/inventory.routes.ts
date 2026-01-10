import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Validation Schema
const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand: z.string().optional(), // Adding brand support even though DB "InventoryItem" doesn't have it explicitly mapped in initial schema? 
    // Wait, schema.prisma for InventoryItem: name, category, sku, quantity, unit, minStockLevel, costPrice, supplier
    // No "brand" column in schema.prisma viewed earlier. Let's map "supplier" or just omit brand.
    // User mockup had "Brand". We can store it in notes or ignore it for now. Let's start with matching Schema.
    category: z.string().optional(),
    sku: z.string().optional(),
    quantity: z.number().int().min(0).default(0),
    unit: z.string().optional(),
    minStockLevel: z.number().int().optional(),
    costPrice: z.number().optional(),
    supplier: z.string().optional(),
});

// GET /api/inventory - List all products
router.get('/', async (req, res) => {
    try {
        const items = await prisma.inventoryItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// POST /api/inventory - Create product
router.post('/', async (req, res) => {
    try {
        const data = createProductSchema.parse(req.body);
        const newItem = await prisma.inventoryItem.create({
            data: {
                name: data.name,
                category: data.category,
                sku: data.sku,
                quantity: data.quantity,
                unit: data.unit,
                minStockLevel: data.minStockLevel,
                costPrice: data.costPrice,
                supplier: data.supplier,
            }
        });
        res.status(201).json(newItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: (error as any).errors });
        } else {
            console.error('Error creating product:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    }
});

// PUT /api/inventory/:id - Update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = createProductSchema.partial().parse(req.body); // Allow partial updates

        const updatedItem = await prisma.inventoryItem.update({
            where: { id },
            data: {
                ...data
            }
        });
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/inventory/:id - Delete product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.inventoryItem.delete({
            where: { id }
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
