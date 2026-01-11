import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import servicesRoutes from './routes/services.routes';
import staffRoutes from './routes/staff.routes';
import bookingsRoutes from './routes/bookings.routes';

import adminRoutes from './routes/admin.routes';
import inventoryRoutes from './routes/inventory.routes';
import scheduleRoutes from './routes/schedule.routes';
import couponsRoutes from './routes/coupons.routes';
import clientsRoutes from './routes/clients.routes';
import reportsRoutes from './routes/reports.routes';
import adminServicesRoutes from './routes/adminServices.routes';
import settingsRoutes from './routes/settings.routes';
import { uploadRoutes } from './routes/upload.routes';
import { ensureBucketExists } from './config/minio.config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration for LIFF
app.use(cors({
    origin: [
        'http://localhost:5173',      // Vite dev server (default)
        'http://localhost:5174',      // Alternative port
        'http://localhost:8080',      // Vite dev server (actual)
        'http://localhost:8081',      // Admin Panel
        'http://localhost:8082',      // Client App (Sweet Service Picker)
        'https://liff.line.me',       // LINE LIFF domain
        ...(process.env.CORS_ORIGIN?.split(',').filter(Boolean) || []),
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nail Salon API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/services', adminServicesRoutes); // TEMP: No auth for testing
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api', (req, res) => {
    res.json({ message: 'Nail Salon API v1.0' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, async () => {
    // Ensure MinIO bucket exists
    await ensureBucketExists();
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
