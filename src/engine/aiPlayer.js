import { ALL_TILES } from './tile.js';

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
        // e.g., if we pick 3, 6 is good. If we pick 5, 10 is good.
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
            [array[i], array[j]] = [array[j], array[array[i]]];
        }
    }

    updateOpponentInfo(colors, playedTile = null) {
        if (colors) this.opponentHandColors = [...colors];
        if (playedTile) {
            this.opponentPlayedTiles.push(playedTile);
            // Remove one instance of the color from handColors
            const idx = this.opponentHandColors.indexOf(playedTile.color);
            if (idx !== -1) this.opponentHandColors.splice(idx, 1);
        }
    }

    // Phase 3: Tile Play (Decision Making)
    decideTileToPlay(opponentPlayedTile = null) {
        const myHand = this.player.hand;
        
        if (opponentPlayedTile) {
            // AI is 2nd player: Know opponent's color (and number for simplicity in this version, 
            // but rule says "Check color then submit")
            // Actually rule says: "선 제출 -> 후 확인 후 제출". 
            // Usually "확인" means seeing the color of the back.
            
            return this.bestResponse(opponentPlayedTile, myHand);
        } else {
            // AI is 1st player: Submit based on expected value
            return this.proactivePlay(myHand);
        }
    }

    bestResponse(oppTile, myHand) {
        // Evaluate each tile in hand against the specific opponent tile
        let bestTileIdx = 0;
        let bestResult = -999;

        myHand.forEach((tile, index) => {
            const score = this.evaluateMatchup(tile, oppTile);
            if (score > bestResult) {
                bestResult = score;
                bestTileIdx = index;
            }
        });

        return bestTileIdx;
    }

    proactivePlay(myHand) {
        // Proactive: Play middle-ground or bait
        // For now, random or slightly weighted towards middle
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
