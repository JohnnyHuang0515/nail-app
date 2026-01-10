export interface MemberProfile {
    id: string;
    name: string;
    phone: string;
    email?: string;
    totalSpent: number;
    visitCount: number;
    lastVisit?: string;
    notes?: string;
    memberTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    avatarUrl?: string;
    points: number; // Added points
    pointsToNext?: number;
    nextTier?: string;
}

const API_URL = '/api/clients';

export const memberService = {
    async convertToMember(clientData: any): Promise<MemberProfile> {
        return {
            ...clientData,
            memberTier: clientData.memberTier || 'Bronze',
            points: clientData.points || 0, // Ensure points exist
        };
    },

    async getProfileByPhone(phone: string): Promise<MemberProfile | null> {
        // 1. Find ID by phone (from list)
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch clients list');
        const clients = await response.json();
        const found = clients.find((c: any) => c.phone === phone);

        if (!found) return null;

        // 2. Fetch full details by ID
        return this.getProfileById(found.id);
    },

    async getProfileById(id: string): Promise<MemberProfile> {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        return this.convertToMember(data);
    }
};

