import { assets } from "./assets.js";
import { battleManager } from "./battleManager.js";
import { quizManager } from "./quizManager.js";
import { itemManager } from "./itemManager.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";
import { STAGE_CONFIGS, STORY_STAGE_ORDER, getStoryStage } from "./stageData.js";

const INITIAL_LOAD_MS = 2000;

/////////////////////////////
//    セーブデータの保持
/////////////////////////////
const storyStorage = {
  SAVE_KEY: "rpg_game_story_progress",
  saveProgress(data) {
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
  },
  loadProgress() {
    const saved = localStorage.getItem(this.SAVE_KEY);
    return saved ? JSON.parse(saved) : { currentStageIndex: 0, playerStatus: null, stageRanks: {}, practiceBonuses: {} };
  },
  getStageKey(category, stageId) {
    return `${category}:${stageId}`;
  },
  saveStageRank(category, stageId, rank) {
    const progress = this.loadProgress();
    const key = this.getStageKey(category, stageId);
    const order = { S: 4, A: 3, B: 2, C: 1 };
    const currentRank = progress.stageRanks?.[key];
    if (currentRank && order[currentRank] >= order[rank]) return;

    progress.stageRanks = { ...(progress.stageRanks || {}), [key]: rank };
    this.saveProgress(progress);
  },
  getStageRank(category, stageId) {
    const progress = this.loadProgress();
    return progress.stageRanks?.[this.getStageKey(category, stageId)] || "-";
  },
  addPracticeBonusToStoryStatus(category, stageId, bonus) {
    const progress = this.loadProgress();
    const key = this.getStageKey(category, stageId);
    if (progress.practiceBonuses?.[key]) return false;

    const status = progress.playerStatus || {};
    progress.playerStatus = {
      ...status,
      maxHp: (status.maxHp || 25) + bonus.hp,
      hp: (status.maxHp || 25) + bonus.hp,
      baseAtk: (status.baseAtk || 10) + bonus.atk,
      baseDef: (status.baseDef || 5) + bonus.def,
      //baseMdf: (status.baseMdf || 5) + bonus.mdf,
    };
    progress.practiceBonuses = { ...(progress.practiceBonuses || {}), [key]: true };
    this.saveProgress(progress);
    return true;
  }
};

function getRankClass(rank) {
  const value = String(rank || "-").toUpperCase();
  if (value === "-") return "";
  return `stage-rank-${value}`;
}

function getBattleRankClass(rank) {
  const value = String(rank || "").toUpperCase();
  return ["S", "A", "B", "C"].includes(value) ? `rank-${value}` : "";
}

function getPracticeVisibleStages(category, stages) {
  const progress = storyStorage.loadProgress();
  return stages.filter((stage) => {
    const rank = progress.stageRanks?.[storyStorage.getStageKey(category, stage.id)];
    return rank && rank !== "-";
  });
}

function rankScore(rank) {
  const map = { S: 4, A: 3, B: 2, C: 1 };
  return map[String(rank || "").toUpperCase()] || 0;
}

function getOverallRankFromProgress(progress) {
  const ranks = Object.values(progress?.stageRanks || {})
    .map((rank) => String(rank || "").toUpperCase())
    .filter((rank) => ["S", "A", "B", "C"].includes(rank));

  if (!ranks.length) return "C";

  const average = ranks.reduce((sum, rank) => sum + rankScore(rank), 0) / ranks.length;
  if (average >= 3.5) return "S";
  if (average >= 2.75) return "A";
  if (average >= 2.0) return "B";
  return "C";
}

function getRankGrowth(rank) {
  const growthTable = {
    S: { hp: 16, stats: 9 },
    A: { hp: 13, stats: 7 },
    B: { hp: 10, stats: 5 },
    C: { hp: 7, stats: 3 },
  };
  return growthTable[String(rank || "C").toUpperCase()] || growthTable.C;
}

function getRankStatGrowth(rank) {
  const growth = getRankGrowth(rank);
  const stats = { atk: 0, def: 0, mdf: 0 };
  const keys = ["atk", "def", "mdf"];

  for (let i = 0; i < growth.stats; i++) {
    const key = keys[i % keys.length];
    stats[key] += 1;
  }

  return stats;
}

function getStageBonusPreview(status, bonus) {
  const current = {
    maxHp: status?.maxHp || 25,
    hp: status?.hp || status?.maxHp || 25,
    baseAtk: status?.baseAtk || 10,
    baseDef: status?.baseDef || 5,
    //baseMdf: status?.baseMdf || 5,
  };

  return {
    before: current,
    after: {
      maxHp: current.maxHp + bonus.hp,
      hp: current.maxHp + bonus.hp,
      baseAtk: current.baseAtk + bonus.atk,
      baseDef: current.baseDef + bonus.def,
      //baseMdf: current.baseMdf + (bonus.mdf || 0),
    },
  };
}

function stageWordUrl(category, fileName) {
  return new URL(`../assets/words/${category}/${fileName}`, import.meta.url);
}

function getStageIntroText(stageConfig) {
  if (!stageConfig) return "";

  const stageNumber = stageConfig.stageId || stageConfig.id;
  const stageName = stageConfig.name || "";

  if (stageNumber && stageName) return `Stage ${stageNumber} ${stageName}`;
  if (stageName) return stageName;
  if (stageNumber) return `Stage ${stageNumber}`;
  return "";
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEquipmentEffect(item) {
  if (!item) return "";

  const text = String(item.description || "").trim();
  if (!text) return "";

  return text
    .replace(/^Atk\b/i, "ATK")
    .replace(/^Def\b/i, "DEF")
    .replace(/^Eva\b/i, "EVA")
    .replace(/^CRT\b/i, "CRT");
}

export const gameManager = {
  // --- プロパティ ---
  currentConfig: null,
  isStoryMode: false,
  currentStageIndex: 0,
  isLoaded: false,
  loadingInterval: null,
  
  startBtnSE: new Audio("assets/sounds/StartButton.mp3"),
  gameOverSE: new Audio("assets/sounds/gameOver.mp3"),
  itemBonusSE: new Audio("assets/sounds/itemBonus.mp3"),

  

  storyStages: STORY_STAGE_ORDER,
  stageConfigs: STAGE_CONFIGS,

  // --- 初期化 ---
  init() {
    this.startLoadingAnimation();
    quizManager.onCorrect = () => battleManager.resolveCorrectAnswerTurn();
    quizManager.onWrong = () => battleManager.resolveWrongAnswerTurn();
    this.bindBattleControls();

    if (!this.isLoaded) {
      assets.loadAssets();
      setTimeout(() => {
        this.isLoaded = true;
        this.stopLoadingAnimation();
        this.showStartScreen();
      }, INITIAL_LOAD_MS);
    } else {
      this.stopLoadingAnimation();
      this.showStartScreen();
    }

    document.addEventListener("click", () => {
      const bgm = assets.sounds.bgm_Battle;
      if (bgm && bgm.paused) {
        bgm.play().then(() => { bgm.pause(); bgm.currentTime = 0; }).catch(() => {});
      }
    }, { once: true });
  },

  bindBattleControls() {
    const homeBtn = document.getElementById("battleHomeBtn");
    if (homeBtn) homeBtn.onclick = () => this.showQuitConfirm();

    const statsBtn = document.getElementById("battleStatsBtn");
    if (statsBtn) statsBtn.onclick = () => this.toggleBattleStatsPanel();
  },

  buildCharacterStatsRows(character, options = {}) {
    if (!character) {
      return `<div class="battle-stats-empty">No character</div>`;
    }

    const rows = [
      ["Lv", character.level ?? "-"],
      ...(character.battleGrade ? [["Rank", character.battleGrade]] : []),
      ...(character.enemyRank ? [["Rank", character.enemyRank]] : []),
      ["HP", `${Math.ceil(character.hp ?? 0)} / ${character.maxHp ?? 0}`],
      ["ATK", character.atk ?? "-"],
      ["DEF", character.def ?? "-"],
     // ["MDF", character.mdf ?? "-"],
      ["EVA", `${character.eva ?? 0}%`],
      ["CRT", `${character.critRate ?? 0}%`],
    ];

    //if (options.showExp) {
      //rows.push(["EXP", `${character.exp ?? 0} / ${character.maxExp ?? 0}`]);
    //}

    if (options.showExpReward) {
      rows.push(["Reward", character.expReward ?? "-"]);
    }

    return rows
      .map(([label, value]) => `
        <div class="battle-stats-row">
          <span>${escapeHtml(label)}</span>
          <strong class="battle-stats-value">${escapeHtml(value)}</strong>
        </div>
      `)
      .join("");
  },

  getPlayerEquipmentSummary(player) {
    if (!player) return "";

    const equipmentRows = [];
    const equipmentDefs = [
      ["weapon", "Weapon", player.weaponRarity, "isWeapon", player.weaponDurability, player.weaponMaxDurability],
      ["haori", "Haori", player.haoriRarity, "isHaori", player.haoriDurability, player.haoriMaxDurability],
      ["band", "Band", player.bandRarity, "isBand", player.bandDurability, player.bandMaxDurability],
      ["beads", "Beads", player.beadsRarity, "isBeads", player.beadsDurability, player.beadsMaxDurability],
    ];

    for (const [slot, label, rarity, typeKey, durability, maxDurability] of equipmentDefs) {
      if (!rarity) continue;

      const item = itemManager.items.find((candidate) => candidate[typeKey] && candidate.rarity === rarity) || null;
      const effect = formatEquipmentEffect(item);
      const durabilityText = Number.isFinite(durability) && Number.isFinite(maxDurability)
        ? ` <span class="battle-stats-durability">(${Math.max(0, durability)}/${Math.max(0, maxDurability)})</span>`
        : "";

      equipmentRows.push(`
        <p class="battle-stats-equipment-line">
          <span class="battle-stats-equipment-label">${escapeHtml(label)}</span>
          <span class="battle-stats-equipment-name">${escapeHtml(item?.name || rarity)}</span>
          ${effect ? `<span class="battle-stats-equipment-effect">: ${escapeHtml(effect)}</span>` : ""}
          ${durabilityText}
        </p>
      `);
    }

    const extraRows = [
      player.isRegenerating ? `<p class="battle-stats-note-row">Regen: active</p>` : "",
      player.hasStreakBonus ? `<p class="battle-stats-note-row">Streak: x${player.streakMultiplier.toFixed(2)}</p>` : "",
    ].filter(Boolean);

    if (!equipmentRows.length && !extraRows.length) {
      return `<div class="battle-stats-note">No active equipment bonuses</div>`;
    }

    return `
      <div class="battle-stats-equipment-list">
        ${equipmentRows.join("")}
        ${extraRows.join("")}
      </div>
    `;
  },

  renderBattleStatsPanel() {
    const panel = document.getElementById("battleStatsPanel");
    if (!panel) return;

    const player = battleManager.player;
    const enemy = battleManager.enemy;
    const playerName = player?.name || "Player";
    const enemyName = enemy?.name || enemy?.constructor?.name || "Enemy";

    panel.innerHTML = `
      <div class="battle-stats-dialog" role="dialog" aria-modal="false" aria-labelledby="battleStatsTitle">
        <div class="battle-stats-header">
          <h2 id="battleStatsTitle">Battle Stats</h2>
          <button type="button" id="battleStatsCloseBtn" class="battle-stats-close" aria-label="Close stats">Close</button>
        </div>
        <div class="battle-stats-grid">
          <section class="battle-stats-card ${getBattleRankClass(player?.battleGrade)}">
            <h3>${escapeHtml(playerName)}</h3>
            ${this.buildCharacterStatsRows(player, { showExp: true })}
            ${this.getPlayerEquipmentSummary(player)}
          </section>
          <section class="battle-stats-card ${getBattleRankClass(enemy?.battleGrade || enemy?.enemyRank)}">
            <h3>${escapeHtml(enemyName)}</h3>
            ${this.buildCharacterStatsRows(enemy, { showExpReward: true })}
          </section>
        </div>
      </div>
    `;

    document.getElementById("battleStatsCloseBtn")?.addEventListener("click", () => this.hideBattleStatsPanel());
  },

  showBattleStatsPanel() {
    const panel = document.getElementById("battleStatsPanel");
    if (!panel) return;

    this.renderBattleStatsPanel();
    panel.style.display = "block";
    panel.setAttribute("aria-hidden", "false");
    panel.onclick = (event) => {
      if (event.target === panel) this.hideBattleStatsPanel();
    };
  },

  hideBattleStatsPanel() {
    const panel = document.getElementById("battleStatsPanel");
    if (!panel) return;

    panel.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = "";
    panel.onclick = null;
  },

  toggleBattleStatsPanel() {
    const panel = document.getElementById("battleStatsPanel");
    if (!panel || panel.style.display === "none" || !panel.style.display) {
      this.showBattleStatsPanel();
    } else {
      this.hideBattleStatsPanel();
    }
  },

  showQuitConfirm() {
    const modal = document.getElementById("quitConfirmModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="quit-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="quitConfirmTitle">
        <h2 id="quitConfirmTitle">Return to Title?</h2>
        <p>Your current battle progress will be lost.</p>
        <div class="quit-confirm-actions">
          <button type="button" class="quit-confirm-btn cancel" id="quitCancelBtn">Cancel</button>
          <button type="button" class="quit-confirm-btn confirm" id="quitConfirmBtn">Return</button>
        </div>
      </div>
    `;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("quitCancelBtn")?.addEventListener("click", () => this.hideQuitConfirm());
    document.getElementById("quitConfirmBtn")?.addEventListener("click", () => this.returnToTitle());
  },

  hideQuitConfirm() {
    const modal = document.getElementById("quitConfirmModal");
    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = "";
  },

  stopBattleSounds() {
    const sounds = [assets.sounds.bgm_Battle];
    sounds.forEach((sound) => {
      if (!sound) return;
      sound.pause();
      sound.currentTime = 0;
    });
  },

  returnToTitle() {
    this.hideQuitConfirm();
    this.hideBattleStatsPanel();
    this.stopBattleSounds();
    battleManager.clearCharacters();
    quizManager.reset();
    this.hideSkillPanel();
    this.clearBattleResult();

    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "none";

    document.getElementById("stageIntro")?.remove();
    document.getElementById("quizArea").innerHTML = "";
    this.showStartScreen();
  },

  showBattleResult(html) {
    const battle = document.getElementById("battleScreen");
    if (!battle) return null;

    this.clearBattleResult();

    const overlay = document.createElement("div");
    overlay.id = "battleResultOverlay";
    overlay.className = "battle-result-overlay";
    overlay.innerHTML = html;
    battle.appendChild(overlay);
    return overlay;
  },

  clearBattleResult() {
    document.getElementById("battleResultOverlay")?.remove();
    this.hideBattleStatsPanel();
  },

  // --- 画面表示系 ---
  showStartScreen() {
    const container = document.getElementById("uiWrapper");
    if (!container) return;
    container.style.display = "flex";
    container.style.backgroundColor = "transparent";
    container.style.opacity = "1";
    
    container.innerHTML = `
      <div class="menu-container">
        <!-- 背景画像 -->
        <img src="assets/images/Kiwami_title.png" alt="Background">
        
        <!-- ボタン群（画像の上に重なる） -->
        <div class="button-overlay">
          <button type="button" class="main-menu-btn story" id="storyBtn">Trials</button>
          <button type="button" class="main-menu-btn practice" id="practiceBtn">Training</button>
        </div>

        <a
          class="donate-link"
          href="https://buy.stripe.com/4gM8wJ2xv7WD5e45QkgUM00"
          target="_blank"
          rel="noreferrer noopener"
        >
          Donate to support Kiwami Samurai! 🙏
        </a>
      </div>
    `;

    // ...イベントリスナーはそのまま...
    document.getElementById("storyBtn").addEventListener("click", () => {
      this.playStartBtnSE();
      this.startStoryMode();
    });

    document.getElementById("practiceBtn").addEventListener("click", () => {
      this.playStartBtnSE();
      this.isStoryMode = false;
      this.showCategoryMenu();
    });
  },

  // --- ストーリーモード制御 ---
  startStoryMode() {
    this.isStoryMode = true;
    const progress = storyStorage.loadProgress();
    this.currentStageIndex = progress.currentStageIndex || 0;
    this.launchStoryStage();
  },

  launchStoryStage() {
    const stageInfo = getStoryStage(this.currentStageIndex);

    // クイズの進捗とモードをリセット
    quizManager.reset();
    quizManager.quizMode = "normal";

    if (!stageInfo) {
      return this.showNextStageInDevelopment();
    }

    this.currentConfig = stageInfo;
    this.loadSelectedStageData(stageInfo.category, stageInfo.files);
  },

  nextStage() {
    this.currentStageIndex++;
    
    // ★ここを確実に！
    const currentPlayerStatus = battleManager.getCurrentPlayerStatus();
    const existingProgress = storyStorage.loadProgress();
    const saveData = {
      ...existingProgress,
      currentStageIndex: this.currentStageIndex,
      playerStatus: currentPlayerStatus, // currentPlayerStatus を使う
      lastUpdated: new Date().getTime()
    };
    
    storyStorage.saveProgress(saveData);
    this.launchStoryStage();
  },

  calculateStageRank() {
    const total = Math.max(1, quizManager.totalAnswerCount || 0);
    const accuracy = quizManager.correctAnswerCount / total;
    if (accuracy >= 0.95) return { rank: "S", accuracy };
    if (accuracy >= 0.85) return { rank: "A", accuracy };
    if (accuracy >= 0.7) return { rank: "B", accuracy };
    return { rank: "C", accuracy };
  },

  getOverallStoryRank() {
    return getOverallRankFromProgress(storyStorage.loadProgress());
  },

  applyOverallStoryRankToPlayer() {
    const player = battleManager.player;
    if (!player) return "C";

    const rank = this.getOverallStoryRank();
    player.battleGrade = rank;
    player.refreshStats();
    return rank;
  },

  showStageClearRankResult() {
    const result = this.calculateStageRank();
    const rank = result.rank;
    const player = battleManager.player;
    const stage = this.currentConfig;
    const growth = this.isStoryMode && player ? player.applyStageRankGrowth(rank) : null;
    const rankGrowth = getRankGrowth(rank);

    if (this.isStoryMode && stage?.category && stage?.stageId) {
      storyStorage.saveStageRank(stage.category, stage.stageId, rank);
    }
    if (!this.isStoryMode && stage?.category && stage?.stageId) {
      storyStorage.saveStageRank(stage.category, stage.stageId, rank);
    }

    this.applyOverallStoryRankToPlayer();

    let practiceBonusText = "";
    if (!this.isStoryMode && rank === "S") {
      const statGrowth = getRankStatGrowth(rank);
      const bonus = {
        hp: rankGrowth.hp,
        atk: statGrowth.atk,
        def: statGrowth.def,
        //mdf: statGrowth.mdf,
      };
      const applied = stage?.category && stage?.stageId
        ? storyStorage.addPracticeBonusToStoryStatus(stage.category, stage.stageId, bonus)
        : false;
      if (applied) {
        const progress = storyStorage.loadProgress();
        const preview = getStageBonusPreview(progress.playerStatus, bonus);
        practiceBonusText = `
          <div class="practice-bonus-preview">
            <p class="practice-bonus-title">Story stats updated</p>
            <div class="rank-growth-list rank-S">
              <div class="growth-row">
                <span class="growth-label">HP</span>
                <span class="growth-before">${preview.before.maxHp}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${preview.after.maxHp}</span>
              </div>
              <div class="growth-row">
                <span class="growth-label">ATK</span>
                <span class="growth-before">${preview.before.baseAtk}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${preview.after.baseAtk}</span>
              </div>
              <div class="growth-row">
                <span class="growth-label">DEF</span>
                <span class="growth-before">${preview.before.baseDef}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${preview.after.baseDef}</span>
              </div>
            </div>
          </div>
        `;
      }
    }

    const nextButton = this.isStoryMode
      ? `<button type="button" id="nextStageBtn" class="retry-btn">Next Stage</button>`
      : `<button type="button" id="retryBtn" class="retry-btn">Back to menu</button>`;

    this.showBattleResult(`
      <div class="announcement-area">
        <div class="victory-message-area">
          <h2>Stage Clear!</h2>
          <p class="${getRankClass(rank)}">Rank ${rank} / ${Math.round(result.accuracy * 100)}%</p>
          ${growth ? `
            <div class="rank-growth-list rank-${rank}">
              <div class="growth-row">
                <span class="growth-label">Lv</span>
                <span class="growth-before">${growth.before.level}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${growth.after.level}</span>
              </div>
              <div class="growth-row">
                <span class="growth-label">HP</span>
                <span class="growth-before">${growth.before.hp}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${growth.after.hp}</span>
              </div>
              <div class="growth-row">
                <span class="growth-label">ATK</span>
                <span class="growth-before">${growth.before.atk}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${growth.after.atk}</span>
              </div>
              <div class="growth-row">
                <span class="growth-label">DEF</span>
                <span class="growth-before">${growth.before.def}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${growth.after.def}</span>
              </div>
              <div class="growth-row">
                <span class="growth-label">MDF</span>
                <span class="growth-before">${growth.before.mdf}</span>
                <span class="growth-arrow">→</span>
                <span class="growth-after">${growth.after.mdf}</span>
              </div>
            </div>
          ` : ""}
          ${practiceBonusText}
        </div>
        <div class="menu-container result-actions">${nextButton}</div>
      </div>
    `);

    document.getElementById("nextStageBtn")?.addEventListener("click", () => this.nextStage());
    document.getElementById("retryBtn")?.addEventListener("click", () => this.retry());
  },

  showNextStageInDevelopment() {
    this.stopBattleSounds();
    this.hideSkillPanel();
    battleManager.clearCharacters();

    const wrapper = document.getElementById("uiWrapper");
    if (wrapper) wrapper.style.display = "none";

    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "flex";

    this.showBattleResult(`
      <div class="announcement-area next-stage-development">
        <div class="victory-message-area">
          <h2>More Stages Coming Soon</h2>
          <p>The next stage is still in development.</p>
        </div>
        <div class="menu-container">
          <button type="button" id="backToTitleBtn" class="retry-btn">Back to Title</button>
        </div>
      </div>
    `);

    document.getElementById("backToTitleBtn")?.addEventListener("click", () => {
      this.returnToTitle();
    });
  },

  // --- バトル開始 ---
  startBattle() {
    this.clearBattleResult();
    const wrapper = document.getElementById("uiWrapper");
    if (wrapper) wrapper.style.display = "none";
    document.getElementById("battleScreen").style.display = "flex";

    const progress = this.isStoryMode ? storyStorage.loadProgress() : null;
    let savedStatus = progress?.playerStatus || null; 

    let activeConfig = this.currentConfig;
    let enemyTypes = ["kappa"]; 

    const stageInfo = getStoryStage(this.currentStageIndex);
    if (this.isStoryMode && stageInfo) {
      activeConfig = stageInfo;
      enemyTypes = stageInfo.enemyTypes || stageInfo.enemyType || "Kappa";
    } else if (activeConfig) {
      enemyTypes = ["Kappa"];
    }

    const bgKey = activeConfig ? activeConfig.bgKey : null;
    const enemyLevel = this.isStoryMode ? (activeConfig?.enemyLevel || null) : 1;
    const enemyRank = this.isStoryMode ? (activeConfig?.enemyRank || null) : 1;
    quizManager.quizMode = "normal";

    // 読み込んだ savedStatus を渡すことでレベルが継続される
    battleManager.init(savedStatus, bgKey, enemyTypes, enemyLevel, enemyRank);
    this.applyOverallStoryRankToPlayer();
    this.showStageIntro(activeConfig);

    const bgm = assets.sounds.bgm_Battle;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
      bgm.volume = 0.3;
      bgm.play().catch(() => {});
    }
    quizManager.start();
  },

  showStageIntro(stageConfig) {
    // stageConfig からレベル(1, 2...)と名前(名前)を別々に取得
    const level = stageConfig.id; // または "STAGE " + stageConfig.level
    const name = stageConfig.name;
    
    const battleScreen = document.getElementById("battleScreen");
    if (!battleScreen) return;

    document.getElementById("stageIntro")?.remove();

    const intro = document.createElement("div");
    intro.id = "stageIntro";
    intro.className = "stage-intro";

    // テンプレートリテラルで2行に構成
    // styleで微調整しやすいよう、それぞれspanで囲んでいます
    intro.innerHTML = `
      <div class="intro-level">STAGE ${level}</div>
      <div class="intro-line"></div> <!-- ★この一行（線）を追加 -->
      <div class="intro-name">${name}</div>
    `;

    battleScreen.appendChild(intro);

    requestAnimationFrame(() => {
      intro.classList.add("is-visible");
    });

    setTimeout(() => {
      intro.classList.remove("is-visible");
      intro.classList.add("is-hiding");
    }, 3000);

    setTimeout(() => {
      intro.remove();
    }, 4000);
  },

  // --- データ読み込み ---
  loadSelectedStageData(category, files) {
    this.startLoadingAnimation();
    const fetchPromises = files.map(file => fetch(stageWordUrl(category, file)).then(res => res.json()));

    Promise.all(fetchPromises)
      .then(results => {
        quizManager.wordList = results;
        quizManager.images = { ui_Kiwami: assets.images.ui_Kiwami };
        this.stopLoadingAnimation();
        this.startBattle();
      })
      .catch(err => {
        console.error(err);
        this.stopLoadingAnimation();
        alert("データの読み込みに失敗しました。");
        this.showStartScreen();
      });
  },

  // --- ユーティリティ ---
  startLoadingAnimation() {
    const area = document.getElementById("loadingArea");
    if (!area) return;
    area.style.display = "flex";
    let dots = 0;
    this.loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      area.innerText = "Loading" + ".".repeat(dots);
    }, 500);
  },

  stopLoadingAnimation() {
    clearInterval(this.loadingInterval);
    const area = document.getElementById("loadingArea");
    if (area) area.style.display = "none";
  },

  showCategoryMenu() {
    const container = document.getElementById("uiWrapper");
    const categories = Object.keys(this.stageConfigs).reverse();
    container.innerHTML = `
      <div class="menu-container">
        ${categories.map(c => `<button type="button" class="mode-btn" data-category="${c}">${c}</button>`).join("")}
        <button type="button" class="back-btn" id="backToMainMenu">Back to Title</button>
      </div>
    `;
    container.querySelectorAll(".mode-btn").forEach(btn => {
      btn.addEventListener("click", (e) => this.showStageMenu(e.target.dataset.category));
    });
    document.getElementById("backToMainMenu").addEventListener("click", () => this.showStartScreen());
  },

  showStageMenu(category) {
    const container = document.getElementById("uiWrapper");
    const stages = this.isStoryMode
      ? this.stageConfigs[category]
      : getPracticeVisibleStages(category, this.stageConfigs[category]);
    container.innerHTML = `
      <div class="menu-container">
        <h3 class="category-title">${category}</h3>
        ${
          stages.length
            ? stages.map((s) => {
                const rank = storyStorage.getStageRank(category, s.id);
                return `<button type="button" class="mode-btn" data-stage-id="${s.id}">${s.name} <span class="${getRankClass(rank)}">[${rank}]</span></button>`;
              }).join("")
            : `<div class="empty-stage-list">Cleared stages only</div>`
        }
        <button type="button" class="back-btn" id="backBtn">Back</button>
      </div>
    `;
    if (!stages.length) {
      document.getElementById("backBtn").addEventListener("click", () => this.showCategoryMenu());
      return;
    }
    container.querySelectorAll(".mode-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const stage = stages.find(s => s.id == e.target.dataset.stageId);
        this.currentConfig = { ...stage, category, stageId: stage.id };
        this.loadSelectedStageData(category, stage.files);
      });
    });
    document.getElementById("backBtn").addEventListener("click", () => this.showCategoryMenu());
  },
  
  //////////////////////////////
  //    スキル選択パネルの表示
  //////////////////////////////
  showSkillPanel(options = {}) {
    // 勝利演出中などは出さない
    if (quizManager.isVictoryActive) return;

    // 効果音があれば再生
    if (this.itemBonusSE) {
      this.itemBonusSE.volume = 0.5;
      this.itemBonusSE.play();
    }

    const panel = document.getElementById("skill-panel");
    if (!panel) return;

    // パネルの中身を空にして、新しい選択肢を作る
    const content = panel.querySelector(".panel-content");
    if (content) {
      content.innerHTML = "";
      const count = options.count || 2;
      itemManager.renderOptions(content, count, {
        guaranteeRecovery: Boolean(options.guaranteeRecovery),
        excludeRecovery: Boolean(options.excludeRecovery),
      });
    }

    panel.style.display = "flex";
  },


  handleGameOver() {
    const bgm = assets.sounds.bgm_Battle;
    if (bgm) bgm.pause();
    if (this.gameOverSE) this.gameOverSE.play();
    let buttons = this.isStoryMode ? `<button type="button" id="re-challengeBtn" class="retry-btn">Retry Stage</button>` : "";
    buttons += `<button type="button" id="retryBtn" class="retry-btn">Back to menu</button>`;
    this.showBattleResult(`<div class="announcement-area--gameover"><h2>Game Over</h2>${quizManager.buildWrongAnswersReviewHtml()}<div class="menu-container result-actions">${buttons}</div></div>`);
    document.getElementById("re-challengeBtn")?.addEventListener("click", () => {
      this.clearBattleResult();
      this.launchStoryStage();
    });
    document.getElementById("retryBtn").addEventListener("click", () => this.retry());
  },
  

  //////////////////////////////
  //    スキル選択パネルの非表示
  //////////////////////////////
  hideSkillPanel() {
    const panel = document.getElementById("skill-panel");
    if (panel) {
      panel.style.display = "none";
    }
  },


  retry() {
    this.clearBattleResult();
    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "none";
    document.getElementById("quizArea").innerHTML = "";
    this.init();
  },

  playStartBtnSE() { this.startBtnSE.currentTime = 0; this.startBtnSE.play(); },


  selectItem(itemId) {
    // コンテキストが外れても安全なように window.gameManager または this を固定
    const self = window.gameManager || this;

    itemManager.applyItem(itemId, battleManager.player);
    refreshPlayerBuffIcons();
    
    self.hideSkillPanel();

    // 1. スキル直後にプレイヤーが死んでいるなら、即ゲームオーバー画面へ
    if (battleManager.player && battleManager.player.hp <= 0) {
      console.log("スキル選択後にプレイヤーの死亡を確認。ゲームオーバーへ移行します。");
      self.clearBattleResult();
      self.handleGameOver();
      return; 
    }

    // スキルを使ったら、そのまま次のクイズへ戻る
    if (typeof quizManager.randomQuestion === "function") {
      quizManager.randomQuestion();
    } else if (typeof quizManager.nextQuestion === "function") {
      quizManager.nextQuestion();
    }
  },
}

gameManager.init();
window.gameManager = gameManager;
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".item-choice");
  if (btn) window.gameManager.selectItem(btn.dataset.id);
});
