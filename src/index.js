const GRID_SIZE = 4;
const CARD_SIZE = 115;
const CARD_OFFSET = 25;
const TIME_TO_SHOW = 1000;
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

const getRandomPictureInt = () => {
    const arrPictures = PICTURES.filter(pic => pic != null);
    const newRandom = Math.floor(Math.random() * Math.floor(arrPictures.length - 1));
    return PICTURES.findIndex(pic => pic === arrPictures[newRandom]);
};

class Card {
    constructor(id, x, y) {
        this.id = id;
        this.position = {
            x: x,
            y: y
        };
        this.isOpen = false;
        this.drawRect();
        this.setPicture();
    }

    drawRect() {
        ctx.fillStyle = "#ffec46";
        ctx.fillRect(this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
    }

    open() {
        const img = new Image();
        img.addEventListener("load", () => {
            ctx.drawImage(img, this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
        }, false);
        img.src = "images/" + this.picture;
        this.isOpen = true;
    }

    close() {
        ctx.clearRect(this.position.x, this.position.y, CARD_SIZE, CARD_SIZE);
        this.drawRect();
        this.isOpen = false;
    }

    setPicture() {
        const randomInt = getRandomPictureInt();
        const pictureItem = PICTURES[randomInt];
        if (pictureItem != null) {
            this.picture = PICTURES[randomInt];
            PICTURES[randomInt] = undefined;
        } else {
            this.setPicture();
        }
    }

    reset
}

(function draw() {
    let counter = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const positionX = (i * (CARD_SIZE + CARD_OFFSET)) + CARD_OFFSET;
            const positionY = (j * (CARD_SIZE + CARD_OFFSET)) + CARD_OFFSET;
            // draw shape
            const card = new Card(counter, positionX, positionY);
            cards.push(card);
            counter++;
        }
    }

    console.log("CARDS:", cards);
})();

const checkCardsMatch = (card1, card2) => card1.picture === card2.picture;

function isIntersect(point, card) {
    const cardStartX = card.position.x;
    const cardStartY = card.position.y;
    const cardEndX = cardStartX + CARD_SIZE;
    const cardEndY = cardStartY + CARD_SIZE;
    return point.x >= cardStartX && point.x <= cardEndX && point.y >= cardStartY && point.y <= cardEndY;
}

canvas.addEventListener("click", e => {
    const mousePoint = {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop
    }
    // TODO: fix error when open 3 card step by step (didn't wait TIME_TO_SHOW ms);
    cards.forEach(card => {
        if (isIntersect(mousePoint, card) && !card.isOpen) {
            card.open();
            if (lastClickedCard !== undefined) {
                if (!checkCardsMatch(card, lastClickedCard)) {
                    const timer = setTimeout(() => {
                        card.close();
                        lastClickedCard.close();
                        lastClickedCard = undefined;
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
        console.log("YOU ARE WINNER!!!");
    }
});
