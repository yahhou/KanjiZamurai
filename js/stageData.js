export const DEFAULT_STAGE_SETTINGS = {
  enemyType: "Peasant",
  bossType: "Ninja",
  enemyLevel: null,
};

export const STAGE_CONFIGS = {
  N1: [],
  N2: [],
  N3: [],
  N4: [],
  N5: [
    {
      id: 1,
      name: "numbers",
      files: ["N5_stage1.json"],
      bgKey: "stage_1",
      enemyLevel: 1,
      enemyType: "Peasant",
      bossType: "Tengu",
    },
    {
      id: 2,
      name: "time",
      files: ["N5_stage2.json"],
      bgKey: "stage_2",
      enemyLevel: 2,
      enemyType: "Ninja",
      bossType: "Shougun",
    },
  ],
  N6: [
    {
      id: 99,
      name: "Hiragana",
      files: ["hiragana.json"],
      enemyLevel: 1,
      enemyType: "Peasant",
      bossType: "Ninja",
    },
    {
      id: 100,
      name: "Katakana",
      files: ["katakana.json"],
      enemyLevel: 1,
      enemyType: "Peasant",
      bossType: "Ninja",
    },
  ],
};

export const STORY_STAGE_ORDER = [
  { category: "N5", stageId: 1 },
  { category: "N5", stageId: 2 },
];

export function findStageConfig(category, stageId) {
  const stage = STAGE_CONFIGS[category]?.find((item) => item.id === stageId);
  if (!stage) return null;

  return {
    ...DEFAULT_STAGE_SETTINGS,
    ...stage,
    category,
    stageId: stage.id,
  };
}

export function getStoryStage(index) {
  const entry = STORY_STAGE_ORDER[index];
  if (!entry) return null;

  return findStageConfig(entry.category, entry.stageId);
}
