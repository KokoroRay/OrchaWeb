import { useState, useRef, useEffect } from 'react';
import styles from './ShareButtons.module.css';
import { FaFacebookF, FaTwitter, FaLinkedin, FaCopy, FaShare } from 'react-icons/fa';

interface ShareButtonsProps {
    url?: string;
    title?: string;
    className?: string;
}

export const ShareButtons = ({ 
    url = window.location.href, 
    title = 'ORCHA Blog Post',
    className = ''
}: ShareButtonsProps) => {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const shareContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
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

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    const handleShare = (platform: keyof typeof shareLinks) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div 
            ref={shareContainerRef}
            className={`${styles.shareContainer} ${className}`}
        >
            <button 
                className={styles.shareToggle}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chia sẻ bài viết"
            >
                <FaShare />
                <span>Chia sẻ</span>
            </button>

            {isOpen && (
                <div className={styles.shareButtons}>
                    <button 
                        className={`${styles.shareBtn} ${styles.facebook}`}
                        onClick={() => handleShare('facebook')}
                        aria-label="Chia sẻ lên Facebook"
                    >
                        <FaFacebookF />
                        <span>Facebook</span>
                    </button>

                    <button 
                        className={`${styles.shareBtn} ${styles.twitter}`}
                        onClick={() => handleShare('twitter')}
                        aria-label="Chia sẻ lên Twitter"
                    >
                        <FaTwitter />
                        <span>Twitter</span>
                    </button>

                    <button 
                        className={`${styles.shareBtn} ${styles.linkedin}`}
                        onClick={() => handleShare('linkedin')}
                        aria-label="Chia sẻ lên LinkedIn"
                    >
                        <FaLinkedin />
                        <span>LinkedIn</span>
                    </button>

                    <button 
                        className={`${styles.shareBtn} ${styles.copy} ${copied ? styles.copied : ''}`}
                        onClick={handleCopyLink}
                        aria-label="Sao chép liên kết"
                    >
                        <FaCopy />
                        <span>{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};