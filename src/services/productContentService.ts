import { adminService, type AdminProduct } from './adminService';
import { productDetailsBackup, type ProductDetail } from '../data/productDetailsBackup';

export type ProductKind = 'drink' | 'fertilizer';

export interface ProductCardItem {
    id: string;
    slug: string;
    name: string;
    nameEn: string;
    shortDesc: string;
    shortDescEn: string;
    price: string;
    icon: string;
    kind: ProductKind;
}

const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

const inferKind = (product: Pick<AdminProduct, 'category' | 'productId'>): ProductKind => {
    const category = (product.category || '').toLowerCase();
    const id = (product.productId || '').toLowerCase();

    if (category.includes('phan') || category.includes('fert') || id.startsWith('phan-')) {
        return 'fertilizer';
    }

    return 'drink';
};

const getSummaryFromDescription = (description: string, fallback: string) => {
    const line = description
        .split('\n')
        .map((item) => item.trim())
        .find(Boolean);

    return line || fallback;
};

const createFallbackDetail = (product: AdminProduct): ProductDetail => {
    const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const kind = inferKind(product);
    const summary = getSummaryFromDescription(product.description || '', product.name);
    const commonUsage = kind === 'drink'
        ? 'Dùng 50-100ml mỗi lần, 1-2 lần/ngày. Lắc đều trước khi dùng.'
        : 'Pha theo tỉ lệ khuyến nghị trên bao bì, dùng định kỳ cho cây trồng.';
    const commonTips = kind === 'drink'
        ? ['Bảo quản lạnh sau khi mở nắp', 'Sử dụng đều đặn để tối ưu hiệu quả']
        : ['Dùng vào sáng sớm hoặc chiều mát', 'Kết hợp tưới nước để tăng hấp thu'];
    const commonIngredients = kind === 'drink'
        ? ['Nguyên liệu trái cây lên men', 'Hệ vi sinh có lợi', 'Nước tinh khiết']
        : ['Nguyên liệu hữu cơ lên men', 'Vi sinh vật có lợi', 'Khoáng chất tự nhiên'];

    return {
        id: product.productId,
        name: product.name,
        nameEn: product.name,
        icon: kind === 'drink' ? '🥤' : '🌱',
        price: formatPrice(displayPrice),
        size: product.unit ? `1 ${product.unit}` : '',
        sizeEn: product.unit ? `1 ${product.unit}` : '',
        expiry: '',
        expiryEn: '',
        storage: '',
        storageEn: '',
        mfg: '',
        mfgEn: '',
        summary,
        summaryEn: summary,
        definition: product.description || summary,
        definitionEn: product.description || summary,
        whyChosen: '',
        whyChosenEn: '',
        technicalReason: '',
        technicalReasonEn: '',
        sourceReason: '',
        sourceReasonEn: '',
        culturalValue: '',
        culturalValueEn: '',
        productionModel: '',
        productionModelEn: '',
        businessModel: '',
        businessModelEn: '',
        circularInput: '',
        circularInputEn: '',
        circularOutput: [],
        circularOutputEn: [],
        processDescription: '',
        processDescriptionEn: '',
        educationalContent: '',
        educationalContentEn: '',
        healthBenefits: [],
        nutritionFacts: [],
        fermentationExplanation: '',
        fermentationExplanationEn: '',
        ingredients: commonIngredients,
        ingredientsEn: commonIngredients,
        usage: commonUsage,
        usageEn: commonUsage,
        faqItems: [],
        blogReferences: [],
        disclaimer: '⚠️ Thực phẩm/bio-product, vui lòng sử dụng theo hướng dẫn.',
        disclaimerEn: '⚠️ Functional/bio product, use as directed.',
        tips: commonTips,
        tipsEn: commonTips,
    };
};

const mergeBackupWithApi = (backup: ProductDetail, apiProduct?: AdminProduct): ProductDetail => {
    if (!apiProduct) {
        return backup;
    }

    const displayPrice = apiProduct.salePrice && apiProduct.salePrice > 0 ? apiProduct.salePrice : apiProduct.price;

    return {
        ...backup,
        id: apiProduct.productId || backup.id,
        name: apiProduct.name || backup.name,
        nameEn: backup.nameEn || apiProduct.name,
        summary: backup.summary || apiProduct.description || apiProduct.name,
        summaryEn: backup.summaryEn || apiProduct.description || apiProduct.name,
        price: formatPrice(displayPrice),
    };
};

export const toRouteCategory = (kind: ProductKind) => (kind === 'drink' ? 'nuoc' : 'phan');

export const fromRouteCategory = (categoryParam: string | undefined): ProductKind | null => {
    if (categoryParam === 'nuoc') return 'drink';
    if (categoryParam === 'phan') return 'fertilizer';
    return null;
};

export const getBackupProductMap = (): Record<string, ProductDetail> => ({ ...productDetailsBackup });

export const getBackupCatalog = (): ProductCardItem[] => {
    return Object.values(productDetailsBackup).map((item) => ({
        id: item.id,
        slug: item.id,
        name: item.name,
        nameEn: item.nameEn,
        shortDesc: item.summary,
        shortDescEn: item.summaryEn,
        price: item.price,
        icon: item.icon,
        kind: item.id.startsWith('phan-') ? 'fertilizer' : 'drink',
    }));
};

export const getCatalogProducts = async (): Promise<ProductCardItem[]> => {
    try {
        const apiProducts = await adminService.getProducts();
        if (!apiProducts.length) {
            return [];
        }

        return apiProducts.map<ProductCardItem>((product) => {
            const backup = productDetailsBackup[product.productId];
            const kind = inferKind(product);
            const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
            const fallbackSummary = getSummaryFromDescription(product.description || '', product.name);

            return {
                id: product.productId,
                slug: product.productId,
                name: product.name,
                nameEn: backup?.nameEn || product.name,
                shortDesc: backup?.summary || fallbackSummary,
                shortDescEn: backup?.summaryEn || fallbackSummary,
                price: formatPrice(displayPrice),
                icon: backup?.icon || (kind === 'drink' ? '🥤' : '🌱'),
                kind,
            };
        });
    } catch {
        return [];
    }
};

export const getProductDetailById = async (productId: string): Promise<ProductDetail | null> => {
    const backup = productDetailsBackup[productId];

    try {
        const apiProducts = await adminService.getProducts();
        const apiProduct = apiProducts.find((item) => item.productId === productId);

        if (!apiProduct) {
            return null;
        }

        if (backup) {
            return mergeBackupWithApi(backup, apiProduct);
        }

        return createFallbackDetail(apiProduct);
    } catch {
        return null;
    }
};
