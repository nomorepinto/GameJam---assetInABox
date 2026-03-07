import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('plant', 'plant.png');
        this.load.image('arrow', 'arrow.png');
        this.load.image('trashcan', 'Trash.png');
        this.load.image('sink', 'sink.png');
        this.load.image('printer', 'printer.png');
        this.load.image('writingtable', 'writing-table.png');
        this.load.image('worker1', 'worker1.png');
        this.load.image('worker2', 'worker2.png');
        this.load.image('worker4', 'worker4.png');
        this.load.image('boss', 'boss.png');
        this.load.image('desk-pc', 'desk-with-pc.png');
        this.load.image('coffeemaker', 'coffee-maker.png');
        this.load.image('cabinet', 'cabinet.png');

        this.load.spritesheet('explosion', 'explosionAnimation.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        this.load.setPath('sounds');
        this.load.audio('explosion_snd', 'bombaclat.wav');
        this.load.audio('retry_snd', 'retry.wav');
        this.load.audio('bounce_snd', 'bounce off.wav');
        this.load.audio('trash_snd', 'trash lol.wav');
        this.load.audio('music', 'lock in (only map 2).wav');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the Game scene. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
