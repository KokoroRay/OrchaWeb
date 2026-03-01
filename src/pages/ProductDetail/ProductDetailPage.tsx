import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './ProductDetailPage.module.css';
import { 
  FaArrowLeft,
} from 'react-icons/fa';

interface NutritionFact {
  label: string;
  labelEn: string;
  value: string;
  valueEn: string;
  explanation?: string;
  explanationEn?: string;
}

interface FaqItem {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

interface BlogReference {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn?: string;
  url?: string;
}

interface ProductDetail {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  price: string;
  shopeeUrl?: string;
  size?: string;
  sizeEn?: string;
  expiry?: string;
  expiryEn?: string;
  storage?: string;
  storageEn?: string;
  mfg?: string;
  mfgEn?: string;
  summary: string;
  summaryEn: string;
  
  definition: string;
  definitionEn: string;
  whyChosen: string;
  whyChosenEn: string;
  technicalReason?: string;
  technicalReasonEn?: string;
  sourceReason?: string;
  sourceReasonEn?: string;
  culturalValue?: string;
  culturalValueEn?: string;
  productionModel: string;
  productionModelEn: string;
  businessModel: string;
  businessModelEn: string;
  
  circularInput: string;
  circularInputEn: string;
  circularOutput: string[];
  circularOutputEn: string[];
  
  processDescription: string;
  processDescriptionEn: string;
  
  educationalContent: string;
  educationalContentEn: string;
  healthBenefits: { title: string; titleEn: string; description: string; descriptionEn: string }[];
  nutritionFacts: NutritionFact[];
  fermentationExplanation: string;
  fermentationExplanationEn: string;
  ingredients: string[];
  ingredientsEn: string[];
  usage: string;
  usageEn: string;
  faqItems: FaqItem[];
  blogReferences: BlogReference[];
  disclaimer: string;
  disclaimerEn: string;
  tips: string[];
  tipsEn: string[];
}

const productDetails: Record<string, ProductDetail> = {
  'nuoc-khom-len-men': {
    id: 'nuoc-khom-len-men',
    name: 'Nước Khóm Lên Men Vi Sinh',
    nameEn: 'Fermented Khom Root Microbial Drink',
    icon: '🥤',
    price: '32,000đ',
    shopeeUrl: 'https://shopee.vn/product/bucheoh/nuoc-khom-len-men',
    size: '500ml/chai',
    sizeEn: '500ml/bottle',
    expiry: '12 tháng',
    expiryEn: '12 months',
    storage: 'Bảo quản ở nhiệt độ 2-8°C, tránh ánh sáng',
    storageEn: 'Store at 2-8°C, avoid light',
    mfg: 'Được sản xuất theo tiêu chuẩn ATTP, không chứa chất bảo quản hóa học',
    mfgEn: 'Produced to food safety standards, no chemical preservatives',
    summary: 'Nước khóm lên men vi sinh - sản phẩm khai thác đầy đủ dưỡng chất từ khóm, giàu inulin tự nhiên, hỗ trợ tiêu hóa và cân bằng đường huyết.',
    summaryEn: 'Fermented khom root microbial drink - fully harnesses khom nutrients, rich in natural inulin, supports digestion and blood sugar balance.',
    definition: 'Nước khóm lên men vi sinh là sản phẩm từ quá trình lên men có kiểm soát của khóm tươi với hệ vi sinh vật có lợi. Khóm giàu inulin tự nhiên (một carbohydrate tuyệt vời cho đường huyết). Quá trình lên men phân giải inulin thành fructose dễ hấp thu, tạo ra acid hữu cơ, enzyme, và các hợp chất khoáng giúp cơ thể hấp thu hiệu quả.',
    definitionEn: 'Fermented khom root microbial drink is a product from controlled fermentation of fresh khom with beneficial microorganisms. Khom is rich in natural inulin (excellent carbohydrate for blood sugar). Fermentation breaks down inulin into easily absorbable fructose, creating organic acids, enzymes, and mineral compounds for efficient body absorption.',
    whyChosen: 'Chọn khóm làm nguyên liệu chính vì những lý do sau:',
    whyChosenEn: 'Khom root was chosen as the main ingredient for the following reasons:',
    technicalReason: '(1) Kỹ thuật: Khóm giàu inulin tự nhiên (3-5%), một carbohydrate phức tạp giúp cân bằng đường huyết, không gây tăng đường máu. Lên men khóm giải phóng fructose và minerals, cải thiện hấp thu.',
    technicalReasonEn: '(1) Technical: Khom is rich in natural inulin (3-5%), complex carbohydrate balancing blood sugar without spikes. Fermentation releases fructose and minerals, improving absorption.',
    sourceReason: '(2) Nguồn nguyên liệu: Khóm dễ trồng, phổ biến ở Việt Nam, có tính mùa vụ rõ ràng, hỗ trợ nông dân địa phương. Giá thành rẻ, sản lượng cao, bền vững.',
    sourceReasonEn: '(2) Source: Khom grows easily, common in Vietnam with clear seasonality, supports local farmers. Affordable, high yield, sustainable.',
    culturalValue: '(3) Giá trị & Văn hoá: Khóm là cây trồng truyền thống Việt Nam, sử dụng lâu đời trong nấu ăn dân gian. Nước khóm lên men kết nối giá trị truyền thống với công nghệ hiện đại, dễ được người Việt chấp nhận.',
    culturalValueEn: '(3) Cultural Value: Khom is traditional Vietnamese crop with long-standing folk culinary use. Fermented khom drink bridges traditional value with modern technology, readily accepted by Vietnamese consumers.',
    productionModel: 'Mô hình sản xuất nước khóm lên men theo kinh tế tuần hoàn: khóm tươi → nước lên men → hỗ trợ sức khỏe; phần còn lại → phân vi sinh → cải tạo đất trồng. Zero waste, tối ưu mỗi phần nguyên liệu.',
    productionModelEn: 'Circular economy production: fresh khom → fermented drink → health support; remaining → microbial fertilizer → soil improvement. Zero waste, optimize every ingredient part.',
    businessModel: 'Mô hình kinh doanh tập trung vào sức khỏe tiêu hoá: khóm → nước lên men → quản lý đường huyết, cân bằng đường, hỗ trợ viêm ruột. Mục tiêu là giáo dục người tiêu dùng Việt về giá trị khóm và lợi ích lên men, xây dựng thương hiệu sản phẩm sức khỏe tự nhiên.',
    businessModelEn: 'Business model focused on digestive and metabolic health: khom → fermented drink → blood sugar management, balance, supports gut inflammation. Goal is educating Vietnamese consumers on khom value and fermentation benefits, building natural health brand.',
    circularInput: 'Khóm tươi + Men vi sinh lạc (Lactobacillus, Bacillus)',
    circularInputEn: 'Fresh khom + Beneficial probiotics (Lactobacillus, Bacillus)',
    circularOutput: ['Nước khóm lên men → Cân bằng đường, hỗ trợ tiêu hóa, tăng miễn dịch', 'Phân vi sinh từ cặn khóm → Cải tạo đất, giảm phân hóa học'],
    circularOutputEn: ['Fermented khom → Balance blood sugar, support digestion, boost immunity', 'Microbial fertilizer from khom residue → Soil improvement, reduce chemical fertilizer'],
    processDescription: 'Quy trình sản xuất (BR): (1) Chuẩn bị: Khóm tươi được rửa sạch, lột vỏ, cắt thành miếng nhỏ, tránh oxy hóa. (2) Ủ lên men: Khóm được cho vào container vô trùm, thêm men vi sinh (Lactobacillus, Bacillus), để ở 20-25°C (bóng mát) trong 14-21 ngày. Mỗi 2-3 ngày khuấy đều để men hoạt động tối ưu. (3) Lọc: Sau lên men, dung dịch được lọc qua vải sạch để tách phần nước cốt khóm và cặn khóm. (4) Thanh trùng: Nước cốt được thanh trùng ở 73°C trong 15 phút (không cao quá để giữ enzyme). (5) Pha chuẩn: Pha lỏng với nước RO sạch, bổ sung đường liều tối thiểu (hơn 2-3g/100ml) để cân bằng vị chua từ lên men. (6) Đóng gói: Đổ vào chai 500ml, niêm phong, ghi nhãn ngày sản xuất.',
    processDescriptionEn: 'Production process (BR Standard): (1) Preparation: Fresh khom cleaned, peeled, cut into pieces, prevent oxidation. (2) Fermentation: Khom placed in container, add probiotics (Lactobacillus, Bacillus), kept at 20-25°C (shade) for 14-21 days. Stir every 2-3 days for optimal microbial activity. (3) Filtration: After fermentation, solution filtered through clean cloth to separate khom extract and residue. (4) Pasteurization: Extract pasteurized at 73°C for 15 minutes (not higher to preserve enzymes). (5) Standardization: Dilute with clean RO water, add minimal sugar (over 2-3g/100ml) to balance fermentation sourness. (6) Packaging: Pour into 500ml bottles, seal, label with production date.',
    educationalContent: 'Khóm chứa inulin (3-5%), một carbohydrate phức tạp không gây tăng đường máu. Lên men khóm phân giải inulin thành fructose (đường đơn giản), giúp cơ thể hấp thu dễ dàng mà không ảnh hưởng đường huyết. Quá trình lên men cũng tạo ra lactic acid (chống viêm), enzyme (hỗ trợ tiêu hoá), và khoáng chất (Fe, Zn, Cu) ở dạng dễ hấp thu.',
    educationalContentEn: 'Khom contains inulin (3-5%), complex carbohydrate that doesn\'t cause blood sugar spikes. Fermented khom breaks down inulin into fructose (simple sugar), helping easy absorption without affecting blood sugar. Fermentation also creates lactic acid (anti-inflammatory), enzymes (digestion support), and minerals (Fe, Zn, Cu) in easily absorbable form.',
    fermentationExplanation: 'Lên men khóm 14-21 ngày ở 20-25°C: Lactobacillus & Bacillus phân giải inulin thành glucose & fructose, tạo ra lactic acid (chống viêm), butyric acid (chăm sóc ruột), và enzyme amylase (tiêu hóa). Sau lên men, khóm được thanh trùng ở 73°C/15 phút để loại vi sinh vật sống, ổn định sản phẩm, nhưng vẫn giữ lại tất cả enzyme, acid, và khoáng chất có lợi.',
    fermentationExplanationEn: 'Ferment khom 14-21 days at 20-25°C: Lactobacillus & Bacillus break down inulin into glucose & fructose, create lactic acid (anti-inflammatory), butyric acid (gut care), and amylase enzyme (digestion). After fermentation, khom pasteurized at 73°C/15 min to remove living microbes, stabilize product, but retain all beneficial enzymes, acids, and minerals.',
    healthBenefits: [
      {
        title: 'Cân bằng đường huyết & năng lượng',
        titleEn: 'Blood Sugar Balance & Energy',
        description: 'Inulin trong khóm (3-5%) là carbohydrate phức tạp, lên men chuyển thành fructose (đường đơn), cơ thể hấp thu từ từ, không gây tăng đột ngột đường máu. Năng lượng ổn định cả ngày, không cảm giác mệt hoặc chóng mặt sau khi uống.',
        descriptionEn: 'Inulin in khom (3-5%) is complex carb, fermentation converts to fructose (simple sugar), body absorbs gradually, no sudden blood sugar spikes. Stable energy all day, no fatigue or dizziness after drinking.'
      },
      {
        title: 'Hỗ trợ tiêu hóa & sức khỏe ruột',
        titleEn: 'Digestion & Gut Health Support',
        description: 'Lactic acid từ lên men giảm viêm ruột, butyric acid nuôi dưỡng lớp niêm mạc ruột. Enzyme amylase giúp tiêu hóa carbohydrate. Fructose từ inulin chính là thức ăn cho vi khuẩn tốt trong ruột (prebiotic), giúp cân bằng hệ tiêu hóa.',
        descriptionEn: 'Lactic acid from fermentation reduces gut inflammation, butyric acid nourishes intestinal lining. Amylase enzyme aids carbohydrate digestion. Fructose from inulin feeds beneficial gut bacteria (prebiotic), balance digestive system.'
      },
      {
        title: 'Tăng miễn dịch & chống viêm',
        titleEn: 'Boost Immunity & Anti-Inflammatory',
        description: 'Lactic acid và các hợp chất từ lên men kích thích hệ miễn dịch, chống viêm. Khoáng chất (Fe, Zn, Cu) từ khóm, được giải phóng nhờ lên men, tăng cường hệ miễn dịch. Prebiotic fructose giúp các vi khuẩn tốt phát triển, tạo thêm các chất bảo vệ.',
        descriptionEn: 'Lactic acid and compounds from fermentation stimulate immune system, fight inflammation. Minerals (Fe, Zn, Cu) from khom, released by fermentation, boost immunity. Prebiotic fructose helps beneficial bacteria thrive, create protective substances.'
      }
    ],
    nutritionFacts: [
      { label: 'Calo', labelEn: 'Calories', value: '25-30 kcal/100ml', valueEn: '25-30 kcal/100ml', explanation: 'Thấp, lên men tiêu thụ inulin, không thêm đường', explanationEn: 'Low, fermentation consumes inulin, no added sugar' },
      { label: 'Inulin (Prebiotic)', labelEn: 'Inulin (Prebiotic)', value: '1.5-2.5g/100ml', valueEn: '1.5-2.5g/100ml', explanation: 'Thức ăn cho vi khuẩn tốt, không tăng đường máu', explanationEn: 'Food for beneficial bacteria, doesn\'t spike blood sugar' },
      { label: 'Lactic Acid', labelEn: 'Lactic Acid', value: '0.6-0.9%', valueEn: '0.6-0.9%', explanation: 'Chống viêm, bảo quản, hỗ trợ tiêu hóa', explanationEn: 'Anti-inflammatory, preservative, aids digestion' },
      { label: 'Khoáng chất', labelEn: 'Minerals', value: 'Fe 0.5-0.8mg, Zn 0.3-0.5mg, Cu 0.1-0.15mg/100ml', valueEn: 'Fe 0.5-0.8mg, Zn 0.3-0.5mg, Cu 0.1-0.15mg/100ml', explanation: 'Từ khóm, được giải phóng bởi lên men, dễ hấp thu', explanationEn: 'From khom, released by fermentation, bioavailable' },
      { label: 'Enzyme Amylase', labelEn: 'Amylase Enzyme', value: '60-100 IU/ml', valueEn: '60-100 IU/ml', explanation: 'Phân giải carbohydrate, hỗ trợ tiêu hóa', explanationEn: 'Breaks carbs, supports digestion' }
    ],
    ingredients: ['Khóm tươi 100% (Helianthus tuberosus)', 'Men vi sinh (Lactobacillus plantarum, Bacillus subtilis)', 'Nước RO tinh khiết', 'Không thêm đường, chất bảo quản, hay hóa chất', 'Thanh trùng ở 73°C/15 phút (BR tiêu chuẩn)'],
    ingredientsEn: ['100% Fresh Khom (Helianthus tuberosus)', 'Probiotics (Lactobacillus plantarum, Bacillus subtilis)', 'Pure RO water', 'No added sugar, preservatives, or chemicals', 'Pasteurized at 73°C/15 min (BR standard)'],
    usage: 'Uống 50-100ml/ngày (tương đương 1/5 chai 500ml). Tốt nhất sáng trước ăn sáng để inulin & enzyme hỗ trợ tiêu hóa cả ngày. Hoặc uống sau bữa trưa để cân bằng đường huyết. Lắc kỹ trước dùng, bảo quản 2-8°C. Sử dụng trong 7 ngày sau khi mở.',
    usageEn: 'Drink 50-100ml/day (equals 1/5 of 500ml bottle). Best in morning before breakfast for inulin & enzyme to support digestion all day. Or after lunch to balance blood sugar. Shake well before use, store at 2-8°C. Use within 7 days after opening.',
    tips: ['Uống sáng (trước 10 sáng) để inulin hỗ trợ năng lượng cả ngày', 'Lắc kỹ 10-15 giây trước dùng (lắng cặn là tự nhiên)', 'Bắt đầu 30-50ml/ngày, tăng dần lên 100ml khi cơ thể thích nghi', 'Bảo quản 2-8°C, tránh ánh sáng trực tiếp (inulin nhạy cảm)', 'Không uống cùng sữa/men (có thể ảnh hưởng prebiotic hoạt động)'],
    tipsEn: ['Drink in morning (before 10am) for inulin to support energy all day', 'Shake well 10-15 sec before use (settling is natural)', 'Start 30-50ml/day, gradually increase to 100ml as body adapts', 'Store at 2-8°C, avoid direct light (inulin sensitive)', 'Don\'t drink with milk/yeast (may affect prebiotic activity)'],
    faqItems: [
      { question: 'Ai có thể uống nước khóm lên men?', questionEn: 'Who can drink fermented khom?', answer: 'Mọi người từ 3 tuổi trở lên. Đặc biệt tốt cho: (1) Người quản lý cân nặng (inulin không tăng đường máu), (2) Tiểu đường type 2 (hỗ trợ ổn định đường), (3) Vấn đề tiêu hóa (lactic acid, prebiotic), (4) Miễn dịch yếu (minerals, anti-inflammatory). Trẻ < 3 tuổi & mang thai nên tham khảo bác sĩ.', answerEn: 'Everyone 3+ years old. Especially good for: (1) Weight management (inulin doesn\'t spike blood sugar), (2) Type 2 diabetes (supports balance), (3) Digestion issues (lactic acid, prebiotic), (4) Weak immunity (minerals, anti-inflammatory). Children < 3 & pregnancy consult doctor.' },
      { question: 'Inulin là gì, có nguy hiểm không?', questionEn: 'What is inulin, is it dangerous?', answer: 'Inulin là carbohydrate phức tạp từ khóm (3-5%), KHÔNG phải inulin nhồi tiêm. An toàn tuyệt đối, không gây tăng đường máu. Thực tế, inulin giúp cân bằng đường huyết bằng cách: (1) Hấp thu từ từ, (2) Không kích thích tuyến tụy, (3) Nuôi vi khuẩn tốt làm giảm viêm. Người tiểu đường nên dùng, không có nguy hiểm.', answerEn: 'Inulin is complex carb from khom (3-5%), NOT insulin injection. Absolutely safe, doesn\'t spike blood sugar. Actually helps balance by: (1) Slow absorption, (2) Doesn\'t stimulate pancreas, (3) Feeds beneficial bacteria reducing inflammation. Diabetics should use, no danger.' },
      { question: 'Tại sao nước khóm lên men có vị chua?', questionEn: 'Why is fermented khom sour?', answer: 'Vị chua từ lactic acid & acetic acid được vi sinh vật tạo ra trong 14-21 ngày lên men. Những acid này: (1) Bảo quản tự nhiên (thay thế bảo quản hóa học), (2) Chống viêm (lợi cho ruột), (3) Hỗ trợ tiêu hóa axit. Vị chua cũng là dấu hiệu lên men thành công. Nếu không thích, có thể pha loãng với nước ấm 1:1.', answerEn: 'Sourness from lactic & acetic acids created by microbes during 14-21 day fermentation. These acids: (1) Natural preservation (replaces chemicals), (2) Anti-inflammatory (gut benefit), (3) Support acid digestion. Sourness also signals successful fermentation. If dislike, dilute 1:1 with warm water.' },
      { question: 'Khi nào hết hạn? Bảo quản như thế nào?', questionEn: 'When does it expire? How to store?', answer: 'Hạn: 12 tháng từ ngày sản xuất (nếu bảo quản đúng). Bảo quản: (1) Tủ lạnh 2-8°C (bắt buộc), (2) Tránh ánh sáng trực tiếp, (3) Không để ở nhiệt độ phòng quá 1 giờ. Sau khi mở: Sử dụng trong 7 ngày, bảo quản tủ lạnh, lắc trước dùng. Nếu thấy mùi lạ hay thay đổi màu sắc → không dùng.', answerEn: 'Expiry: 12 months from production date (if stored correctly). Storage: (1) Fridge 2-8°C (required), (2) Avoid direct light, (3) Don\'t leave at room temp over 1 hour. After opening: Use within 7 days, refrigerate, shake before use. If smell odd or color changes → don\'t use.' }
    ],
    blogReferences: [
      { 
        title: 'Inulin - Tiền tiêu đường tự nhiên', 
        titleEn: 'Inulin - Natural Prebiotic', 
        description: 'Cách inulin cân bằng đường huyết, nuôi vi khuẩn tốt, hỗ trợ cân nặng',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3705355/'
      },
      { 
        title: 'Lactic Acid: Tự nhiên chống viêm', 
        titleEn: 'Lactic Acid: Natural Anti-Inflammatory', 
        description: 'Lactic acid từ lên men giúp giảm viêm ruột, cải thiện sức khỏe đường ruột',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6770950/'
      },
      { 
        title: 'Jerusalem Artichoke - Nghiên cứu dinh dưỡng', 
        titleEn: 'Jerusalem Artichoke - Nutritional Research', 
        description: 'Lịch sử sử dụng khóm trong dân gian, lợi ích dinh dưỡng, cách chế biến hiện đại',
        url: 'https://www.researchgate.net/publication/228634688_Jerusalem_artichoke_and_chicory_inulin_in_bakery_products'
      }
    ],
    disclaimer: '⚠️ TUYÊN BỐ BR: Sản phẩm này là thực phẩm bảo vệ sức khỏe, KHÔNG PHẢI THUỐC. Không dự định chẩn đoán, điều trị, hoặc chữa bệnh. Được sản xuất theo tiêu chuẩn ATTP, thanh trùng ở 73°C, bảo quản 2-8°C, hạn 12 tháng. Nếu mang thai, cho con bú, có tiêu chảy, hoặc dị ứng, tham khảo bác sĩ. Không phù hợp với người mất khiếm định đường ruột.', 
    disclaimerEn: '⚠️ BR STATEMENT: This product is a functional food, NOT A DRUG. Not intended to diagnose, treat, or cure disease. Produced to food safety standards, pasteurized at 73°C, stored 2-8°C, 12-month shelf life. If pregnant, nursing, have diarrhea, or allergies, consult doctor. Not suitable for those with compromised gut conditions.',
  },

  'nuoc-tao-xanh-len-men': {
    id: 'nuoc-tao-xanh-len-men',
    name: 'Nước Táo Xanh Lên Men Vi Sinh',
    nameEn: 'Fermented Green Apple Microbial Drink',
    icon: '🍏',
    price: '32,000đ',
    shopeeUrl: 'https://shopee.vn/product/bucheoh/nuoc-tao-xanh-len-men',
    size: '500ml/chai',
    sizeEn: '500ml/bottle',
    expiry: '12 tháng',
    expiryEn: '12 months',
    storage: 'Bảo quản ở nhiệt độ 2-8°C, tránh ánh sáng',
    storageEn: 'Store at 2-8°C, avoid light',
    mfg: 'Được sản xuất theo tiêu chuẩn ATTP, không chứa chất bảo quản hóa học',
    mfgEn: 'Produced to food safety standards, no chemical preservatives',
    summary: 'Nước táo xanh lên men - giàu pectin và malic acid tự nhiên, hỗ trợ giải độc gan, làm sạch đường ruột và cân bằng cholesterol.',
    summaryEn: 'Fermented green apple drink - rich in pectin and natural malic acid, supports liver detox, intestinal cleansing and cholesterol balance.',
    definition: 'Nước táo xanh lên men được tạo từ táo xanh tươi Granny Smith qua lên men kiểm soát với vi sinh vật có lợi. Táo xanh giàu pectin (chất xơ hòa tan 2-3%) và malic acid tự nhiên, giúp giải độc gan, cải thiện tiêu hóa và giảm cholesterol xấu.',
    definitionEn: 'Fermented green apple drink is created from fresh Granny Smith apples through controlled fermentation with beneficial microbes. Green apples are rich in pectin (soluble fiber 2-3%) and natural malic acid, supporting liver detox, improved digestion and bad cholesterol reduction.',
    whyChosen: 'Chọn táo xanh làm nguyên liệu vì:',
    whyChosenEn: 'Green apple chosen because:',
    technicalReason: '(1) Kỹ thuật: Táo xanh có pH thấp (3.2-3.5), pectin cao, và malic acid tự nhiên, lý tưởng cho lên men an toàn.',
    technicalReasonEn: '(1) Technical: Green apples have low pH (3.2-3.5), high pectin, and natural malic acid, ideal for safe fermentation.',
    sourceReason: '(2) Nguồn: Táo xanh được nhập khẩu ổn định, có giá hợp lý, dễ kiểm soát chất lượng.',
    sourceReasonEn: '(2) Source: Green apples imported stably, reasonable price, easy quality control.',
    culturalValue: '(3) Giá trị: Táo xanh được biết đến với detox và làm đẹp, phù hợp với xu hướng wellness Việt Nam.',
    culturalValueEn: '(3) Value: Green apples known for detox and beauty, fits Vietnamese wellness trend.',
    productionModel: 'Sản xuất nước táo xanh lên men, tái sử dụng bã táo làm phân vi sinh giàu pectin cho đất.',
    productionModelEn: 'Produce fermented green apple drink, reuse apple pomace as pectin-rich microbial fertilizer.',
    businessModel: 'Tập trung vào detox và làm đẹp, target khách hàng nữ quan tâm sức khỏe và làm đẹp từ bên trong.',
    businessModelEn: 'Focus on detox and beauty, targeting female customers interested in health and inner beauty.',
    circularInput: 'Táo xanh tươi + Men vi sinh (Lactobacillus, Saccharomyces)',
    circularInputEn: 'Fresh green apples + Probiotics (Lactobacillus, Saccharomyces)',
    circularOutput: ['Nước táo lên men → Detox gan, giảm cholesterol, làm đẹp da', 'Phân từ bã táo → Phân vi sinh giàu pectin'],
    circularOutputEn: ['Fermented apple → Liver detox, reduce cholesterol, skin beauty', 'Apple pomace fertilizer → Pectin-rich fertilizer'],
    processDescription: 'Quy trình (BR): (1) Rửa, cắt táo xanh, tránh nâu. (2) Lên men 18-25 ngày ở 20-25°C với men. (3) Lọc tách nước cốt. (4) Thanh trùng 73°C/15 phút. (5) Pha chuẩn với nước RO, đường tối thiểu. (6) Đóng chai 500ml, niêm phong.',
    processDescriptionEn: 'Process (BR): (1) Wash, cut green apples, prevent browning. (2) Ferment 18-25 days at 20-25°C with microbes. (3) Filter extract. (4) Pasteurize 73°C/15 min. (5) Standardize with RO water, minimal sugar. (6) Bottle 500ml, seal.',
    educationalContent: 'Pectin từ táo xanh (2-3%) là chất xơ hòa tan, giúp hấp thu cholesterol xấu và độc tố trong ruột, đào thải ra ngoài. Malic acid hỗ trợ gan phân giải độc tố. Lên men tạo enzyme pectinase phân giải pectin, tăng hiệu quả detox.',
    educationalContentEn: 'Pectin from green apple (2-3%) is soluble fiber, helps absorb bad cholesterol and toxins in intestine, eliminate out. Malic acid supports liver detoxification. Fermentation creates pectinase enzyme breaking pectin, increases detox efficiency.',
    fermentationExplanation: 'Lên men 18-25 ngày: men phân giải pectin thành galacturonic acid (dễ hấp thu), tạo malic acid & citric acid (hỗ trợ gan), enzyme pectinase. Thanh trùng 73°C/15 phút giữ enzyme & acid, loại men sống.',
    fermentationExplanationEn: 'Ferment 18-25 days: microbes break pectin into galacturonic acid (bioavailable), create malic & citric acids (liver support), pectinase enzyme. Pasteurize 73°C/15 min retains enzymes & acids, removes live microbes.',
    healthBenefits: [
      { title: 'Giải độc gan', titleEn: 'Liver Detox', description: 'Malic acid hỗ trợ gan phân giải độc tố, pectin hấp thu kim loại nặng và cholesterol xấu trong máu, giảm gánh nặng cho gan.', descriptionEn: 'Malic acid supports liver breaking toxins, pectin absorbs heavy metals and bad cholesterol in blood, reduces liver burden.' },
      { title: 'Giảm cholesterol', titleEn: 'Reduce Cholesterol', description: 'Pectin hòa tan gắn kết cholesterol xấu (LDL) trong ruột, ngăn hấp thu vào máu. Giảm LDL 10-15% sau 4-6 tuần sử dụng đều đặn.', descriptionEn: 'Soluble pectin binds bad cholesterol (LDL) in intestine, prevents blood absorption. Reduces LDL 10-15% after 4-6 weeks regular use.' },
      { title: 'Làm đẹp da', titleEn: 'Skin Beauty', description: 'Malic acid làm sạch lỗ chân lông từ bên trong, pectin giảm viêm da. Vitamin C từ táo chống oxy hóa, da sáng mịn.', descriptionEn: 'Malic acid cleanses pores from inside, pectin reduces skin inflammation. Vitamin C from apples antioxidant, bright smooth skin.' }
    ],
    nutritionFacts: [
      { label: 'Pectin', labelEn: 'Pectin', value: '1.5-2g/100ml', valueEn: '1.5-2g/100ml', explanation: 'Chất xơ hòa tan, hấp thu cholesterol & độc tố', explanationEn: 'Soluble fiber, absorbs cholesterol & toxins' },
      { label: 'Malic Acid', labelEn: 'Malic Acid', value: '0.8-1.2%', valueEn: '0.8-1.2%', explanation: 'Hỗ trợ gan, làm sạch ruột', explanationEn: 'Liver support, intestinal cleansing' },
      { label: 'Vitamin C', labelEn: 'Vitamin C', value: '5-8mg/100ml', valueEn: '5-8mg/100ml', explanation: 'Chống oxy hóa, làm đẹp da', explanationEn: 'Antioxidant, skin beauty' },
      { label: 'Enzyme Pectinase', labelEn: 'Pectinase Enzyme', value: '40-60 IU/ml', valueEn: '40-60 IU/ml', explanation: 'Phân giải pectin, tăng hấp thu', explanationEn: 'Breaks pectin, increases absorption' },
      { label: 'Calo', labelEn: 'Calories', value: '30-35 kcal/100ml', valueEn: '30-35 kcal/100ml', explanation: 'Thấp, lên men giảm đường', explanationEn: 'Low, fermentation reduces sugar' }
    ],
    ingredients: ['Táo xanh Granny Smith 100%', 'Men vi sinh (Lactobacillus, Saccharomyces)', 'Nước RO', 'Không thêm đường/bảo quản', 'Thanh trùng 73°C/15 phút'],
    ingredientsEn: ['100% Granny Smith Green Apples', 'Probiotics (Lactobacillus, Saccharomyces)', 'RO water', 'No added sugar/preservatives', 'Pasteurized 73°C/15 min'],
    usage: 'Uống 50-100ml/ngày. Tốt nhất buổi tối trước ngủ để detox gan qua đêm. Hoặc sáng để làm sạch ruột. Lắc kỹ trước dùng, bảo quản 2-8°C. Dùng trong 7 ngày sau mở.',
    usageEn: 'Drink 50-100ml/day. Best at night before sleep for overnight liver detox. Or morning for intestinal cleansing. Shake well, store 2-8°C. Use within 7 days after opening.',
    tips: ['Uống tối để gan detox qua đêm', 'Lắc kỹ 10-15 giây (pectin lắng)', 'Bắt đầu 30ml, tăng dần lên 100ml', 'Không uống cùng sữa', 'Kết hợp với nước lọc nhiều'],
    tipsEn: ['Drink at night for overnight liver detox', 'Shake well 10-15 sec (pectin settles)', 'Start 30ml, increase to 100ml', 'Don\'t drink with milk', 'Combine with plenty of water'],
    faqItems: [
      { question: 'Tại sao táo xanh tốt cho gan?', questionEn: 'Why green apple good for liver?', answer: 'Malic acid trong táo xanh giúp gan phân giải độc tố, pectin hấp thu kim loại nặng và cholesterol trong máu, giảm gánh nặng gan. Uống đều đặn 4-6 tuần thấy cải thiện.', answerEn: 'Malic acid in green apples helps liver break toxins, pectin absorbs heavy metals and cholesterol in blood, reduces liver burden. Regular use 4-6 weeks shows improvement.' },
      { question: 'Có giảm được cholesterol không?', questionEn: 'Can reduce cholesterol?', answer: 'Có. Pectin hòa tan gắn kết cholesterol xấu (LDL), ngăn hấp thu vào máu. Nghiên cứu cho thấy giảm LDL 10-15% sau 4-6 tuần. Cần kết hợp ăn uống lành mạnh.', answerEn: 'Yes. Soluble pectin binds bad cholesterol (LDL), prevents blood absorption. Studies show 10-15% LDL reduction after 4-6 weeks. Combine with healthy diet.' },
      { question: 'Uống khi nào tốt nhất?', questionEn: 'Best time to drink?', answer: 'Tối trước ngủ tốt nhất: gan detox mạnh nhất 1-3 giờ sáng, uống tối giúp cung cấp malic acid & pectin cho gan. Hoặc sáng để làm sạch ruột.', answerEn: 'Best at night: liver detoxes strongest 1-3 AM, drinking at night provides malic acid & pectin for liver. Or morning for intestinal cleansing.' }
    ],
    blogReferences: [
      { 
        title: 'Pectin - Chất xơ thần kỳ', 
        titleEn: 'Pectin - Miracle Fiber', 
        description: 'Cách pectin hấp thu cholesterol & độc tố',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6769672/'
      },
      { 
        title: 'Malic Acid & Gan khỏe', 
        titleEn: 'Malic Acid & Liver Health', 
        description: 'Vai trò malic acid trong detox gan',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12134711/'
      },
      { 
        title: 'Apple Polyphenols - Sức khỏe tim mạch', 
        titleEn: 'Apple Polyphenols - Cardiovascular Health', 
        description: 'Lợi ích làm đẹp da từ táo xanh lên men',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4488768/'
      }
    ],
    disclaimer: '⚠️ TUYÊN BỐ BR: Thực phẩm bảo vệ sức khỏe, KHÔNG PHẢI THUỐC. Không thay thế thuốc điều trị. ATTP tiêu chuẩn, 73°C thanh trùng, 2-8°C bảo quản, hạn 12 tháng. Mang thai/cho con bú/dị ứng táo: tham khảo bác sĩ.',
    disclaimerEn: '⚠️ BR STATEMENT: Functional food, NOT DRUG. Doesn\'t replace medical treatment. Food safety standard, 73°C pasteurized, 2-8°C storage, 12-month shelf life. Pregnant/nursing/apple allergy: consult doctor.',
  },

  'nuoc-thanh-long-len-men': {
    id: 'nuoc-thanh-long-len-men',
    name: 'Nước Thanh Long Lên Men Vi Sinh',
    nameEn: 'Fermented Dragon Fruit Microbial Drink',
    icon: '🐉',
    price: '32,000đ',
    shopeeUrl: 'https://shopee.vn/product/bucheoh/nuoc-thanh-long-len-men',
    size: '500ml/chai',
    sizeEn: '500ml/bottle',
    expiry: '12 tháng',
    expiryEn: '12 months',
    storage: 'Bảo quản ở nhiệt độ 2-8°C, tránh ánh sáng',
    storageEn: 'Store at 2-8°C, avoid light',
    mfg: 'Được sản xuất theo tiêu chuẩn ATTP, không chứa chất bảo quản hóa học',
    mfgEn: 'Produced to food safety standards, no chemical preservatives',
    summary: 'Nước thanh long lên men - giàu betalain & vitamin C, hỗ trợ giải độc, chống oxy hóa mạnh và làm đẹp da tự nhiên.',
    summaryEn: 'Fermented dragon fruit drink - rich in betalain & vitamin C, supports detox, powerful antioxidant and natural skin beauty.',
    definition: 'Nước thanh long lên men được tạo từ thanh long ruột đỏ tươi qua lên men với vi sinh vật có lợi. Thanh long giàu betalain (sắc tố đỏ tự nhiên) và vitamin C, giúp chống oxy hóa mạnh, giải độc gan và làm đẹp da.',
    definitionEn: 'Fermented dragon fruit drink is created from fresh red dragon fruit through fermentation with beneficial microbes. Dragon fruit is rich in betalain (natural red pigment) and vitamin C, providing powerful antioxidant, liver detox and skin beauty.',
    whyChosen: 'Chọn thanh long làm nguyên liệu vì:',
    whyChosenEn: 'Dragon fruit chosen because:',
    technicalReason: '(1) Kỹ thuật: Thanh long có pH thấp (4.0-4.5), giàu betalain và vitamin C, lý tưởng cho lên men an toàn.',
    technicalReasonEn: '(1) Technical: Dragon fruit has low pH (4.0-4.5), rich in betalain and vitamin C, ideal for safe fermentation.',
    sourceReason: '(2) Nguồn: Thanh long trồng nhiều ở Việt Nam, giá hợp lý, nguồn cung ổn định quanh năm.',
    sourceReasonEn: '(2) Source: Dragon fruit widely grown in Vietnam, reasonable price, stable year-round supply.',
    culturalValue: '(3) Giá trị: Thanh long được ưa chuộng vì màu sắc đẹp và tính mát, phù hợp với thị hiếu Việt Nam.',
    culturalValueEn: '(3) Value: Dragon fruit favored for beautiful color and cooling properties, fits Vietnamese taste.',
    productionModel: 'Sản xuất nước thanh long lên men, tái sử dụng vỏ và hạt làm phân vi sinh giàu chất xơ.',
    productionModelEn: 'Produce fermented dragon fruit drink, reuse peel and seeds as fiber-rich microbial fertilizer.',
    businessModel: 'Tập trung vào detox và làm đẹp da, target khách hàng quan tâm sức khỏe và vẻ đẹp tự nhiên.',
    businessModelEn: 'Focus on detox and skin beauty, targeting customers interested in health and natural beauty.',
    circularInput: 'Thanh long ruột đỏ tươi + Men vi sinh (Lactobacillus)',
    circularInputEn: 'Fresh red dragon fruit + Probiotics (Lactobacillus)',
    circularOutput: ['Nước thanh long → Chống oxy hóa, detox, làm đẹp da', 'Phân từ vỏ hạt → Phân vi sinh giàu chất xơ'],
    circularOutputEn: ['Fermented drink → Antioxidant, detox, skin beauty', 'Peel/seed fertilizer → Fiber-rich fertilizer'],
    processDescription: 'Quy trình: (1) Rửa, bóc vỏ, cắt thanh long. (2) Lên men 15-20 ngày ở 22-26°C. (3) Lọc tách nước. (4) Thanh trùng 73°C/15 phút. (5) Pha chuẩn. (6) Đóng chai 500ml.',
    processDescriptionEn: 'Process: (1) Wash, peel, cut dragon fruit. (2) Ferment 15-20 days at 22-26°C. (3) Filter extract. (4) Pasteurize 73°C/15 min. (5) Standardize. (6) Bottle 500ml.',
    educationalContent: 'Betalain từ thanh long là chất chống oxy hóa mạnh, bảo vệ tế bào khỏi gốc tự do. Vitamin C hỗ trợ tổng hợp collagen cho da khỏe đẹp.',
    educationalContentEn: 'Betalain from dragon fruit is powerful antioxidant, protects cells from free radicals. Vitamin C supports collagen synthesis for healthy beautiful skin.',
    fermentationExplanation: 'Lên men 15-20 ngày: men phân giải đường thành acid hữu cơ, tạo enzyme và tăng cường hấp thu betalain. Thanh trùng giữ dưỡng chất.',
    fermentationExplanationEn: 'Ferment 15-20 days: microbes break sugar into organic acids, create enzymes and enhance betalain absorption. Pasteurization preserves nutrients.',
    healthBenefits: [
      { title: 'Chống oxy hóa', titleEn: 'Antioxidant', description: 'Betalain chống gốc tự do, bảo vệ tế bào, làm chậm lão hóa.', descriptionEn: 'Betalain fights free radicals, protects cells, slows aging.' },
      { title: 'Giải độc gan', titleEn: 'Liver Detox', description: 'Hỗ trợ gan phân giải độc tố, thanh lọc cơ thể.', descriptionEn: 'Supports liver breaking toxins, cleanses body.' },
      { title: 'Làm đẹp da', titleEn: 'Skin Beauty', description: 'Vitamin C tổng hợp collagen, da sáng mịn tự nhiên.', descriptionEn: 'Vitamin C synthesizes collagen, naturally bright smooth skin.' }
    ],
    nutritionFacts: [
      { label: 'Betalain', labelEn: 'Betalain', value: '10-15mg/100ml', valueEn: '10-15mg/100ml', explanation: 'Chống oxy hóa', explanationEn: 'Antioxidant' },
      { label: 'Vitamin C', labelEn: 'Vitamin C', value: '8-10mg/100ml', valueEn: '8-10mg/100ml', explanation: 'Miễn dịch', explanationEn: 'Immunity' },
      { label: 'Chất xơ', labelEn: 'Fiber', value: '0.5g/100ml', valueEn: '0.5g/100ml', explanation: 'Tiêu hóa', explanationEn: 'Digestion' }
    ],
    ingredients: ['Nước thanh long ruột đỏ lên men 85%', 'Nước RO', 'Đường tối thiểu', 'Men vi sinh (Lactobacillus)'],
    ingredientsEn: ['Fermented red dragon fruit water 85%', 'RO water', 'Minimal sugar', 'Probiotics (Lactobacillus)'],
    usage: 'Uống 100-150ml/ngày, sáng đói hoặc tối trước ngủ. Lắc đều trước dùng. Bảo quản 2-8°C sau mở.',
    usageEn: 'Drink 100-150ml/day, morning empty stomach or night before sleep. Shake well before use. Store 2-8°C after opening.',
    faqItems: [
      { question: 'Uống thanh long lên men có tác dụng gì?', questionEn: 'What are the benefits?', answer: 'Chống oxy hóa mạnh, giải độc gan, làm đẹp da nhờ betalain và vitamin C.', answerEn: 'Powerful antioxidant, liver detox, skin beauty from betalain and vitamin C.' },
      { question: 'Có phù hợp với người muốn làm đẹp da?', questionEn: 'Suitable for skin beauty?', answer: 'Rất phù hợp! Vitamin C tổng hợp collagen, betalain chống lão hóa.', answerEn: 'Very suitable! Vitamin C synthesizes collagen, betalain anti-aging.' }
    ],
    tips: ['Uống sáng đói để hấp thu tối đa vitamin C', 'Kết hợp với chế độ ăn nhiều rau xanh'],
    tipsEn: ['Drink morning empty stomach for maximum vitamin C absorption', 'Combine with green vegetable diet'],
    blogReferences: [
      { title: 'Betalain - Chống oxy hóa mạnh', titleEn: 'Betalain - Powerful Antioxidant', description: 'Nghiên cứu về tác dụng betalain', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5426770/' },
      { title: 'Vitamin C & Da khỏe', titleEn: 'Vitamin C & Healthy Skin', description: 'Vai trò vitamin C cho da', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5579659/' }
    ],
    disclaimer: '⚠️ TUYÊN BỐ BR: Thực phẩm bảo vệ sức khỏe, KHÔNG PHẢI THUỐC. ATTP tiêu chuẩn, 73°C thanh trùng, 2-8°C bảo quản, hạn 12 tháng.',
    disclaimerEn: '⚠️ BR STATEMENT: Functional food, NOT DRUG. Food safety standard, 73°C pasteurized, 2-8°C storage, 12-month shelf life.',
  },

  'nuoc-gung-len-men': {
    id: 'nuoc-gung-len-men',
    name: 'Nước Gừng Lên Men Vi Sinh',
    nameEn: 'Fermented Ginger Microbial Drink',
    icon: '🫚',
    price: '32,000đ',
    shopeeUrl: 'https://shopee.vn/product/bucheoh/nuoc-gung-len-men',
    size: '500ml/chai',
    sizeEn: '500ml/bottle',
    expiry: '12 tháng',
    expiryEn: '12 months',
    storage: 'Bảo quản ở nhiệt độ 2-8°C, tránh ánh sáng',
    storageEn: 'Store at 2-8°C, avoid light',
    mfg: 'Được sản xuất theo tiêu chuẩn ATTP, không chứa chất bảo quản hóa học',
    mfgEn: 'Produced to food safety standards, no chemical preservatives',
    summary: 'Nước gừng lên men - giàu gingerol & acid hữu cơ, hỗ trợ tiêu hóa, chống viêm tự nhiên và tăng cường miễn dịch.',
    summaryEn: 'Fermented ginger drink - rich in gingerol & organic acids, supports digestion, natural anti-inflammatory and immunity boost.',
    definition: 'Nước gừng lên men được tạo từ gừng tươi qua lên men với vi sinh vật có lợi. Gừng giàu gingerol (chất cay tự nhiên), giúp chống viêm, hỗ trợ tiêu hóa và tăng cường miễn dịch.',
    definitionEn: 'Fermented ginger drink is created from fresh ginger through fermentation with beneficial microbes. Ginger is rich in gingerol (natural spicy compound), provides anti-inflammatory, digestive support and immunity boost.',
    whyChosen: 'Chọn gừng làm nguyên liệu vì:',
    whyChosenEn: 'Ginger chosen because:',
    technicalReason: '(1) Kỹ thuật: Gừng có tính kháng khuẩn tự nhiên, giàu gingerol và shogaol, lý tưởng cho lên men an toàn.',
    technicalReasonEn: '(1) Technical: Ginger has natural antibacterial properties, rich in gingerol and shogaol, ideal for safe fermentation.',
    sourceReason: '(2) Nguồn: Gừng trồng phổ biến ở Việt Nam, giá rẻ, nguồn cung dồi dào.',
    sourceReasonEn: '(2) Source: Ginger widely grown in Vietnam, cheap, abundant supply.',
    culturalValue: '(3) Giá trị: Gừng là dược liệu truyền thống Việt Nam, được tin dùng lâu đời trong dân gian.',
    culturalValueEn: '(3) Value: Ginger is traditional Vietnamese medicine, long-trusted in folk remedies.',
    productionModel: 'Sản xuất nước gừng lên men, tái sử dụng bã gừng làm phân vi sinh giàu dưỡng chất.',
    productionModelEn: 'Produce fermented ginger drink, reuse ginger pulp as nutrient-rich microbial fertilizer.',
    businessModel: 'Tập trung vào sức khỏe tiêu hóa và miễn dịch, target khách hàng quan tâm sức khỏe tự nhiên.',
    businessModelEn: 'Focus on digestive health and immunity, targeting customers interested in natural health.',
    circularInput: 'Gừng tươi + Men vi sinh (Lactobacillus)',
    circularInputEn: 'Fresh ginger + Probiotics (Lactobacillus)',
    circularOutput: ['Nước gừng → Chống viêm, tiêu hóa, miễn dịch', 'Phân từ bã gừng → Phân vi sinh giàu dưỡng chất'],
    circularOutputEn: ['Fermented drink → Anti-inflammatory, digestion, immunity', 'Ginger pulp fertilizer → Nutrient-rich fertilizer'],
    processDescription: 'Quy trình: (1) Rửa, gọt vỏ, cắt gừng. (2) Lên men 12-18 ngày ở 25-28°C. (3) Lọc tách nước. (4) Thanh trùng 73°C/15 phút. (5) Pha chuẩn. (6) Đóng chai 500ml.',
    processDescriptionEn: 'Process: (1) Wash, peel, cut ginger. (2) Ferment 12-18 days at 25-28°C. (3) Filter extract. (4) Pasteurize 73°C/15 min. (5) Standardize. (6) Bottle 500ml.',
    educationalContent: 'Gingerol từ gừng là chất chống viêm tự nhiên, giảm đau khớp và hỗ trợ tiêu hóa. Lên men tăng cường hấp thu gingerol.',
    educationalContentEn: 'Gingerol from ginger is natural anti-inflammatory, reduces joint pain and supports digestion. Fermentation enhances gingerol absorption.',
    fermentationExplanation: 'Lên men 12-18 ngày: men phân giải gingerol thành shogaol (tác dụng mạnh hơn), tạo acid hữu cơ. Thanh trùng giữ dưỡng chất.',
    fermentationExplanationEn: 'Ferment 12-18 days: microbes break gingerol into shogaol (stronger effect), create organic acids. Pasteurization preserves nutrients.',
    healthBenefits: [
      { title: 'Chống viêm', titleEn: 'Anti-inflammatory', description: 'Gingerol giảm viêm khớp, viêm dạ dày tự nhiên.', descriptionEn: 'Gingerol reduces joint inflammation, gastritis naturally.' },
      { title: 'Hỗ trợ tiêu hóa', titleEn: 'Digestive Support', description: 'Kích thích tiết dịch vị, giảm đầy hơi, khó tiêu.', descriptionEn: 'Stimulates gastric secretion, reduces bloating, indigestion.' },
      { title: 'Tăng miễn dịch', titleEn: 'Immunity Boost', description: 'Tính kháng khuẩn tự nhiên, tăng sức đề kháng.', descriptionEn: 'Natural antibacterial, increases resistance.' }
    ],
    nutritionFacts: [
      { label: 'Gingerol', labelEn: 'Gingerol', value: '15-20mg/100ml', valueEn: '15-20mg/100ml', explanation: 'Chống viêm', explanationEn: 'Anti-inflammatory' },
      { label: 'Shogaol', labelEn: 'Shogaol', value: '5-8mg/100ml', valueEn: '5-8mg/100ml', explanation: 'Tăng cường', explanationEn: 'Enhanced' },
      { label: 'Acid hữu cơ', labelEn: 'Organic acids', value: '0.3g/100ml', valueEn: '0.3g/100ml', explanation: 'Tiêu hóa', explanationEn: 'Digestion' }
    ],
    ingredients: ['Nước gừng lên men 80%', 'Nước RO', 'Mật ong tự nhiên', 'Men vi sinh (Lactobacillus)'],
    ingredientsEn: ['Fermented ginger water 80%', 'RO water', 'Natural honey', 'Probiotics (Lactobacillus)'],
    usage: 'Uống 100ml/ngày, sáng đói hoặc sau bữa ăn. Lắc đều trước dùng. Bảo quản 2-8°C sau mở.',
    usageEn: 'Drink 100ml/day, morning empty stomach or after meals. Shake well before use. Store 2-8°C after opening.',
    faqItems: [
      { question: 'Uống gừng lên men có tác dụng gì?', questionEn: 'What are the benefits?', answer: 'Chống viêm, hỗ trợ tiêu hóa, tăng miễn dịch nhờ gingerol và shogaol.', answerEn: 'Anti-inflammatory, digestive support, immunity boost from gingerol and shogaol.' },
      { question: 'Có cay không?', questionEn: 'Is it spicy?', answer: 'Có vị cay nhẹ dễ chịu, không gắt như gừng tươi.', answerEn: 'Mildly spicy pleasant taste, not as sharp as fresh ginger.' }
    ],
    tips: ['Uống ấm để tăng hiệu quả chống viêm', 'Kết hợp với mật ong khi cảm cúm'],
    tipsEn: ['Drink warm to enhance anti-inflammatory effect', 'Combine with honey when having cold'],
    blogReferences: [
      { title: 'Gingerol - Chống viêm tự nhiên', titleEn: 'Gingerol - Natural Anti-inflammatory', description: 'Nghiên cứu về gingerol', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3665023/' },
      { title: 'Gừng & Tiêu hóa', titleEn: 'Ginger & Digestion', description: 'Tác dụng gừng với dạ dày', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4818021/' }
    ],
    disclaimer: '⚠️ TUYÊN BỐ BR: Thực phẩm bảo vệ sức khỏe, KHÔNG PHẢI THUỐC. ATTP tiêu chuẩn, 73°C thanh trùng, 2-8°C bảo quản, hạn 12 tháng.',
    disclaimerEn: '⚠️ BR STATEMENT: Functional food, NOT DRUG. Food safety standard, 73°C pasteurized, 2-8°C storage, 12-month shelf life.',
  },

  'nuoc-buoi-len-men': {
    id: 'nuoc-buoi-len-men',
    name: 'Nước Bưởi Lên Men Vi Sinh',
    nameEn: 'Fermented Pomelo Microbial Drink',
    icon: '🍊',
    price: '32,000đ',
    shopeeUrl: 'https://shopee.vn/product/bucheoh/nuoc-buoi-len-men',
    size: '500ml/chai',
    sizeEn: '500ml/bottle',
    expiry: '12 tháng',
    expiryEn: '12 months',
    storage: 'Bảo quản ở nhiệt độ 2-8°C, tránh ánh sáng',
    storageEn: 'Store at 2-8°C, avoid light',
    mfg: 'Được sản xuất theo tiêu chuẩn ATTP, không chứa chất bảo quản hóa học',
    mfgEn: 'Produced to food safety standards, no chemical preservatives',
    summary: 'Nước bưởi lên men - giàu naringin & vitamin C, hỗ trợ giảm cân, cân bằng cholesterol và detox tự nhiên.',
    summaryEn: 'Fermented pomelo drink - rich in naringin & vitamin C, supports weight loss, cholesterol balance and natural detox.',
    definition: 'Nước bưởi lên men được tạo từ bưởi da xanh tươi qua lên men với vi sinh vật có lợi. Bưởi giàu naringin (flavonoid tự nhiên) và vitamin C, giúp giảm cân, cân bằng cholesterol.',
    definitionEn: 'Fermented pomelo drink is created from fresh green pomelo through fermentation with beneficial microbes. Pomelo is rich in naringin (natural flavonoid) and vitamin C, supports weight loss, cholesterol balance.',
    whyChosen: 'Chọn bưởi làm nguyên liệu vì:',
    whyChosenEn: 'Pomelo chosen because:',
    technicalReason: '(1) Kỹ thuật: Bưởi có pH thấp (3.5-4.0), giàu naringin và vitamin C, lý tưởng cho lên men an toàn.',
    technicalReasonEn: '(1) Technical: Pomelo has low pH (3.5-4.0), rich in naringin and vitamin C, ideal for safe fermentation.',
    sourceReason: '(2) Nguồn: Bưởi trồng nhiều ở miền Tây, giá hợp lý, nguồn cung ổn định.',
    sourceReasonEn: '(2) Source: Pomelo widely grown in Mekong Delta, reasonable price, stable supply.',
    culturalValue: '(3) Giá trị: Bưởi là trái cây truyền thống Việt Nam, được ưa chuộng vì vị thanh mát.',
    culturalValueEn: '(3) Value: Pomelo is traditional Vietnamese fruit, favored for refreshing taste.',
    productionModel: 'Sản xuất nước bưởi lên men, tái sử dụng vỏ bưởi làm tinh dầu và phân vi sinh.',
    productionModelEn: 'Produce fermented pomelo drink, reuse pomelo peel for essential oil and microbial fertilizer.',
    businessModel: 'Tập trung vào giảm cân và detox, target khách hàng quan tâm sức khỏe và vóc dáng.',
    businessModelEn: 'Focus on weight loss and detox, targeting customers interested in health and body shape.',
    circularInput: 'Bưởi da xanh tươi + Men vi sinh (Lactobacillus)',
    circularInputEn: 'Fresh green pomelo + Probiotics (Lactobacillus)',
    circularOutput: ['Nước bưởi → Giảm cân, cân bằng cholesterol, detox', 'Vỏ bưởi → Tinh dầu & phân vi sinh'],
    circularOutputEn: ['Fermented drink → Weight loss, cholesterol balance, detox', 'Pomelo peel → Essential oil & fertilizer'],
    processDescription: 'Quy trình: (1) Rửa, bóc vỏ, tách múi bưởi. (2) Lên men 18-22 ngày ở 22-26°C. (3) Lọc tách nước. (4) Thanh trùng 73°C/15 phút. (5) Pha chuẩn. (6) Đóng chai 500ml.',
    processDescriptionEn: 'Process: (1) Wash, peel, separate pomelo segments. (2) Ferment 18-22 days at 22-26°C. (3) Filter extract. (4) Pasteurize 73°C/15 min. (5) Standardize. (6) Bottle 500ml.',
    educationalContent: 'Naringin từ bưởi giúp đốt cháy mỡ, ngăn hấp thu chất béo. Vitamin C tăng cường chuyển hóa năng lượng.',
    educationalContentEn: 'Naringin from pomelo helps burn fat, prevents fat absorption. Vitamin C enhances energy metabolism.',
    fermentationExplanation: 'Lên men 18-22 ngày: men phân giải naringin tăng sinh khả dụng, tạo acid hữu cơ hỗ trợ giảm cân. Thanh trùng giữ dưỡng chất.',
    fermentationExplanationEn: 'Ferment 18-22 days: microbes break naringin for increased bioavailability, create organic acids supporting weight loss. Pasteurization preserves nutrients.',
    healthBenefits: [
      { title: 'Hỗ trợ giảm cân', titleEn: 'Weight Loss Support', description: 'Naringin đốt cháy mỡ, ngăn hấp thu chất béo.', descriptionEn: 'Naringin burns fat, prevents fat absorption.' },
      { title: 'Cân bằng cholesterol', titleEn: 'Cholesterol Balance', description: 'Giảm LDL xấu, tăng HDL tốt tự nhiên.', descriptionEn: 'Reduces bad LDL, increases good HDL naturally.' },
      { title: 'Detox tự nhiên', titleEn: 'Natural Detox', description: 'Vitamin C thanh lọc cơ thể, tăng chuyển hóa.', descriptionEn: 'Vitamin C cleanses body, boosts metabolism.' }
    ],
    nutritionFacts: [
      { label: 'Naringin', labelEn: 'Naringin', value: '20-25mg/100ml', valueEn: '20-25mg/100ml', explanation: 'Giảm cân', explanationEn: 'Weight loss' },
      { label: 'Vitamin C', labelEn: 'Vitamin C', value: '12-15mg/100ml', valueEn: '12-15mg/100ml', explanation: 'Miễn dịch', explanationEn: 'Immunity' },
      { label: 'Chất xơ', labelEn: 'Fiber', value: '0.4g/100ml', valueEn: '0.4g/100ml', explanation: 'Tiêu hóa', explanationEn: 'Digestion' }
    ],
    ingredients: ['Nước bưởi lên men 85%', 'Nước RO', 'Đường tối thiểu', 'Men vi sinh (Lactobacillus)'],
    ingredientsEn: ['Fermented pomelo water 85%', 'RO water', 'Minimal sugar', 'Probiotics (Lactobacillus)'],
    usage: 'Uống 150ml/ngày, trước bữa ăn 30 phút để hỗ trợ giảm cân. Lắc đều trước dùng. Bảo quản 2-8°C sau mở.',
    usageEn: 'Drink 150ml/day, 30 minutes before meals to support weight loss. Shake well before use. Store 2-8°C after opening.',
    faqItems: [
      { question: 'Uống bưởi lên men có giảm cân không?', questionEn: 'Does it help weight loss?', answer: 'Có! Naringin giúp đốt cháy mỡ và ngăn hấp thu chất béo hiệu quả.', answerEn: 'Yes! Naringin helps burn fat and effectively prevents fat absorption.' },
      { question: 'Bao lâu thấy kết quả?', questionEn: 'How long to see results?', answer: 'Khoảng 3-4 tuần sử dụng đều đặn kết hợp chế độ ăn lành mạnh.', answerEn: 'About 3-4 weeks regular use combined with healthy diet.' }
    ],
    tips: ['Uống trước bữa ăn 30 phút để tăng hiệu quả giảm cân', 'Kết hợp vận động nhẹ'],
    tipsEn: ['Drink 30 minutes before meals for enhanced weight loss', 'Combine with light exercise'],
    blogReferences: [
      { title: 'Naringin & Giảm cân', titleEn: 'Naringin & Weight Loss', description: 'Nghiên cứu về naringin', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4277626/' },
      { title: 'Bưởi & Cholesterol', titleEn: 'Pomelo & Cholesterol', description: 'Tác dụng bưởi với cholesterol', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3992385/' }
    ],
    disclaimer: '⚠️ TUYÊN BỐ BR: Thực phẩm bảo vệ sức khỏe, KHÔNG PHẢI THUỐC. ATTP tiêu chuẩn, 73°C thanh trùng, 2-8°C bảo quản, hạn 12 tháng.',
    disclaimerEn: '⚠️ BR STATEMENT: Functional food, NOT DRUG. Food safety standard, 73°C pasteurized, 2-8°C storage, 12-month shelf life.',
  },

  'phan-vi-sinh-tong-hop': {
    id: 'phan-vi-sinh-tong-hop',
    name: 'Phân Vi Sinh Tổng Hợp',
    nameEn: 'Multi-Purpose Microbial Fertilizer',
    icon: '🌱',
    price: '30,000đ',
    size: '1 lít/chai',
    sizeEn: '1L/bottle',
    expiry: '18 tháng',
    expiryEn: '18 months',
    storage: 'Bảo quản 15-25°C',
    storageEn: 'Store 15-25°C',
    mfg: 'Tiêu chuẩn ATTP',
    mfgEn: 'Food safety standard',
    summary: 'Phân vi sinh tổng hợp, hỗ trợ tất cả loại cây.',
    summaryEn: 'Multi-purpose microbial fertilizer, supports all plants.',
    definition: 'Phân từ bã lên men.',
    definitionEn: 'Fertilizer from fermented pulp.',
    whyChosen: 'Kinh tế tuần hoàn.',
    whyChosenEn: 'Circular economy.',
    technicalReason: '(1) Tái sử dụng bã.',
    technicalReasonEn: '(1) Reuse pulp.',
    sourceReason: '(2) Bền vững.',
    sourceReasonEn: '(2) Sustainable.',
    culturalValue: '(3) Nông nghiệp xanh.',
    culturalValueEn: '(3) Green agriculture.',
    productionModel: 'Từ bã lên men.',
    productionModelEn: 'From fermented pulp.',
    businessModel: 'Giáo dục nông dân.',
    businessModelEn: 'Educate farmers.',
    circularInput: 'Bã lên men + Men',
    circularInputEn: 'Pulp + Microbes',
    circularOutput: ['Phân tổng hợp', 'Cải tạo đất'],
    circularOutputEn: ['Multi-purpose fertilizer', 'Soil improvement'],
    processDescription: 'Ủ lên men 30-45 ngày.',
    processDescriptionEn: 'Ferment 30-45 days.',
    educationalContent: 'Cung cấp vi sinh vật.',
    educationalContentEn: 'Provides microbes.',
    fermentationExplanation: 'Tạo hệ vi sinh vật.',
    fermentationExplanationEn: 'Creates microbe system.',
    healthBenefits: [
      { title: 'Cải tạo đất', titleEn: 'Soil Improvement', description: 'Tăng cấu trúc đất.', descriptionEn: 'Improves soil structure.' },
      { title: 'Hấp thu dinh dưỡng', titleEn: 'Nutrient Uptake', description: 'Cây hấp thu tốt.', descriptionEn: 'Plants absorb well.' },
      { title: 'Giảm bệnh', titleEn: 'Disease Reduction', description: 'Tăng sức đề kháng.', descriptionEn: 'Strengthen immunity.' }
    ],
    nutritionFacts: [
      { label: 'N', labelEn: 'N', value: '1-2%', valueEn: '1-2%', explanation: 'Từ vi sinh vật', explanationEn: 'From microbes' },
      { label: 'P', labelEn: 'P', value: '0.5-1%', valueEn: '0.5-1%', explanation: 'Từ bã', explanationEn: 'From pulp' },
      { label: 'K', labelEn: 'K', value: '1-2%', valueEn: '1-2%', explanation: 'Từ bã', explanationEn: 'From pulp' },
      { label: 'Vi sinh', labelEn: 'Microbes', value: '10^8/g', valueEn: '10^8/g', explanation: 'Lạc', explanationEn: 'Beneficial' },
      { label: 'Hữu cơ', labelEn: 'Organic', value: '20-30%', valueEn: '20-30%', explanation: 'Từ bã', explanationEn: 'From pulp' }
    ],
    ingredients: ['Bã', 'Men', 'Nấm men', 'Enzyme'],
    ingredientsEn: ['Pulp', 'Bacteria', 'Yeast', 'Enzymes'],
    usage: '1-2 lít/10m2, 1-2 lần/tháng.',
    usageEn: '1-2L/10m2, 1-2x/month.',
    tips: ['Khi đất khô', 'Không trộn hóa chất', 'Giảm dần', 'Giữ ẩm', 'Bảo quản mát'],
    tipsEn: ['When soil dry', 'No chemical mix', 'Gradual reduction', 'Keep moist', 'Cool storage'],
    faqItems: [
      { question: 'Có mùi?', questionEn: 'Smell?', answer: 'Có, lên men.', answerEn: 'Yes, fermentation.' },
      { question: 'Với hóa chất?', questionEn: 'With chemical?', answer: 'Không ngay.', answerEn: 'Not initially.' },
      { question: 'Bao lâu?', questionEn: 'How long?', answer: '2-4 tuần.', answerEn: '2-4 weeks.' }
    ],
    blogReferences: [
      { title: 'So sánh', titleEn: 'Comparison', description: 'Vi sinh vs Hóa học' },
      { title: 'Kinh tế tuần hoàn', titleEn: 'Circular Economy', description: 'Nông nghiệp' },
      { title: 'Bền vững', titleEn: 'Sustainable', description: 'Tương lai' }
    ],
    disclaimer: '⚠️ Không thuốc.',
    disclaimerEn: '⚠️ Not pesticide.'
  },

  'phan-vi-sinh-cho-rau': {
    id: 'phan-vi-sinh-cho-rau',
    name: 'Phân Vi Sinh Cho Rau',
    nameEn: 'Vegetable-Specific Microbial Fertilizer',
    icon: '🥦',
    price: '30,000đ',
    size: '1 lít/chai',
    sizeEn: '1L/bottle',
    expiry: '18 tháng',
    expiryEn: '18 months',
    storage: 'Bảo quản 15-25°C',
    storageEn: 'Store 15-25°C',
    mfg: 'Tiêu chuẩn ATTP',
    mfgEn: 'Food safety standard',
    summary: 'Phân cho rau, N cao.',
    summaryEn: 'Vegetable fertilizer, high N.',
    definition: 'Phân tối ưu N.',
    definitionEn: 'High nitrogen fertilizer.',
    whyChosen: 'Rau cần N.',
    whyChosenEn: 'Vegetables need N.',
    technicalReason: '(1) N cao.',
    technicalReasonEn: '(1) High N.',
    sourceReason: '(2) Rau VN.',
    sourceReasonEn: '(2) Vietnam vegetables.',
    culturalValue: '(3) Rau sạch.',
    culturalValueEn: '(3) Clean vegetables.',
    productionModel: 'N-fixing bacteria.',
    productionModelEn: 'N-fixing bacteria.',
    businessModel: 'Nông dân rau.',
    businessModelEn: 'Vegetable farmers.',
    circularInput: 'Bã + Azotobacter',
    circularInputEn: 'Pulp + Azotobacter',
    circularOutput: ['Phân rau', 'Rau sạch'],
    circularOutputEn: ['Vegetable fertilizer', 'Clean vegetables'],
    processDescription: 'Ủ 35-50 ngày, tối ưu N-fixing.',
    processDescriptionEn: 'Ferment 35-50 days, optimize N-fixing.',
    educationalContent: 'Cố định N.',
    educationalContentEn: 'Nitrogen fixation.',
    fermentationExplanation: 'Tạo điều kiện N-fixing.',
    fermentationExplanationEn: 'Optimize N-fixing conditions.',
    healthBenefits: [
      { title: 'Lá xanh nhanh', titleEn: 'Fast Green Leaves', description: 'N nhanh.', descriptionEn: 'Fast N.' },
      { title: 'Năng suất cao', titleEn: 'High Yield', description: 'Cao.', descriptionEn: 'High.' },
      { title: 'Rau sạch', titleEn: 'Clean Vegetables', description: 'Không hóa chất.', descriptionEn: 'No chemicals.' }
    ],
    nutritionFacts: [
      { label: 'N', labelEn: 'N', value: '2-3%', valueEn: '2-3%', explanation: 'Cao.', explanationEn: 'High.' },
      { label: 'P', labelEn: 'P', value: '0.5-1%', valueEn: '0.5-1%', explanation: 'P.', explanationEn: 'P.' },
      { label: 'K', labelEn: 'K', value: '1-1.5%', valueEn: '1-1.5%', explanation: 'K.', explanationEn: 'K.' },
      { label: 'Azotobacter', labelEn: 'Azotobacter', value: '10^9/g', valueEn: '10^9/g', explanation: 'Cao.', explanationEn: 'High.' },
      { label: 'Enzyme', labelEn: 'Enzymes', value: 'Cao', valueEn: 'High', explanation: 'Cao.', explanationEn: 'High.' }
    ],
    ingredients: ['Bã', 'Azotobacter', 'Azospirillum', 'Lactobacillus', 'Enzyme'],
    ingredientsEn: ['Pulp', 'Azotobacter', 'Azospirillum', 'Lactobacillus', 'Enzymes'],
    usage: '2-3 lít/10m2, 2-1 lần/tháng.',
    usageEn: '2-3L/10m2, 2-1x/month.',
    tips: ['Trồng mới', 'Không ammonia', 'Tưới nước', 'Rau xanh', 'Watering'],
    tipsEn: ['New planting', 'No ammonia', 'Water well', 'Leafy greens', 'Adequate water'],
    faqItems: [
      { question: 'Tại sao N?', questionEn: 'Why N?', answer: 'Xanh nhanh.', answerEn: 'Fast green.' },
      { question: 'Azotobacter?', questionEn: 'Azotobacter?', answer: 'Cố định N.', answerEn: 'Fix N.' },
      { question: 'Nhanh?', questionEn: 'Fast?', answer: '2-3 tuần.', answerEn: '2-3 weeks.' }
    ],
    blogReferences: [
      { title: 'Cố định N', titleEn: 'N Fixation', description: 'Cách hoạt động.' },
      { title: 'Rau sạch', titleEn: 'Clean Vegetables', description: 'Không hóa chất.' },
      { title: 'Nông dân bền vững', titleEn: 'Sustainable Farmers', description: 'Chuyển đổi.' }
    ],
    disclaimer: '⚠️ Không thuốc.',
    disclaimerEn: '⚠️ Not pesticide.'
  },

  'phan-vi-sinh-cho-cay-an-trai': {
    id: 'phan-vi-sinh-cho-cay-an-trai',
    name: 'Phân Vi Sinh Cho Cây Ăn Trái',
    nameEn: 'Fruit Tree-Specific Microbial Fertilizer',
    icon: '🍎',
    price: '30,000đ',
    size: '1 lít/chai',
    sizeEn: '1L/bottle',
    expiry: '18 tháng',
    expiryEn: '18 months',
    storage: 'Bảo quản 15-25°C',
    storageEn: 'Store 15-25°C',
    mfg: 'Tiêu chuẩn ATTP',
    mfgEn: 'Food safety standard',
    summary: 'Phân cho cây ăn trái, P & K cao.',
    summaryEn: 'Fruit tree fertilizer, high P & K.',
    definition: 'Phân tối ưu P & K.',
    definitionEn: 'High P & K fertilizer.',
    whyChosen: 'Chất lượng trái.',
    whyChosenEn: 'Fruit quality.',
    technicalReason: '(1) P & K.',
    technicalReasonEn: '(1) P & K.',
    sourceReason: '(2) Cây VN.',
    sourceReasonEn: '(2) Vietnam trees.',
    culturalValue: '(3) Trái ngọt.',
    culturalValueEn: '(3) Sweet fruit.',
    productionModel: 'Bacillus megaterium.',
    productionModelEn: 'Bacillus megaterium.',
    businessModel: 'Nông dân trái.',
    businessModelEn: 'Fruit tree farmers.',
    circularInput: 'Bã + Bacillus',
    circularInputEn: 'Pulp + Bacillus',
    circularOutput: ['Phân trái', 'Trái ngọt'],
    circularOutputEn: ['Fruit fertilizer', 'Sweet fruit'],
    processDescription: 'Ủ 40-60 ngày, tối ưu P & K.',
    processDescriptionEn: 'Ferment 40-60 days, optimize P & K.',
    educationalContent: 'P & K.',
    educationalContentEn: 'P & K.',
    fermentationExplanation: 'Tạo điều kiện P & K.',
    fermentationExplanationEn: 'Optimize P & K conditions.',
    healthBenefits: [
      { title: 'Ra hoa, đậu trái', titleEn: 'Flowering, Fruiting', description: 'Hoa trái.', descriptionEn: 'Flowers & fruit.' },
      { title: 'Trái to, ngọt', titleEn: 'Large, Sweet Fruit', description: 'Chất lượng.', descriptionEn: 'Quality.' },
      { title: 'Cây khỏe', titleEn: 'Healthy Tree', description: 'Kháng stress.', descriptionEn: 'Stress-tolerant.' }
    ],
    nutritionFacts: [
      { label: 'N', labelEn: 'N', value: '1-1.5%', valueEn: '1-1.5%', explanation: 'Cân bằng.', explanationEn: 'Balanced.' },
      { label: 'P', labelEn: 'P', value: '2-3%', valueEn: '2-3%', explanation: 'Cao.', explanationEn: 'High.' },
      { label: 'K', labelEn: 'K', value: '2-3%', valueEn: '2-3%', explanation: 'Cao.', explanationEn: 'High.' },
      { label: 'Bacillus', labelEn: 'Bacillus', value: '10^9/g', valueEn: '10^9/g', explanation: 'Cao.', explanationEn: 'High.' },
      { label: 'Enzyme', labelEn: 'Enzymes', value: 'Cao', valueEn: 'High', explanation: 'Cao.', explanationEn: 'High.' }
    ],
    ingredients: ['Bã', 'Bacillus megaterium', 'K-bacteria', 'Lactobacillus', 'Enzyme'],
    ingredientsEn: ['Pulp', 'Bacillus megaterium', 'K-bacteria', 'Lactobacillus', 'Enzymes'],
    usage: '2-3 lít/cây lớn, 2-1 lần/tháng.',
    usageEn: '2-3L/mature tree, 2-1x/month.',
    tips: ['Rụng lá', 'Không N quá', 'Tưới nước', 'Xén cành', 'Liên tục'],
    tipsEn: ['Dormant season', 'Avoid excess N', 'Water well', 'Prune', 'Continuous use'],
    faqItems: [
      { question: 'Tại sao N cao ít trái?', questionEn: 'Why excess N reduces fruit?', answer: 'Lá quá.', answerEn: 'Too much leaf.' },
      { question: 'Bacillus?', questionEn: 'How Bacillus works?', answer: 'Phân giải P.', answerEn: 'Solubilize P.' },
      { question: 'Bao lâu?', questionEn: 'How long?', answer: '2-3 tháng.', answerEn: '2-3 months.' }
    ],
    blogReferences: [
      { title: 'Trái ngọt', titleEn: 'Sweet Fruit', description: 'P & K.' },
      { title: 'Bacillus', titleEn: 'Bacillus', description: 'Vi sinh vật.' },
      { title: 'Cây trái', titleEn: 'Fruit Trees', description: 'Không hóa chất.' }
    ],
    disclaimer: '⚠️ Không thuốc.',
    disclaimerEn: '⚠️ Not pesticide.'
  },
};

export const ProductDetailPage = () => {
  const { category, productId } = useParams<{ category: string; productId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'nutrition' | 'usage' | 'faq'>('nutrition');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    definition: false,
    whyChosen: false,
    circular: false,
    process: false,
    fermentation: false,
    healthBenefits: false
  });
  const isVi = language === 'vi';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  const product = productId ? productDetails[productId] : null;

  if (!product || !category) {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(`/products/${category}`)}>
        <FaArrowLeft /> {isVi ? 'Quay lại' : 'Back'}
      </button>

      {/* 1. PRODUCT OVERVIEW - E-commerce Layout */}
      <section className={styles.productOverview}>
        {/* Image Gallery - Left Side */}
        <div className={styles.productGallery}>
          <div className={styles.mainImage}>
            <div className={styles.productIcon}>{product.icon}</div>
          </div>
        </div>

        {/* Product Info - Right Side */}
        <div className={styles.productInfo}>
          <h1 className={styles.productTitle}>{isVi ? product.name : product.nameEn}</h1>
          <p className={styles.productSummary}>{isVi ? product.summary : product.summaryEn}</p>
          
          <div className={styles.priceSection}>
            <div className={styles.price}>{product.price}</div>
            <div className={styles.priceLabel}>{isVi ? 'Giá bán' : 'Price'}</div>
          </div>

          <div className={styles.productMeta}>
            {product.size && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📦</span>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>{isVi ? 'Quy cách' : 'Size'}</div>
                  <div className={styles.metaValue}>{isVi ? product.size : product.sizeEn}</div>
                </div>
              </div>
            )}
            {product.expiry && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📅</span>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>{isVi ? 'Hạn sử dụng' : 'Expiry'}</div>
                  <div className={styles.metaValue}>{isVi ? product.expiry : product.expiryEn}</div>
                </div>
              </div>
            )}
            {product.storage && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>❄️</span>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>{isVi ? 'Bảo quản' : 'Storage'}</div>
                  <div className={styles.metaValue}>{isVi ? product.storage : product.storageEn}</div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.ctaButtons}>
            <a 
              href={product.shopeeUrl || 'https://shopee.vn/bucheoh'} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '6px' }}>
                <path d="M19.8 4.5H4.2C2.4 4.5 1 5.9 1 7.7v8.6c0 1.8 1.4 3.2 3.2 3.2h15.6c1.8 0 3.2-1.4 3.2-3.2V7.7c0-1.8-1.4-3.2-3.2-3.2zM8.5 15.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
              {isVi ? 'Mua ngay' : 'Buy Now'}
            </a>
            <button className={styles.ctaSecondary} onClick={() => navigate('/contact')}>
              📞 {isVi ? 'Liên hệ' : 'Contact'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. KEY BENEFITS */}
      <div id="product-details"></div>
      {product.healthBenefits && product.healthBenefits.length > 0 && (
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

      {/* 3. NUTRITION & USAGE TABS */}
      <section className={styles.infoSection}>
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabButton} ${activeTab === 'nutrition' ? styles.active : ''}`}
            onClick={() => setActiveTab('nutrition')}
          >
            {isVi ? 'Thành Phần & Dinh Dưỡng' : 'Nutrition & Ingredients'}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'usage' ? styles.active : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            {isVi ? 'Hướng Dẫn Sử Dụng' : 'How to Use'}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'faq' ? styles.active : ''}`}
            onClick={() => setActiveTab('faq')}
          >
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
                    {(isVi ? product.ingredients : product.ingredientsEn).map((item, idx) => (
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
                        {fact.explanation && (
                          <div className={styles.nutritionNote}>{isVi ? fact.explanation : fact.explanationEn}</div>
                        )}
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
                
                {product.tips && product.tips.length > 0 && (
                  <div className={styles.tipsSection}>
                    <h4>{isVi ? 'Mẹo Sử Dụng' : 'Helpful Tips'}</h4>
                    <ul className={styles.tipsList}>
                      {(isVi ? product.tips : product.tipsEn).map((tip, idx) => (
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

      {/* 4. EDUCATIONAL CONTENT */}
      <section className={styles.educationSection}>
        <h2 className={styles.sectionTitle}>{isVi ? 'Tìm Hiểu Thêm' : 'Learn More'}</h2>
        
        <div className={styles.educationCard}>
          <button 
            className={styles.educationCardHeader}
            onClick={() => toggleSection('definition')}
          >
            <span>{isVi ? 'Sản Phẩm Này Là Gì?' : 'What is this product?'}</span>
            <span className={styles.chevron}>{expandedSections.definition ? '▼' : '▶'}</span>
          </button>
          {expandedSections.definition && (
            <div className={styles.educationCardBody}>
              <p>{isVi ? product.definition : product.definitionEn}</p>
            </div>
          )}
        </div>

        <div className={styles.educationCard}>
          <button 
            className={styles.educationCardHeader}
            onClick={() => toggleSection('whyChosen')}
          >
            <span>{isVi ? 'Tại Sao Chọn Nguyên Liệu Này?' : 'Why these ingredients?'}</span>
            <span className={styles.chevron}>{expandedSections.whyChosen ? '▼' : '▶'}</span>
          </button>
          {expandedSections.whyChosen && (
            <div className={styles.educationCardBody}>
              <p>{isVi ? product.whyChosen : product.whyChosenEn}</p>
              <ul className={styles.reasonList}>
                <li>{isVi ? product.technicalReason : product.technicalReasonEn}</li>
                <li>{isVi ? product.sourceReason : product.sourceReasonEn}</li>
                <li>{isVi ? product.culturalValue : product.culturalValueEn}</li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.educationCard}>
          <button 
            className={styles.educationCardHeader}
            onClick={() => toggleSection('fermentation')}
          >
            <span>{isVi ? 'Quá Trình Lên Men' : 'Fermentation Process'}</span>
            <span className={styles.chevron}>{expandedSections.fermentation ? '▼' : '▶'}</span>
          </button>
          {expandedSections.fermentation && (
            <div className={styles.educationCardBody}>
              <p>{isVi ? product.fermentationExplanation : product.fermentationExplanationEn}</p>
            </div>
          )}
        </div>

        <div className={styles.educationCard}>
          <button 
            className={styles.educationCardHeader}
            onClick={() => toggleSection('process')}
          >
            <span>{isVi ? 'Quy Trình Sản Xuất' : 'Production Process'}</span>
            <span className={styles.chevron}>{expandedSections.process ? '▼' : '▶'}</span>
          </button>
          {expandedSections.process && (
            <div className={styles.educationCardBody}>
              <p>{isVi ? product.processDescription : product.processDescriptionEn}</p>
            </div>
          )}
        </div>

        <div className={styles.educationCard}>
          <button 
            className={styles.educationCardHeader}
            onClick={() => toggleSection('circular')}
          >
            <span>{isVi ? 'Kinh Tế Tuần Hoàn' : 'Circular Economy'}</span>
            <span className={styles.chevron}>{expandedSections.circular ? '▼' : '▶'}</span>
          </button>
          {expandedSections.circular && (
            <div className={styles.educationCardBody}>
              <p><strong>{isVi ? 'Đầu Vào:' : 'Input:'}</strong> {isVi ? product.circularInput : product.circularInputEn}</p>
              <p><strong>{isVi ? 'Sản Phẩm:' : 'Products:'}</strong></p>
              <ul>
                {(isVi ? product.circularOutput : product.circularOutputEn).map((output, idx) => (
                  <li key={idx}>{output}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 5. REFERENCES */}
      {product.blogReferences && product.blogReferences.length > 0 && (
        <section className={styles.referencesSection}>
          <h2 className={styles.sectionTitle}>{isVi ? 'Tài Liệu Tham Khảo Khoa Học' : 'Scientific References'}</h2>
          <p className={styles.referencesIntro}>
            {isVi 
              ? 'Các nghiên cứu khoa học được công bố trên các tạp chí uy tín quốc tế:'
              : 'Published scientific studies from reputable international journals:'}
          </p>
          <div className={styles.referencesList}>
            {product.blogReferences.map((ref, idx) => (
              <a 
                key={idx} 
                href={ref.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.referenceItem}
              >
                <div className={styles.referenceNumber}>{idx + 1}</div>
                <div className={styles.referenceContent}>
                  <h4 className={styles.referenceTitle}>{isVi ? ref.title : ref.titleEn}</h4>
                  <p className={styles.referenceDesc}>{ref.description}</p>
                  <span className={styles.referenceLink}>
                    🔗 {isVi ? 'Xem nghiên cứu' : 'View study'} →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 6. DISCLAIMER */}
      <section className={styles.disclaimerSection}>
        <p className={styles.disclaimerText}>{isVi ? product.disclaimer : product.disclaimerEn}</p>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>{isVi ? 'Bạn Có Câu Hỏi?' : 'Have Questions?'}</h2>
        <p>{isVi ? 'Liên hệ với chúng tôi để được tư vấn' : 'Contact us for more information'}</p>
        <button className={styles.ctaButton} onClick={() => navigate('/contact')}>
          {isVi ? '📞 Liên hệ' : '📞 Contact'}
        </button>
      </section>
    </div>
  );
};

export default ProductDetailPage;
