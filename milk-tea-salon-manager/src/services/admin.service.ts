export interface DashboardStats {
    revenue: number;
    bookings: number;
    pending: number;
}

export interface Booking {
    id: string;
    scheduledAt: string; // ISO string
    status: string;
    customer: {
        name: string;
    };
    items: {
        service: {
            name: string;
        };
    }[];
}

const API_BASE_url = 'http://localhost:3000/api/admin';

export const adminService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await fetch(`${API_BASE_url}/dashboard-stats`);
        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }
        return response.json();
    },

    getTodayBookings: async (): Promise<Booking[]> => {
        const response = await fetch(`${API_BASE_url}/today-bookings`);
        if (!response.ok) {
            throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }
        return response.json();
    }
};
