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
    const [currentTime, setCurrentTime] = useState(0);
    const [bestTimes, setBestTimes] = useState<number[]>([]);

    // Format seconds into MM:SS:CC
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Load best times from "AsyncStorage" (localStorage)
        const savedRecords = localStorage.getItem('plant-escape-times');
        if (savedRecords) {
            setBestTimes(JSON.parse(savedRecords));
        }

        const onWin = (data: { time: number }) => {
            setShowWinModal(true);
            const finalTime = data.time;

            // Save to best times
            setBestTimes(prev => {
                const updated = [...prev, finalTime].sort((a, b) => a - b).slice(0, 5);
                localStorage.setItem('plant-escape-times', JSON.stringify(updated));
                return updated;
            });
        };

        const onReset = () => {
            setCurrentTime(0);
            setShowWinModal(false);
        };

        EventBus.on('player-wins', onWin);
        EventBus.on('reset-player', onReset);

        return () => {
            EventBus.removeListener('player-wins', onWin);
            EventBus.removeListener('reset-player', onReset);
        };
    }, []);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showGame && !showWinModal) {
            const start = Date.now() - (currentTime * 1000);
            interval = setInterval(() => {
                setCurrentTime((Date.now() - start) / 1000);
            }, 50);
        }

        return () => clearInterval(interval);
    }, [showGame, showWinModal]);

    const handlePlay = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            setShowGame(true);
        }, 600);
    };

    const handlePlayAgain = () => {
        setShowWinModal(false);
        setCurrentTime(0);
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
                {/* Timer Section */}
                <div className={styles.timerContainer}>
                    <span className={styles.timerLabel}>ESCAPE TIME</span>
                    <span className={styles.timerValue}>{formatTime(currentTime)}</span>
                </div>

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
                    onClick={() => {
                        setCurrentTime(0);
                        EventBus.emit('reset-player');
                    }}
                >
                    ↺ RESET
                </button>

                {/* Best Times Section */}
                {bestTimes.length > 0 && (
                    <div className={styles.bestTimesContainer}>
                        <h3 className={styles.bestTimesTitle}>FASTEST ESCAPES</h3>
                        <ul className={styles.bestTimesList}>
                            {bestTimes.map((time, index) => (
                                <li key={index} className={styles.bestTimeItem}>
                                    <span>#{index + 1}</span>
                                    <span className={styles.bestTimeValue}>{formatTime(time)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
                        <p className={styles.winSubtitle}>~ ESCAPED IN {formatTime(currentTime)} ~</p>
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
