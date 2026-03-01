import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch, FiMapPin } from 'react-icons/fi';
import { LoadingSpinner } from '../LoadingSpinner';
import styles from './NotFound.module.css';

export const NotFound = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Animated 404 Number */}
                <div className={styles.errorNumber}>
                    <span className={styles.digit}>4</span>
                    <div className={styles.digitZero}>
                        <div className={styles.loadingContainer}>
                            <LoadingSpinner size="large" color="primary" text="" />
                        </div>
                    </div>
                    <span className={styles.digit}>4</span>
                </div>

                {/* Error Message */}
                <div className={styles.messageGroup}>
                    <h1 className={styles.title}>Trang không tìm thấy</h1>
                    <p className={styles.subtitle}>
                        Rất tiếc! Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                    </p>
                </div>

                {/* Suggestions */}
                <div className={styles.suggestions}>
                    <h3 className={styles.suggestionsTitle}>Có thể bạn muốn:</h3>
                    <div className={styles.suggestionGrid}>
                        <Link to="/OrchaWeb" className={styles.suggestionCard}>
                            <FiHome size={24} />
                            <span>Về trang chủ</span>
                        </Link>
                        <Link to="/products" className={styles.suggestionCard}>
                            <FiSearch size={24} />
                            <span>Xem sản phẩm ORCHA</span>
                        </Link>
                        <Link to="/about" className={styles.suggestionCard}>
                            <FiMapPin size={24} />
                            <span>Giới thiệu ORCHA</span>
                        </Link>
                        <button onClick={() => window.history.back()} className={styles.suggestionCard}>
                            <FiArrowLeft size={24} />
                            <span>Quay lại trang trước</span>
                        </button>
                    </div>
                </div>

                {/* Popular Links */}
                <div className={styles.popularLinks}>
                    <h4 className={styles.popularTitle}>Trang phổ biến:</h4>
                    <div className={styles.linkList}>
                        <Link to="/products" className={styles.link}>Sản phẩm</Link>
                        <Link to="/about" className={styles.link}>Giới thiệu</Link>
                        <Link to="/contact" className={styles.link}>Liên hệ</Link>
                        <Link to="/news" className={styles.link}>Tin tức</Link>
                    </div>
                </div>

                {/* ORCHA Branding */}
                <div className={styles.brandingFooter}>
                    <p className={styles.brandingText}>
                        © 2026 ORCHA - Nước Trái Cây Lên Men Tự Nhiên
                    </p>
                </div>
            </div>

            {/* Background Animation */}
            <div className={styles.backgroundAnimation}>
                <div className={styles.floatingElement}></div>
                <div className={styles.floatingElement}></div>
                <div className={styles.floatingElement}></div>
                <div className={styles.floatingElement}></div>
                <div className={styles.floatingElement}></div>
            </div>
        </div>
    );
};