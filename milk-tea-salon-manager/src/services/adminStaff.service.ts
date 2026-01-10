export interface StaffMember {
    id: string;
    name: string;
    role: string;
    isOnShift: boolean;
    phone?: string;
    email?: string;
}

export interface StaffCreateInput {
    name: string;
    role: string;
    phone?: string;
    email?: string;
}

const API_URL = '/api/admin/staff';

export const adminStaffService = {
    async getAll(): Promise<StaffMember[]> {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch staff');
        return response.json();
    },

    async create(data: StaffCreateInput): Promise<StaffMember> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create staff');
        return response.json();
    },

    async update(id: string, data: Partial<StaffCreateInput & { isOnShift: boolean }>): Promise<StaffMember> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update staff');
        return response.json();
    },

    async toggleShift(id: string): Promise<StaffMember> {
        const response = await fetch(`${API_URL}/${id}/toggle-shift`, {
            method: 'PATCH',
        });
        if (!response.ok) throw new Error('Failed to toggle shift');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete staff');
    },
};
