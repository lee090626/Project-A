# 용어 사전

---
status: canonical
owner: engineering
last_reviewed: 2026-05-15
source_paths:
  - src/shared/types/game
  - src/shared/config
  - src/shared/lib/equipmentRefinement.ts
  - src/features/game
  - src/entities
  - .agents/rules/08-agents.md
  - .agents/rules/06-asset-guide.md
---

## 목적

이 문서는 Drilling RPG에서 반복적으로 쓰는 게임/코드 용어의 의미를 고정합니다. 문서 본문은 한국어로 작성하되, 코드 식별자와 데이터 키는 원문 영어를 유지합니다.

## 아키텍처

| 용어 | 정의 | 근거 |
|---|---|---|
| FSD | `app`, `widgets`, `features`, `entities`, `shared` 레이어로 코드를 나누는 Feature-Sliced Design 구조입니다. | `.agents/rules/08-agents.md`, `src/` |
| `app` | Next.js 애플리케이션 시작점, 라우팅, 전역 레이아웃을 담당하는 레이어입니다. | `.agents/rules/08-agents.md`, `src/app` |
| `widgets` | HUD, inventory, crafting처럼 여러 기능을 조합한 UI 블록 레이어입니다. | `.agents/rules/08-agents.md`, `src/widgets` |
| `features` | 입력, 게임 엔진, 워커, 시스템처럼 기능 단위 동작을 담당하는 레이어입니다. | `.agents/rules/08-agents.md`, `src/features` |
| `entities` | 플레이어, 월드, 타일 같은 핵심 도메인 모델을 담당하는 레이어입니다. | `.agents/rules/08-agents.md`, `src/entities` |
| `shared` | 전역 재사용 타입, 설정, UI, 유틸리티를 담당하는 레이어입니다. | `.agents/rules/08-agents.md`, `src/shared` |
| Main Thread | React/Next.js UI가 실행되는 브라우저 메인 스레드입니다. 워커에 입력, 액션, 캔버스, 에셋을 전달합니다. | `src/shared/types/worker.ts`, `src/features/game/hooks` |
| Worker Thread | 게임 로직과 PixiJS 렌더링 초기화가 실행되는 워커 측 런타임입니다. | `src/features/game/worker`, `src/shared/types/worker.ts` |
| `GameEngineInstance` | 워커 내부에서 `GameWorld`, PixiJS, `GameLoop`, 에셋, 메시지 처리를 묶는 엔진 인스턴스입니다. | `src/features/game/worker/GameEngineInstance.ts` |
| `GameLoop` | 입력, 물리, 채굴, 스폰, 전투, 렌더링, UI 동기화, 자동 저장 등 ECS 시스템을 순서대로 실행하는 루프입니다. | `src/features/game/ecs/systems/GameLoop.ts` |
| System | 게임 루프에서 특정 책임을 수행하는 함수/모듈 단위입니다. 예: `miningSystem`, `combatSystem`, `renderSystem`. | `src/features/game/ecs/systems` |

## 월드와 진행

| 용어 | 정의 | 근거 |
|---|---|---|
| `GameWorld` | 플레이어, 타일맵, 에셋, UI 상태, 보스 전투 상태 등 런타임 월드 상태를 담는 객체입니다. | `src/entities/world/model.ts` |
| `PlayerStats` | 장비, 인벤토리, 체력, 깊이, 보스 진행, 숙련도, 상태 효과, 가이드 퀘스트 등 플레이어 진행 상태입니다. | `src/shared/types/game/player.ts` |
| `Position` | 게임 내 좌표를 나타내는 `{ x, y }` 구조입니다. | `src/shared/types/game/core.ts` |
| Depth | 전체 게임 기준 깊이 값입니다. `CircleConfig.depthStart`, `depthEnd`, `PlayerStats.maxDepthReached`에서 사용합니다. | `src/shared/config/circleData.ts`, `src/shared/types/game/player.ts` |
| Layer | 하나의 Circle 내부를 1~4단계로 나눈 상대 구간입니다. `getLayerFromDepth`가 깊이를 layer로 변환합니다. | `src/shared/config/circleData.ts` |
| Circle | 지옥의 원을 뜻하는 지역 단위입니다. 각 Circle은 깊이 범위, 테마, 배경 타일, 광물, 몬스터, 보스를 정의합니다. | `src/shared/config/circleData.ts` |
| `CircleConfig` | Circle의 ID, 이름, 깊이 범위, 광물 규칙, 몬스터 규칙, 보스 정보를 담는 설정 구조입니다. | `src/shared/config/circleData.ts` |
| `SPAWN_RULE_VERSION` | 스폰 밀도, 가중치, 레이어, 지형 마이그레이션 규칙 변경 시 기존 세이브를 재평가하기 위한 버전 값입니다. | `src/shared/config/circleData.ts` |

## 타일과 자원

| 용어 | 정의 | 근거 |
|---|---|---|
| `Tile` | 월드의 한 칸입니다. `type`, `health`, `maxHealth`, 선택적 `isSpot` 값을 가집니다. | `src/shared/types/game/core.ts` |
| `TileType` | 광물, 시스템 타일, 전리품/정수 키를 포함하는 타일 타입 유니온입니다. | `src/shared/types/game/core.ts` |
| 시스템 타일 | `empty`, `wall`, `stone`, `dungeon_bricks`, `gluttony_stone`, `boss_skin`, `monster_nest`, `monster`처럼 수집 자원과 구분되는 타일입니다. | `src/shared/types/game/core.ts` |
| `MineralDefinition` | 광물의 키, 이름, 설명, 색상, 최소 깊이, 가격, 내구도, 방어력, 수집 가능 여부, 이미지 키를 정의합니다. | `src/shared/config/minerals/types.ts` |
| 수집 가능 광물 | 인벤토리, 드롭, 판매, 도감, 숙련도 대상으로 취급되는 광물입니다. `MineralDefinition.collectible`로 구분합니다. | `src/shared/config/minerals/types.ts`, `src/shared/lib/saveManager.ts` |
| `MineralRule` | Circle 안에서 특정 `TileType` 광물이 어느 layer부터 어떤 확률/군집 크기로 생성되는지 정의합니다. | `src/shared/config/circleData.ts` |
| `Inventory` | 플레이어가 보유한 자원 수량 맵입니다. 수집 가능한 `TileType`과 추가 문자열 키를 수량으로 저장합니다. | `src/shared/types/game/player.ts` |
| `DroppedItem` | 월드에 떨어져 물리 효과를 받는 아이템 객체입니다. `TileType`, 위치, 속도, 수명을 가집니다. | `src/shared/types/game/items.ts` |

## 전투와 엔티티

| 용어 | 정의 | 근거 |
|---|---|---|
| `Entity` | 화면상의 NPC, 오브젝트, 몬스터, 보스, 투사체를 표현하는 객체입니다. | `src/shared/types/game/entity.ts` |
| `InteractionType` | 엔티티 상호작용 종류입니다. `shop`, `dialog`, `crafting`, `elevator`, `refinery`, `none` 중 하나입니다. | `src/shared/types/game/entity.ts` |
| Monster | `MonsterDefinition.type`이 `monster`인 적입니다. 스폰 규칙과 전투 스탯, 보상을 가집니다. | `src/shared/config/monsters/types.ts`, `src/shared/config/monsterData.ts` |
| Boss | `MonsterDefinition.type`이 `boss`인 적입니다. 일반 몬스터 정의에 더해 보스 패턴과 재생성 대기 시간을 가질 수 있습니다. | `src/shared/config/monsters/types.ts` |
| `MonsterDefinition` | 몬스터/보스의 ID, 이름, 크기, 아틀라스 키, 스탯, 보상, 행동, 보스 패턴을 정의합니다. | `src/shared/config/monsters/types.ts` |
| `MonsterSpawnRule` | Circle 안에서 어떤 몬스터가 어떤 layer 범위와 가중치로 생성되는지 정의합니다. | `src/shared/config/circleData.ts` |
| `BossPattern` | 보스 공격 패턴의 타입, 쿨타임, 투사체 수, 속도, 공격력, 크기, 경고 시간 등을 정의합니다. | `src/shared/config/monsters/types.ts` |
| `StatusType` | `STUN`, `SLOW`, `BURN`, `FREEZE` 등 캐릭터 상태 효과 타입입니다. | `src/shared/types/game/entity.ts` |
| `ActiveEffect` | 현재 적용 중인 상태 효과입니다. 타입, 시작/종료 시간, 값, VFX ID를 가질 수 있습니다. | `src/shared/types/game/entity.ts` |

## 장비, 숙련도, 효과

| 용어 | 정의 | 근거 |
|---|---|---|
| Equipment | 드릴, 투구, 갑옷, 신발 장비입니다. 제작 재료, 기본 스탯, 이미지 키를 가질 수 있고 재련으로 부위별 주스탯 보정률을 얻습니다. | `src/shared/types/game/equipment.ts`, `src/shared/config/equipmentData.ts`, `src/shared/lib/equipmentRefinement.ts` |
| `EquipmentPart` | 장비 부위 타입입니다. `Drill`, `Helmet`, `Armor`, `Boots` 중 하나입니다. | `src/shared/types/game/equipment.ts` |
| `EquipmentState` | 장비별 저장 상태입니다. 기존 숙련도 필드에 `mainStatBonusPct`를 더해 재련 결과를 보관합니다. | `src/shared/types/game/progress.ts`, `src/shared/lib/equipmentRefinement.ts` |
| Mastery | 특정 타일 타입이나 장비에 대한 숙련도 상태입니다. 경험치와 레벨을 포함합니다. | `src/shared/types/game/progress.ts` |
| `MasteryPerkDef` | 특정 타일 타입 숙련도 레벨을 요구하는 돌파 특성 정의입니다. | `src/shared/config/mastery/types.ts`, `src/shared/config/masteryPerks.ts` |
| Effect | 보유만으로 패시브 효과를 제공하는 누적형 아이템 계열입니다. `EFFECT_DATA`에 Essence, Relic, Crafted Effect가 함께 들어갑니다. | `src/shared/config/effectData.ts`, `src/shared/config/effects/types.ts` |
| Essence | Effect의 한 종류입니다. 몬스터/보스 드롭 기반 누적 패시브 재료로 다룹니다. | `src/shared/config/effects/essences.ts`, `.agents/rules/06-asset-guide.md` |
| Relic | Effect의 한 종류입니다. 보스/특수 보상 기반 고유 효과 아이템으로 다룹니다. | `src/shared/config/effects/relics.ts`, `.agents/rules/06-asset-guide.md` |
| Crafted Effect | 제작으로 만드는 보유형 Effect입니다. 현재 에셋 가이드에서는 `relics/` 폴더와 `PascalCaseRelic.png` 형식을 사용하도록 정의합니다. | `.agents/rules/06-asset-guide.md`, `src/shared/config/effects/items.ts` |

## 에셋과 렌더링

| 용어 | 정의 | 근거 |
|---|---|---|
| Asset | `src/shared/assets/` 아래에 있는 원본 이미지 파일입니다. 에셋 파이프라인을 거쳐 `public/assets/game-atlas-N.*`로 패킹됩니다. | `.agents/rules/06-asset-guide.md`, `src/shared/assets` |
| Atlas | 여러 에셋을 하나의 WebP/JSON 묶음으로 패킹한 스프라이트 시트입니다. | `.agents/rules/06-asset-guide.md`, `public/assets` |
| `atlasFiles.ts` | 아틀라스 ID와 원본 파일명 매핑을 담는 자동 생성 파일입니다. 직접 수정하지 않습니다. | `.agents/rules/06-asset-guide.md`, `scripts/generateAtlasMap.js` |
| `atlasMap.ts` | UI에서 아틀라스 좌표를 조회하기 위한 자동 생성 메타데이터 파일입니다. 직접 수정하지 않습니다. | `.agents/rules/06-asset-guide.md`, `scripts/generateAtlasMap.js` |
| `AtlasSprite` | 공유 UI 레이어에서 아틀라스 이미지를 DOM 배경으로 렌더링하는 컴포넌트입니다. | `src/shared/ui/AtlasSprite.tsx` |
| `AssetParser` | 워커 측에서 아틀라스 데이터를 PixiJS texture map으로 파싱하는 클래스입니다. 원본 파일명 키와 확장자를 제거한 키를 함께 등록합니다. | `src/features/game/lib/AssetParser.ts` |
| `TextureRegistry` | 렌더링 시스템이 사용하는 PixiJS texture 저장소 타입입니다. | `src/shared/types/engine.ts`, `src/features/game/worker/GameEngineInstance.ts` |
| VFX | 시각 효과 시스템입니다. `vfxSystem`이 게임 루프에서 실행됩니다. | `src/features/game/ecs/systems/VfxSystem.ts`, `src/features/game/ecs/systems/GameLoop.ts` |
| SFX | 사운드 효과 시스템입니다. `sfxSystem`이 게임 루프 초기화 시 준비됩니다. | `src/features/game/ecs/systems/sfxSystem.ts`, `src/features/game/ecs/systems/GameLoop.ts` |

## 저장과 메시지

| 용어 | 정의 | 근거 |
|---|---|---|
| `SaveData` | 저장 파일의 최상위 구조입니다. 버전, 타임스탬프, 플레이어 스탯, 위치, 타일맵 데이터를 포함합니다. | `src/shared/lib/saveManager.ts` |
| Save normalization | 구버전 세이브나 오염된 진행 데이터를 로드 시점에 보정하는 처리입니다. 웨이포인트, 수집 광물, 효과 스택, 보스 클리어, 가이드 퀘스트를 보정합니다. | `src/shared/lib/saveManager.ts` |
| `MainToWorkerMessage` | 메인 스레드에서 워커로 보내는 메시지입니다. `INIT`, `INPUT`, `ACTION`, `SAVE_REQUEST` 등을 포함합니다. | `src/shared/types/worker.ts` |
| `WorkerToMainMessage` | 워커에서 메인 스레드로 보내는 메시지입니다. `ENGINE_READY`, `RENDER_SYNC`, `SYNC_UI`, `SAVE`, `SHOW_TOAST` 등을 포함합니다. | `src/shared/types/worker.ts` |
| Render Sync | 워커에서 메인 스레드로 렌더/상태 동기화를 전달하는 흐름입니다. 메시지 타입은 `RENDER_SYNC`입니다. | `src/shared/types/worker.ts`, `src/features/game/lib/RenderSyncEncoder.ts` |
| Guide Quest | 초반 목표 체인입니다. 현재 C2 Lust 광물, C2 몬스터, C2 장비, Mastery Seal, Asmodeus 조우를 관측합니다. | `src/shared/config/guideQuestData.ts`, `src/shared/types/game/player.ts` |

## 혼동 주의

- `TileType`에는 광물뿐 아니라 시스템 타일과 전리품/정수 키도 포함됩니다. 모든 `TileType`이 수집 가능한 광물은 아닙니다.
- `atlasFiles.ts`와 `atlasMap.ts`는 자동 생성 파일입니다. RAG 정본으로 직접 설명을 늘리기보다 원본 에셋과 생성 스크립트, 정본 문서를 기준으로 삼아야 합니다.
- 문서에서 Circle별 정확한 밸런스 수치가 필요하면 이 용어 사전이 아니라 `src/shared/config/circleData.ts`, `src/shared/config/minerals/*`, `src/shared/config/monsters/*`를 확인해야 합니다.
- Skill Rune, Research, Reliquary Essence는 현재 데이터 모델에 없는 삭제된 기능/구분입니다. 새 문서에서 정본 개념으로 되살리지 않습니다.
