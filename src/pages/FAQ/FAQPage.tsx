import { useState } from 'react';
import styles from './FAQPage.module.css';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category: string;
}

export const FAQPage = () => {
    const { t } = useLanguage();
    const [activeId, setActiveId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const faqData: FAQItem[] = [
        {
            id: 1,
            question: t('faq.q1'),
            answer: t('faq.a1'),
            category: 'product'
        },
        {
            id: 2,
            question: t('faq.q2'),
            answer: t('faq.a2'),
            category: 'health'
        },
        {
            id: 3,
            question: t('faq.q3'),
            answer: t('faq.a3'),
            category: 'usage'
        },
        {
            id: 4,
            question: t('faq.q4'),
            answer: t('faq.a4'),
            category: 'product'
        },
        {
            id: 5,
            question: t('faq.q5'),
            answer: t('faq.a5'),
            category: 'product'
        },
        {
            id: 6,
            question: t('faq.q6'),
            answer: t('faq.a6'),
            category: 'safety'
        },
        {
            id: 7,
            question: t('faq.q7'),
            answer: t('faq.a7'),
            category: 'usage'
        },
        {
            id: 8,
            question: t('faq.q8'),
            answer: t('faq.a8'),
            category: 'health'
        },
        {
            id: 9,
            question: t('faq.q9'),
            answer: t('faq.a9'),
            category: 'order'
        },
        {
            id: 10,
            question: t('faq.q10'),
            answer: t('faq.a10'),
            category: 'order'
        }
    ];

    const categories = [
        { value: 'all', label: t('faq.all') },
        { value: 'product', label: t('faq.product') },
        { value: 'health', label: t('faq.health') },
        { value: 'usage', label: t('faq.usage') },
        { value: 'safety', label: t('faq.safety') },
        { value: 'order', label: t('faq.order') }
    ];

    const toggleFAQ = (id: number) => {
        setActiveId(activeId === id ? null : id);
    };

    const filteredFAQs = faqData.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className={styles.faqPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('faq.title')}</h1>
                    <p className={styles.subtitle}>
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t('faq.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.categoryFilter}>
                        {categories.map(category => (
                            <button
                                key={category.value}
                                className={`${styles.categoryBtn} ${
                                    selectedCategory === category.value ? styles.active : ''
                                }`}
                                onClick={() => setSelectedCategory(category.value)}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.faqList}>
                    {filteredFAQs.length === 0 ? (
                        <div className={styles.noResults}>
                            <p>{t('faq.noResults')}</p>
                        </div>
                    ) : (
                        filteredFAQs.map(faq => (
                            <div
                                key={faq.id}
                                className={`${styles.faqItem} ${
                                    activeId === faq.id ? styles.active : ''
                                }`}
                            >
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => toggleFAQ(faq.id)}
                                    aria-expanded={activeId === faq.id}
                                >
                                    <span>{faq.question}</span>
                                    {activeId === faq.id ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                
                                <div className={`${styles.faqAnswer} ${
                                    activeId === faq.id ? styles.open : ''
                                }`}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.contactSection}>
                    <h3>{t('faq.noAnswer')}</h3>
                    <p>{t('faq.contactUs')}</p>
                    <div className={styles.contactButtons}>
                        <a href="/contact" className={styles.contactBtn}>
                            {t('faq.contactNow')}
                        </a>
                        <a href="tel:+84123456789" className={styles.phoneBtn}>
                            {t('faq.callHotline')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};