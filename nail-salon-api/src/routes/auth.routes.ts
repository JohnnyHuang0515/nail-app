import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { loginSchema, registerSchema, lineLoginSchema } from '../schemas/auth.schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/register - Register new manager/admin
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        // Hash password
        const passwordHash = await hashPassword(validatedData.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                passwordHash,
                name: validatedData.name,
                phone: validatedData.phone,
                role: validatedData.role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        res.status(201).json({
            user,
            accessToken,
            refreshToken,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login - Email/password login for managers
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = loginSchema.parse(req.body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (!user || !user.passwordHash) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isValid = await comparePassword(validatedData.password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/line-login - LINE Login for customers (LIFF)
router.post('/line-login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken } = lineLoginSchema.parse(req.body);

        // TODO: Verify LINE ID Token with LINE API
        // For now, we'll use a placeholder
        // In production, verify with: https://api.line.me/oauth2/v2.1/verify

        // Mock LINE user data (replace with actual LINE API verification)
        const lineUserId = 'U' + Math.random().toString(36).substring(7);
        const lineProfile = {
            displayName: 'LINE User',
            pictureUrl: null,
        };

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { lineUserId },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    lineUserId,
                    name: lineProfile.displayName,
                    role: 'CUSTOMER',
                    avatarUrl: lineProfile.pictureUrl,
                },
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            accessToken,
            refreshToken,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('LINE login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
