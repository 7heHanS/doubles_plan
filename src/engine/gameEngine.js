import { Tile, ALL_TILES } from './tile.js';
import { Player } from './player.js';
import { AIPlayer } from './aiPlayer.js';
import { UIController } from '../ui/uiController.js';

export const PHASES = {
    INIT: 'INIT',
    DRAFTING: 'DRAFTING',
    BATTLE: 'BATTLE',
    SCORING: 'SCORING',
    END: 'END'
};

export class GameEngine {
    constructor() {
        this.player = new Player('human', false);
        this.ai = new Player('ai', true);
        this.aiStrategy = new AIPlayer(this.ai);
        
        this.currentSet = 1;
        this.currentRound = 0;
        this.phase = PHASES.INIT;
        this.battleHistory = [];
        this.deck = [];
    }

    initGame() {
        this.player.totalScore = 0;
        this.ai.totalScore = 0;
        this.currentSet = 1;
        this.startSet();
    }

    startSet() {
        this.phase = PHASES.DRAFTING;
        this.currentRound = 1;
        this.player.resetHand();
        this.ai.resetHand();
        
        // 덱 준비 및 셔플
        this.deck = ALL_TILES.map(t => t.clone());
        this.shuffle(this.deck);
        
        // AI 드래프트 전략 실행
        const aiSelected = this.aiStrategy.selectDraftTiles(this.deck);
        aiSelected.forEach(tile => {
            const idx = this.deck.findIndex(t => t.number === tile.number && t.color === tile.color);
            if (idx !== -1) {
                this.ai.addTile(this.deck.splice(idx, 1)[0]);
            }
        });
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    draftTile(color) {
        if (this.phase !== PHASES.DRAFTING) return false;
        
        const tileIdx = this.deck.findIndex(t => t.color === color);
        if (tileIdx !== -1) {
            const tile = this.deck.splice(tileIdx, 1)[0];
            this.player.addTile(tile);
            
            // 플레이어 드래프트 완료 체크 (3빨강, 2검정)
            const rCount = this.player.hand.filter(t => t.color === 'red').length;
            const bCount = this.player.hand.filter(t => t.color === 'black').length;
            
            if (rCount === 3 && bCount === 2) {
                this.phase = PHASES.BATTLE;
                // AI에게 플레이어의 타일 색상 정보 제공
                this.aiStrategy.updateOpponentInfo(this.player.hand.map(t => t.color));
                return true;
            }
        }
        return false;
    }

    evaluateBattle(p1Tile, p2Tile) {
        const n1 = p1Tile.number;
        const n2 = p2Tile.number;
        
        if (n1 === n2) return { winner: null, winType: 'draw' };
        
        const high = Math.max(n1, n2);
        const low = Math.min(n1, n2);
        const isN1High = n1 > n2;

        if (high === low * 2) {
            // 더블승: 높은 숫자 승리
            return { winner: isN1High ? 'p1' : 'p2', winType: 'double' };
        } else if (high > low * 2) {
            // 역전승: 낮은 숫자 승리
            return { winner: isN1High ? 'p2' : 'p1', winType: 'comeback' };
        } else {
            // 기본승: 높은 숫자 승리
            return { winner: isN1High ? 'p1' : 'p2', winType: 'basic' };
        }
    }

    calculatePoints(winType) {
        if (winType === 'draw') return 0;
        const set = this.currentSet;
        if (set === 1) return 1;
        if (set === 2) return winType === 'double' ? 2 : 1;
        return winType === 'double' ? 4 : 2; // 3, 4세트
    }

    resolveRound(playerTile, aiTile) {
        if (this.phase !== PHASES.BATTLE) return null;

        const result = this.evaluateBattle(playerTile, aiTile);
        const points = this.calculatePoints(result.winType);
        
        if (result.winner === 'p1') this.player.addScore(points);
        else if (result.winner === 'p2') this.ai.addScore(points);

        // AI 학습: 공개된 타일 정보 업데이트
        this.aiStrategy.updateOpponentInfo(null, playerTile);

        this.currentRound++;
        if (this.currentRound > 5) {
            this.endSet();
        }
        
        return { ...result, points };
    }

    endSet() {
        if (this.currentSet >= 4) {
            this.phase = PHASES.END;
        } else {
            this.currentSet++;
            this.startSet();
        }
    }
}

// 브라우저 환경 초기화 코드
document.addEventListener('DOMContentLoaded', () => {
    try {
        const engine = new GameEngine();
        const ui = new UIController(engine);
        window.gameInstance = engine; // 디버깅용 전역 참조
        window.uiInstance = ui;
        console.log('Doubles Plan: 모든 모듈이 성공적으로 로드되었습니다.');
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        alert('게임 초기화 중 오류가 발생했습니다. 콘솔을 확인해 주세요.');
    }
});
