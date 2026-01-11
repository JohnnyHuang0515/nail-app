export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AdminBooking {
    id: string;
    customerName: string;
    customerPhone: string;
    stylistName: string;
    services: string;
    scheduledAt: string;
    status: BookingStatus;
    totalPrice: number;
    notes?: string;
}

export interface CreateBookingDTO {
    customerName: string;
    customerPhone: string;
    stylistId: string;
    serviceIds: string[];
    scheduledAt: string;
    notes?: string;
}

const API_URL = '/api/admin/bookings';
const PUBLIC_BOOKING_URL = '/api/bookings';

export const adminBookingService = {
    async getAll(filters?: { status?: string; startDate?: string; endDate?: string }): Promise<AdminBooking[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const url = params.toString() ? `${API_URL}?${params}` : API_URL;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return response.json();
    },

    async updateStatus(id: string, status: BookingStatus): Promise<{ id: string; status: BookingStatus }> {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update booking status');
        return response.json();
    },

    async create(data: CreateBookingDTO): Promise<any> {
        // Use Admin API to ensure customer is handled correctly (created or found by phone)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
                staffId: data.stylistId // Map stylistId to staffId expected by schema/logic (if reusing schema, but here we used custom logic)
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create booking');
        }
        return response.json();
    },

    async update(id: string, data: Partial<CreateBookingDTO>): Promise<AdminBooking> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update booking');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete booking');
    }
};
