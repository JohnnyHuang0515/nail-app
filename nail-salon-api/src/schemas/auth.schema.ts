import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
    role: z.enum(['MANAGER', 'ADMIN']).default('MANAGER'),
});

export const lineLoginSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LineLoginInput = z.infer<typeof lineLoginSchema>;
