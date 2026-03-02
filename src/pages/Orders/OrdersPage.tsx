import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiPackage } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { orderService, type Order } from '../../services/orderService';
import styles from './OrdersPage.module.css';

const orderStatusLabels: Record<string, { vi: string; en: string; color: string }> = {
    PENDING: { vi: 'Chờ xác nhận', en: 'Pending', color: '#ff9800' },
    CONFIRMED: { vi: 'Đã xác nhận', en: 'Confirmed', color: '#2196f3' },
    SHIPPING: { vi: 'Đang vận chuyển', en: 'Shipping', color: '#9c27b0' },
    DELIVERED: { vi: 'Đã giao', en: 'Delivered', color: '#4caf50' },
    CANCELLED: { vi: 'Đã hủy', en: 'Cancelled', color: '#f44336' },
};

export const OrdersPage = () => {
    const { isAuthenticated, isLoading } = useAuthContext();
    const { language } = useLanguage();
    const isVi = language === 'vi';
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Kiểm tra authentication
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

    const handleViewOrder = (orderId: string) => {
        navigate(`/orders/${orderId}`);
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

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.spinner}></div>
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
                <h1>{isVi ? 'Lịch sử đơn hàng' : 'Order History'}</h1>
            </div>

            {/* Messages */}
            {error && (
                <div className={styles.errorMessage}>
                    <FiAlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {orders.length === 0 ? (
                <section className={styles.emptyState}>
                    <FiPackage className={styles.emptyIcon} />
                    <h2>{isVi ? 'Bạn chưa có đơn hàng nào' : 'No orders yet'}</h2>
                    <p>
                        {isVi
                            ? 'Hãy khám phá các sản phẩm tuyệt vời của chúng tôi'
                            : 'Explore our amazing products'}
                    </p>
                    <button className={styles.primaryBtn} onClick={() => navigate('/products')}>
                        {isVi ? 'Bắt đầu mua sắm' : 'Start shopping'}
                    </button>
                </section>
            ) : (
                <section className={styles.ordersList}>
                    {orders.map((order) => {
                        const statusInfo = orderStatusLabels[order.status] || orderStatusLabels.PENDING;
                        const createdDate = new Date(order.createdAt);
                        const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

                        return (
                            <div key={order.orderId} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div>
                                        <h3 className={styles.orderId}>
                                            {isVi ? 'Mã đơn:' : 'Order ID:'} {order.orderId.substring(0, 12)}
                                        </h3>
                                        <p className={styles.orderDate}>
                                            {createdDate.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div
                                        className={styles.status}
                                        style={{ backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }}
                                    >
                                        <span style={{ color: statusInfo.color }}>
                                            {isVi ? statusInfo.vi : statusInfo.en}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.orderContent}>
                                    <div className={styles.itemsPreview}>
                                        <h4>{isVi ? 'Sản phẩm:' : 'Items:'}</h4>
                                        <div className={styles.itemList}>
                                            {order.items.slice(0, 2).map((item, idx) => (
                                                <div key={idx} className={styles.itemRow}>
                                                    <span>{item.productName}</span>
                                                    <span>x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className={styles.moreItems}>
                                                    +{order.items.length - 2} {isVi ? 'sản phẩm khác' : 'more items'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.orderInfo}>
                                        <div className={styles.infoRow}>
                                            <span>{isVi ? 'Người nhận:' : 'Recipient:'}</span>
                                            <strong>{order.shippingName}</strong>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span>{isVi ? 'Số điện thoại:' : 'Phone:'}</span>
                                            <strong>{order.shippingPhone}</strong>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span>{isVi ? 'Tổng:' : 'Total:'}</span>
                                            <strong className={styles.amount}>
                                                {order.totalAmount.toLocaleString('vi-VN')}₫
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.orderFooter}>
                                    <p className={styles.stats}>
                                        {totalQty} {isVi ? 'sản phẩm' : 'items'}
                                    </p>
                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => handleViewOrder(order.orderId)}
                                    >
                                        {isVi ? 'Xem chi tiết' : 'View Details'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}
        </div>
    );
};
