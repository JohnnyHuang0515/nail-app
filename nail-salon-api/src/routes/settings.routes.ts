import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Settings file path (in project root for simplicity)
const SETTINGS_FILE = path.join(__dirname, '../../settings.json');

interface BusinessHour {
    day: string;
    isOpen: boolean;
    open: string;
    close: string;
}

interface Settings {
    storeName: string;
    bookingUrl: string;
    businessHours: BusinessHour[];
    notifications: {
        lineReminder: boolean;
        reminderHoursBefore: number;
    };
}

const defaultSettings: Settings = {
    storeName: "Nail Salon",
    bookingUrl: "liff.line.me/1234567890-abcdefgh",
    businessHours: [
        { day: "週一", isOpen: true, open: "10:00", close: "20:00" },
        { day: "週二", isOpen: true, open: "10:00", close: "20:00" },
        { day: "週三", isOpen: true, open: "10:00", close: "20:00" },
        { day: "週四", isOpen: true, open: "10:00", close: "20:00" },
        { day: "週五", isOpen: true, open: "10:00", close: "21:00" },
        { day: "週六", isOpen: true, open: "09:00", close: "21:00" },
        { day: "週日", isOpen: false, open: "10:00", close: "18:00" },
    ],
    notifications: {
        lineReminder: true,
        reminderHoursBefore: 24,
    },
};

function loadSettings(): Settings {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    return defaultSettings;
}

function saveSettings(settings: Settings): void {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
}

/**
 * GET /api/admin/settings - Get store settings
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const settings = loadSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

/**
 * PUT /api/admin/settings - Update store settings
 */
router.put('/', async (req: Request, res: Response) => {
    try {
        const currentSettings = loadSettings();
        const updatedSettings = {
            ...currentSettings,
            ...req.body,
        };

        // Validate business hours if provided
        if (req.body.businessHours) {
            if (!Array.isArray(req.body.businessHours) || req.body.businessHours.length !== 7) {
                return res.status(400).json({ error: 'businessHours must be an array of 7 days' });
            }
        }

        saveSettings(updatedSettings);
        res.json(updatedSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

/**
 * PUT /api/admin/settings/business-hours - Update only business hours
 */
router.put('/business-hours', async (req: Request, res: Response) => {
    try {
        const { businessHours } = req.body;

        if (!Array.isArray(businessHours) || businessHours.length !== 7) {
            return res.status(400).json({ error: 'businessHours must be an array of 7 days' });
        }

        const currentSettings = loadSettings();
        currentSettings.businessHours = businessHours;
        saveSettings(currentSettings);

        res.json({ message: 'Business hours updated', businessHours });
    } catch (error) {
        console.error('Error updating business hours:', error);
        res.status(500).json({ error: 'Failed to update business hours' });
    }
});

export default router;
