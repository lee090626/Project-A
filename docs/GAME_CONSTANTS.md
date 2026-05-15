# 게임 상수

---
status: canonical
owner: engineering
last_reviewed: 2026-05-15
source_paths:
  - src/shared/config/combatConstants.ts
  - src/shared/config/constants.ts
  - src/shared/config/lateCircleLock.ts
  - src/shared/config/playerConstants.ts
  - src/features/game/lib/playerCombatStats.ts
  - src/features/game/lib/miningCalculator.ts
  - src/features/game/ecs/systems/statsSyncSystem.ts
  - src/entities/player/model.ts
  - src/features/game/ecs/systems/GameLoop.ts
  - src/shared/lib/saveManager.ts
---

## 목적

이 문서는 런타임 상수와 밸런스 상수의 정본 위치, 사용처, 변경 시 확인해야 할 범위를 설명합니다. `GAME_DATA_MODEL.md`가 "어떤 콘텐츠 데이터가 존재하는가"를 다룬다면, 이 문서는 "런타임 계산이 어떤 기준값을 사용해서 동작하는가"를 다룹니다.

상수값 전체를 복제하는 문서가 목적은 아닙니다. 정확한 값은 항상 `src/shared/config/*Constants.ts`와 `src/shared/config/constants.ts`를 기준으로 확인합니다.

## 정본 파일 지도

| 파일 | 정본 상수 | 책임 |
|---|---|---|
| `src/shared/config/combatConstants.ts` | `COMBAT_CONSTANTS` | 채굴 간격, 공격 속도 상한, 치명타 상한/배율, 방어력 지수, 상태 이상 위력 배율을 정의합니다. |
| `src/shared/config/constants.ts` | `TILE_SIZE`, `CAMERA_SCALE`, `BASE_DEPTH`, `MOVEMENT_DELAY_MS`, 저장/동기화 상수 | 타일 픽셀 단위, 카메라 스케일, 맵 기준 깊이, 이동 입력 간격, 저장 키, UI/공간 해시 동기화 주기를 정의합니다. |
| `src/shared/config/lateCircleLock.ts` | `UNRELEASED_CIRCLE_*` | 아직 밸런싱 전인 Circle 5+를 접근 불가능하게 만드는 임시 광물/몬스터/장비/재련 수치입니다. |
| `src/shared/config/playerConstants.ts` | `BASE_PLAYER_MAX_HP`, `BASE_PLAYER_POWER`, `BASE_PLAYER_MOVE_SPEED` | 새 플레이어와 영구 스탯 재계산의 기본 체력, 채굴 위력, 이동 속도를 정의합니다. |

## 전투와 채굴 상수

`COMBAT_CONSTANTS`는 전투라기보다 현재 코드에서는 주로 채굴 대미지와 채굴 속도 계산의 기준값입니다.

| 상수 | 주요 사용처 | 의미 |
|---|---|---|
| `BASE_MINING_INTERVAL` | `playerCombatStats.ts` | 보너스가 없을 때의 기준 채굴 간격입니다. |
| `MAX_ATTACK_SPEED_CAP` | `playerCombatStats.ts` | Effect, mastery, modifier가 합산된 채굴 속도 보너스의 상한입니다. |
| `FATIGUE_COOLDOWN_MULTIPLIER` | `playerCombatStats.ts` | `FATIGUE` 상태 이상일 때 최종 채굴 간격에 곱하는 배율입니다. |
| `MAX_CRIT_RATE_CAP` | `playerCombatStats.ts` | 최종 치명타 확률 상한입니다. |
| `BASE_CRIT_DAMAGE` | `playerCombatStats.ts` | mastery와 Effect 치명타 피해 보너스를 더하기 전 기본 치명타 피해 배율입니다. |
| `DEFENSE_EXPONENT` | `miningCalculator.ts` | 방어력을 뺀 순수 위력을 최종 대미지로 변환할 때 쓰는 지수입니다. |
| `BUFF_POWER_MULTIPLIER` | `miningCalculator.ts` | `BUFF_POWER` 상태 이상일 때 채굴 위력에 곱하는 배율입니다. |
| `WEAKEN_POWER_MULTIPLIER` | `miningCalculator.ts` | `WEAKEN` 상태 이상일 때 채굴 위력에 곱하는 배율입니다. |

전투/채굴 상수를 조정할 때는 아래 흐름을 같이 확인합니다.

1. `calculateMiningSpeedStats`에서 채굴 간격과 상한 적용을 확인합니다.
2. `calculateCriticalStats`에서 치명타 확률/피해 계산을 확인합니다.
3. `calculateMiningDamage`에서 상태 이상 배율, 방어력 차감, 지수 계산을 확인합니다.
4. 수치 표시가 바뀌면 `widgets/status/useStatusStats.ts`의 상태 패널 표시도 확인합니다.

## 월드, 렌더링, 동기화 상수

`src/shared/config/constants.ts`는 여러 시스템에서 공유하는 런타임 기준값입니다.

| 상수 | 주요 사용처 | 의미 |
|---|---|---|
| `TILE_SIZE` | 렌더러, 물리, 스폰, VFX, spatial query | 논리 타일 좌표를 픽셀 좌표로 변환하는 기준입니다. 변경 범위가 가장 넓습니다. |
| `CAMERA_SCALE` | `renderSystem.ts` | Pixi stage의 기본 카메라 확대 배율입니다. |
| `BASE_DEPTH` | `MapGenerator.ts`, `TileMap.ts`, spawn/physics systems | 지상/베이스 구간과 실제 Circle depth를 보정하는 기준 깊이입니다. |
| `MOVEMENT_DELAY_MS` | `physics/index.ts`, `StatusEffector.ts` | 플레이어 그리드 이동의 기준 입력 간격입니다. |
| `DRILLING_SECRET_KEY` | `saveManager.ts` | 저장 데이터 암호화/복호화 키입니다. 변경하면 기존 저장 데이터 호환성이 깨질 수 있습니다. |
| `UI_SYNC_INTERVAL` | `GameLoop.ts` | 워커에서 UI 상태를 동기화하는 기준 주기입니다. |
| `SPATIAL_HASH_INTERVAL` | `GameLoop.ts` | 공간 해시 업데이트 주기입니다. |

`TILE_SIZE`는 단순 표시값이 아니라 좌표계의 중심 상수입니다. 변경 시 렌더링, 충돌, 스폰, 투사체, VFX, 플로팅 텍스트, spatial hash query가 모두 영향을 받습니다.

`BASE_DEPTH`는 맵 생성과 depth 표시를 잇는 보정값입니다. 변경 시 `CircleConfig.depthStart/depthEnd`, 보스 스폰 깊이, 플레이어 `stats.depth`, 기존 저장 지형 해석을 함께 검토합니다.

## 임시 콘텐츠 잠금 상수

`src/shared/config/lateCircleLock.ts`는 Circle 5 이후 콘텐츠를 실제 밸런싱 전까지 막기 위한 임시 상수입니다.

| 상수 계열 | 사용처 | 의미 |
|---|---|---|
| `UNRELEASED_CIRCLE_MINERAL_*` | C5~C9 광물 데이터 | 배경 포함 C5+ 타일을 채굴 불가능한 수준으로 만듭니다. 체력은 타일 저장 포맷의 16bit HP 상한 때문에 `65535`를 넘기지 않습니다. |
| `UNRELEASED_CIRCLE_MONSTER_*` | C5~C9 일반 몬스터 | C5+ 일반 몬스터 처치를 사실상 막습니다. |
| `UNRELEASED_CIRCLE_BOSS_*` | C5~C9 보스 | C5+ 보스 처치를 사실상 막습니다. |
| `UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT` | C5~C6 장비 제작 재료량 | 미출시 장비 제작을 막습니다. |
| `UNRELEASED_CIRCLE_REROLL_COST` | C5~C9 장비 재련 비용 | 미출시 구간 장비 재련을 막습니다. |

이 상수들은 장기 밸런스 값이 아닙니다. C5+를 플레이 가능한 구간으로 열 때는 이 상수 사용처를 제거하고 각 Circle의 실제 수치를 넣습니다.

## 플레이어 기본 스탯 상수

`src/shared/config/playerConstants.ts`는 플레이어의 기본 영구 스탯을 정의합니다.

| 상수 | 사용처 | 의미 |
|---|---|---|
| `BASE_PLAYER_MAX_HP` | `createInitialPlayer`, `statsSyncSystem`, 상태 패널 | 새 플레이어의 체력과 영구 스탯 재계산의 기본 최대 체력입니다. |
| `BASE_PLAYER_POWER` | `createInitialPlayer`, `statsSyncSystem`, 상태 패널 | 장비, mastery, Effect 보너스를 더하기 전 기본 채굴 위력입니다. |
| `BASE_PLAYER_MOVE_SPEED` | `createInitialPlayer`, `statsSyncSystem`, 상태 패널 | 장비, mastery, Effect 보너스를 더하기 전 기본 이동 속도입니다. |

`statsSyncSystem`은 기본 스탯에 장비, mastery, Effect 보너스를 합산하고, 보상 계산에 사용하는 최종 `PlayerStats.luck`도 동기화합니다. 따라서 기본 스탯이나 luck 보너스를 바꾸면 신규 플레이어뿐 아니라 기존 저장 데이터의 재계산 결과도 바뀔 수 있습니다.

## 현재 주의할 상수

2026-05-14 기준 `rg`로 확인했을 때 아래 export는 `constants.ts` 밖의 직접 사용처가 보이지 않습니다.

| 상수 | 처리 기준 |
|---|---|
| `GAME_LOOP_MS` | 게임 루프 목표 주기 설명으로 남아 있으나 현재 `GameLoop.ts`의 ticker 제어에는 직접 연결되어 있지 않습니다. |
| `PLAYER_ACCELERATION` | 현재 이동 구현은 별도 physics 시스템에서 처리합니다. 사용처 확인 없이 밸런스 기준으로 인용하지 않습니다. |
| `PLAYER_MAX_SPEED` | 현재 이동 구현의 정본 값으로 취급하지 않습니다. |
| `PLAYER_FRICTION` | 현재 이동 구현의 정본 값으로 취급하지 않습니다. |
| `SECRET_KEY` | 현재 저장 암호화 경로는 `DRILLING_SECRET_KEY`를 사용합니다. |
| `SAVE_INTERVAL` | 자동 저장 주기 설명으로 남아 있으나 현재 `GameLoop.ts`의 자동 저장 간격과 직접 연결되어 있지 않습니다. |

이 상수들을 정리하거나 다시 연결하려면 문서만 수정하지 말고 코드 사용처 정리, 타입 검증, 저장/루프 동작 확인을 함께 진행합니다.

## 변경 절차

상수 변경은 데이터 추가보다 위험합니다. 값 하나가 여러 시스템의 좌표계나 저장 호환성에 영향을 줄 수 있기 때문입니다.

전투/채굴 상수를 변경할 때:

1. `rg -n "COMBAT_CONSTANTS|상수명" src`로 모든 사용처를 확인합니다.
2. `playerCombatStats.ts`와 `miningCalculator.ts`에서 계산 순서가 의도와 맞는지 확인합니다.
3. 상태 패널이나 HUD에 표시되는 값이 있으면 UI 문구와 단위도 확인합니다.
4. `npx tsc --noEmit`과 `npm run lint`를 실행합니다.

좌표계/렌더링 상수를 변경할 때:

1. `TILE_SIZE`, `BASE_DEPTH`, `CAMERA_SCALE` 사용처를 `rg`로 확인합니다.
2. 렌더링, 스폰, 물리, 투사체, VFX가 같은 좌표계를 쓰는지 확인합니다.
3. 브라우저에서 실제 플레이 화면을 열어 플레이어 위치, 타일 정렬, 보스 스폰, 투사체 충돌을 확인합니다.

저장 관련 상수를 변경할 때:

1. `saveManager.ts`의 암호화/복호화 경로를 확인합니다.
2. 기존 저장 데이터 호환성 또는 마이그레이션 필요 여부를 판단합니다.
3. 저장 파일이 깨질 수 있는 변경은 `SAVE_AND_MIGRATION.md` 범위로 분리해 문서화합니다.

## 검증 명령

문서만 바꾼 경우:

```bash
test -f docs/GAME_CONSTANTS.md
rg -n "GAME_CONSTANTS.md" README.md docs/README.md
```

상수 코드를 함께 바꾼 경우:

```bash
rg -n "COMBAT_CONSTANTS|TILE_SIZE|BASE_DEPTH|BASE_PLAYER_" src
npx tsc --noEmit
npm run lint
```

브라우저에서 확인해야 하는 변경:

- `TILE_SIZE`
- `CAMERA_SCALE`
- `BASE_DEPTH`
- `MOVEMENT_DELAY_MS`
- `BASE_MINING_INTERVAL`
- `MAX_ATTACK_SPEED_CAP`
