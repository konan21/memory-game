class Card {
    constructor(ctx, id, pictureName) {
        this.ctx = ctx;
        this.id = id;
        this.pictureSrc = "images/" + pictureName;
        this.position = {
            x: 0,
            y: 0
        };
        this.width = 115;
        this.height = 115;
        this.offset = 25;
        this.isOpen = false;
    }

    init() {
        this.drawRect();
    }

    drawRect() {
        this.ctx.fillStyle = "#ffec46";
        this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    open() {
        this.clear();
        const img = new Image();
        img.addEventListener("load", () => {
            this.ctx.drawImage(img, this.position.x, this.position.y, this.width, this.height);
        }, false);
        img.src = this.pictureSrc;
        this.isOpen = true;
    }

    close() {
        this.clear();
        this.drawRect();
        this.isOpen = false;
    }

    containsPoint(point) {
        const cardStartX = this.position.x;
        const cardStartY = this.position.y;
        const cardEndX = cardStartX + this.width;
        const cardEndY = cardStartY + this.height;
        return point.x >= cardStartX && point.x <= cardEndX && point.y >= cardStartY && point.y <= cardEndY;
    }

    clear() {
        this.ctx.clearRect(this.position.x - 1, this.position.y - 1, this.width + 2, this.height + 2);
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.gridSize = 4;
        this.timeShow = 1000;
        this.isFreezed = false;

        this.cards = [];
        this.cardsMatch = [];
        this.lastClickedCard = undefined;

        this.pictures = [
            "art-parodies.jpg",
            "color-scheme.jpg",
            "golden-ratio-in-square.jpg",
            "mac.jpg",
            "marvel-thanos.jpg",
            "puppy.jpg",
            "star-wars.jpg",
            "trump.jpg"
        ];
        this.pictures = [...this.pictures, ...this.pictures]
    }

    init() {
        this.draw();
        this.initEventListeners();
    }

    draw() {
        let counter = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                // draw shape
                const pictureName = this.getRandomPicture();
                const card = new Card(this.ctx, counter, pictureName);
                const startX = (this.canvas.width - ((card.width + card.offset) * this.gridSize)) / 2;
                const startY = (this.canvas.height - ((card.height + card.offset) * this.gridSize)) / 2;
                card.position.x = startX + (i * (card.width + card.offset)) + (card.offset / 2);
                card.position.y = startY + (j * (card.height + card.offset)) + (card.offset / 2);
                card.init();
                this.cards.push(card);
                counter++;
            }
        }

        console.log("CARDS:", this.cards);
    }

    drawWinning() {
        const text = "YOU ARE WINNER!!!"
        this.ctx.clearRect(0, (this.canvas.height / 2) - 32, this.canvas.width, 32);
        this.ctx.font = "28px Arial, sans-serif";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
        console.log(text);
    }

    getRandomPicture() {
        const getRandomPictureId = () => {
            const arrPictures = this.pictures.filter(pic => pic != null);
            const newRandom = Math.floor(Math.random() * Math.floor(arrPictures.length - 1));
            return this.pictures.findIndex(pic => pic === arrPictures[newRandom]);
        };
        const id = getRandomPictureId();
        const pictureItem = this.pictures[id];
        if (pictureItem != null) {
            const picture = this.pictures[id];
            this.pictures[id] = undefined;
            return picture;
        } else {
            this.getRandomPicture();
        }
    }

    checkCardsMatch(card1, card2) {
        return card1.pictureSrc === card2.pictureSrc;
    }

    getMousePosition(e) {
        return {
            x: e.clientX - this.canvas.offsetLeft,
            y: e.clientY - this.canvas.offsetTop
        };
    };

    initEventListeners() {
        this.canvas.addEventListener("click", e => {
            if (this.isFreezed) {
                return;
            }
            const mousePoint = this.getMousePosition(e);
            this.cards.forEach(card => {
                if (card.containsPoint(mousePoint) && !card.isOpen) {
                    card.open();
                    if (this.lastClickedCard !== undefined) {
                        if (!this.checkCardsMatch(card, this.lastClickedCard)) {
                            this.isFreezed = true;
                            const timer = setTimeout(() => {
                                card.close();
                                this.lastClickedCard.close();
                                this.lastClickedCard = undefined;
                                this.isFreezed = false;
                                clearTimeout(timer);
                            }, this.timeShow);
                        } else {
                            this.cardsMatch.push(card, this.lastClickedCard);
                            this.lastClickedCard = undefined;
                        }
                    } else {
                        this.lastClickedCard = card;
                    }

                    console.log(`CARD ${card.id} was clicked`, card);
                }
            });
            if (this.cardsMatch.length === this.cards.length) {
                this.drawWinning();
            }
        });
    }
}

const canvas = document.getElementById("canvas");
const game = new Game(canvas);
game.init();
