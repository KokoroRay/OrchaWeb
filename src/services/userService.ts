import { apiRequest } from './apiClient';

export interface User {
    userId: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    role: 'CUSTOMER' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileInput {
    name: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
}

/**
 * User Service - Quản lý profile người dùng
 */
export const userService = {
    /**
     * Lấy thông tin profile hiện tại
     */
    async getProfile(): Promise<User> {
        return apiRequest<User>('/users/profile');
    },

    /**
     * Cập nhật profile người dùng
     */
    async updateProfile(input: UpdateProfileInput): Promise<User> {
        return apiRequest<User>('/users/profile', 'PUT', input);
    },
};
