# Doubles Plan Design System Guidelines

## 1. Color Palette (Online Poker Theme)
기존 네이비 테마를 폐기하고, 클래식한 온라인 포커 테이블의 카지노 테마를 적용합니다.
- **Primary Background (전체 배경)**: `#0f5132` (Poker Table Green) - 포커 테이블 특유의 안정적인 짙은 녹색.
- **Game Board (게임 보드)**: `#143621` (Darker Felt Green) - 메인 배경보다 한 톤 더 어두운 녹색으로 플레이 영역을 패임(inset) 효과로 구분.
- **Scoreboard Background (스코어보드)**: `#1a1a1a` (Dark Charcoal) - 상단 텍스트 가독성을 위한 차콜 블랙.
- **Accent/Border (강조/테두리)**: `#f59e0b` (Casino Gold) - 카지노 칩 느낌의 고급스러운 골드 포인트.
- **Red Tile (빨강 타일)**: `#dc2626` (Casino Red) - 플레잉 카드의 선명한 붉은색.
- **Black Tile & Back Card (검정 타일 및 뒷면)**: `#171717` (Deep Black) - 짙은 검정색. 배경에 묻히지 않도록 반드시 회색 테두리(`#52525b`)를 함께 적용.
- **Text (텍스트)**: `#f8fafc` (Off White) - 높은 가독성.

## 2. Typography & Localization (한국어화)
- **Font**: 'Pretendard' 또는 'Noto Sans KR'을 1순위로 적용하여 한국어 가독성을 극대화.
- **텍스트 규칙 (전면 한국어화)**:
  - `PLAYER` -> `플레이어`
  - `AI STRATEGIST` -> `인공지능 전략가`
  - `SET 1 / 4` -> `1세트 / 4`
  - `PREPARE FOR THE DUEL` -> `대결을 준비하세요`
  - `COMMENCE GAME` -> `게임 시작`

## 3. Layout & Responsive (갤럭시 Z Fold 6 완벽 대응)
- 폴드6의 극단적인 비율(외장 23.1:9 좁은 화면 / 내장 5:6 넓은 화면)에 모두 대응해야 함.
- **절대 고정 높이(`px`) 사용 금지**. Flexbox와 Grid를 활용하고, 화면 전체 높이는 `100dvh` (Dynamic Viewport Height)를 사용하여 모바일 브라우저의 상단/하단 바 간섭을 방지.
- 상단 점수판, 중앙 대결 보드, 하단 플레이어 덱 영역을 `flex-grow` 비율로 나누어 겹침 현상을 원천 차단.

## 4. Component Design (Usability & Size)
- **플레이어 타일 (하단 덱)**: 모바일 터치(Hit Area)를 고려하여 **기존 대비 1.5배 이상 크기를 키움**.
- **Cards (Tiles)**:
  - `transform: preserve-3d`를 이용한 3D 카드 뒤집기 애니메이션 유지.
  - 마우스 오버(Hover) 또는 터치 시 카드가 위로 크게 튀어 오르는 직관적인 피드백 제공.