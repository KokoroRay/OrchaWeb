import { apiRequest } from './apiClient.ts';

export interface AdminCategory {
    categoryId: string;
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
    productCount?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminCategoryInput {
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
}

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
    detailSummary?: string;
    benefits?: string;
    ingredients?: string;
    usage?: string;
    faq?: string;
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
    detailSummary?: string;
    benefits?: string;
    ingredients?: string;
    usage?: string;
    faq?: string;
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
    async getCategories(): Promise<AdminCategory[]> {
        return apiRequest<AdminCategory[]>('/categories');
    },

    async createCategory(input: AdminCategoryInput): Promise<AdminCategory> {
        return apiRequest<AdminCategory>('/admin/categories', 'POST', input);
    },

    async updateCategory(categoryId: string, input: Partial<AdminCategoryInput>): Promise<AdminCategory> {
        return apiRequest<AdminCategory>(`/admin/categories/${categoryId}`, 'PUT', input);
    },

    async deleteCategory(categoryId: string): Promise<void> {
        await apiRequest<void>(`/admin/categories/${categoryId}`, 'DELETE');
    },

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
