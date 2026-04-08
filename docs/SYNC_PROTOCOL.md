# 📡 통신 규약 (Sync Protocol)

Drilling RPG의 메인 스레드와 워커 스레드는 비동기 메시지 패싱(`postMessage`)을 통해 소통합니다. 이 문서는 주고받는 메시지의 타입과 데이터 형식을 정의합니다.

---

## 1. 메인 -> 워커 (Main to Worker)

메인 스레드에서 엔진을 제어하거나 사용자 입력을 전달할 때 사용합니다.

| 메시지 타입 (`type`) | 페이로드 (`payload`) | 설명 |
| :--- | :--- | :--- |
| **`INIT`** | `{ seed, saveData }` | 엔진 초기화 및 세이브 데이터 로드. |
| **`ASSETS_ATLAS`** | `{ atlasData, layout, entities }` | 텍스처 아틀라스 및 초기 데이터 전송. |
| **`SET_CANVAS`** | `{ offscreen }` | `OffscreenCanvas`의 제어권을 워커로 전송. |
| **`INPUT`** | `{ keys: { [key]: boolean } }` | 사용자 키보드 입력 상태 동기화. |
| **`RESIZE`** | `{ width, height }` | 브라우저 창 크기 변경 알림 및 렌더러 조정. |
| **`ACTION`** | `{ action, data }` | 게임 내 비즈니스 로직 요청 (예: 업그레이드, 구매). |
| **`RETURN_BUFFER`** | `{ buffer }` | 사용이 끝난 `ArrayBuffer`의 소유권을 워커로 반환. |

---

## 2. 워커 -> 메인 (Worker to Main)

워커 스레드에서 처리 결과를 UI에 반영하거나 이벤트를 알릴 때 사용합니다.

| 메시지 타입 (`type`) | 페이로드 (`payload`) | 설명 |
| :--- | :--- | :--- |
| **`ENGINE_READY`** | 없음 | 엔진 및 자원 로딩이 완료되어 시작 가능함을 알림. |
| **`RENDER_SYNC`** | `ArrayBuffer` (Transferable) | 고주파 엔티티 상태 데이터 (트리플 버퍼링). |
| **`SYNC_UI`** | `{ stats }` | 플레이어 골드, 체력 등 저빈도 UI 상태 (스로틀링). |
| **`SAVE`** | `{ version, stats, position, tileMap }` | 주기적인 자동 저장 시점 및 데이터 패킷. |
| **`EXPORT_DATA`** | `{ ...saveData }` | 사용자가 수동으로 내보내기 위한 세이브 코드 생성. |
| **`PORTAL_TRIGGERED`** | `{ nextDim }` | 차원 이동 관문 도달 시 UI 컨펌 유도. |

---

## 3. 액션(Action) 상세 규약

`ACTION` 타입 메시지는 워커 내부의 `handleAction` 함수에서 처리됩니다.

### **예시: 장비 업그레이드**
```json
{
  "type": "ACTION",
  "payload": {
    "action": "upgrade",
    "data": { "type": "power", "requirements": { "goldCoins": 1000 } }
  }
}
```

### **예시: 아이템 판매**
```json
{
  "type": "ACTION",
  "payload": {
    "action": "sell",
    "data": { "resource": "IronIcon.png", "amount": 10, "price": 500 }
  }
}
```

---

## 4. 에러 핸들링 및 재기동

워커 스레드에서 예기치 못한 에러가 발생할 경우, 워커는 이를 가두어(Catch) 메인 스레드 콘솔에 에러 로그를 출력하며, 메인 스레드는 `ENGINE_READY`를 수신하지 못하면 약 5초 후 타임아웃 처리를 통해 로딩 화면을 강제 해제하고 재동작을 시도합니다.
