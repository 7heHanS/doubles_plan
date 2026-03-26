# Doubles Plan Design System Guidelines

## 1. Color Palette
- **Primary Background**: `#0f172a` (Deep Navy) - 차분하고 집중력 있는 대결 분위기 조성.
- **Accent/Border**: `#d4af37` (Metallic Gold) - 스코어보드 및 강조 요소에 사용되어 고급스러움 부여.
- **Red Tile**: `#b91c1c` (Deep Red) - 채도를 낮춘 고급스러운 레드.
- **Black Tile**: `#1e293b` (Slate Black) - 네이비 배경과 조화를 이루는 블랙.
- **Text**: `#f8fafc` (Off White) - 가독성을 위한 밝은 텍스트.

## 2. Typography
- **Heading**: 'Cinzel', serif - 고전적이고 전략적인 느낌의 서체.
- **Body/Numbers**: 'Montserrat', sans-serif - 세련되고 현대적인 숫자 표현.

## 3. Component Design
- **Scoreboard**: 골드 그라데이션 테두리와 은은한 발광(Glow) 효과 적용.
- **Cards (Tiles)**: 
  - `transform: preserve-3d`를 이용한 입체적인 3D 카드 구조.
  - 뒤집기(Flip) 애니메이션을 위한 Front/Back 면 구성.
  - 하단 그림자와 베벨(Bevel) 효과로 물리적 질감 표현.

## 4. Interaction & Animation
- **Card Flip**: 대결 공개 시 `rotateY(180deg)` 애니메이션으로 긴장감 극대화.
- **Score Gain**: 점수 획득 시 골드 파티클이 터지는 듯한 스케일 업 애니메이션.
- **Hover**: 플레이어 타일에 부드러운 플로팅 효과.
