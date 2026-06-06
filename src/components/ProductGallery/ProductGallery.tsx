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
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [products, setProducts] = useState<ProductCardItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'drink' | 'fertilizer'>('all');

    // Drag and scroll state
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const isPaused = useRef(false);

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

    // Auto scroll and infinite loop logic
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || filteredProducts.length === 0) return;

        let animationId: number;

        const scroll = () => {
            if (!isPaused.current && !isDragging.current) {
                wrapper.scrollLeft += 1;
                // Infinite loop check: when scrolled past 1/3 of the total width
                if (wrapper.scrollLeft >= wrapper.scrollWidth / 3) {
                    wrapper.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(scroll);
        };

        animationId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [filteredProducts.length]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        isDragging.current = true;
        startX.current = e.pageX - wrapper.offsetLeft;
        scrollLeft.current = wrapper.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        isPaused.current = false;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX.current) * 2; // scroll-fast
        wrapper.scrollLeft = scrollLeft.current - walk;
        
        // Handle infinite boundaries during drag
        if (wrapper.scrollLeft >= wrapper.scrollWidth / 3) {
            wrapper.scrollLeft -= wrapper.scrollWidth / 3;
            startX.current = e.pageX - wrapper.offsetLeft;
            scrollLeft.current = wrapper.scrollLeft;
        } else if (wrapper.scrollLeft <= 0) {
            wrapper.scrollLeft += wrapper.scrollWidth / 3;
            startX.current = e.pageX - wrapper.offsetLeft;
            scrollLeft.current = wrapper.scrollLeft;
        }
    };

    const handleScroll = () => {
        // Handle infinite boundaries for trackpad scroll
        const wrapper = wrapperRef.current;
        if (!wrapper || isDragging.current) return;
        
        if (wrapper.scrollLeft >= wrapper.scrollWidth / 3) {
            wrapper.scrollLeft -= wrapper.scrollWidth / 3;
        } else if (wrapper.scrollLeft <= 0) {
            wrapper.scrollLeft += wrapper.scrollWidth / 3;
        }
    };

    const handleProductClick = (product: ProductCardItem) => {
        // Only click if we weren't just dragging significantly
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

                <div 
                    className={styles.carouselWrapper}
                    ref={wrapperRef}
                    onMouseEnter={() => isPaused.current = true}
                    onMouseLeave={handleMouseLeave}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={handleScroll}
                    onTouchStart={() => isPaused.current = true}
                    onTouchEnd={() => isPaused.current = false}
                >
                    <div className={styles.carouselTrack} ref={carouselRef}>
                        {duplicatedProducts.map((product, index) => (
                            <div
                                key={`${product.id}-${index}`}
                                className={styles.productCard}
                                onClick={() => handleProductClick(product)}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.productImage}>
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className={styles.productImg} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                <span className={styles.productIcon}>{product.icon}</span>
                                            </div>
                                        )}
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
