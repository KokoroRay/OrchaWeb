import { useState, useEffect, useRef } from 'react';
import type { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    aspectRatio?: string;
}

/**
 * Optimized Image Component with:
 * - Lazy loading
 * - Placeholder/blur effect
 * - Aspect ratio preservation
 * - Responsive sizing
 * - Performance optimization
 */
export const OptimizedImage = ({
    src,
    alt,
    className = '',
    loading = 'lazy',
    placeholder,
    aspectRatio,
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!imgRef.current || loading === 'eager') {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Load 50px before entering viewport
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [loading]);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        overflow: 'hidden',
        ...(aspectRatio && { aspectRatio }),
    };

    const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0,
    };

    const placeholderStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        backgroundColor: '#e5e5e5',
        filter: 'blur(10px)',
        transform: 'scale(1.1)',
        opacity: isLoaded ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
    };

    return (
        <div ref={imgRef} style={containerStyle} className={className}>
            {/* Placeholder */}
            {placeholder && (
                <img
                    src={placeholder}
                    alt=""
                    style={placeholderStyle}
                    aria-hidden="true"
                />
            )}

            {/* Actual image - only load when in view */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    style={imgStyle}
                    onLoad={() => setIsLoaded(true)}
                    loading={loading}
                    decoding="async"
                    {...props}
                />
            )}
        </div>
    );
};
