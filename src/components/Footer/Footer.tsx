import styles from './Footer.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiFacebook, FiInstagram, FiMail, FiMapPin, FiMessageCircle, FiPhone, FiYoutube } from 'react-icons/fi';
// 1. Import các icon cần thiết

interface FooterProps {
    logoSrc?: string;
}

export const Footer = ({ logoSrc }: FooterProps) => {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Section */}
                    <div className={styles.brandSection}>
                        <div className={styles.logo}>
                            {logoSrc ? (
                                <img src={logoSrc} alt="ORCHA Logo" className={styles.footerLogo} />
                            ) : (
                                <h3 className={styles.brandName}>{t('footer.brandName')}</h3>
                            )}
                        </div>
                        <p className={styles.brandTagline}>{t('footer.brandTagline')}</p>
                        <p className={styles.description}>
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links - Mở rộng menu */}
                    <div className={styles.linksSection}>
                        <h4 className={styles.sectionTitle}>{t('footer.quickLinksTitle')}</h4>
                        <ul className={styles.linksList}>
                            <li><a href="#products" className={styles.link}>{t('footer.products')}</a></li>
                            <li><a href="#about" className={styles.link}>{t('footer.aboutUs')}</a></li>
                            <li><a href="#favorites" className={styles.link}>{t('footer.favorites')}</a></li>
                            <li><a href="#store" className={styles.link}>{t('footer.store')}</a></li>

                            <li><a href="#contact" className={styles.link}>{t('footer.contactLink')}</a></li>
                        </ul>
                    </div>

                    {/* Contact Info - Đã thay icon */}
                    <div className={styles.contactSection}>
                        <h4 className={styles.sectionTitle}>{t('footer.contactTitle')}</h4>
                        <ul className={styles.contactList}>
                            <li className={styles.contactItem}>
                                <span className={styles.contactIcon}><FiMapPin /></span>
                                <span>{t('footer.location')}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <span className={styles.contactIcon}><FiMail /></span>
                                <span>{t('footer.email')}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <span className={styles.contactIcon}><FiPhone /></span>
                                <span>{t('footer.phone')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links - Đã thay icon */}
                    <div className={styles.socialSection}>
                        <h4 className={styles.sectionTitle}>{t('footer.followUs')}</h4>
                        <div className={styles.socialLinks}>
                            <a href="https://www.facebook.com/share/1AEXvfrQcV/?mibextid=wwXIfr" className={styles.socialLink} aria-label="Facebook">
                                <span className={styles.socialIcon}><FiFacebook /></span>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Instagram">
                                <span className={styles.socialIcon}><FiInstagram /></span>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="YouTube">
                                <span className={styles.socialIcon}><FiYoutube /></span>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Zalo">
                                <span className={styles.socialIcon}><FiMessageCircle /></span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.divider}></div>

                {/* Bottom Section */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>{t('footer.copyright').replace('{year}', currentYear.toString())}</p>
                    <p className={styles.credits}>{t('footer.madeWith')}</p>
                </div>
            </div>
        </footer>
    );
};