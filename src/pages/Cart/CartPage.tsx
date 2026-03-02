import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cartService, type CartItemWithProduct } from '../../services/cartService';
import styles from './CartPage.module.css';

export const CartPage = () => {
    const { isAuthenticated, isLoading } = useAuthContext();
    const { language } = useLanguage();
    const isVi = language === 'vi';
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [processingCheckout, setProcessingCheckout] = useState(false);

    // Kiểm tra authentication
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Load cart items
    const loadCart = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const items = await cartService.getCart();
            setCartItems(items);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi khi tải giỏ hàng';
            setError(message);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        }
    }, [isAuthenticated, loadCart]);

    // Xóa sản phẩm khỏi giỏ hàng
    const handleRemoveItem = useCallback(async (productId: string) => {
        setUpdatingItems((prev) => new Set([...prev, productId]));
        setError('');
        setSuccess('');
        try {
            await cartService.removeItem(productId);
            setCartItems((prev) => prev.filter((item) => item.productId !== productId));
            setSuccess(isVi ? 'Đã xóa sản phẩm khỏi giỏ hàng' : 'Product removed from cart');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi khi xóa sản phẩm';
            setError(message);
        } finally {
            setUpdatingItems((prev) => {
                const updated = new Set(prev);
                updated.delete(productId);
                return updated;
            });
        }
    }, [isVi]);

    // Cập nhật số lượng sản phẩm
    const handleUpdateQuantity = useCallback(async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            await handleRemoveItem(productId);
            return;
        }

        setUpdatingItems((prev) => new Set([...prev, productId]));
        setError('');
        setSuccess('');
        try {
            await cartService.updateItem({
                productId,
                quantity: newQuantity,
            });
            setCartItems((prev) =>
                prev.map((item) =>
                    item.productId === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật giỏ hàng';
            setError(message);
            // Reload cart on error
            loadCart();
        } finally {
            setUpdatingItems((prev) => {
                const updated = new Set(prev);
                updated.delete(productId);
                return updated;
            });
        }
    }, [handleRemoveItem, loadCart, isVi]);

    // Tính toán tổng tiền
    const totalPrice = cartItems.reduce((sum, item) => {
        const price = item.salePrice || item.price;
        return sum + price * item.quantity;
    }, 0);

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            setError(isVi ? 'Giỏ hàng trống' : 'Cart is empty');
            return;
        }

        setProcessingCheckout(true);
        navigate('/checkout', { state: { fromCart: true } });
    };

    // Nếu chưa đăng nhập
    if (!isAuthenticated && !isLoading) {
        return (
            <div className={styles.container}>
                <section className={styles.emptyCart}>
                    <FiShoppingCart className={styles.emptyIcon} />
                    <h2>{isVi ? 'Vui lòng đăng nhập' : 'Please log in'}</h2>
                    <p>{isVi ? 'Bạn cần đăng nhập để xem giỏ hàng của mình' : 'You need to log in to view your cart'}</p>
                    <button className={styles.primaryBtn} onClick={() => navigate('/auth')}>
                        {isVi ? 'Đăng nhập' : 'Log in'}
                    </button>
                </section>
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
                <button className={styles.backBtn} onClick={() => navigate('/products')}>
                    <FiArrowLeft /> {isVi ? 'Tiếp tục mua sắm' : 'Continue shopping'}
                </button>
                <h1>{isVi ? 'Giỏ hàng của bạn' : 'Your Cart'}</h1>
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

            {cartItems.length === 0 ? (
                <section className={styles.emptyCart}>
                    <FiShoppingCart className={styles.emptyIcon} />
                    <h2>{isVi ? 'Giỏ hàng của bạn trống' : 'Your cart is empty'}</h2>
                    <p>
                        {isVi
                            ? 'Khám phá các sản phẩm tuyệt vời của chúng tôi ngay bây giờ'
                            : 'Explore our amazing products'}
                    </p>
                    <button className={styles.primaryBtn} onClick={() => navigate('/products')}>
                        {isVi ? 'Tiếp tục mua sắm' : 'Continue shopping'}
                    </button>
                </section>
            ) : (
                <div className={styles.cartContent}>
                    {/* Items list */}
                    <section className={styles.itemsSection}>
                        <h2>{isVi ? 'Sản phẩm' : 'Products'}</h2>
                        <div className={styles.itemsList}>
                            {cartItems.map((item) => (
                                <div key={item.productId} className={styles.cartItem}>
                                    {/* Product image */}
                                    <div className={styles.itemImage}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                <FiShoppingCart />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product info */}
                                    <div className={styles.itemInfo}>
                                        <h3 className={styles.itemName}>{item.productName}</h3>
                                        <p className={styles.itemPrice}>
                                            {item.salePrice ? (
                                                <>
                                                    <span className={styles.salePrice}>
                                                        {item.salePrice.toLocaleString('vi-VN')}₫
                                                    </span>
                                                    <span className={styles.originalPrice}>
                                                        {item.price.toLocaleString('vi-VN')}₫
                                                    </span>
                                                </>
                                            ) : (
                                                <span className={styles.salePrice}>
                                                    {item.price.toLocaleString('vi-VN')}₫
                                                </span>
                                            )}
                                        </p>
                                        <p className={styles.itemStock}>
                                            {isVi ? 'Có sẵn:' : 'Available:'} {item.stock}
                                        </p>
                                    </div>

                                    {/* Quantity controls */}
                                    <div className={styles.quantityControl}>
                                        <button
                                            className={styles.quantityBtn}
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                            disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className={styles.quantity}>{item.quantity}</span>
                                        <button
                                            className={styles.quantityBtn}
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                            disabled={
                                                updatingItems.has(item.productId) ||
                                                item.quantity >= item.stock
                                            }
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>

                                    {/* Subtotal */}
                                    <div className={styles.itemSubtotal}>
                                        <p className={styles.subtotalLabel}>
                                            {isVi ? 'Tổng:' : 'Total:'}
                                        </p>
                                        <p className={styles.subtotalPrice}>
                                            {((item.salePrice || item.price) * item.quantity).toLocaleString(
                                                'vi-VN'
                                            )}₫
                                        </p>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleRemoveItem(item.productId)}
                                        disabled={updatingItems.has(item.productId)}
                                        title={isVi ? 'Xóa sản phẩm' : 'Remove product'}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Summary */}
                    <section className={styles.summary}>
                        <h2>{isVi ? 'Tóm tắt' : 'Summary'}</h2>

                        <div className={styles.summaryRow}>
                            <span>{isVi ? 'Số sản phẩm:' : 'Items:'}</span>
                            <span>{cartItems.length}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>{isVi ? 'Tổng số lượng:' : 'Total Qty:'}</span>
                            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.summaryTotal}>
                            <span>{isVi ? 'Tổng tiền:' : 'Total:'}</span>
                            <span className={styles.totalAmount}>{totalPrice.toLocaleString('vi-VN')}₫</span>
                        </div>

                        <button
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                            disabled={processingCheckout || cartItems.length === 0}
                        >
                            {processingCheckout
                                ? isVi
                                    ? 'Đang xử lý...'
                                    : 'Processing...'
                                : isVi
                                  ? 'Tiến hành thanh toán'
                                  : 'Proceed to checkout'}
                        </button>

                        <button
                            className={styles.continueShopping}
                            onClick={() => navigate('/products')}
                        >
                            {isVi ? 'Tiếp tục mua sắm' : 'Continue shopping'}
                        </button>
                    </section>
                </div>
            )}
        </div>
    );
};
