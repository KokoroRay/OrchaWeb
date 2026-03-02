/**
 * Category Service
 * Quản lý danh mục sản phẩm
 */

import { adminService, type AdminCategory } from './adminService.ts';

export interface Category {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
    productCount?: number;
}

// Fallback categories nếu backend không hoạt động
export const DEFAULT_CATEGORIES: Category[] = [
    {
        id: 'all',
        name: 'Tất cả sản phẩm',
        nameEn: 'All Products',
        icon: '🌸',
        description: 'Xem tất cả sản phẩm',
    },
    {
        id: 'nuoc',
        name: 'Nước lên men',
        nameEn: 'Fermented Water',
        icon: '🥤',
        description: 'Nước lên men từ khóm',
    },
    {
        id: 'phan',
        name: 'Phân dữ liệu',
        nameEn: 'Fertilizer',
        icon: '🌱',
        description: 'Phân sinh học',
    },
];

// Cache categories từ backend
let cachedCategories: Category[] | null = null;
let fetchPromise: Promise<Category[]> | null = null;

const convertAdminCategoryToCategory = (admin: AdminCategory): Category => ({
    id: admin.categoryId,
    name: admin.name,
    nameEn: admin.nameEn,
    icon: admin.icon,
    description: admin.description,
    productCount: admin.productCount,
});

/**
 * Category Service
 */
export const categoryService = {
    /**
     * Lấy tất cả categories từ backend (có cache)
     */
    async getAll(): Promise<Category[]> {
        if (cachedCategories) {
            return cachedCategories;
        }

        // Nếu đang fetch, chờ promise
        if (fetchPromise) {
            return fetchPromise;
        }

        // Bắt đầu fetch
        fetchPromise = (async () => {
            try {
                const adminCategories = await adminService.getCategories();
                cachedCategories = adminCategories.map(convertAdminCategoryToCategory);
                return cachedCategories;
            } catch {
                // Fallback to defaults nếu backend lỗi
                cachedCategories = DEFAULT_CATEGORIES;
                return DEFAULT_CATEGORIES;
            } finally {
                fetchPromise = null;
            }
        })();

        return fetchPromise;
    },

    /**
     * Lấy categories để dropdown (loại bỏ "all")
     */
    async getForSelection(): Promise<Category[]> {
        const all = await this.getAll();
        return all.filter((cat) => cat.id !== 'all');
    },

    /**
     * Lấy category theo ID (dùng cache)
     */
    async getById(id: string): Promise<Category | undefined> {
        const all = await this.getAll();
        return all.find((cat) => cat.id === id);
    },

    /**
     * Lấy tên category theo ngôn ngữ
     */
    async getName(id: string, language: 'vi' | 'en' = 'vi'): Promise<string> {
        const category = await this.getById(id);
        if (!category) return id;
        return language === 'vi' ? category.name : category.nameEn;
    },

    /**
     * Validate category ID
     */
    async isValid(id: string): Promise<boolean> {
        const all = await this.getAll();
        return all.some((cat) => cat.id === id);
    },

    /**
     * Xóa cache (dùng khi tạo/cập nhật category)
     */
    invalidateCache(): void {
        cachedCategories = null;
    },

    /**
     * Lấy màu sắc cho category badge
     */
    getCategoryColor(id: string): string {
        const colors: Record<string, string> = {
            all: '#6b7280',
            'nuoc-khom-len-men': '#ef789a',
            'nuoc': '#0288d1',
            'phan': '#10b981',
            'supplement': '#8b5cf6',
            'skincare': '#f59e0b',
            'momcare': '#ec4899',
            'combo': '#f43f5e',
        };
        return colors[id] || '#94a3b8';
    },
};
