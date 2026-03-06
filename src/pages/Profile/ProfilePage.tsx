import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiPackage, FiMail, FiUser, FiLogOut, FiCamera } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { orderService, type Order } from '../../services/orderService';
import { userService } from '../../services/userService';
import { uploadImage, type UploadProgress } from '../../services/imageService';
import styles from './ProfilePage.module.css';

const orderStatusLabels: Record<string, { vi: string; en: string; color: string }> = {
    PENDING_PAYMENT: { vi: 'Chờ thanh toán', en: 'Pending Payment', color: '#ff6b6b' },
    PENDING: { vi: 'Chờ xác nhận', en: 'Pending', color: '#ff9800' },
    CONFIRMED: { vi: 'Đã xác nhận', en: 'Confirmed', color: '#2196f3' },
    SHIPPING: { vi: 'Đang vận chuyển', en: 'Shipping', color: '#9c27b0' },
    DELIVERED: { vi: 'Đã giao', en: 'Delivered', color: '#4caf50' },
    CANCELLED: { vi: 'Đã hủy', en: 'Cancelled', color: '#f44336' },
};

export const ProfilePage = () => {
    const { isAuthenticated, isLoading, user, logout } = useAuthContext();
    const { language } = useLanguage();
    const isVi = language === 'vi';
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<'profile' | 'orders'>('profile');
    const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check authentication
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Load orders
    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await orderService.getHistory();
                setOrders(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : (isVi ? 'Lỗi khi tải lịch sử đơn hàng' : 'Error loading order history');
                setError(message);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            loadOrders();
        }
    }, [isAuthenticated, isVi]);

    const handleLogout = useCallback(() => {
        logout();
        navigate('/');
    }, [logout, navigate]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError('');
            setUploadingAvatar(true);
            setUploadProgress(0);

            // Upload to Cloudinary
            const result = await uploadImage(file, (progress: UploadProgress) => {
                setUploadProgress(progress.percentage);
            });

            // Update profile with new avatar URL
            await userService.updateProfile({
                name: user?.name || 'User',
                phone: user?.phone,
                address: user?.address,
                avatarUrl: result.secureUrl,
            });

            setAvatarUrl(result.secureUrl);

            // Reload page to update auth context
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            const message = err instanceof Error ? err.message : (isVi ? 'Lỗi khi tải ảnh đại diện' : 'Error uploading avatar');
            setError(message);
        } finally {
            setUploadingAvatar(false);
            setUploadProgress(0);
        }
    };

    const handleViewOrder = (orderId: string) => {
        navigate(`/orders/${orderId}`);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dateString));
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (!isAuthenticated && !isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <FiAlertCircle className={styles.emptyIcon} />
                    <h2>{isVi ? 'Vui lòng đăng nhập' : 'Please log in'}</h2>
                    <button onClick={() => navigate('/auth')} className={styles.primaryBtn}>
                        {isVi ? 'Đăng nhập' : 'Log in'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/')}>
                    <FiArrowLeft /> {isVi ? 'Về trang chủ' : 'Home'}
                </button>
                <h1>{isVi ? 'Tài khoản của tôi' : 'My Account'}</h1>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Sidebar - Profile Info */}
                <aside className={styles.sidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarSection}>
                            <div 
                                className={styles.avatar} 
                                onClick={handleAvatarClick}
                                style={{
                                    backgroundImage: avatarUrl || user?.avatarUrl ? `url(${avatarUrl || user?.avatarUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {!avatarUrl && !user?.avatarUrl && (user?.name?.charAt(0).toUpperCase() || 'U')}
                                {uploadingAvatar && (
                                    <div className={styles.uploadOverlay}>
                                        <div className={styles.uploadProgress}>
                                            {uploadProgress}%
                                        </div>
                                    </div>
                                )}
                                <div className={styles.avatarHover}>
                                    <FiCamera size={24} />
                                    <span>{isVi ? 'Đổi ảnh' : 'Change'}</span>
                                </div>
                            </div>
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                                disabled={uploadingAvatar}
                            />
                            <div className={styles.verifyBadge}>
                                <MdVerified />
                            </div>
                        </div>

                        <div className={styles.profileInfo}>
                            <h2 className={styles.profileName}>{user?.name || 'User'}</h2>
                            <div className={styles.infoItem}>
                                <FiMail size={16} />
                                <span>{user?.email || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <FiUser size={16} />
                                <span>{isVi ? 'Khách hàng' : 'Customer'}</span>
                            </div>
                        </div>

                        <div className={styles.profileStats}>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>{orders.length}</div>
                                <div className={styles.statLabel}>{isVi ? 'Đơn hàng' : 'Orders'}</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>
                                    {orders.filter(o => o.status === 'DELIVERED').length}
                                </div>
                                <div className={styles.statLabel}>{isVi ? 'Đã giao' : 'Delivered'}</div>
                            </div>
                        </div>

                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <FiLogOut size={16} />
                            {isVi ? 'Đăng xuất' : 'Logout'}
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={styles.mainArea}>
                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${selectedTab === 'profile' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('profile')}
                        >
                            <FiUser size={18} />
                            {isVi ? 'Thông tin cá nhân' : 'Profile Information'}
                        </button>
                        <button
                            className={`${styles.tab} ${selectedTab === 'orders' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('orders')}
                        >
                            <FiPackage size={18} />
                            {isVi ? 'Lịch sử đơn hàng' : 'Order History'} ({orders.length})
                        </button>
                    </div>

                    {/* Profile Tab Content */}
                    {selectedTab === 'profile' && (
                        <div className={styles.tabContent}>
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h3>{isVi ? 'Thông tin cơ bản' : 'Basic Information'}</h3>
                                    {/* <button className={styles.editBtn}><FiEdit2 size={16} /> {isVi ? 'Chỉnh sửa' : 'Edit'}</button> */}
                                </div>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoField}>
                                        <label>{isVi ? 'Tên đầy đủ' : 'Full Name'}</label>
                                        <p>{user?.name || 'N/A'}</p>
                                    </div>
                                    <div className={styles.infoField}>
                                        <label>{isVi ? 'Email' : 'Email'}</label>
                                        <p>{user?.email || 'N/A'}</p>
                                    </div>
                                    <div className={styles.infoField}>
                                        <label>{isVi ? 'Trạng thái' : 'Status'}</label>
                                        <p className={styles.statusActive}>{isVi ? 'Hoạt động' : 'Active'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h3>{isVi ? 'Địa chỉ giao hàng' : 'Shipping Address'}</h3>
                                    <button className={styles.editBtn}><FiEdit2 size={16} /> {isVi ? 'Chỉnh sửa' : 'Edit'}</button>
                                </div>
                                <div className={styles.emptyMessage}>
                                    {isVi ? 'Chưa có địa chỉ giao hàng' : 'No shipping address saved'}
                                </div>
                            </section> */}
                        </div>
                    )}

                    {/* Orders Tab Content */}
                    {selectedTab === 'orders' && (
                        <div className={styles.tabContent}>
                            {error && (
                                <div className={styles.errorMessage}>
                                    <FiAlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {loading ? (
                                <div className={styles.spinner}></div>
                            ) : orders.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FiPackage className={styles.emptyIcon} />
                                    <h3>{isVi ? 'Chưa có đơn hàng' : 'No orders yet'}</h3>
                                    <p>{isVi ? 'Hãy mua sản phẩm từ ORCHA hôm nay' : 'Browse our products and make your first order'}</p>
                                    <button className={styles.primaryBtn} onClick={() => navigate('/products/nuoc')}>
                                        {isVi ? 'Xem sản phẩm' : 'View Products'}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.ordersList}>
                                    {orders.map((order) => {
                                        const statusInfo = orderStatusLabels[order.status];
                                        return (
                                            <div key={order.orderId} className={styles.orderCard}>
                                                <div className={styles.orderHeader}>
                                                    <div>
                                                        <h4>{isVi ? 'Đơn hàng' : 'Order'} #{order.orderId.substring(0, 8).toUpperCase()}</h4>
                                                        <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                                                    </div>
                                                    <div className={styles.orderStatus} style={{ borderColor: statusInfo.color }}>
                                                        <span style={{ color: statusInfo.color }}>
                                                            {isVi ? statusInfo.vi : statusInfo.en}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={styles.orderItems}>
                                                    <div className={styles.itemsLabel}>
                                                        {isVi ? 'Sản phẩm' : 'Items'}: {order.items.length}
                                                    </div>
                                                    {order.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className={styles.orderItem}>
                                                            <span className={styles.itemName}>{item.productName}</span>
                                                            <span className={styles.itemQty}>x{item.quantity}</span>
                                                            <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <div className={styles.moreItems}>
                                                            {isVi ? `+${order.items.length - 2} sản phẩm khác` : `+${order.items.length - 2} more items`}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={styles.orderFooter}>
                                                    <div className={styles.total}>
                                                        <span>{isVi ? 'Tổng' : 'Total'}:</span>
                                                        <span className={styles.totalAmount}>{formatCurrency(order.totalAmount)}</span>
                                                    </div>
                                                    <button
                                                        className={styles.viewDetailsBtn}
                                                        onClick={() => handleViewOrder(order.orderId)}
                                                    >
                                                        {isVi ? 'Xem chi tiết' : 'View Details'} →
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
