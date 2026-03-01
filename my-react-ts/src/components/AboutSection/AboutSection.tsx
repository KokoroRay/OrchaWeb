import styles from './AboutSection.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

interface AboutSectionProps {
    leftImageSrc?: string;
    bottomImageSrc?: string;
}

export const AboutSection = ({
    leftImageSrc,
    bottomImageSrc,
}: AboutSectionProps) => {
    const { t } = useLanguage();
    
    return (
        <section id="about" className={styles.aboutSection}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Left Image */}
                    <div className={styles.leftImage}>
                        {leftImageSrc && (
                            <img src={leftImageSrc} alt="Orcha Product" />
                        )}
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        <h2 className={styles.title}>
                            {t('about.title')}
                        </h2>

                        <div className={styles.highlight}>
                            <p className={styles.tagline}>
                                {t('about.tagline')}
                            </p>
                        </div>

                        <p className={styles.description}>
                            {t('about.description')}
                        </p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <div className={styles.featureIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                                        <line x1="6" y1="1" x2="6" y2="4"/>
                                        <line x1="10" y1="1" x2="10" y2="4"/>
                                        <line x1="14" y1="1" x2="14" y2="4"/>
                                    </svg>
                                </div>
                                <div className={styles.featureContent}>
                                    <h3>{t('about.drinkTitle')}</h3>
                                    <p>{t('about.drinkDesc')}</p>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.featureIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22c4.97 0 9-4.03 9-9H3c0 4.97 4.03 9 9 9z"/>
                                        <path d="M12 2v2"/>
                                        <path d="M12 4c-3.87 0-7 3.13-7 7h14c0-3.87-3.13-7-7-7z"/>
                                        <circle cx="12" cy="11" r="1" fill="currentColor"/>
                                        <circle cx="8" cy="11" r="1" fill="currentColor"/>
                                        <circle cx="16" cy="11" r="1" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div className={styles.featureContent}>
                                    <h3>{t('about.fertTitle')}</h3>
                                    <p>{t('about.fertDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.values}>
                            <h3 className={styles.valuesTitle}>{t('about.whyFruit')}</h3>
                            <div className={styles.valueGrid}>
                                <div className={styles.valueItem}>
                                    <span className={styles.valueIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 2v6"/>
                                            <path d="M15 2v6"/>
                                            <path d="M12.5 2a8 8 0 0 1 7.5 10.5"/>
                                            <path d="M4 10.5A8 8 0 0 1 11.5 2"/>
                                            <path d="M20 14a8 8 0 1 1-16 0"/>
                                            <circle cx="12" cy="14" r="2"/>
                                        </svg>
                                    </span>
                                    <div>
                                        <strong>{t('about.technical')}</strong>
                                    </div>
                                </div>
                                <div className={styles.valueItem}>
                                    <span className={styles.valueIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 12h20"/>
                                            <path d="M12 2v20"/>
                                            <path d="M12 2a10 10 0 0 0 0 20"/>
                                            <path d="M12 2a10 10 0 0 1 0 20"/>
                                            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                                            <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                                        </svg>
                                    </span>
                                    <div>
                                        <strong>{t('about.supply')}</strong>
                                    </div>
                                </div>
                                <div className={styles.valueItem}>
                                    <span className={styles.valueIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                                            <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                                        </svg>
                                    </span>
                                    <div>
                                        <strong>{t('about.culture')}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.circularEconomy}>
                            <h3 className={styles.circularTitle}>{t('about.circularEconomy')}</h3>
                            <div className={styles.processFlow}>
                                <div className={styles.flowItem}>
                                    <span className={styles.flowIcon}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                                            <path d="M8 12h8"/>
                                            <path d="M12 8v8"/>
                                            <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                                            <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
                                        </svg>
                                    </span>
                                    <span className={styles.flowText}>{t('about.freshFruit')}</span>
                                </div>
                                <div className={styles.flowArrow}>→</div>
                                <div className={styles.flowItem}>
                                    <span className={styles.flowIcon}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                                            <line x1="6" y1="1" x2="6" y2="4"/>
                                            <line x1="10" y1="1" x2="10" y2="4"/>
                                            <line x1="14" y1="1" x2="14" y2="4"/>
                                        </svg>
                                    </span>
                                    <span className={styles.flowText}>{t('about.fermentedDrink')}</span>
                                </div>
                                <div className={styles.flowArrow}>+</div>
                                <div className={styles.flowItem}>
                                    <span className={styles.flowIcon}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                                            <path d="M8 12h8"/>
                                            <path d="M12 8v8"/>
                                        </svg>
                                    </span>
                                    <span className={styles.flowText}>{t('about.bioFertilizer')}</span>
                                </div>
                            </div>
                            <p className={styles.circularDesc}>
                                {t('about.circularDesc')}
                            </p>
                        </div>

                        <div className={styles.ctaSection}>
                            <button className={styles.ctaButton}>{t('about.exploreProcess')}</button>
                        </div>

                        {bottomImageSrc && (
                            <div className={styles.bottomImage}>
                                <img src={bottomImageSrc} alt="Orcha Process" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
