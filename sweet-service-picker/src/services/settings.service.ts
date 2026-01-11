import { apiClient } from '@/lib/api';

export interface BusinessHour {
    day: string;
    isOpen: boolean;
    open: string;
    close: string;
}

export interface Settings {
    storeName: string;
    address: string;
    phone: string;
    bookingUrl: string;
    businessHours: BusinessHour[];
    notifications: {
        lineReminder: boolean;
        reminderHoursBefore: number;
    };
}

export const settingsService = {
    /**
     * Get store settings (public)
     */
    async getSettings(): Promise<Settings> {
        return apiClient.get<Settings>('/settings');
    }
};
