export class UIController {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.isProcessing = false; // 중복 클릭/제출 방지 플래그
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
        this.playerSlot = document.getElementById('player-played-tile');
        this.aiSlot = document.getElementById('ai-played-tile');
        this.startBtn = document.getElementById('start-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            this.startBtn.style.display = 'none';
            this.game.initGame(); // 엔진 초기화
            this.renderDrafting();
        });
    }

    updateStatus(msg) {
        this.statusMsg.innerText = msg;
    }

    renderDrafting() {
        this.updateStatus('타일을 선택하세요 (빨강 3개, 검정 2개)');
        this.playerHand.innerHTML = '';
        this.resetSlots();
        
        const colors = [
            { name: '빨강', color: 'red', limit: 3 },
            { name: '검정', color: 'black', limit: 2 }
        ];

        colors.forEach(c => {
            const btn = document.createElement('button');
            btn.innerText = `${c.name} 선택`;
            btn.className = `draft-btn ${c.color}`;
            btn.style.backgroundColor = `var(--${c.color}-tile)`;
            btn.style.margin = '0 5px';
            btn.onclick = () => {
                const currentCount = this.game.player.hand.filter(t => t.color === c.color).length;
                if (currentCount < c.limit) {
                    this.game.draftTile(c.color);
                    this.updateDraftStatus();
                } else {
                    this.updateStatus(`${c.name} 타일은 이미 모두 선택했습니다.`);
                }
            };
            this.playerHand.appendChild(btn);
        });
    }

    updateDraftStatus() {
        const p = this.game.player;
        const rCount = p.hand.filter(t => t.color === 'red').length;
        const bCount = p.hand.filter(t => t.color === 'black').length;
        
        this.updateStatus(`선택 현황: 빨강(${rCount}/3), 검정(${bCount}/2)`);
            
        if (rCount === 3 && bCount === 2) {
            this.updateStatus('드래프트 완료! 대결을 시작합니다.');
            this.renderHand();
            this.renderOpponentInfo();
        }
    }

    renderOpponentInfo() {
        this.opponentInfo.innerHTML = '';
        this.game.ai.hand.forEach((tile) => {
            const div = document.createElement('div');
            div.className = `tile back ${tile.color}`;
            div.style.width = '30px';
            div.style.height = '45px';
            this.opponentInfo.appendChild(div);
        });
    }

    renderHand() {
        this.playerHand.innerHTML = '';
        this.game.player.hand.forEach((tile, index) => {
            const div = document.createElement('div');
            div.className = `tile ${tile.color}`;
            div.innerText = tile.number;
            div.draggable = true;
            
            div.onclick = () => this.handlePlayTile(index);
            
            div.ondragstart = (e) => {
                if (this.isProcessing) return e.preventDefault();
                e.dataTransfer.setData('text/plain', index);
                div.style.opacity = '0.5';
            };
            div.ondragend = () => div.style.opacity = '1';
            
            this.playerHand.appendChild(div);
        });

        const slotContainer = document.getElementById('player-slot');
        slotContainer.ondragover = (e) => e.preventDefault();
        slotContainer.ondrop = (e) => {
            e.preventDefault();
            const index = e.dataTransfer.getData('text/plain');
            this.handlePlayTile(parseInt(index));
        };
    }

    async handlePlayTile(index) {
        // 예외 처리: 페이즈 체크 및 중복 진행 방지
        if (this.game.phase !== 'BATTLE' || this.isProcessing) return;
        if (index < 0 || index >= this.game.player.hand.length) return;

        this.isProcessing = true;
        const playerTile = this.game.player.removeTile(index);
        
        // AI 전략에 따른 타일 선택 (엔진의 aiStrategy 활용)
        const aiIdx = this.game.aiStrategy.decideTileToPlay(playerTile);
        const aiTile = this.game.ai.removeTile(aiIdx);
        
        // 시각 효과: 타일 제출 (AI는 뒷면으로 제출)
        this.showPlayedTile(this.playerSlot, playerTile, false);
        this.showPlayedTile(this.aiSlot, aiTile, true);
        
        this.updateStatus('대결 중... 결과를 공개합니다.');
        this.playerHand.style.pointerEvents = 'none';

        // 긴장감 연출을 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1200));

        // AI 타일 공개 및 결과 판정
        this.showPlayedTile(this.aiSlot, aiTile, false);
        const result = this.game.resolveRound(playerTile, aiTile);
        
        this.updateScoreBoard();
        
        let msg = `결과: ${result.winner === 'p1' ? '플레이어 승리!' : result.winner === 'p2' ? 'AI 승리!' : '무승부'}`;
        if (result.winner) msg += ` (${this.getWinTypeText(result.winType)}, +${result.points}점)`;
        this.updateStatus(msg);

        await new Promise(resolve => setTimeout(resolve, 2000));

        this.isProcessing = false;
        this.playerHand.style.pointerEvents = 'auto';
        
        if (this.game.phase === 'END') {
            this.showGameOver();
        } else {
            if (this.game.currentRound === 1) {
                // 새로운 세트 시작 시 드래프트로 전환
                this.renderDrafting();
                this.opponentInfo.innerHTML = '';
            } else {
                this.renderHand();
                this.renderOpponentInfo();
            }
            this.resetSlots();
        }
    }

    updateScoreBoard() {
        this.playerScore.innerText = this.game.player.totalScore;
        this.aiScore.innerText = this.game.ai.totalScore;
        this.setInfo.innerText = `Set ${this.game.currentSet} / 4`;
    }

    showPlayedTile(slot, tile, isBack) {
        slot.innerText = isBack ? '?' : tile.number;
        slot.className = `tile ${isBack ? 'back' : tile.color}`;
        slot.style.visibility = 'visible';
        
        slot.animate([
            { transform: 'translateY(20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 400, easing: 'ease-out' });
    }

    resetSlots() {
        this.playerSlot.style.visibility = 'hidden';
        this.aiSlot.style.visibility = 'hidden';
    }

    getWinTypeText(type) {
        const types = { 'double': '더블승', 'comeback': '역전승', 'basic': '기본승' };
        return types[type] || '승리';
    }

    showGameOver() {
        const pScore = this.game.player.totalScore;
        const aiScore = this.game.ai.totalScore;
        const winner = pScore > aiScore ? 'PLAYER' : (pScore < aiScore ? 'AI' : '무승부');
        
        this.updateStatus(`게임 종료! 최종 승자: ${winner}`);
        alert(`게임 종료!\n최종 승자: ${winner}\nPLAYER: ${pScore} vs AI: ${aiScore}`);
        location.reload();
    }
}
