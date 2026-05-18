export const PLAYER_BALANCE = {
  initialMaxExp: 20,
  maxExpMultiplier: 1.5,
  minHpGainOnLevelUp: 8,
  maxHpGainOnLevelUp: 12,
  statPointsOnLevelUp: 6,
  guaranteedStatGain: 1,
};

export const ENEMY_BALANCE = {
  fallbackPlayerLevelRatio: 0.75,
  hpScalePerLevel: 0.25,
  statScalePerLevel: 0.12,
  expScalePerLevel: 0.06,
  bossLevelBonus: 1,
  bossHpMultiplier: 1.35,
  bossAtkMultiplier: 1.25,
  extraLevelEveryNCorrect: 0,
  minExpReward: 6,
  maxNormalExpReward: 180,
  maxBossExpReward: 300,
};

export const COMBAT_BALANCE = {
  correctAnswerEnemyAttackMultiplier: 0.55,
  wrongAnswerPlayerCounterMultiplier: 0.4,
  streakBonusPerCorrect: 0.04,
  maxStreakMultiplier: 1.5,
};

export const ITEM_BALANCE = {
  regenerationRate: 0.03,
};
