import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCatalogProducts, toRouteCategory, type ProductCardItem } from '../../services/productContentService';
import styles from './ProductGallery.module.css';

const AllIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 15.7 6.8 18l1-5.8L3.6 8.1l5.8-.8L12 2z" />
    </svg>
);

const DrinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    </svg>
);

const FertilizerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c5 0 9-4 9-9H3c0 5 4 9 9 9z" />
        <path d="M7 12c0-3 2-5 5-5s5 2 5 5" />
    </svg>
);

export const ProductGallery = () => {
    const { t, language } = useLanguage();
    const isVi = language === 'vi';
    const navigate = useNavigate();
    const carouselRef = useRef<HTMLDivElement>(null);

    const [products, setProducts] = useState<ProductCardItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'drink' | 'fertilizer'>('all');

    useEffect(() => {
        const loadProducts = async () => {
            const data = await getCatalogProducts();
            setProducts(data);
        };

        void loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (activeFilter === 'all') return products;
        return products.filter((product) => product.kind === activeFilter);
    }, [activeFilter, products]);

    const duplicatedProducts = useMemo(() => {
        return [...filteredProducts, ...filteredProducts, ...filteredProducts];
    }, [filteredProducts]);

    const handleProductClick = (product: ProductCardItem) => {
        navigate(`/products/${toRouteCategory(product.kind)}/${product.slug}`);
    };

    return (
        <section id="products" className={styles.productGallery}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>{t('products.title')}</h2>
                    <p className={styles.sectionSubtitle}>{t('products.subtitle')}</p>
                </div>

                <div className={styles.filterTabs}>
                    <button className={`${styles.filterTab} ${activeFilter === 'all' ? styles.active : ''}`} onClick={() => setActiveFilter('all')}>
                        <span className={styles.filterIcon}><AllIcon /></span>
                        {t('products.all')}
                    </button>
                    <button className={`${styles.filterTab} ${activeFilter === 'drink' ? styles.active : ''}`} onClick={() => setActiveFilter('drink')}>
                        <span className={styles.filterIcon}><DrinkIcon /></span>
                        {t('products.drinks')}
                    </button>
                    <button className={`${styles.filterTab} ${activeFilter === 'fertilizer' ? styles.active : ''}`} onClick={() => setActiveFilter('fertilizer')}>
                        <span className={styles.filterIcon}><FertilizerIcon /></span>
                        {t('products.fertilizers')}
                    </button>
                </div>

                <div className={styles.carouselWrapper}>
                    <div
                        className={styles.carouselTrack}
                        ref={carouselRef}
                        style={{ animationDuration: `${Math.max(filteredProducts.length, 1) * 8}s` }}
                    >
                        {duplicatedProducts.map((product, index) => (
                            <div
                                key={`${product.id}-${index}`}
                                className={styles.productCard}
                                onClick={() => handleProductClick(product)}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.productImage}>
                                        <div className={styles.imagePlaceholder}>
                                            <span className={styles.productIcon}>{product.icon}</span>
                                        </div>
                                        <div className={styles.typeTag}>
                                            {product.kind === 'drink' ? t('ui.drinkType') : t('ui.fertType')}
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.productTitle}>{isVi ? product.name : product.nameEn}</h3>
                                        <p className={styles.productDescription}>{isVi ? product.shortDesc : product.shortDescEn}</p>
                                        <div className={styles.price}>{product.price}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.ctaSection}>
                    <h3>{t('products.interest')}</h3>
                    <p>{t('products.consult')}</p>
                    <div className={styles.ctaButtons}>
                        <button className={styles.primaryCta}>{t('products.contact')}</button>
                        <button className={styles.secondaryCta}>{t('products.catalog')}</button>
                    </div>
                </div>
            </div>
        </section>
    );
};
