import { useState } from 'react';
import styles from './BlogPage.module.css';
import { ShareButtons } from '../../components/ShareButtons';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaCalendarAlt, FaUser, FaTag, FaArrowLeft } from 'react-icons/fa';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    author: string;
    category: string;
}

export const BlogPage = () => {
    const { t } = useLanguage();
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const blogPosts: BlogPost[] = [
        {
            id: 1,
            title: t('blog.post1.title'),
            excerpt: t('blog.post1.excerpt'),
            content: t('blog.post1.content'),
            date: '15/01/2026',
            author: 'ORCHA Team',
            category: t('blog.products')
        },
        {
            id: 2,
            title: t('blog.post2.title'),
            excerpt: t('blog.post2.excerpt'),
            content: t('blog.post2.content'),
            date: '10/01/2026',
            author: 'ORCHA Team',
            category: t('blog.guide')
        },
        {
            id: 3,
            title: t('blog.post3.title'),
            excerpt: t('blog.post3.excerpt'),
            content: t('blog.post3.content'),
            date: '05/01/2026',
            author: 'ORCHA Team',
            category: t('blog.process')
        },
        {
            id: 4,
            title: t('blog.post4.title'),
            excerpt: t('blog.post4.excerpt'),
            content: t('blog.post4.content'),
            date: '25/12/2025',
            author: 'ORCHA Team',
            category: t('blog.knowledge')
        }
    ];

    const categories = [t('blog.all'), t('blog.products'), t('blog.guide'), t('blog.process'), t('blog.knowledge')];
    const [selectedCategory, setSelectedCategory] = useState(t('blog.all'));

    const filteredPosts = selectedCategory === t('blog.all') 
        ? blogPosts 
        : blogPosts.filter(post => post.category === selectedCategory);

    if (selectedPost) {
        return (
            <div className={styles.blogPage}>
                <div className={styles.container}>
                    <button 
                        className={styles.backButton}
                        onClick={() => setSelectedPost(null)}
                    >
                        <FaArrowLeft />
                        {t('blog.backToList')}
                    </button>

                    <article className={styles.blogPost}>
                        <header className={styles.postHeader}>
                            <h1 className={styles.postTitle}>{selectedPost.title}</h1>
                            <div className={styles.postMeta}>
                                <span className={styles.metaItem}>
                                    <FaCalendarAlt />
                                    {selectedPost.date}
                                </span>
                                <span className={styles.metaItem}>
                                    <FaUser />
                                    {selectedPost.author}
                                </span>
                                <span className={styles.metaItem}>
                                    <FaTag />
                                    {selectedPost.category}
                                </span>
                            </div>
                        </header>

                        <div className={styles.postContent}>
                            <p>{selectedPost.content}</p>
                        </div>

                        <footer className={styles.postFooter}>
                            <ShareButtons
                                url={`${window.location.origin}/blog/${selectedPost.id}`}
                                title={selectedPost.title}
                            />
                        </footer>
                    </article>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.blogPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{t('blog.title')}</h1>
                    <p className={styles.subtitle}>
                        {t('blog.subtitle')}
                    </p>
                </header>

                <div className={styles.categoryFilter}>
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`${styles.categoryBtn} ${
                                selectedCategory === category ? styles.active : ''
                            }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className={styles.blogGrid}>
                    {filteredPosts.map(post => (
                        <article key={post.id} className={styles.blogCard}>
                            <div className={styles.cardContent}>
                                <div className={styles.cardMeta}>
                                    <span className={styles.category}>{post.category}</span>
                                    <span className={styles.date}>{post.date}</span>
                                </div>
                                <h2 className={styles.cardTitle}>{post.title}</h2>
                                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                                <button 
                                    className={styles.readMore}
                                    onClick={() => setSelectedPost(post)}
                                >
                                    {t('blog.readMore')}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};