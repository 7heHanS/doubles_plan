export class UIController {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.isProcessing = false;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.statusMsg = document.getElementById('status-message');
        this.playerHand = document.getElementById('player-hand');
        this.opponentInfo = document.getElementById('opponent-info');
        this.playerScore = document.getElementById('player-score');
        this.aiScore = document.getElementById('ai-score');
        this.setInfo = document.getElementById('set-info');
        this.playerSlot = document.getElementById('player-tile-container');
        this.aiSlot = document.getElementById('ai-tile-container');
        this.playerTileFront = document.getElementById('player-tile-front');
        this.aiTileFront = document.getElementById('ai-tile-front');
        this.startBtn = document.getElementById('start-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            this.startBtn.style.display = 'none';
            this.game.initGame();
            this.renderDrafting();
        });
    }

    updateStatus(msg) {
        this.statusMsg.innerText = msg;
    }

    // 드래프트 상태 메세지 한국어화
    renderDrafting() {
        this.updateStatus('타일을 선택하세요 (빨강 3, 검정 2)');
        this.playerHand.innerHTML = '';
        this.resetSlots();
        
        const colors = [
            { name: '빨강', color: 'red', limit: 3 },
            { name: '검정', color: 'black', limit: 2 }
        ];

        colors.forEach(c => {
            const btn = document.createElement('button');
            btn.innerText = `${c.name}`;
            btn.className = `draft-btn ${c.color}`;
            btn.style.margin = '0 10px';
            btn.onclick = () => {
                const currentCount = this.game.player.hand.filter(t => t.color === c.color).length;
                if (currentCount < c.limit) {
                    this.game.draftTile(c.color);
                    this.updateDraftStatus();
                }
            };
            this.playerHand.appendChild(btn);
        });
    }

    updateDraftStatus() {
        const p = this.game.player;
        const rCount = p.hand.filter(t => t.color === 'red').length;
        const bCount = p.hand.filter(t => t.color === 'black').length;
        
        this.updateStatus(`선택 완료 현황: 빨강(${rCount}/3), 검정(${bCount}/2)`);
            
        if (rCount === 3 && bCount === 2) {
            this.updateStatus('선택 완료. 대결을 준비하세요.');
            this.renderHand();
            this.renderOpponentInfo();
        }
    }

    renderOpponentInfo() {
        this.opponentInfo.innerHTML = '';
        this.game.ai.hand.forEach((tile) => {
            const div = document.createElement('div');
            // 상대 카드에는 무조건 뒷면이 표시되므로 CSS 처리를 위해 클래스 부여
            div.className = `opp-card-mini ${tile.color}`;
            this.opponentInfo.appendChild(div);
        });
    }

    renderHand() {
        this.playerHand.innerHTML = '';
        this.game.player.hand.forEach((tile, index) => {
            const div = document.createElement('div');
            div.className = `hand-tile ${tile.color}`;
            div.innerText = tile.number;
            div.draggable = true;
            
            div.onclick = () => this.handlePlayTile(index);
            div.ondragstart = (e) => {
                if (this.isProcessing) return e.preventDefault();
                e.dataTransfer.setData('text/plain', index);
            };
            
            this.playerHand.appendChild(div);
        });

        const slotContainer = document.getElementById('player-tile-container');
        slotContainer.ondragover = (e) => e.preventDefault();
        slotContainer.ondrop = (e) => {
            e.preventDefault();
            const index = e.dataTransfer.getData('text/plain');
            this.handlePlayTile(parseInt(index));
        };
    }

    async handlePlayTile(index) {
        if (this.game.phase !== 'BATTLE' || this.isProcessing) return;
        this.isProcessing = true;

        const playerTile = this.game.player.removeTile(index);
        const aiIdx = this.game.aiStrategy.decideTileToPlay(playerTile);
        const aiTile = this.game.ai.removeTile(aiIdx);
        
        this.setupTileFace(this.playerTileFront, playerTile);
        this.setupTileFace(this.aiTileFront, aiTile);
        
        this.playerSlot.style.visibility = 'visible';
        this.aiSlot.style.visibility = 'visible';
        this.playerSlot.classList.remove('flipped');
        this.aiSlot.classList.remove('flipped');

        this.updateStatus('전략 분석 중...');
        this.playerHand.style.pointerEvents = 'none';

        // 카드 딜레이 애니메이션 시간
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.playerSlot.classList.add('flipped');
        this.aiSlot.classList.add('flipped');

        const result = this.game.resolveRound(playerTile, aiTile);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        this.triggerScoreAnimation(result.winner);
        
        // 결과 메세지의 한글화 적용
        let msg = `${result.winner === 'p1' ? '승리' : result.winner === 'p2' ? '패배' : '무승부'}`;
        if (result.winner) msg += ` - ${this.getWinTypeText(result.winType)} (+${result.points})`;
        this.updateStatus(msg);

        await new Promise(resolve => setTimeout(resolve, 2000));

        this.isProcessing = false;
        this.playerHand.style.pointerEvents = 'auto';
        
        if (this.game.phase === 'END') {
            this.showGameOver();
        } else {
            if (this.game.currentRound === 1) {
                this.renderDrafting();
                this.opponentInfo.innerHTML = '';
            } else {
                this.renderHand();
                this.renderOpponentInfo();
            }
            this.resetSlots();
        }
    }

    setupTileFace(faceEl, tile) {
        faceEl.innerText = tile.number;
        faceEl.className = `tile-face tile-front ${tile.color}`;
    }

    triggerScoreAnimation(winner) {
        this.playerScore.innerText = this.game.player.totalScore;
        this.aiScore.innerText = this.game.ai.totalScore;
        
        // 정규식 대신 백틱 포맷으로 세트 수 한글 표시 반영
        this.setInfo.innerText = `${this.game.currentSet}세트 / 4`;

        if (winner === 'p1') {
            this.playerScore.classList.add('gain');
            setTimeout(() => this.playerScore.classList.remove('gain'), 500);
        } else if (winner === 'p2') {
            this.aiScore.classList.add('gain');
            setTimeout(() => this.aiScore.classList.remove('gain'), 500);
        }
        
        document.getElementById('game-container').classList.add('flash-effect');
        setTimeout(() => document.getElementById('game-container').classList.remove('flash-effect'), 500);
    }

    resetSlots() {
        this.playerSlot.style.visibility = 'hidden';
        this.aiSlot.style.visibility = 'hidden';
        this.playerSlot.classList.remove('flipped');
        this.aiSlot.classList.remove('flipped');
    }

    // 판정 한글화 기준 테이블
    getWinTypeText(type) {
        const types = { 'double': '더블', 'comeback': '역전', 'basic': '일반' };
        return types[type] || '승리';
    }

    // 게임 종료 로직 한글화
    showGameOver() {
        const pScore = this.game.player.totalScore;
        const aiScore = this.game.ai.totalScore;
        const winner = pScore > aiScore ? '플레이어' : (pScore < aiScore ? '인공지능 전략가' : '무승부');
        this.updateStatus(`전투 종료. 최종 승자: ${winner}`);
        setTimeout(() => location.reload(), 5000);
    }
}
