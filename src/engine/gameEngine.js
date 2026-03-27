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
        this.deck = [];

        // 선공 관리
        this.firstPlayer = null; // 'human' or 'ai'

        // 교대 드래프트 상태
        this.draftTurn = null;   // 'human' or 'ai'
        this.draftCount = 0;     // 0~9 (총 10픽)
        this.draftBoard = { human: [], ai: [] }; // 색상 공개 기록

        // 비동기 순차 배틀 상태
        this.battleTurn = null;
        this.pendingFirstTile = null;  // 선공이 제출한 카드
        this.pendingFirstPlayer = null; // 먼저 제출한 쪽 ('human' or 'ai')
    }

    // ─── 게임 초기화 ───────────────────────────────────────
    initGame() {
        this.player.totalScore = 0;
        this.ai.totalScore = 0;
        this.currentSet = 1;
        this.firstPlayer = null;
        this.determineFirstPlayer();
        this.startSet();
    }

    // ─── 선공 결정 ────────────────────────────────────────
    determineFirstPlayer() {
        if (this.currentSet === 1) {
            // 1세트: 주사위(50:50 난수)
            this.firstPlayer = Math.random() < 0.5 ? 'human' : 'ai';
        } else {
            // 2~4세트: 누적 점수 높은 쪽이 선공 (동점 시 기존 선공 유지)
            if (this.player.totalScore > this.ai.totalScore) {
                this.firstPlayer = 'human';
            } else if (this.ai.totalScore > this.player.totalScore) {
                this.firstPlayer = 'ai';
            }
            // 동점이면 this.firstPlayer 변경 안 함 (기존 선공 유지)
        }
    }

    // ─── 세트 시작 ────────────────────────────────────────
    startSet() {
        this.phase = PHASES.DRAFTING;
        this.currentRound = 1;
        this.player.resetHand();
        this.ai.resetHand();
        this.aiStrategy.resetForNewSet();

        // 드래프트 상태 초기화
        this.draftTurn = this.firstPlayer;
        this.draftCount = 0;
        this.draftBoard = { human: [], ai: [] };

        // 덱 준비 및 셔플
        this.deck = ALL_TILES.map(t => t.clone());
        this.shuffle(this.deck);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // ─── 교대 드래프트 ───────────────────────────────────
    getDraftLimits(who) {
        const hand = who === 'human' ? this.player.hand : this.ai.hand;
        const rCount = hand.filter(t => t.color === 'red').length;
        const bCount = hand.filter(t => t.color === 'black').length;
        return {
            redCount: rCount,
            blackCount: bCount,
            canPickRed: rCount < 3,
            canPickBlack: bCount < 2
        };
    }

    // 특정 색상의 타일을 덱에서 1장 뽑아 해당 플레이어에게 배분
    draftTile(color) {
        if (this.phase !== PHASES.DRAFTING) return null;

        const who = this.draftTurn;
        const limits = this.getDraftLimits(who);

        if (color === 'red' && !limits.canPickRed) return null;
        if (color === 'black' && !limits.canPickBlack) return null;

        const tileIdx = this.deck.findIndex(t => t.color === color);
        if (tileIdx === -1) return null;

        const tile = this.deck.splice(tileIdx, 1)[0];
        const targetPlayer = who === 'human' ? this.player : this.ai;
        targetPlayer.addTile(tile);

        // 드래프트 보드에 색상 기록 (공개 정보)
        this.draftBoard[who].push(color);

        this.draftCount++;

        // 턴 교체
        this.draftTurn = this.draftTurn === 'human' ? 'ai' : 'human';

        // 드래프트 완료 체크 (총 10픽)
        if (this.draftCount >= 10) {
            this.phase = PHASES.BATTLE;
            this.battleTurn = this.firstPlayer;
            this.pendingFirstTile = null;
            this.pendingFirstPlayer = null;
            // AI에게 플레이어 타일 색상 정보 제공
            this.aiStrategy.updateOpponentInfo(this.player.hand.map(t => t.color));
        }

        return tile;
    }

    // AI가 드래프트에서 1장을 선택하는 로직
    aiDraftOneTile() {
        if (this.phase !== PHASES.DRAFTING || this.draftTurn !== 'ai') return null;

        const limits = this.getDraftLimits('ai');
        const color = this.aiStrategy.selectOneDraftTile(this.deck, this.ai.hand, limits);
        return this.draftTile(color);
    }

    // ─── 비동기 순차 배틀 ──────────────────────────────────

    // 선공이 카드를 제출
    submitFirstTile(tile, who) {
        if (this.phase !== PHASES.BATTLE) return false;
        if (this.battleTurn !== who) return false;
        if (this.pendingFirstTile !== null) return false;

        this.pendingFirstTile = tile;
        this.pendingFirstPlayer = who;
        // 턴을 후공에게 넘김
        this.battleTurn = who === 'human' ? 'ai' : 'human';
        return true;
    }

    // 후공이 카드를 제출 → 라운드 정산
    submitSecondTile(tile, who) {
        if (this.phase !== PHASES.BATTLE) return null;
        if (this.battleTurn !== who) return null;
        if (this.pendingFirstTile === null) return null;

        const firstTile = this.pendingFirstTile;
        const secondTile = tile;

        // 어느 쪽이 p1이고 p2인지 판별
        let playerTile, aiTile;
        if (this.pendingFirstPlayer === 'human') {
            playerTile = firstTile;
            aiTile = secondTile;
        } else {
            playerTile = secondTile;
            aiTile = firstTile;
        }

        const result = this.evaluateBattle(playerTile, aiTile);
        const points = this.calculatePoints(result.winType);

        if (result.winner === 'p1') this.player.addScore(points);
        else if (result.winner === 'p2') this.ai.addScore(points);

        // AI 학습: 공개된 타일 정보 업데이트
        this.aiStrategy.updateOpponentInfo(null, playerTile);

        // 상태 리셋
        this.pendingFirstTile = null;
        this.pendingFirstPlayer = null;

        this.currentRound++;
        if (this.currentRound > 5) {
            this.endSet();
        } else {
            // 다음 라운드도 세트 선공이 먼저
            this.battleTurn = this.firstPlayer;
        }

        return {
            ...result,
            points,
            playerTile,
            aiTile,
            firstPlayer: this.pendingFirstPlayer
        };
    }

    // ─── 판정 로직 ────────────────────────────────────────

    evaluateBattle(p1Tile, p2Tile) {
        const n1 = p1Tile.number;
        const n2 = p2Tile.number;

        if (n1 === n2) return { winner: null, winType: 'draw' };

        const high = Math.max(n1, n2);
        const low = Math.min(n1, n2);
        const isN1High = n1 > n2;

        // 판정 순서 엄수: 더블승 → 역전승 → 기본승
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

    // ─── 세트 종료 ────────────────────────────────────────
    endSet() {
        if (this.currentSet >= 4) {
            this.phase = PHASES.END;
        } else {
            this.currentSet++;
            this.determineFirstPlayer();
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
