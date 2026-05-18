export const ENEMY_RANKS = {
  1: { hp: 22, statBudget: 14, expReward: 12 },
  2: { hp: 30, statBudget: 22, expReward: 24 },
  3: { hp: 38, statBudget: 30, expReward: 42 },
  4: { hp: 46, statBudget: 38, expReward: 70 },
  5: { hp: 55, statBudget: 46, expReward: 105 },
  6: { hp: 64, statBudget: 54, expReward: 145 },
  7: { hp: 74, statBudget: 62, expReward: 190 },
  8: { hp: 86, statBudget: 72, expReward: 250 },

  // --- ここから追加（ランク9〜20） ---
  9: { hp: 98, statBudget: 82, expReward: 330 },
  10: { hp: 112, statBudget: 94, expReward: 430 },
  11: { hp: 128, statBudget: 106, expReward: 560 },
  12: { hp: 146, statBudget: 120, expReward: 720 },
  13: { hp: 166, statBudget: 136, expReward: 920 },
  14: { hp: 188, statBudget: 154, expReward: 1180 },
  15: { hp: 214, statBudget: 174, expReward: 1500 },
  16: { hp: 244, statBudget: 196, expReward: 1900 },
  17: { hp: 278, statBudget: 220, expReward: 2400 },
  18: { hp: 316, statBudget: 248, expReward: 3000 },
  19: { hp: 360, statBudget: 280, expReward: 3800 },
  20: { hp: 410, statBudget: 316, expReward: 4800 }
};

export const ENEMY_ARCHETYPES = {
  balanced: { atkRatio: 0.55, defRatio: 0.45, hpMultiplier: 1 },
  attacker: { atkRatio: 0.7, defRatio: 0.3, hpMultiplier: 0.92 },
  defender: { atkRatio: 0.4, defRatio: 0.6, hpMultiplier: 1.12 },
  bulky: { atkRatio: 0.48, defRatio: 0.52, hpMultiplier: 1.25 },
  fragile: { atkRatio: 0.72, defRatio: 0.28, hpMultiplier: 0.75 },
  treasure: { atkRatio: 0.2, defRatio: 0.2, hpMultiplier: 0.45, expMultiplier: 2.2 },
};

export const ENEMY_RANK_CONFIGS = {
  Kappa: { rank: 1, archetype: "balanced" },
  OneEyedGoblin: { rank: 1, archetype: "attacker" },
  KappaOyabun: { rank: 2, archetype: "balanced" },
  OneEyedGoblinOyabun: { rank: 2, archetype: "defender" },
  Oogama: { rank: 2, archetype: "balanced" },
  ObakeKinoko: { rank: 2, archetype: "defender" },
  Kakashi: { rank: 3, archetype: "balanced" },
  Genin: { rank: 3, archetype: "attacker" },
  Kamaitachi: { rank: 3, archetype: "fragile" },
  AkaOni: { rank: 4, archetype: "attacker" },
  AoOni: { rank: 4, archetype: "defender" },
  KoganeKozou: { rank: 4, archetype: "treasure" },
  HitotsumeKomori: { rank: 4, archetype: "fragile" },
  NoroiMusha: { rank: 5, archetype: "balanced" },
  OoOni: { rank: 5, archetype: "bulky" },
  Tengu: { rank: 5, archetype: "attacker" },
  Ashigaru: { rank: 6, archetype: "balanced" },
  IwaAtama: { rank: 6, archetype: "defender" },
  Monk: { rank: 6, archetype: "defender" },
  Youko: { rank: 6, archetype: "attacker" },
  OoZaru: { rank: 7, archetype: "bulky" },
  HitokuiBana: { rank: 7, archetype: "attacker" },
  PhantomDeer: { rank: 7, archetype: "balanced" },
  SamuraiTaishou: { rank: 8, archetype: "balanced" },
  ShiroOni: { rank: 8, archetype: "attacker" },
};

export function applyEnemyRankStats(enemy, typeName, forcedRank = null) {
  const config = ENEMY_RANK_CONFIGS[typeName] || {};
  const rank = forcedRank || config.rank || 1;
  const rankStats = ENEMY_RANKS[rank] || ENEMY_RANKS[1];
  const archetype = ENEMY_ARCHETYPES[config.archetype || "balanced"] || ENEMY_ARCHETYPES.balanced;
  const statBudget = Math.max(2, rankStats.statBudget);

  enemy.enemyTypeName = typeName;
  enemy.enemyRank = rank;
  enemy.enemyArchetype = config.archetype || "balanced";
  enemy.maxHp = Math.max(1, Math.floor(rankStats.hp * archetype.hpMultiplier));
  enemy.hp = enemy.maxHp;
  enemy.baseAtk = Math.max(1, Math.floor(statBudget * archetype.atkRatio));
  enemy.baseDef = Math.max(1, statBudget - enemy.baseAtk);
  enemy.mp = 0;
  enemy.mdf = 0;
  enemy.baseMdf = 0;
  enemy.eva = 0;
  enemy.critRate = 10;
  enemy.expReward = 0;
}
