import { z } from 'zod';

// 服務分類改為字串（可自訂）而非固定枚舉
export const createServiceSchema = z.object({
    name: z.string().min(1, 'Service name is required').max(100),
    category: z.string().min(1, 'Category is required').max(50), // 改為自訂字串
    description: z.string().optional(),
    durationMinutes: z.number().int().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
    price: z.number().positive('Price must be positive'),
    imageUrl: z.string().url('Invalid image URL').optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const queryServicesSchema = z.object({
    category: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
});

// 獲取所有分類（用於前端下拉選單）
export const categoriesQuerySchema = z.object({
    includeInactive: z.enum(['true', 'false']).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type QueryServicesInput = z.infer<typeof queryServicesSchema>;
