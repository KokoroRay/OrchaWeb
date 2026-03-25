import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { cartService } from '../../services/cartService';
import { getProductDetailById } from '../../services/productContentService';
import type { ProductDetail } from '../../data/productDetailsBackup';
import styles from './ProductDetailPage.module.css';

export const ProductDetailPage = () => {
    const { category, productId } = useParams<{ category: string; productId: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { isAuthenticated } = useAuthContext();

    const isVi = language === 'vi';

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [activeTab, setActiveTab] = useState<'nutrition' | 'usage' | 'faq'>('nutrition');
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        definition: false,
        whyChosen: false,
        circular: false,
        process: false,
        fermentation: false,
        healthBenefits: false,
    });

    useEffect(() => {
        const loadProduct = async () => {
            if (!productId) {
                setProduct(null);
                return;
            }

            const detail = await getProductDetailById(productId);
            setProduct(detail);
        };

        void loadProduct();
    }, [productId]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [productId]);

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleAddToCart = async (): Promise<boolean> => {
        if (!isAuthenticated) {
            navigate('/auth');
            return false;
        }

        if (!productId) return false;

        setAddingToCart(true);
        try {
            await cartService.addItem({ productId, quantity });
            setCartMessage(isVi ? '✓ Đã thêm vào giỏ hàng' : '✓ Added to cart');
            setQuantity(1);
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : (isVi ? 'Lỗi khi thêm vào giỏ hàng' : 'Error adding to cart');
            setCartMessage(`✗ ${message}`);
            return false;
        } finally {
            setAddingToCart(false);
            setTimeout(() => setCartMessage(''), 3000);
        }
    };

    const handleQuantityChange = (delta: number) => {
        const next = quantity + delta;
        if (next >= 1) {
            setQuantity(next);
        }
    };

    if (!product || !category) {
        return null;
    }

    const ingredientList = isVi ? product.ingredients : product.ingredientsEn;
    const tipsList = isVi ? product.tips : product.tipsEn;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(`/products/${category}`)}>
                <FaArrowLeft /> {isVi ? 'Quay lại' : 'Back'}
            </button>

            <section className={styles.productOverview}>
                <div className={styles.productGallery}>
                    <div className={styles.mainImage}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                        ) : (
                            <div className={styles.productIcon}>{product.icon}</div>
                        )}
                    </div>
                </div>

                <div className={styles.productInfo}>
                    <h1 className={styles.productTitle}>{isVi ? product.name : product.nameEn}</h1>
                    <p className={styles.productSummary}>{isVi ? product.summary : product.summaryEn}</p>

                    <div className={styles.priceSection}>
                        <div className={styles.price}>{product.price}</div>
                        <div className={styles.priceLabel}>{isVi ? 'Giá bán' : 'Price'}</div>
                    </div>

                    <div className={styles.productMeta}>
                        {!!product.size && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                        <path d="m3.3 7 8.7 5 8.7-5" />
                                        <path d="M12 22V12" />
                                    </svg>
                                </span>
                                <div className={styles.metaContent}>
                                    <div className={styles.metaLabel}>{isVi ? 'Quy cách' : 'Size'}</div>
                                    <div className={styles.metaValue}>{isVi ? product.size : product.sizeEn}</div>
                                </div>
                            </div>
                        )}
                        {!!product.expiry && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </span>
                                <div className={styles.metaContent}>
                                    <div className={styles.metaLabel}>{isVi ? 'Hạn sử dụng' : 'Expiry'}</div>
                                    <div className={styles.metaValue}>{isVi ? product.expiry : product.expiryEn}</div>
                                </div>
                            </div>
                        )}
                        {!!product.storage && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="2" x2="12" y2="6" />
                                        <line x1="12" y1="18" x2="12" y2="22" />
                                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                                        <line x1="2" y1="12" x2="6" y2="12" />
                                        <line x1="18" y1="12" x2="22" y2="12" />
                                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                    </svg>
                                </span>
                                <div className={styles.metaContent}>
                                    <div className={styles.metaLabel}>{isVi ? 'Bảo quản' : 'Storage'}</div>
                                    <div className={styles.metaValue}>{isVi ? product.storage : product.storageEn}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.ctaButtons}>
                        <div className={styles.quantitySection}>
                            <label>{isVi ? 'Số lượng:' : 'Quantity:'}</label>
                            <div className={styles.quantityControl}>
                                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>−</button>
                                <input
                                    type="number"
                                    value={quantity}
                                    min="1"
                                    onChange={(e) => {
                                        const parsed = parseInt(e.target.value, 10);
                                        if (Number.isFinite(parsed) && parsed >= 1) {
                                            setQuantity(parsed);
                                        }
                                    }}
                                />
                                <button onClick={() => handleQuantityChange(1)}>+</button>
                            </div>
                        </div>

                        <button className={styles.ctaPrimary} onClick={handleAddToCart} disabled={addingToCart}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                            {addingToCart ? (isVi ? 'Đang thêm...' : 'Adding...') : (isVi ? 'Thêm vào giỏ' : 'Add to Cart')}
                        </button>

                        <button
                            className={styles.ctaSecondary}
                            onClick={async () => {
                                const success = await handleAddToCart();
                                if (success) {
                                    navigate('/checkout');
                                }
                            }}
                            disabled={addingToCart}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                <path d="M3 6h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {isVi ? 'Mua ngay' : 'Buy Now'}
                        </button>

                        <button className={styles.ctaTertiary} onClick={() => navigate('/contact')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            {isVi ? 'Liên hệ' : 'Contact'}
                        </button>

                        {cartMessage && (
                            <div className={styles.cartMessage} style={{ color: cartMessage.startsWith('✓') ? '#4caf50' : '#f44336' }}>
                                {cartMessage}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {product.healthBenefits.length > 0 && (
                <section className={styles.benefitsSection}>
                    <h2 className={styles.sectionTitle}>{isVi ? 'Lợi Ích Chính' : 'Key Benefits'}</h2>
                    <div className={styles.benefitsShowcase}>
                        {product.healthBenefits.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className={styles.benefitShowcaseCard}>
                                <div className={styles.benefitNumber}>{idx + 1}</div>
                                <h3>{isVi ? benefit.title : benefit.titleEn}</h3>
                                <p>{isVi ? benefit.description : benefit.descriptionEn}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className={styles.infoSection}>
                <div className={styles.tabBar}>
                    <button className={`${styles.tabButton} ${activeTab === 'nutrition' ? styles.active : ''}`} onClick={() => setActiveTab('nutrition')}>
                        {isVi ? 'Thành Phần & Dinh Dưỡng' : 'Nutrition & Ingredients'}
                    </button>
                    <button className={`${styles.tabButton} ${activeTab === 'usage' ? styles.active : ''}`} onClick={() => setActiveTab('usage')}>
                        {isVi ? 'Hướng Dẫn Sử Dụng' : 'How to Use'}
                    </button>
                    <button className={`${styles.tabButton} ${activeTab === 'faq' ? styles.active : ''}`} onClick={() => setActiveTab('faq')}>
                        {isVi ? 'Câu Hỏi Thường Gặp' : 'FAQ'}
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'nutrition' && (
                        <div className={styles.tabPane}>
                            <div className={styles.nutritionAndIngredients}>
                                <div className={styles.ingredientsColumn}>
                                    <h3>{isVi ? 'Thành Phần' : 'Ingredients'}</h3>
                                    <ul className={styles.ingredientsList}>
                                        {ingredientList.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={styles.nutritionColumn}>
                                    <h3>{isVi ? 'Dinh Dưỡng Chính' : 'Key Nutrition'}</h3>
                                    <div className={styles.nutritionGrid}>
                                        {product.nutritionFacts.map((fact, idx) => (
                                            <div key={idx} className={styles.nutritionItem}>
                                                <div className={styles.nutritionLabel}>{isVi ? fact.label : fact.labelEn}</div>
                                                <div className={styles.nutritionValue}>{isVi ? fact.value : fact.valueEn}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'usage' && (
                        <div className={styles.tabPane}>
                            <div className={styles.usageContent}>
                                <h3>{isVi ? 'Cách Sử Dụng' : 'How to Use'}</h3>
                                <p className={styles.usageText}>{isVi ? product.usage : product.usageEn}</p>
                                {tipsList.length > 0 && (
                                    <div className={styles.tipsSection}>
                                        <h4>{isVi ? 'Mẹo Sử Dụng' : 'Helpful Tips'}</h4>
                                        <ul className={styles.tipsList}>
                                            {tipsList.map((tip, idx) => (
                                                <li key={idx}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'faq' && (
                        <div className={styles.tabPane}>
                            <div className={styles.faqContent}>
                                {product.faqItems.map((item, idx) => (
                                    <div key={idx} className={styles.faqItem}>
                                        <h4>{isVi ? item.question : item.questionEn}</h4>
                                        <p>{isVi ? item.answer : item.answerEn}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.educationSection}>
                <h2 className={styles.sectionTitle}>{isVi ? 'Tìm Hiểu Thêm' : 'Learn More'}</h2>

                <div className={styles.educationCard}>
                    <button className={styles.educationCardHeader} onClick={() => toggleSection('definition')}>
                        <span>{isVi ? 'Sản Phẩm Này Là Gì?' : 'What is this product?'}</span>
                        <span className={styles.chevron}>{expandedSections.definition ? '▼' : '▶'}</span>
                    </button>
                    {expandedSections.definition && <div className={styles.educationCardBody}><p>{isVi ? product.definition : product.definitionEn}</p></div>}
                </div>

                <div className={styles.educationCard}>
                    <button className={styles.educationCardHeader} onClick={() => toggleSection('whyChosen')}>
                        <span>{isVi ? 'Tại Sao Chọn Nguyên Liệu Này?' : 'Why these ingredients?'}</span>
                        <span className={styles.chevron}>{expandedSections.whyChosen ? '▼' : '▶'}</span>
                    </button>
                    {expandedSections.whyChosen && <div className={styles.educationCardBody}><p>{isVi ? product.whyChosen : product.whyChosenEn}</p></div>}
                </div>

                <div className={styles.educationCard}>
                    <button className={styles.educationCardHeader} onClick={() => toggleSection('fermentation')}>
                        <span>{isVi ? 'Quá Trình Lên Men' : 'Fermentation Process'}</span>
                        <span className={styles.chevron}>{expandedSections.fermentation ? '▼' : '▶'}</span>
                    </button>
                    {expandedSections.fermentation && <div className={styles.educationCardBody}><p>{isVi ? product.fermentationExplanation : product.fermentationExplanationEn}</p></div>}
                </div>

                <div className={styles.educationCard}>
                    <button className={styles.educationCardHeader} onClick={() => toggleSection('process')}>
                        <span>{isVi ? 'Quy Trình Sản Xuất' : 'Production Process'}</span>
                        <span className={styles.chevron}>{expandedSections.process ? '▼' : '▶'}</span>
                    </button>
                    {expandedSections.process && <div className={styles.educationCardBody}><p>{isVi ? product.processDescription : product.processDescriptionEn}</p></div>}
                </div>

                <div className={styles.educationCard}>
                    <button className={styles.educationCardHeader} onClick={() => toggleSection('circular')}>
                        <span>{isVi ? 'Kinh Tế Tuần Hoàn' : 'Circular Economy'}</span>
                        <span className={styles.chevron}>{expandedSections.circular ? '▼' : '▶'}</span>
                    </button>
                    {expandedSections.circular && (
                        <div className={styles.educationCardBody}>
                            <p><strong>{isVi ? 'Đầu Vào:' : 'Input:'}</strong> {isVi ? product.circularInput : product.circularInputEn}</p>
                            <ul>
                                {(isVi ? product.circularOutput : product.circularOutputEn).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.disclaimerSection}>
                <p className={styles.disclaimerText}>{isVi ? product.disclaimer : product.disclaimerEn}</p>
            </section>

            <section className={styles.ctaSection}>
                <h2>{isVi ? 'Bạn Có Câu Hỏi?' : 'Have Questions?'}</h2>
                <p>{isVi ? 'Liên hệ với chúng tôi để được tư vấn' : 'Contact us for more information'}</p>
                <button className={styles.ctaButton} onClick={() => navigate('/contact')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {isVi ? 'Liên hệ' : 'Contact'}
                </button>
            </section>
        </div>
    );
};

export default ProductDetailPage;
