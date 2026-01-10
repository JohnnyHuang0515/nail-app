export interface Coupon {
    id: string;
    title: string;
    discount: string;
    expiry: string;
    isActive: boolean;
    usedCount: number;
    // Raw data for editing
    code?: string;
    discountType?: string;
    discountValue?: number;
    validFrom?: string;
    validUntil?: string;
    usageLimit?: number;
}

export interface CouponCreateInput {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    validFrom: string;
    validUntil: string;
    isActive?: boolean;
    usageLimit?: number;
}

const API_URL = '/api/coupons';

export const couponService = {
    /**
     * Get all coupons
     */
    async getAll(): Promise<Coupon[]> {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch coupons');
        }
        return response.json();
    },

    /**
     * Create a new coupon
     */
    async create(data: CouponCreateInput): Promise<Coupon> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create coupon');
        }
        return response.json();
    },

    /**
     * Update an existing coupon
     */
    async update(id: string, data: Partial<CouponCreateInput>): Promise<Coupon> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update coupon');
        }
        return response.json();
    },

    /**
     * Toggle coupon active status
     */
    async toggle(id: string): Promise<{ id: string; isActive: boolean }> {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH',
        });
        if (!response.ok) {
            throw new Error('Failed to toggle coupon');
        }
        return response.json();
    },

    /**
     * Delete a coupon
     */
    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete coupon');
        }
    },
};
