export interface NutritionFact {
  label: string;
  labelEn: string;
  value: string;
  valueEn: string;
  explanation?: string;
  explanationEn?: string;
}

export interface FaqItem {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

export interface BlogReference {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn?: string;
  url?: string;
}

export interface ProductDetail {
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

// Backup dữ liệu chi tiết sản phẩm hiện tại để bạn có thể tự chỉnh tay
export const productDetailsBackup: Record<string, ProductDetail> = {
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
      { title: 'Inulin - Tiền tiêu đường tự nhiên', titleEn: 'Inulin - Natural Prebiotic', description: 'Cách inulin cân bằng đường huyết, nuôi vi khuẩn tốt, hỗ trợ cân nặng', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3705355/' },
      { title: 'Lactic Acid: Tự nhiên chống viêm', titleEn: 'Lactic Acid: Natural Anti-Inflammatory', description: 'Lactic acid từ lên men giúp giảm viêm ruột, cải thiện sức khỏe đường ruột', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6770950/' },
      { title: 'Jerusalem Artichoke - Nghiên cứu dinh dưỡng', titleEn: 'Jerusalem Artichoke - Nutritional Research', description: 'Lịch sử sử dụng khóm trong dân gian, lợi ích dinh dưỡng, cách chế biến hiện đại', url: 'https://www.researchgate.net/publication/228634688_Jerusalem_artichoke_and_chicory_inulin_in_bakery_products' }
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
    summary: 'Nước táo xanh lên men - giàu pectin và malic acid tự nhiên, hỗ trợ giải độc gan, làm sạch đường ruột và cân bằng cholesterol.',
    summaryEn: 'Fermented green apple drink - rich in pectin and natural malic acid, supports liver detox, intestinal cleansing and cholesterol balance.',
    definition: 'Nước táo xanh lên men được tạo từ táo xanh tươi Granny Smith qua lên men kiểm soát với vi sinh vật có lợi.',
    definitionEn: 'Fermented green apple drink is created from fresh Granny Smith apples through controlled fermentation with beneficial microbes.',
    whyChosen: 'Chọn táo xanh làm nguyên liệu vì giàu pectin và malic acid tự nhiên.',
    whyChosenEn: 'Green apple chosen for rich pectin and natural malic acid.',
    technicalReason: 'Táo xanh pH thấp, phù hợp lên men.',
    technicalReasonEn: 'Green apple low pH, good for fermentation.',
    sourceReason: 'Nguồn nguyên liệu ổn định.',
    sourceReasonEn: 'Stable sourcing.',
    culturalValue: 'Phù hợp xu hướng detox và wellness.',
    culturalValueEn: 'Fits detox and wellness trends.',
    productionModel: 'Lên men táo và tái sử dụng bã.',
    productionModelEn: 'Ferment apple and reuse pomace.',
    businessModel: 'Tập trung tệp khách hàng quan tâm detox và đẹp da.',
    businessModelEn: 'Focuses on detox and beauty audience.',
    circularInput: 'Táo xanh + men vi sinh',
    circularInputEn: 'Green apple + probiotics',
    circularOutput: ['Nước táo lên men', 'Bã táo làm phân vi sinh'],
    circularOutputEn: ['Fermented apple drink', 'Apple pomace fertilizer'],
    processDescription: 'Rửa, lên men, lọc, thanh trùng, đóng chai.',
    processDescriptionEn: 'Wash, ferment, filter, pasteurize, bottle.',
    educationalContent: 'Pectin hỗ trợ giảm cholesterol, malic acid hỗ trợ gan.',
    educationalContentEn: 'Pectin supports cholesterol reduction, malic acid supports liver.',
    healthBenefits: [
      { title: 'Giải độc gan', titleEn: 'Liver Detox', description: 'Hỗ trợ gan phân giải độc tố.', descriptionEn: 'Supports liver detoxification.' },
      { title: 'Giảm cholesterol', titleEn: 'Reduce Cholesterol', description: 'Pectin hỗ trợ giảm LDL.', descriptionEn: 'Pectin helps reduce LDL.' },
      { title: 'Làm đẹp da', titleEn: 'Skin Beauty', description: 'Giàu vitamin C chống oxy hóa.', descriptionEn: 'Vitamin C rich antioxidant support.' }
    ],
    nutritionFacts: [
      { label: 'Pectin', labelEn: 'Pectin', value: '1.5-2g/100ml', valueEn: '1.5-2g/100ml' },
      { label: 'Malic Acid', labelEn: 'Malic Acid', value: '0.8-1.2%', valueEn: '0.8-1.2%' }
    ],
    fermentationExplanation: 'Lên men 18-25 ngày ở 20-25°C.',
    fermentationExplanationEn: 'Ferment 18-25 days at 20-25°C.',
    ingredients: ['Táo xanh', 'Men vi sinh', 'Nước RO'],
    ingredientsEn: ['Green apple', 'Probiotics', 'RO water'],
    usage: 'Uống 50-100ml/ngày.',
    usageEn: 'Drink 50-100ml/day.',
    faqItems: [
      { question: 'Có giảm cholesterol không?', questionEn: 'Can it reduce cholesterol?', answer: 'Có, khi dùng đều đặn.', answerEn: 'Yes, with regular use.' }
    ],
    blogReferences: [],
    disclaimer: '⚠️ Thực phẩm bảo vệ sức khỏe, không phải thuốc.',
    disclaimerEn: '⚠️ Functional food, not medicine.',
    tips: ['Uống đều đặn mỗi ngày'],
    tipsEn: ['Use daily consistently']
  },
  'nuoc-thanh-long-len-men': {
    id: 'nuoc-thanh-long-len-men',
    name: 'Nước Thanh Long Lên Men Vi Sinh',
    nameEn: 'Fermented Dragon Fruit Microbial Drink',
    icon: '🐉',
    price: '32,000đ',
    summary: 'Nước thanh long lên men - chống oxy hóa và làm đẹp da.',
    summaryEn: 'Fermented dragon fruit drink - antioxidant and skin support.',
    definition: 'Sản phẩm lên men từ thanh long ruột đỏ.',
    definitionEn: 'Fermented from red dragon fruit.',
    whyChosen: 'Giàu betalain và vitamin C.',
    whyChosenEn: 'Rich in betalain and vitamin C.',
    productionModel: 'Lên men và tái sử dụng bã.',
    productionModelEn: 'Fermentation and by-product reuse.',
    businessModel: 'Tập trung detox và đẹp da.',
    businessModelEn: 'Focus on detox and beauty.',
    circularInput: 'Thanh long + men vi sinh',
    circularInputEn: 'Dragon fruit + probiotics',
    circularOutput: ['Nước uống', 'Phân vi sinh từ bã'],
    circularOutputEn: ['Drink', 'Bio-fertilizer from residue'],
    processDescription: 'Lên men 15-20 ngày.',
    processDescriptionEn: 'Ferment 15-20 days.',
    educationalContent: 'Betalain chống oxy hóa mạnh.',
    educationalContentEn: 'Betalain is a strong antioxidant.',
    healthBenefits: [
      { title: 'Chống oxy hóa', titleEn: 'Antioxidant', description: 'Bảo vệ tế bào.', descriptionEn: 'Protects cells.' }
    ],
    nutritionFacts: [{ label: 'Betalain', labelEn: 'Betalain', value: '10-15mg/100ml', valueEn: '10-15mg/100ml' }],
    fermentationExplanation: 'Lên men tự nhiên có kiểm soát.',
    fermentationExplanationEn: 'Controlled natural fermentation.',
    ingredients: ['Thanh long', 'Men vi sinh'],
    ingredientsEn: ['Dragon fruit', 'Probiotics'],
    usage: 'Uống 100-150ml/ngày.',
    usageEn: 'Drink 100-150ml/day.',
    faqItems: [],
    blogReferences: [],
    disclaimer: '⚠️ Thực phẩm bảo vệ sức khỏe, không phải thuốc.',
    disclaimerEn: '⚠️ Functional food, not medicine.',
    tips: ['Lắc đều trước khi uống'],
    tipsEn: ['Shake before use']
  },
  'nuoc-gung-len-men': {
    id: 'nuoc-gung-len-men',
    name: 'Nước Gừng Lên Men Vi Sinh',
    nameEn: 'Fermented Ginger Microbial Drink',
    icon: '🫚',
    price: '32,000đ',
    summary: 'Nước gừng lên men - hỗ trợ tiêu hóa, chống viêm.',
    summaryEn: 'Fermented ginger drink - digestive and anti-inflammatory support.',
    definition: 'Sản phẩm lên men từ gừng tươi.',
    definitionEn: 'Fermented from fresh ginger.',
    whyChosen: 'Gừng giàu gingerol.',
    whyChosenEn: 'Ginger is rich in gingerol.',
    productionModel: 'Lên men và tái sử dụng bã.',
    productionModelEn: 'Fermentation and residue reuse.',
    businessModel: 'Tập trung sức khỏe tiêu hóa và miễn dịch.',
    businessModelEn: 'Focus on digestion and immunity.',
    circularInput: 'Gừng + men vi sinh',
    circularInputEn: 'Ginger + probiotics',
    circularOutput: ['Nước uống', 'Phân vi sinh từ bã'],
    circularOutputEn: ['Drink', 'Bio-fertilizer from residue'],
    processDescription: 'Lên men 12-18 ngày.',
    processDescriptionEn: 'Ferment 12-18 days.',
    educationalContent: 'Gingerol hỗ trợ chống viêm tự nhiên.',
    educationalContentEn: 'Gingerol supports natural anti-inflammation.',
    healthBenefits: [
      { title: 'Chống viêm', titleEn: 'Anti-inflammatory', description: 'Giảm viêm tự nhiên.', descriptionEn: 'Natural inflammation reduction.' }
    ],
    nutritionFacts: [{ label: 'Gingerol', labelEn: 'Gingerol', value: '15-20mg/100ml', valueEn: '15-20mg/100ml' }],
    fermentationExplanation: 'Lên men giúp tăng khả dụng sinh học.',
    fermentationExplanationEn: 'Fermentation improves bioavailability.',
    ingredients: ['Gừng', 'Men vi sinh'],
    ingredientsEn: ['Ginger', 'Probiotics'],
    usage: 'Uống 100ml/ngày.',
    usageEn: 'Drink 100ml/day.',
    faqItems: [],
    blogReferences: [],
    disclaimer: '⚠️ Thực phẩm bảo vệ sức khỏe, không phải thuốc.',
    disclaimerEn: '⚠️ Functional food, not medicine.',
    tips: ['Uống ấm để tăng hiệu quả'],
    tipsEn: ['Drink warm for better effect']
  },
  'nuoc-buoi-len-men': {
    id: 'nuoc-buoi-len-men',
    name: 'Nước Bưởi Lên Men Vi Sinh',
    nameEn: 'Fermented Pomelo Microbial Drink',
    icon: '🍊',
    price: '32,000đ',
    summary: 'Nước bưởi lên men - hỗ trợ giảm cân và cholesterol.',
    summaryEn: 'Fermented pomelo drink - supports weight loss and cholesterol balance.',
    definition: 'Sản phẩm lên men từ bưởi da xanh.',
    definitionEn: 'Fermented from green pomelo.',
    whyChosen: 'Giàu naringin và vitamin C.',
    whyChosenEn: 'Rich in naringin and vitamin C.',
    productionModel: 'Lên men và tái sử dụng vỏ bưởi.',
    productionModelEn: 'Fermentation and pomelo peel reuse.',
    businessModel: 'Tập trung giảm cân, detox.',
    businessModelEn: 'Focus on weight loss and detox.',
    circularInput: 'Bưởi + men vi sinh',
    circularInputEn: 'Pomelo + probiotics',
    circularOutput: ['Nước uống', 'Tinh dầu/phân vi sinh'],
    circularOutputEn: ['Drink', 'Essential oil/bio-fertilizer'],
    processDescription: 'Lên men 18-22 ngày.',
    processDescriptionEn: 'Ferment 18-22 days.',
    educationalContent: 'Naringin hỗ trợ chuyển hóa mỡ.',
    educationalContentEn: 'Naringin supports fat metabolism.',
    healthBenefits: [{ title: 'Hỗ trợ giảm cân', titleEn: 'Weight Loss Support', description: 'Hỗ trợ kiểm soát mỡ.', descriptionEn: 'Helps fat control.' }],
    nutritionFacts: [{ label: 'Naringin', labelEn: 'Naringin', value: '20-25mg/100ml', valueEn: '20-25mg/100ml' }],
    fermentationExplanation: 'Lên men tăng hấp thu hoạt chất.',
    fermentationExplanationEn: 'Fermentation improves active compounds absorption.',
    ingredients: ['Bưởi', 'Men vi sinh'],
    ingredientsEn: ['Pomelo', 'Probiotics'],
    usage: 'Uống 150ml/ngày trước bữa ăn.',
    usageEn: 'Drink 150ml/day before meals.',
    faqItems: [],
    blogReferences: [],
    disclaimer: '⚠️ Thực phẩm bảo vệ sức khỏe, không phải thuốc.',
    disclaimerEn: '⚠️ Functional food, not medicine.',
    tips: ['Kết hợp chế độ ăn lành mạnh'],
    tipsEn: ['Combine with healthy diet']
  },
  'phan-vi-sinh-tong-hop': {
    id: 'phan-vi-sinh-tong-hop',
    name: 'Phân Vi Sinh Tổng Hợp',
    nameEn: 'Multi-Purpose Microbial Fertilizer',
    icon: '🌱',
    price: '30,000đ',
    summary: 'Phân vi sinh tổng hợp, hỗ trợ nhiều loại cây.',
    summaryEn: 'Multi-purpose bio-fertilizer for many crops.',
    definition: 'Phân vi sinh từ phụ phẩm lên men.',
    definitionEn: 'Bio-fertilizer from fermented residues.',
    whyChosen: 'Theo mô hình kinh tế tuần hoàn.',
    whyChosenEn: 'Based on circular economy model.',
    productionModel: 'Ủ và hoạt hóa hệ vi sinh.',
    productionModelEn: 'Ferment and activate microbe system.',
    businessModel: 'Giải pháp nông nghiệp bền vững.',
    businessModelEn: 'Sustainable agriculture solution.',
    circularInput: 'Bã lên men + men vi sinh',
    circularInputEn: 'Fermented pulp + probiotics',
    circularOutput: ['Phân vi sinh', 'Đất cải tạo'],
    circularOutputEn: ['Bio-fertilizer', 'Improved soil'],
    processDescription: 'Ủ 30-45 ngày.',
    processDescriptionEn: 'Ferment 30-45 days.',
    educationalContent: 'Bổ sung hệ vi sinh có lợi cho đất.',
    educationalContentEn: 'Adds beneficial microbes for soil.',
    healthBenefits: [{ title: 'Cải tạo đất', titleEn: 'Soil Improvement', description: 'Tăng độ tơi xốp.', descriptionEn: 'Improves soil structure.' }],
    nutritionFacts: [{ label: 'Hữu cơ', labelEn: 'Organic', value: '20-30%', valueEn: '20-30%' }],
    fermentationExplanation: 'Lên men giúp ổn định vi sinh vật.',
    fermentationExplanationEn: 'Fermentation stabilizes microbes.',
    ingredients: ['Bã hữu cơ', 'Vi sinh vật có lợi'],
    ingredientsEn: ['Organic pulp', 'Beneficial microbes'],
    usage: '1-2 lít/10m2.',
    usageEn: '1-2L/10m2.',
    faqItems: [],
    blogReferences: [],
    disclaimer: '⚠️ Đây là phân bón, không phải thuốc BVTV.',
    disclaimerEn: '⚠️ Fertilizer only, not pesticide.',
    tips: ['Tưới khi đất ẩm'],
    tipsEn: ['Apply on moist soil']
  },
  'phan-vi-sinh-cho-rau': {
    id: 'phan-vi-sinh-cho-rau',
    name: 'Phân Vi Sinh Cho Rau',
    nameEn: 'Vegetable Bio-fertilizer',
    icon: '🥬',
    price: '30,000đ',
    summary: 'Phân vi sinh chuyên cho rau màu.',
    summaryEn: 'Bio-fertilizer specialized for vegetables.',
    definition: 'Tối ưu cho rau ăn lá.',
    definitionEn: 'Optimized for leafy vegetables.',
    whyChosen: 'Rau cần phát triển lá nhanh, sạch.',
    whyChosenEn: 'Vegetables need fast clean leaf growth.',
    productionModel: 'Ủ vi sinh chuyên biệt cho rau.',
    productionModelEn: 'Specialized microbial fermentation for vegetables.',
    businessModel: 'Hỗ trợ nông trại rau sạch.',
    businessModelEn: 'Supports clean vegetable farms.',
    circularInput: 'Phụ phẩm hữu cơ + vi sinh',
    circularInputEn: 'Organic residues + microbes',
    circularOutput: ['Phân rau', 'Đất tơi xốp'],
    circularOutputEn: ['Vegetable fertilizer', 'Looser soil'],
    processDescription: 'Ủ 35-50 ngày.',
    processDescriptionEn: 'Ferment 35-50 days.',
    educationalContent: 'Bổ sung hệ vi sinh giúp rau hấp thu tốt.',
    educationalContentEn: 'Adds microbes to improve nutrient uptake.',
    healthBenefits: [{ title: 'Rau xanh nhanh', titleEn: 'Fast Leaf Growth', description: 'Hỗ trợ tăng trưởng lá.', descriptionEn: 'Supports leafy growth.' }],
    nutritionFacts: [{ label: 'N', labelEn: 'N', value: '2-3%', valueEn: '2-3%' }],
    fermentationExplanation: 'Lên men giúp tăng mật độ vi sinh có lợi.',
    fermentationExplanationEn: 'Fermentation increases beneficial microbe density.',
    ingredients: ['Hữu cơ', 'Vi sinh chuyên rau'],
    ingredientsEn: ['Organic base', 'Vegetable-focused microbes'],
    usage: '2-3 lít/10m2.',
    usageEn: '2-3L/10m2.',
    faqItems: [],
    blogReferences: [],
    disclaimer: '⚠️ Đây là phân bón, không phải thuốc BVTV.',
    disclaimerEn: '⚠️ Fertilizer only, not pesticide.',
    tips: ['Bón định kỳ theo chu kỳ sinh trưởng'],
    tipsEn: ['Apply periodically by growth cycle']
  },
  'phan-vi-sinh-cho-cay-an-trai': {
    id: 'phan-vi-sinh-cho-cay-an-trai',
    name: 'Phân Vi Sinh Cho Cây Ăn Trái',
    nameEn: 'Fruit Tree Bio-fertilizer',
    icon: '🍎',
    price: '30,000đ',
    summary: 'Phân vi sinh chuyên cho cây ăn trái.',
    summaryEn: 'Bio-fertilizer specialized for fruit trees.',
    definition: 'Tối ưu cho ra hoa, đậu trái.',
    definitionEn: 'Optimized for flowering and fruiting.',
    whyChosen: 'Giúp tăng chất lượng và độ ngọt trái.',
    whyChosenEn: 'Improves fruit quality and sweetness.',
    productionModel: 'Ủ vi sinh giàu P & K.',
    productionModelEn: 'Fermentation with higher P & K focus.',
    businessModel: 'Nhắm nhóm nhà vườn cây ăn trái.',
    businessModelEn: 'Targets fruit orchard growers.',
    circularInput: 'Phụ phẩm hữu cơ + vi sinh',
    circularInputEn: 'Organic residues + microbes',
    circularOutput: ['Phân cây ăn trái', 'Đất màu mỡ'],
    circularOutputEn: ['Fruit-tree fertilizer', 'Fertile soil'],
    processDescription: 'Ủ 40-60 ngày.',
    processDescriptionEn: 'Ferment 40-60 days.',
    educationalContent: 'Vi sinh hỗ trợ phân giải dinh dưỡng cho cây hấp thu.',
    educationalContentEn: 'Microbes help nutrient breakdown for absorption.',
    healthBenefits: [{ title: 'Tăng đậu trái', titleEn: 'Better Fruiting', description: 'Hỗ trợ ra hoa và đậu trái.', descriptionEn: 'Supports flowering and fruit setting.' }],
    nutritionFacts: [{ label: 'P', labelEn: 'P', value: '2-3%', valueEn: '2-3%' }, { label: 'K', labelEn: 'K', value: '2-3%', valueEn: '2-3%' }],
    fermentationExplanation: 'Lên men tối ưu hệ vi sinh cho cây ăn trái.',
    fermentationExplanationEn: 'Fermentation optimized for fruit trees.',
    ingredients: ['Hữu cơ', 'Vi sinh chuyên cây ăn trái'],
    ingredientsEn: ['Organic base', 'Fruit-tree microbes'],
    usage: '2-3 lít/cây trưởng thành.',
    usageEn: '2-3L per mature tree.',
    faqItems: [],
    blogReferences: [],
    disclaimer: '⚠️ Đây là phân bón, không phải thuốc BVTV.',
    disclaimerEn: '⚠️ Fertilizer only, not pesticide.',
    tips: ['Bón giai đoạn trước ra hoa và nuôi trái'],
    tipsEn: ['Apply before flowering and during fruiting']
  }
};
