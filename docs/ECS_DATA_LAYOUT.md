# 💾 ECS 데이터 레이아웃 (ECS Data Layout)

Drilling RPG는 수천 개의 엔티티를 지연 없이 렌더링하기 위해 데이터를 **연속된 메모리 블록(`Float32Array`)**으로 직렬화하여 전송합니다. 이 문서는 해당 버퍼의 바이너리 레이아웃 명세를 정의합니다.

---

## 1. 버퍼 구조 개요

워커 스레드에서 메인 스레드로 전송되는 각 전송용 버퍼(ArrayBuffer)는 다음과 같이 구성됩니다.

| 오프셋 (Index) | 섹션 | 설명 | 크기 (Float32) |
| :--- | :--- | :--- | :--- |
| `0 ~ 15` | **Header** | 월드 및 플레이어 공통 상태 | 16 |
| `16 ~ N` | **Body** | 엔티티 개별 데이터 (반복) | `ENTITY_STRIDE * Count` |

---

## 2. 헤더 레이아웃 (Header: 16 Slots)

헤더는 카메라 위치, 화면 떨림, 플레이어의 핵심 상태 등 전역적인 정보를 담습니다.

| Index | 필드명 | 설명 |
| :--- | :--- | :--- |
| `0` | `Entity Count` | 현재 버퍼에 포함된 유효 엔티티 수 |
| `1` | `Timestamp` | 워커에서 버퍼를 작성한 시간 (`performance.now()`) |
| `2` | `Camera X` | 월드 카메라의 X 좌표 |
| `3` | `Camera Y` | 월드 카메라의 Y 좌표 |
| `4` | `Shake` | 화면 떨림 강도 (0.0 ~ 1.0) |
| `5` | `Player X` | 플레이어의 실제 X 좌표 (보간용) |
| `6` | `Player Y` | 플레이어의 실제 Y 좌표 (보간용) |
| `7` | `Player HP` | 플레이어의 현재 체력 |
| `8 ~ 15` | `Reserved` | 향후 확장을 위한 예비 슬롯 |

---

## 3. 엔티티 레이아웃 (Body: Stride 8)

각 엔티티는 **8개**의 Float32 슬롯을 점유합니다. (`ENTITY_STRIDE = 8`)

| Relative Index | 필드명 | 설명 |
| :--- | :--- | :--- |
| `+0` | `Entity ID` | 엔티티의 고유 식별자 (정수) |
| `+1` | `Pos X` | 엔티티의 월드 X 좌표 |
| `+2` | `Pos Y` | 엔티티의 월드 Y 좌표 |
| `+3` | `Rotation` | 엔티티의 회전 각도 (Radian) |
| `+4` | `Sprite ID` | 렌더링할 텍스처 아틀라스 내의 Index |
| `+5` | `State` | 엔티티의 현재 상태 (Idle, Walking, Dead 등) |
| `+6` | `Type` | 엔티티 종류 (Player, Monster, Resource, Particle) |
| `+7` | `Animation` | 현재 재생 중인 애니메이션 프레임 번호 |

---

## 4. 데이터 패킹 예시 (TypeScript)

워커 스레드에서 데이터를 기록하는 의사 코드(Pseudo-code)입니다.

```typescript
const view = new Float32Array(buffer);
// 헤더 작성
view[0] = entities.length;
view[1] = performance.now();
// ...
// 엔티티 루프
for (let i = 0; i < entities.length; i++) {
  const offset = 16 + (i * 8);
  view[offset + 0] = entities[i].id;
  view[offset + 1] = entities[i].x;
  // ...
}
```

---

## 5. 최적화 참고 사항

- **Alignment**: `Float32Array`는 4바이트 정렬을 따르므로 통신 오버헤드가 매우 낮습니다.
- **Fixed Size**: 버퍼 크기를 미리 최대 엔티티 수(`MAX_ENTITIES = 5000`)에 맞춰 고정 할당하여 매 프레임 GC(Garbage Collection)가 발생하는 것을 방지합니다.
