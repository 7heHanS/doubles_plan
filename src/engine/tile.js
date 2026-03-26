export class Tile {
    constructor(number, color) {
        this.number = number;
        this.color = color; // 'red' or 'black'
        this.isRevealed = false;
    }

    get colorClass() {
        return this.color;
    }

    clone() {
        return new Tile(this.number, this.color);
    }
}

export const ALL_TILES = [
    new Tile(3, 'red'), new Tile(4, 'red'), new Tile(5, 'red'),
    new Tile(6, 'red'), new Tile(7, 'red'), new Tile(8, 'red'),
    new Tile(9, 'red'),
    new Tile(1, 'black'), new Tile(2, 'black'), new Tile(10, 'black'),
    new Tile(11, 'black'), new Tile(12, 'black')
];
