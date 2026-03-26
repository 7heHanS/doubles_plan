# Doubles Plan Design System Guidelines

## 1. Color Palette (High Contrast & Visibility)
- **Primary Background (전체 배경)**: `#1e293b` (Brightened Navy) - 너무 어둡지 않은 기본 네이비.
- **Game Board (게임 보드)**: `#2d3748` (Dark Charcoal) - 배경과 분리되어 플레이 영역을 명확히 구분하는 짙은 차콜 그레이.
- **Scoreboard Background (스코어보드 배경)**: `#0f172a` (Deep Navy) - 보드 위에 얹혀진 깊이감을 주기 위한 가장 어두운 네이비.
- **Accent/Border (강조/테두리)**: `#fbbf24` (Vivid Gold) - 칙칙함을 없애고 가독성을 높이는 선명하고 밝은 옐로우 골드.
- **Red Tile (빨강 타일)**: `#ef4444` (Vivid Red) - 어두운 보드 위에서 눈에 띄는 선명한 붉은색.
- **Black Tile & Back Card (검정 타일 및 뒷면)**: `#475569` (Slate Gray) - 배경 및 보드에 묻히지 않도록 명도를 대폭 높인 슬레이트 그레이. (반드시 `#fbbf24` 테두리와 함께 사용하여 독립된 객체임을 강조)
- **Text (텍스트)**: `#f8fafc` (Off White) - 높은 가독성을 유지하는 밝은 흰색.

## 2. Typography
- **Heading**: 'Cinzel', serif - 고전적이고 전략적인 느낌의 서체.
- **Body/Numbers**: 'Montserrat', sans-serif - 세련되고 현대적인 숫자 표현.

## 3. Component Design
- **Game Board Container**:
  - 배경색(`#2d3748`) 적용 및 약간의 내부 그림자(Inner Shadow)를 통해 패임 효과 부여.
- **Scoreboard**:
  - 짙은 배경(`#0f172a`)에 선명한 골드(`#fbbf24`) 테두리 및 은은한 외부 발광(Glow) 효과 적용.
- **Cards (Tiles)**:
  - `transform: preserve-3d`를 이용한 3D 카드 구조 유지.
  - 슬레이트 그레이(`#475569`)와 선명한 테두리를 조합하여 네이비 배경으로부터 완벽히 시각적 분리.
  - 하단 짙은 그림자(Drop Shadow)로 물리적 질감 표현.

## 4. Interaction & Animation
- **Card Flip**: 대결 공개 시 `rotateY(180deg)` 애니메이션으로 긴장감 연출.
- **Score Gain**: 점수 획득 시 테두리 색상인 선명한 골드 파티클 스케일 업(Scale-up) 애니메이션.
- **Hover**: 카드에 마우스 오버 시 위로 살짝 떠오르는 플로팅(Floating) 효과 및 밝기 증가 필터 적용.