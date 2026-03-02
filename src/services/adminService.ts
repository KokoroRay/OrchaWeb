import { apiRequest } from './apiClient.ts';

export interface AdminProduct {
    productId: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    category: string;
    images: string[];
    stock: number;
    unit: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminProductInput {
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    category: string;
    images: string[];
    stock: number;
    unit: string;
}

export type AdminUserRole = 'CUSTOMER' | 'ADMIN';

export interface AdminUser {
    userId: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    role: AdminUserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminFeedback {
    feedbackId: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const adminService = {
    async getProducts(): Promise<AdminProduct[]> {
        return apiRequest<AdminProduct[]>('/products');
    },

    async createProduct(input: AdminProductInput): Promise<AdminProduct> {
        return apiRequest<AdminProduct>('/admin/products', 'POST', input);
    },

    async updateProduct(productId: string, input: AdminProductInput): Promise<AdminProduct> {
        return apiRequest<AdminProduct>(`/admin/products/${productId}`, 'PUT', input);
    },

    async deleteProduct(productId: string): Promise<void> {
        await apiRequest<void>(`/admin/products/${productId}`, 'DELETE');
    },

    async getUsers(): Promise<AdminUser[]> {
        return apiRequest<AdminUser[]>('/admin/users');
    },

    async updateUser(userId: string, payload: { role?: AdminUserRole; isActive?: boolean }): Promise<AdminUser> {
        return apiRequest<AdminUser>(`/admin/users/${userId}`, 'PUT', payload);
    },

    async getFeedbacks(): Promise<AdminFeedback[]> {
        return apiRequest<AdminFeedback[]>('/admin/feedback');
    },

    async deleteFeedback(feedbackId: string): Promise<void> {
        await apiRequest<void>(`/admin/feedback/${feedbackId}`, 'DELETE');
    },
};
