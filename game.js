const config = {
    type: Phaser.AUTO,
    width: 1200, 
    height: 700,
    backgroundColor: "#51d1f6",
    parent: "game",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 100 }, // Gravedad global para todos los objetos
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
}

new Phaser.Game(config)

function preload() {
    this.load.image("pelon", "./assets/entities/pelon.png")
    this.load.image("tierra", "./assets/scenery/tierra.png")
    this.load.image("pala", "./assets/entities/pala.png")
    this.load.image("restartButton", "./assets/buttons/restart.png")
    this.load.audio("boka", "/assets/sound/videoplayback.mp3")
}

function create() {
    /* Música */
    this.backgroundMusic = this.sound.add('boka', {
        volume: 0.4, // Ajustar el volumen
        loop: true   // Hacer que la música se repita
    });
    this.backgroundMusic.play();
    this.backgroundMusic.rate = 0.75;
    /* Score */
    let score = 0
    let scoreText;
    this.gravityDifficult = 600
    this.palaTimer = 500
    /* Personaje */
    this.pelon = this.physics.add.sprite(550, 600, "pelon").setOrigin(0.5, 0.5).setScale(0.56)
    this.pelon.setCollideWorldBounds(true);
    this.pelon.body.setSize(5, 55)
    /* Piso */
    this.floor = this.add.tileSprite(0, 525, config.width, 550, "tierra").setOrigin(0, 0);

    // Convierte el tileSprite en un objeto estático de física
    this.physics.add.existing(this.floor, true); 
    this.floor.body.setSize(config.width, 10).setOffset(0, 90); 
    this.physics.add.collider(this.pelon, this.floor);

    /* Configurar las teclas  */
    this.keys = this.input.keyboard.createCursorKeys()

    /* Grupo de palas */
    this.physics.world.setBounds(0, 0, 1200, config.height); 
    this.cameras.main.setBounds(0, 0, 1200, config.height); 
    this.palasGroup = this.physics.add.group()

    /* Hace aparecer una pala cada cierto tiempo, dependiendo el score */
    this.palaTimerEvent = this.time.addEvent({
        delay: this.palaTimer,
        callback: spawnPala,
        callbackScope: this,
        loop: true
    });
    function spawnPala() {
        let random = Math.random() * 600
        let leftOrRight = Math.random()
        let operation;
        if(leftOrRight > 0.66) {
            operation = this.pelon.x + random
        }
        else if(leftOrRight > 0.33 && leftOrRight <= 0.66){
            operation = this.pelon.x - random
        }
        else if(leftOrRight <= 0.33){
            operation = this.pelon.x
        }
        let pala = this.palasGroup.create(operation, 0, "pala").setOrigin(0, 0).setScale(0.42).setSize(100, 250);
        pala.body.setGravityY(this.gravityDifficult);
        pala.setCollideWorldBounds(true);
        pala.body.onWorldBounds = true;
        pala.body.world.on('worldbounds', (body) => {
            if (body.gameObject === pala) {
                score++;
                scoreText.setText('Score: ' + score);
                pala.destroy();
    
                // Ajustar dificultad según el puntaje del
                if (score === 30) {
                    this.gravityDifficult = 800;
                    this.backgroundMusic.rate = 0.85;
                    this.palaTimerEvent.delay = 300;  
                } else if (score === 100) {
                    this.gravityDifficult = 800;
                    this.palaTimerEvent.delay = 200; 
                    this.backgroundMusic.rate = 1;
                } else if (score === 200) {
                    this.gravityDifficult = 1100;
                    this.palaTimerEvent.delay = 170;
                    this.backgroundMusic.rate = 1.05;  
                }
                else if(score === 300) {
                    this.gravityDifficult = 1200;
                    this.palaTimerEvent.delay = 130
                    this.backgroundMusic.rate = 1.1
                }
            }
        });
    }
    
    /* Colision entre el personaje y las palas. */
    this.physics.add.overlap(this.pelon, this.palasGroup, gameOver, null, this)

    /* Score */
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });


}

function update() {
    if (this.keys.left.isDown) {
        this.pelon.x -= 6;
        this.pelon.flipX = true;
    } else if (this.keys.right.isDown) {
        this.pelon.x += 6;
        this.pelon.flipX = false;
    }
    if (this.pelon.x < 5 || this.pelon.x > 1160) {
        gameOver.call(this, this.pelon, null);
    }
}

function gameOver(pelon, pala) {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.stop(); 
    }
    this.physics.pause();
    this.palaTimerEvent.paused = true;
    pelon.setTint(0xff0000);
    this.restartButton = this.add.image(600, 350, 'restartButton').setInteractive().setScale(0.25);
    this.restartButton.on('pointerdown', () => {
        this.scene.restart(); // Reiniciar la escena completa
    });
}

