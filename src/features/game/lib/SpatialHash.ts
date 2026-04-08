/**
 * [ECS] 고성능 공간 분할 그리드 (Spatial Hash Grid)
 * - $O(N^2)$ 근접 판정 및 충돌 체크를 $O(N)$으로 최적화합니다.
 */
export class SpatialHash {
  private cellSize: number;
  private grid: Map<number, number[]> = new Map();

  constructor(cellSize: number = 120) { // 기본 2개 타일 크기 (60 * 2)
    this.cellSize = cellSize;
  }

  /** 그리드 완전 초기화 */
  public clear() {
    this.grid.clear();
  }

  /** 엔티티를 그리드에 등록 (AABB 대응) */
  public insert(id: number, x: number, y: number, width: number = 60, height: number = 60) {
    const xStart = Math.floor(x / this.cellSize);
    const yStart = Math.floor(y / this.cellSize);
    const xEnd = Math.floor((x + width) / this.cellSize);
    const yEnd = Math.floor((y + height) / this.cellSize);

    for (let iy = yStart; iy <= yEnd; iy++) {
      for (let ix = xStart; ix <= xEnd; ix++) {
        const key = this.getKey(ix, iy);
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(id);
      }
    }
  }

  /** 특정 좌표 주변의 엔티티 목록 검색 */
  public query(x: number, y: number, radius: number): number[] {
    const result = new Set<number>();
    const xStart = Math.floor((x - radius) / this.cellSize);
    const yStart = Math.floor((y - radius) / this.cellSize);
    const xEnd = Math.floor((x + radius) / this.cellSize);
    const yEnd = Math.floor((y + radius) / this.cellSize);

    for (let iy = yStart; iy <= yEnd; iy++) {
      for (let ix = xStart; ix <= xEnd; ix++) {
        const cell = this.grid.get(this.getKey(ix, iy));
        if (cell) {
          for (const id of cell) {
            result.add(id);
          }
        }
      }
    }
    return Array.from(result);
  }

  /** 그리드 좌표를 고유 키(정수)로 변환 */
  private getKey(ix: number, iy: number): number {
    // 301x1550 맵 범위를 충분히 커버하기 위해 큰 수를 곱함
    return ix * 100000 + iy;
  }
}
