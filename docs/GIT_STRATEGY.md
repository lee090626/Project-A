# 🌿 Git 전략 및 커밋 규칙 (Git Strategy & Conventions)

Drilling RPG 프로젝트는 팀의 효율적인 코드 리뷰와 원활한 배포를 위해 다음 Git 워크플로우를 사용합니다.

---

## 1. 브랜치 전략 (Branching Strategy)

우리는 단순하고 강력한 **GitHub Flow**를 사용합니다.

- **`main`**: 상시 빌드가 가능하고 언제든 배포할 수 있는 골든 브랜치입니다.
- **`feature/<name>`**: 새로운 기능을 개발할 때 사용합니다. (예: `feature/mining-system`)
- **`fix/<name>`**: 버그를 수정할 때 사용합니다. (예: `fix/rendering-glitch`)
- **`docs/<name>`**: 문서를 작성하거나 수정할 때 사용합니다. (예: `docs/architecture-update`)

---

## 2. 커밋 컨벤션 (Commit Conventions)

이 프로젝트는 **Conventional Commits** 표준을 따릅니다.

### **형식**
```text
<type>(<scope>): <subject>

<body> (선택사항)
```

### **주요 타입 (Types)**
- `feat`: 새로운 기능 추가.
- `fix`: 버그 수정 (로직, 렌더링 등).
- `docs`: 문서 관련 변경 (README, docs/).
- `style`: 코드 형식, 세미콜론 누락 등 (로직 변화 없음).
- `refactor`: 기능 변화는 없으나 코드 구조를 개선하는 작업.
- `perf`: 성능 향상을 위한 최적화 작업.
- `chore`: 빌드 설정, 의존성 관리 등의 기타 작업.

---

## 3. Pull Request (PR) 프로세스

1.  **Branch 생성**: 기능 개발 시 `feature/` 브랜치에서 시작합니다.
2.  **Self-Review**: PR을 올리기 전 스스로 코드의 품질과 핵심 로직을 검토합니다.
3.  **PR 생성**: 변경 사항을 요약하고, 관련 이슈가 있다면 링크를 추가합니다.
4.  **Review & Merge**: 코드 리뷰를 거쳐 승인되면 `main` 브랜치로 머지합니다.

---

## 4. 예시 (Examples)

- `feat(mining): 가벼운 드릴 장비 아이템 추가`
- `perf(engine): 트리플 버퍼링 락-프리 동기화 최적화`
- `fix(render): 모달 창 활성화 시 마우스 클릭 투과 현상 수정`
