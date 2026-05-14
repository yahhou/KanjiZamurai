export const DEFAULT_STAGE_SETTINGS = {
  enemyTypes: ["Kappa"],
  bossType: "KappaOyabun",
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
      enemyTypes: ["KoganeKozou"],
      bossType: "KappaOyabun",
    },
    {
      id: 2,
      name: "times of days",
      files: ["N5_stage2.json"],
      bgKey: "stage_2",
      enemyLevel: 2,
      enemyTypes: ["Kappa"],
      bossType: "KappaOyabun",
    },
      {
      id: 3,
      name: "dates & years",
      files: ["N5_stage3.json"],
      bgKey: "stage_3",
      enemyLevel: 3,
      enemyTypes: ["Kappa"],
      bossType: "KappaOyabun",
    },
     {
      id: 4,
      name: "days of the week",
      files: ["N5_stage4.json"],
      bgKey: "stage_4",
      enemyLevel: 4,
      enemyTypes: ["Kappa","OneEyedGoblin"],
      bossType: "KappaOyabun",
    },
     {
      id: 5,
      name: "family",
      files: ["N5_stage5.json"],
      bgKey: "stage_5",
      enemyLevel: 5,
      enemyTypes: ["Kappa","OneEyedGoblin"],
      bossType: "OneEyedGoblinOyabun",
    },
      {
      id: 6,
      name: "people & identity",
      files: ["N5_stage6.json"],
      bgKey: "stage_6",
      enemyLevel: 6,
      enemyTypes: ["Kappa","OneEyedGoblin"],
      bossType: "OneEyedGoblinOyabun",
    },
      {
      id: 7,
      name: "colors",
      files: ["N5_stage7.json"],
      bgKey: "stage_7",
      enemyLevel: 7,
      enemyTypes: ["OneEyedGoblinOyabun","OneEyedGoblin"],
      bossType: "Oogama",
    },
      {
      id: 8,
      name: "nature & seasons",
      files: ["N5_stage8.json"],
      bgKey: "stage_8",
      enemyLevel: 8,
      enemyTypes: ["OneEyedGoblinOyabun","KappaOyabun"],
      bossType: "Oogama",
    },
     {
      id: 9,
      name: "transport",
      files: ["N5_stage9.json"],
      bgKey: "stage_9",
      enemyLevel: 9,
      enemyTypes: ["OneEyedGoblinOyabun","KappaOyabun", "Oogama"],
      bossType: "ObakeKinoko",
    },
     {
      id: 10,
      name: "services & daily life",
      files: ["N5_stage10.json"],
      bgKey: "stage_10",
      enemyLevel: 10,
      enemyTypes: ["Oogama"],
      bossType: "Kakashi",
    },
      {
      id: 11,
      name: "Infrastructure & Commerce",
      files: ["N5_stage11.json"],
      bgKey: "stage_11",
      enemyLevel: 11,
      enemyTypes: ["ObakeKinoko","Oogama"],
      bossType: "Kakashi",
    },
      {
      id: 12,
      name: "Ingredients & Basic Foods",
      files: ["N5_stage12.json"],
      bgKey: "stage_12",
      enemyLevel: 12,
      enemyTypes: ["Genin"],
      bossType: "Genin",
    },
      {
      id: 13,
      name: "Meals & Beverages",
      files: ["N5_stage13.json"],
      bgKey: "stage_13",
      enemyLevel: 13,
      enemyTypes: ["Genin","Oogama"],
      bossType: "Genin",
    },
      {
      id: 14,
      name: "Jobs & Roles",
      files: ["N5_stage14.json"],
      bgKey: "stage_14",
      enemyLevel: 14,
      enemyTypes: ["Genin","Oogama"],
      bossType: "Kamaitachi",
    },
      {
      id: 15,
      name: "Household Items & Appliances",
      files: ["N5_stage15.json"],
      bgKey: "stage_15",
      enemyLevel: 15,
      enemyTypes: ["Genin","Oogama"],
      bossType: "Kamaitachi",
    },
      {
      id: 16,
      name: "House Structure & Rooms",
      files: ["N5_stage16.json"],
      bgKey: "stage_16",
      enemyLevel: 16,
      enemyTypes: ["Genin","Oogama","KappaOyabun","OneEyedGoblinOyabun"],
      bossType: "KoganeKozou",
    },

  ],
};

export const STORY_STAGE_ORDER = [
  { category: "N5", stageId: 1 },
  { category: "N5", stageId: 2 },
  { category: "N5", stageId: 3 },
  { category: "N5", stageId: 4 },
  { category: "N5", stageId: 5 },
  { category: "N5", stageId: 6 },
  { category: "N5", stageId: 7 },
  { category: "N5", stageId: 8 },
  { category: "N5", stageId: 9 },
  { category: "N5", stageId: 10 },
  { category: "N5", stageId: 11 },
  { category: "N5", stageId: 12 },
  { category: "N5", stageId: 13 },
  { category: "N5", stageId: 14 },
  { category: "N5", stageId: 15 },
  { category: "N5", stageId: 16 },
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
