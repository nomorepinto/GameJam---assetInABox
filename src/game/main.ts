import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { AUTO, Game as PhaserGame } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        Game,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    }
};

const StartGame = (parent: string) => {

    return new PhaserGame({ ...config, parent });

}

export default StartGame;
