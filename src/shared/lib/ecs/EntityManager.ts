/**
 * [ECS] Entity SoA (Structure of Arrays) 데이터 구조
 * - 객체 배열 대신 타입별 배열을 사용하여 CPU 캐시 효율을 극대화하고 GC 부하를 제거합니다.
 */
export interface EntitySoA {
  capacity: number;
  count: number;

  // 고유 식별 및 유효성 검사 (Handle: Generation << 16 | Index)
  generation: Uint16Array;
  /** 스왑 시에도 유지되는 엔티티 고유 인스턴스 ID (타이머/패턴 키로 활용) */
  instanceId: Uint32Array;


  // 기본 정보
  type: Uint8Array; // 0: none, 1: monster, 2: boss, 3: npc, 4: object, 5: projectile
  state: Uint8Array; // 0: idle, 1: chase, 2: attack

  // 물리 데이터 (World 좌표)
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  /** 스폰 시점의 초기 X 좌표 (리싱/복귀 기준점) */
  originX: Float32Array;
  /** 스폰 시점의 초기 Y 좌표 (리싱/복귀 기준점) */
  originY: Float32Array;

  // 전투 및 스탯
  hp: Float32Array;
  maxHp: Float32Array;
  attack: Float32Array;
  speed: Float32Array;
  lastAttackTime: Float32Array;
  /** 개별 공격 쿨타임 (ms). 모스터 정의에서 초기화. */
  attackCooldown: Float32Array;
  /** 인식 사거리 (타일 단위). 플레이어가 이 범위 안에 들어오면 AI가 활성화됨. */
  aggroRange: Float32Array;

  // 시각 데이터 및 히트박스
  monsterDefIndex: Uint16Array;
  spriteIndex: Uint16Array;
  width: Float32Array;
  height: Float32Array;

  // 생명주기 및 시간 데이터
  createdAt: Float64Array; // 생성 시간 (performance.now)
  /** 엔티티 수명 (ms). 투사체 소멸 기준 등으로 활용. */
  lifespan: Float32Array;


  // Sync optimization
  dirtyFlags: Uint8Array; // 0: clean, 1: dirty
}

/**
 * 엔티티를 안전하게 참조하기 위한 핸들 타입
 * - 상위 16비트: Generation
 * - 하위 16비트: Index
 */
export type EntityHandle = number;

export class EntityManager {
  public soa: EntitySoA;
  private idMap: Map<string, EntityHandle> = new Map();
  private nextInstanceId: number = 1;

  /** 자동화를 위한 컴포넌트 배열 레지스트리 (instanceId, generation 제외) */
  /** 자동화를 위한 컴포넌트 배열 레지스트리 (instanceId, generation 제외) */
  private componentArrays: (Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array)[];

  constructor(capacity: number = 5000) {
    this.soa = {
      capacity,
      count: 0,
      generation: new Uint16Array(capacity),
      instanceId: new Uint32Array(capacity),
      type: new Uint8Array(capacity),
      state: new Uint8Array(capacity),
      x: new Float32Array(capacity),
      y: new Float32Array(capacity),
      vx: new Float32Array(capacity),
      vy: new Float32Array(capacity),
      hp: new Float32Array(capacity),
      maxHp: new Float32Array(capacity),
      attack: new Float32Array(capacity),
      speed: new Float32Array(capacity),
      lastAttackTime: new Float32Array(capacity),
      attackCooldown: new Float32Array(capacity).fill(1000),
      aggroRange: new Float32Array(capacity).fill(8),
      monsterDefIndex: new Uint16Array(capacity),
      spriteIndex: new Uint16Array(capacity),
      width: new Float32Array(capacity),
      height: new Float32Array(capacity),
      originX: new Float32Array(capacity),
      originY: new Float32Array(capacity),
      createdAt: new Float64Array(capacity),
      lifespan: new Float32Array(capacity).fill(5000), // 기본 5초
      dirtyFlags: new Uint8Array(capacity),
    };

    // 자동 관리를 위한 컴포넌트 리스트 등록
    this.componentArrays = [
      this.soa.instanceId,
      this.soa.type,
      this.soa.state,
      this.soa.x,
      this.soa.y,
      this.soa.vx,
      this.soa.vy,
      this.soa.hp,
      this.soa.maxHp,
      this.soa.attack,
      this.soa.speed,
      this.soa.lastAttackTime,
      this.soa.attackCooldown,
      this.soa.aggroRange,
      this.soa.monsterDefIndex,
      this.soa.spriteIndex,
      this.soa.width,
      this.soa.height,
      this.soa.originX,
      this.soa.originY,
      this.soa.createdAt,
      this.soa.lifespan,
      this.soa.dirtyFlags,
    ];
  }

  /** 새로운 엔티티 생성 ($O(1)$) */
  public create(
    type: number,
    x: number,
    y: number,
    id?: string,
    defIndex: number = 0,
  ): EntityHandle {
    if (this.soa.count >= this.soa.capacity) {
      console.warn('[EntityManager] Capacity reached!');
      return -1;
    }

    const index = this.soa.count++;
    const handle = (this.soa.generation[index] << 16) | index;

    // ID 매핑 등록
    if (id) {
      this.idMap.set(id, handle);
    }

    this.soa.instanceId[index] = this.nextInstanceId++;


    // 기본값 초기화
    this.soa.type[index] = type;
    this.soa.monsterDefIndex[index] = defIndex;
    this.soa.x[index] = x;
    this.soa.y[index] = y;
    this.soa.vx[index] = 0;
    this.soa.vy[index] = 0;
    this.soa.state[index] = 0; // Idle
    this.soa.createdAt[index] = performance.now();
    this.soa.lifespan[index] = 5000; // 기본 수명 5초
    this.soa.dirtyFlags[index] = 1; // Mark as dirty on creation

    return handle;
  }

  /**
   * 엔티티 삭제 ($O(1)$ - Swap-and-Pop)
   * - 삭제할 위치에 마지막 원소를 덮어씌워 배열의 연속성을 유지합니다.
   * - 세대(Generation)를 증가시켜 기존 핸들을 무효화합니다.
   */
  public destroy(index: number) {
    if (index < 0 || index >= this.soa.count) return;

    // 세대 증가 (기존 핸들 무효화)
    this.soa.generation[index]++;

    const lastIndex = --this.soa.count;
    if (index !== lastIndex) {
      // 레지스트리에 등록된 모든 컴포넌트 배열에 대해 Swap-and-Pop 수행
      for (let i = 0; i < this.componentArrays.length; i++) {
        const arr = this.componentArrays[i];
        arr[index] = arr[lastIndex];
      }

      // Generation 정보도 함께 Swap (인덱스 연속성 유지)
      this.soa.generation[index] = this.soa.generation[lastIndex];
      this.soa.dirtyFlags[index] = 1; // Mark as dirty when swapped
    }
  }

  /** Dirty flag 관리 */
  public markDirty(index: number) {
    if (index >= 0 && index < this.soa.count) {
      this.soa.dirtyFlags[index] = 1;
    }
  }

  public clearDirty(index: number) {
    if (index >= 0 && index < this.soa.count) {
      this.soa.dirtyFlags[index] = 0;
    }
  }

  public isDirty(index: number): boolean {
    return index >= 0 && index < this.soa.count && this.soa.dirtyFlags[index] === 1;
  }

  /** 특정 ID를 가진 엔티티가 활성화되어 있는지 확인 */
  public hasId(id: string): boolean {
    const handle = this.idMap.get(id);
    return handle !== undefined && this.isValid(handle);
  }

  /** 핸들이 유효한지 검사 */
  public isValid(handle: EntityHandle): boolean {
    const index = handle & 0xffff;
    const gen = handle >> 16;
    return index < this.soa.count && this.soa.generation[index] === gen;
  }

  /** 핸들로부터 현재 인덱스 획득 */
  public getIndex(handle: EntityHandle): number {
    return handle & 0xffff;
  }

  /** 모든 엔티티 데이터 초기화 (차원 이동 시) */
  public clear() {
    this.nextInstanceId = 1;
    this.soa.count = 0;
    this.soa.generation.fill(0);

    // 레지스트리에 등록된 모든 컴포넌트 배열 초기화
    for (let i = 0; i < this.componentArrays.length; i++) {
      const arr = this.componentArrays[i];
      // 기본값이 필요한 경우(예: attackCooldown)는 개별 처리하거나 레지스트리 메타데이터 도입 고려 가능
      // 여기서는 일단 0으로 초기화하고 특수값은 재직렬화 시 채워지는 것을 전제로 함
      arr.fill(0);
    }

    this.idMap.clear();
  }
}
