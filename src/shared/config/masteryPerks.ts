import { MasteryPerkDef } from './mastery/types';
import { stoneMasteryPerks } from './mastery/stone';
import { circle2MasteryPerks } from './mastery/circle2';
import { circle3MasteryPerks } from './mastery/circle3';
import { circle4MasteryPerks } from './mastery/circle4';
import { circle5MasteryPerks } from './mastery/circle5';
import { circle6MasteryPerks } from './mastery/circle6';
import { circle7MasteryPerks } from './mastery/circle7';
import { circle8MasteryPerks } from './mastery/circle8';
import { circle9MasteryPerks } from './mastery/circle9';

// 타입 재내보내기 (하위 호환성 유지)
export type { MasteryPerkEffect, MasteryPerkDef } from './mastery/types';

/**
 * 전역 마스터리 특성 데이터베이스입니다.
 * 각 서클별 모듈에서 가져온 데이터를 하나로 통합합니다.
 */
export const MASTERY_PERKS: MasteryPerkDef[] = [
  ...stoneMasteryPerks,
  ...circle2MasteryPerks,
  ...circle3MasteryPerks,
  ...circle4MasteryPerks,
  ...circle5MasteryPerks,
  ...circle6MasteryPerks,
  ...circle7MasteryPerks,
  ...circle8MasteryPerks,
  ...circle9MasteryPerks,
];
