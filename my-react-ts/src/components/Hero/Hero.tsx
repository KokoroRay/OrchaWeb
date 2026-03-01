import styles from './Hero.module.css';

interface HeroProps {
    imageSrc?: string;
}

export const Hero = ({ imageSrc }: HeroProps) => {
    return (
        <section className={styles.hero} id="home">
            {imageSrc && (
                <div className={styles.imageWrapper}>
                    <img
                        src={imageSrc}
                        alt="ORCHA - Nước Trái Cây Lên Men"
                        className={styles.image}
                    />
                </div>
            )}
        </section>
    );
};
