import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';
import LandingPage from './LandingPage';
import styles from './styles/Landing.module.css';

function App() {

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [showGame, setShowGame] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);

    useEffect(() => {
        const onWin = () => setShowWinModal(true);
        EventBus.on('player-wins', onWin);
        return () => { EventBus.removeListener('player-wins', onWin); };
    }, []);

    const handlePlay = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            setShowGame(true);
        }, 600);
    };

    const handlePlayAgain = () => {
        setShowWinModal(false);
        EventBus.emit('reset-player');
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
                <button
                    id="reset-button"
                    className={styles.resetButton}
                    onClick={() => EventBus.emit('reset-player')}
                >
                    ↺ RESET
                </button>
            </div>

            {/* Win Modal */}
            {showWinModal && (
                <div className={styles.winOverlay}>
                    <div className={styles.winModal}>
                        <div className={styles.winStars}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className={styles.winStar} />
                            ))}
                        </div>
                        <h1 className={styles.winTitle}>YOU WIN!</h1>
                        <p className={styles.winSubtitle}>~ PLANT ESCAPED THE OFFICE ~</p>
                        <div className={styles.winPlantWrapper}>
                            <img
                                src="/assets/plant.png"
                                alt="Plant character"
                                className={styles.winPlant}
                            />
                        </div>
                        <button
                            id="play-again-button"
                            className={styles.playAgainButton}
                            onClick={handlePlayAgain}
                        >
                            REFRESH TO PLAY AGAIN
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
