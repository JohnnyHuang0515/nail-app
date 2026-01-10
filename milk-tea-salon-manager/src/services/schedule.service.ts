export interface ScheduleBooking {
    id: string;
    clientName: string;
    service: string;
    startTime: string;
    endTime: string;
    staffName: string;
    staffColor: 'pink' | 'blue' | 'lavender' | 'peach';
    date: string;
}

const API_URL = '/api/schedule';

export const scheduleService = {
    /**
     * Get bookings for a date range
     * @param startDate - Start date (inclusive)
     * @param endDate - End date (inclusive)
     * @returns Promise<ScheduleBooking[]>
     */
    async getBookings(startDate: Date, endDate: Date): Promise<ScheduleBooking[]> {
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const response = await fetch(`${API_URL}?startDate=${startStr}&endDate=${endStr}`);

        if (!response.ok) {
            throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();

        // Parse date strings back to Date objects for frontend use
        return data.map((booking: ScheduleBooking) => ({
            ...booking,
            date: new Date(booking.date),
        }));
    },
};
