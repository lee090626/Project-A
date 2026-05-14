# Drilling RPG 문서화 기준

---
status: canonical
owner: engineering
last_reviewed: 2026-05-14
source_paths:
  - README.md
  - .agents/rules
  - package.json
---

## 목적

이 디렉터리는 향후 RAG 시스템에 인덱싱할 수 있는 프로젝트 지식의 정본 위치입니다. 이곳의 문서는 희망하는 구조가 아니라 현재 저장소의 실제 상태를 설명해야 합니다.

`.agents/rules/` 디렉터리는 에이전트 행동 규칙과 작업 수행 규칙의 기준으로 유지합니다. `docs/` 디렉터리는 사람과 RAG가 함께 읽을 수 있는 프로젝트 지식 문서를 담당합니다.

## 현재 상태

문서화는 단계적으로 다시 구축합니다. 현재 완료된 정본 문서는 아래 표의 완료 항목입니다.

계획 중인 정본 문서:

| 문서 | 범위 | 상태 |
|---|---|---|
| `GLOSSARY.md` | 게임/코드 공통 용어 | 완료 |
| `GAME_DATA_MODEL.md` | 설정 데이터, ID, 참조 관계 | 완료 |
| `GAME_CONSTANTS.md` | 런타임 상수, 밸런스 상수, 기본 플레이어 수치 | 완료 |
| `ARCHITECTURE.md` | FSD 레이어, 워커 경계, 런타임 구조 | 완료 |
| `CORE_GAME_LOOP.md` | 채굴, 이동, 전투, 보상, 저장 흐름 | 완료 |
| `ASSET_PIPELINE.md` | 에셋 명명, 아틀라스 생성, 매핑 규칙 | 완료 |
| `RENDERING_PIPELINE.md` | PixiJS 렌더링, 아틀라스 로딩, 렌더 시스템 | 완료 |
| `SAVE_AND_MIGRATION.md` | 저장 데이터 구조와 마이그레이션 정책 | 계획 |
| `DEVELOPMENT_WORKFLOW.md` | 이슈, PR, 커밋, 검증 명령 | 계획 |
| `DEPLOYMENT.md` | 빌드 타깃과 배포 산출물 | 계획 |

위 문서들은 실제 파일이 생성되기 전까지 `README.md`에서 링크하지 않습니다.

## 문서 작성 규칙

모든 정본 문서는 아래 front matter를 포함해야 합니다.

```md
---
status: canonical
owner: engineering
last_reviewed: YYYY-MM-DD
source_paths:
  - path/to/source
---
```

문서는 아래 규칙을 만족해야 합니다.

- 넓은 설명보다 실제 파일 경로, 명령어, 데이터 이름을 우선합니다.
- 소스 코드, 설정 파일, package script를 산문 문서보다 높은 기준으로 봅니다.
- 코드에서 추론한 동작과 직접 검증한 동작을 구분해서 씁니다.
- 하나의 문서는 하나의 책임에 집중합니다.
- "현재", "최신", "최근" 같은 표현은 검토일이나 근거 경로와 함께 씁니다.
- 문서를 이동하거나 삭제할 때는 같은 변경에서 오래된 링크를 수정하거나 제거합니다.
- 본문은 한국어로 작성하되, 코드 식별자와 도메인 키는 원문 영어를 유지합니다.

## RAG 인덱싱 기준

향후 RAG 인덱스에 포함할 대상:

| 경로 | 포함 여부 | 이유 |
|---|---:|---|
| `docs/**/*.md` | 포함 | 정본 프로젝트 지식 |
| `.agents/rules/*.md` | 조건부 포함 | 개발 에이전트와 작업 규칙 답변에 유용함 |
| `.github/ISSUE_TEMPLATE/*.md` | 조건부 포함 | GitHub 이슈 workflow 질문에만 유용함 |
| `.github/PULL_REQUEST_TEMPLATE.md` | 조건부 포함 | PR workflow 질문에만 유용함 |
| `README.md` | 포함 | 프로젝트 개요와 진입점 |

향후 RAG 인덱스에서 제외할 대상:

| 경로 | 이유 |
|---|---|
| `out/**` | Next.js export 빌드 산출물 |
| `.open-next/**` | OpenNext 빌드 산출물 |
| `node_modules/**` | 외부 의존성 내용 |
| `public/ads.txt` | 광고 메타데이터이며 프로젝트 지식이 아님 |
| `public/robots.txt` | 크롤러 메타데이터이며 프로젝트 지식이 아님 |
| `src/shared/config/atlasFiles.ts` | 자동 생성된 아틀라스 매핑이므로 원본 에셋 또는 생성 요약을 사용 |
| `src/shared/config/atlasMap.ts` | 자동 생성된 아틀라스 메타데이터이므로 원본 에셋 또는 생성 요약을 사용 |

`src/shared/config/` 아래의 구조화된 설정 파일은 나중에 RAG 입력이 될 수 있습니다. 다만 먼저 정본 문서로 요약하거나 결정적인 스크립트로 변환해야 합니다. 원본 config를 직접 인덱싱할 경우 ID, 표시 이름, source path, 참조 관계가 보존되어야 합니다.

## 검증 체크리스트

문서를 RAG-ready 상태로 보기 전에 아래를 확인합니다.

- 모든 링크가 실제 존재하는 파일을 가리킵니다.
- 모든 명령어가 `package.json`에 존재하거나 외부 명령으로 명시되어 있습니다.
- 참조한 source path가 실제 존재합니다.
- 문서에 `status`, `owner`, `last_reviewed`, `source_paths`가 있습니다.
- 충돌하는 규칙은 더 구체적인 기준 문서로 연결해 해결합니다.
- 자동 생성 파일과 빌드 산출물을 정본 지식으로 취급하지 않습니다.
