import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { loginSchema, registerSchema, lineLoginSchema } from '../schemas/auth.schema';
import { authMiddleware } from '../middleware/auth';
import { verifyLineToken as verifyLineAccessToken } from '../services/line.service';

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
        const { idToken, accessToken } = req.body;

        // Support both idToken (LIFF) and accessToken (LINE Login) flows
        const tokenToVerify = accessToken || idToken;

        if (!tokenToVerify) {
            res.status(400).json({ error: 'accessToken or idToken is required' });
            return;
        }

        // Verify LINE token with LINE API
        const lineProfile = await verifyLineAccessToken(tokenToVerify);

        if (!lineProfile) {
            res.status(401).json({ error: 'Invalid LINE token' });
            return;
        }

        // Find or create user
        let user = await prisma.user.findFirst({
            where: { lineUserId: lineProfile.userId },
        });

        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            user = await prisma.user.create({
                data: {
                    lineUserId: lineProfile.userId,
                    name: lineProfile.displayName,
                    role: 'CUSTOMER',
                    avatarUrl: lineProfile.pictureUrl,
                },
            });
        } else {
            // Update profile from LINE
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: lineProfile.displayName,
                    avatarUrl: lineProfile.pictureUrl,
                },
            });
        }

        // Send welcome notification for new users
        if (isNewUser && lineProfile.userId) {
            const { sendRegistrationSuccessNotification } = await import('../services/line.service');
            sendRegistrationSuccessNotification(
                lineProfile.userId,
                lineProfile.displayName,
                user.phone || undefined
            ).catch(err => console.error('Registration notification failed:', err));
        }

        // Generate tokens
        const jwtAccessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                lineUserId: user.lineUserId,
            },
            accessToken: jwtAccessToken,
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
