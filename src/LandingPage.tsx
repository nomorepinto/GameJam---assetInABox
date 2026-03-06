import styles from './styles/Landing.module.css';

interface LandingPageProps {
    onPlay: () => void;
}

export default function LandingPage({ onPlay }: LandingPageProps) {
    return (
        <div className={styles.landingContainer}>
            {/* Twinkling stars */}
            <div className={styles.stars}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={styles.star} />
                ))}
            </div>

            {/* Main content */}
            <div className={styles.content}>
                <h1 className={styles.title}>
                    PLANT-A-WAY-OUT
                </h1>
                <p className={styles.subtitle}>~ A TINY PLANT ADVENTURE ~</p>

                {/* Plant character showcase */}
                <div className={styles.plantWrapper}>
                    <div className={styles.plantGlow} />
                    <img
                        src="/assets/plant.png"
                        alt="Plant character"
                        className={styles.plantImage}
                    />
                </div>

                {/* Play button */}
                <button
                    id="play-button"
                    className={styles.playButton}
                    onClick={onPlay}
                >
                    ▶ PLAY
                </button>

                <p className={styles.prompt}>PRESS TO START</p>
            </div>

            {/* Decorative ground plants */}
            <div className={styles.groundDecor}>
                <img src="/assets/plant.png" alt="" className={styles.miniPlant} />
                <img src="/assets/plant.png" alt="" className={styles.miniPlant} />
                <img src="/assets/plant.png" alt="" className={styles.miniPlant} />
                <img src="/assets/plant.png" alt="" className={styles.miniPlant} />
                <img src="/assets/plant.png" alt="" className={styles.miniPlant} />
            </div>

            {/* Pixel ground */}
            <div className={styles.ground}>
                <div className={styles.grassRow}>
                    {Array.from({ length: 200 }).map((_, i) => (
                        <div key={i} className={styles.grassBlock} />
                    ))}
                </div>
                <div className={styles.dirtRow} />
            </div>
        </div>
    );
}
