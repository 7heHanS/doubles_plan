# Doubles Plan Design System Guidelines

## 1. Color Palette (Revised for Higher Contrast)
- **Primary Background**: `#1e293b` (Brightened Navy) - 기존보다 명도를 높여 전체적인 칙칙함을 걷어낸 네이비 배경.
- **Accent/Border**: `#fbbf24` (Vivid Gold) - 더 밝고 선명한 옐로우 골드로 텍스트 및 스코어보드 테두리 강조.
- **Red Tile**: `#ef4444` (Vivid Red) - 어두운 배경에 묻히지 않는 쨍하고 선명한 붉은색.
- **Black Tile**: `#334155` (Slate Gray) - 배경 네이비색과 명확히 구분되도록 명도를 높인 다크 슬레이트 (시인성 확보를 위해 얇은 밝은색 테두리 병행 적용 권장).
- **Text**: `#f8fafc` (Off White) - 높은 가독성을 위한 밝은 텍스트.

## 2. Typography
- **Heading**: 'Cinzel', serif - 고전적이고 전략적인 느낌의 서체.
- **Body/Numbers**: 'Montserrat', sans-serif - 세련되고 현대적인 숫자 표현.

## 3. Component Design
- **Scoreboard**:
  - 선명해진 `#fbbf24` 색상의 테두리와 은은한 발광(Glow) 효과 적용.
- **Cards (Tiles)**:
  - `transform: preserve-3d`를 이용한 입체적인 3D 카드 구조 유지.
  - 뒤집기(Flip) 애니메이션을 위한 Front/Back 면 구성.
  - 밝아진 타일 색상의 입체감을 살리기 위해 하단 짙은 그림자(Drop Shadow)와 베벨(Bevel) 효과 강화.

## 4. Interaction & Animation
- **Card Flip**: 대결 공개 시 `rotateY(180deg)` 애니메이션으로 긴장감 극대화.
- **Score Gain**: 점수 획득 시 선명한 골드 파티클이 터지는 듯한 스케일 업(Scale-up) 애니메이션.
- **Hover**: 플레이어 타일에 마우스 오버 시 부드러운 플로팅(Floating) 효과 및 밝기 증가(Brightness up) 필터를 적용하여 즉각적인 상호작용 피드백 제공.