# Survey 시스템과 히든 콘텐츠

---
status: canonical
owner: engineering
last_reviewed: 2026-05-22
source_paths:
  - src/widgets/hud/ui/components/EquipmentInfo.tsx
  - src/widgets/hud/ui/components/WorldInfo.tsx
  - src/widgets/hud/ui/Hud.tsx
  - src/shared/config/playerPosition.ts
  - src/features/game/ecs/systems/physics/PlayerDynamics.ts
  - src/features/game/ecs/systems/storageSystem.ts
  - src/shared/lib/saveManager.ts
  - src/shared/types/game/player.ts
  - src/entities/tile/TileMap.ts
---

## 목적

이 문서는 가로로 확장되는 Drilling RPG 월드에서 플레이어가 위치를 이해하고, 숨겨진 성장 콘텐츠를 발견하고, 발견한 콘텐츠를 다시 이용하는 Survey 시스템의 기준을 정의합니다.

2026-05-22 기준 실제 구현은 HUD의 `Survey X | D` 위치 표시에 한정됩니다. 히든맵, Survey Log, Infinite Tower 런타임은 아직 구현되지 않았으며, 이 문서는 이후 구현의 설계 기준입니다.

## 좌표 언어

플레이어에게 노출하는 위치 언어는 `X + Depth`입니다.

| 표기 | 의미 | 노출 대상 |
|---|---|---|
| `X` | 가로 위치입니다. 가로 무한 탐험, 히든 입구 공유, 좌우 탐색 동기에 사용합니다. | 플레이어 HUD, Survey Log |
| `D` 또는 `Depth` | 지표면 기준 깊이입니다. Circle 진행, 히든 입구 깊이, Waypoint 기준에 사용합니다. | 플레이어 HUD, 콘텐츠 기록 |
| `Y` | 내부 월드 타일 좌표입니다. `BASE_DEPTH + depth` 보정이 들어가므로 기본 HUD에 노출하지 않습니다. | 디버그/저장/엔진 내부 |

현재 HUD는 `src/widgets/hud/ui/components/EquipmentInfo.tsx`에서 `Survey X | D`를 표시합니다. `WorldInfo`는 지역명과 Waypoints 접근만 담당하고, 일반 HUD에서 depth를 중복 표시하지 않습니다.

## Survey 시스템의 역할

Survey 시스템은 단순 좌표 표시가 아니라 히든 콘텐츠 발견과 재방문을 묶는 진행 축입니다.

기본 루프:

```text
일반 채굴/탐험
→ 수상한 지형 또는 힌트 발견
→ 히든 입구 상호작용
→ 콘텐츠 해금 및 Survey Log 기록
→ 콘텐츠 클리어 또는 반복 도전
→ Survey 성장 보상 획득
→ 더 깊고 먼 X/D 구간 탐색
```

Survey 시스템은 아래 책임을 가집니다.

| 책임 | 설명 |
|---|---|
| 위치 표준화 | 플레이어용 좌표를 `X / D`로 통일합니다. |
| 발견 기록 | 한 번 발견한 히든 입구를 저장하고 UI에서 다시 확인할 수 있게 합니다. |
| 재입장 기준 | 발견한 콘텐츠는 Survey Log, Archive, Waypoints 계열 UI에서 다시 접근할 수 있게 합니다. |
| 탐사 성장 | 히든 콘텐츠 발견과 클리어가 Survey Rank, 감지 범위, 힌트 품질 같은 탐사 성장으로 이어집니다. |

## 히든 콘텐츠 모델

히든맵은 별도 성장 콘텐츠의 입구입니다. 단순 보물방보다 “찾으면 새로운 반복 또는 성장 루프가 열린다”는 방향을 우선합니다.

히든 콘텐츠 정의에는 최소한 아래 필드가 필요합니다.

| 필드 | 예시 | 설명 |
|---|---|---|
| `id` | `infinite_tower` | 저장과 콘텐츠 조회에 쓰는 고정 ID입니다. |
| `name` | `Infinite Tower` | UI 표시 이름입니다. |
| `entryPosition` | `{ x: -312, depth: 650 }` | 플레이어에게 노출할 발견 위치입니다. |
| `discoveryState` | `hidden`, `hinted`, `discovered`, `cleared` | 발견 전후 상태입니다. |
| `unlockCondition` | `depth >= 300`, `circle >= 3` | 입구 출현 또는 힌트 노출 조건입니다. |
| `contentType` | `tower`, `forge`, `arena`, `vault` | 콘텐츠 진행 방식입니다. |
| `progress` | `highestFloor`, `rank`, `clearedMilestones` | 콘텐츠 내부 진행도입니다. |

히든 콘텐츠 위치는 seed 기반 생성 또는 고정 룰 기반 생성 중 하나로 정해야 합니다. 어떤 방식을 쓰든 저장에는 “발견 여부와 진행도”를 저장하고, 전체 입구 목록을 대량 저장하지 않는 편이 낫습니다.

## Infinite Tower

`Infinite Tower`는 첫 히든 콘텐츠 후보입니다. 역할은 장기 반복 콘텐츠이며, 히든 입구를 발견한 뒤 별도 층 진행 루프로 진입합니다.

### 발견

- 일반 맵의 특정 `X / D` 근처에 탑 균열 또는 고대 탑 문양을 숨깁니다.
- 발견 메시지는 `Infinite Tower discovered · X -312 / D 650m`처럼 표시합니다.
- 한 번 발견하면 Survey Log에 기록하고, 이후 재입장을 허용합니다.

### 진행 루프

초기 MVP는 진짜 무한 생성보다 10층 단위 반복 구조가 좋습니다.

| 층 | 역할 |
|---:|---|
| 1-4 | 일반 몬스터, 제한된 채굴, 기본 보상 |
| 5 | 엘리트 또는 미니보스 |
| 6-9 | 난이도 상승, 특수 타일 또는 위험 지형 |
| 10 | 보스, 보상방, 기록 저장 |
| 11+ | 같은 구조를 반복하되 수치와 테마를 상승 |

실패하면 바깥으로 복귀하고 최고층 기록은 유지합니다. 중간 보상은 너무 강하게 만들지 말고, 10층 단위 milestone에서 의미 있는 보상을 지급합니다.

### 보상

Tower 보상은 본편 장비 성장과 완전히 겹치지 않는 보조 성장축으로 둡니다.

| 보상 | 역할 |
|---|---|
| `Tower Core` | 타워 전용 성장 재화입니다. |
| `Tower Rank` | 최고층 또는 milestone에 따라 오르는 누적 랭크입니다. |
| `Tower Relic` | 타워에서만 얻는 패시브 또는 유틸리티 보상입니다. |
| 제작식 | 타워 milestone 보상으로 일반 제작에 새 선택지를 줍니다. |
| Survey 보너스 | 히든 입구 감지, 힌트 품질, 재입장 편의성을 강화합니다. |

보상은 채굴력, 생존력, 희귀 광물 확률 같은 본편 스탯을 소폭 보조할 수 있지만, Circle 보스와 장비 제작을 우회하게 만들면 안 됩니다.

## 저장 모델 초안

현재 `PlayerStats`에는 히든 콘텐츠 저장 필드가 없습니다. 구현 시 아래처럼 `PlayerStats` 안에 Survey 전용 상태를 추가하는 방식이 가장 단순합니다.

```ts
interface SurveyProgress {
  rank: number;
  discoveredEntries: Record<string, SurveyEntryState>;
}

interface SurveyEntryState {
  id: string;
  x: number;
  depth: number;
  discoveredAt: number;
  status: 'discovered' | 'cleared';
  progress?: {
    highestFloor?: number;
    milestones?: number[];
  };
}
```

저장 정책:

- 발견한 히든 콘텐츠만 저장합니다.
- 플레이어에게 보여줄 좌표는 `x`와 `depth`를 저장합니다.
- 내부 복귀 위치가 필요하면 `worldY`를 별도 디버그 필드로만 둡니다.
- 기존 저장 마이그레이션은 `survey` 필드가 없으면 기본값을 생성합니다.

## 구현 순서

1. `PlayerStats`에 `survey` 저장 필드를 추가합니다.
2. `saveManager`에 `survey` 기본값과 로드 보정을 추가합니다.
3. seed 기반 `HiddenContentRegistry` 또는 config 파일을 만듭니다.
4. 월드 상호작용 시스템에 히든 입구 entity 또는 tile trigger를 연결합니다.
5. 발견 시 `SHOW_TOAST`와 Survey Log 기록을 추가합니다.
6. `Infinite Tower` 입장 액션과 별도 tower 진행 상태를 추가합니다.
7. Archive 또는 Guide 계열 UI에 발견한 히든 콘텐츠 목록을 표시합니다.

## 비목표

- 초기 구현에서 전체 미니맵을 만들지 않습니다.
- `Y` 좌표를 일반 플레이어 HUD에 노출하지 않습니다.
- 히든 콘텐츠를 무작정 일일/주간 숙제로 만들지 않습니다.
- Tower 보상으로 본편 보스 진행이나 장비 제작 단계를 건너뛰게 만들지 않습니다.
