export interface Product {
    id: string;
    name: string;
    brand?: string; // Optional as per DB
    category?: string;
    stock: number; // Mapped from 'quantity'
    unit?: string;
    supplier?: string;
    costPrice?: number;
    minStockLevel?: number;
}

const API_URL = '/api/inventory'; // Relative path for proxy

export const inventoryService = {
    getAll: async (): Promise<Product[]> => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            brand: item.supplier, // Mapping supplier to brand for UI consistency if needed, or just use supplier
            category: item.category,
            stock: item.quantity,
            unit: item.unit,
            supplier: item.supplier,
            costPrice: item.costPrice,
            minStockLevel: item.minStockLevel
        }));
    },

    create: async (product: Omit<Product, 'id'>) => {
        const payload = {
            name: product.name,
            category: product.category,
            quantity: product.stock,
            unit: product.unit,
            supplier: product.supplier || product.brand, // Fallback
            minStockLevel: product.minStockLevel,
            costPrice: product.costPrice
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.[0]?.message || 'Failed to create product');
        }
        return response.json();
    },

    update: async (id: string, product: Partial<Product>) => {
        const payload: any = {};
        if (product.name) payload.name = product.name;
        if (product.category) payload.category = product.category;
        if (product.stock !== undefined) payload.quantity = product.stock;
        if (product.unit) payload.unit = product.unit;
        if (product.brand) payload.supplier = product.brand;
        if (product.supplier) payload.supplier = product.supplier;

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
    }
};
