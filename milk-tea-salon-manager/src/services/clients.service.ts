export interface Client {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    lastVisit: string;
    isNew: boolean;
    totalSpend: number;
    visitCount: number;
    memberTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface ClientDetails extends Client {
    email?: string;
    points: number;
    pointsToNext: number;
    nextTier: string;
    history: VisitHistory[];
    upcoming: UpcomingBooking[];
}

export interface VisitHistory {
    id: string;
    date: string;
    service: string;
    staff: string;
    price: number;
}

export interface UpcomingBooking {
    id: string;
    date: string;
    time: string;
    service: string;
    staff: string;
    reminderSent: boolean;
}

export interface ClientCreateInput {
    name: string;
    phone: string;
    email?: string;
}

const API_URL = '/api/clients';

export const clientService = {
    async getAll(search?: string): Promise<Client[]> {
        const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch clients');
        return response.json();
    },

    async getById(id: string): Promise<ClientDetails> {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch client');
        return response.json();
    },

    async create(data: ClientCreateInput): Promise<Client> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create client');
        return response.json();
    },

    async update(id: string, data: Partial<ClientCreateInput>): Promise<Client> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update client');
        return response.json();
    },
};
