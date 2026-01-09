import { apiClient } from '@/lib/api';

export interface BookingData {
    staffId: string;
    serviceIds: string[];
    scheduledAt: string; // ISO string
    customerName: string;
    customerPhone: string;
    lineUserId?: string;
    notes?: string;
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

export const bookingService = {
    /**
     * Create a new booking
     */
    async create(data: BookingData) {
        return apiClient.post('/bookings', data);
    },

    /**
     * Get available time slots for a staff member on a specific date
     */
    async getAvailability(staffId: string, date: string): Promise<TimeSlot[]> {
        return apiClient.get<TimeSlot[]>(`/bookings/staff/${staffId}/slots?date=${date}`);
    }
};
