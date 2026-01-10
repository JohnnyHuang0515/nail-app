export interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
    description?: string;
    isActive?: boolean;
}

export interface ServiceCreateInput {
    name: string;
    category: string;
    durationMinutes: number;
    price: number;
    description?: string;
}

const API_URL = '/api/admin/services';

export const servicesService = {
    async getAll(includeInactive = true): Promise<Service[]> {
        const url = includeInactive ? `${API_URL}?includeInactive=true` : API_URL;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch services');
        return response.json();
    },

    async getCategories(): Promise<string[]> {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    async create(data: ServiceCreateInput): Promise<Service> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create service');
        return response.json();
    },

    async update(id: string, data: Partial<ServiceCreateInput>): Promise<Service> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update service');
        return response.json();
    },

    async toggle(id: string): Promise<{ id: string; isActive: boolean }> {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH',
        });
        if (!response.ok) throw new Error('Failed to toggle service');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete service');
    },
};
