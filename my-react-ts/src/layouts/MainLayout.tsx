import type { ReactNode } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
    children: ReactNode;
    logoSrc?: string;
}

export const MainLayout = ({ children, logoSrc }: MainLayoutProps) => {
    return (
        <div className={styles.layout}>
            <Header logoSrc={logoSrc} />
            <main className={styles.main}>{children}</main>
            <Footer />
        </div>
    );
};
