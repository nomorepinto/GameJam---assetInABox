import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class Game extends Scene {
    background: GameObjects.Image;
    mainChar: Phaser.Physics.Arcade.Image; // Change from GameObjects.Image
    mainBody: Phaser.Physics.Arcade.Body;
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
    currentAction: Array<String> = ["explode", "move", "grow", "move", "shrink", "move"];
    actionIndex: number = 0;
    normalCharacterScale: number = 1;
    grownCharacterScale: number = 2.5;
    smallCharacterScale: number = 0.5;
    walls: Phaser.Physics.Arcade.StaticGroup;
    breakableWalls: Phaser.Physics.Arcade.StaticGroup;
    hasKey: boolean = false;
    hasKey2: boolean = false;
    keyObject: Phaser.Physics.Arcade.Image;
    keyObject2: Phaser.Physics.Arcade.Image;
    moveDirX: number = 0;
    moveDirY: number = 0;
    bounceBackSpeed: number = 800;
    keyDoors: Phaser.Physics.Arcade.StaticGroup;
    trashCan: Phaser.Physics.Arcade.Image;
    hasTrashCan: boolean = false;
    isTrashCan: boolean = false;
    exclusionZones: Phaser.Physics.Arcade.StaticGroup;
    hasWon: boolean = false;
    worker1: GameObjects.Image;
    worker2: GameObjects.Image;
    worker4: GameObjects.Image;
    boss: GameObjects.Image;
    deskPC: GameObjects.Image;
    coffeeMaker: GameObjects.Image;
    cabinet: GameObjects.Image;
    sink: GameObjects.Image;
    isShowingAlert: boolean = false;
    startTime: number;
    elapsedTime: number = 0;
    bgMusic: Phaser.Sound.BaseSound;

    constructor() {
        super('Game');
    }

    create() {

        // ==========================================
        // DECLARATIONS: Textures, keys, animations
        // ==========================================

        this.bgMusic = this.sound.add('music', { loop: true, volume: 0.5 });

        // Input key
        const spaceBar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Wall texture (grey)
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xbdcdde);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('wall_color', 32, 32);

        // Key texture (yellow)
        const keyGraphics = this.make.graphics({ x: 0, y: 0 });
        keyGraphics.fillStyle(0xffff00);
        keyGraphics.fillRect(0, 0, 32, 32);
        keyGraphics.generateTexture('key', 32, 32);

        // Office partition texture (brown)
        const officepartition = this.make.graphics({ x: 0, y: 0 });
        officepartition.fillStyle(0x804b34);
        officepartition.fillRect(0, 0, 32, 32);
        officepartition.generateTexture('officepartition', 32, 32);

        // Breakable wall texture (red)
        const redGraphics = this.make.graphics({ x: 0, y: 0 });
        redGraphics.fillStyle(0xff0000);
        redGraphics.fillRect(0, 0, 32, 32);
        redGraphics.generateTexture('wall_breakable', 32, 32);

        // Key door texture (yellow)
        const doorGraphics = this.make.graphics({ x: 0, y: 0 });
        doorGraphics.fillStyle(0x9dcdf5);
        doorGraphics.fillRect(0, 0, 32, 32);
        doorGraphics.generateTexture('key_door', 32, 32);

        // Exclusion zone texture (purple)
        const exclusionGraphics = this.make.graphics({ x: 0, y: 0 });
        exclusionGraphics.fillStyle(0xff00ff);
        exclusionGraphics.fillRect(0, 0, 32, 32);
        exclusionGraphics.generateTexture('exclusion_zone', 32, 32);

        // Explode animation
        this.anims.create({
            key: 'explode_anim',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
            frameRate: 12,
            hideOnComplete: true
        });

        // ==========================================
        // OBJECT CREATION: Scene objects & physics
        // ==========================================

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log(`x: ${pointer.x}, y: ${pointer.y}`);
        });

        this.background = this.add.image(512, 384, 'background');

        this.mainChar = this.physics.add.image(70, 670, 'plant').setScale(1);
        this.mainBody = this.mainChar.body as Phaser.Physics.Arcade.Body;
        this.mainChar.setCollideWorldBounds(false);

        this.arrow = this.add.image(this.mainChar.x, this.mainChar.y, 'arrow').setDepth(101).setOrigin(0, 0.5).setScale(0.15);

        // Key object
        this.keyObject = this.physics.add.image(400, 712, 'key').setScale(0.5).setDepth(105);

        this.physics.add.overlap(this.mainChar, this.keyObject, () => {
            if (!this.hasKey) {
                this.hasKey = true;
                this.keyObject.destroy();
                console.log('Key 1 picked up! hasKey:', this.hasKey);
            }
        });

        // Key 2 object
        this.keyObject2 = this.physics.add.image(825, 687, 'key').setScale(0.5).setDepth(105);

        this.physics.add.overlap(this.mainChar, this.keyObject2, () => {
            if (!this.hasKey2) {
                this.hasKey2 = true;
                this.keyObject2.destroy();
                console.log('Key 2 picked up! hasKey2:', this.hasKey2);
            }
        });

        // Trash can
        this.trashCan = this.physics.add.image(60, 60, 'trashcan').setScale(4);

        this.physics.add.overlap(this.mainChar, this.trashCan, () => {
            if (!this.hasTrashCan) {
                this.hasTrashCan = true;
                this.trashCan.destroy();
                this.currentAction.push('move');
                this.currentAction.push('trashcan');
                console.log('Trashcan picked up! Actions:', this.currentAction);
                this.sound.play('trash_snd');
            }
        });


        this.boss = this.add.image(120, 170, 'boss').setAngle(180).setScale(2);
        this.worker1 = this.add.image(565, 585, 'worker1').setAngle(90).setOrigin(1, 0).setScale(2);
        this.deskPC = this.add.image(565, 685, 'desk-pc').setAngle(90).setOrigin(1, 0).setScale(2);
        this.worker2 = this.add.image(365, 585, 'worker2').setAngle(90).setOrigin(1, 0).setScale(2);
        this.worker4 = this.add.image(365, 685, 'worker4').setAngle(90).setOrigin(1, 0).setScale(2);

        this.coffeeMaker = this.add.image(1020, 689, 'coffeemaker').setAngle(90).setOrigin(1, 0).setScale(2).setDepth(105);
        this.cabinet = this.add.image(760, 453, 'cabinet').setAngle(90).setOrigin(1, 0).setScale(2).setDepth(105);
        this.cabinet = this.add.image(760, 510, 'cabinet').setAngle(90).setOrigin(1, 0).setScale(2).setDepth(105);
        this.sink = this.add.image(987, 539, 'sink').setAngle(90).setOrigin(1, 0).setScale(2);




        // Physics groups
        this.walls = this.physics.add.staticGroup();
        this.breakableWalls = this.physics.add.staticGroup();
        this.keyDoors = this.physics.add.staticGroup();
        this.exclusionZones = this.physics.add.staticGroup();

        // Colliders
        this.physics.add.collider(this.mainChar, this.walls, () => this.bounceBack());
        this.physics.add.collider(this.mainChar, this.breakableWalls, () => this.bounceBack());
        this.physics.add.collider(this.mainChar, this.keyDoors, () => {
            if (this.hasKey) return;
            this.bounceBack();
        });

        // Walls — Top
        this.walls.create(512, 16, 'wall_color').setScale(32, 1).refreshBody();
        // Walls — Bottom
        this.walls.create(512, 752, 'wall_color').setScale(32, 1).refreshBody();
        // Walls — Left
        this.walls.create(16, 384, 'wall_color').setScale(1, 24).refreshBody();
        // Walls — Right
        this.walls.create(990, 190, 'wall_color').setScale(1, 24).setOrigin(0, 0).refreshBody();
        this.walls.create(990, 95, 'wall_color').setScale(1, 5).setOrigin(0, 1).refreshBody();
        // Exit
        this.keyDoors.create(990, 95, 'key_door').setScale(1, 3).setOrigin(0, 0).refreshBody();

        this.walls.create(366, 735, 'officepartition').setScale(0.5, 8).setOrigin(0, 1).refreshBody();
        this.walls.create(380, 478, 'officepartition').setScale(3, 0.5).setOrigin(1, 0).refreshBody();

        this.walls.create(566, 735, 'officepartition').setScale(0.5, 8).setOrigin(0, 1).refreshBody();
        this.walls.create(580, 478, 'officepartition').setScale(3, 0.5).setOrigin(1, 0).refreshBody();

        this.walls.create(30, 214, 'wall_color').setScale(7, 1).setOrigin(0, 0).refreshBody();
        this.walls.create(252, 245, 'wall_color').setScale(1, 3).setOrigin(1, 1).refreshBody();

        this.walls.create(743, 735, 'wall_color').setScale(1, 12).setOrigin(0, 1).refreshBody();
        this.walls.create(741, 350, 'wall_color').setScale(5, 1).setOrigin(0, 0).refreshBody();

        // Exclusion zone
        this.exclusionZones.create(293, 493, 'exclusion_zone').setScale(8.4, 8).setOrigin(0, 0).setAlpha(0).refreshBody();

        this.physics.add.overlap(this.mainChar, this.exclusionZones, () => {
            if (!this.isTrashCan) {
                this.isMoving = false;
                this.mainBody.setVelocity(0, 0);
                this.mainBody.reset(70, 670);
                this.mainChar.setPosition(70, 670);
                this.showMessage("Why is this plant moving? A trash can wouldn't be so suspicious.");
            }
        });

        this.startTime = this.time.now;
        this.elapsedTime = 0;
        this.bgMusic.play();

        // Spacebar action handler
        spaceBar.on('down', () => {
            const action = this.currentAction[this.actionIndex];

            if (this.isTrashCan && action !== 'move') {
                this.actionIndex = 1;
                return;
            }

            switch (action) {
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
                case "trashcan":
                    this.becomeTrashCan();
                    break;
            }

            if (this.actionIndex < this.currentAction.length - 1) {
                this.actionIndex++;
            } else {
                this.actionIndex = 0;
            }
        });

        EventBus.on('reset-player', () => this.resetPlayer());
        EventBus.emit('current-scene-ready', this);
    }

    showMessage(message: string) {
        if (this.isShowingAlert) return;
        this.isShowingAlert = true;

        const container = this.add.container(512, 100).setDepth(2000).setAlpha(0);

        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.8);
        background.fillRoundedRect(-300, -40, 600, 80, 15);
        background.lineStyle(3, 0x9dcdf5, 1);
        background.strokeRoundedRect(-300, -40, 600, 80, 15);

        const text = this.add.text(0, 0, message, {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 550 }
        }).setOrigin(0.5);

        container.add([background, text]);

        this.tweens.add({
            targets: container,
            alpha: 1,
            y: 150,
            duration: 400,
            ease: 'Cubic.out'
        });

        this.time.delayedCall(4000, () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                y: 100,
                duration: 400,
                ease: 'Cubic.in',
                onComplete: () => {
                    container.destroy();
                    this.isShowingAlert = false;
                }
            });
        });
    }

    resetPlayer() {
        this.sound.play('retry_snd');
        this.bgMusic.stop();
        this.isMoving = false;
        this.mainBody.setVelocity(0, 0);
        this.mainBody.reset(70, 670);
        this.mainChar.setPosition(70, 670);
        this.actionIndex = 0;
        this.elapsedTime = 0;
        this.startTime = this.time.now;
        this.hasWon = false;

        // Revert to plant if currently a trashcan
        if (this.isTrashCan) {
            this.isTrashCan = false;
            this.mainChar.setTexture('plant').setScale(this.normalCharacterScale);
            this.mainBody.setSize(this.mainChar.width, this.mainChar.height);
        } else {
            this.mainChar.setScale(this.normalCharacterScale);
        }
    }

    moveCharacter() {
        if (!this.isMoving) {
            const angle = Phaser.Math.Angle.Between(
                this.mainChar.x, this.mainChar.y,
                this.input.activePointer.x, this.input.activePointer.y
            );

            this.moveDirX = Math.cos(angle);
            this.moveDirY = Math.sin(angle);

            this.targetX = this.mainChar.x + this.moveDirX * this.moveDistance;
            this.targetY = this.mainChar.y + this.moveDirY * this.moveDistance;

            this.isMoving = true;
        }
    }

    becomeTrashCan() {
        this.isTrashCan = true;
        this.sound.play('trash_snd');
        this.mainChar.setTexture('trashcan').setScale(4);
        this.mainBody.setSize(this.mainChar.width, this.mainChar.height);

        this.time.delayedCall(2000, () => {
            this.isTrashCan = false;
            this.mainChar.setTexture('plant').setScale(this.normalCharacterScale);
            // Reset body size to plant's raw texture size
            this.mainBody.setSize(this.mainChar.width, this.mainChar.height);
            this.mainBody.reset(this.mainChar.x, this.mainChar.y);
        });
    }
    bounceBack() {
        if (!this.isMoving) return;
        this.isMoving = false;
        this.mainBody.setVelocity(0, 0);
        this.sound.play('bounce_snd');

        let bounceX = this.mainChar.x - this.moveDirX * this.moveDistance / 1.5;
        let bounceY = this.mainChar.y - this.moveDirY * this.moveDistance / 1.5;

        // Check all wall groups for overlap at the bounce destination
        const allWallGroups = [this.walls, this.breakableWalls, ...(!this.hasKey ? [this.keyDoors] : [])];

        allWallGroups.forEach((group) => {
            group.getChildren().forEach((wall) => {
                const wallBody = (wall as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody;

                const distX = bounceX - wallBody.center.x;
                const distY = bounceY - wallBody.center.y;

                const minDistX = (wallBody.width / 2) + (this.mainChar.displayWidth / 2);
                const minDistY = (wallBody.height / 2) + (this.mainChar.displayHeight / 2);

                if (Math.abs(distX) < minDistX && Math.abs(distY) < minDistY) {
                    // Bounce destination overlaps a wall, push it out
                    const pushX = distX < 0 ? -(minDistX - Math.abs(distX)) : (minDistX - Math.abs(distX));
                    const pushY = distY < 0 ? -(minDistY - Math.abs(distY)) : (minDistY - Math.abs(distY));

                    if (Math.abs(pushX) < Math.abs(pushY)) {
                        bounceX += pushX;
                    } else {
                        bounceY += pushY;
                    }
                }
            });
        });

        this.tweens.add({
            targets: this.mainChar,
            x: bounceX,
            y: bounceY,
            duration: this.bounceBackSpeed,
            ease: 'Cubic.out',
            onUpdate: () => {
                this.mainBody.reset(this.mainChar.x, this.mainChar.y);
            }
        });
    }

    pushAwayFromWalls(group: Phaser.Physics.Arcade.StaticGroup, targetWidth: number, targetHeight: number) {
        group.getChildren().forEach((wall) => {
            const wallBody = (wall as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody;

            const distX = this.mainChar.x - wallBody.center.x;
            const distY = this.mainChar.y - wallBody.center.y;

            const minDistX = (wallBody.width / 2) + (targetWidth / 2);
            const minDistY = (wallBody.height / 2) + (targetHeight / 2);

            if (Math.abs(distX) < minDistX && Math.abs(distY) < minDistY) {
                const pushX = distX < 0 ? -(minDistX - Math.abs(distX)) : (minDistX - Math.abs(distX));
                const pushY = distY < 0 ? -(minDistY - Math.abs(distY)) : (minDistY - Math.abs(distY));

                if (Math.abs(pushX) < Math.abs(pushY)) {
                    this.mainChar.x += pushX;
                } else {
                    this.mainChar.y += pushY;
                }
            }
        });
    }

    growCharacter() {
        const targetWidth = this.mainChar.width * this.grownCharacterScale;
        const targetHeight = this.mainChar.height * this.grownCharacterScale;

        this.pushAwayFromWalls(this.walls, targetWidth, targetHeight);
        this.pushAwayFromWalls(this.breakableWalls, targetWidth, targetHeight);

        this.tweens.add({
            targets: this.mainChar,
            scale: this.grownCharacterScale,
            duration: 300,
            ease: 'Cubic.out',
            overwrite: true,
        });
    }

    explodeCharacter() {
        this.mainChar.setVisible(false);
        this.sound.play('explosion_snd');

        const targetWidth = this.mainChar.width * this.normalCharacterScale;
        const targetHeight = this.mainChar.height * this.normalCharacterScale;

        this.pushAwayFromWalls(this.walls, targetWidth, targetHeight);
        this.pushAwayFromWalls(this.breakableWalls, targetWidth, targetHeight);

        const explosionRange = 150;
        this.breakableWalls.getChildren().forEach((wall) => {
            const wallImage = wall as Phaser.Physics.Arcade.Image;
            const dist = Phaser.Math.Distance.Between(
                this.mainChar.x, this.mainChar.y,
                wallImage.x, wallImage.y
            );
            if (dist < explosionRange) {
                wallImage.destroy();
            }
        });

        this.mainChar.setScale(this.normalCharacterScale);

        const explosion = this.add.sprite(this.mainChar.x, this.mainChar.y, 'explosion');
        explosion.play('explode_anim').on('animationcomplete', () => {
            explosion.destroy();
            this.mainChar.setVisible(true);
        });
    }
    shrinkCharacter() {
        this.tweens.add({
            targets: this.mainChar,
            scale: this.smallCharacterScale,
            duration: 300,
            ease: 'Cubic.out',
            overwrite: true,
        });
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
    }

    update(time: number, delta: number) {

        if (!this.mainBody) return; // Type Guard
        if (!this.hasWon) {
            this.elapsedTime = (this.time.now - this.startTime) / 1000;
        }

        // Define your bounds
        let bounds = {
            left: 0,
            right: 1024,  // or use a fixed value
            top: 0,
            bottom: 768
        };

        // Check if player is out of bounds
        if (this.mainChar.x < bounds.left ||
            this.mainChar.x > bounds.right ||
            this.mainChar.y < bounds.top ||
            this.mainChar.y > bounds.bottom) {

            this.mainChar.setPosition(70, 670);

            // Optional: reset velocity if using physics
            this.mainBody.setVelocity(0, 0);
        }

        this.keyDoors.getChildren().forEach((door) => {
            const body = (door as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody;
            body.enable = !(this.hasKey && this.hasKey2);
        });

        // Win condition — player enters exit zone with BOTH keys
        if (
            this.hasKey &&
            this.hasKey2 &&
            !this.hasWon &&
            this.mainChar.x >= 975 &&
            this.mainChar.y >= 89 && this.mainChar.y <= 189
        ) {
            this.hasWon = true;
            this.bgMusic.stop();
            this.sound.play('win_snd');
            this.isMoving = false;
            this.mainBody.setVelocity(0, 0);
            EventBus.emit('player-wins', { time: this.elapsedTime });
        } else if (
            (!this.hasKey || !this.hasKey2) &&
            !this.hasWon &&
            this.mainChar.x >= 975 &&
            this.mainChar.y >= 89 && this.mainChar.y <= 189
        ) {
            this.showMessage("The window is locked, I have to find both keys.");
        }

        this.physics.collide(this.mainChar, this.walls);
        this.physics.collide(this.mainChar, this.breakableWalls);

        if (this.isMoving) {
            const dist = Phaser.Math.Distance.Between(
                this.mainChar.x, this.mainChar.y,
                this.targetX, this.targetY
            );

            // Use a 5-10 pixel threshold to prevent "jitter" at the destination
            if (dist > 10) {
                const angle = Phaser.Math.Angle.Between(
                    this.mainChar.x, this.mainChar.y,
                    this.targetX, this.targetY
                );

                // Speed is now in Pixels Per Second (e.g., 300)
                const moveSpeed = 400;
                this.mainBody.setVelocity(
                    Math.cos(angle) * moveSpeed,
                    Math.sin(angle) * moveSpeed
                );
            } else {
                // REACHED TARGET: Stop velocity and snap to exact pixel
                this.mainBody.setVelocity(0, 0);
                this.mainChar.setPosition(this.targetX, this.targetY);
                this.isMoving = false;
            }
        }

        // Arrow Orbit Logic (Remains similar)
        const orbitAngle = Phaser.Math.Angle.Between(
            this.mainChar.x, this.mainChar.y,
            this.input.activePointer.x, this.input.activePointer.y
        );

        const dynamicRadius = this.orbitRadius * (this.mainChar.scale / 2);
        this.arrow.x = this.mainChar.x + Math.cos(orbitAngle) * dynamicRadius;
        this.arrow.y = this.mainChar.y + Math.sin(orbitAngle) * dynamicRadius;
        this.arrow.rotation = orbitAngle;
    }


}
