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

const API_URL = '/api/admin/settings';

export const settingsService = {
    async getSettings(): Promise<Settings> {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },

    async updateSettings(settings: Partial<Settings>): Promise<Settings> {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    },

    async updateBusinessHours(businessHours: BusinessHour[]): Promise<{ message: string; businessHours: BusinessHour[] }> {
        const response = await fetch(`${API_URL}/business-hours`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessHours }),
        });
        if (!response.ok) throw new Error('Failed to update business hours');
        return response.json();
    },
};
