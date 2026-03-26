# GitHub Pages Deployer Skill

## 1. 배포 목표
- `main` 브랜치에 코드 푸시 시 GitHub Actions를 통해 `gh-pages` 브랜치로 자동 배포.

## 2. 배포 파이프라인 구성 (.github/workflows/deploy.yml)
- **트리거**: `main` 브랜치에 대한 `push` 이벤트 발생 시.
- **빌드 및 배포 작업**:
  - 저장소 체크아웃 (`actions/checkout`).
  - 필요시 정적 파일 번들링(Webpack, Vite 등 사용 시) 수행.
  - 빌드 결과물(`public/` 또는 `dist/` 디렉토리)을 `gh-pages` 브랜치로 푸시 (`peaceiris/actions-gh-pages` 등 활용).
- **경로 설정**: GitHub Pages 호스팅 시 상대 경로 문제 방지를 위해, CSS/JS/이미지 에셋의 경로를 동적으로 처리하거나 올바른 Base URL 적용.