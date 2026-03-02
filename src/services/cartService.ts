import { apiRequest } from './apiClient.ts';

/** Mục trong giỏ hàng */
export interface CartItem {
    userId: string;
    productId: string;
    quantity: number;
    addedAt: string;
}

/** Mục giỏ hàng với thông tin sản phẩm */
export interface CartItemWithProduct extends CartItem {
    productName: string;
    price: number;
    salePrice?: number;
    imageUrl?: string;
    stock: number;
}

/** Input thêm vào giỏ hàng */
export interface AddToCartInput {
    productId: string;
    quantity: number;
}

/** Input cập nhật giỏ hàng */
export interface UpdateCartInput {
    productId: string;
    quantity: number;
}

const toNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCartItem = (value: unknown): CartItemWithProduct | null => {
    if (!value || typeof value !== 'object') return null;
    const raw = value as Record<string, unknown>;

    const productId = String(raw.productId || raw.id || '').trim();
    if (!productId) return null;

    return {
        userId: String(raw.userId || ''),
        productId,
        quantity: Math.max(1, toNumber(raw.quantity, 1)),
        addedAt: String(raw.addedAt || raw.updatedAt || raw.createdAt || ''),
        productName: String(raw.productName || raw.name || productId),
        price: toNumber(raw.price),
        salePrice: raw.salePrice !== undefined ? toNumber(raw.salePrice) : undefined,
        imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
        stock: Math.max(0, toNumber(raw.stock, 0)),
    };
};

const normalizeCartPayload = (payload: unknown): CartItemWithProduct[] => {
    if (Array.isArray(payload)) {
        return payload.map(normalizeCartItem).filter((item): item is CartItemWithProduct => item !== null);
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const raw = payload as Record<string, unknown>;
    const candidates = [raw.items, raw.cartItems, raw.data, raw.cart];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate
                .map(normalizeCartItem)
                .filter((item): item is CartItemWithProduct => item !== null);
        }
    }

    return [];
};

/**
 * Service quản lý Giỏ hàng
 */
export const cartService = {
    /** 
     * Thêm sản phẩm vào giỏ hàng
     */
    async addItem(input: AddToCartInput): Promise<CartItem> {
        return apiRequest<CartItem>('/cart', 'POST', input);
    },

    /** 
     * Xem tất cả các mục trong giỏ hàng (có thông tin sản phẩm)
     */
    async getCart(): Promise<CartItemWithProduct[]> {
        const payload = await apiRequest<unknown>('/cart');
        return normalizeCartPayload(payload);
    },

    /** 
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     */
    async updateItem(input: UpdateCartInput): Promise<void> {
        return apiRequest<void>('/cart', 'PUT', input);
    },

    /** 
     * Xóa sản phẩm khỏi giỏ hàng
     */
    async removeItem(productId: string): Promise<void> {
        return apiRequest<void>(`/cart/${productId}`, 'DELETE');
    },

    /** 
     * Xóa tất cả các mục trong giỏ hàng
     */
    async clearCart(items: CartItemWithProduct[]): Promise<void> {
        // Xóa từng item trong giỏ
        for (const item of items) {
            try {
                await this.removeItem(item.productId);
            } catch (error) {
                console.error(`Lỗi khi xóa sản phẩm ${item.productId}:`, error);
            }
        }
    }
};
