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

const createFallbackDetail = (product: AdminProduct): ProductDetail => {
    const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const kind = inferKind(product);

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
        summary: product.description || product.name,
        summaryEn: product.description || product.name,
        definition: product.description || product.name,
        definitionEn: product.description || product.name,
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
        ingredients: [],
        ingredientsEn: [],
        usage: '',
        usageEn: '',
        faqItems: [],
        blogReferences: [],
        disclaimer: '⚠️ Thực phẩm/bio-product, vui lòng sử dụng theo hướng dẫn.',
        disclaimerEn: '⚠️ Functional/bio product, use as directed.',
        tips: [],
        tipsEn: [],
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
    const backupList = getBackupCatalog();

    try {
        const apiProducts = await adminService.getProducts();
        if (!apiProducts.length) {
            return backupList;
        }

        const fromApi = apiProducts.map<ProductCardItem>((product) => {
            const backup = productDetailsBackup[product.productId];
            const kind = inferKind(product);
            const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

            return {
                id: product.productId,
                slug: product.productId,
                name: product.name,
                nameEn: backup?.nameEn || product.name,
                shortDesc: backup?.summary || product.description || product.name,
                shortDescEn: backup?.summaryEn || product.description || product.name,
                price: formatPrice(displayPrice),
                icon: backup?.icon || (kind === 'drink' ? '🥤' : '🌱'),
                kind,
            };
        });

        const map = new Map<string, ProductCardItem>();
        [...backupList, ...fromApi].forEach((item) => {
            map.set(item.id, item);
        });

        return Array.from(map.values());
    } catch {
        return backupList;
    }
};

export const getProductDetailById = async (productId: string): Promise<ProductDetail | null> => {
    const backup = productDetailsBackup[productId];

    try {
        const apiProducts = await adminService.getProducts();
        const apiProduct = apiProducts.find((item) => item.productId === productId);

        if (backup) {
            return mergeBackupWithApi(backup, apiProduct);
        }

        if (apiProduct) {
            return createFallbackDetail(apiProduct);
        }

        return null;
    } catch {
        return backup || null;
    }
};
