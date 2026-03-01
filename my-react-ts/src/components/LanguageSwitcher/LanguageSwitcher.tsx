import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

interface Language {
    code: string;
    name: string;
    flag: string;
}

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const languages: Language[] = [
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
    ];

    const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

    const handleLanguageChange = (langCode: string) => {
        if (langCode === language) return;
        
        setLanguage(langCode);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest(`.${styles.languageSwitcher}`)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.languageSwitcher}>
            <button
                className={styles.languageButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change language"
                aria-expanded={isOpen}
            >
                <span className={styles.flagIcon}>{currentLanguage.flag}</span>
                <span className={styles.languageCode}>{currentLanguage.code.toUpperCase()}</span>
                <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
            </button>
            
            {isOpen && (
                <div className={styles.dropdown}>
                    <ul className={styles.languageList}>
                        {languages.map((lang) => (
                            <li key={lang.code}>
                                <button
                                    className={`${styles.languageOption} ${
                                        language === lang.code ? styles.active : ''
                                    }`}
                                    onClick={() => handleLanguageChange(lang.code)}
                                >
                                    <span className={styles.flagIcon}>{lang.flag}</span>
                                    <span className={styles.languageName}>{lang.name}</span>
                                    {language === lang.code && (
                                        <span className={styles.checkmark}>✓</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};