/**
 * Payment Service - COD and PayOS Integration
 * Xử lý thanh toán COD (Cash on Delivery) và PayOS
 */

import { apiRequest } from './apiClient';

export type PaymentMethod = 'COD' | 'PAYOS';

export interface PaymentInfo {
    method: PaymentMethod;
    amount: number;
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
}

export interface PayOSPaymentResponse {
    paymentUrl: string;
    orderId: string;
    qrCode?: string;
    binCode?: string;
    accountNumber?: string;
    amount: number;
}

export interface PaymentVerification {
    success: boolean;
    orderId: string;
    transactionId?: string;
    paidAt?: string;
    amount?: number;
    message?: string;
}

const PAYOS_ENABLED = import.meta.env.VITE_ENABLE_PAYOS === 'true';
const COD_ENABLED = import.meta.env.VITE_ENABLE_COD !== 'false'; // Default true

/**
 * Service thanh toán
 */
export const paymentService = {
    /**
     * Kiểm tra phương thức thanh toán có được bật không
     */
    isMethodAvailable(method: PaymentMethod): boolean {
        if (method === 'COD') return COD_ENABLED;
        if (method === 'PAYOS') return PAYOS_ENABLED;
        return false;
    },

    /**
     * Lấy danh sách phương thức thanh toán khả dụng
     */
    getAvailableMethods(): PaymentMethod[] {
        const methods: PaymentMethod[] = [];
        if (COD_ENABLED) methods.push('COD');
        if (PAYOS_ENABLED) methods.push('PAYOS');
        return methods;
    },

    /**
     * Xử lý thanh toán COD
     * COD không cần xử lý gì đặc biệt, chỉ tạo đơn hàng
     */
    async processCOD(paymentInfo: PaymentInfo): Promise<{ success: boolean; orderId: string }> {
        if (!COD_ENABLED) {
            throw new Error('Thanh toán COD chưa được kích hoạt');
        }

        // COD: Không cần xử lý, đơn hàng đã được tạo
        return {
            success: true,
            orderId: paymentInfo.orderId,
        };
    },

    /**
     * Tạo link thanh toán PayOS
     */
    async createPayOSPayment(paymentInfo: PaymentInfo): Promise<PayOSPaymentResponse> {
        if (!PAYOS_ENABLED) {
            throw new Error('Thanh toán PayOS chưa được kích hoạt');
        }

        const response = await apiRequest<PayOSPaymentResponse>(
            '/payment/payos/create',
            'POST',
            {
                orderId: paymentInfo.orderId,
                amount: paymentInfo.amount,
                description: `Thanh toán đơn hàng ${paymentInfo.orderId}`,
                returnUrl: `${window.location.origin}/orders/${paymentInfo.orderId}?payment=success`,
                cancelUrl: `${window.location.origin}/orders/${paymentInfo.orderId}?payment=cancelled`,
                buyerName: paymentInfo.customerName,
                buyerPhone: paymentInfo.customerPhone,
                buyerAddress: paymentInfo.customerAddress,
            }
        );

        return response;
    },

    /**
     * Xác minh thanh toán PayOS
     */
    async verifyPayOSPayment(orderId: string): Promise<PaymentVerification> {
        try {
            const response = await apiRequest<PaymentVerification>(
                `/payment/payos/verify/${orderId}`,
                'GET'
            );

            return response;
        } catch (error) {
            console.error('PayOS verification error:', error);
            return {
                success: false,
                orderId,
                message: error instanceof Error ? error.message : 'Xác minh thanh toán thất bại',
            };
        }
    },

    /**
     * Hủy thanh toán PayOS
     */
    async cancelPayOSPayment(orderId: string): Promise<{ success: boolean }> {
        try {
            await apiRequest(
                `/payment/payos/cancel/${orderId}`,
                'POST'
            );

            return { success: true };
        } catch (error) {
            console.error('PayOS cancellation error:', error);
            return { success: false };
        }
    },

    /**
     * Format số tiền VND
     */
    formatAmount(amount: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    },

    /**
     * Lấy tên hiển thị của phương thức thanh toán
     */
    getMethodLabel(method: PaymentMethod, language: 'vi' | 'en' = 'vi'): string {
        const labels: Record<PaymentMethod, { vi: string; en: string }> = {
            COD: {
                vi: 'Thanh toán khi nhận hàng (COD)',
                en: 'Cash on Delivery (COD)',
            },
            PAYOS: {
                vi: 'Thanh toán online qua PayOS',
                en: 'Online Payment via PayOS',
            },
        };

        return labels[method][language];
    },

    /**
     * Lấy mô tả phương thức thanh toán
     */
    getMethodDescription(method: PaymentMethod, language: 'vi' | 'en' = 'vi'): string {
        const descriptions: Record<PaymentMethod, { vi: string; en: string }> = {
            COD: {
                vi: 'Thanh toán bằng tiền mặt khi nhận hàng. Phí ship sẽ được tính khi giao hàng.',
                en: 'Pay with cash upon delivery. Shipping fee will be calculated at delivery.',
            },
            PAYOS: {
                vi: 'Thanh toán trực tuyến qua PayOS - An toàn, nhanh chóng với Momo, ZaloPay, Banking.',
                en: 'Online payment via PayOS - Safe and fast with Momo, ZaloPay, Banking.',
            },
        };

        return descriptions[method][language];
    },
};
