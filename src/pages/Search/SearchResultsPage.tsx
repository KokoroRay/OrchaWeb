import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCatalogProducts, type ProductCardItem } from '../../services/productContentService';
import styles from './SearchResultsPage.module.css';

export const SearchResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isVi = language === 'vi';

    const searchQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('q') || '';
    }, [location.search]);

    const [products, setProducts] = useState<ProductCardItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getCatalogProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return products.filter(product =>
            (isVi ? product.name : product.nameEn).toLowerCase().includes(query) ||
            (isVi ? product.shortDesc : product.shortDescEn).toLowerCase().includes(query)
        );
    }, [searchQuery, products, isVi]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{isVi ? 'Đang tìm kiếm...' : 'Searching...'}</p>
                </div>
            );
        }

        if (!searchQuery.trim()) {
            return (
                <div className={styles.emptyState}>
                    <FiSearch className={styles.emptyIcon} />
                    <h3>{isVi ? 'Nhập từ khóa để tìm kiếm' : 'Enter keywords to search'}</h3>
                    <p>{isVi ? 'Tìm kiếm sản phẩm của chúng tôi' : 'Search our products'}</p>
                </div>
            );
        }

        if (filteredProducts.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <FiAlertCircle className={styles.emptyIcon} />
                    <h3>{isVi ? 'Không tìm thấy kết quả' : 'No results found'}</h3>
                    <p>{isVi ? `Không có sản phẩm nào khớp với "${searchQuery}"` : `No products match "${searchQuery}"`}</p>
                </div>
            );
        }

        return (
            <div className={styles.resultsList}>
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <FiPackage className={styles.sectionIcon} />
                        <h3>{isVi ? 'Sản phẩm' : 'Products'}</h3>
                        <span className={styles.resultCount}>{filteredProducts.length}</span>
                    </div>
                    <div className={styles.productsGrid}>
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className={styles.productCard}
                                onClick={() => navigate(`/products/${product.kind === 'drink' ? 'nuoc' : 'phan'}/${product.slug}`)}
                            >
                                <div className={styles.productImageWrapper}>
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                                    ) : (
                                        <div className={styles.productIconPlaceholder}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                                <path d="m3.3 7 8.7 5 8.7-5" />
                                                <path d="M12 22V12" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className={styles.productType}>
                                        {product.kind === 'drink' ? (isVi ? 'Nước' : 'Drink') : (isVi ? 'Phân bón' : 'Fertilizer')}
                                    </div>
                                </div>
                                <div className={styles.productInfo}>
                                    <h4 className={styles.productTitle}>{isVi ? product.name : product.nameEn}</h4>
                                    <p className={styles.productDesc}>{isVi ? product.shortDesc : product.shortDescEn}</p>
                                    <span className={styles.productPrice}>{product.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.searchResultsPage}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/')}>
                    <FiArrowLeft /> {isVi ? 'Quay lại' : 'Back'}
                </button>
                <div className={styles.headerContent}>
                    <h1>{isVi ? 'Kết quả tìm kiếm' : 'Search Results'}</h1>
                    {searchQuery && (
                        <p className={styles.headerSubtitle}>
                            {isVi ? 'Tìm kiếm: ' : 'Query: '}<strong>"{searchQuery}"</strong>
                        </p>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
};
