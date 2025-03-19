class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        // Display loading text
        const loadingText = this.add.text(config.width / 2, config.height / 2 - 50, 'Loading...', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Create progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(config.width / 2 - 160, config.height / 2 - 30, 320, 50);

        // Load assets
        this.load.image('menuBackground', 'assets/background.jpg');
        this.load.image('background', 'assets/background.jpg');
        this.load.image('card_back', 'assets/card_back.png');
        this.load.audio('backgroundMusic', 'assets/WarGame.mp3');

        for (const suit of ['Pikes', 'Tiles', 'Hearts', 'Clovers']) {
            for (const rank of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'A']) {
                const key = `${suit}_${rank}_white`;
                const url = `assets/${key}.png`;
                this.load.image(key, url);
            }
        }

        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(config.width / 2 - 150, config.height / 2 - 20, 300 * value, 30);
        });

        // Remove progress bar when loading is complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('MenuScene');
        });
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load any assets needed for the menu scene
        //this.load.image('menuBackground', 'assets/background.jpg');
    }

    create() {
        this.add.image(0, 0, 'menuBackground').setOrigin(0, 0).setDisplaySize(config.width, config.height);

        // Add title
        const title = document.createElement('h1');
        title.textContent = 'War Card Game';
        title.className = 'title-text';
        title.style.left = `${config.width / 2 - 410}px`;
        title.style.top = `${config.height / 4 - 30}px`;
        document.body.appendChild(title);

        const titleShadow = document.createElement('h1');
        titleShadow.textContent = 'War Card Game';
        titleShadow.className = 'title-text-shadow';
        titleShadow.style.left = `${config.width / 2 - 400}px`;
        titleShadow.style.top = `${config.height / 4 - 20}px`;
        document.body.appendChild(titleShadow);

        // Create an HTML button element
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.className = 'menu-button'; // Apply CSS class

        // Position the button on the canvas
        const buttonX = config.width / 2;
        const buttonY = config.height / 2;

        startButton.style.position = 'absolute';
        startButton.style.left = `${buttonX - 239 / 2}px`;
        startButton.style.top = `${buttonY + 100}px`;

        // Add the button to the DOM
        document.body.appendChild(startButton);

        // Add a click event listener
        startButton.addEventListener('click', () => {
            document.body.removeChild(startButton);
            document.body.removeChild(title);
            document.body.removeChild(titleShadow);
            this.scene.start('WarScene');
        });
    }
}

class WarScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WarScene' });
        this.suits = ['Pikes', 'Tiles', 'Hearts', 'Clovers'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'A'];
        //this.ranks = ['2', '3', '4']; //for testing speed
        this.cardScale = 0.25;
        this.cardOffset = 400;
        this.cardHeight = 930;
        this.cardWidth = 655;
        this.textStyle = {
            fontSize: '30px',
            fill: '#fff',
            fontFamily: 'Arial, Helvetica, sans-serif' // Change font family here
        };
        this.warcardAnimationDelay = 500;
    }

    preload() {
        //this.load.image('card_back', 'assets/card_back.png')
        //this.load.image('background', 'assets/background.jpg');
        //this.load.audio('backgroundMusic', 'assets/WarGame.mp3');

        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                const key = `${suit}_${rank}_white`;
                const url = `assets/${key}.png`;
                this.load.image(key, url);
            }
        }
    }

    create() {
        console.log('create scene');

        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(config.width, config.height);
        this.backgroundMusic = this.sound.add('backgroundMusic');
        this.backgroundMusic.play({ loop: true });

        const suits = this.suits;
        const ranks = this.ranks;
        this.deck = [];

        function createCard(suit, rank) {
            return {
                suit: suit,
                rank: rank,
                getKey: function() {
                    return `${this.suit}_${this.rank}_white`;
                }
            };
        }

        function shuffleDeck(deck) {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        }

        this.deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                const card = createCard(suit, rank);
                this.deck.push(card);
            }
        }
        console.log('Deck created (before shuffle):', this.deck.slice(0, 5));
        this.deck = shuffleDeck(this.deck);
        console.log('Deck shuffled (after shuffle):', this.deck.slice(0, 5));

        this.player1Deck = [];
        this.player2Deck = [];

        while (this.deck.length > 0) {
            this.player1Deck.push(this.deck.shift());
            if (this.deck.length > 0) {
                this.player2Deck.push(this.deck.shift());
            }
        }

        console.log('Player 1 Deck:', this.player1Deck.length, 'cards');
        console.log('Player 2 Deck:', this.player2Deck.length, 'cards');
        console.log('Remaining Deck (should be empty):', this.deck.length);

        this.player1Card = null;
        this.player2Card = null;

        const cardScale = this.cardScale;
        const cardOffset = this.cardWidth * cardScale / 2 +20;
        const centerX = config.width / 2;
        const centerY = config.height / 2;

        this.player1PlayedCardSprite = this.add.sprite(centerX - cardOffset, centerY, null).setScale(cardScale).setDepth(1);
        this.player2PlayedCardSprite = this.add.sprite(centerX + cardOffset, centerY, null).setScale(cardScale).setDepth(1);

        this.warCardsP1Sprites = [];
        this.warCardsP2Sprites = [];
        this.warCardP1FaceUpSprite = null;
        this.warCardP2FaceUpSprite = null;

        const cardBackTexture = 'card_back';
        const cardBackScale = this.cardScale;

        const player1DeckX = 150;
        const player1DeckY = config.height - 200;
        this.player1DeckSprite = this.add.sprite(player1DeckX, player1DeckY, cardBackTexture).setScale(cardBackScale);

        const player2DeckX = config.width - 150;
        const player2DeckY = 200;
        this.player2DeckSprite = this.add.sprite(player2DeckX, player2DeckY, cardBackTexture).setScale(cardBackScale);

        const textOffsetY = 30 + this.cardHeight * this.cardScale / 2;

        this.player1DeckCountText = this.add.text(player1DeckX, player1DeckY + textOffsetY, `Cards: ${this.player1Deck.length}`, this.textStyle).setOrigin(0.5);
        this.player2DeckCountText = this.add.text(player2DeckX, player2DeckY + textOffsetY, `Cards: ${this.player2Deck.length}`, this.textStyle).setOrigin(0.5);

        this.player1Text = this.add.text(player1DeckX, player1DeckY - textOffsetY, 'Player 1', this.textStyle).setOrigin(0.5);
        this.player2Text = this.add.text(player2DeckX, player2DeckY - textOffsetY, 'Player 2', this.textStyle).setOrigin(0.5);

        this.startRound();
    }

    startRound() {
        console.log('Starting a new round...');

        this.player1PlayedCardSprite.setTexture(null);
        this.player2PlayedCardSprite.setTexture(null);

        if (this.player1Deck.length === 0) {
            console.log('Player 2 wins!');
            this.gameOver(2);
            return;
        }
        if (this.player2Deck.length === 0) {
            console.log('Player 1 wins!');
            this.gameOver(1);
            return;
        }

        this.player1Card = this.player1Deck.shift();
        this.player2Card = this.player2Deck.shift();

        console.log('Player 1 played:', this.player1Card.getKey());
        console.log('Player 2 played:', this.player2Card.getKey());

        this.animateCardFlip(this.player1PlayedCardSprite, this.player1Card.getKey(), this.cardScale);
        this.animateCardFlip(this.player2PlayedCardSprite, this.player2Card.getKey(), this.cardScale);

        this.compareCards();
    }

    animateCardFlip(sprite, newTexture, scale, duration = 200) {
        this.tweens.add({
            targets: sprite,
            scaleX: 0,
            duration: duration / 2,
            onComplete: () => {
                sprite.setTexture(newTexture);
                this.tweens.add({
                    targets: sprite,
                    scaleX: scale,
                    duration: duration / 2
                });
            }
        });
    }

    gameOver(winner) {
        let message = `Player ${winner} Wins!`;
        
        if(winner === 0) {
            message = 'Well, it\'s a draw!';
        }

        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }

        if (this.resumeButton) {
            document.body.removeChild(this.resumeButton); // Remove the button
            this.resumeButton = null;
        }

        if (this.highlightGraphics) {
            this.highlightGraphics.destroy();
        }

        this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(config.width, config.height).setDepth(2);
        this.overlay = this.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.5).setOrigin(0).setDepth(3);

        const gameOverText = document.createElement('h1');
        gameOverText.textContent = message;
        gameOverText.className = 'status-text';
        gameOverText.style.left = `${config.width / 2 - 215}px`;
        gameOverText.style.top = `${config.height / 2 - 140}px`;
        document.body.appendChild(gameOverText);

        const gameOverTextShadow = document.createElement('h1');
        gameOverTextShadow.textContent = message;
        gameOverTextShadow.className = 'status-text-shadow';
        gameOverTextShadow.style.left = `${config.width / 2 - 205}px`;
        gameOverTextShadow.style.top = `${config.height / 2 - 130}px`;
        document.body.appendChild(gameOverTextShadow);

        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'Play Again';
        playAgainButton.className = 'menu-button'; // Apply CSS class

        // Position the button on the canvas
        const buttonX = config.width / 2;
        const buttonY = config.height / 2 + 50;

        playAgainButton.style.position = 'absolute';
        playAgainButton.style.left = `${buttonX - 239 / 2}px`;
        playAgainButton.style.top = `${buttonY - 51 / 2}px`;

        // Add the button to the DOM
        document.body.appendChild(playAgainButton);

        // Add a click event listener
        playAgainButton.addEventListener('click', () => {
            this.scene.restart();
            document.body.removeChild(playAgainButton);
            document.body.removeChild(gameOverText);
            document.body.removeChild(gameOverTextShadow);
        });
    }

    compareCards() {
        console.log('Comparing cards...');
        const rankOrder = this.ranks;
        const player1RankIndex = rankOrder.indexOf(this.player1Card.rank);
        const player2RankIndex = rankOrder.indexOf(this.player2Card.rank);

        if (player1RankIndex > player2RankIndex) {
            console.log('Player 1 wins the round!');
            this.awardCards(1, [this.player1Card, this.player2Card]);
            this.highlightCard(this.player1PlayedCardSprite, false, 1);
        } else if (player2RankIndex > player1RankIndex) {
            console.log('Player 2 wins the round!');
            this.awardCards(2, [this.player1Card, this.player2Card]);
            this.highlightCard(this.player2PlayedCardSprite, false, 2);
        } else {
            console.log('War!');
            this.handleWar();
        }
    }

    awardCards(winner, cards, fromWar = false) {
        console.log(`Awarding ${cards.length} cards to Player ${winner}`);
        this.time.delayedCall(300, () => {
            if (winner === 1) {
                this.player1Deck.push(...cards);
            } else if (winner === 2) {
                this.player2Deck.push(...cards);
            }
            this.player1DeckCountText.setText(`Cards: ${this.player1Deck.length}`);
            this.player2DeckCountText.setText(`Cards: ${this.player2Deck.length}`);

            if (!fromWar) {
                this.time.delayedCall(1000, this.startRound, [], this);
            }
        }, [], this);
    }

    handleWar() {
        console.log('Handling War!');

        if (this.player1Deck.length < 4 || this.player2Deck.length < 4) {
            console.log('One player does not have enough cards for War!');
            const player1HasMore = this.player1Deck.length > this.player2Deck.length;
            const warPot = [this.player1Card, this.player2Card];
            if (this.warCardsP1) warPot.push(...this.warCardsP1);
            if (this.warCardsP2) warPot.push(...this.warCardsP2);
            if (this.warCardP1FaceUp) warPot.push(this.warCardP1FaceUp);
            if (this.warCardP2FaceUp) warPot.push(this.warCardP2FaceUp);

            console.log('War Pot:', warPot.length, warPot.map(card => card.getKey()));

            if (player1HasMore) {
                console.log('Player 1 wins the War (due to insufficient cards)!');
                this.awardCards(1, warPot);
            } else if (this.player1Deck.length < this.player2Deck.length) {
                console.log('Player 2 wins the War (due to insufficient cards)!');
                this.awardCards(2, warPot);
            } else {
                console.log('War ends in a draw (both players out of cards?) - This shouldn\'t ideally happen.');
                this.gameOver(0);
            }

            this.warCardsP1 = null;
            this.warCardsP2 = null;
            this.warCardP1FaceUp = null;
            this.warCardP2FaceUp = null;

            return;
        }

        console.log('Both players have enough cards for War.');

        this.overlay = this.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.8).setOrigin(0).setDepth(2); // Depth 2 to be above the main scene

        this.warCardsP1 = [];
        this.warCardsP2 = [];

        this.warCardsP1Sprites.forEach(sprite => sprite.destroy());
        this.warCardsP2Sprites.forEach(sprite => sprite.destroy());
        if (this.warCardP1FaceUpSprite) this.warCardP1FaceUpSprite.destroy();
        if (this.warCardP2FaceUpSprite) this.warCardP2FaceUpSprite.destroy();
        this.warCardsP1Sprites = [];
        this.warCardsP2Sprites = [];
        this.warCardP1FaceUpSprite = null;
        this.warCardP2FaceUpSprite = null;

        const cardScale = this.cardScale;
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        const warCardOffsetX = (this.cardWidth * cardScale / 2) - 30;
        const warCardOffsetY = (this.cardHeight * cardScale / 2) - 50;

        const p1WarStartX = centerX - this.cardOffset / 2 - warCardOffsetX * 2;
        const p1WarY = centerY + warCardOffsetY;

        const p2WarStartX = centerX + this.cardOffset / 2 + warCardOffsetX * 2;
        const p2WarY = centerY + warCardOffsetY;

        let delay = this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            const cardP1_1 = this.player1Deck.shift();
            this.warCardsP1.push(cardP1_1);
            const spriteP1_1 = this.add.sprite(p1WarStartX, p1WarY, null).setScale(cardScale).setDepth(3);
            this.warCardsP1Sprites.push(spriteP1_1);
            this.showWarCard(spriteP1_1, 'card_back', 0);
        }, [], this);

        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            const cardP1_2 = this.player1Deck.shift();
            this.warCardsP1.push(cardP1_2);
            const spriteP1_2 = this.add.sprite(p1WarStartX + warCardOffsetX, p1WarY, null).setScale(cardScale).setDepth(3);
            this.warCardsP1Sprites.push(spriteP1_2);
            this.showWarCard(spriteP1_2, 'card_back', 0);
        }, [], this);

        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            const cardP1_3 = this.player1Deck.shift();
            this.warCardsP1.push(cardP1_3);
            const spriteP1_3 = this.add.sprite(p1WarStartX + 2 * warCardOffsetX, p1WarY, null).setScale(cardScale).setDepth(3);
            this.warCardsP1Sprites.push(spriteP1_3);
            this.showWarCard(spriteP1_3, 'card_back', 0);
        }, [], this);

        // Create and display Player 2's war cards with delays
        delay = this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            const cardP2_1 = this.player2Deck.shift();
            this.warCardsP2.push(cardP2_1);
            const spriteP2_1 = this.add.sprite(p2WarStartX, p2WarY, null).setScale(cardScale).setDepth(3);
            this.warCardsP2Sprites.push(spriteP2_1);
            this.showWarCard(spriteP2_1, 'card_back', 0);
        }, [], this);

        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            const cardP2_2 = this.player2Deck.shift();
            this.warCardsP2.push(cardP2_2);
            const spriteP2_2 = this.add.sprite(p2WarStartX - warCardOffsetX, p2WarY, null).setScale(cardScale).setDepth(3);
            this.warCardsP2Sprites.push(spriteP2_2);
            this.showWarCard(spriteP2_2, 'card_back', 0);
        }, [], this);

        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            const cardP2_3 = this.player2Deck.shift();
            this.warCardsP2.push(cardP2_3);
            const spriteP2_3 = this.add.sprite(p2WarStartX - 2 * warCardOffsetX, p2WarY, null).setScale(cardScale).setDepth(3);
            this.warCardsP2Sprites.push(spriteP2_3);
            this.showWarCard(spriteP2_3, 'card_back', 0);
        }, [], this);

        // Create and display face-up cards with delays
        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            this.warCardP1FaceUp = this.player1Deck.shift();
            this.warCardP1FaceUpSprite = this.add.sprite(p1WarStartX + 3 * warCardOffsetX + 40, p1WarY, null).setScale(cardScale).setDepth(3);
            this.showWarCard(this.warCardP1FaceUpSprite, this.warCardP1FaceUp.getKey(), 0, true);
        }, [], this);

        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            this.warCardP2FaceUp = this.player2Deck.shift();
            this.warCardP2FaceUpSprite = this.add.sprite(p2WarStartX - 3 * warCardOffsetX - 40, p2WarY, null).setScale(cardScale).setDepth(3);
            this.showWarCard(this.warCardP2FaceUpSprite, this.warCardP2FaceUp.getKey(), 0, true);
        }, [], this);

        delay += this.warcardAnimationDelay;
        this.time.delayedCall(delay, () => {
            console.log('Player 1 war card:', this.warCardP1FaceUp.getKey());
            console.log('Player 2 war card:', this.warCardP2FaceUp.getKey());
            this.showContinueWar();
            this.compareWarCards();
        }, [], this);
    }

    showContinueWar() {
        this.resumeButton = document.createElement('button');
        this.resumeButton.textContent = 'Continue';
        this.resumeButton.className = 'menu-button'; // Apply CSS class

        // Position the button on the canvas
        const buttonX = config.width / 2;
        const buttonY = config.height / 2 + 250;

        this.resumeButton.style.position = 'absolute';
        this.resumeButton.style.left = `${buttonX - 239 / 2}px`;
        this.resumeButton.style.top = `${buttonY - 51 / 2}px`;

        // Add the button to the DOM
        document.body.appendChild(this.resumeButton);

        // Add a click event listener
        this.resumeButton.addEventListener('click', () => {
            this.resumeGame();
        });
    }

    resumeGame() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }

        if (this.resumeButton) {
            document.body.removeChild(this.resumeButton); // Remove the button
            this.resumeButton = null;
        }

        if (this.highlightGraphics) {
            this.highlightGraphics.destroy();
        }

        this.warCardsP1Sprites.forEach(sprite => sprite.destroy());
        this.warCardsP2Sprites.forEach(sprite => sprite.destroy());
        if (this.warCardP1FaceUpSprite) this.warCardP1FaceUpSprite.destroy();
        if (this.warCardP2FaceUpSprite) this.warCardP2FaceUpSprite.destroy();
        this.warCardsP1Sprites = [];
        this.warCardsP2Sprites = [];
        this.warCardP1FaceUpSprite = null;
        this.warCardP2FaceUpSprite = null;

        this.time.delayedCall(500, this.startRound, [], this);
    }

    showWarCard(sprite, texture, delay, frontCard = false) {
        if (!frontCard) {
            this.time.delayedCall(delay, () => {
                sprite.setTexture(texture);
            }, [], this);
            return;
        }
        this.animateCardFlip(sprite, texture, this.cardScale);
    }

    highlightCard(sprite, war = false, player = 0) {
        this.time.delayedCall(250, () => {
            const lineWidth = 4;
            const lineOffset = 10;
            const highlightStyle = { 
                lineStyle: { 
                    width: lineWidth, 
                    color: 0xffff00,
                },
            }
            if(player === 1) {
                highlightStyle.lineStyle.color = 0xf09a00;
            }
            this.highlightGraphics = this.add.graphics(highlightStyle).setDepth(1);
            if(war) {
                this.highlightGraphics.setDepth(4);
            }
            const bounds = sprite.getBounds();
            this.highlightGraphics.strokeRect(bounds.x - lineOffset, bounds.y - lineOffset, bounds.width + lineOffset*2, bounds.height + lineOffset*2);

            if(!war) {
                this.time.delayedCall(850, () => {
                    this.highlightGraphics.destroy();
                }, [], this);
            }
        }, [], this);
    }

    compareWarCards() {
        console.log('Comparing War Cards...');
        const rankOrder = this.ranks;
        const player1RankIndex = rankOrder.indexOf(this.warCardP1FaceUp.rank);
        const player2RankIndex = rankOrder.indexOf(this.warCardP2FaceUp.rank);

        const warPot = [this.player1Card, this.player2Card, ...this.warCardsP1, ...this.warCardsP2, this.warCardP1FaceUp, this.warCardP2FaceUp];

        if (player1RankIndex > player2RankIndex) {
            console.log('Player 1 wins the War!');
            this.awardCards(1, warPot, true);
            this.highlightCard(this.warCardP1FaceUpSprite, true, 1);
        } else if (player2RankIndex > player1RankIndex) {
            console.log('Player 2 wins the War!');
            this.awardCards(2, warPot, true);
            this.highlightCard(this.warCardP2FaceUpSprite, true, 2);
        } else {
            console.log('Another War!');
            this.handleWar();
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [PreloaderScene, MenuScene, WarScene]
};

const game = new Phaser.Game(config);