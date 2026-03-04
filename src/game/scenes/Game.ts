import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class Game extends Scene {
    background: GameObjects.Image;
    mainChar: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    arrow: GameObjects.Image;
    orbitRadius: number = 50; // The distance from the character in pixels
    spaceBar: Phaser.Input.Keyboard.Key;
    isMoving: boolean = false;
    targetX: number = 0;
    targetY: number = 0;
    moveDistance: number = 200;
    speed: number = 0.5;
    currentAction: Array<String> = ["move", "explode", "move", "grow", "move", "shrink",];
    actionIndex: number = 0;
    normalCharacterScale: number = 1;
    grownCharacterScale: number = 2.5;
    smallCharacterScale: number = 0.2;

    constructor() {
        super('Game');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');

        this.mainChar = this.add.image(512, 300, 'plant').setDepth(100).setScale(this.normalCharacterScale);

        this.arrow = this.add.image(this.mainChar.x, this.mainChar.y, 'arrow').setDepth(101).setOrigin(0, 0.5).setScale(0.15);

        const spaceBar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.anims.create({
            key: 'explode_anim',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
            frameRate: 12,
            hideOnComplete: true // Automatically hides the sprite when the animation ends
        });


        spaceBar.on('down', () => {
            switch (this.currentAction[this.actionIndex]) {
                case "move":
                    this.moveCharacter();
                    break;
                case "explode":
                    this.explodeCharacter();
                    break;
                case "grow":
                    this.growCharacter();
                    break;
                case "shrink":
                    this.shrinkCharacter();
                    break;
            }
            if (this.actionIndex < this.currentAction.length - 1) {
                this.actionIndex++;
            } else {
                this.actionIndex = 0;
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    moveCharacter() {
        if (!this.isMoving) {
            // 1. Calculate the direction to the mouse
            const angle = Phaser.Math.Angle.Between(
                this.mainChar.x, this.mainChar.y,
                this.input.activePointer.x, this.input.activePointer.y
            );

            // 2. Set the destination (Current Pos + Direction * Fixed Distance)
            this.targetX = this.mainChar.x + Math.cos(angle) * this.moveDistance;
            this.targetY = this.mainChar.y + Math.sin(angle) * this.moveDistance;

            this.isMoving = true;
        }
    }

    explodeCharacter() {
        this.mainChar.setVisible(false);
        this.mainChar.setScale(this.normalCharacterScale);

        // 2. Create a temporary sprite at the character's location
        const explosion = this.add.sprite(this.mainChar.x, this.mainChar.y, 'explosion');

        // 3. Play the animation we defined in create()
        explosion.play('explode_anim').on('animationcomplete', () => {
            explosion.destroy();
            this.mainChar.setVisible(true);
        });
    }

    growCharacter() {
        this.tweens.add({
            targets: this.mainChar,
            scale: this.grownCharacterScale,
            duration: 300,          // Time in milliseconds
            ease: 'Cubic.out',      // Smooth deceleration
            overwrite: true         // Prevents conflicts if you spam the button
        });
    }

    shrinkCharacter() {
        this.tweens.add({
            targets: this.mainChar,
            scale: this.smallCharacterScale,
            duration: 300,
            ease: 'Cubic.out',
            overwrite: true
        });
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
    }

    update(time: number, delta: number) {
        if (this.isMoving) {
            const step = this.speed * delta;

            // Move toward the point
            const dist = Phaser.Math.Distance.Between(this.mainChar.x, this.mainChar.y, this.targetX, this.targetY);

            if (dist > step) {
                const angle = Phaser.Math.Angle.Between(this.mainChar.x, this.mainChar.y, this.targetX, this.targetY);
                this.mainChar.x += Math.cos(angle) * step;
                this.mainChar.y += Math.sin(angle) * step;
            } else {
                // We reached the target!
                this.mainChar.x = this.targetX;
                this.mainChar.y = this.targetY;
                this.isMoving = false;
            }
        }

        // 1. Get the angle from character to mouse (in Radians)
        const angle = Phaser.Math.Angle.Between(
            this.mainChar.x,
            this.mainChar.y,
            this.input.activePointer.x,
            this.input.activePointer.y
        );

        // 2. Use Math.cos and Math.sin to find the point on the circle
        // Formula: x = center + radius * cos(angle), y = center + radius * sin(angle)
        this.arrow.x = this.mainChar.x + Math.cos(angle) * this.orbitRadius;
        this.arrow.y = this.mainChar.y + Math.sin(angle) * this.orbitRadius;

        // 3. Rotate the arrow so it points away from the character (toward the mouse)
        this.arrow.rotation = angle;
    }


}
