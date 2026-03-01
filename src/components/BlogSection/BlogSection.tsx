import { useState, useRef } from 'react';
import styles from './BlogSection.module.css';
import { OptimizedImage } from '../OptimizedImage';
import { ShareButtons } from '../ShareButtons';
import { useLanguage } from '../../contexts/LanguageContext';

interface BlogPost {
    id: number;
    imageSrc?: string;
    title: string;
    excerpt?: string;
    date?: string;
}

export const BlogSection = () => {
    const { t } = useLanguage();
    // State management cho active blog
    const [activeIndex, setActiveIndex] = useState<number>(0);

    // Ref để quản lý scroll container
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const blogRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Danh sách blog posts - có thể thay bằng data thật
    const blogPosts: BlogPost[] = [
        {
            id: 1,
            title: 'Lợi ích của phân bón sinh học',
            excerpt: 'Khám phá những ưu điểm vượt trội của phân bón từ quá trình lên men tự nhiên...',
            date: '15/01/2026',
        },
        {
            id: 2,
            title: 'Hướng dẫn sử dụng ORCHA',
            excerpt: 'Cách sử dụng sản phẩm ORCHA hiệu quả nhất cho vườn cây của bạn...',
            date: '10/01/2026',
        },
        {
            id: 3,
            title: 'Câu chuyện về men vi sinh',
            excerpt: 'Tìm hiểu về quy trình lên men trái cây với men vi sinh tự nhiên...',
            date: '05/01/2026',
        },
        {
            id: 4,
            title: 'Nông nghiệp bền vững',
            excerpt: 'Xu hướng canh tác xanh và vai trò của phân bón sinh học...',
            date: '28/12/2025',
        },
        {
            id: 5,
            title: 'Tips chăm sóc cây trồng',
            excerpt: 'Những mẹo hữu ích giúp cây trồng của bạn phát triển khỏe mạnh...',
            date: '20/12/2025',
        },
        {
            id: 6,
            title: 'Thành công với ORCHA',
            excerpt: 'Câu chuyện thành công của nông dân khi sử dụng sản phẩm ORCHA...',
            date: '15/12/2025',
        },
    ];

    // Handle click on blog card
    const handleBlogClick = (index: number) => {
        // Update active index
        setActiveIndex(index);

        // Scroll to center using scrollIntoView
        const blogElement = blogRefs.current[index];
        if (blogElement) {
            blogElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center', // Scroll vào chính giữa
            });
        }
    };

    return (
        <section id="blog" className={styles.blogSection}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>{t('blog.sectionTitle')}</h2>

                {/* Horizontal scroll container with hidden scrollbar */}
                <div className={`${styles.scrollContainer} no-scrollbar`} ref={scrollContainerRef}>
                    <div className={styles.blogGrid}>
                        {blogPosts.map((post, index) => (
                            <div
                                key={post.id}
                                ref={(el) => { blogRefs.current[index] = el; }}
                                className={`${styles.blogCard} ${index === activeIndex ? styles.active : ''
                                    }`}
                                onClick={() => handleBlogClick(index)}
                            >
                                {post.imageSrc ? (
                                    <OptimizedImage
                                        src={post.imageSrc}
                                        alt={post.title}
                                        className={styles.blogImage}
                                        aspectRatio="16/9"
                                    />
                                ) : (
                                    <div className={styles.blogPlaceholder}>
                                        <span>Blog {post.id}</span>
                                    </div>
                                )}

                                <div className={styles.blogContent}>
                                    <div className={styles.blogMeta}>
                                        {post.date && (
                                            <span className={styles.blogDate}>{post.date}</span>
                                        )}
                                    </div>
                                    <h3 className={styles.blogTitle}>{post.title}</h3>
                                    {post.excerpt && (
                                        <p className={styles.blogExcerpt}>{post.excerpt}</p>
                                    )}
                                    <div className={styles.blogActions}>
                                        <button className={styles.readMore}>{t('blog.readMore')}</button>
                                        <ShareButtons 
                                            url={`${window.location.origin}/blog/${post.id}`}
                                            title={post.title}
                                            className={styles.shareButtons}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation dots */}
                <div className={styles.dotsContainer}>
                    {blogPosts.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''
                                }`}
                            onClick={() => handleBlogClick(index)}
                            aria-label={`Go to blog ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
