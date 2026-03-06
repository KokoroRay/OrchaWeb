import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { FaNewspaper } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCatalogProducts, type ProductCardItem } from '../../services/productContentService';
import styles from './SearchResultsPage.module.css';

// Mock blog data structure
interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    slug: string;
}

const mockBlogPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Lợi ích của các loại nước lên men',
        excerpt: 'Khám phá những lợi ích sức khỏe tuyệt vời từ các loại nước trái cây lên men tự nhiên',
        author: 'ORCHA Team',
        date: '15/02/2026',
        category: 'Sức khỏe',
        slug: 'fermented-water-benefits'
    },
    {
        id: '2',
        title: 'Cách lên men đúng cách tại nhà',
        excerpt: 'Hướng dẫn chi tiết để tạo ra các loại nước lên men chất lượng cao tại nhà',
        author: 'ORCHA Team',
        date: '10/02/2026',
        category: 'Hướng dẫn',
        slug: 'diy-fermentation-guide'
    },
    {
        id: '3',
        title: 'Các loại vi khuẩn lợi trong lên men',
        excerpt: 'Tìm hiểu về các loại vi khuẩn có lợi cho sức khỏe trong quá trình lên men',
        author: 'ORCHA Team',
        date: '05/02/2026',
        category: 'Kiến thức',
        slug: 'beneficial-bacteria-fermentation'
    },
];

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
    const [selectedTab, setSelectedTab] = useState<'all' | 'products' | 'blog'>('all');

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

    // Filter blog posts based on search query
    const filteredBlogPosts = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return mockBlogPosts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const getTabLabel = (tab: string, count: number) => {
        switch (tab) {
            case 'products':
                return `${isVi ? 'Sản phẩm' : 'Products'} (${count})`;
            case 'blog':
                return `${isVi ? 'Bài viết' : 'Articles'} (${count})`;
            default:
                return `${isVi ? 'Tất cả' : 'All'} (${filteredProducts.length + filteredBlogPosts.length})`;
        }
    };

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
                    <p>{isVi ? 'Tìm kiếm sản phẩm hoặc bài viết của chúng tôi' : 'Search our products and articles'}</p>
                </div>
            );
        }

        if (filteredProducts.length === 0 && filteredBlogPosts.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <FiAlertCircle className={styles.emptyIcon} />
                    <h3>{isVi ? 'Không tìm thấy kết quả' : 'No results found'}</h3>
                    <p>{isVi ? `Không có sản phẩm hoặc bài viết nào khớp với "${searchQuery}"` : `No products or articles match "${searchQuery}"`}</p>
                </div>
            );
        }

        const showProducts = selectedTab === 'all' || selectedTab === 'products';
        const showBlog = selectedTab === 'all' || selectedTab === 'blog';

        return (
            <div className={styles.resultsList}>
                {showProducts && filteredProducts.length > 0 && (
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
                                                {product.icon}
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
                )}

                {showBlog && filteredBlogPosts.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FaNewspaper className={styles.sectionIcon} />
                            <h3>{isVi ? 'Bài viết' : 'Articles'}</h3>
                            <span className={styles.resultCount}>{filteredBlogPosts.length}</span>
                        </div>
                        <div className={styles.articlesList}>
                            {filteredBlogPosts.map(post => (
                                <article key={post.id} className={styles.articleCard}>
                                    <div className={styles.articleMeta}>
                                        <span className={styles.articleCategory}>{post.category}</span>
                                        <span className={styles.articleDate}>{post.date}</span>
                                    </div>
                                    <h4 className={styles.articleTitle}>{post.title}</h4>
                                    <p className={styles.articleExcerpt}>{post.excerpt}</p>
                                    <div className={styles.articleAuthor}>
                                        <span>{isVi ? 'Tác giả' : 'By'}: {post.author}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
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

            {/* Tabs */}
            {searchQuery && (filteredProducts.length > 0 || filteredBlogPosts.length > 0) && (
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${selectedTab === 'all' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('all')}
                    >
                        {getTabLabel('all', 0)}
                    </button>
                    {filteredProducts.length > 0 && (
                        <button
                            className={`${styles.tab} ${selectedTab === 'products' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('products')}
                        >
                            {getTabLabel('products', filteredProducts.length)}
                        </button>
                    )}
                    {filteredBlogPosts.length > 0 && (
                        <button
                            className={`${styles.tab} ${selectedTab === 'blog' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('blog')}
                        >
                            {getTabLabel('blog', filteredBlogPosts.length)}
                        </button>
                    )}
                </div>
            )}

            {/* Results */}
            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
};
