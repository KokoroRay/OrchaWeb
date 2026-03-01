import { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import styles from './BackToTop.module.css';

interface BackToTopProps {
    showAfter?: number;
    smoothBehavior?: boolean;
}

export const BackToTop = ({ 
    showAfter = 400, 
    smoothBehavior = true 
}: BackToTopProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        let timeoutId: number;
        
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Show/hide button based on scroll position
            setIsVisible(scrollTop > showAfter);
            
            // Add scrolling class for animation
            setIsScrolling(true);
            
            // Remove scrolling class after scroll ends
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        // Throttle scroll events for performance
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll);

        return () => {
            window.removeEventListener('scroll', throttledScroll);
            clearTimeout(timeoutId);
        };
    }, [showAfter]);

    const scrollToTop = () => {
        if (smoothBehavior) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, 0);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            scrollToTop();
        }
    };

    return (
        <button
            className={`${styles.backToTop} ${isVisible ? styles.visible : ''} ${isScrolling ? styles.scrolling : ''}`}
            onClick={scrollToTop}
            onKeyDown={handleKeyDown}
            aria-label="Back to top"
            title="Back to top"
            type="button"
        >
            <FaChevronUp className={styles.icon} />
            <span className={styles.ripple}></span>
        </button>
    );
};