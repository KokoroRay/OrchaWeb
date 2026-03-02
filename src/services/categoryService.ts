/**
 * Category Service
 * Quản lý danh mục sản phẩm
 */

export interface Category {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
    productCount?: number;
}

// Danh sách category mặc định cho ORCHA
export const DEFAULT_CATEGORIES: Category[] = [
    {
        id: 'all',
        name: 'Tất cả sản phẩm',
        nameEn: 'All Products',
        icon: '🌸',
        description: 'Xem tất cả sản phẩm',
    },
    {
        id: 'health',
        name: 'Sức khỏe phụ nữ',
        nameEn: 'Women\'s Health',
        icon: '💖',
        description: 'Sản phẩm chăm sóc sức khỏe phụ nữ',
    },
    {
        id: 'beauty',
        name: 'Làm đẹp',
        nameEn: 'Beauty',
        icon: '✨',
        description: 'Sản phẩm làm đẹp và chăm sóc da',
    },
    {
        id: 'supplement',
        name: 'Thực phẩm chức năng',
        nameEn: 'Supplements',
        icon: '🌿',
        description: 'Viên uống bổ sung dinh dưỡng',
    },
    {
        id: 'skincare',
        name: 'Chăm sóc da',
        nameEn: 'Skincare',
        icon: '🧴',
        description: 'Kem dưỡng, serum, toner',
    },
    {
        id: 'momcare',
        name: 'Mẹ và bé',
        nameEn: 'Mom & Baby',
        icon: '👶',
        description: 'Sản phẩm cho mẹ bầu và em bé',
    },
    {
        id: 'combo',
        name: 'Combo tiết kiệm',
        nameEn: 'Combo Deals',
        icon: '🎁',
        description: 'Gói sản phẩm combo giá ưu đãi',
    },
];

/**
 * Category Service
 */
export const categoryService = {
    /**
     * Lấy tất cả categories
     */
    getAll(): Category[] {
        return DEFAULT_CATEGORIES;
    },

    /**
     * Lấy category theo ID
     */
    getById(id: string): Category | undefined {
        return DEFAULT_CATEGORIES.find((cat) => cat.id === id);
    },

    /**
     * Lấy tên category theo ngôn ngữ
     */
    getName(id: string, language: 'vi' | 'en' = 'vi'): string {
        const category = this.getById(id);
        if (!category) return id;
        return language === 'vi' ? category.name : category.nameEn;
    },

    /**
     * Lấy categories cho dropdown (loại bỏ "all")
     */
    getForSelection(): Category[] {
        return DEFAULT_CATEGORIES.filter((cat) => cat.id !== 'all');
    },

    /**
     * Validate category ID
     */
    isValid(id: string): boolean {
        return DEFAULT_CATEGORIES.some((cat) => cat.id === id);
    },

    /**
     * Lấy màu sắc cho category badge
     */
    getCategoryColor(id: string): string {
        const colors: Record<string, string> = {
            all: '#6b7280',
            health: '#ef789a',
            beauty: '#f59e0b',
            supplement: '#10b981',
            skincare: '#8b5cf6',
            momcare: '#ec4899',
            combo: '#f43f5e',
        };
        return colors[id] || '#6b7280';
    },
};
