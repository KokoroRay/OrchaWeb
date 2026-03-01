import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
    vi: {
        // Header
        'nav.home': 'TRANG CHỦ',
        'nav.products': 'SẢN PHẨM',
        'nav.products.drinks': 'Nước',
        'nav.products.fertilizers': 'Phân',
        'nav.about': 'VỀ ORCHA',
        'nav.blog': 'BLOG',
        'nav.faq': 'FAQ',
        'nav.contact': 'LIÊN HỆ',
        
        // Hero
        'hero.title': 'ORCHA',
        'hero.subtitle': 'Nước Trái Cây Lên Men Tự Nhiên',
        'hero.description': 'Sản phẩm từ quá trình lên men trái cây với men vi sinh tự nhiên',
        
        // About
        'about.navTitle': 'VỀ ORCHA',
        'about.heroTitle': 'Orcha là gì',
        'about.subtitle': 'Câu chuyện về nông nghiệp sinh học',
        'about.content': 'ORCHA là thương hiệu tiên phong trong lĩnh vực nông nghiệp sinh học, chuyên sản xuất nước trái cây lên men và phân vi sinh từ nguyên liệu tự nhiên.',
        
        // About Section Details
        'about.title': 'ORCHA – Nước Trái Cây Lên Men Từ Men Vi Sinh',
        'about.tagline': '"Từ trái cây tự nhiên đến giải pháp sức khỏe và môi trường"',
        'about.description': 'ORCHA là sản phẩm nước trái cây lên men từ men vi sinh, được tạo ra thông qua quá trình lên men sinh học có kiểm soát. Sử dụng trái cây làm nguyên liệu chính và hệ vi sinh vật có lợi để tạo thành sản phẩm mang đặc tính chức năng rõ rệt.',
        'about.drinkTitle': 'Nước Uống Lên Men',
        'about.drinkDesc': 'Giải khát, chăm sóc sức khỏe và làm đẹp tự nhiên',
        'about.fertTitle': 'Phân Vi Sinh',
        'about.fertDesc': 'Cải tạo đất, giảm phụ thuộc phân hóa học',
        'about.whyFruit': 'Tại Sao Chọn Trái Cây?',
        'about.technical': 'Kỹ thuật: Giàu đường tự nhiên, axit hữu cơ phù hợp lên men',
        'about.supply': 'Nguồn cung: Dễ tìm, tính mùa vụ rõ ràng, chủ động nguyên liệu',
        'about.culture': 'Văn hóa: Gắn liền với ẩm thực Việt, gần gũi dễ đón nhận',
        'about.circularEconomy': 'Mô Hình Kinh Tế Tuần Hoàn',
        'about.freshFruit': 'Trái cây tươi + Men vi sinh',
        'about.fermentedDrink': 'Nước uống lên men',
        'about.bioFertilizer': 'Phân vi sinh từ bã',
        'about.circularDesc': 'Tận dụng toàn bộ vòng đời nguyên liệu, biến nông sản thô thành sản phẩm chăm sóc sức khỏe và tái tạo giá trị cho đất, cây trồng - không tạo chất thải.',
            'about.exploreProcess': 'Khám Phá Quy Trình',
        
        // Products
        'products.title': 'SẢN PHẨM ORCHA',
        'products.subtitle': 'Khám phá dòng sản phẩm từ nước trái cây lên men và phân vi sinh tự nhiên',
        'products.all': 'Tất cả sản phẩm',
        'products.drinks': 'Nước uống lên men',
        'products.fertilizers': 'Phân vi sinh',
        'products.contact': 'Liên hệ ngay',
        'products.catalog': 'Tải catalog',
        'products.interest': 'Quan tâm đến sản phẩm ORCHA?',
        'products.consult': 'Liên hệ với chúng tôi để được tư vấn và báo giá chi tiết',
        
        // Blog
        'blog.title': 'Blog ORCHA',
        'blog.sectionTitle': 'BLOGS OF ORCHA',
        'blog.subtitle': 'Chia sẻ kiến thức và kinh nghiệm về nông nghiệp sinh học',
        'blog.all': 'Tất cả',
        'blog.products': 'Sản phẩm',
        'blog.guide': 'Hướng dẫn',
        'blog.process': 'Quy trình',
        'blog.knowledge': 'Kiến thức',
        'blog.readMore': 'Đọc thêm →',
        'blog.backToList': 'Quay lại danh sách',
        
        // Contact
        'contact.title': 'Liên Hệ Với Chúng Tôi',
        'contact.subtitle': 'Gửi tin nhắn cho chúng tôi',
        'contact.name': 'Họ và tên',
        'contact.email': 'Email',
        'contact.phone': 'Số điện thoại',
        'contact.subject': 'Chủ đề',
        'contact.message': 'Tin nhắn',
        'contact.messagePlaceholder': 'Nội dung tin nhắn',
        'contact.send': 'Gửi tin nhắn',
        'contact.info': 'Thông tin liên hệ',
        'contact.address': 'Địa chỉ',
        'contact.addressDetail': 'Trường Đại học FPT Cần Thơ\n600 Nguyễn Văn Cừ, An Bình, Ninh Kiều, Cần Thơ',
        'contact.workingHours': 'Giờ làm việc',
        'contact.workingHoursDetail': 'Thứ 2 - Thứ 6: 8:00 - 17:00\nThứ 7: 8:00 - 12:00\nChủ nhật: Nghỉ',
        'contact.success': 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.',
        'contact.required': 'Trường này là bắt buộc',
        'contact.emailInvalid': 'Email không hợp lệ',
        'contact.phoneInvalid': 'Số điện thoại không hợp lệ',
        'contact.messageMin': 'Tin nhắn phải có ít nhất 10 ký tự',
        'contact.namePlaceholder': 'Nhập họ và tên của bạn',
        'contact.emailPlaceholder': 'Nhập địa chỉ email',
        'contact.phonePlaceholder': 'Nhập số điện thoại (tùy chọn)',
        'contact.subjectSelect': 'Chọn chủ đề',
        'contact.subjectProduct': 'Thông tin sản phẩm',
        'contact.subjectOrder': 'Đặt hàng',
        'contact.subjectSupport': 'Hỗ trợ kỹ thuật',
        'contact.subjectPartnership': 'Hợp tác kinh doanh',
        'contact.subjectOther': 'Khác',
        'contact.messageTextarea': 'Nhập nội dung tin nhắn của bạn...',
        'contact.sending': 'Đang gửi...',
        'contact.successMessage': 'Cảm ơn bạn đã liên hệ!',
        'contact.successDetail': 'Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất.',
        'contact.backButton': 'Gửi tin nhắn mới',
        'contact.phoneLabel': 'Điện thoại',
        'contact.workingHoursTitle': 'Giờ làm việc',
        'contact.workingHoursText': 'Thứ 2 - Thứ 6: 8:00 - 17:00<br />Thứ 7: 8:00 - 12:00<br />Chủ nhật: Nghỉ',
        
        // FAQ
        'faq.title': 'Câu Hỏi Thường Gặp',
        'faq.subtitle': 'Tìm câu trả lời cho những thắc mắc về ORCHA',
        'faq.search': 'Tìm kiếm câu hỏi...',
        'faq.all': 'Tất cả',
        'faq.product': 'Sản phẩm',
        'faq.health': 'Sức khỏe',
        'faq.usage': 'Sử dụng',
        'faq.safety': 'An toàn',
        'faq.order': 'Đặt hàng',
        'faq.noAnswer': 'Không tìm thấy câu trả lời?',
        'faq.contactUs': 'Hãy liên hệ với chúng tôi để được hỗ trợ tốt nhất',
        'faq.contactNow': 'Liên hệ ngay',
        'faq.callHotline': 'Gọi hotline',
        'faq.noResults': 'Không tìm thấy câu hỏi phù hợp. Hãy thử từ khóa khác hoặc liên hệ với chúng tôi.',
        'faq.q1': 'ORCHA là gì?',
        'faq.a1': 'ORCHA là sản phẩm nước trái cây lên men từ men vi sinh, được tạo ra thông qua quá trình lên men sinh học có kiểm soát. Sản phẩm sử dụng trái cây làm nguyên liệu chính và hệ vi sinh vật có lợi để tạo thành sản phẩm mang đặc tính chức năng rõ rệt.',
        'faq.q2': 'Sản phẩm có an toàn cho sức khỏe không?',
        'faq.a2': 'Hoàn toàn an toàn. ORCHA được sản xuất theo quy trình lên men sinh học kiểm soát chặt chẽ, sử dụng men vi sinh có lợi và nguyên liệu trái cây tự nhiên. Sản phẩm không chứa chất bảo quản, màu tổng hợp hay hương liệu nhân tạo.',
        'faq.q3': 'Cách sử dụng ORCHA như thế nào?',
        'faq.a3': 'Bạn có thể uống trực tiếp hoặc pha loãng với nước theo tỷ lệ 1:3. Nên uống vào buổi sáng trước bữa ăn hoặc sau bữa ăn 30 phút. Liều lượng khuyến nghị: 50-100ml/ngày cho người lớn.',
        'faq.q4': 'Phân vi sinh từ bã trái cây có tác dụng gì?',
        'faq.a4': 'Phân vi sinh từ bã trái cây giúp cải tạo đất, tăng độ màu mỡ, giảm phụ thuộc vào phân hóa học. Sản phẩm này tạo ra mô hình kinh tế tuần hoàn, tận dụng toàn bộ nguyên liệu mà không tạo ra chất thải.',
        'faq.q5': 'Tại sao chọn trái cây làm nguyên liệu?',
        'faq.a5': 'Trái cây giàu đường tự nhiên và axit hữu cơ phù hợp cho quá trình lên men. Nguồn cung dễ tìm, tính mùa vụ rõ ràng giúp chủ động nguyên liệu. Hơn nữa, trái cây gắn liền với ẩm thực Việt Nam, gần gũi và dễ được đón nhận.',
        'faq.q6': 'Sản phẩm có được kiểm định chất lượng không?',
        'faq.a6': 'Có, tất cả sản phẩm ORCHA đều được kiểm định chất lượng tại các phòng lab uy tín, đảm bảo tiêu chuẩn an toàn thực phẩm và có giấy chứng nhận từ Bộ Y tế.',
        'faq.q7': 'Bảo quản sản phẩm như thế nào?',
        'faq.a7': 'Bảo quản trong tủ lạnh ở nhiệt độ 2-8°C. Sau khi mở nắp, nên sử dụng trong vòng 3-5 ngày. Tránh để nơi có ánh sáng trực tiếp và nhiệt độ cao.',
        'faq.q8': 'Ai không nên sử dụng sản phẩm?',
        'faq.a8': 'Trẻ em dưới 1 tuổi, phụ nữ mang thai trong 3 tháng đầu, người có tiền sử dị ứng với trái cây nên tham khảo ý kiến bác sĩ trước khi sử dụng.',
        'faq.q9': 'Làm thế nào để đặt hàng?',
        'faq.a9': 'Bạn có thể đặt hàng qua website, gọi hotline, hoặc đến trực tiếp cửa hàng. Chúng tôi hỗ trợ giao hàng toàn quốc với phí ship ưu đãi.',
        'faq.q10': 'Chính sách đổi trả như thế nào?',
        'faq.a10': 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày mua hàng nếu sản phẩm có lỗi từ nhà sản xuất. Sản phẩm phải còn nguyên vẹn bao bì và chưa sử dụng.',
        
        // Footer
        'footer.brandName': 'ORCHA',
        'footer.brandTagline': 'Nước Trái Cây Lên Men Từ Men Vi Sinh',
        'footer.description': 'Sản phẩm nước trái cây lên men tự nhiên với men vi sinh có lợi, mang đến giải pháp chăm sóc sức khỏe và thân thiện với môi trường.',
        'footer.quickLinksTitle': 'LIÊN KẾT NHANH',
        'footer.contactTitle': 'LIÊN HỆ',
        'footer.products': 'Sản phẩm',
        'footer.aboutUs': 'Về chúng tôi',
        'footer.favorites': 'Yêu thích',
        'footer.store': 'Cửa hàng',
        'footer.blog': 'Blog',
        'footer.contactLink': 'Liên hệ',
        'footer.location': 'Cần Thơ, Việt Nam',
        'footer.email': 'contact@orcha.vn',
        'footer.phone': '+84 123 456 789',
        'footer.followUs': 'Theo dõi chúng tôi',
        'footer.copyright': '© {year} ORCHA - Nước Trái Cây Lên Men Tự Nhiên',
        'footer.madeWith': 'Made with ❤️ by ORCHA Team',
        
        // Product Descriptions
        'product.drink1.title': 'Nước Khóm Lên Men',
        'product.drink1.desc': 'Giàu inulin tự nhiên, hỗ trợ tiêu hóa và cân bằng đường huyết',
        'product.drink2.title': 'Nước Táo Xanh Lên Men',
        'product.drink2.desc': 'Giàu pectin và malic acid, hỗ trợ giải độc gan và làm đẹp da',
        'product.drink3.title': 'Nước Thanh Long Lên Men',
        'product.drink3.desc': 'Giàu betalain & vitamin C, chống oxy hóa mạnh và làm đẹp da',
        'product.drink4.title': 'Nước Gừng Lên Men',
        'product.drink4.desc': 'Giàu gingerol, chống viêm tự nhiên và tăng cường miễn dịch',
        'product.drink5.title': 'Nước Bưởi Lên Men',
        'product.drink5.desc': 'Giàu naringin, hỗ trợ giảm cân và cân bằng cholesterol',
        'product.fert1.title': 'Phân Bón ORCHA',
        'product.fert1.desc': 'Phân bón hữu cơ từ quá trình lên men trái cây',
        'product.fert2.title': 'ORCHA Vi Sinh',
        'product.fert2.desc': 'Phân vi sinh giúp cải thiện đất trồng',
        'product.fert3.title': 'Phân Lỏng ORCHA',
        'product.fert3.desc': 'Dung dịch vi sinh lỏng dễ sử dụng cho cây trồng',
        
        // Blog Posts
        'blog.post1.title': 'Lợi ích của phân bón sinh học ORCHA',
        'blog.post1.excerpt': 'Khám phá những ưu điểm vượt trội của phân bón từ quá trình lên men tự nhiên cho đất trồng và cây trồng của bạn.',
        'blog.post1.content': 'Phân bón sinh học ORCHA được sản xuất từ quá trình lên men trái cây tự nhiên, mang lại nhiều lợi ích vượt trội cho đất trồng và cây trồng. Sản phẩm giúp cải thiện cấu trúc đất, tăng sinh vật có lợi, thân thiện với môi trường và tăng năng suất cây trồng một cách bền vững.',
        'blog.post2.title': 'Hướng dẫn sử dụng ORCHA hiệu quả',
        'blog.post2.excerpt': 'Cách sử dụng sản phẩm ORCHA hiệu quả nhất cho vườn cây của bạn với hướng dẫn chi tiết từ chuyên gia.',
        'blog.post2.content': 'Để đạt hiệu quả cao nhất khi sử dụng ORCHA, bạn cần tuân thủ đúng hướng dẫn sử dụng và thời điểm bón phù hợp. Pha loãng ORCHA với nước theo tỷ lệ 1:100 đối với tưới gốc, 1:200 đối với phun lá. Thời gian tốt nhất là sáng sớm hoặc chiều mát.',
        'blog.post3.title': 'Quy trình sản xuất ORCHA',
        'blog.post3.excerpt': 'Tìm hiểu về quy trình lên men trái cây với men vi sinh tự nhiên, đảm bảo chất lượng và an toàn tuyệt đối.',
        'blog.post3.content': 'ORCHA được sản xuất theo quy trình khép kín, đảm bảo chất lượng và an toàn cho người tiêu dùng. Quá trình bao gồm chuẩn bị nguyên liệu tươi ngon, lên men tự nhiên với men vi sinh có lợi, lọc và tinh chế, cuối cùng là đóng chai và kiểm tra chất lượng nghiêm ngặt.',
        'blog.post4.title': 'Lợi ích của nông nghiệp sinh học',
        'blog.post4.excerpt': 'Nông nghiệp sinh học là xu hướng bền vững cho tương lai, mang lại lợi ích cho môi trường và sức khỏe con người.',
        'blog.post4.content': 'Nông nghiệp sinh học không chỉ giúp bảo vệ môi trường mà còn tạo ra những sản phẩm nông nghiệp an toàn, chất lượng cao. Việc sử dụng các sản phẩm sinh học như ORCHA giúp giảm thiểu hóa chất, cải thiện độ phì nhiêu đất và tăng cường hệ sinh thái tự nhiên.',
        
        // UI Elements
        'ui.drinkType': 'Nước uống',
        'ui.fertType': 'Phân bón',
        'ui.author': 'Tác giả',
        'ui.features': 'Đặc điểm nổi bật:',
        'ui.orderNow': 'Đặt mua ngay',
        'ui.contactSupport': 'Liên hệ tư vấn',
        'ui.search': 'Tìm kiếm sản phẩm, bài viết...',
        'ui.share': 'Chia sẻ',
        
        // Product Features
        'feature.natural': '100% tự nhiên',
        'feature.noPreservatives': 'Không chất bảo quản',
        'feature.richProbiotics': 'Giàu men vi sinh',
        'feature.liveProbiotics': 'Men vi sinh sống',
        'feature.goodDigestion': 'Tốt cho tiêu hóa',
        'feature.noSugar': 'Không đường',
        'feature.originalFormula': 'Công thức gốc',
        'feature.richFlavor': 'Hương vị đậm đà',
        'feature.fermented30Days': 'Lên men 30 ngày',
        
        // Chat
        'chat.title': 'Chat với ORCHA',
        'chat.welcome': 'Xin chào! Có điều gì tôi có thể giúp bạn?',
        'chat.placeholder': 'Nhập tin nhắn...',
        'chat.send': 'Gửi',
        'chat.thinking': 'Đang suy nghĩ...',
        'chat.error': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        
        'feature.antiInflammatory': 'Chống viêm',
        'feature.immunityBoost': 'Tăng miễn dịch',
        'feature.weightLoss': 'Hỗ trợ giảm cân',
        'feature.detox': 'Giải độc',
        'feature.cholesterolBalance': 'Cân bằng cholesterol',
        
        'feature.organic100': '100% hữu cơ',
        'feature.improveSoil': 'Cải thiện đất',
        'feature.increaseYield': 'Tăng năng suất',
        'feature.beneficialMicrobes': 'Vi sinh có lợi',
        'feature.restoreSoil': 'Khôi phục đất',
        'feature.biologicalSafety': 'An toàn sinh học',
        'feature.liquidForm': 'Dạng lỏng',
        'feature.fastAbsorption': 'Hấp thu nhanh',
        'feature.hydroponicSuitable': 'Phù hợp thủy canh',
    },
    en: {
        // Header
        'nav.home': 'HOME',
        'nav.products': 'PRODUCTS',
        'nav.products.drinks': 'Drinks',
        'nav.products.fertilizers': 'Fertilizers',
        'nav.about': 'ABOUT ORCHA',
        'nav.blog': 'BLOG',
        'nav.faq': 'FAQ',
        'nav.contact': 'CONTACT',
        
        // Hero
        'hero.title': 'ORCHA',
        'hero.subtitle': 'Natural Fermented Fruit Drinks',
        'hero.description': 'Products from fruit fermentation process with natural microorganisms',
        
        // About
        'about.navTitle': 'ABOUT ORCHA',
        'about.heroTitle': 'What is Orcha',
        'about.subtitle': 'The story of biological agriculture',
        'about.content': 'ORCHA is a pioneering brand in biological agriculture, specializing in producing fermented fruit drinks and bio-fertilizers from natural ingredients.',
        
        // About Section Details
        'about.title': 'ORCHA – Fermented Fruit Drink From Probiotics',
        'about.tagline': '"From natural fruits to health and environmental solutions"',
        'about.description': 'ORCHA is a fermented fruit drink product made from probiotics, created through a controlled biological fermentation process. Using fruit as the main ingredient and beneficial microorganisms to create products with distinct functional characteristics.',
        'about.drinkTitle': 'Fermented Drinks',
        'about.drinkDesc': 'Refreshing, natural health care and beauty',
        'about.fertTitle': 'Bio Fertilizer',
        'about.fertDesc': 'Soil improvement, reducing dependence on chemical fertilizers',
        'about.whyFruit': 'Why Choose Fruit?',
        'about.technical': 'Technical: Rich in natural sugars, organic acids suitable for fermentation',
        'about.supply': 'Supply: Easy to find, clear seasonality, proactive materials',
        'about.culture': 'Culture: Associated with Vietnamese cuisine, familiar and easy to accept',
        'about.circularEconomy': 'Circular Economy Model',
        'about.freshFruit': 'Fresh fruit + Probiotics',
        'about.fermentedDrink': 'Fermented drinks',
        'about.bioFertilizer': 'Bio-fertilizer from pulp',
        'about.circularDesc': 'Utilizing the entire lifecycle of materials, turning raw agricultural products into health care products and recreating value for soil and plants - creating no waste.',
            'about.exploreProcess': 'Explore the Process',
        
        // Products
        'products.title': 'ORCHA PRODUCTS',
        'products.subtitle': 'Discover our range of fermented fruit drinks and natural bio-fertilizers',
        'products.all': 'All Products',
        'products.drinks': 'Fermented Drinks',
        'products.fertilizers': 'Bio-Fertilizers',
        'products.contact': 'Contact Now',
        'products.catalog': 'Download Catalog',
        'products.interest': 'Interested in ORCHA products?',
        'products.consult': 'Contact us for consultation and detailed pricing',
        
        // Blog
        'blog.title': 'ORCHA Blog',
        'blog.sectionTitle': 'BLOGS OF ORCHA',
        'blog.subtitle': 'Sharing knowledge and experience about biological agriculture',
        'blog.all': 'All',
        'blog.products': 'Products',
        'blog.guide': 'Guide',
        'blog.process': 'Process',
        'blog.knowledge': 'Knowledge',
        'blog.readMore': 'Read More →',
        'blog.backToList': 'Back to List',
        
        // Contact
        'contact.title': 'Contact Us',
        'contact.subtitle': 'Send us a message',
        'contact.name': 'Full Name',
        'contact.email': 'Email',
        'contact.phone': 'Phone Number',
        'contact.subject': 'Subject',
        'contact.message': 'Message',
        'contact.messagePlaceholder': 'Message content',
        'contact.send': 'Send Message',
        'contact.info': 'Contact Information',
        'contact.address': 'Address',
        'contact.addressDetail': 'FPT University Can Tho\n600 Nguyen Van Cu, An Binh, Ninh Kieu, Can Tho',
        'contact.workingHours': 'Working Hours',
        'contact.workingHoursDetail': 'Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed',
        'contact.success': 'Thank you for contacting us! We will respond as soon as possible.',
        'contact.required': 'This field is required',
        'contact.emailInvalid': 'Invalid email address',
        'contact.phoneInvalid': 'Invalid phone number',
        'contact.messageMin': 'Message must be at least 10 characters',
        'contact.namePlaceholder': 'Enter your full name',
        'contact.emailPlaceholder': 'Enter your email address',
        'contact.phonePlaceholder': 'Enter phone number (optional)',
        'contact.subjectSelect': 'Select a topic',
        'contact.subjectProduct': 'Product Information',
        'contact.subjectOrder': 'Order',
        'contact.subjectSupport': 'Technical Support',
        'contact.subjectPartnership': 'Business Partnership',
        'contact.subjectOther': 'Other',
        'contact.messageTextarea': 'Enter your message...',
        'contact.sending': 'Sending...',
        'contact.successMessage': 'Thank you for contacting us!',
        'contact.successDetail': 'We have received your message and will respond as soon as possible.',
        'contact.backButton': 'Send another message',
        'contact.phoneLabel': 'Phone',
        'contact.workingHoursTitle': 'Working Hours',
        'contact.workingHoursText': 'Mon - Fri: 8:00 AM - 5:00 PM<br />Sat: 8:00 AM - 12:00 PM<br />Sun: Closed',
        
        // FAQ
        'faq.title': 'Frequently Asked Questions',
        'faq.subtitle': 'Find answers to your questions about ORCHA',
        'faq.search': 'Search questions...',
        'faq.all': 'All',
        'faq.product': 'Product',
        'faq.health': 'Health',
        'faq.usage': 'Usage',
        'faq.safety': 'Safety',
        'faq.order': 'Order',
        'faq.noAnswer': 'Can\'t find the answer?',
        'faq.contactUs': 'Contact us for the best support',
        'faq.contactNow': 'Contact now',
        'faq.callHotline': 'Call hotline',
        'faq.noResults': 'No matching questions found. Please try another keyword or contact us.',
        'faq.q1': 'What is ORCHA?',
        'faq.a1': 'ORCHA is a fermented fruit drink made from probiotics, created through a controlled biological fermentation process. The product uses fruits as the main ingredient and beneficial microorganisms to create a product with distinct functional properties.',
        'faq.q2': 'Is the product safe for health?',
        'faq.a2': 'Completely safe. ORCHA is produced through a strictly controlled biological fermentation process, using beneficial probiotics and natural fruit ingredients. The product contains no preservatives, synthetic colors, or artificial flavors.',
        'faq.q3': 'How to use ORCHA?',
        'faq.a3': 'You can drink it directly or dilute with water at a 1:3 ratio. Best consumed in the morning before meals or 30 minutes after meals. Recommended dosage: 50-100ml/day for adults.',
        'faq.q4': 'What are the benefits of organic fertilizer from fruit residue?',
        'faq.a4': 'Organic fertilizer from fruit residue helps improve soil quality, increase fertility, and reduce dependence on chemical fertilizers. This product creates a circular economy model, utilizing all materials without creating waste.',
        'faq.q5': 'Why choose fruits as raw materials?',
        'faq.a5': 'Fruits are rich in natural sugars and organic acids suitable for fermentation. Easy to source, clear seasonality helps control raw materials. Moreover, fruits are closely tied to Vietnamese cuisine, familiar and easily accepted.',
        'faq.q6': 'Are the products quality tested?',
        'faq.a6': 'Yes, all ORCHA products are quality tested in reputable laboratories, ensuring food safety standards and certified by the Ministry of Health.',
        'faq.q7': 'How to store the product?',
        'faq.a7': 'Store in refrigerator at 2-8°C. After opening, use within 3-5 days. Avoid direct sunlight and high temperatures.',
        'faq.q8': 'Who should not use the product?',
        'faq.a8': 'Children under 1 year old, pregnant women in the first 3 months, people with a history of fruit allergies should consult a doctor before use.',
        'faq.q9': 'How to place an order?',
        'faq.a9': 'You can order through our website, call the hotline, or visit the store directly. We support nationwide delivery with preferential shipping fees.',
        'faq.q10': 'What is the return policy?',
        'faq.a10': 'We support returns within 7 days of purchase if the product has a manufacturing defect. The product must be intact and unused.',
        
        // Footer
        'footer.about': 'About ORCHA',
        'footer.aboutText': 'Specializing in producing fermented fruit drinks and bio-fertilizers from natural ingredients',
        'footer.quickLinks': 'Quick Links',
        // Footer
        'footer.brandName': 'ORCHA',
        'footer.brandTagline': 'Fermented Fruit Drink From Probiotics',
        'footer.description': 'Natural fermented fruit drink products with beneficial probiotics, providing health care solutions and environmentally friendly.',
        'footer.quickLinksTitle': 'QUICK LINKS',
        'footer.contactTitle': 'CONTACT',
        'footer.products': 'Products',
        'footer.aboutUs': 'About Us',
        'footer.favorites': 'Favorites',
        'footer.store': 'Store',
        'footer.blog': 'Blog',
        'footer.contactLink': 'Contact',
        'footer.location': 'Can Tho, Vietnam',
        'footer.email': 'contact@orcha.vn',
        'footer.phone': '+84 123 456 789',
        'footer.followUs': 'Follow Us',
        'footer.copyright': '© {year} ORCHA - Natural Fermented Fruit Drinks',
        'footer.madeWith': 'Made with ❤️ by ORCHA Team',
        
        // Product Descriptions
        'product.drink1.title': 'Fermented Khom Root Drink',
        'product.drink1.desc': 'Rich in natural inulin, supports digestion and blood sugar balance',
        'product.drink2.title': 'Fermented Green Apple Drink',
        'product.drink2.desc': 'Rich in pectin and malic acid, supports liver detox and skin beauty',
        'product.drink3.title': 'Fermented Dragon Fruit Drink',
        'product.drink3.desc': 'Rich in betalain & vitamin C, powerful antioxidant and skin beauty',
        'product.drink4.title': 'Fermented Ginger Drink',
        'product.drink4.desc': 'Rich in gingerol, natural anti-inflammatory and immunity boost',
        'product.drink5.title': 'Fermented Pomelo Drink',
        'product.drink5.desc': 'Rich in naringin, supports weight loss and cholesterol balance',
        'product.fert1.title': 'ORCHA Fertilizer',
        'product.fert1.desc': 'Organic fertilizer from fruit fermentation process',
        'product.fert2.title': 'ORCHA Microorganism',
        'product.fert2.desc': 'Bio-fertilizer helps improve soil quality',
        'product.fert3.title': 'ORCHA Liquid',
        'product.fert3.desc': 'Liquid microbial solution easy to use for plants',
        
        // Blog Posts
        'blog.post1.title': 'Benefits of ORCHA Bio-Fertilizer',
        'blog.post1.excerpt': 'Discover the outstanding advantages of fertilizer from natural fermentation process for your soil and plants.',
        'blog.post1.content': 'ORCHA bio-fertilizer is produced from natural fruit fermentation process, bringing many outstanding benefits to soil and plants. The product helps improve soil structure, increase beneficial organisms, environmentally friendly and sustainably increase plant productivity.',
        'blog.post2.title': 'Guide to Using ORCHA Effectively',
        'blog.post2.excerpt': 'How to use ORCHA products most effectively for your garden with detailed guidance from experts.',
        'blog.post2.content': 'To achieve the highest efficiency when using ORCHA, you need to follow proper usage guidelines and appropriate application timing. Dilute ORCHA with water at a ratio of 1:100 for root watering, 1:200 for foliar spray. The best time is early morning or cool evening.',
        'blog.post3.title': 'ORCHA Production Process',
        'blog.post3.excerpt': 'Learn about the fruit fermentation process with natural microorganisms, ensuring absolute quality and safety.',
        'blog.post3.content': 'ORCHA is produced according to a closed process, ensuring quality and safety for consumers. The process includes preparing fresh ingredients, natural fermentation with beneficial microorganisms, filtration and purification, finally bottling and strict quality control.',
        'blog.post4.title': 'Benefits of Biological Agriculture',
        'blog.post4.excerpt': 'Biological agriculture is a sustainable trend for the future, bringing benefits to the environment and human health.',
        'blog.post4.content': 'Biological agriculture not only helps protect the environment but also creates safe, high-quality agricultural products. Using biological products like ORCHA helps reduce chemicals, improve soil fertility and enhance natural ecosystems.',
        
        // UI Elements
        'ui.drinkType': 'Drink',
        'ui.fertType': 'Fertilizer',
        'ui.author': 'Author',
        'ui.features': 'Key Features:',
        'ui.orderNow': 'Order Now',
        'ui.contactSupport': 'Contact Support',
        'ui.search': 'Search products, articles...',
        'ui.share': 'Share',
        
        // Product Features
        'feature.natural': '100% Natural',
        'feature.noPreservatives': 'No Preservatives',
        'feature.richProbiotics': 'Rich in Probiotics',
        'feature.liveProbiotics': 'Live Probiotics',
        'feature.goodDigestion': 'Good for Digestion',
        'feature.noSugar': 'No Added Sugar',
        'feature.originalFormula': 'Original Formula',
        'feature.richFlavor': 'Rich Flavor',
        'feature.fermented30Days': 'Fermented 30 Days',
        'feature.antiInflammatory': 'Anti-inflammatory',
        'feature.immunityBoost': 'Immunity Boost',
        'feature.weightLoss': 'Weight Loss Support',
        'feature.detox': 'Detox',
        'feature.cholesterolBalance': 'Cholesterol Balance',
        'feature.organic100': '100% Organic',
        'feature.improveSoil': 'Improve Soil',
        'feature.increaseYield': 'Increase Yield',
        'feature.beneficialMicrobes': 'Beneficial Microbes',
        'feature.restoreSoil': 'Restore Soil',
        'feature.biologicalSafety': 'Biological Safety',
        'feature.liquidForm': 'Liquid Form',
        'feature.fastAbsorption': 'Fast Absorption',
        'feature.hydroponicSuitable': 'Hydroponic Suitable',
        
        // Chat
        'chat.title': 'Chat with ORCHA',
        'chat.welcome': 'Hello! How can I help you?',
        'chat.placeholder': 'Type your message...',
        'chat.send': 'Send',
        'chat.thinking': 'Thinking...',
        'chat.error': 'Sorry, an error occurred. Please try again later.',
    }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<string>('vi');

    useEffect(() => {
        const savedLang = localStorage.getItem('orcha-language');
        if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: string) => {
        setLanguage(lang);
        localStorage.setItem('orcha-language', lang);
        document.documentElement.lang = lang;
    };

    const t = (key: string): string => {
        const langTranslations = translations[language as keyof typeof translations] || translations.vi;
        return langTranslations[key as keyof typeof langTranslations] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};