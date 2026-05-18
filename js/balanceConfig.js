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
  statScalePerLevel: 0.1,
  expScalePerLevel: 0.12,
  expFlatPerLevel: 7,
  bossLevelBonus: 1,
  bossHpMultiplier: 1.35,
  bossAtkMultiplier: 1.25,
  extraLevelEveryNCorrect: 0,
  minExpReward: 6,
  maxNormalExpReward: 320,
  maxBossExpReward: 650,
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

export const EQUIPMENT_BALANCE = {
  weaponDurabilityByRarity: {
    common: 6,
    uncommon: 7,
    rare: 8,
    legendary: 9,
    mythic: 10,
  },
  haoriDurabilityByRarity: {
    common: 7,
    uncommon: 8,
    rare: 9,
    legendary: 10,
    mythic: 11,
  },
  bandDurabilityByRarity: {
    common: 6,
    uncommon: 7,
    rare: 8,
    legendary: 9,
    mythic: 10,
  },
  beadsDurabilityByRarity: {
    common: 6,
    uncommon: 7,
    rare: 8,
    legendary: 9,
    mythic: 10,
  },
};
