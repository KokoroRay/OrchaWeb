import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaLeaf, FaWater, FaSeedling, FaArrowRight } from 'react-icons/fa';
import { fromRouteCategory, getCatalogProducts, type ProductCardItem } from '../../services/productContentService';
import styles from './ProductListPage.module.css';

export const ProductListPage = () => {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isVi = language === 'vi';

    const [products, setProducts] = useState<ProductCardItem[]>([]);

    useEffect(() => {
        const loadProducts = async () => {
            const data = await getCatalogProducts();
            setProducts(data);
        };

        void loadProducts();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category]);

    const categoryType = fromRouteCategory(category);
    const isAllProductsPage = !category;

    const info = useMemo(() => {
        if (isAllProductsPage) {
            return {
                title: isVi ? 'Sản phẩm ORCHA' : 'ORCHA Products',
                subtitle: isVi
                    ? 'Khám phá dòng sản phẩm từ nước trái cây lên men và phân vi sinh tự nhiên'
                    : 'Discover fermented fruit drinks and natural microbial fertilizers',
                icon: FaLeaf,
            };
        }

        if (categoryType === 'drink') {
            return {
                title: isVi ? 'Nước Uống Lên Men' : 'Fermented Drinks',
                subtitle: isVi
                    ? 'Giải khát tự nhiên từ quá trình lên men trái cây'
                    : 'Natural refreshment from fruit fermentation',
                icon: FaWater,
            };
        }

        return {
            title: isVi ? 'Phân Vi Sinh' : 'Organic Fertilizers',
            subtitle: isVi
                ? 'Cải tạo đất và nuôi dưỡng cây trồng bền vững'
                : 'Improving soil and nourishing crops sustainably',
            icon: FaSeedling,
        };
    }, [categoryType, isAllProductsPage, isVi]);

    if (!isAllProductsPage && !categoryType) {
        navigate('/');
        return null;
    }

    const list = isAllProductsPage ? products : products.filter((item) => item.kind === categoryType);
    const CategoryIcon = info.icon;

    return (
        <div className={styles.container}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <CategoryIcon className={styles.heroIcon} />
                    <h1 className={styles.heroTitle}>{info.title}</h1>
                    <p className={styles.heroSubtitle}>{info.subtitle}</p>
                </div>
            </section>

            <section className={styles.gridSection}>
                <div className={styles.grid}>
                    {list.map((product) => (
                        <button
                            key={product.id}
                            className={styles.card}
                            onClick={() => navigate(`/products/${product.kind === 'drink' ? 'nuoc' : 'phan'}/${product.slug}`)}
                        >
                            {product.imageUrl ? (
                                <div className={styles.cardImage}>
                                    <img src={product.imageUrl} alt={product.name} />
                                </div>
                            ) : (
                                <div className={styles.cardIcon}>{product.icon}</div>
                            )}
                            <h3 className={styles.cardTitle}>{isVi ? product.name : product.nameEn}</h3>
                            <p className={styles.cardDesc}>{isVi ? product.shortDesc : product.shortDescEn}</p>
                            <span className={styles.cardCta}>
                                {isVi ? 'Xem chi tiết' : 'View details'}
                                <FaArrowRight />
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <FaLeaf className={styles.ctaIcon} />
                    <h2>{isVi ? 'Cần tư vấn thêm?' : 'Need more info?'}</h2>
                    <p>
                        {isVi
                            ? 'Liên hệ để được tư vấn chi tiết và báo giá phù hợp.'
                            : 'Contact us for detailed consultation and pricing.'}
                    </p>
                    <button className={styles.ctaButton} onClick={() => navigate('/contact')}>
                        {isVi ? 'Liên hệ ngay' : 'Contact now'}
                    </button>
                </div>
            </section>
        </div>
    );
};
