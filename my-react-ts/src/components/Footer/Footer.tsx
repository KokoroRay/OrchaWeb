import styles from './Footer.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
// 1. Import các icon cần thiết
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { MdLocationOn, MdEmail, MdPhone } from 'react-icons/md';

export const Footer = () => {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Section - Cập nhật text */}
                    <div className={styles.brandSection}>
                        <h3 className={styles.brandName}>{t('footer.brandName')}</h3>
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
                            <li><a href="#blog" className={styles.link}>{t('footer.blog')}</a></li>
                            <li><a href="#contact" className={styles.link}>{t('footer.contactLink')}</a></li>
                        </ul>
                    </div>

                    {/* Contact Info - Đã thay icon */}
                    <div className={styles.contactSection}>
                        <h4 className={styles.sectionTitle}>{t('footer.contactTitle')}</h4>
                        <ul className={styles.contactList}>
                            <li className={styles.contactItem}>
                                <span className={styles.contactIcon}><MdLocationOn /></span>
                                <span>{t('footer.location')}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <span className={styles.contactIcon}><MdEmail /></span>
                                <span>{t('footer.email')}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <span className={styles.contactIcon}><MdPhone /></span>
                                <span>{t('footer.phone')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links - Đã thay icon */}
                    <div className={styles.socialSection}>
                        <h4 className={styles.sectionTitle}>{t('footer.followUs')}</h4>
                        <div className={styles.socialLinks}>
                            <a href="https://www.facebook.com/share/1AEXvfrQcV/?mibextid=wwXIfr" className={styles.socialLink} aria-label="Facebook">
                                <span className={styles.socialIcon}><FaFacebookF /></span>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Instagram">
                                <span className={styles.socialIcon}><FaInstagram /></span>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="YouTube">
                                <span className={styles.socialIcon}><FaYoutube /></span>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Zalo">
                                <span className={styles.socialIcon}><SiZalo /></span>
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