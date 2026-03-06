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
        <div id="app" className={styles.fadeIn}>
            <PhaserGame ref={phaserRef} />
        </div>
    )
}

export default App
