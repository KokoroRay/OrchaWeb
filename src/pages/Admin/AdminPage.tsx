import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { orderService, type Order } from '../../services/orderService.ts';
import { adminService, type AdminFeedback, type AdminProduct, type AdminProductInput, type AdminUser, type AdminUserRole } from '../../services/adminService.ts';
import styles from './AdminPage.module.css';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'feedback';

type OrderStatus = Order['status'];

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const initialProductForm: {
    name: string;
    description: string;
    category: string;
    price: string;
    salePrice: string;
    stock: string;
    unit: string;
    imageUrls: string;
} = {
    name: '',
    description: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    unit: 'chai',
    imageUrls: '',
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
    return date.toLocaleString('vi-VN');
};

const parseImages = (raw: string): string[] => {
    return raw
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const toProductInput = (form: typeof initialProductForm): AdminProductInput => {
    const price = Number(form.price || 0);
    const salePrice = Number(form.salePrice || 0);
    const stock = Number(form.stock || 0);

    return {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price,
        salePrice: salePrice > 0 ? salePrice : 0,
        stock,
        unit: form.unit.trim() || 'chai',
        images: parseImages(form.imageUrls),
    };
};

const normalizeError = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
};

export const AdminPage = () => {
    const { user, logout } = useAuthContext();

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
    const [productForm, setProductForm] = useState(initialProductForm);
    const [orderStatusDraft, setOrderStatusDraft] = useState<Record<string, OrderStatus>>({});
    const [userDrafts, setUserDrafts] = useState<Record<string, { role: AdminUserRole; isActive: boolean }>>({});

    const loadDashboardData = useCallback(async () => {
        setError('');
        setSuccess('');

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
    }, []);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                await loadDashboardData();
            } catch (loadError) {
                setError(normalizeError(loadError));
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

    const resetProductForm = () => {
        setEditingProductId(null);
        setProductForm(initialProductForm);
    };

    const handleRefresh = async () => {
        setBusyAction(true);
        setError('');
        try {
            await loadDashboardData();
            setSuccess('Đã làm mới dữ liệu dashboard.');
        } catch (refreshError) {
            setError(normalizeError(refreshError));
        } finally {
            setBusyAction(false);
        }
    };

    const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusyAction(true);
        setError('');
        setSuccess('');

        try {
            const payload = toProductInput(productForm);
            if (!payload.name || !payload.category || payload.price <= 0) {
                throw new Error('Vui lòng nhập đầy đủ tên, danh mục và giá hợp lệ.');
            }

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
            setError(normalizeError(submitError));
        } finally {
            setBusyAction(false);
        }
    };

    const handleEditProduct = (product: AdminProduct) => {
        setEditingProductId(product.productId);
        setProductForm({
            name: product.name,
            description: product.description,
            category: product.category,
            price: String(product.price),
            salePrice: product.salePrice ? String(product.salePrice) : '',
            stock: String(product.stock),
            unit: product.unit,
            imageUrls: product.images.join('\n'),
        });
        setActiveTab('products');
        setSuccess('Đang chỉnh sửa sản phẩm.');
        setError('');
    };

    const handleDeleteProduct = async (productId: string) => {
        setBusyAction(true);
        setError('');
        setSuccess('');
        try {
            await adminService.deleteProduct(productId);
            setProducts((prev) => prev.filter((item) => item.productId !== productId));
            setSuccess('Đã xóa sản phẩm thành công.');
            if (editingProductId === productId) {
                resetProductForm();
            }
        } catch (deleteError) {
            setError(normalizeError(deleteError));
        } finally {
            setBusyAction(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string) => {
        const status = orderStatusDraft[orderId];
        if (!status) return;

        setBusyAction(true);
        setError('');
        setSuccess('');
        try {
            const updated = await orderService.adminUpdateStatus(orderId, status);
            setOrders((prev) => prev.map((item) => (item.orderId === updated.orderId ? updated : item)));
            setSuccess('Đã cập nhật trạng thái đơn hàng.');
        } catch (updateError) {
            setError(normalizeError(updateError));
        } finally {
            setBusyAction(false);
        }
    };

    const handleUpdateUser = async (userId: string) => {
        const draft = userDrafts[userId];
        if (!draft) return;

        setBusyAction(true);
        setError('');
        setSuccess('');
        try {
            const updated = await adminService.updateUser(userId, {
                role: draft.role,
                isActive: draft.isActive,
            });
            setUsers((prev) => prev.map((item) => (item.userId === updated.userId ? updated : item)));
            setSuccess('Đã cập nhật thông tin người dùng.');
        } catch (updateError) {
            setError(normalizeError(updateError));
        } finally {
            setBusyAction(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        setBusyAction(true);
        setError('');
        setSuccess('');
        try {
            await adminService.deleteFeedback(feedbackId);
            setFeedbacks((prev) => prev.filter((item) => item.feedbackId !== feedbackId));
            setSuccess('Đã xóa feedback thành công.');
        } catch (deleteError) {
            setError(normalizeError(deleteError));
        } finally {
            setBusyAction(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Đang tải dữ liệu admin...</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div>
                    <h1 className={styles.title}>ORCHA Admin Console</h1>
                    <p className={styles.subtitle}>Xin chào {user?.name || user?.email}. Bạn đang quản trị hệ thống.</p>
                </div>
                <div className={styles.actions}>
                    <button type="button" className={styles.secondaryBtn} onClick={handleRefresh} disabled={busyAction}>
                        Làm mới dữ liệu
                    </button>
                    <Link to="/" className={styles.secondaryBtn}>Trang chủ</Link>
                    <button type="button" className={styles.primaryBtn} onClick={logout}>Đăng xuất</button>
                </div>
            </div>

            <div className={styles.tabBar}>
                {(['overview', 'products', 'orders', 'users', 'feedback'] as AdminTab[]).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'overview' ? 'Tổng quan' : tab === 'products' ? 'Sản phẩm' : tab === 'orders' ? 'Đơn hàng' : tab === 'users' ? 'Người dùng' : 'Feedback'}
                    </button>
                ))}
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            {activeTab === 'overview' && (
                <section className={styles.gridCards}>
                    <article className={styles.card}><span>Tổng sản phẩm</span><strong>{overviewStats.productCount}</strong></article>
                    <article className={styles.card}><span>Đơn hàng</span><strong>{overviewStats.orderCount}</strong></article>
                    <article className={styles.card}><span>Đơn chờ xử lý</span><strong>{overviewStats.pendingOrders}</strong></article>
                    <article className={styles.card}><span>Người dùng</span><strong>{overviewStats.userCount}</strong></article>
                    <article className={styles.card}><span>Feedback</span><strong>{overviewStats.feedbackCount}</strong></article>
                    <article className={styles.card}><span>Sản phẩm sắp hết hàng</span><strong>{overviewStats.lowStock}</strong></article>
                    <article className={styles.cardWide}><span>Tổng doanh thu (không gồm đơn huỷ)</span><strong>{formatCurrency(overviewStats.totalRevenue)}</strong></article>
                </section>
            )}

            {activeTab === 'products' && (
                <section className={styles.panel}>
                    <h2 className={styles.sectionTitle}>{editingProductId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                    <form className={styles.formGrid} onSubmit={handleProductSubmit}>
                        <input className={styles.input} placeholder="Tên sản phẩm" value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} />
                        <input className={styles.input} placeholder="Danh mục" value={productForm.category} onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))} />
                        <input className={styles.input} type="number" placeholder="Giá" value={productForm.price} onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))} />
                        <input className={styles.input} type="number" placeholder="Giá sale (tuỳ chọn)" value={productForm.salePrice} onChange={(event) => setProductForm((prev) => ({ ...prev, salePrice: event.target.value }))} />
                        <input className={styles.input} type="number" placeholder="Tồn kho" value={productForm.stock} onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))} />
                        <input className={styles.input} placeholder="Đơn vị (chai, hộp...)" value={productForm.unit} onChange={(event) => setProductForm((prev) => ({ ...prev, unit: event.target.value }))} />
                        <textarea className={styles.textarea} placeholder="Mô tả" value={productForm.description} onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))} />
                        <textarea className={styles.textarea} placeholder="Image URL (mỗi dòng hoặc cách nhau dấu phẩy)" value={productForm.imageUrls} onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrls: event.target.value }))} />
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.primaryBtn} disabled={busyAction}>{editingProductId ? 'Lưu cập nhật' : 'Tạo sản phẩm'}</button>
                            {editingProductId && (
                                <button type="button" className={styles.secondaryBtn} onClick={resetProductForm}>Huỷ chỉnh sửa</button>
                            )}
                        </div>
                    </form>

                    <h3 className={styles.sectionSubTitle}>Danh sách sản phẩm hiện tại</h3>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Tồn kho</th>
                                    <th>Cập nhật</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.productId}>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>{formatCurrency(product.salePrice && product.salePrice > 0 ? product.salePrice : product.price)}</td>
                                        <td>{product.stock} {product.unit}</td>
                                        <td>{formatDateTime(product.updatedAt)}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <button type="button" className={styles.linkBtn} onClick={() => handleEditProduct(product)}>Sửa</button>
                                                <button type="button" className={styles.linkDanger} onClick={() => void handleDeleteProduct(product.productId)} disabled={busyAction}>Xoá</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'orders' && (
                <section className={styles.panel}>
                    <h2 className={styles.sectionTitle}>Quản lý đơn hàng</h2>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
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
                                        <td>{order.orderId.slice(0, 8)}</td>
                                        <td>{order.userEmail}</td>
                                        <td>{formatCurrency(order.totalAmount)}</td>
                                        <td>
                                            <select
                                                className={styles.select}
                                                value={orderStatusDraft[order.orderId] ?? order.status}
                                                onChange={(event) => {
                                                    const next = event.target.value as OrderStatus;
                                                    setOrderStatusDraft((prev) => ({ ...prev, [order.orderId]: next }));
                                                }}
                                            >
                                                {ORDER_STATUSES.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>{formatDateTime(order.createdAt)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className={styles.linkBtn}
                                                disabled={busyAction || (orderStatusDraft[order.orderId] ?? order.status) === order.status}
                                                onClick={() => void handleUpdateOrderStatus(order.orderId)}
                                            >
                                                Cập nhật
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'users' && (
                <section className={styles.panel}>
                    <h2 className={styles.sectionTitle}>Quản lý người dùng</h2>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Tên</th>
                                    <th>Role</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((item) => {
                                    const draft = userDrafts[item.userId] ?? { role: item.role, isActive: item.isActive };
                                    const changed = draft.role !== item.role || draft.isActive !== item.isActive;

                                    return (
                                        <tr key={item.userId}>
                                            <td>{item.email}</td>
                                            <td>{item.name || '--'}</td>
                                            <td>
                                                <select
                                                    className={styles.select}
                                                    value={draft.role}
                                                    onChange={(event) => {
                                                        const nextRole = event.target.value as AdminUserRole;
                                                        setUserDrafts((prev) => ({
                                                            ...prev,
                                                            [item.userId]: {
                                                                ...(prev[item.userId] ?? { role: item.role, isActive: item.isActive }),
                                                                role: nextRole,
                                                            },
                                                        }));
                                                    }}
                                                >
                                                    <option value="CUSTOMER">CUSTOMER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                            <td>
                                                <label className={styles.checkboxWrap}>
                                                    <input
                                                        type="checkbox"
                                                        checked={draft.isActive}
                                                        onChange={(event) => {
                                                            const nextValue = event.target.checked;
                                                            setUserDrafts((prev) => ({
                                                                ...prev,
                                                                [item.userId]: {
                                                                    ...(prev[item.userId] ?? { role: item.role, isActive: item.isActive }),
                                                                    isActive: nextValue,
                                                                },
                                                            }));
                                                        }}
                                                    />
                                                    <span>{draft.isActive ? 'Active' : 'Blocked'}</span>
                                                </label>
                                            </td>
                                            <td>
                                                <button type="button" className={styles.linkBtn} disabled={busyAction || !changed} onClick={() => void handleUpdateUser(item.userId)}>
                                                    Lưu
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'feedback' && (
                <section className={styles.panel}>
                    <h2 className={styles.sectionTitle}>Quản lý feedback</h2>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Product ID</th>
                                    <th>Rating</th>
                                    <th>Nội dung</th>
                                    <th>Thời gian</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.map((item) => (
                                    <tr key={item.feedbackId}>
                                        <td>{item.userName || item.userId}</td>
                                        <td>{item.productId}</td>
                                        <td>{item.rating}/5</td>
                                        <td>{item.comment || '--'}</td>
                                        <td>{formatDateTime(item.createdAt)}</td>
                                        <td>
                                            <button type="button" className={styles.linkDanger} disabled={busyAction} onClick={() => void handleDeleteFeedback(item.feedbackId)}>
                                                Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};
