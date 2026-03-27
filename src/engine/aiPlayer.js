import { ALL_TILES } from './tile.js';

/**
 * [UI Rendering Context]
 * - AI Entity Name for UI: "인공지능 전략가" (DO NOT USE "AI STRATEGIST")
 * - Player Entity Name for UI: "플레이어"
 */
export class AIPlayer {
    constructor(playerObj) {
        this.player = playerObj; // Reference to Player object in engine
        this.opponentHandColors = []; // Colors of opponent's tiles (red/black)
        this.opponentPlayedTiles = []; // Tiles opponent already played
    }

    // Phase 1: Block Selection (Drafting)
    // Drafting logic for AI: Prefer tiles that can create Double/Reverse synergy
    selectDraftTiles(deck) {
        const redTiles = deck.filter(t => t.color === 'red');
        const blackTiles = deck.filter(t => t.color === 'black');

        // Simple heuristic: Try to pick numbers that have double/half relations
        const selected = [];

        // Select 3 Reds
        this.shuffle(redTiles);
        for(let i=0; i<3; i++) selected.push(redTiles[i]);

        // Select 2 Blacks
        this.shuffle(blackTiles);
        for(let i=0; i<2; i++) selected.push(blackTiles[i]);

        return selected;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    updateOpponentInfo(colors, playedTile = null) {
        if (colors) this.opponentHandColors = [...colors];
        if (playedTile) {
            this.opponentPlayedTiles.push(playedTile);
            const idx = this.opponentHandColors.indexOf(playedTile.color);
            if (idx !== -1) this.opponentHandColors.splice(idx, 1);
        }
    }

    // Phase 3: Tile Play (Decision Making)
    decideTileToPlay(opponentPlayedTile = null) {
        const myHand = this.player.hand;

        if (opponentPlayedTile) {
            return this.bestProbabilisticResponse(opponentPlayedTile.color, myHand);
        } else {
            return this.proactivePlay(myHand);
        }
    }

    bestProbabilisticResponse(oppColor, myHand) {
        const possibleOpponentTiles = ALL_TILES.filter(t =>
            t.color === oppColor &&
            !this.player.hand.some(myT => myT.number === t.number) &&
            !this.opponentPlayedTiles.some(pT => pT.number === t.number)
        );

        let bestTileIdx = 0;
        let maxExpectedValue = -999;

        myHand.forEach((myTile, index) => {
            let totalScore = 0;
            possibleOpponentTiles.forEach(oppT => {
                totalScore += this.evaluateMatchup(myTile, oppT);
            });

            const ev = totalScore / (possibleOpponentTiles.length || 1);
            if (ev > maxExpectedValue) {
                maxExpectedValue = ev;
                bestTileIdx = index;
            }
        });

        return bestTileIdx;
    }

    proactivePlay(myHand) {
        return Math.floor(Math.random() * myHand.length);
    }

    evaluateMatchup(myTile, oppTile) {
        const n1 = myTile.number;
        const n2 = oppTile.number;

        if (n1 === n2) return 0;

        const high = Math.max(n1, n2);
        const low = Math.min(n1, n2);
        const isMeHigh = n1 > n2;

        if (high === low * 2) return isMeHigh ? 2 : -2; // Double
        if (high > low * 2) return isMeHigh ? -1 : 1;  // Reverse
        return isMeHigh ? 1 : -1;                     // Basic
    }
}