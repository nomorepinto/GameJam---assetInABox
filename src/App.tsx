import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import LandingPage from './LandingPage';
import styles from './styles/Landing.module.css';

function App() {

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [showGame, setShowGame] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handlePlay = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            setShowGame(true);
        }, 600);
    };

    if (!showGame) {
        return (
            <div className={isFadingOut ? styles.fadeOut : ''}>
                <LandingPage onPlay={handlePlay} />
            </div>
        );
    }

    return (
        <div id="app" className={`${styles.fadeIn} ${styles.gameWrapper}`}>
            {/* Twinkling stars — same as landing */}
            <div className={styles.gameStars}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={styles.star} />
                ))}
            </div>

            <div className={styles.gameCanvas}>
                <PhaserGame ref={phaserRef} />
            </div>

            <div className={styles.instructions}>
                <h2 className={styles.instructionsTitle}>HOW TO PLAY</h2>
                <ul className={styles.instructionsList}>
                    <li className={styles.instructionItem}>
                        <span className={styles.instructionIcon}>►</span>
                        Press SPACE to act
                    </li>
                    <li className={styles.instructionItem}>
                        <span className={styles.instructionIcon}>►</span>
                        Aim with your mouse
                    </li>
                    <hr className={styles.instructionDivider} />
                    <li className={styles.instructionItem}>
                        <span className={styles.instructionIcon}>☘</span>
                        Escape the office!
                    </li>
                </ul>
                <p className={styles.goodLuck}>GOOD LUCK!</p>
            </div>
        </div>
    )
}

export default App
