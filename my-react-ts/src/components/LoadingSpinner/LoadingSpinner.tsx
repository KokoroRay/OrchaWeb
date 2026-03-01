import { useEffect, useState } from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    overlay?: boolean;
    text?: string;
    color?: 'primary' | 'white' | 'dark';
}

export const LoadingSpinner = ({ 
    size = 'medium', 
    overlay = false, 
    text = 'Đang tải...',
    color = 'primary'
}: LoadingSpinnerProps) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const spinnerContent = (
        <div className={`${styles.spinnerContainer} ${styles[size]} ${styles[color]}`}>
            <div className={styles.spinner}>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
                <div className={styles.innerCircle}></div>
            </div>
            {text && (
                <p className={styles.text}>
                    {text}{dots}
                </p>
            )}
        </div>
    );

    if (overlay) {
        return (
            <div className={styles.overlay}>
                {spinnerContent}
            </div>
        );
    }

    return spinnerContent;
};