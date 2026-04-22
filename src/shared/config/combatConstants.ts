/**
 * 전투 및 채굴 대미지 계산에 사용되는 전역 밸런스 상수입니다.
 */
export const COMBAT_CONSTANTS = {
  // 채굴 (공격 속도) 관련
  BASE_MINING_INTERVAL: 350,       // 기본 채굴 대기시간 (ms)
  MAX_ATTACK_SPEED_CAP: 0.95,      // 공격 속도 보너스 최대 상한치 (95%)
  FATIGUE_COOLDOWN_MULTIPLIER: 2.0,// 'FATIGUE'(피로) 상태 이상 시 쿨타임 배율
  
  // 크리티컬 관련
  MAX_CRIT_RATE_CAP: 0.9,          // 크리티컬 확률 최대 상한치 (90%)
  BASE_CRIT_DAMAGE: 1.5,           // 기본 크리티컬 대미지 배율 (150%)
  
  // 대미지 관련
  DEFENSE_EXPONENT: 1.15,          // 최종 대미지 계산 시 적용되는 방어력 관통 지수 공식
  
  // 상태 이상 배율
  BUFF_POWER_MULTIPLIER: 1.5,      // 'BUFF_POWER' 버프 시 위력 배율
  WEAKEN_POWER_MULTIPLIER: 0.7,    // 'WEAKEN' 디버프 시 위력 배율
};
