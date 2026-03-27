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

    resetForNewSet() {
        this.opponentHandColors = [];
        this.opponentPlayedTiles = [];
    }

    // ─── 교대 드래프트: 1장씩 선택 ─────────────────────────
    selectOneDraftTile(deck, currentAIHand, limits) {
        // 가능한 색상 결정
        const canRed = limits.canPickRed && deck.some(t => t.color === 'red');
        const canBlack = limits.canPickBlack && deck.some(t => t.color === 'black');

        if (canRed && canBlack) {
            // 전략적 선택: 더블/역전 시너지를 고려한 휴리스틱
            // 빨강(3~9 중간 숫자)과 검정(1,2,10,11,12 극단 숫자)의 균형
            const redRemaining = 3 - limits.redCount;
            const blackRemaining = 2 - limits.blackCount;
            
            // 남은 필수 픽 비율에 따라 우선 선택
            if (blackRemaining > 0 && Math.random() < 0.4) {
                return 'black';
            }
            return 'red';
        } else if (canRed) {
            return 'red';
        } else if (canBlack) {
            return 'black';
        }
        return 'red'; // fallback
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

    // ─── 배틀: AI가 선공일 때 (먼저 제출) ──────────────────
    decideFirstSubmit() {
        const myHand = this.player.hand;
        // 선공은 상대 카드를 모르므로 전략적 proactive play
        // 중간 가치 카드를 우선 사용하는 전략
        if (myHand.length <= 1) return 0;

        let bestIdx = 0;
        let bestScore = -Infinity;

        myHand.forEach((tile, idx) => {
            // 중간 숫자를 선호 (극단값은 후반 보유)
            const midScore = -Math.abs(tile.number - 6.5);
            // 약간의 랜덤성 추가
            const score = midScore + (Math.random() * 2 - 1);
            if (score > bestScore) {
                bestScore = score;
                bestIdx = idx;
            }
        });

        return bestIdx;
    }

    // ─── 배틀: AI가 후공일 때 (상대 색상 확인 후 대응) ───────
    decideResponseSubmit(opponentColor) {
        return this.bestProbabilisticResponse(opponentColor, this.player.hand);
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