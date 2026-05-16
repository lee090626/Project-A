# 개발 워크플로

---
status: canonical
owner: engineering
last_reviewed: 2026-05-14
source_paths:
  - .agents/rules/08-agents.md
  - .agents/rules/06-asset-guide.md
  - .github/ISSUE_TEMPLATE/bug_report.md
  - .github/ISSUE_TEMPLATE/feature_request.md
  - .github/ISSUE_TEMPLATE/task.md
  - .github/PULL_REQUEST_TEMPLATE.md
  - package.json
  - README.md
  - docs/README.md
---

## 목적

이 문서는 Drilling RPG에서 이슈, 브랜치, 커밋, 검증, PR을 어떤 기준으로 진행하는지 설명합니다. 코드 구조의 책임 경계는 `ARCHITECTURE.md`, 에셋 작업 절차는 `ASSET_PIPELINE.md`, 배포 명령은 `DEPLOYMENT.md`에서 별도로 다룹니다.

## 기준 문서 우선순위

| 기준 | 역할 |
|---|---|
| `.agents/rules/08-agents.md` | 개발 철학, 금기 사항, Git/GitHub 협업 규칙의 최상위 기준입니다. |
| `.agents/rules/06-asset-guide.md` | 에셋 추가와 아틀라스 생성 작업의 상세 기준입니다. |
| `.github/ISSUE_TEMPLATE/*.md` | GitHub 이슈 작성 형식입니다. |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR 본문과 체크리스트 형식입니다. |
| `package.json` | 실제 실행 가능한 npm script의 정본입니다. |
| `docs/*.md` | RAG와 사람이 읽는 프로젝트 지식 정본입니다. |

충돌할 때는 더 구체적인 문서를 우선합니다. 예를 들어 에셋 작업은 `08-agents.md`보다 `06-asset-guide.md`의 폴더/명명 규칙을 우선 확인합니다.

## 작업 시작 체크

작업 전 기본 확인:

```bash
git status --short --branch
git branch -vv
```

확인할 것:

| 항목 | 기준 |
|---|---|
| 현재 브랜치 | `main`에서 직접 기능 작업을 시작하지 않습니다. |
| 작업트리 상태 | 기존 변경이 있으면 내 작업 범위인지 먼저 구분합니다. |
| 원격 기준 | 오래된 브랜치라면 `origin/main`을 먼저 반영합니다. |
| 워크트리 | Codex 앱에서 여러 에이전트를 쓰면 각 작업이 서로 다른 worktree/branch에 있는지 확인합니다. |

여러 에이전트를 병렬로 쓸 때는 한 브랜치를 공유하지 않습니다. 각 에이전트는 독립 브랜치나 독립 worktree에서 작업하고, main 반영은 PR 단위로 합칩니다.

## 작업 트랙

`.agents/rules/08-agents.md`는 작업을 두 트랙으로 나눕니다.

| 트랙 | 대상 | 흐름 |
|---|---|---|
| 표준 트랙 | 기능 추가, 버그 수정, 구조 변경, 저장/배포/엔진 변경처럼 위험도가 있는 작업 | 이슈 생성 -> 브랜치 생성 -> 단계별 구현 -> 검증 -> 커밋 -> PR |
| 패스트 트랙 | 오타, 작은 문서 수정, 좁은 UI 문구 수정처럼 영향 범위가 작은 작업 | 즉시 수정 -> 검증 -> 원자적 커밋 -> push |

문서화 작업도 범위가 크면 표준 트랙처럼 브랜치와 PR로 진행합니다. 이슈가 없는 사용자 지시 기반 문서 작업은 PR 본문에 "관련 이슈 없음"을 명시합니다.

## 브랜치 기준

브랜치 이름은 `{type}/{issue-number}-{description}` 형식입니다.

예:

```bash
feat/12-shop-upgrade-logic
fix/45-worker-memory-leak
docs/rag-documentation
```

권장 기준:

| prefix | 사용 예 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 정리 |
| `refactor` | 동작 변경 없는 구조 정리 |
| `perf` | 성능 개선 |
| `task` | 유지보수성 작업 |

로컬 `main` 최신화:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

작업 브랜치에 원격 main 반영:

```bash
git fetch origin
git pull --rebase origin main
```

강제 push는 기본 작업 흐름에 넣지 않습니다. PR 브랜치를 rebase 후 이미 원격에 push한 이력이 있다면, force push 필요 여부를 별도로 판단합니다.

## 커밋 기준

커밋 메시지는 Conventional Commits를 따릅니다.

| type | 의미 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 포맷팅, 세미콜론 등 비즈니스 로직 변경 없는 수정 |
| `refactor` | 기능 변화 없는 구조 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 코드 추가/수정 |
| `build` | 빌드 시스템, 외부 의존성 변경 |
| `ci` | CI 설정 변경 |
| `chore` | 기타 유지보수 |
| `revert` | 이전 커밋 되돌리기 |
| `rename` | 파일/폴더 이름 변경 또는 위치 이동 |

커밋 단위 규칙:

- 하나의 커밋은 하나의 목적만 포함합니다.
- 로직 변경과 포맷팅 변경을 섞지 않습니다.
- 문서, 코드, 에셋 산출물이 서로 다른 책임이면 커밋을 나눕니다.
- 커밋 전 `git diff`로 범위를 확인합니다.
- unrelated 변경을 함께 stage하지 않습니다.

## 이슈 작성

현재 이슈 템플릿은 세 가지입니다.

| 템플릿 | label | 사용 시점 | 필수 내용 |
|---|---|---|---|
| `bug_report.md` | `bug` | 예상치 못한 동작이나 오류 | 버그 개요, 재현 방법, 예상 동작, 로그/스크린샷 |
| `feature_request.md` | `enhancement` | 새 기능 제안 | 기능 개요, 상세 구현 내용, 예상 결과 |
| `task.md` | `task` | 유지보수, 리팩토링, 일반 작업 | 작업 배경, 체크리스트, 참고 링크 |

버그 수정은 원인 분석 -> 원인 보고 -> 수정 승인 -> 구현 순서로 진행합니다. 분석 없이 바로 수정하는 흐름은 기본 프로토콜이 아닙니다.

## PR 작성

PR은 `.github/PULL_REQUEST_TEMPLATE.md`를 따릅니다.

필수 섹션:

| 섹션 | 내용 |
|---|---|
| `개요` | 이 PR이 해결하는 문제나 추가하는 내용을 요약합니다. |
| `주요 변경 사항` | 핵심 변경을 파일/기능 단위로 나열합니다. |
| `커밋 단위` | 커밋이 어떤 목적 단위로 나뉘었는지 설명합니다. |
| `관련 이슈` | 가능하면 `Closes #번호`로 연결합니다. 없으면 이유를 명시합니다. |
| `체크리스트` | 이슈 연결, 커밋 규약, PR 본문, 규칙 준수, 타입 검증 여부를 표시합니다. |

큰 작업은 draft PR로 먼저 올리고, 검증과 리뷰 준비가 끝난 뒤 ready 상태로 전환합니다. main 직접 push보다 PR merge를 기본값으로 둡니다.

## 검증 명령

`package.json` 기준 현재 주요 검증/실행 명령:

| 명령 | 용도 |
|---|---|
| `npm run dev` | 로컬 개발 서버 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript 타입 검사. package script는 아니지만 `08-agents.md`의 기준 검증입니다. |
| `npm run build` | 기본 Next.js build |
| `npm run gen:headers` | `config/security-headers.json`에서 `public/_headers` 재생성 |
| `npm run optimize:atlas` | 원본 에셋을 아틀라스로 패킹 |
| `npm run update:atlas-map` | 아틀라스 좌표와 타입 매핑 재생성 |
| `npm run format` | Prettier 전체 포맷 |

작업 유형별 권장 검증:

| 작업 | 최소 검증 |
|---|---|
| 문서만 수정 | `test -f docs/문서명.md`, 관련 README 링크 `rg` |
| TypeScript 코드 수정 | `npx tsc --noEmit`, `npm run lint` |
| React UI 수정 | TypeScript/lint와 브라우저 화면 확인 |
| Worker/ECS 수정 | TypeScript/lint, 게임 루프 smoke test, 관련 문서 확인 |
| 에셋 추가 | `npm run optimize:atlas`, `npm run update:atlas-map`, atlas key `rg` |
| 저장/마이그레이션 수정 | 자동 저장, reload, export/import, IndexedDB 가능/불가 경로 확인 |
| 배포 설정 수정 | 대상별 build 명령과 산출물 확인 |

`node_modules`가 없는 작업공간에서는 npm script가 실행되지 않습니다. 이 경우 검증 미실행 사유를 PR이나 최종 보고에 명시합니다.

## 문서화 작업 기준

정본 문서는 `docs/README.md` 규칙을 따릅니다.

문서 작업 순서:

1. 관련 코드와 설정 파일을 먼저 읽습니다.
2. `source_paths`에 실제 근거 경로를 적습니다.
3. 자동 생성 파일과 빌드 산출물을 정본으로 삼지 않습니다.
4. 작성 완료 후 `README.md`와 `docs/README.md` 링크를 갱신합니다.
5. 링크와 source path 존재 여부를 검증합니다.

문서 본문은 한국어로 작성하되, 코드 식별자와 데이터 키는 원문 영어를 유지합니다.

## 에셋 작업 기준

에셋 작업은 `ASSET_PIPELINE.md`와 `.agents/rules/06-asset-guide.md`를 기준으로 합니다.

기본 절차:

```bash
npm run optimize:atlas
npm run update:atlas-map
```

`src/shared/config/atlasFiles.ts`, `src/shared/config/atlasMap.ts`, `public/assets/game-atlas-*`, `public/assets/manifest.json`는 생성 산출물입니다. 손으로 수정하지 않습니다.

## main 반영 기준

문서화나 기능 브랜치를 main에 반영할 때:

1. 브랜치가 `origin/main` 위에 있는지 확인합니다.
2. 작업트리가 clean인지 확인합니다.
3. PR을 열고 diff와 검증 상태를 확인합니다.
4. 리뷰 또는 사용자 승인이 있으면 merge합니다.

로컬에서 직접 합칠 때는 fast-forward 가능 여부를 먼저 확인합니다.

```bash
git checkout main
git pull --ff-only origin main
git merge --ff-only 작업브랜치
git push origin main
```

non-fast-forward push가 거부되면 원격 main 변경을 먼저 반영합니다. `git push --force origin main`은 기본 workflow에서 사용하지 않습니다.

## 검증 명령

문서만 바꾼 경우:

```bash
test -f docs/DEVELOPMENT_WORKFLOW.md
rg -n "DEVELOPMENT_WORKFLOW.md" README.md docs/README.md
```

workflow 규칙이나 template을 함께 바꾼 경우:

```bash
rg -n "표준 트랙|패스트 트랙|PULL_REQUEST_TEMPLATE|ISSUE_TEMPLATE|npx tsc --noEmit" .agents .github docs package.json
npm run lint
```
