import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthContext } from '../../contexts/AuthContext';
import styles from './Header.module.css';
import {
    FaBars,
    FaTimes,
    FaHome,
    FaInfoCircle,
    FaBoxOpen,
    FaNewspaper,
    FaEnvelope,
    FaUser,
    FaSignOutAlt,
    FaShoppingCart
} from 'react-icons/fa';
import { SearchBox } from '../SearchBox';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { cartService } from '../../services/cartService';

interface HeaderProps {
    logoSrc?: string;
}

export const Header = ({ logoSrc }: HeaderProps) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { isAuthenticated, user, logout } = useAuthContext();

    // Fetch cart count
    useEffect(() => {
        const fetchCartCount = async () => {
            if (isAuthenticated) {
                try {
                    const cartItems = await cartService.getCart();
                    setCartCount(cartItems.length);
                } catch (error) {
                    console.error('Failed to fetch cart count:', error);
                }
            } else {
                setCartCount(0);
            }
        };

        fetchCartCount();
    }, [isAuthenticated]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            
            // Close mobile menu
            if (isMenuOpen && !target.closest(`.${styles.nav}`) && !target.closest(`.${styles.hamburger}`)) {
                setIsMenuOpen(false);
            }
            
            // Close product dropdown
            if (isProductsDropdownOpen && !target.closest(`.${styles.hasDropdown}`)) {
                setIsProductsDropdownOpen(false);
            }
            
            // Close user dropdown
            if (isUserDropdownOpen && !target.closest(`.${styles.userMenu}`)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, isProductsDropdownOpen, isUserDropdownOpen]);

    const handleSearch = (query: string) => {
        console.log('Searching for:', query);
        // TODO: Implement search functionality
        // Could filter products, blog posts, etc.
    };

    const handleScrollToSection = (href: string) => {
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };

    const handleHomeClick = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navItems = [
        { label: t('nav.home'), href: '/', icon: FaHome },
        {
            label: t('nav.products'),
            href: '#products',
            icon: FaBoxOpen,
            hasDropdown: true,
            dropdownItems: [
                { label: t('nav.products.drinks'), href: '/products/nuoc' },
                { label: t('nav.products.fertilizers'), href: '/products/phan' },
            ]
        },
        { label: t('nav.about'), href: '/about', icon: FaInfoCircle },
        { label: t('nav.blog'), href: '/blog', icon: FaNewspaper },
        { label: t('nav.faq'), href: '/faq', icon: FaInfoCircle },
        { label: t('nav.contact'), href: '/contact', icon: FaEnvelope },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.logo} onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                    {logoSrc ? (
                        <img src={logoSrc} alt="ORCHA Logo" />
                    ) : (
                        <div className={styles.logoText}>
                            <span className={styles.logoMain}>ORCHA</span>
                            <span className={styles.logoSub}>Nước Trái Cây Lên Men</span>
                        </div>
                    )}
                </div>

                <nav className={styles.desktopNav}>
                    <ul className={styles.desktopNavList}>
                        {navItems.map((item) => {
                            const isHome = item.href === '/';
                            const isProducts = item.href === '#products';
                            const isExternalLink = item.href.startsWith('#');
                            return (
                                <li
                                    key={item.label}
                                    className={item.hasDropdown ? styles.hasDropdown : ''}
                                    onMouseEnter={() => item.hasDropdown && setIsProductsDropdownOpen(true)}
                                    onMouseLeave={() => item.hasDropdown && setIsProductsDropdownOpen(false)}
                                >
                                    {isProducts ? (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsProductsDropdownOpen((prev) => !prev);
                                            }}
                                            className={styles.navLink}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
                                        >
                                            {item.label}
                                        </button>
                                    ) : isExternalLink ? (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleScrollToSection(item.href);
                                            }}
                                            className={styles.navLink}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
                                        >
                                            {item.label}
                                        </button>
                                    ) : isHome ? (
                                        <button
                                            onClick={handleHomeClick}
                                            className={styles.navLink}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
                                        >
                                            {item.label}
                                        </button>
                                    ) : (
                                        <Link to={item.href} className={styles.navLink}>
                                            {item.label}
                                        </Link>
                                    )}

                                    {item.hasDropdown && isProductsDropdownOpen && (
                                        <div className={styles.dropdown}>
                                            {item.dropdownItems?.map((drop) => (
                                                <Link
                                                    key={drop.href}
                                                    to={drop.href}
                                                    className={styles.dropdownItem}
                                                >
                                                    {drop.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Search Box */}
                <div className={styles.searchContainer}>
                    <SearchBox
                        onSearch={handleSearch}
                        placeholder={t('ui.search')}
                    />
                </div>

                {/* Language Switcher */}
                <div className={styles.languageContainer}>
                    <LanguageSwitcher />
                </div>

                {/* Cart Icon */}
                {isAuthenticated && (
                    <button 
                        className={styles.cartButton}
                        onClick={() => navigate('/checkout')}
                        title="Giỏ hàng"
                    >
                        <FaShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>{cartCount}</span>
                        )}
                    </button>
                )}

                {/* Auth Button */}
                <div className={styles.authContainer}>
                    {isAuthenticated && user ? (
                        <div
                            className={styles.userMenu}
                            onMouseEnter={() => setIsUserDropdownOpen(true)}
                            onMouseLeave={() => setIsUserDropdownOpen(false)}
                        >
                            <button className={styles.userAvatar}>
                                <FaUser size={14} />
                            </button>
                            {isUserDropdownOpen && (
                                <div className={styles.userDropdown}>
                                    <div className={styles.userInfo}>
                                        <span className={styles.userName}>{user.name || user.email}</span>
                                        <span className={styles.userEmail}>{user.email}</span>
                                    </div>
                                    <Link to="/auth" className={styles.dropdownItem} onClick={() => setIsUserDropdownOpen(false)}>
                                        <FaUser size={14} />
                                        <span>Tài khoản</span>
                                    </Link>
                                    <button className={styles.dropdownItem} onClick={logout} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        <FaSignOutAlt size={14} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth" className={styles.loginBtn}>
                            <FaUser size={14} />
                            <span>Đăng nhập</span>
                        </Link>
                    )}
                </div>

                {/* Hamburger Button */}
                <button
                    className={styles.hamburger}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Mobile Navigation */}
                <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                    <ul className={styles.navList}>
                        {navItems.map((item) => {
                            const isHome = item.href === '/';
                            const isProducts = item.href === '#products';
                            const isExternalLink = item.href.startsWith('#');
                            return (
                                <li key={item.label}>
                                    {isProducts ? (
                                        <div className={styles.mobileDropdown}>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsMobileProductsOpen((prev) => !prev);
                                                }}
                                                className={styles.navLink}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                                            >
                                                <item.icon className={styles.navIcon} />
                                                <span className={styles.navText}>{item.label}</span>
                                            </button>
                                            {isMobileProductsOpen && (
                                                <div className={styles.mobileDropdownList}>
                                                    {item.dropdownItems?.map((drop) => (
                                                        <Link
                                                            key={drop.href}
                                                            to={drop.href}
                                                            className={styles.mobileDropdownItem}
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            {drop.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : isExternalLink ? (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleScrollToSection(item.href);
                                                setIsMenuOpen(false);
                                            }}
                                            className={styles.navLink}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                                        >
                                            <item.icon className={styles.navIcon} />
                                            <span className={styles.navText}>{item.label}</span>
                                        </button>
                                    ) : isHome ? (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleHomeClick();
                                                setIsMenuOpen(false);
                                            }}
                                            className={styles.navLink}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                                        >
                                            <item.icon className={styles.navIcon} />
                                            <span className={styles.navText}>{item.label}</span>
                                        </button>
                                    ) : (
                                        <Link
                                            to={item.href}
                                            className={styles.navLink}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <item.icon className={styles.navIcon} />
                                            <span className={styles.navText}>{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
};
