# 🛠️ 코딩 컨벤션 (Coding Conventions)

Drilling RPG 프로젝트는 팀원 간의 원활한 협업과 유지보수를 위해 일관된 코드 스타일과 구조를 유지합니다.

---

## 1. 디렉토리 구조 (FSD Layer Rules)

프로젝트는 **FSD (Feature-Sliced Design)** 구조를 엄격히 따릅니다. 각 레이어의 역할은 다음과 같습니다.

| Layer | 역할 | 참조 규칙 |
| :--- | :--- | :--- |
| **`app/`** | 전역 설정, 라우팅, 라이브러리 초기화. | 모든 레이어를 참조할 수 있습니다. |
| **`widgets/`** | 여러 기능이 조각된 독립적인 UI 블록. | `features`, `entities`, `shared`를 참조합니다. |
| **`features/`** | 사용자 시나리오 중심의 기능 단위. | `entities`, `shared`를 참조합니다. |
| **`entities/`** | 게임 핵심 도메인 모델 및 간단한 데이터 수정. | `shared`만 참조합니다. |
| **`shared/`** | 범용 유틸리티, 공통 UI, 타입 정의. | 다른 레이어를 참조할 수 없습니다. |

---

## 2. 네이밍 규칙 (Naming Rules)

- **파일 및 디렉토리**: `kebab-case`를 사용합니다. (예: `game-engine.tsx`, `physics-system.ts`)
- **컴포넌트**: `PascalCase`를 사용합니다. (예: `InventoryWindow.tsx`)
- **함수 및 변수**: `camelCase`를 사용합니다. (예: `handleUpgrade`, `totalGold`)
- **타입 및 인터페이스**: `PascalCase`를 사용합니다. (예: `interface PlayerStats`)
- **상수**: `SCREAMING_SNAKE_CASE`를 사용합니다. (예: `MAX_ENTITIES`, `GRAVITY`)

---

## 3. TypeScript 가이드라인

- **명시적 타입 정의**: 가능하면 추론보다는 명시적 타입을 사용하여 코드의 의도를 명확히 합니다.
- **Any 사용 금지**: `any` 타입 사용을 지양하고, 불확실할 경우 `unknown`을 사용한 후 타입 가드(Type Guard)를 거칩니다.
- **인터페이스 vs 타입**: 객체의 구조 정의에는 `interface`를 사용하고, 유니온 타입이나 유틸리티 타입에는 `type`을 사용합니다.
- **Enum 지양**: TypeScript `enum` 대신 `const enum` 또는 `union types`를 권장합니다.

---

## 4. 스타일 가이드

- **불필요한 주석 제거**: 코드 자체가 의도를 설명하도록 작성하되, 복잡한 물리 엔진 알고리즘 등은 상세한 주석을 추가합니다.
- **Tailwind CSS**: 인라인 스타일보다는 Tailwind 유틸리티 클래스를 우선적으로 사용합니다.
- **조기 리턴 (Early Return)**: 중첩된 `if` 문보다는 조건이 일치하지 않을 때 즉시 리턴하는 방식을 선호합니다.
- **ESLint 및 Prettier**: 프로젝트에 설정된 린팅 규칙을 따릅니다. (`npm run lint` 실행 필수)
