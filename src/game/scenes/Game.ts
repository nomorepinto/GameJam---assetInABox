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
    currentAction: Array<String> = ["explode", "move", "grow", "move", "shrink"];
    actionIndex: number = 0;
    normalCharacterScale: number = 1;
    grownCharacterScale: number = 2.5;
    smallCharacterScale: number = 0.5;
    walls: Phaser.Physics.Arcade.StaticGroup;
    breakableWalls: Phaser.Physics.Arcade.StaticGroup;
    hasKey: boolean = false;
    keyObject: Phaser.Physics.Arcade.Image;
    moveDirX: number = 0;
    moveDirY: number = 0;
    bounceBackSpeed: number = 800;
    keyDoors: Phaser.Physics.Arcade.StaticGroup;
    trashCan: Phaser.Physics.Arcade.Image;
    hasTrashCan: boolean = false;
    isTrashCan: boolean = false;
    exclusionZones: Phaser.Physics.Arcade.StaticGroup;
    hasWon: boolean = false;

    constructor() {
        super('Game');
    }

    create() {

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log(`x: ${pointer.x}, y: ${pointer.y}`);
        });

        this.background = this.add.image(512, 384, 'background');

        this.mainChar = this.physics.add.image(100, 100, 'plant').setScale(1);

        // 2. Cast the body once for easy access
        this.mainBody = this.mainChar.body as Phaser.Physics.Arcade.Body;

        // 3. Set world boundaries so they don't fly off screen
        this.mainChar.setCollideWorldBounds(false);

        this.arrow = this.add.image(this.mainChar.x, this.mainChar.y, 'arrow').setDepth(101).setOrigin(0, 0.5).setScale(0.15);

        const spaceBar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xbdcdde); // Grey color
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('wall_color', 32, 32);

        //key
        const keyGraphics = this.make.graphics({ x: 0, y: 0 });
        keyGraphics.fillStyle(0xffff00); // Yellow
        keyGraphics.fillRect(0, 0, 32, 32);
        keyGraphics.generateTexture('key', 32, 32);


        const officepartition = this.make.graphics({ x: 0, y: 0 });
        officepartition.fillStyle(0x804b34);
        officepartition.fillRect(0, 0, 32, 32);
        officepartition.generateTexture('officepartition', 32, 32);

        this.keyObject = this.physics.add.image(500, 70, 'key').setScale(0.5).setDepth(105)

        this.physics.add.overlap(this.mainChar, this.keyObject, () => {
            if (!this.hasKey) {
                this.hasKey = true;
                this.keyObject.destroy();
                console.log('Key picked up! hasKey:', this.hasKey);
            }
        });

        this.trashCan = this.physics.add.image(70, 700, 'trashcan').setScale(4);

        this.physics.add.overlap(this.mainChar, this.trashCan, () => {
            if (!this.hasTrashCan) {
                this.hasTrashCan = true;
                this.trashCan.destroy();
                this.currentAction.push('move');
                this.currentAction.push('trashcan');
                console.log('Trashcan picked up! Actions:', this.currentAction);
            }
        });

        //walls

        this.walls = this.physics.add.staticGroup();


        const redGraphics = this.make.graphics({ x: 0, y: 0 });
        redGraphics.fillStyle(0xff0000);
        redGraphics.fillRect(0, 0, 32, 32);
        redGraphics.generateTexture('wall_breakable', 32, 32);

        this.breakableWalls = this.physics.add.staticGroup();




        const doorGraphics = this.make.graphics({ x: 0, y: 0 });
        doorGraphics.fillStyle(0xffff00);
        doorGraphics.fillRect(0, 0, 32, 32);
        doorGraphics.generateTexture('key_door', 32, 32);

        this.keyDoors = this.physics.add.staticGroup();



        this.physics.add.collider(this.mainChar, this.walls, () => this.bounceBack());
        this.physics.add.collider(this.mainChar, this.breakableWalls, () => this.bounceBack());
        this.physics.add.collider(this.mainChar, this.keyDoors, () => {
            if (this.hasKey) return;
            this.bounceBack();
        });

        // Top
        this.walls.create(512, 16, 'wall_color').setScale(32, 1).refreshBody();
        // Bottom
        this.walls.create(512, 752, 'wall_color').setScale(32, 1).refreshBody();
        // Left
        this.walls.create(16, 384, 'wall_color').setScale(1, 24).refreshBody();
        // Right
        this.walls.create(1008, 284, 'wall_color').setScale(1, 24).refreshBody();
        //Exit
        this.keyDoors.create(1008, 700, 'key_door').setScale(1, 3).refreshBody();

        this.walls.create(100, 200, 'wall_color').setScale(5, 1).refreshBody();
        this.breakableWalls.create(160, 115, 'wall_breakable').setScale(1, 5).
            refreshBody();

        this.walls.create(250, 600, 'officepartition').setDisplaySize(32, 32 * 10).setScale(1, 10).refreshBody();
        this.walls.create(500, 600, 'officepartition').setScale(1, 10).refreshBody();
        this.walls.create(750, 600, 'wall_color').setScale(1, 10).refreshBody();
        this.walls.create(800, 460, 'wall_color').setScale(3, 1).refreshBody();

        this.walls.create(400, 150, 'officepartition').setScale(1, 10).refreshBody();
        this.walls.create(600, 150, 'officepartition').setScale(1, 10).refreshBody();

        this.walls.create(980, 100, 'printer').setScale(3, 5).setAngle(90).setDisplaySize(128, 64).refreshBody();

        this.walls.create(980, 240, 'writingtable').setScale(3, 5).setAngle(90).setDisplaySize(128, 80).refreshBody();

        const exclusionGraphics = this.make.graphics({ x: 0, y: 0 });
        exclusionGraphics.fillStyle(0xff00ff); // Purple
        exclusionGraphics.fillRect(0, 0, 32, 32);
        exclusionGraphics.generateTexture('exclusion_zone', 32, 32);

        this.exclusionZones = this.physics.add.staticGroup();
        this.exclusionZones.create(500, 144, 'exclusion_zone').setScale(5.5, 5.5).setAlpha(0).refreshBody();

        this.physics.add.overlap(this.mainChar, this.exclusionZones, () => {
            if (!this.isTrashCan) {
                this.isMoving = false;
                this.mainBody.setVelocity(0, 0);
                this.mainBody.reset(100, 100);
                this.mainChar.setPosition(100, 100);
            }
        });


        // explode animation
        this.anims.create({
            key: 'explode_anim',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
            frameRate: 12,
            hideOnComplete: true // Automatically hides the sprite when the animation ends
        });


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

    resetPlayer() {
        this.isMoving = false;
        this.mainBody.setVelocity(0, 0);
        this.mainBody.reset(100, 100);
        this.mainChar.setPosition(100, 100);
        this.actionIndex = 0;

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

        this.keyDoors.getChildren().forEach((door) => {
            const body = (door as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody;
            body.enable = !this.hasKey;
        });

        // Win condition — player enters exit zone with key
        if (
            this.hasKey &&
            !this.hasWon &&
            this.mainChar.x >= 990 && this.mainChar.x <= 1022 &&
            this.mainChar.y >= 669 && this.mainChar.y <= 735
        ) {
            this.hasWon = true;
            this.isMoving = false;
            this.mainBody.setVelocity(0, 0);
            EventBus.emit('player-wins');
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
