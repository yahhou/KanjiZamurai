import { assets } from "./assets.js";
import { battleManager } from "./battleManager.js";
import { quizManager } from "./quizManager.js";
import { itemManager } from "./itemManager.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";

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
    return saved ? JSON.parse(saved) : { currentStageIndex: 0, playerStatus: null };
  }
};

function stageWordUrl(category, fileName) {
  return new URL(`../assets/words/${category}/${fileName}`, import.meta.url);
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

  storyStages: [
    { category: "N5", stageId: 1, name: "numbers", bgKey: "stage_1"},
    { category: "N5", stageId: 2, name: "time", bgKey: "stage_1"},
  ],

  stageConfigs: {
    N1: [], N2: [], N3: [], N4: [],
    N5: [
      { id: 1, name: "numbers", files: ["N5_stage1.json"], bgKey: "stage_1"},
      { id: 2, name: "time", files: ["N5_stage2.json"], bgKey: "stage_1"},
    ],
    N6: [
      { id: 99, name: "Hiragana", files: ["hiragana.json"] },
      { id: 100, name: "Katakana", files: ["katakana.json"] },
    ]
  },

  // --- 初期化 ---
  init() {
    this.startLoadingAnimation();
    quizManager.onCorrect = () => battleManager.playerAttack();
    quizManager.onWrong = () => battleManager.enemyAttack();

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

  // --- 画面表示系 ---
  showStartScreen() {
    const container = document.getElementById("uiWrapper");
    if (!container) return;
    container.style.display = "flex";
    container.style.backgroundColor = "transparent";
    container.style.opacity = "1";
    container.innerHTML = `
      <div class="menu-container">
        <h1 class="game-title">侍</h1>
        <button type="button" class="main-menu-btn story" id="storyBtn">Story Mode</button>
        <button type="button" class="main-menu-btn practice" id="practiceBtn">Practice (自由練習)</button>
      </div>
    `;

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
    const stageInfo = this.storyStages[this.currentStageIndex];
    if (!stageInfo) {
      alert("全ステージクリア！");
      this.isStoryMode = false;
      this.currentStageIndex = 0;
      return this.showStartScreen();
    }

    const config = this.stageConfigs[stageInfo.category].find(s => s.id === stageInfo.stageId);
    if (!config) {
      console.error("Config not found", stageInfo);
      return;
    }

    this.currentConfig = config;
    this.loadSelectedStageData(stageInfo.category, config.files);
  },

  nextStage() {
    this.currentStageIndex++;
    const saveData = {
      currentStageIndex: this.currentStageIndex,
      playerStatus: battleManager.getCurrentPlayerStatus(),
      lastUpdated: new Date().getTime()
    };
    storyStorage.saveProgress(saveData);
    this.launchStoryStage();
  },

  // --- バトル開始 ---
  startBattle() {
    const wrapper = document.getElementById("uiWrapper");
    if (wrapper) wrapper.style.display = "none";
    document.getElementById("battleScreen").style.display = "flex";

    let savedStatus = null;
    let activeConfig = this.currentConfig;

    if (this.isStoryMode) {
      const progress = storyStorage.loadProgress();
      savedStatus = progress.playerStatus;
      activeConfig = this.storyStages[this.currentStageIndex];
    }

    const bgKey = activeConfig ? activeConfig.bgKey : null;
    battleManager.init(savedStatus, bgKey);

    const bgm = assets.sounds.bgm_Battle;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
      bgm.volume = 0.3;
      bgm.play().catch(() => {});
    }
    quizManager.start();
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
    const stages = this.stageConfigs[category];
    container.innerHTML = `
      <div class="menu-container">
        <h3 class="category-title">${category}</h3>
        ${stages.map(s => `<button type="button" class="mode-btn" data-stage-id="${s.id}">${s.name}</button>`).join("")}
        <button type="button" class="back-btn" id="backBtn">Back</button>
      </div>
    `;
    container.querySelectorAll(".mode-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const stage = stages.find(s => s.id == e.target.dataset.stageId);
        this.currentConfig = stage;
        this.loadSelectedStageData(category, stage.files);
      });
    });
    document.getElementById("backBtn").addEventListener("click", () => this.showCategoryMenu());
  },
  
  //////////////////////////////
  //    スキル選択パネルの表示
  //////////////////////////////
  showSkillPanel() {
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
      // itemManagerを使って2つのランダムなアイテムを表示
      itemManager.renderOptions(content, 2);
    }

    panel.style.display = "flex";
  },


  handleGameOver() {
    const bgm = assets.sounds.bgm_Battle;
    if (bgm) bgm.pause();
    if (this.gameOverSE) this.gameOverSE.play();
    const container = document.getElementById("quizArea");
    container.style.display = "flex";
    let buttons = this.isStoryMode ? `<button type="button" id="re-challengeBtn" class="retry-btn">Retry Stage</button>` : "";
    buttons += `<button type="button" id="retryBtn" class="retry-btn">Back to menu</button>`;
    container.innerHTML = `<div class="announcement-area--gameover"><h2>Game Over</h2>${quizManager.buildWrongAnswersReviewHtml()}<div class="menu-container">${buttons}</div></div>`;
    document.getElementById("re-challengeBtn")?.addEventListener("click", () => this.launchStoryStage());
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
    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "none";
    document.getElementById("quizArea").innerHTML = "";
    this.init();
  },

  playStartBtnSE() { this.startBtnSE.currentTime = 0; this.startBtnSE.play(); },
  selectItem(itemId) {
    itemManager.applyItem(itemId, battleManager.player);
    refreshPlayerBuffIcons();
    document.getElementById("skill-panel").style.display = "none";
    quizManager.correctQuestionCount = 0;
    quizManager.updateKiwamiIcon();
    quizManager.randomQuestion();
  }
};

gameManager.init();
window.gameManager = gameManager;
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".item-choice");
  if (btn) window.gameManager.selectItem(btn.dataset.id);
});