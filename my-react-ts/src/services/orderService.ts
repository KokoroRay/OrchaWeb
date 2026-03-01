import { apiRequest } from './apiClient';

/** Đơn hàng */
export interface Order {
    orderId: string;
    userId: string;
    userEmail: string;
    userName: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

/** Mục trong đơn hàng */
export interface OrderItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

/** Input tạo đơn hàng mới */
export interface CreateOrderInput {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    note?: string;
}

/** Feedback / Review */
export interface CreateFeedbackInput {
    productId: string;
    rating: number; // 1-5
    comment: string;
}

/**
 * Service quản lý Đơn hàng & Feedback
 */
export const orderService = {
    /** 
     * Đặt hàng (Checkout): Lambda sẽ lấy giỏ hàng hiện tại -> Order, xóa giỏ hàng, gửi SES email
     */
    async create(input: CreateOrderInput): Promise<Order> {
        return apiRequest<Order>('/orders', 'POST', input);
    },

    /** 
     * Xem toàn bộ lịch sử mua hàng của user hiện tại
     */
    async getHistory(): Promise<Order[]> {
        return apiRequest<Order[]>('/orders');
    },

    /** 
     * Xem chi tiết 1 đơn hàng cụ thể
     */
    async getById(id: string): Promise<Order> {
        return apiRequest<Order>(`/orders/${id}`);
    },

    /** 
     * Gửi đánh giá cho 1 sản phẩm đã mua
     */
    async submitFeedback(input: CreateFeedbackInput): Promise<void> {
        return apiRequest<void>('/feedback', 'POST', input);
    },

    /** 
     * ADMIN: Xem tất cả đơn hàng từ tất cả user
     */
    async adminGetAll(): Promise<Order[]> {
        return apiRequest<Order[]>('/admin/orders');
    },

    /** 
     * ADMIN: Cập nhật trạng thái đơn hàng (CONFIRMED -> SHIPPING -> DELIVERED)
     */
    async adminUpdateStatus(id: string, status: Order['status']): Promise<Order> {
        return apiRequest<Order>(`/admin/orders/${id}`, 'PUT', { status });
    }
};
