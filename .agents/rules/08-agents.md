---
trigger: always_on
---

# 🤖 Drilling RPG 통합 개발 가이드 (Master Development Guide)

이 문서는 Drilling RPG 프로젝트의 설계 철학, 아키텍처, 코딩 컨벤션 및 작업 프로세스를 정의하는 **단일 진실 공급원(Single Source of Truth)**입니다. 모든 개발 작업은 이 문서에 정의된 규칙을 반드시 준수해야 합니다.

---

## 🏛️ 1. 설계 철학 (Design Philosophy)

모든 개발 작업은 소프트웨어 공학의 3대 핵심 원칙을 기반으로 수행됩니다.

1.  **관심사의 분리 (SoC)**: 비즈니스 로직, UI, 데이터 저장은 완전히 분리되어야 합니다. UI 컴포넌트는 오직 렌더링에만 집중하며, 복잡한 상태 관리나 비즈니스 연산은 외부 훅이나 시스템으로 추출합니다.
2.  **높은 응집도 (High Cohesion)**: 하나의 파일이나 모듈은 하나의 책임만 완벽히 수행합니다. "함께 변경되어야 하는 데이터와 로직은 하나의 단위로 묶는다"는 원칙을 고수하여 무분별한 파편화로 인한 **산탄총 수술(Shotgun Surgery)**을 방지합니다.
3.  **낮은 결합도 (Low Coupling)**: 시스템 간의 의존성을 최소화합니다. 시스템 간의 직접적인 참조나 상호 호출을 금지하고, 가능한 인터페이스나 이벤트 기반의 메시지 전송 시스템을 활용하여 유연성을 확보합니다.

---

## ⚠️ 2. 절대 금기 사항 (Strict Don'ts)

1.  **God File / God System 생성 금지**: 하나의 시스템 내에 대미지 연산, 보상 획득, 시각 효과 등 서로 다른 관심사를 섞는 것을 엄격히 금지합니다. 발견 시 즉시 관심사별 원자적 단위(Atomic Unit)로 분해해야 합니다.
2.  **God Manager / 순환 참조 금지**: 매니저(Manager)나 시스템(System) 간에 서로를 직접 호출하거나 의존하는 구조를 만들지 마세요. 소통은 반드시 **이벤트 버스나 옵저버 패턴을 통한 구독/발행 형태**를 지향해야 합니다.
3.  **직접적인 DOM 접근 금지**: 게임 엔진은 Web Worker 환경에서 실행됩니다. UI 레이어를 제외한 곳에서 `window`나 `document` 객체를 절대 참조하지 마세요.
4.  **임시 이미지(Placeholder) 외부 링크 금지**: 이미지가 필요할 경우 `generate_image` 도구를 사용하며, 외부 URL은 절대 사용하지 마세요.
5.  **FSD (Feature-Sliced Design) 아키텍처 위반 금지**: 레이어 간 단방향 의존성 규칙(Upper → Lower)을 엄격히 준수하세요.
6.  **절대적인 주석 사용**: 모든 신규 도메인 함수 및 인터페이스에는 반드시 상세한 JS-DOC 주석을 작성합니다.
7.  **UI 스타일 제약**: 현대적이고 정갈한 디자인을 위해 `italic` 및 `uppercase` Tailwind 클래스 사용을 금지합니다.

---

## 🏗️ 3. 시스템 아키텍처 (System Architecture)

### 3.1 계층 구조: FSD (Feature-Sliced Design)
- **`app/`**: 애플리케이션 시작점, 라우팅 및 전역 설정.
- **`widgets/`**: 여러 기능이 결합된 독립적인 UI 블록 (예: `Hud`, `Shop`).
- **`features/`**: 비즈니스 가치 단위 (예: `mining`, `combat`). 엔진 브리지 포함.
- **`entities/`**: 핵심 도메인 모델, 데이터 구조 및 팩토리 함수.
- **`shared/`**: 전역 재사용 인프라 (UI, lib, config, types).

### 3.2 게임 엔진 (Web Worker ECS)
- **멀티스레딩**: UI(Main)와 로직(Worker)을 분리하여 60Hz의 안정적인 성능을 유지합니다.
- **ECS 패턴**: `System`과 `Component`를 분리하여 로직의 원자성을 확보합니다.
- **성능 최적화**: 가비지 컬렉션 최소화를 위해 **SoA(Structure of Arrays)** 구조와 **Spatial Hashing**을 사용합니다.

---

## 📝 4. 코딩 및 네이밍 규칙 (Coding Standards)

### 4.1 명명 규칙 (Naming)
- **디렉토리**: `kebab-case` (예: `game-engine`)
- **로직 파일 (.ts)**: `camelCase` (예: `physicsSystem.ts`)
- **컴포넌트 (.tsx)**: `PascalCase` (예: `InventoryWindow.tsx`)
- **변수 및 함수**: `camelCase` (`handleUpgrade`)
- **타입 및 인터페이스**: `PascalCase` (`PlayerStats`)
- **상수**: `SCREAMING_SNAKE_CASE` (`MAX_ENTITIES`)

### 4.2 코드 작성 지침
- **JSDoc 필수**: 모든 신규 도메인 함수 및 인터페이스에 상세 JSDoc을 작성합니다.
- **Type Safety**: `any` 사용을 지양하고, `npx tsc --noEmit`으로 타입 안정성을 수시로 확인합니다.
- **논리 패턴**: 조기 리턴(Early Return)을 활용하여 들여쓰기 깊이를 최소화합니다.

---

## 🌿 5. Git 전략 및 GitHub 협업 규칙 (Git & GitHub)

### 5.1 브랜치 명명 규칙
- **형식**: `{type}/{issue-number}-{description}`
- **예시**: `feat/12-shop-upgrade-logic`, `fix/45-worker-memory-leak`

### 5.2 커밋 컨벤션 (Conventional Commits)
**Conventional Commits** 표준을 엄격히 준수하며, 상세 설명은 반드시 **한글**로 명확하게 작성합니다.
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정 (로직, 렌더링 오류 등)
- `docs`: 문서 수정 (README, 가이드 문서 등)
- `style`: 코드 포맷팅, 세미콜론 누락 등 (비즈니스 로직 변경 없음)
- `refactor`: 코드 리팩토링 (기능 변화 없이 구조만 개선)
- `perf`: 성능 개선 및 최적화
- `test`: 테스트 코드 추가 및 수정
- `build`: 빌드 시스템, 외부 의존성 관련 변경
- `ci`: CI 설정 파일 및 스크립트 수정
- `chore`: 패키지 매니저 설정, 기타 사소한 작업
- `revert`: 이전 커밋 되돌리기
- `rename`: 파일/폴더 이름 변경 또는 위치 이동

### 5.3 작업 프로세스 (Two Track)
1. **표준 트랙 (Standard Track)**: "중요 작업"용
   - `gh issue create`를 통해 이슈 생성 및 번호 할당.
   - 브랜치 생성 및 단계별 구현.
   - **한 스텝마다 `npx tsc --noEmit` 검증 후 커밋.**
   - `gh pr create`를 통해 PR 제출 (본문에 `Closes #번호` 포함).
2. **패스트 트랙 (Fast Track)**: "경미한 작업"용 (오타 수정, 사소한 UI 조정 등)
   - 즉시 구현 및 `npx tsc --noEmit` 검증.
   - 원자적 단위 커밋 및 푸시.

### 5.4 버그 수정 프로토콜 (Bug Fix Protocol)
버그 리포트 접수 시, 다음의 절차를 엄격히 준수합니다.
1. **원인 분석**: 코드 분석을 통해 버그의 기술적 원인을 정확히 파악합니다.
2. **원인 보고**: 파악된 원인을 사용자에게 상세히 설명합니다.
3. **수정 승인**: 사용자가 원인을 이해하고 수정을 승인한 경우에만 실제 코드 수정을 시작합니다.
4. **임의 수정 금지**: 분석 결과 보고 없이 즉시 코드를 수정하는 행위를 금지합니다.

### 5.5 Issue 및 PR 템플릿 사용
- **Issue**: `bug_report`, `feature_request`, `task` 템플릿 중 성격에 맞는 것을 선택하여 상세히 기술합니다.
- **PR**: `.github/PULL_REQUEST_TEMPLATE.md`의 구조(`개요`, `주요 변경 사항`, `관련 이슈`, `체크리스트`)를 엄격히 준수합니다.
- **연동**: PR 본문에 `Closes #이슈번호`를 명시하여 작업 완료 시 이슈가 자동 닫히도록 합니다.

### ⚠️ CLI(`gh`) 사용 팁
터미널에서 PR을 생성할 때 마크다운 개행이 유지되도록 `heredoc` 구문을 권장합니다.
```bash
gh pr create --title "feat: 상점 시스템 구현" --body "$(cat <<EOF
## 개요
상점 핵심 로직 구현

## 주요 변경 사항
- Zustand 상태 관리 추가
- 업그레이드 계산 로직 분리

Closes #12
EOF
)"
```

---

## 🖼️ 6. 에셋 및 기타 지침 (Assets & Tools)

- **에셋 시스템**: 파일명이 ID가 되는 `PascalCase` 명명을 준수합니다. 에셋 추가 후 `npm run optimize:atlas && npm run update:atlas-map`을 실행합니다.
- **UI 디자인**: 그라데이션, 유리 효과(`backdrop-blur`) 등을 사용하여 프리미엄 감성을 유지합니다.
- **이미지 생성**: 작업 중 이미지가 필요한 경우 `generate_image` 도구를 사용합니다.

---

## 📚 7. 주요 문서 참조 (References)

- **[🖼️ 상세 에셋 가이드](06-asset-guide.md)**
- **[📐 ADR: Ping-Pong Sync](adr/ADR_PING_PONG_SYNC.md)**

