import { Router } from 'express';
import multer from 'multer';
import { minioClient, BUCKET_NAME } from '../config/minio.config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    },
});

// Helper to upload to MinIO
const uploadToMinio = async (file: Express.Multer.File, folder: string): Promise<string> => {
    const ext = path.extname(file.originalname);
    const filename = `${folder}/${uuidv4()}${ext}`;

    await minioClient.putObject(BUCKET_NAME, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
    });

    // Return the full URL
    // Assuming MinIO is accessible publicly at the endpoint/bucket/filename
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const host = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';

    // If running in docker/behind proxy, this URL might need adjustment
    // For local dev with exposed MinIO port:
    return `${protocol}://${host}:${port}/${BUCKET_NAME}/${filename}`;
};

// Routes

// 1. Upload Staff Avatar
router.post('/staff', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const url = await uploadToMinio(req.file, 'staff-avatars');
        res.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// 2. Upload Service Image
router.post('/service', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const url = await uploadToMinio(req.file, 'service-images');
        res.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// 3. Upload Portfolio Image (for Staff)
router.post('/portfolio', upload.array('files', 5), async (req, res) => { // Allow up to 5 files at once
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadPromises = files.map(file => uploadToMinio(file, 'portfolios'));
        const urls = await Promise.all(uploadPromises);

        res.json({ urls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

export const uploadRoutes = router;
