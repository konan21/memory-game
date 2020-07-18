const GRID_SIZE = 4;
const CARD_SIZE = 115;  // TODO: move to Card class
const CARD_OFFSET = 25; // TODO: move to Card class
const TIME_TO_SHOW = 1000;

let isGameFreezed = false;
let PICTURES = [
    "art-parodies.jpg",
    "color-scheme.jpg",
    "golden-ratio-in-square.jpg",
    "mac.jpg",
    "marvel-thanos.jpg",
    "puppy.jpg",
    "star-wars.jpg",
    "trump.jpg"
];
PICTURES = [...PICTURES, ...PICTURES]

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cards = [];
const cardsMatch = [];
let lastClickedCard;

class Card {
    constructor(id, x, y) {
        this.id = id;
        this.position = {
            x: x,
            y: y
        };
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setPicture();
        this.drawRect();
    }

    drawRect() {
        ctx.fillStyle = "#ffec46";
        ctx.fillRect(this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
    }

    open() {
        const img = new Image();
        img.addEventListener("load", () => {
            // this.flipHorizontally();
            ctx.drawImage(img, this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
        }, false);
        img.src = "images/" + this.picture;
        this.pictureInstance = img;
        this.isOpen = true;
    }

    close() {
        ctx.clearRect(this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
        this.drawRect();
        this.isOpen = false;
    }

    flipCard(timestamp) {
        ctx.clearRect(this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
        this.flipHorizontally();
        window.requestAnimationFrame(this.flipCard);
    }

    flipHorizontally() {
        ctx.translate(canvas.width / 2, 0);
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width / 2, 0);
    }

    setPicture() {
        const id = this.getRandomPictureId();
        const pictureItem = PICTURES[id];
        if (pictureItem != null) {
            this.picture = PICTURES[id];
            PICTURES[id] = undefined;
        } else {
            this.setPicture();
        }
    }

    getRandomPictureId () {
        const arrPictures = PICTURES.filter(pic => pic != null);
        const newRandom = Math.floor(Math.random() * Math.floor(arrPictures.length - 1));
        return PICTURES.findIndex(pic => pic === arrPictures[newRandom]);
    }
}

(function draw() {
    let counter = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const startX = (canvas.width - ((CARD_SIZE + CARD_OFFSET) * GRID_SIZE)) / 2;
            const startY = (canvas.height - ((CARD_SIZE + CARD_OFFSET) * GRID_SIZE)) / 2;
            const positionX = startX + (i * (CARD_SIZE + CARD_OFFSET)) + (CARD_OFFSET / 2);
            const positionY = startY + (j * (CARD_SIZE + CARD_OFFSET)) + (CARD_OFFSET / 2);
            // draw shape
            const card = new Card(counter, positionX, positionY);
            cards.push(card);
            counter++;
        }
    }

    console.log("CARDS:", cards);
})();

const drawWinning = () => {
    const text = "YOU ARE WINNER!!!"
    ctx.clearRect(0, (canvas.height / 2) - 32, canvas.width, 32);
    ctx.font = "28px Arial, sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    console.log(text);
};

const checkCardsMatch = (card1, card2) => card1.picture === card2.picture;

const isIntersect = (point, card) => {
    const cardStartX = card.position.x;
    const cardStartY = card.position.y;
    const cardEndX = cardStartX + CARD_SIZE;
    const cardEndY = cardStartY + CARD_SIZE;
    return point.x >= cardStartX && point.x <= cardEndX && point.y >= cardStartY && point.y <= cardEndY;
};

const getMousePosition = (e) => {
    return {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop
    };
};

canvas.addEventListener("click", e => {
    if (isGameFreezed) {
        return;
    }
    const mousePoint = getMousePosition(e);
    cards.forEach(card => {
        if (isIntersect(mousePoint, card) && !card.isOpen) {
            card.open();
            if (lastClickedCard !== undefined) {
                if (!checkCardsMatch(card, lastClickedCard)) {
                    isGameFreezed = true;
                    const timer = setTimeout(() => {
                        card.close();
                        lastClickedCard.close();
                        lastClickedCard = undefined;
                        isGameFreezed = false;
                        clearTimeout(timer);
                    }, TIME_TO_SHOW);
                } else {
                    cardsMatch.push(card, lastClickedCard);
                    lastClickedCard = undefined;
                }
            } else {
                lastClickedCard = card;
            }

            console.log(`CARD ${card.id} was clicked`, card);
        }
    });
    if (cardsMatch.length === cards.length) {
        drawWinning();
    }
});
