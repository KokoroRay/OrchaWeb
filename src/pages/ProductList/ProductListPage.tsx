import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './ProductListPage.module.css';
import { FaLeaf, FaWater, FaSeedling, FaArrowRight } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: 'drinks' | 'fertilizers';
  icon: string;
  shortDesc: string;
  shortDescEn: string;
}

const productsData: Product[] = [
  {
    id: 'nuoc-khom-len-men',
    name: 'Nước Khóm Lên Men',
    nameEn: 'Fermented Khom Root Drink',
    category: 'drinks',
    icon: '🥤',
    shortDesc: 'Giàu inulin tự nhiên, hỗ trợ tiêu hóa và cân bằng đường huyết',
    shortDescEn: 'Rich in natural inulin, supports digestion and blood sugar balance',
  },
  {
    id: 'nuoc-tao-xanh-len-men',
    name: 'Nước Táo Xanh Lên Men',
    nameEn: 'Fermented Green Apple Drink',
    category: 'drinks',
    icon: '🍏',
    shortDesc: 'Giàu pectin và malic acid, hỗ trợ giải độc gan và làm đẹp da',
    shortDescEn: 'Rich in pectin and malic acid, supports liver detox and skin beauty',
  },
  {
    id: 'nuoc-thanh-long-len-men',
    name: 'Nước Thanh Long Lên Men',
    nameEn: 'Fermented Dragon Fruit Drink',
    category: 'drinks',
    icon: '🐉',
    shortDesc: 'Giàu betalain & vitamin C, chống oxy hóa mạnh và làm đẹp da',
    shortDescEn: 'Rich in betalain & vitamin C, powerful antioxidant and skin beauty',
  },
  {
    id: 'nuoc-gung-len-men',
    name: 'Nước Gừng Lên Men',
    nameEn: 'Fermented Ginger Drink',
    category: 'drinks',
    icon: '🫚',
    shortDesc: 'Giàu gingerol, chống viêm tự nhiên và tăng cường miễn dịch',
    shortDescEn: 'Rich in gingerol, natural anti-inflammatory and immunity boost',
  },
  {
    id: 'nuoc-buoi-len-men',
    name: 'Nước Bưởi Lên Men',
    nameEn: 'Fermented Pomelo Drink',
    category: 'drinks',
    icon: '🍊',
    shortDesc: 'Giàu naringin, hỗ trợ giảm cân và cân bằng cholesterol',
    shortDescEn: 'Rich in naringin, supports weight loss and cholesterol balance',
  },
  {
    id: 'phan-vi-sinh-tong-hop',
    name: 'Phân Vi Sinh Tổng Hợp',
    nameEn: 'Multi-Purpose Organic Fertilizer',
    category: 'fertilizers',
    icon: '🌿',
    shortDesc: 'Cải tạo đất, tăng độ tơi xốp, giảm nấm bệnh',
    shortDescEn: 'Improves soil structure, reduces pathogens',
  },
  {
    id: 'phan-vi-sinh-cho-rau',
    name: 'Phân Vi Sinh Cho Rau',
    nameEn: 'Organic Fertilizer for Vegetables',
    category: 'fertilizers',
    icon: '🥬',
    shortDesc: 'Tối ưu cho rau ăn lá, giúp xanh tốt',
    shortDescEn: 'Optimized for leafy greens, boosts growth',
  },
  {
    id: 'phan-vi-sinh-cho-cay-an-trai',
    name: 'Phân Vi Sinh Cho Cây Ăn Trái',
    nameEn: 'Organic Fertilizer for Fruit Trees',
    category: 'fertilizers',
    icon: '🍊',
    shortDesc: 'Hỗ trợ ra hoa, đậu quả, tăng độ ngọt',
    shortDescEn: 'Supports flowering, fruit set, and sweetness',
  },
];

export const ProductListPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  const categoryType = category === 'nuoc' ? 'drinks' : category === 'phan' ? 'fertilizers' : null;

  if (!categoryType) {
    navigate('/');
    return null;
  }

  const info =
    categoryType === 'drinks'
      ? {
          title: isVi ? 'Nước Uống Lên Men' : 'Fermented Drinks',
          subtitle: isVi
            ? 'Giải khát tự nhiên từ quá trình lên men trái cây'
            : 'Natural refreshment from fruit fermentation',
          icon: FaWater,
        }
      : {
          title: isVi ? 'Phân Vi Sinh' : 'Organic Fertilizers',
          subtitle: isVi
            ? 'Cải tạo đất và nuôi dưỡng cây trồng bền vững'
            : 'Improving soil and nourishing crops sustainably',
          icon: FaSeedling,
        };

  const CategoryIcon = info.icon;
  const list = productsData.filter((p) => p.category === categoryType);

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
              onClick={() => navigate(`/products/${category}/${product.id}`)}
            >
              <div className={styles.cardIcon}>{product.icon}</div>
              <h3 className={styles.cardTitle}>
                {isVi ? product.name : product.nameEn}
              </h3>
              <p className={styles.cardDesc}>
                {isVi ? product.shortDesc : product.shortDescEn}
              </p>
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
