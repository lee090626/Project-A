import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 투사체(Projectile) 렌더링 및 회전 애니메이션을 처리합니다.
 */
export function updateProjectileRenderer(
  idx: number,
  soa: any,
  container: PIXI.Container,
  textures: any,
) {
  const ew = soa.width[idx] || TILE_SIZE;
  const eh = soa.height[idx] || TILE_SIZE;

  container.x = soa.x[idx];
  container.y = soa.y[idx];

  const body = container.getChildByLabel('body') as PIXI.Sprite;
  let procG = container.getChildByLabel('procG') as PIXI.Graphics;
  const hpBar = container.getChildByLabel('hpBar') as PIXI.Graphics;
  const castBar = container.getChildByLabel('castBar') as PIXI.Graphics;

  if (body) {
    // 1. 투사체 관련 UI 요소 강제 숨기기
    if (hpBar) hpBar.visible = false;
    if (castBar) castBar.visible = false;

    // 2. 텍스처 로딩
    const texture = textures['FireBall.png'] || textures['FireBall'];

    if (texture) {
      body.texture = texture;
      body.tint = 0xffffff; // [버그 수정] 초기 빨간색 틴트 제거하여 원본 색상 복구
      body.visible = true;
      if (procG) procG.visible = false;

      // 3. 비율 유지 및 크기 설정
      body.width = ew;
      body.height = eh;

      // 4. 회전 및 앵커 설정 (원본 에셋이 오른쪽 지향이므로 angle 그대로 사용)
      const angle = Math.atan2(soa.vy[idx], soa.vx[idx]);
      body.rotation = angle;
      body.anchor.set(0.5, 0.5);
      body.position.set(0, 0); // [버그 수정] 중복 오프셋(ew/2) 제거하여 중앙 정렬
    } else {
      // 이미지 로딩 실패 시에만 임시 그래픽 노출
      body.visible = false;
      if (!procG) {
        procG = new PIXI.Graphics();
        procG.label = 'procG';
        container.addChild(procG);
      }
      procG.visible = true;
      procG.clear();
      // 중앙(0,0) 기준으로 원형 렌더링
      procG.circle(0, 0, ew / 2).fill({ color: 0xff4400, alpha: 0.5 });
      procG.circle(0, 0, ew / 3).fill({ color: 0xffcc00, alpha: 0.8 });
      procG.circle(0, 0, ew / 5).fill({ color: 0xffffff, alpha: 1.0 });
    }
  }

  if (container.alpha < 1) {
    container.alpha += 0.05;
    if (container.alpha > 1) container.alpha = 1;
  }
}
