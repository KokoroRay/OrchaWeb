import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiHome, FiPackage, FiShoppingCart, FiUsers, FiMessageSquare, 
    FiLogOut, FiMenu, FiX, FiEdit2, FiTrash2, FiSave, 
    FiRefreshCw, FiImage, FiUpload, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { orderService, type Order } from '../../services/orderService';
import { adminService, type AdminFeedback, type AdminProduct, type AdminProductInput, type AdminUser, type AdminUserRole } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { uploadImage, type UploadProgress } from '../../services/imageService';
import logoImage from '../../assets/logos/Logo.png';
import styles from './AdminDashboard.module.css';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'feedback';
type OrderStatus = Order['status'];

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

interface ProductFormData {
    name: string;
    description: string;
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
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    unit: 'chai',
    imageUrl: '',
    imageFile: null,
};

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
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [loading, setLoading] = useState(true);
    const [busyAction, setBusyAction] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);

    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [productForm, setProductForm] = useState<ProductFormData>(initialProductForm);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploading, setUploading] = useState(false);

    const [orderStatusDraft, setOrderStatusDraft] = useState<Record<string, OrderStatus>>({});
    const [userDrafts, setUserDrafts] = useState<Record<string, { role: AdminUserRole; isActive: boolean }>>({});

    const loadDashboardData = useCallback(async () => {
        setError('');
        setSuccess('');

        try {
            const [productData, orderData, userData, feedbackData] = await Promise.all([
                adminService.getProducts(),
                orderService.adminGetAll(),
                adminService.getUsers(),
                adminService.getFeedbacks(),
            ]);

            setProducts(productData);
            setOrders(orderData);
            setUsers(userData);
            setFeedbacks(feedbackData);

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

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            const result = await uploadImage(file, (progress: UploadProgress) => {
                setUploadProgress(progress.percentage);
            });

            setProductForm((prev) => ({
                ...prev,
                imageUrl: result.secureUrl,
                imageFile: file,
            }));
            setSuccess('Upload ảnh thành công!');
        } catch (uploadError) {
            const message = uploadError instanceof Error ? uploadError.message : 'Upload thất bại';
            setError(message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const resetProductForm = () => {
        setEditingProductId(null);
        setProductForm(initialProductForm);
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
                description: productForm.description.trim(),
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
            category: product.category || '',
            price: product.price.toString(),
            salePrice: product.salePrice?.toString() || '',
            stock: product.stock.toString(),
            unit: product.unit || 'chai',
            imageUrl: product.images?.[0] || '',
            imageFile: null,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const renderOverview = () => (
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
    );

    const renderProducts = () => {
        const categories = categoryService.getForSelection();

        return (
            <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        {editingProductId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    {editingProductId && (
                        <button className={styles.btnSecondary} onClick={resetProductForm}>
                            Hủy chỉnh sửa
                        </button>
                    )}
                </div>

                <form className={styles.productForm} onSubmit={handleProductSubmit}>
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
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mô tả</label>
                        <textarea
                            className={styles.formTextarea}
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Mô tả chi tiết sản phẩm"
                            rows={4}
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

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Hình ảnh sản phẩm</label>
                        <div className={styles.imageUploadContainer}>
                            {productForm.imageUrl && (
                                <div className={styles.imagePreview}>
                                    <img src={productForm.imageUrl} alt="Preview" />
                                </div>
                            )}
                            <div className={styles.uploadControls}>
                                <label className={styles.uploadBtn}>
                                    <FiUpload size={18} />
                                    <span>Upload ảnh</span>
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
                        {editingProductId && (
                            <button type="button" className={styles.btnSecondary} onClick={resetProductForm}>
                                Hủy
                            </button>
                        )}
                    </div>
                </form>

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
                                            {categoryService.getName(product.category || '')}
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
