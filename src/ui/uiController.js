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
        this.roundInfo = document.getElementById('round-info');
        this.playerSlot = document.getElementById('player-tile-container');
        this.aiSlot = document.getElementById('ai-tile-container');
        this.playerTileFront = document.getElementById('player-tile-front');
        this.aiTileFront = document.getElementById('ai-tile-front');
        this.playerSlotLabel = document.getElementById('player-slot-label');
        this.aiSlotLabel = document.getElementById('ai-slot-label');
        this.startBtn = document.getElementById('start-btn');
        this.draftBoard = document.getElementById('draft-board');
        this.draftBoardHuman = document.getElementById('draft-board-human');
        this.draftBoardAI = document.getElementById('draft-board-ai');
        this.toastContainer = document.getElementById('toast-container');

        // 배틀 슬롯의 뒷면 요소
        this.playerTileBack = this.playerSlot.querySelector('.tile-back');
        this.aiTileBack = this.aiSlot.querySelector('.tile-back');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            this.startBtn.style.display = 'none';
            this.game.initGame();
            this.showFirstPlayerDecision();
        });
    }

    // ─── 유틸리티 ─────────────────────────────────────────

    updateStatus(msg) {
        this.statusMsg.innerText = msg;
    }

    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerText = message;
        this.toastContainer.appendChild(toast);

        // 애니메이션 트리거
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    lockInput() {
        this.isProcessing = true;
        this.playerHand.style.pointerEvents = 'none';
        this.playerHand.style.opacity = '0.5';
    }

    unlockInput() {
        this.isProcessing = false;
        this.playerHand.style.pointerEvents = 'auto';
        this.playerHand.style.opacity = '1';
    }

    getWinTypeText(type) {
        const types = { 'double': '더블', 'comeback': '역전', 'basic': '일반' };
        return types[type] || '승리';
    }

    // ─── 선공 결정 연출 ──────────────────────────────────

    async showFirstPlayerDecision() {
        this.resetSlots();
        this.hidePhaseElements();

        if (this.game.currentSet === 1) {
            // 1세트: 주사위 굴림 연출
            this.updateStatus('🎲 주사위를 굴리는 중...');
            await new Promise(r => setTimeout(r, 1500));

            const isPlayerFirst = this.game.firstPlayer === 'human';
            const msg = isPlayerFirst
                ? '🎲 플레이어 선공!'
                : '🎲 인공지능 전략가 선공!';
            this.showToast(msg, 2500);
            this.updateStatus(msg);
        } else {
            // 2~4세트: 점수 비교
            const pScore = this.game.player.totalScore;
            const aiScore = this.game.ai.totalScore;
            let msg;
            if (pScore > aiScore) {
                msg = `점수 ${pScore}:${aiScore} — 플레이어 선공`;
            } else if (aiScore > pScore) {
                msg = `점수 ${pScore}:${aiScore} — 인공지능 전략가 선공`;
            } else {
                const who = this.game.firstPlayer === 'human' ? '플레이어' : '인공지능 전략가';
                msg = `점수 동점 ${pScore}:${aiScore} — ${who} 선공 유지`;
            }
            this.showToast(msg, 2500);
            this.updateStatus(msg);
        }

        this.updateScoreDisplay();
        await new Promise(r => setTimeout(r, 2000));
        this.renderDrafting();
    }

    // ─── 교대 드래프트 UI ─────────────────────────────────

    renderDrafting() {
        // 드래프트 보드 표시, 배틀 영역 숨김
        this.showDraftPhaseLayout();

        this.updateDraftBoardDisplay();
        this.renderDraftTurn();
    }

    renderDraftTurn() {
        if (this.game.phase !== 'DRAFTING') return;

        const turn = this.game.draftTurn;
        const pickNum = this.game.draftCount + 1;

        if (turn === 'human') {
            // 플레이어 턴: 색상 선택 버튼 표시
            const limits = this.game.getDraftLimits('human');
            this.updateStatus(`[${pickNum}/10] 플레이어 차례 — 타일을 선택하세요`);

            this.playerHand.innerHTML = '';

            if (limits.canPickRed) {
                const redBtn = document.createElement('button');
                redBtn.className = 'draft-btn red';
                redBtn.innerHTML = `빨강<span class="draft-counter">${limits.redCount}/3</span>`;
                redBtn.onclick = () => {
                    if (this.isProcessing) return;
                    this.handlePlayerDraft('red');
                };
                this.playerHand.appendChild(redBtn);
            }

            if (limits.canPickBlack) {
                const blackBtn = document.createElement('button');
                blackBtn.className = 'draft-btn black';
                blackBtn.innerHTML = `검정<span class="draft-counter">${limits.blackCount}/2</span>`;
                blackBtn.onclick = () => {
                    if (this.isProcessing) return;
                    this.handlePlayerDraft('black');
                };
                this.playerHand.appendChild(blackBtn);
            }

            this.unlockInput();
        } else {
            // AI 턴: 자동 선택
            this.lockInput();
            this.playerHand.innerHTML = '';
            this.updateStatus(`[${pickNum}/10] 인공지능 전략가 선택 중...`);
            this.handleAIDraft();
        }
    }

    async handlePlayerDraft(color) {
        this.lockInput();
        const tile = this.game.draftTile(color);
        if (!tile) {
            this.unlockInput();
            return;
        }

        this.showToast(`플레이어: ${color === 'red' ? '빨강' : '검정'} 타일 선택`, 1200);
        this.updateDraftBoardDisplay();

        await new Promise(r => setTimeout(r, 500));

        if (this.game.phase === 'BATTLE') {
            this.transitionToBattle();
        } else {
            this.renderDraftTurn();
        }
    }

    async handleAIDraft() {
        await new Promise(r => setTimeout(r, 800));

        const tile = this.game.aiDraftOneTile();
        if (!tile) return;

        this.showToast(`인공지능 전략가: ${tile.color === 'red' ? '빨강' : '검정'} 타일 선택`, 1200);
        this.updateDraftBoardDisplay();

        await new Promise(r => setTimeout(r, 500));

        if (this.game.phase === 'BATTLE') {
            this.transitionToBattle();
        } else {
            this.renderDraftTurn();
        }
    }

    updateDraftBoardDisplay() {
        // 플레이어 드래프트 보드
        this.draftBoardHuman.innerHTML = '';
        const humanBoard = this.game.draftBoard.human;
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            if (i < humanBoard.length) {
                slot.className = `draft-slot filled ${humanBoard[i]}`;
            } else {
                slot.className = 'draft-slot empty';
            }
            this.draftBoardHuman.appendChild(slot);
        }

        // AI 드래프트 보드
        this.draftBoardAI.innerHTML = '';
        const aiBoard = this.game.draftBoard.ai;
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            if (i < aiBoard.length) {
                slot.className = `draft-slot filled ${aiBoard[i]}`;
            } else {
                slot.className = 'draft-slot empty';
            }
            this.draftBoardAI.appendChild(slot);
        }
    }

    // ─── 페이즈 전환 ─────────────────────────────────────

    showDraftPhaseLayout() {
        this.draftBoard.style.display = 'flex';
        document.getElementById('battle-area').style.display = 'none';
        this.opponentInfo.style.display = 'none';
        if (this.roundInfo) this.roundInfo.style.display = 'none';
    }

    showBattlePhaseLayout() {
        this.draftBoard.style.display = 'none';
        document.getElementById('battle-area').style.display = 'flex';
        this.opponentInfo.style.display = 'flex';
        if (this.roundInfo) this.roundInfo.style.display = 'block';
    }

    hidePhaseElements() {
        this.draftBoard.style.display = 'none';
        document.getElementById('battle-area').style.display = 'none';
        this.opponentInfo.style.display = 'none';
        this.playerHand.innerHTML = '';
    }

    async transitionToBattle() {
        this.lockInput();
        this.updateStatus('타일 선택 완료! 대결을 준비합니다...');
        this.showToast('⚔️ 대결 시작!', 2000);

        await new Promise(r => setTimeout(r, 1500));

        this.showBattlePhaseLayout();
        this.renderOpponentInfo();
        this.resetSlots();
        this.updateRoundDisplay();
        this.startBattleRound();
    }

    // ─── 비동기 배틀 UI ──────────────────────────────────

    startBattleRound() {
        if (this.game.phase !== 'BATTLE') return;

        this.resetSlots();
        this.updateRoundDisplay();

        const firstPlayer = this.game.roundFirstPlayer;

        if (firstPlayer === 'human') {
            // 플레이어가 선공 → 플레이어 카드 먼저 제출
            this.updateStatus(`[라운드 ${this.game.currentRound}/5] 🟢 플레이어 선공 — 카드를 제출하세요`);
            this.renderHand(true); // 활성화
        } else {
            // AI가 선공 → AI 먼저 제출
            this.updateStatus(`[라운드 ${this.game.currentRound}/5] 🔴 인공지능 전략가 선공 — 카드 제출 중...`);
            this.renderHand(false); // 비활성화
            this.handleAIFirstSubmit();
        }
    }

    renderHand(enabled = true) {
        this.playerHand.innerHTML = '';
        this.game.player.hand.forEach((tile, index) => {
            const div = document.createElement('div');
            div.className = `hand-tile ${tile.color}`;
            div.innerText = tile.number;

            if (enabled) {
                div.onclick = () => this.handlePlayerTileClick(index);
                div.draggable = true;
                div.ondragstart = (e) => {
                    if (this.isProcessing) return e.preventDefault();
                    e.dataTransfer.setData('text/plain', index);
                };
            } else {
                div.style.opacity = '0.5';
                div.style.cursor = 'not-allowed';
            }

            this.playerHand.appendChild(div);
        });

        if (enabled) {
            this.unlockInput();
            // 드래그 앤 드롭 지원
            const slotContainer = document.getElementById('player-tile-container');
            slotContainer.ondragover = (e) => e.preventDefault();
            slotContainer.ondrop = (e) => {
                e.preventDefault();
                const index = e.dataTransfer.getData('text/plain');
                this.handlePlayerTileClick(parseInt(index));
            };
        } else {
            this.lockInput();
        }
    }

    async handlePlayerTileClick(index) {
        if (this.game.phase !== 'BATTLE' || this.isProcessing) return;
        this.lockInput();

        const battleTurn = this.game.battleTurn;

        if (battleTurn !== 'human') return;

        const tile = this.game.player.removeTile(index);

        if (this.game.pendingFirstTile === null) {
            // 플레이어가 선공 → 카드를 뒷면으로 중앙에 배치
            this.game.submitFirstTile(tile, 'human');

            // 플레이어 슬롯에 뒷면(색상) 표시
            this.showCardBack(this.playerSlot, this.playerTileBack, tile.color);
            this.setupTileFace(this.playerTileFront, tile);

            this.updateStatus('플레이어 카드 제출 완료. 인공지능 전략가 대응 중...');

            await new Promise(r => setTimeout(r, 800));

            // AI 후공 대응
            this.handleAISecondSubmit(tile.color);
        } else {
            // 플레이어가 후공 → 카드 제출하고 결과 정산
            this.setupTileFace(this.playerTileFront, tile);

            // 플레이어 카드도 뒷면으로 먼저 표시
            this.showCardBack(this.playerSlot, this.playerTileBack, tile.color);

            await new Promise(r => setTimeout(r, 600));

            // 결과 정산
            const result = this.game.submitSecondTile(tile, 'human');
            await this.revealAndScore(result);
        }
    }

    async handleAIFirstSubmit() {
        this.lockInput();

        await new Promise(r => setTimeout(r, 1000));

        // AI가 선공으로 카드 제출
        const aiIdx = this.game.aiStrategy.decideFirstSubmit();
        const aiTile = this.game.ai.removeTile(aiIdx);
        this.game.submitFirstTile(aiTile, 'ai');

        // AI 카드를 뒷면(색상)으로 중앙에 표시
        this.showCardBack(this.aiSlot, this.aiTileBack, aiTile.color);
        this.setupTileFace(this.aiTileFront, aiTile);

        const colorName = aiTile.color === 'red' ? '빨강' : '검정';
        this.updateStatus(`인공지능 전략가가 ${colorName} 카드를 제출했습니다. 당신의 카드를 선택하세요!`);

        // 플레이어에게 턴 넘김
        this.renderHand(true);
    }

    async handleAISecondSubmit(playerCardColor) {
        await new Promise(r => setTimeout(r, 800));

        // AI가 후공으로 대응
        const aiIdx = this.game.aiStrategy.decideResponseSubmit(playerCardColor);
        const aiTile = this.game.ai.removeTile(aiIdx);

        this.setupTileFace(this.aiTileFront, aiTile);

        // AI 카드도 뒷면으로 배치
        this.showCardBack(this.aiSlot, this.aiTileBack, aiTile.color);

        await new Promise(r => setTimeout(r, 600));

        // 결과 정산
        const result = this.game.submitSecondTile(aiTile, 'ai');
        await this.revealAndScore(result);
    }

    // 카드 뒷면 표시 (색상만 공개)
    showCardBack(slotEl, backEl, color) {
        // 뒷면 색상 적용
        backEl.className = `tile-face tile-back ${color}`;
        slotEl.style.visibility = 'visible';
        slotEl.classList.remove('flipped');
    }

    async revealAndScore(result) {
        if (!result) {
            this.unlockInput();
            return;
        }

        this.updateStatus('카드를 공개합니다...');
        await new Promise(r => setTimeout(r, 800));

        // 동시 공개: 카드 뒤집기
        this.playerSlot.classList.add('flipped');
        this.aiSlot.classList.add('flipped');

        await new Promise(r => setTimeout(r, 800));

        // 점수 반영 및 애니메이션
        this.triggerScoreAnimation(result.winner);

        // 결과 메시지
        let msg;
        if (result.winner === null) {
            msg = '무승부!';
        } else {
            const winnerName = result.winner === 'p1' ? '플레이어' : '인공지능 전략가';
            msg = `${winnerName} ${this.getWinTypeText(result.winType)}승! (+${result.points}점)`;
        }
        this.showToast(msg, 2500);
        this.updateStatus(msg);

        await new Promise(r => setTimeout(r, 2500));

        this.unlockInput();

        if (this.game.phase === 'END') {
            this.showGameOver();
        } else if (this.game.phase === 'DRAFTING') {
            // 새 세트 시작 → 선공 결정 연출
            this.showFirstPlayerDecision();
        } else {
            // 같은 세트 내 다음 라운드
            this.renderOpponentInfo();
            this.startBattleRound();
        }
    }

    // ─── 공통 렌더링 ─────────────────────────────────────

    setupTileFace(faceEl, tile) {
        faceEl.innerText = tile.number;
        faceEl.className = `tile-face tile-front ${tile.color}`;
    }

    renderOpponentInfo() {
        this.opponentInfo.innerHTML = '';
        this.game.ai.hand.forEach((tile) => {
            const div = document.createElement('div');
            div.className = `opp-card-mini ${tile.color}`;
            this.opponentInfo.appendChild(div);
        });
    }

    triggerScoreAnimation(winner) {
        this.updateScoreDisplay();

        if (winner === 'p1') {
            this.playerScore.classList.add('gain', 'score-animate');
            setTimeout(() => this.playerScore.classList.remove('gain', 'score-animate'), 600);
        } else if (winner === 'p2') {
            this.aiScore.classList.add('gain', 'score-animate');
            setTimeout(() => this.aiScore.classList.remove('gain', 'score-animate'), 600);
        }
    }

    updateScoreDisplay() {
        this.playerScore.innerText = this.game.player.totalScore;
        this.aiScore.innerText = this.game.ai.totalScore;
        this.setInfo.innerText = `${this.game.currentSet}세트 / 4`;
    }

    updateRoundDisplay() {
        if (this.roundInfo) {
            this.roundInfo.innerText = `라운드 ${this.game.currentRound} / 5`;
            this.roundInfo.style.display = 'block';
        }
    }

    resetSlots() {
        this.playerSlot.style.visibility = 'hidden';
        this.aiSlot.style.visibility = 'hidden';
        this.playerSlot.classList.remove('flipped');
        this.aiSlot.classList.remove('flipped');
    }

    showGameOver() {
        const pScore = this.game.player.totalScore;
        const aiScore = this.game.ai.totalScore;
        let winner;
        if (pScore > aiScore) winner = '🏆 플레이어 승리!';
        else if (pScore < aiScore) winner = '인공지능 전략가 승리';
        else winner = '무승부 — 연장전 진행';

        this.updateStatus(`전투 종료! ${winner} (${pScore} : ${aiScore})`);
        this.showToast(`최종 결과: ${winner}`, 5000);
        this.playerHand.innerHTML = '';
        this.opponentInfo.innerHTML = '';

        // 5초 후 새 게임 버튼 표시
        setTimeout(() => {
            this.startBtn.innerText = '새 게임';
            this.startBtn.style.display = 'block';
        }, 3000);
    }
}
