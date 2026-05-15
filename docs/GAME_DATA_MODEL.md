# 게임 데이터 모델

---
status: canonical
owner: engineering
last_reviewed: 2026-05-15
source_paths:
  - src/shared/config/circleData.ts
  - src/shared/config/mineralData.ts
  - src/shared/config/minerals
  - src/shared/config/monsterData.ts
  - src/shared/config/monsters
  - src/shared/config/equipmentData.ts
  - src/shared/config/effectData.ts
  - src/shared/config/effects
  - src/shared/config/masteryPerks.ts
  - src/shared/config/mastery
  - src/shared/config/guideQuestData.ts
  - src/shared/config/coreDataFiles.ts
  - src/shared/config/coreDataFiles.json
  - src/shared/config/lateCircleLock.ts
  - src/shared/lib/equipmentRefinement.ts
  - src/shared/types/game
---

## 목적

이 문서는 게임 콘텐츠 데이터의 정본 파일과 ID 참조 관계를 설명합니다. RAG가 "어떤 데이터가 어디에 있고, 새 데이터를 추가할 때 어떤 참조를 같이 맞춰야 하는가"에 답할 수 있게 만드는 것이 목적입니다.

이 문서는 런타임 상수와 계산식의 상세 의미를 다루지 않습니다. `src/shared/config/combatConstants.ts`, `src/shared/config/constants.ts`, `src/shared/config/playerConstants.ts`는 별도 `GAME_CONSTANTS.md`에서 다루는 편이 낫습니다.

## 정본 파일 지도

| 파일 | 정본 데이터 | 역할 |
|---|---|---|
| `src/shared/config/circleData.ts` | `CIRCLES`, `CircleConfig`, `MineralRule`, `MonsterSpawnRule`, `SPAWN_RULE_VERSION` | Circle별 깊이 범위, 배경 타일, 광물 생성, 몬스터 스폰, 보스 배치를 정의합니다. |
| `src/shared/config/mineralData.ts` | `TILE_DEFINITIONS`, `MINERALS`, `MINERAL_MAP`, `isCollectibleMineral` | Circle별 광물 파일을 통합하고 수집 가능 광물 목록과 조회 맵을 제공합니다. |
| `src/shared/config/minerals/types.ts` | `MineralDefinition` | 광물/타일 정의의 필드 구조입니다. |
| `src/shared/config/monsterData.ts` | `MONSTER_LIST`, `MONSTERS`, `MONSTER_DEFINITIONS` | Circle별 몬스터 파일을 통합하고 ID 조회 맵을 제공합니다. |
| `src/shared/config/monsters/types.ts` | `MonsterDefinition`, `BossPattern` | 몬스터/보스 정의와 보스 패턴 구조입니다. |
| `src/shared/config/equipmentData.ts` | `EQUIPMENTS` | 장비 ID, 부위, Circle, 기본 스탯, 제작 재료, 이미지 키를 정의합니다. |
| `src/shared/lib/equipmentRefinement.ts` | 장비 주스탯 재련 규칙 | 부위별 주스탯, 옵션 범위, 리롤 비용, 품질 라벨, 재련 스탯 계산을 정의합니다. |
| `src/shared/config/effectData.ts` | `EFFECT_DATA`, `EFFECT_LIST` | Essence, Relic, Crafted Effect를 하나의 Effect 데이터베이스로 통합합니다. |
| `src/shared/config/effects/types.ts` | `EffectDefinition` | 누적형 보유 효과 아이템의 필드 구조입니다. |
| `src/shared/config/masteryPerks.ts` | `MASTERY_PERKS` | Circle별 mastery perk 파일을 하나의 배열로 통합합니다. |
| `src/shared/config/mastery/types.ts` | `MasteryPerkDef`, `MasteryPerkEffect` | 타일 숙련도 돌파 특성의 구조입니다. |
| `src/shared/config/guideQuestData.ts` | `C2_GUIDE_QUESTS`, C2 guide ID 상수, guide state helper | 초반 C2 가이드 퀘스트 목표, 보상, 진행도 계산을 정의합니다. |
| `src/shared/config/coreDataFiles.ts` | `CORE_DATA_FILES`, `BASE_LAYOUT_FILE`, `ENTITIES_FILE` | `/baseLayout.json`, `/entities.json`, `/game-init-data.json` 같은 초기 데이터 파일 목록을 검증해 노출합니다. |
| `src/shared/config/lateCircleLock.ts` | C5+ 임시 잠금 수치 | 아직 밸런싱 전인 Circle 5+ 광물, 몬스터, 제작, 재련 비용을 사실상 접근 불가능한 값으로 고정합니다. |

## 기본 ID 관계

| 기준 ID | 참조 위치 | 맞춰야 하는 대상 |
|---|---|---|
| `TileType` | `src/shared/types/game/core.ts` | 광물, 시스템 타일, Essence 키의 기본 유니온입니다. 새 광물/타일 키를 추가할 때 먼저 확인합니다. |
| `TILE_TYPE_TO_ID` | `src/shared/types/game/core.ts` | 저장과 비트 패킹용 숫자 ID입니다. 기존 ID를 재사용하지 않습니다. |
| `MineralDefinition.key` | `src/shared/config/minerals/*` | `TileType`에 존재해야 하며, 수집 가능 광물은 `MINERALS`에 포함됩니다. |
| `CircleConfig.bgType` | `src/shared/config/circleData.ts` | 배경 타일로 사용할 `TileType`입니다. 보통 `MineralDefinition.collectible: false`인 시스템 타일을 사용합니다. |
| `CircleConfig.minerals[].type` | `src/shared/config/circleData.ts` | `TileType` 및 `TILE_DEFINITIONS`에 존재하는 광물 키여야 합니다. |
| `CircleConfig.monsters[].monsterId` | `src/shared/config/circleData.ts` | `MONSTERS`에서 조회 가능한 `MonsterDefinition.id`여야 합니다. |
| `CircleConfig.boss.id` | `src/shared/config/circleData.ts` | `MonsterDefinition.type`이 `boss`인 몬스터 ID여야 합니다. |
| `MonsterDefinition.rewards.drops[].itemId` | `src/shared/config/monsters/*` | 보상 처리 코드가 인벤토리나 `collectionHistory`에 적재할 수 있는 자원/Effect ID여야 합니다. |
| `Equipment.price` key | `src/shared/config/equipmentData.ts` | 수집 가능 광물 키 또는 제작 재료로 취급되는 Effect ID를 사용합니다. 장비 제작에는 `goldCoins`를 사용하지 않습니다. |
| `EffectDefinition.requirements` key | `src/shared/config/effects/*` | 제작에 소비할 `goldCoins`, 광물 키, Effect ID를 사용합니다. |
| `MasteryPerkDef.tileType` | `src/shared/config/mastery/*` | 숙련도 대상으로 기록되는 타일/광물 키와 일치해야 합니다. |
| `GuideQuestDefinition.reward.inventory` key | `src/shared/config/guideQuestData.ts` | 플레이어 인벤토리에 적재 가능한 자원 키여야 합니다. |

## 플레이어 저장 상태와의 연결

`PlayerStats`는 config 데이터의 ID를 문자열로 저장합니다. 따라서 config ID를 바꾸면 저장 데이터 마이그레이션도 함께 검토해야 합니다.

| 저장 필드 | 참조하는 데이터 |
|---|---|
| `equipment.drillId`, `equipment.helmetId`, `equipment.armorId`, `equipment.bootsId` | `EQUIPMENTS`의 장비 ID |
| `ownedEquipmentIds` | `EQUIPMENTS`의 장비 ID 목록 |
| `inventory` | 수집 가능 `TileType`, Effect ID, 기타 자원 키 |
| `clearedCircleIds` | `CircleConfig.id` |
| `encounteredBossIds`, `bossRespawnTimers` | `MonsterDefinition.id` 중 보스 ID |
| `killedMonsterIds` | `MonsterDefinition.id` |
| `equipmentStates` | `EQUIPMENTS`의 장비 ID별 재련 상태입니다. `mainStatBonusPct`는 -20~20 정수 퍼센트입니다. |
| `tileMastery` | 숙련도 대상으로 쓰는 타일/광물 키 |
| `unlockedMasteryPerks` | `MasteryPerkDef.id` |
| `collectionHistory` | `EffectDefinition.id` 등 누적 수집 아이템 ID |
| `guideQuest` | `C2_GUIDE_QUESTS[].id`와 guide helper가 사용하는 counter key |

## 이미지 키 관계

이미지 필드는 원본 에셋과 아틀라스 생성 결과를 간접 참조합니다. `src/shared/config/atlasFiles.ts`와 `src/shared/config/atlasMap.ts`는 자동 생성물이므로 직접 정본으로 편집하지 않습니다.

| 필드 | 의미 |
|---|---|
| `MineralDefinition.image` | 인벤토리/UI용 광물 아틀라스 키 |
| `MineralDefinition.tileImage` | 월드 타일 렌더링용 광물 아틀라스 키 |
| `MonsterDefinition.imagePath` | 몬스터/보스 렌더링 아틀라스 키 |
| `MonsterDefinition.behavior.projectileId` | 투사체 렌더링에 사용할 아틀라스 키 |
| `Equipment.image` | 장비 UI 아틀라스 키 |
| `EffectDefinition.image` | Essence, Relic, Crafted Effect UI 아틀라스 키 |

에셋을 추가하거나 이름을 바꾸면 `.agents/rules/06-asset-guide.md`를 기준으로 원본 파일을 정리한 뒤 `npm run optimize:atlas && npm run update:atlas-map`을 실행합니다.

## C5+ 임시 접근 잠금

2026-05-15 기준 Circle 5 이후 콘텐츠는 실제 밸런싱 전이므로 `src/shared/config/lateCircleLock.ts`의 고정값으로 잠겨 있습니다.

잠금 방식:

- `circleData.ts`에서 Circle 5~9의 `bgType`을 일반 `stone`이 아니라 해당 Circle의 고방어 광물로 지정합니다.
- `minerals/circle5.ts`부터 `minerals/circle9.ts`까지 광물 `baseHealth`는 저장 포맷 상한인 `65535`, `defense`는 플레이어가 대미지를 넣기 어려운 값으로 둡니다.
- `monsters/circle5.ts`부터 `monsters/circle9.ts`까지 일반 몬스터와 보스 스탯은 `lateCircleLock.ts`의 잠금 수치를 사용합니다.
- C5~C6 장비 제작 재료량과 C5~C9 장비 재련 비용도 잠금 수치를 사용합니다.
- `SPAWN_RULE_VERSION`을 올려 기존 세이브의 플레이어 주변 미수정 생성 타일이 현재 규칙으로 재생성되게 합니다.

C5+를 실제 플레이 구간으로 열 때는 `lateCircleLock.ts` 의존을 제거하고, 광물/몬스터/장비/재련 비용을 Circle별 실제 밸런스 값으로 되돌립니다.

## 데이터 추가 절차

새 광물이나 타일을 추가할 때:

1. `src/shared/types/game/core.ts`의 `TileType`과 `TILE_TYPE_TO_ID`를 갱신합니다.
2. `src/shared/config/minerals/*`에 `MineralDefinition`을 추가합니다.
3. 새 파일을 만들었다면 `src/shared/config/mineralData.ts` 집계에 포함합니다.
4. 생성 대상이면 `src/shared/config/circleData.ts`의 `CIRCLES[].minerals`에 연결합니다.
5. 수집, 판매, 도감, 숙련도 대상인지 `collectible`로 명확히 구분합니다.

새 몬스터나 보스를 추가할 때:

1. `src/shared/config/monsters/*`에 `MonsterDefinition`을 추가합니다.
2. 새 파일을 만들었다면 `src/shared/config/monsterData.ts` 집계에 포함합니다.
3. 일반 몬스터는 `CircleConfig.monsters[].monsterId`, 보스는 `CircleConfig.boss.id`에 연결합니다.
4. 드롭 ID와 이미지 키가 실제 보상/렌더링 경로에서 해석 가능한지 확인합니다.

새 장비를 추가할 때:

1. `src/shared/config/equipmentData.ts`의 `EQUIPMENTS`에 장비 ID를 추가합니다.
2. `part`, `circle`, `stats`, `price`, `image`를 기존 장비와 같은 형식으로 맞춥니다.
3. `price`에는 제작 재료만 넣고 `goldCoins`는 넣지 않습니다. 골드는 `equipmentRefinement.ts`의 리롤 비용으로 소비됩니다.
4. 새 Circle 장비를 추가했다면 `equipmentRefinement.ts`의 Circle별 리롤 비용 맵 보정이 필요한지 확인합니다.

새 Effect를 추가할 때:

1. 종류에 맞게 `src/shared/config/effects/essences.ts`, `relics.ts`, `items.ts` 중 하나에 추가합니다.
2. `id`, `nameKo`, `descriptionKo`, `image`, `bonus` 또는 `effectId`를 정의합니다.
3. 제작형이면 `requirements`의 재료 키를 검증합니다.
4. `effectData.ts`가 이미 세 파일을 집계하므로, 새 하위 파일을 만들지 않는 한 별도 집계 변경은 필요 없습니다.

새 mastery perk를 추가할 때:

1. 해당 Circle 파일 또는 `stone.ts`에 `MasteryPerkDef`를 추가합니다.
2. `tileType`이 실제 숙련도 기록 대상과 일치하는지 확인합니다.
3. 새 하위 파일을 만들었다면 `masteryPerks.ts` 집계에 포함합니다.

새 guide quest를 추가할 때:

1. `guideQuestData.ts`의 `C2_GUIDE_QUESTS`에 목표를 추가합니다.
2. 진행도 계산이 필요하면 `getGuideQuestProgress`와 관측 helper를 같이 갱신합니다.
3. 보상 키가 `goldCoins` 또는 인벤토리 적재 가능한 자원인지 확인합니다.

## 다루지 않는 데이터

아래 항목은 2026-05-14 기준 현재 코드에서 삭제되었거나 별도 문서가 더 적합합니다.

| 항목 | 처리 기준 |
|---|---|
| Skill Rune | 삭제된 기능입니다. 문서나 새 데이터 모델에 다시 넣지 않습니다. |
| Research | 삭제된 기능입니다. `PlayerStats`나 progression 문서에 재도입하지 않습니다. |
| Reliquary Essence | 삭제된 구분입니다. Essence 정본은 `src/shared/config/effects/essences.ts`입니다. |
| `combatConstants.ts`, `constants.ts`, `playerConstants.ts` | 데이터 모델보다 런타임 상수/밸런스 문서 범위입니다. |
| `atlasFiles.ts`, `atlasMap.ts` | 자동 생성 파일입니다. 원본 에셋과 생성 스크립트를 기준으로 삼습니다. |
| `public/assets/*` | 생성 산출물입니다. 직접 문서 정본으로 삼지 않습니다. |

## 검증 명령

문서만 바꾼 경우에는 링크와 source path를 먼저 확인합니다.

```bash
test -f docs/GAME_DATA_MODEL.md
rg -n "스킬 룬|스킬룬|문서화 2차|(^|[^A-Z_])DATA_MODEL[.]md" README.md docs/README.md docs/GLOSSARY.md
```

데이터나 타입을 함께 바꾼 경우에는 아래 검증을 추가합니다.

```bash
npx tsc --noEmit
npm run lint
```

에셋 파일을 추가, 삭제, 이름 변경한 경우에는 타입 검증 전에 아틀라스 산출물을 갱신합니다.

```bash
npm run optimize:atlas && npm run update:atlas-map
```
