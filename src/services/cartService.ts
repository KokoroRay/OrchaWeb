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
        return apiRequest<CartItemWithProduct[]>('/cart');
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
