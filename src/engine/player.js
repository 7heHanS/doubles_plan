export class Player {
    constructor(id, isAI = false) {
        this.id = id;
        this.isAI = isAI;
        this.hand = [];
        this.totalScore = 0;
        this.currentSetWins = 0;
    }

    addTile(tile) {
        this.hand.push(tile);
        // Sort hand for user convenience (descending by number)
        this.hand.sort((a, b) => b.number - a.number);
    }

    removeTile(tileIndex) {
        return this.hand.splice(tileIndex, 1)[0];
    }

    resetHand() {
        this.hand = [];
    }

    addScore(points) {
        this.totalScore += points;
    }
}
