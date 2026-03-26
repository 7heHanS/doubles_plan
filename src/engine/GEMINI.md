# Game Engine Implementation Guide

## 1. 브라우저 호환성
- Node.js 전용 모듈(`fs`, `path` 등) 사용 금지. 브라우저에서 독립적으로 실행 가능한 순수 로직으로 작성.
- 상태 유지가 필요한 경우 `sessionStorage` 또는 `localStorage`를 활용하여 세션 지속성 확보.

## 2. 코어 상태 관리 (기존 로직 유지)
- `INIT` -> `DRAFTING` -> `BATTLE` -> `SCORING` -> `END` 페이즈 관리.
- 타일 객체(숫자, 색상) 및 플레이어 점수 트래킹.
- 승패 판정 로직 순서 엄수: 더블승 -> 역전승 -> 기본승.