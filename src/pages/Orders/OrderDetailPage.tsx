import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiPackage } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { orderService, type Order } from '../../services/orderService';
import styles from './OrderDetailPage.module.css';

const orderStatusLabels: Record<string, { vi: string; en: string; color: string }> = {
    PENDING: { vi: 'Chờ xác nhận', en: 'Pending', color: '#ff9800' },
    CONFIRMED: { vi: 'Đã xác nhận', en: 'Confirmed', color: '#2196f3' },
    SHIPPING: { vi: 'Đang vận chuyển', en: 'Shipping', color: '#9c27b0' },
    DELIVERED: { vi: 'Đã giao', en: 'Delivered', color: '#4caf50' },
    CANCELLED: { vi: 'Đã hủy', en: 'Cancelled', color: '#f44336' },
};

const orderStatusSteps = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

export const OrderDetailPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { isAuthenticated, isLoading } = useAuthContext();
    const { language } = useLanguage();
    const isVi = language === 'vi';
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Kiểm tra authentication
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Load order detail
    useEffect(() => {
        const loadOrder = async () => {
            if (!orderId) return;

            try {
                setLoading(true);
                setError('');
                const data = await orderService.getById(orderId);
                setOrder(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : (isVi ? 'Lỗi khi tải chi tiết đơn hàng' : 'Error loading order details');
                setError(message);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && orderId) {
            loadOrder();
        }
    }, [isAuthenticated, orderId, isVi]);

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

    if (!order) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate('/orders')}>
                        <FiArrowLeft /> {isVi ? 'Quay lại lịch sử' : 'Back to orders'}
                    </button>
                </div>
                {error && (
                    <div className={styles.errorMessage}>
                        <FiAlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}
                <div className={styles.emptyState}>
                    <FiPackage className={styles.emptyIcon} />
                    <h2>{isVi ? 'Không tìm thấy đơn hàng' : 'Order not found'}</h2>
                </div>
            </div>
        );
    }

    const statusInfo = orderStatusLabels[order.status] || orderStatusLabels.PENDING;
    const createdDate = new Date(order.createdAt);
    const updatedDate = new Date(order.updatedAt);
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const currentStepIndex = orderStatusSteps.indexOf(order.status);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/orders')}>
                    <FiArrowLeft /> {isVi ? 'Quay lại lịch sử' : 'Back to orders'}
                </button>
                <h1>{isVi ? 'Chi tiết đơn hàng' : 'Order Details'}</h1>
            </div>

            <div className={styles.content}>
                {/* Status section */}
                <section className={styles.statusSection}>
                    <div className={styles.statusCard}>
                        <div className={styles.statusHeader}>
                            <div>
                                <h2>{isVi ? 'Trạng thái đơn hàng' : 'Order Status'}</h2>
                                <p>
                                    {isVi ? 'Mã đơn:' : 'Order ID:'} {order.orderId}
                                </p>
                            </div>
                            <div
                                className={styles.statusBadge}
                                style={{ backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }}
                            >
                                <span style={{ color: statusInfo.color }}>
                                    {isVi ? statusInfo.vi : statusInfo.en}
                                </span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className={styles.timeline}>
                            {orderStatusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const stepInfo = orderStatusLabels[step];

                                return (
                                    <div key={step} className={`${styles.timelineItem} ${isCompleted ? styles.completed : ''}`}>
                                        <div
                                            className={styles.timelineDot}
                                            style={{
                                                backgroundColor: isCompleted ? stepInfo.color : '#e0e0e0',
                                                boxShadow: isCurrent ? `0 0 0 4px ${stepInfo.color}40` : 'none',
                                            }}
                                        ></div>
                                        <div className={styles.timelineLabel}>
                                            {isVi ? stepInfo.vi : stepInfo.en}
                                        </div>
                                        {index < orderStatusSteps.length - 1 && (
                                            <div
                                                className={styles.timelineConnector}
                                                style={{
                                                    backgroundColor: isCompleted ? orderStatusLabels[orderStatusSteps[index + 1]].color : '#e0e0e0',
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className={styles.twoColumn}>
                    {/* Items section */}
                    <section className={styles.section}>
                        <h2>{isVi ? 'Sản phẩm' : 'Products'}</h2>
                        <div className={styles.itemsList}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.itemCard}>
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.productName} className={styles.itemImage} />
                                    )}
                                    <div className={styles.itemInfo}>
                                        <h3 className={styles.itemName}>{item.productName}</h3>
                                        <p className={styles.itemPrice}>
                                            {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                                        </p>
                                    </div>
                                    <p className={styles.itemSubtotal}>
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.itemsTotal}>
                            <p className={styles.totalRow}>
                                <span>{isVi ? 'Tổng số sản phẩm:' : 'Total Items:'}</span>
                                <strong>{order.items.length}</strong>
                            </p>
                            <p className={styles.totalRow}>
                                <span>{isVi ? 'Tổng số lượng:' : 'Total Quantity:'}</span>
                                <strong>{totalQty}</strong>
                            </p>
                        </div>
                    </section>

                    {/* Shipping & Payment section */}
                    <section className={styles.section}>
                        <h2>{isVi ? 'Thông tin giao hàng' : 'Shipping Information'}</h2>
                        <div className={styles.infoBox}>
                            <div className={styles.infoItem}>
                                <label>{isVi ? 'Người nhận:' : 'Recipient:'}</label>
                                <p>{order.shippingName}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>{isVi ? 'Số điện thoại:' : 'Phone:'}</label>
                                <p>{order.shippingPhone}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>{isVi ? 'Địa chỉ:' : 'Address:'}</label>
                                <p>{order.shippingAddress}</p>
                            </div>
                            {order.note && (
                                <div className={styles.infoItem}>
                                    <label>{isVi ? 'Ghi chú:' : 'Notes:'}</label>
                                    <p>{order.note}</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.divider}></div>

                        <h2 style={{ marginTop: '2rem' }}>{isVi ? 'Tổng cộng' : 'Payment Summary'}</h2>
                        <div className={styles.summary}>
                            <p className={styles.summaryRow}>
                                <span>{isVi ? 'Tổng tiền:' : 'Total:'}</span>
                                <strong className={styles.amount}>{order.totalAmount.toLocaleString('vi-VN')}₫</strong>
                            </p>
                        </div>
                    </section>
                </div>

                {/* Timeline info */}
                <section className={styles.section}>
                    <h2>{isVi ? 'Lịch sử cập nhật' : 'Timeline'}</h2>
                    <div className={styles.infoBox}>
                        <div className={styles.infoItem}>
                            <label>{isVi ? 'Thời gian tạo:' : 'Created:'}</label>
                            <p>
                                {createdDate.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>{isVi ? 'Cập nhật lần cuối:' : 'Updated:'}</label>
                            <p>
                                {updatedDate.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={() => navigate('/products')}>
                        {isVi ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => navigate('/orders')}>
                        {isVi ? 'Quay lại lịch sử' : 'Back to Orders'}
                    </button>
                </div>
            </div>
        </div>
    );
};
