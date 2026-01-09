import { apiClient } from '@/lib/api';

export interface Service {
    id: string;
    name: string;
    category: string;
    description?: string;
    durationMinutes: number;
    price: string; // Decimal from backend
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
}

export const serviceService = {
    /**
     * Get all services, optionally filtered by category
     * @param category - Optional category filter
     * @returns Promise<Service[]>
     */
    async getAll(category?: string): Promise<Service[]> {
        const params = category ? `?category=${encodeURIComponent(category)}` : '';
        return apiClient.get<Service[]>(`/services${params}`);
    },

    /**
     * Get all available service categories
     * @returns Promise<string[]>
     */
    async getCategories(): Promise<string[]> {
        return apiClient.get<string[]>('/services/categories');
    },

    /**
     * Get a single service by ID
     * @param id - Service ID
     * @returns Promise<Service>
     */
    async getById(id: string): Promise<Service> {
        return apiClient.get<Service>(`/services/${id}`);
    },
};
