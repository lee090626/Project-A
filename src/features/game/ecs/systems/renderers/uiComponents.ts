import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';
import { calculateMiningSpeedStats } from '@/features/game/lib/playerCombatStats';

/**
 * 렌더링 메모리 최적화를 위한 정적 스타일 상수
 */
const STYLES = {
  HP_BG_FILL: { color: 0x09090b, alpha: 0.8 },
  HP_BG_STROKE: { color: 0xffffff, alpha: 0.3, width: 1, alignment: 0 as any },
  HP_GREEN: { color: 0x10b981 },
  HP_AMBER: { color: 0xf59e0b },
  HP_ROSE: { color: 0xef4444 },
  CAST_BG: { color: 0x09090b, alpha: 0.6 },
  CAST_FILL: { color: 0xf59e0b },
  CAST_BOSS: { color: 0xef4444 },
  CAST_READY: { color: 0xffffff },
} as const;

/**
 * 하이엔드 캐스팅 바 (Cast Bar) 업데이트
 */
export function updateCastBarFromSoA(
  idx: number,
  soa: any,
  container: PIXI.Container,
  now: number,
) {
  const castBar = container.getChildByLabel('castBar') as PIXI.Graphics;
  if (!castBar) return;

  const entW = soa.width[idx] || TILE_SIZE;
  const isBoss = soa.type[idx] === 2;
  const barY = isBoss ? -40 : 4;

  const attackCooldown = soa.attackCooldown[idx];
  const lastAttack = soa.lastAttackTime[idx];
  const timeSinceLastAttack = lastAttack ? now - lastAttack : attackCooldown;
  
  // 시전 시작 구간 (보스는 1000ms, 일반 몹은 500ms 전부터 노출)
  const castDuration = isBoss ? 1000 : 500;
  const isCasting = timeSinceLastAttack > attackCooldown - castDuration;

  castBar.visible = isCasting;
  if (!isCasting) return;

  const progressFactor = (timeSinceLastAttack - (attackCooldown - castDuration)) / castDuration;
  const ratio = Math.max(0, Math.min(1, progressFactor));

  // 바 디자인 수치
  const barW = isBoss ? entW * 0.8 : TILE_SIZE * 0.7;
  const barH = isBoss ? 8 : 4;
  const barX = (entW - barW) / 2;

  // 임박 시 깜빡임 효과 (마지막 150ms)
  const isReady = timeSinceLastAttack > attackCooldown - 150;
  const fillColor = isReady ? STYLES.CAST_READY : (isBoss ? STYLES.CAST_BOSS : STYLES.CAST_FILL);

  castBar.clear();
  
  // 배경
  castBar
    .roundRect(barX, barY, barW, barH, 2)
    .fill(STYLES.CAST_BG);
  
  // 게이지
  if (ratio > 0) {
    castBar
      .roundRect(barX, barY, barW * ratio, barH, 2)
      .fill(fillColor);
  }
}

/**
 * 플레이어의 드릴 공격 캐스팅 바를 머리 위에 렌더링합니다.
 */
export function updatePlayerCastBar(
  container: PIXI.Container,
  player: any,
  now: number,
) {
  const castBar = container.getChildByLabel('playerCastBar') as PIXI.Graphics;
  if (!castBar) return;

  const shouldShow = player.stats.hp > 0;
  castBar.visible = shouldShow;
  if (!shouldShow) return;

  const { attackInterval } = calculateMiningSpeedStats(player.stats);
  const barW = TILE_SIZE * 0.9;
  const barH = 6;
  const barX = (TILE_SIZE - barW) / 2;
  const barY = -12;

  castBar.clear();
  castBar
    .roundRect(barX, barY, barW, barH, 3)
    .fill(STYLES.CAST_BG)
    .stroke({ color: 0xffffff, alpha: 0.22, width: 1, alignment: 0 });

  if (!player.isDrilling) {
    return;
  }

  const elapsed = player.lastAttackTime
    ? Math.max(0, now - player.lastAttackTime)
    : 0;
  const ratio = Math.max(0, Math.min(1, elapsed / attackInterval));
  const isReady = ratio >= 0.92;
  const fillColor = isReady ? STYLES.CAST_READY : STYLES.CAST_FILL;

  if (ratio > 0) {
    castBar.roundRect(barX, barY, barW * ratio, barH, 3).fill(fillColor);
  }
}

/**
 * 엔티티 HP Bar 업데이트
 */
export function updateHPBarFromSoA(idx: number, soa: any, player: any, container: PIXI.Container) {
  const hpBar = container.getChildByLabel('hpBar') as PIXI.Graphics;
  if (!hpBar) return;

  const ex = soa.x[idx];
  const ey = soa.y[idx];
  const hp = soa.hp[idx];
  const maxHp = soa.maxHp[idx];
  const entW = soa.width[idx] || TILE_SIZE;
  const entH = soa.height[idx] || TILE_SIZE;

  const dx = player.pos.x * TILE_SIZE - ex;
  const dy = player.pos.y * TILE_SIZE - ey;
  const distSq = dx * dx + dy * dy;
  const shouldShowHP = hp < maxHp || distSq < 1638400; // (TILE_SIZE * 8)^2 = 40^2 * 64 = 1600 * 64 = 102400? (TILE_SIZE=128 기준 1024^2=1048576)

  const isBoss = soa.type && soa.type[idx] === 2;
  hpBar.visible = shouldShowHP && !isBoss;
  if (!hpBar.visible) return;

  const barW = entW - 12;
  const barH = 6;
  const barX = 6;
  const barY = entH - barH - 4;
  const currentRatio = Math.max(0, Math.min(1, hp / maxHp));

  hpBar.clear();
  hpBar
    .roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2)
    .fill(STYLES.HP_BG_FILL)
    .stroke(STYLES.HP_BG_STROKE);

  if (currentRatio > 0) {
    let hpColor: { readonly color: number } = STYLES.HP_GREEN;
    if (currentRatio < 0.25) hpColor = STYLES.HP_ROSE;
    else if (currentRatio < 0.5) hpColor = STYLES.HP_AMBER;

    hpBar.roundRect(barX, barY, barW * currentRatio, barH, 1).fill(hpColor);
  }
}
