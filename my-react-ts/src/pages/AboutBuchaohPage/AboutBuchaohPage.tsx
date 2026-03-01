import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './AboutBuchaohPage.module.css';
import {
  FaLeaf,
  FaSeedling,
  FaFlask,
  FaWater,
  FaRecycle,
  FaFireAlt,
  FaArrowRight,
  FaBoxOpen,
  FaBacteria,
  FaTint,
  FaThermometerHalf,
  FaCheckCircle,
  FaIndustry,
} from 'react-icons/fa';

const processSteps = [
  {
    icon: FaSeedling,
    titleVi: 'Nguyên liệu tự nhiên',
    titleEn: 'Natural Ingredients',
    descVi:
      'Trái cây, rau củ và nông sản tự nhiên được chọn lọc kỹ càng. Nguyên liệu này tự nhiên mang theo hệ vi sinh vật có lợi trên bề mặt, tạo nền tảng cho quá trình lên men sinh học.',
    descEn:
      'Carefully selected fruits, vegetables, and natural agricultural products carrying beneficial native microorganisms on their surface, forming the foundation for biological fermentation.',
  },
  {
    icon: FaFlask,
    titleVi: 'Lên men vi sinh',
    titleEn: 'Microbial Fermentation',
    descVi:
      'Vi khuẩn lactic, nấm men và enzyme sinh học phát triển trong môi trường lên men. Chúng phân giải các chất hữu cơ phức tạp thành acid hữu cơ, enzyme và hợp chất sinh học có giá trị.',
    descEn:
      'Lactic bacteria, yeast, and biological enzymes thrive in fermentation environment, breaking down complex organics into organic acids, enzymes, and valuable bio-compounds.',
  },
  {
    icon: FaWater,
    titleVi: 'Tách nước vi sinh',
    titleEn: 'Extract Fermented Water',
    descVi:
      'Sau thời gian lên men, phần nước chứa các hợp chất sinh học quý giá được tách ra khỏi phần cặn và bã. Nước này giàu lợi khuẩn, enzyme và acid hữu cơ tự nhiên.',
    descEn:
      'After fermentation, the liquid rich in valuable bio-compounds is separated from residue. This water contains beneficial bacteria, enzymes, and natural organic acids.',
  },
  {
    icon: FaFireAlt,
    titleVi: 'Thanh trùng & đóng chai',
    titleEn: 'Pasteurize & Bottle',
    descVi:
      'Nước vi sinh được thanh trùng để loại bỏ hoàn toàn vi sinh vật sống. Công đoạn này ngăn lên men tiếp tục sau đóng chai, giúp bảo quản lâu dài không cần chất bảo quản hóa học.',
    descEn:
      'Fermented water is pasteurized to remove all living microorganisms. This step prevents further fermentation after bottling, enabling long-term storage without chemical preservatives.',
  },
  {
    icon: FaRecycle,
    titleVi: 'Tái lên men phần bã',
    titleEn: 'Re-ferment the Residue',
    descVi:
      'Phần cặn và bã không bị loại bỏ. Chúng tiếp tục được bổ sung men vi sinh và nước để duy trì quá trình lên men mới, tạo dung dịch phân vi sinh giàu mùn hữu cơ hòa tan.',
    descEn:
      'Residue is not discarded. It is re-fermented with additional probiotics and water to create organic fertilizer solution rich in dissolved humus.',
  },
  {
    icon: FaLeaf,
    titleVi: 'Tuần hoàn sinh học',
    titleEn: 'Biological Cycle',
    descVi:
      'Dung dịch phân vi sinh cải tạo đất trồng, nuôi dưỡng cây trồng mới, cung cấp nguồn nguyên liệu sạch cho mẻ lên men tiếp theo. Chu trình khép kín, không tạo rác thải.',
    descEn:
      'Organic fertilizer revitalizes soil, nurtures new crops, and supplies clean inputs for the next fermentation batch. A closed, zero-waste loop.',
  },
];

export const AboutBuchaohPage = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isVi = language === 'vi';
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Keep IntersectionObserver for other sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );

    // Only observe .animate elements (not timeline items)
    const animated = document.querySelectorAll(`.${styles.animate}`);
    animated.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={`${styles.heroContent} ${styles.animate}`}>
          <div className={styles.heroIcon}>
            <FaBacteria className={styles.heroIconSpin} />
          </div>
          <h1 className={styles.heroTitle}>{t('about.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>
            {isVi
              ? 'Men vi sinh từ nông sản tự nhiên – Quy trình tuần hoàn sinh học không rác thải'
              : 'Probiotics from natural agriculture – A zero-waste biological cycle'}
          </p>
          <div className={styles.heroBadges}>
            <div className={styles.heroBadge}>
              <FaLeaf /> {isVi ? '100% Tự nhiên' : '100% Natural'}
            </div>
            <div className={styles.heroBadge}>
              <FaRecycle /> {isVi ? 'Không rác thải' : 'Zero Waste'}
            </div>
          </div>
        </div>
        <div className={styles.heroGlow} />
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionContent} ${styles.animate}`}>
          <h2 className={styles.sectionTitle}>
            {isVi ? 'Giới thiệu chung về sản phẩm' : 'General Product Introduction'}
          </h2>
          <p className={styles.paragraph}>
            {isVi
              ? 'Sản phẩm men vi sinh được tạo ra từ quá trình lên men các loại trái cây, củ quả và nông sản tự nhiên. Thông qua hoạt động của hệ vi sinh vật có lợi, các chất hữu cơ trong nguyên liệu được phân giải và chuyển hóa thành các hợp chất sinh học có giá trị.'
              : 'Probiotic products are created through fermentation of natural fruits, vegetables, and agricultural produce. Through beneficial microorganism activity, organic compounds in raw materials are broken down and transformed into valuable biochemical compounds.'}
          </p>
          <p className={styles.paragraph}>
            {isVi
              ? 'Kết quả của quá trình này tạo ra hai thành phẩm chính gồm nước vi sinh và dung dịch phân vi sinh. Hai thành phẩm này phục vụ cho hai mục đích khác nhau là nhu cầu sử dụng của con người và cải tạo đất trồng, hình thành một quy trình tuần hoàn sinh học không tạo rác thải.'
              : 'This process yields two main products: fermented water and organic fertilizer solution. These serve two purposes: human consumption and soil improvement, forming a zero-waste biological cycle.'}
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionContent} ${styles.animate}`}>
          <div className={styles.iconHeader}>
            <FaBacteria className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>
              {isVi ? 'Men vi sinh và vai trò trong quá trình lên men' : 'Probiotics and Their Role in Fermentation'}
            </h2>
          </div>
          <p className={styles.paragraph}>
            {isVi
              ? 'Men vi sinh là tập hợp các vi sinh vật có lợi như vi khuẩn lactic, nấm men và các enzyme sinh học tồn tại tự nhiên trên bề mặt trái cây, rau củ và trong môi trường lên men. Trong điều kiện thích hợp, các vi sinh vật này phát triển và thực hiện quá trình phân giải các chất hữu cơ phức tạp thành các dạng đơn giản hơn.'
              : 'Probiotics are beneficial microorganisms including lactic bacteria, yeast, and biological enzymes that naturally exist on fruit and vegetable surfaces. Under suitable conditions, these microorganisms grow and break down complex organic compounds into simpler forms.'}
          </p>
          <p className={styles.paragraph}>
            {isVi
              ? 'Quá trình này làm gia tăng giá trị sinh học của nguyên liệu ban đầu, đồng thời tạo ra các acid hữu cơ, enzyme và hợp chất sinh học có lợi.'
              : 'This process enhances the biological value of raw materials while creating beneficial organic acids, enzymes, and biochemical compounds.'}
          </p>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} ${styles.animate}`}>
            {isVi ? 'Quy trình tuần hoàn tạo thành sản phẩm' : 'Circular Production Process'}
          </h2>
          <p className={`${styles.sectionSubtitle} ${styles.animate}`}>
            {isVi
              ? 'Từ nguyên liệu tự nhiên đến chu trình khép kín không rác thải'
              : 'From natural ingredients to a closed zero-waste cycle'}
          </p>
        </div>

        <div className={styles.timeline}>
          {processSteps.map((step, index) => (
            <div
              key={step.titleVi}
              className={`${styles.timelineItem} ${
                activeStep === index ? styles.activeStep : ''
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIcon}>
                <step.icon />
              </div>
              <div className={styles.stepBody}>
                <h3 className={styles.stepTitle}>
                  {isVi ? step.titleVi : step.titleEn}
                </h3>
                <p className={styles.stepDesc}>
                  {isVi ? step.descVi : step.descEn}
                </p>
              </div>
              {index < processSteps.length - 1 && (
                <div className={styles.stepConnector}>
                  <FaArrowRight />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.detailGrid}>
          <div className={`${styles.detailCard} ${styles.animate}`}>
            <div className={styles.detailIcon}>
              <FaTint />
            </div>
            <h3 className={styles.detailTitle}>
              {isVi ? 'Nước vi sinh là gì' : 'What is fermented water?'}
            </h3>
            <p className={styles.detailText}>
              {isVi
                ? 'Phần nước thu được sau quá trình lên men chứa các hợp chất sinh học được tạo thành trong suốt quá trình vi sinh vật hoạt động. Ban đầu, nước lên men có chứa lợi khuẩn, enzyme và acid hữu cơ tự nhiên.'
                : 'The liquid obtained after fermentation contains biochemical compounds created throughout microbial activity. Initially, fermented water contains beneficial bacteria, enzymes, and natural organic acids.'}
            </p>
            <p className={styles.detailText}>
              {isVi
                ? 'Để đảm bảo khả năng bảo quản lâu dài mà không cần sử dụng chất bảo quản hóa học, sản phẩm được đưa qua công đoạn thanh trùng. Quá trình thanh trùng giúp loại bỏ hoàn toàn vi sinh vật sống còn lại trong dung dịch, từ đó ngăn chặn quá trình lên men tiếp tục xảy ra sau khi đóng chai.'
                : 'To ensure long-term preservation without chemical preservatives, the product undergoes pasteurization. This process completely removes remaining living microorganisms, preventing further fermentation after bottling.'}
            </p>
          </div>

          <div className={`${styles.detailCard} ${styles.animate}`}>
            <div className={styles.detailIcon}>
              <FaRecycle />
            </div>
            <h3 className={styles.detailTitle}>
              {isVi ? 'Dung dịch phân vi sinh từ phần cặn' : 'Organic fertilizer from residue'}
            </h3>
            <p className={styles.detailText}>
              {isVi
                ? 'Sau khi tách phần nước để tạo thành nước vi sinh, phần cặn và bã nông sản không bị loại bỏ. Phần này tiếp tục được bổ sung thêm men vi sinh và nước để duy trì quá trình lên men lần tiếp theo.'
                : 'After separating water to create fermented water, agricultural residue is not discarded. This residue continues to be supplemented with probiotics and water to maintain the next fermentation process.'}
            </p>
            <p className={styles.detailText}>
              {isVi
                ? 'Qua quá trình này, phần cặn và bã tiếp tục được vi sinh vật phân giải, tạo thành một dung dịch phân vi sinh giàu mùn hữu cơ hòa tan và hệ vi sinh có lợi cho đất. Dung dịch này được sử dụng để tưới hoặc bón cho đất trồng, giúp cải tạo đất, tăng độ tơi xốp, hỗ trợ hệ rễ phát triển và hạn chế nấm bệnh trong đất.'
                : 'Through this process, residue continues to be decomposed by microorganisms, creating an organic fertilizer solution rich in dissolved humus and beneficial soil microbiota. This solution is used for irrigation or soil amendment, improving soil structure, supporting root development, and suppressing soil pathogens.'}
            </p>
          </div>

          <div className={`${styles.detailCard} ${styles.animate}`}>
            <div className={styles.detailIcon}>
              <FaThermometerHalf />
            </div>
            <h3 className={styles.detailTitle}>
              {isVi ? 'Công đoạn thanh trùng và ý nghĩa' : 'Pasteurization and its significance'}
            </h3>
            <p className={styles.detailText}>
              {isVi
                ? 'Thanh trùng là bước quan trọng giúp sản phẩm ổn định chất lượng trong thời gian dài. Nhờ loại bỏ hoàn toàn probiotic và vi sinh vật sống, sản phẩm không tiếp tục lên men sau khi đóng chai, không sinh khí, không biến đổi mùi vị và không cần sử dụng chất bảo quản.'
                : 'Pasteurization is a critical step that ensures long-term product stability. By completely removing probiotics and living microorganisms, the product does not continue fermenting after bottling, produces no gas, maintains stable flavor, and requires no preservatives.'}
            </p>
            <p className={styles.detailText}>
              {isVi
                ? 'Đây là điểm khác biệt lớn giữa sản phẩm này với nhiều loại đồ uống lên men tươi trên thị trường. Nhờ vậy, sản phẩm có thể bảo quản trong thời gian dài ở điều kiện thường mà vẫn giữ được các hợp chất sinh học đã được tạo ra trước đó.'
                : 'This is a major difference between this product and many fresh fermented beverages on the market. Thus, the product can be stored long-term at room temperature while retaining previously created biochemical compounds.'}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionContent} ${styles.animate}`}>
          <div className={styles.iconHeader}>
            <FaIndustry className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>
              {isVi ? 'Mô hình không rác thải trong sản xuất' : 'Zero-waste production model'}
            </h2>
          </div>
          <div className={styles.highlightBox}>
            <FaCheckCircle className={styles.checkIcon} />
            <p className={styles.paragraph}>
              {isVi
                ? 'Toàn bộ nguyên liệu đầu vào đều được tận dụng triệt để. Phần nước trở thành sản phẩm sử dụng, phần cặn và bã tiếp tục được khai thác để tạo thành dung dịch phân vi sinh. Quy trình không tạo ra phụ phẩm cần xử lý hay thải bỏ.'
                : 'All input materials are thoroughly utilized. Water becomes the consumer product, while residue continues to be processed into organic fertilizer solution. The process creates no byproducts requiring disposal.'}
            </p>
          </div>
          <p className={styles.paragraph}>
            {isVi
              ? 'Điều này góp phần giảm lượng rác thải hữu cơ, giảm tác động đến môi trường và xây dựng mô hình sản xuất bền vững. Đất được cải tạo sẽ nuôi dưỡng cây trồng mới, cung cấp nguồn nguyên liệu sạch cho các mẻ lên men tiếp theo. Quy trình này tạo thành một vòng tuần hoàn khép kín trong tự nhiên.'
              : 'This contributes to reducing organic waste, minimizing environmental impact, and building a sustainable production model. Improved soil nurtures new crops, providing clean raw materials for subsequent fermentation batches. This process creates a closed loop in nature.'}
          </p>
        </div>
      </section>

      <section className={styles.comparisonSection}>
        <div className={`${styles.sectionContent} ${styles.animate}`}>
          <h2 className={styles.sectionTitle}>
            {isVi ? 'Sự khác biệt giữa Orcha và Kombucha' : 'Difference between Orcha and Kombucha'}
          </h2>
          
          <div className={styles.comparisonIntro}>
            <p className={styles.paragraph}>
              {isVi
                ? 'Sản phẩm men vi sinh từ nông sản và kombucha đều được tạo ra từ quá trình lên men vi sinh tự nhiên. Tuy nhiên, hai sản phẩm này khác nhau về nguyên liệu đầu vào, hệ vi sinh sử dụng, quy trình xử lý sau lên men và đặc tính của thành phẩm.'
                : 'Agricultural probiotic products and kombucha are both created through natural microbial fermentation. However, they differ in raw materials, microbial systems, post-fermentation processing, and final product characteristics.'}
            </p>
          </div>

          <div className={styles.comparisonGrid}>
            <div className={`${styles.comparisonCard} ${styles.animate}`}>
              <h4 className={styles.comparisonCardTitle}>
                {isVi ? 'Nguyên liệu' : 'Raw Materials'}
              </h4>
              <div className={styles.comparisonItem}>
                <strong>Orcha:</strong>
                <p>
                  {isVi
                    ? 'Được lên men từ nhiều loại trái cây, rau củ và nông sản tự nhiên, với hệ vi sinh vật có lợi tồn tại sẵn trong môi trường nguyên liệu và men bổ sung.'
                    : 'Fermented from various fruits, vegetables, and natural agricultural products, using naturally present beneficial microorganisms and supplemental probiotics.'}
                </p>
              </div>
              <div className={styles.comparisonItem}>
                <strong>Kombucha:</strong>
                <p>
                  {isVi
                    ? 'Được lên men từ trà và đường, sử dụng hệ cộng sinh giữa nấm men và vi khuẩn gọi là SCOBY (Symbiotic Culture of Bacteria and Yeast).'
                    : 'Fermented from tea and sugar using a symbiotic culture of bacteria and yeast called SCOBY.'}
                </p>
              </div>
            </div>

            <div className={`${styles.comparisonCard} ${styles.animate}`}>
              <h4 className={styles.comparisonCardTitle}>
                {isVi ? 'Quá trình lên men' : 'Fermentation Process'}
              </h4>
              <div className={styles.comparisonItem}>
                <strong>Orcha:</strong>
                <p>
                  {isVi
                    ? 'Trải qua quá trình lên men để tạo ra các hợp chất sinh học có lợi, sau đó được tách thành nước và phần cặn để tiếp tục các công đoạn khác nhau.'
                    : 'Undergoes fermentation to create beneficial biochemical compounds, then separated into water and residue for different subsequent processes.'}
                </p>
              </div>
              <div className={styles.comparisonItem}>
                <strong>Kombucha:</strong>
                <p>
                  {isVi
                    ? 'Trải qua quá trình lên men tạo ra một loại đồ uống có gas tự nhiên, vị chua nhẹ và chứa vi sinh vật sống.'
                    : 'Undergoes fermentation to create a naturally carbonated beverage with mild acidity and living microorganisms.'}
                </p>
              </div>
            </div>

            <div className={`${styles.comparisonCard} ${styles.animate}`}>
              <h4 className={styles.comparisonCardTitle}>
                {isVi ? 'Xử lý sau lên men' : 'Post-Fermentation Processing'}
              </h4>
              <div className={styles.comparisonItem}>
                <strong>Orcha:</strong>
                <p>
                  {isVi
                    ? 'Phần nước sau lên men được thanh trùng nhằm ổn định sản phẩm, giúp bảo quản ở điều kiện thường mà không cần chất bảo quản.'
                    : 'Fermented water is pasteurized to stabilize the product, enabling room temperature storage without preservatives.'}
                </p>
              </div>
              <div className={styles.comparisonItem}>
                <strong>Kombucha:</strong>
                <p>
                  {isVi
                    ? 'Thường được đóng chai ở trạng thái còn vi sinh vật sống và tiếp tục bảo quản lạnh để duy trì chất lượng.'
                    : 'Typically bottled with living microorganisms and requires cold storage to maintain quality.'}
                </p>
              </div>
            </div>

            <div className={`${styles.comparisonCard} ${styles.animate}`}>
              <h4 className={styles.comparisonCardTitle}>
                {isVi ? 'Đặc tính sản phẩm' : 'Product Characteristics'}
              </h4>
              <div className={styles.comparisonItem}>
                <strong>Orcha:</strong>
                <p>
                  {isVi
                    ? 'Dung dịch đã được ổn định vi sinh sau thanh trùng, giữ lại các hợp chất sinh học được tạo ra trong quá trình lên men trước đó.'
                    : 'Microbiologically stabilized solution after pasteurization, retaining biochemical compounds created during prior fermentation.'}
                </p>
              </div>
              <div className={styles.comparisonItem}>
                <strong>Kombucha:</strong>
                <p>
                  {isVi
                    ? 'Đồ uống lên men tươi, có sự hiện diện của probiotic sống và có thể tiếp tục biến đổi nhẹ theo thời gian bảo quản.'
                    : 'Fresh fermented beverage with living probiotics that may continue to evolve during storage.'}
                </p>
              </div>
            </div>

            <div className={`${styles.comparisonCard} ${styles.animate}`}>
              <h4 className={styles.comparisonCardTitle}>
                {isVi ? 'Tận dụng nguyên liệu' : 'Material Utilization'}
              </h4>
              <div className={styles.comparisonItem}>
                <strong>Orcha:</strong>
                <p>
                  {isVi
                    ? 'Phần cặn và bã sau khi tách nước tiếp tục được bổ sung men và nước để lên men thành dung dịch phân vi sinh cho đất trồng, tạo thành một vòng tuần hoàn sinh học.'
                    : 'Residue after water separation continues to be supplemented with probiotics and water to ferment into organic fertilizer, forming a biological cycle.'}
                </p>
              </div>
              <div className={styles.comparisonItem}>
                <strong>Kombucha:</strong>
                <p>
                  {isVi
                    ? 'Quy trình sản xuất không bao gồm bước tận dụng phụ phẩm theo hướng này.'
                    : 'Production process does not include byproduct utilization in this manner.'}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.comparisonConclusion}>
            <p className={styles.paragraph}>
              {isVi
                ? 'Hai sản phẩm đều dựa trên nguyên lý lên men tự nhiên nhưng được phát triển theo những mục đích sử dụng và quy trình sản xuất khác nhau. Orcha tập trung vào mô hình tuần hoàn không rác thải với hai sản phẩm đầu ra phục vụ cả con người và nông nghiệp.'
                : 'Both products are based on natural fermentation principles but developed for different purposes and production processes. Orcha focuses on a zero-waste circular model with two outputs serving both people and agriculture.'}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={`${styles.ctaContent} ${styles.animate}`}>
          <FaBoxOpen className={styles.ctaIcon} />
          <h2>{isVi ? 'Khám phá sản phẩm' : 'Explore Products'}</h2>
          <p>
            {isVi
              ? 'Trải nghiệm dòng sản phẩm nước vi sinh và phân vi sinh từ quy trình lên men sinh học.'
              : 'Discover fermented water and organic fertilizer from our biological process.'}
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => navigate('/products/nuoc')}
          >
            {isVi ? 'Xem sản phẩm' : 'View Products'}
          </button>
        </div>
      </section>
    </div>
  );
};
