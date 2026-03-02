import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiLoader, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cartService, type CartItemWithProduct } from '../../services/cartService';
import { orderService, type CreateOrderInput } from '../../services/orderService';
import { paymentService, type PaymentMethod } from '../../services/paymentService';
import styles from './CheckoutPage.module.css';

export const CheckoutPage = () => {
    const { user, isAuthenticated } = useAuthContext();
    const { language } = useLanguage();
    const isVi = language === 'vi';
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('COD');

    const [formData, setFormData] = useState({
        shippingName: user?.name || '',
        shippingPhone: '',
        shippingAddress: '',
        note: '',
    });

    const availablePaymentMethods = paymentService.getAvailableMethods();

    // Kiểm tra authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    // Load cart items
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                const items = await cartService.getCart();
                if (items.length === 0) {
                    setError(isVi ? 'Giỏ hàng trống' : 'Cart is empty');
                }
                setCartItems(items);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Lỗi khi tải giỏ hàng';
                setError(message);
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            loadCart();
        }
    }, [isAuthenticated, isVi]);

    // Form input handler
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // Calculate total
    const totalPrice = cartItems.reduce((sum, item) => {
        const price = item.salePrice || item.price;
        return sum + price * item.quantity;
    }, 0);

    // Form validation
    const isFormValid =
        formData.shippingName.trim() !== '' &&
        formData.shippingPhone.trim() !== '' &&
        formData.shippingAddress.trim() !== '';

    // Submit order
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid || cartItems.length === 0) {
            setError(isVi ? 'Vui lòng điền đủ thông tin giao hàng' : 'Please fill in all shipping information');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const orderInput: CreateOrderInput = {
                shippingName: formData.shippingName.trim(),
                shippingPhone: formData.shippingPhone.trim(),
                shippingAddress: formData.shippingAddress.trim(),
                note: formData.note.trim(),
            };

            const order = await orderService.create(orderInput);

            // Handle payment based on selected method
            if (selectedPayment === 'PAYOS') {
                // Create PayOS payment
                const paymentInfo = {
                    method: 'PAYOS' as PaymentMethod,
                    amount: totalPrice,
                    orderId: order.orderId,
                    customerName: formData.shippingName,
                    customerPhone: formData.shippingPhone,
                    customerAddress: formData.shippingAddress,
                };

                const paymentResponse = await paymentService.createPayOSPayment(paymentInfo);

                // Clear cart before redirecting to payment
                await cartService.clearCart(cartItems);

                // Redirect to PayOS payment page
                window.location.href = paymentResponse.paymentUrl;
                return;
            } else {
                // COD payment - just create order
                await paymentService.processCOD({
                    method: 'COD',
                    amount: totalPrice,
                    orderId: order.orderId,
                    customerName: formData.shippingName,
                    customerPhone: formData.shippingPhone,
                    customerAddress: formData.shippingAddress,
                });
            }

            // Clear cart after successful checkout
            await cartService.clearCart(cartItems);

            setSuccess(
                isVi
                    ? `Đơn hàng của bạn đã được tạo thành công! Mã đơn: ${order.orderId.substring(0, 8)}`
                    : `Order created successfully! Order ID: ${order.orderId.substring(0, 8)}`
            );

            // Redirect to order detail after 2 seconds
            setTimeout(() => {
                navigate(`/orders/${order.orderId}`);
            }, 2000);
        } catch (err) {
            const message = err instanceof Error ? err.message : (isVi ? 'Lỗi khi tạo đơn hàng' : 'Error creating order');
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (cartItems.length === 0 || !isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate('/cart')}>
                        <FiArrowLeft /> {isVi ? 'Quay lại giỏ hàng' : 'Back to cart'}
                    </button>
                </div>
                <div className={styles.emptyState}>
                    <FiAlertCircle className={styles.emptyIcon} />
                    <h2>{isVi ? 'Không có sản phẩm để thanh toán' : 'No items to checkout'}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/cart')}>
                    <FiArrowLeft /> {isVi ? 'Quay lại giỏ hàng' : 'Back to cart'}
                </button>
                <h1>{isVi ? 'Thanh toán' : 'Checkout'}</h1>
            </div>

            {/* Messages */}
            {error && (
                <div className={styles.errorMessage}>
                    <FiAlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className={styles.successMessage}>
                    <FiCheckCircle size={16} />
                    <span>{success}</span>
                </div>
            )}

            <div className={styles.checkoutContent}>
                {/* Form section */}
                <section className={styles.formSection}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2>{isVi ? 'Thông tin giao hàng' : 'Shipping Information'}</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{isVi ? 'Tên người nhận' : 'Recipient Name'}</label>
                            <input
                                type="text"
                                name="shippingName"
                                className={styles.input}
                                placeholder={isVi ? 'Nhập tên người nhận' : 'Enter recipient name'}
                                value={formData.shippingName}
                                onChange={handleInputChange}
                                disabled={submitting}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{isVi ? 'Số điện thoại' : 'Phone Number'}</label>
                            <input
                                type="tel"
                                name="shippingPhone"
                                className={styles.input}
                                placeholder={isVi ? 'Nhập số điện thoại' : 'Enter phone number'}
                                value={formData.shippingPhone}
                                onChange={handleInputChange}
                                disabled={submitting}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{isVi ? 'Địa chỉ giao hàng' : 'Shipping Address'}</label>
                            <textarea
                                name="shippingAddress"
                                className={styles.textarea}
                                placeholder={
                                    isVi
                                        ? 'Nhập địa chỉ giao hàng đầy đủ'
                                        : 'Enter complete shipping address'
                                }
                                value={formData.shippingAddress}
                                onChange={handleInputChange}
                                disabled={submitting}
                                rows={3}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                {isVi ? 'Ghi chú thêm (tùy chọn)' : 'Additional Notes (optional)'}
                            </label>
                            <textarea
                                name="note"
                                className={styles.textarea}
                                placeholder={
                                    isVi
                                        ? 'Nhập ghi chú thêm (ví dụ: hướng dẫn giao hàng, yêu cầu đặc biệt, v.v.)'
                                        : 'Enter additional notes'
                                }
                                value={formData.note}
                                onChange={handleInputChange}
                                disabled={submitting}
                                rows={2}
                            />
                        </div>

                        {/* Payment Method Selection */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                {isVi ? 'Phương thức thanh toán' : 'Payment Method'}
                            </label>
                            <div className={styles.paymentMethods}>
                                {availablePaymentMethods.map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        className={`${styles.paymentMethod} ${selectedPayment === method ? styles.paymentMethodActive : ''}`}
                                        onClick={() => setSelectedPayment(method)}
                                        disabled={submitting}
                                    >
                                        <div className={styles.paymentIcon}>
                                            {method === 'COD' ? <FiDollarSign size={24} /> : <FiCreditCard size={24} />}
                                        </div>
                                        <div className={styles.paymentInfo}>
                                            <div className={styles.paymentTitle}>
                                                {paymentService.getMethodLabel(method, isVi ? 'vi' : 'en')}
                                            </div>
                                            <div className={styles.paymentDesc}>
                                                {paymentService.getMethodDescription(method, isVi ? 'vi' : 'en')}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={!isFormValid || submitting}
                        >
                            {submitting ? (
                                <>
                                    <FiLoader className={styles.spinner} />
                                    {isVi ? 'Đang xử lý...' : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    {selectedPayment === 'COD' ? (
                                        isVi ? '📦 Đặt hàng COD' : '📦 Place COD Order'
                                    ) : (
                                        isVi ? '💳 Thanh toán Online' : '💳 Pay Online'
                                    )}
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Order summary section */}
                <section className={styles.summarySection}>
                    <h2>{isVi ? 'Tóm tắt đơn hàng' : 'Order Summary'}</h2>

                    {/* Items */}
                    <div className={styles.itemsList}>
                        {cartItems.map((item) => (
                            <div key={item.productId} className={styles.summaryItem}>
                                {item.imageUrl && (
                                    <img src={item.imageUrl} alt={item.productName} className={styles.itemImage} />
                                )}
                                <div className={styles.itemDetails}>
                                    <p className={styles.itemName}>{item.productName}</p>
                                    <p className={styles.itemQty}>
                                        {isVi ? 'Số lượng:' : 'Qty:'} {item.quantity}
                                    </p>
                                </div>
                                <p className={styles.itemPrice}>
                                    {((item.salePrice || item.price) * item.quantity).toLocaleString('vi-VN')}₫
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.divider}></div>

                    {/* Totals */}
                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span>{isVi ? 'Tổng số sản phẩm:' : 'Total Items:'}</span>
                            <span>{cartItems.length}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>{isVi ? 'Tổng số lượng:' : 'Total Qty:'}</span>
                            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.totalAmount}>
                            <span>{isVi ? 'Tổng tiền:' : 'Total:'}</span>
                            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
                        </div>
                    </div>

                    {/* Shipping info box */}
                    <div className={styles.infoBox}>
                        <h3>{isVi ? 'Thông tin giao hàng' : 'Shipping Info'}</h3>
                        <div className={styles.infoContent}>
                            <p>
                                <strong>{isVi ? 'Người nhận:' : 'Recipient:'}</strong>
                                <span>{formData.shippingName || '---'}</span>
                            </p>
                            <p>
                                <strong>{isVi ? 'Số điện thoại:' : 'Phone:'}</strong>
                                <span>{formData.shippingPhone || '---'}</span>
                            </p>
                            <p>
                                <strong>{isVi ? 'Địa chỉ:' : 'Address:'}</strong>
                                <span>{formData.shippingAddress || '---'}</span>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
