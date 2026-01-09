import { apiClient } from '@/lib/api';
import type { Stylist } from '@/pages/SelectStylist';

export const staffService = {
    /**
     * Get all active staff members
     * @returns Promise<Stylist[]>
     */
    async getAll(): Promise<Stylist[]> {
        return apiClient.get<Stylist[]>('/staff');
    },

    /**
     * Get a single staff member by ID
     * @param id - Staff member ID
     * @returns Promise<Stylist>
     */
    async getById(id: string): Promise<Stylist> {
        return apiClient.get<Stylist>(`/staff/${id}`);
    },
};
