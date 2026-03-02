import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiHome, FiPackage, FiShoppingCart, FiUsers, FiMessageSquare, 
    FiLogOut, FiMenu, FiX, FiEdit2, FiTrash2, FiSave, 
    FiRefreshCw, FiImage, FiUpload, FiAlertCircle, FiCheckCircle, FiTag 
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthContext } from '../../contexts/AuthContext';
import { orderService, type Order } from '../../services/orderService';
import { adminService, type AdminCategory, type AdminCategoryInput, type AdminFeedback, type AdminProduct, type AdminProductInput, type AdminUser, type AdminUserRole } from '../../services/adminService';
import { uploadImage, type UploadProgress } from '../../services/imageService';
import logoImage from '../../assets/logos/Logo.png';
import styles from './AdminDashboard.module.css';

type AdminTab = 'overview' | 'categories' | 'products' | 'orders' | 'users' | 'feedback';
type OrderStatus = Order['status'];

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
const PRODUCT_FORM_DRAFT_KEY = 'orcha_admin_product_form_draft_v2';

interface ProductFormData {
    name: string;
    description: string;
    detailSummary: string;
    benefits: string;
    ingredients: string;
    usage: string;
    faq: string;
    category: string;
    price: string;
    salePrice: string;
    stock: string;
    unit: string;
    imageUrl: string;
    imageFile: File | null;
}

const initialProductForm: ProductFormData = {
    name: '',
    description: '',
    detailSummary: '',
    benefits: '',
    ingredients: '',
    usage: '',
    faq: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    unit: 'chai',
    imageUrl: '',
    imageFile: null,
};

interface CategoryFormData {
    name: string;
    nameEn: string;
    icon: string;
    description: string;
}

const initialCategoryForm: CategoryFormData = {
    name: '',
    nameEn: '',
    icon: '',
    description: '',
};

// Product detail templates are now managed manually in src/data/productDetailsBackup.txt

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDateTime = (value: string) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const buildDefaultProductDescription = (
    rawDescription: string,
    name: string,
    categoryName: string,
    unit: string
) => {
    const headline = rawDescription.trim() || `${name} từ ORCHA`;
    const normalizedUnit = unit.trim() || 'chai';

    return [
        headline,
        '',
        'Thông tin mặc định:',
        `- Thương hiệu: ORCHA`,
        `- Danh mục: ${categoryName || 'Đang cập nhật'}`,
        `- Quy cách cơ bản: 1 ${normalizedUnit}`,
        '- Bảo quản: Để nơi khô ráo, tránh ánh nắng trực tiếp.',
        '- Khuyến nghị: Đọc kỹ hướng dẫn sử dụng trước khi dùng.',
    ].join('\n');
};

// Product Templates
interface ProductTemplate {
    id: string;
    name: string;
    category: string;
    data: Partial<ProductFormData>;
}

const PRODUCT_TEMPLATES: ProductTemplate[] = [
    {
        id: 'drink-fruit',
        name: '🍹 Nước Uống Trái Cây',
        category: 'drink',
        data: {
            description: 'Nước uống từ trái cây tự nhiên, 100% nguyên chất không đường, không chất bảo quản.',
            unit: 'chai',
            detailSummary: 'Sản phẩm nước uống từ trái cây tự nhiên 100%, giữ nguyên hương vị và dinh dưỡng của trái cây tươi. Quy trình sản xuất hiện đại, đảm bảo vệ sinh an toàn thực phẩm.',
            benefits: '✓ Bổ sung vitamin và khoáng chất tự nhiên\n✓ Tăng cường sức đề kháng\n✓ Hỗ trợ tiêu hóa, thanh lọc cơ thể\n✓ Làm đẹp da, chống lão hóa\n✓ Cung cấp năng lượng tự nhiên',
            ingredients: '• Nước ép trái cây tự nhiên: 100%\n• Không đường, không chất bảo quản\n• Không màu tổng hợp',
            usage: '**Cách dùng:**\n1. Lắc đều trước khi uống\n2. Uống trực tiếp hoặc pha loãng với nước\n3. Nên uống lạnh để ngon hơn\n\n**Liều lượng khuyến nghị:**\n- Người lớn: 200-300ml/ngày\n- Trẻ em: 100-150ml/ngày\n\n**Bảo quản:**\n- Nơi khô ráo, thoáng mát\n- Sau khi mở nắp, bảo quản trong tủ lạnh và sử dụng trong 24h',
            faq: '**1. Sản phẩm có đường không?**\nKhông, sản phẩm 100% từ trái cây tự nhiên, không thêm đường.\n\n**2. Có thể uống hàng ngày không?**\nCó, nên uống mỗi ngày để bổ sung dinh dưỡng.\n\n**3. Trẻ em có uống được không?**\nCó, phù hợp cho trẻ em từ 1 tuổi trở lên.\n\n**4. Hạn sử dụng bao lâu?**\n12 tháng kể từ ngày sản xuất (xem trên bao bì).',
        },
    },
    {
        id: 'fertilizer-organic',
        name: '🌱 Phân Bón Hữu Cơ',
        category: 'fertilizer',
        data: {
            description: 'Phân bón hữu cơ sinh học, an toàn cho cây trồng, thân thiện môi trường.',
            unit: 'chai',
            detailSummary: 'Phân bón hữu cơ sinh học từ nguồn nguyên liệu tự nhiên, giúp cây phát triển khỏe mạnh, cải thiện đất trồng. Sản phẩm an toàn, không độc hại, thân thiện với môi trường.',
            benefits: '✓ Bổ sung dinh dưỡng toàn diện cho cây\n✓ Cải thiện cấu trúc đất, tăng độ phì nhiêu\n✓ Kích thích rễ phát triển mạnh\n✓ Tăng khả năng chống chịu sâu bệnh\n✓ An toàn cho người, vật nuôi và môi trường\n✓ Tăng năng suất, chất lượng nông sản',
            ingredients: '• Vi sinh vật có ích: 10^8 CFU/ml\n• Chất hữu cơ: 30%\n• Đạm (N): 5%\n• Lân (P2O5): 3%\n• Kali (K2O): 2%\n• Vi lượng (Fe, Zn, Mn, Cu, B, Mo)',
            usage: '**Cách pha:**\n1. Lắc đều chai trước khi pha\n2. Pha loãng: 1 nắp chai (20ml) với 10 lít nước\n3. Khuấy đều\n\n**Cách bón:**\n- Tưới gốc: 2 lần/tuần\n- Phun lá: 1 lần/tuần vào buổi sáng sớm hoặc chiều mát\n\n**Liều lượng:**\n- Rau màu: 20ml/10 lít nước\n- Cây ăn trái: 30ml/10 lít nước\n- Cây hoa, cảnh: 15ml/10 lít nước\n\n**Bảo quản:**\n- Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp\n- Nhiệt độ 15-30°C',
            faq: '**1. Có thể dùng cho tất cả loại cây không?**\nCó, phù hợp với tất cả loại cây trồng (rau, hoa, cây ăn trái).\n\n**2. Bao lâu thì thấy hiệu quả?**\nSau 7-10 ngày sử dụng, cây sẽ xanh tốt hơn.\n\n**3. Có thể kết hợp với phân hóa học không?**\nCó, nhưng nên giảm 30-50% lượng phân hóa học.\n\n**4. Có độc hại không?**\nKhông, sản phẩm hoàn toàn từ thiên nhiên, an toàn.\n\n**5. Hạn sử dụng?**\n18 tháng kể từ ngày sản xuất.',
        },
    },
    {
        id: 'drink-functional',
        name: '💪 Nước Uống Chức Năng',
        category: 'drink',
        data: {
            description: 'Nước uống chức năng bổ sung vitamin, khoáng chất, giúp tăng cường sức khỏe.',
            unit: 'chai',
            detailSummary: 'Nước uống chức năng được bổ sung vitamin, khoáng chất và các dưỡng chất thiết yếu, giúp tăng cường sức khỏe, nâng cao thể lực và tinh thần.',
            benefits: '✓ Bổ sung vitamin và khoáng chất thiết yếu\n✓ Tăng cường năng lượng và sức bền\n✓ Hỗ trợ trao đổi chất\n✓ Tăng cường miễn dịch\n✓ Cải thiện sức khỏe tim mạch\n✓ Giảm mệt mỏi, căng thẳng',
            ingredients: '• Nước tinh khiết\n• Vitamin C: 100mg\n• Vitamin B6: 2mg\n• Vitamin B12: 10mcg\n• Kẽm: 5mg\n• Magie: 50mg\n• Chiết xuất thảo mộc tự nhiên',
            usage: '**Cách dùng:**\n1. Lắc đều trước khi uống\n2. Uống trực tiếp, không pha loãng\n3. Uống lạnh sẽ ngon hơn\n\n**Liều lượng:**\n- Người lớn: 1-2 chai/ngày\n- Uống vào buổi sáng hoặc sau khi vận động\n\n**Lưu ý:**\n- Không dùng thay thế bữa ăn\n- Không dùng cho trẻ dưới 6 tuổi\n- Bảo quản nơi khô ráo, thoáng mát',
            faq: '**1. Uống khi nào là tốt nhất?**\nSáng sớm hoặc sau khi tập thể dục.\n\n**2. Có thể uống hàng ngày không?**\nCó, nên uống đều đặn để hiệu quả tốt nhất.\n\n**3. Có tác dụng phụ không?**\nKhông, sản phẩm an toàn khi sử dụng đúng liều lượng.\n\n**4. Phụ nữ mang thai có dùng được không?**\nNên tham khảo ý kiến bác sĩ trước khi sử dụng.',
        },
    },
];

export const AdminDashboard = () => {
    const { user, logout, isAdmin } = useAuthContext();
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<AdminTab>('products');
    const [loading, setLoading] = useState(true);
    const [busyAction, setBusyAction] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
    const [categories, setCategories] = useState<AdminCategory[]>([]);

    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [productForm, setProductForm] = useState<ProductFormData>(initialProductForm);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>(initialCategoryForm);

    const [orderStatusDraft, setOrderStatusDraft] = useState<Record<string, OrderStatus>>({});
    const [userDrafts, setUserDrafts] = useState<Record<string, { role: AdminUserRole; isActive: boolean }>>({});

    useEffect(() => {
        try {
            const draft = localStorage.getItem(PRODUCT_FORM_DRAFT_KEY);
            if (!draft) return;

            const parsed = JSON.parse(draft) as Partial<ProductFormData>;
            setProductForm((prev) => ({
                ...prev,
                ...parsed,
                imageFile: null,
            }));
        } catch {
            localStorage.removeItem(PRODUCT_FORM_DRAFT_KEY);
        }
    }, []);

    useEffect(() => {
        if (editingProductId) return;

        const { imageFile: _imageFile, ...draft } = productForm;
        localStorage.setItem(PRODUCT_FORM_DRAFT_KEY, JSON.stringify(draft));
    }, [productForm, editingProductId]);

    const loadDashboardData = useCallback(async () => {
        setError('');
        setSuccess('');

        try {
            const [productData, orderData, userData, feedbackData, categoryData] = await Promise.all([
                adminService.getProducts(),
                orderService.adminGetAll(),
                adminService.getUsers(),
                adminService.getFeedbacks(),
                adminService.getCategories(),
            ]);

            setProducts(productData);
            setOrders(orderData);
            setUsers(userData);
            setFeedbacks(feedbackData);
            setCategories(categoryData);

            setOrderStatusDraft(
                orderData.reduce<Record<string, OrderStatus>>((acc, order) => {
                    acc[order.orderId] = order.status;
                    return acc;
                }, {})
            );

            setUserDrafts(
                userData.reduce<Record<string, { role: AdminUserRole; isActive: boolean }>>((acc, item) => {
                    acc[item.userId] = { role: item.role, isActive: item.isActive };
                    return acc;
                }, {})
            );
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu';
            setError(message);
            throw loadError;
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                await loadDashboardData();
            } catch {
                // Error already handled in loadDashboardData
            } finally {
                setLoading(false);
            }
        };
        void run();
    }, [loadDashboardData]);

    const overviewStats = useMemo(() => {
        const pendingOrders = orders.filter((order) => order.status === 'PENDING').length;
        const totalRevenue = orders.filter((order) => order.status !== 'CANCELLED').reduce((sum, order) => sum + order.totalAmount, 0);
        const lowStock = products.filter((product) => product.stock <= 5).length;

        return {
            productCount: products.length,
            orderCount: orders.length,
            pendingOrders,
            userCount: users.length,
            feedbackCount: feedbacks.length,
            lowStock,
            totalRevenue,
        };
    }, [feedbacks.length, orders, products, users.length]);

    const categoryNameById = useMemo(() => {
        return categories.reduce<Record<string, string>>((acc, category) => {
            acc[category.categoryId] = category.name;
            return acc;
        }, {});
    }, [categories]);

    const uploadProductImage = async (file: File) => {
        if (!file) {
            console.warn('[ImageUpload] No file provided');
            return;
        }

        console.log('[ImageUpload] Starting upload for file:', { name: file.name, size: file.size, type: file.type });

        setUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            console.log('[ImageUpload] Calling uploadImage service...');
            const result = await uploadImage(file, (progress: UploadProgress) => {
                console.log('[ImageUpload] Progress:', progress.percentage);
                setUploadProgress(progress.percentage);
            });

            console.log('[ImageUpload] Upload successful, received URL:', result.secureUrl);

            setProductForm((prev) => ({
                ...prev,
                imageUrl: result.secureUrl,
                imageFile: file,
            }));
            setSuccess('Upload ảnh thành công!');
            console.log('[ImageUpload] Form state updated with new image URL');
        } catch (uploadError) {
            const message = uploadError instanceof Error ? uploadError.message : 'Upload thất bại';
            console.error('[ImageUpload] Upload failed:', message);
            setError(message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('[ImageHandler] File input changed');
        const file = event.target.files?.[0];
        if (!file) {
            console.warn('[ImageHandler] No file selected');
            return;
        }
        console.log('[ImageHandler] File selected:', { name: file.name, size: file.size });
        await uploadProductImage(file);
    };

    const handleImageDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleImageDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleImageDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        await uploadProductImage(file);
    };

    const resetProductForm = () => {
        setEditingProductId(null);
        setProductForm(initialProductForm);
        localStorage.removeItem(PRODUCT_FORM_DRAFT_KEY);
    };

    const applyProductTemplate = (templateId: string) => {
        const template = PRODUCT_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;

        setProductForm((prev) => ({
            ...prev,
            ...template.data,
            // Keep existing values for these fields
            name: prev.name,
            price: prev.price,
            salePrice: prev.salePrice,
            stock: prev.stock,
            imageUrl: prev.imageUrl,
            imageFile: prev.imageFile,
            // Apply template fields
            category: template.data.category || prev.category,
            description: template.data.description || prev.description,
            unit: template.data.unit || prev.unit,
            detailSummary: template.data.detailSummary || prev.detailSummary,
            benefits: template.data.benefits || prev.benefits,
            ingredients: template.data.ingredients || prev.ingredients,
            usage: template.data.usage || prev.usage,
            faq: template.data.faq || prev.faq,
        }));

        setSuccess(`✓ Đã áp dụng mẫu: ${template.name}`);
        setTimeout(() => setSuccess(''), 3000);
    };

    const openCreateProductModal = () => {
        setEditingProductId(null);
        setIsProductModalOpen(true);
    };

    const closeProductModal = () => {
        setIsProductModalOpen(false);

        if (editingProductId) {
            resetProductForm();
        }
    };

    const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusyAction(true);
        setError('');
        setSuccess('');

        try {
            const price = Number(productForm.price || 0);
            const salePrice = Number(productForm.salePrice || 0);
            const stock = Number(productForm.stock || 0);

            if (!productForm.name.trim() || !productForm.category || price <= 0) {
                throw new Error('Vui lòng nhập đầy đủ tên, danh mục và giá hợp lệ.');
            }

            const payload: AdminProductInput = {
                name: productForm.name.trim(),
                description: productForm.description.trim() || buildDefaultProductDescription(
                    '',
                    productForm.name.trim(),
                    categoryNameById[productForm.category] || '',
                    productForm.unit
                ),
                detailSummary: productForm.detailSummary.trim() || undefined,
                benefits: productForm.benefits.trim() || undefined,
                ingredients: productForm.ingredients.trim() || undefined,
                usage: productForm.usage.trim() || undefined,
                faq: productForm.faq.trim() || undefined,
                category: productForm.category,
                price,
                salePrice: salePrice > 0 ? salePrice : 0,
                stock,
                unit: productForm.unit.trim() || 'chai',
                images: productForm.imageUrl ? [productForm.imageUrl] : [],
            };

            if (editingProductId) {
                const updated = await adminService.updateProduct(editingProductId, payload);
                setProducts((prev) => prev.map((item) => (item.productId === updated.productId ? updated : item)));
                setSuccess('Cập nhật sản phẩm thành công.');
            } else {
                const created = await adminService.createProduct(payload);
                setProducts((prev) => [created, ...prev]);
                setSuccess('Tạo sản phẩm mới thành công.');
            }

            resetProductForm();
            setIsProductModalOpen(false);
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : 'Có lỗi xảy ra';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleEditProduct = (product: AdminProduct) => {
        setEditingProductId(product.productId);
        setProductForm({
            name: product.name,
            description: product.description || '',
            detailSummary: product.detailSummary || '',
            benefits: product.benefits || '',
            ingredients: product.ingredients || '',
            usage: product.usage || '',
            faq: product.faq || '',
            category: product.category || '',
            price: product.price.toString(),
            salePrice: product.salePrice?.toString() || '',
            stock: product.stock.toString(),
            unit: product.unit || 'chai',
            imageUrl: product.images?.[0] || '',
            imageFile: null,
        });
        setIsProductModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

        setBusyAction(true);
        setError('');

        try {
            await adminService.deleteProduct(productId);
            setProducts((prev) => prev.filter((item) => item.productId !== productId));
            setSuccess('Xóa sản phẩm thành công.');
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : 'Xóa thất bại';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string) => {
        const newStatus = orderStatusDraft[orderId];
        if (!newStatus) return;

        setBusyAction(true);
        setError('');

        try {
            const updated = await orderService.adminUpdateStatus(orderId, newStatus);
            setOrders((prev) => prev.map((item) => (item.orderId === orderId ? updated : item)));
            setSuccess(`Đã cập nhật trạng thái đơn hàng ${orderId}`);
        } catch (updateError) {
            const message = updateError instanceof Error ? updateError.message : 'Cập nhật thất bại';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleUpdateUser = async (userId: string) => {
        const draft = userDrafts[userId];
        if (!draft) return;

        setBusyAction(true);
        setError('');

        try {
            const updated = await adminService.updateUser(userId, draft);
            setUsers((prev) => prev.map((item) => (item.userId === userId ? updated : item)));
            setSuccess(`Đã cập nhật thông tin người dùng`);
        } catch (updateError) {
            const message = updateError instanceof Error ? updateError.message : 'Cập nhật thất bại';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;

        setBusyAction(true);
        setError('');

        try {
            await adminService.deleteFeedback(feedbackId);
            setFeedbacks((prev) => prev.filter((item) => item.feedbackId !== feedbackId));
            setSuccess('Xóa phản hồi thành công.');
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : 'Xóa thất bại';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const resetCategoryForm = () => {
        setEditingCategoryId(null);
        setCategoryForm(initialCategoryForm);
    };

    const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusyAction(true);
        setError('');
        setSuccess('');

        try {
            if (!categoryForm.name.trim() || !categoryForm.nameEn.trim() || !categoryForm.icon.trim()) {
                throw new Error('Vui lòng nhập tên (VI), tên (EN), và icon.');
            }

            const payload: AdminCategoryInput = {
                name: categoryForm.name.trim(),
                nameEn: categoryForm.nameEn.trim(),
                icon: categoryForm.icon.trim(),
                description: categoryForm.description.trim(),
            };

            if (editingCategoryId) {
                const updated = await adminService.updateCategory(editingCategoryId, payload);
                setCategories((prev) => prev.map((item) => (item.categoryId === updated.categoryId ? updated : item)));
                setSuccess('Cập nhật danh mục thành công.');
            } else {
                const created = await adminService.createCategory(payload);
                setCategories((prev) => [created, ...prev]);
                setSuccess('Tạo danh mục mới thành công.');
            }

            resetCategoryForm();
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : 'Có lỗi xảy ra';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleEditCategory = (category: AdminCategory) => {
        setEditingCategoryId(category.categoryId);
        setCategoryForm({
            name: category.name,
            nameEn: category.nameEn,
            icon: category.icon,
            description: category.description || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

        setBusyAction(true);
        setError('');

        try {
            await adminService.deleteCategory(categoryId);
            setCategories((prev) => prev.filter((item) => item.categoryId !== categoryId));
            setSuccess('Xóa danh mục thành công.');
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : 'Xóa thất bại';
            setError(message);
        } finally {
            setBusyAction(false);
        }
    };

    const renderSidebar = () => (
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
            <div className={styles.sidebarHeader}>
                <img src={logoImage} alt="ORCHA" className={styles.sidebarLogo} />
                {sidebarOpen && <span className={styles.sidebarTitle}>ORCHA Admin</span>}
            </div>

            <nav className={styles.sidebarNav}>
                <button
                    className={`${styles.navItem} ${activeTab === 'overview' ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FiHome size={20} />
                    {sidebarOpen && <span>Tổng quan</span>}
                </button>

                <button
                    className={`${styles.navItem} ${activeTab === 'products' ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    <FiPackage size={20} />
                    {sidebarOpen && <span>Sản phẩm</span>}
                </button>

                <button
                    className={`${styles.navItem} ${activeTab === 'categories' ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    <FiTag size={20} />
                    {sidebarOpen && <span>Danh mục</span>}
                </button>

                <button
                    className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <FiShoppingCart size={20} />
                    {sidebarOpen && <span>Đơn hàng</span>}
                </button>

                <button
                    className={`${styles.navItem} ${activeTab === 'users' ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <FiUsers size={20} />
                    {sidebarOpen && <span>Người dùng</span>}
                </button>

                <button
                    className={`${styles.navItem} ${activeTab === 'feedback' ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab('feedback')}
                >
                    <FiMessageSquare size={20} />
                    {sidebarOpen && <span>Phản hồi</span>}
                </button>
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    {sidebarOpen && (
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{user?.name || 'Admin'}</div>
                            <div className={styles.userEmail}>{user?.email || ''}</div>
                        </div>
                    )}
                </div>

                <button className={styles.logoutBtn} onClick={logout} title="Đăng xuất">
                    <FiLogOut size={20} />
                    {sidebarOpen && <span>Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );

    const renderOverview = () => {
        // Prepare revenue data (orders by date)
        const revenueByDate: Record<string, number> = {};
        orders.forEach((order) => {
            const date = new Date(order.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
            revenueByDate[date] = (revenueByDate[date] || 0) + order.totalAmount;
        });
        const revenueChartData = Object.entries(revenueByDate)
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .slice(-7) // Last 7 days
            .map(([date, revenue]) => ({ date, revenue }));

        // Prepare order status data
        const orderStatusData = [
            { name: 'Chờ xác nhận', value: orders.filter(o => o.status === 'PENDING').length, color: '#ff9800' },
            { name: 'Đã xác nhận', value: orders.filter(o => o.status === 'CONFIRMED').length, color: '#2196f3' },
            { name: 'Đang giao', value: orders.filter(o => o.status === 'SHIPPING').length, color: '#9c27b0' },
            { name: 'Đã giao', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#4caf50' },
            { name: 'Đã hủy', value: orders.filter(o => o.status === 'CANCELLED').length, color: '#f44336' },
        ].filter(item => item.value > 0);

        // Prepare top products data
        const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
        orders.forEach((order) => {
            // For simplicity, we count orders containing each product
            // In real scenario, would need to track which products are in each order
            if (order.totalAmount > 0) {
                products.slice(0, 5).forEach((product) => {
                    const key = product.productId;
                    if (!productSales[key]) {
                        productSales[key] = { name: product.name, count: 0, revenue: 0 };
                    }
                    productSales[key].count += 1;
                    productSales[key].revenue += order.totalAmount / (orders.length || 1);
                });
            }
        });
        const topProductsData = Object.values(productSales)
            .slice(0, 5)
            .map(p => ({ name: p.name.substring(0, 15), count: p.count, revenue: Math.round(p.revenue) }));

        return (
            <div className={styles.overviewContainer}>
                {/* Stats Cards */}
                <div className={styles.overviewGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#e1f5fe' }}>
                            <FiPackage size={24} style={{ color: '#0288d1' }} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{overviewStats.productCount}</div>
                            <div className={styles.statLabel}>Sản phẩm</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fff3e0' }}>
                            <FiShoppingCart size={24} style={{ color: '#f57c00' }} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{overviewStats.orderCount}</div>
                            <div className={styles.statLabel}>Đơn hàng</div>
                            {overviewStats.pendingOrders > 0 && (
                                <div className={styles.statBadge}>{overviewStats.pendingOrders} chờ xác nhận</div>
                            )}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#f3e5f5' }}>
                            <FiUsers size={24} style={{ color: '#7b1fa2' }} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{overviewStats.userCount}</div>
                            <div className={styles.statLabel}>Người dùng</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fce4ec' }}>
                            <FiMessageSquare size={24} style={{ color: '#ef789a' }} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{overviewStats.feedbackCount}</div>
                            <div className={styles.statLabel}>Phản hồi</div>
                        </div>
                    </div>

                    <div className={styles.statCard} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>
                            <span style={{ fontSize: '24px' }}>💰</span>
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{formatCurrency(overviewStats.totalRevenue)}</div>
                            <div className={styles.statLabel}>Tổng doanh thu</div>
                        </div>
                    </div>

                    {overviewStats.lowStock > 0 && (
                        <div className={styles.alertCard}>
                            <FiAlertCircle size={20} />
                            <span>Cảnh báo: {overviewStats.lowStock} sản phẩm sắp hết hàng (≤ 5)</span>
                        </div>
                    )}
                </div>

                {/* Charts Section */}
                <div className={styles.chartsGrid}>
                    {/* Revenue Chart */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Doanh thu theo ngày (7 ngày gần nhất)</h3>
                        {revenueChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#ef789a" 
                                        strokeWidth={2}
                                        name="Doanh thu"
                                        dot={{ fill: '#ef789a' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                Chưa có dữ liệu
                            </div>
                        )}
                    </div>

                    {/* Order Status Chart */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Phân bố trạng thái đơn hàng</h3>
                        {orderStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {orderStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                Chưa có dữ liệu
                            </div>
                        )}
                    </div>

                    {/* Top Products Chart */}
                    <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                        <h3 className={styles.chartTitle}>Top sản phẩm theo lượt bán</h3>
                        {topProductsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topProductsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#0288d1" name="Lượt bán" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                Chưa có dữ liệu
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderProducts = () => {
        const categoryOptions = categories.filter((cat) => cat.categoryId !== 'all');

        return (
            <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Quản lý sản phẩm</h2>
                    <button className={styles.btnPrimary} onClick={openCreateProductModal}>
                        <FiPackage size={16} />
                        <span>Thêm sản phẩm mới</span>
                    </button>
                </div>

                {isProductModalOpen && (
                    <div className={styles.modalOverlay} onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeProductModal();
                        }
                    }}>
                        <div className={styles.modalPanel}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>
                                    {editingProductId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                                </h3>
                                <button className={styles.btnSecondary} onClick={closeProductModal} type="button">
                                    Đóng
                                </button>
                            </div>

                            {/* Template Selector - Only show when creating new product */}
                            {!editingProductId && (
                                <div className={styles.templateSection}>
                                    <div className={styles.templateHeader}>
                                        <FiTag size={18} />
                                        <span>Tạo nhanh từ mẫu có sẵn</span>
                                    </div>
                                    <div className={styles.templateGrid}>
                                        {PRODUCT_TEMPLATES.map((template) => (
                                            <button
                                                key={template.id}
                                                type="button"
                                                className={styles.templateCard}
                                                onClick={() => applyProductTemplate(template.id)}
                                            >
                                                <span className={styles.templateName}>{template.name}</span>
                                                <span className={styles.templateDesc}>
                                                    {template.data.description?.substring(0, 50)}...
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className={styles.templateNote}>
                                        💡 Chọn mẫu để tự động điền thông tin chi tiết. Bạn có thể chỉnh sửa sau.
                                    </p>
                                </div>
                            )}

                            <form className={styles.productForm} onSubmit={handleProductSubmit}>
                                <div className={styles.stepHeader}>Thông tin cần nhập</div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Tên sản phẩm *</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={productForm.name}
                                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                            placeholder="Nhập tên sản phẩm"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Danh mục *</label>
                                        <select
                                            className={styles.formInput}
                                            value={productForm.category}
                                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Chọn danh mục --</option>
                                            {categoryOptions.map((cat) => (
                                                <option key={cat.categoryId} value={cat.categoryId}>
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Mô tả ngắn *</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        placeholder="Nhập mô tả ngắn. Các phần mặc định còn lại sẽ tự động thêm khi lưu."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Giá (VNĐ) *</label>
                                        <input
                                            type="number"
                                            className={styles.formInput}
                                            value={productForm.price}
                                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Giá khuyến mãi (VNĐ)</label>
                                        <input
                                            type="number"
                                            className={styles.formInput}
                                            value={productForm.salePrice}
                                            onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Tồn kho *</label>
                                        <input
                                            type="number"
                                            className={styles.formInput}
                                            value={productForm.stock}
                                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Đơn vị</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={productForm.unit}
                                            onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                                            placeholder="chai"
                                        />
                                    </div>
                                </div>

                                {/* Product Detail Section */}
                                <div className={styles.stepHeader}>Thông tin chi tiết sản phẩm</div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Tóm tắt chi tiết</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={productForm.detailSummary}
                                        onChange={(e) => setProductForm({ ...productForm, detailSummary: e.target.value })}
                                        placeholder="Mô tả chi tiết về sản phẩm (không bắt buộc)"
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Lợi ích</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={productForm.benefits}
                                        onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                                        placeholder="Liệt kê các lợi ích của sản phẩm"
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Thành phần</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={productForm.ingredients}
                                        onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                                        placeholder="Liệt kê các thành phần chính"
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Cách sử dụng</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={productForm.usage}
                                        onChange={(e) => setProductForm({ ...productForm, usage: e.target.value })}
                                        placeholder="Hướng dẫn cách sử dụng"
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Câu hỏi thường gặp</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={productForm.faq}
                                        onChange={(e) => setProductForm({ ...productForm, faq: e.target.value })}
                                        placeholder="Các câu hỏi thường gặp và câu trả lời"
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.stepHeader}>Hình ảnh sản phẩm</div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Hình ảnh sản phẩm</label>
                                    <div
                                        className={`${styles.imageUploadContainer} ${isDragOver ? styles.imageUploadDragging : ''}`}
                                        onDragOver={handleImageDragOver}
                                        onDragLeave={handleImageDragLeave}
                                        onDrop={handleImageDrop}
                                    >
                                        {productForm.imageUrl && (
                                            <div className={styles.imagePreview}>
                                                <img src={productForm.imageUrl} alt="Preview" />
                                            </div>
                                        )}
                                        <div className={styles.uploadControls}>
                                            <p className={styles.dropHint}>Kéo ảnh vào khung này hoặc bấm chọn ảnh</p>
                                            <label className={styles.uploadBtn}>
                                                <FiUpload size={18} />
                                                <span>Chọn ảnh từ máy</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            {uploading && (
                                                <div className={styles.uploadProgress}>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.btnPrimary} disabled={busyAction || uploading}>
                                        {busyAction ? <FiRefreshCw className="spin" /> : <FiSave />}
                                        <span>{editingProductId ? 'Cập nhật' : 'Thêm mới'}</span>
                                    </button>
                                    <button type="button" className={styles.btnSecondary} onClick={closeProductModal}>
                                        Ẩn popup
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
                    <h2 className={styles.sectionTitle}>Danh sách sản phẩm ({products.length})</h2>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Tên</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.productId}>
                                    <td>
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className={styles.productThumb} />
                                        ) : (
                                            <div className={styles.productThumbPlaceholder}>
                                                <FiImage size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <strong>{product.name}</strong>
                                    </td>
                                    <td>
                                        <span className={styles.categoryBadge}>
                                            {categoryNameById[product.category || ''] || product.category || '--'}
                                        </span>
                                    </td>
                                    <td>
                                        <div>{formatCurrency(product.salePrice || product.price)}</div>
                                        {product.salePrice && (
                                            <div className={styles.originalPrice}>{formatCurrency(product.price)}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={product.stock <= 5 ? styles.lowStockBadge : ''}>
                                            {product.stock} {product.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.btnEdit}
                                                onClick={() => handleEditProduct(product)}
                                                title="Chỉnh sửa"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() => handleDeleteProduct(product.productId)}
                                                title="Xóa"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCategories = () => {
        return (
            <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        {editingCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                    </h2>
                    {editingCategoryId && (
                        <button className={styles.btnSecondary} onClick={resetCategoryForm}>
                            Hủy chỉnh sửa
                        </button>
                    )}
                </div>

                <form className={styles.productForm} onSubmit={handleCategorySubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tên danh mục (Việt Nam) *</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="Ví dụ: Nước lên men"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tên danh mục (English) *</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={categoryForm.nameEn}
                                onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                                placeholder="Ví dụ: Fermented Water"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Icon (emoji) *</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={categoryForm.icon}
                                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                placeholder="🥤"
                                maxLength={2}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mô tả (Không bắt buộc)</label>
                        <textarea
                            className={styles.formTextarea}
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            placeholder="Mô tả chi tiết danh mục sản phẩm"
                            rows={3}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnPrimary} disabled={busyAction}>
                            {busyAction ? <FiRefreshCw className="spin" /> : <FiSave />}
                            <span>{editingCategoryId ? 'Cập nhật' : 'Thêm mới'}</span>
                        </button>
                        {editingCategoryId && (
                            <button type="button" className={styles.btnSecondary} onClick={resetCategoryForm}>
                                Hủy
                            </button>
                        )}
                    </div>
                </form>

                <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
                    <h2 className={styles.sectionTitle}>Danh sách danh mục ({categories.length})</h2>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Icon</th>
                                <th>Tên (VI)</th>
                                <th>Tên (EN)</th>
                                <th>Mô tả</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.categoryId}>
                                    <td style={{ fontSize: '1.5rem' }}>{category.icon}</td>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.nameEn}</td>
                                    <td className={styles.subText}>{category.description || '--'}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.btnEdit}
                                                onClick={() => handleEditCategory(category)}
                                                title="Chỉnh sửa"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() => handleDeleteCategory(category.categoryId)}
                                                title="Xóa"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderOrders = () => (
        <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Quản lý đơn hàng ({orders.length})</h2>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.orderId}>
                                <td>
                                    <strong>{order.orderId.slice(0, 8)}</strong>
                                </td>
                                <td>
                                    <div>{order.userId || 'N/A'}</div>
                                    <div className={styles.subText}>{order.orderId.slice(0, 8)}</div>
                                </td>
                                <td>{formatCurrency(order.totalAmount)}</td>
                                <td>
                                    <select
                                        className={styles.statusSelect}
                                        value={orderStatusDraft[order.orderId] || order.status}
                                        onChange={(e) =>
                                            setOrderStatusDraft({
                                                ...orderStatusDraft,
                                                [order.orderId]: e.target.value as OrderStatus,
                                            })
                                        }
                                    >
                                        {ORDER_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>{formatDateTime(order.createdAt)}</td>
                                <td>
                                    {orderStatusDraft[order.orderId] !== order.status && (
                                        <button
                                            className={styles.btnSave}
                                            onClick={() => handleUpdateOrderStatus(order.orderId)}
                                        >
                                            <FiSave size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Quản lý người dùng ({users.length})</h2>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((userItem) => {
                            const draft = userDrafts[userItem.userId];
                            const hasChanges =
                                draft && (draft.role !== userItem.role || draft.isActive !== userItem.isActive);

                            return (
                                <tr key={userItem.userId}>
                                    <td>
                                        <strong>{userItem.name || 'N/A'}</strong>
                                    </td>
                                    <td>{userItem.email}</td>
                                    <td>
                                        <select
                                            className={styles.roleSelect}
                                            value={draft?.role || userItem.role}
                                            onChange={(e) =>
                                                setUserDrafts({
                                                    ...userDrafts,
                                                    [userItem.userId]: {
                                                        ...draft,
                                                        role: e.target.value as AdminUserRole,
                                                        isActive: draft?.isActive ?? userItem.isActive,
                                                    },
                                                })
                                            }
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <label className={styles.toggleSwitch}>
                                            <input
                                                type="checkbox"
                                                checked={draft?.isActive ?? userItem.isActive}
                                                onChange={(e) =>
                                                    setUserDrafts({
                                                        ...userDrafts,
                                                        [userItem.userId]: {
                                                            role: draft?.role || userItem.role,
                                                            isActive: e.target.checked,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className={styles.toggleSlider}></span>
                                        </label>
                                    </td>
                                    <td>
                                        {hasChanges && (
                                            <button
                                                className={styles.btnSave}
                                                onClick={() => handleUpdateUser(userItem.userId)}
                                            >
                                                <FiSave size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFeedback = () => (
        <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Phản hồi từ khách hàng ({feedbacks.length})</h2>
            </div>

            <div className={styles.feedbackGrid}>
                {feedbacks.map((feedback) => (
                    <div key={feedback.feedbackId} className={styles.feedbackCard}>
                        <div className={styles.feedbackHeader}>
                            <div>
                                <strong>{feedback.userName || 'Anonymous'}</strong>
                                <div className={styles.subText}>
                                    {feedback.rating} ⭐ • {formatDateTime(feedback.createdAt)}
                                </div>
                            </div>
                            <button
                                className={styles.btnDelete}
                                onClick={() => handleDeleteFeedback(feedback.feedbackId)}
                                title="Xóa"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                        <p className={styles.feedbackComment}>{feedback.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className={styles.loadingState}>
                    <FiRefreshCw size={32} className="spin" />
                    <p>Đang tải dữ liệu...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'products':
                return renderProducts();
            case 'categories':
                return renderCategories();
            case 'orders':
                return renderOrders();
            case 'users':
                return renderUsers();
            case 'feedback':
                return renderFeedback();
            default:
                return null;
        }
    };

    return (
        <div className={styles.adminDashboard}>
            {renderSidebar()}

            <main className={`${styles.mainContent} ${sidebarOpen ? '' : styles.mainContentExpanded}`}>
                <header className={styles.topBar}>
                    <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>

   <h1 className={styles.pageTitle}>
                        {activeTab === 'overview' && 'Tổng quan'}
                        {activeTab === 'products' && 'Quản lý sản phẩm'}
                        {activeTab === 'categories' && 'Quản lý danh mục'}
                        {activeTab === 'orders' && 'Quản lý đơn hàng'}
                        {activeTab === 'users' && 'Quản lý người dùng'}
                        {activeTab === 'feedback' && 'Phản hồi khách hàng'}
                    </h1>

                    <button className={styles.refreshBtn} onClick={loadDashboardData}>
                        <FiRefreshCw size={18} />
                    </button>
                </header>

                {error && (
                    <div className={styles.alertError}>
                        <FiAlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className={styles.alertSuccess}>
                        <FiCheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <div className={styles.contentWrapper}>{renderContent()}</div>
            </main>
        </div>
    );
};
