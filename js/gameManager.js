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
    return saved ? JSON.parse(saved) : { currentStageIndex: 0, playerStatus: null };
  }
};

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
    quizManager.onCorrect = () => battleManager.playerAttack();
    quizManager.onWrong = () => battleManager.enemyAttack();
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
    const sounds = [assets.sounds.bgm_Battle, assets.sounds.bgm_BossBattle];
    sounds.forEach((sound) => {
      if (!sound) return;
      sound.pause();
      sound.currentTime = 0;
    });
  },

  returnToTitle() {
    this.hideQuitConfirm();
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
          <button type="button" class="main-menu-btn story" id="storyBtn">Story Mode</button>
          <button type="button" class="main-menu-btn practice" id="practiceBtn">Practice (自由練習)</button>
        </div>
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
    console.log("セーブ直前のExp:", currentPlayerStatus.exp); // ここで 0 じゃないかチェック！
    const saveData = {
      currentStageIndex: this.currentStageIndex,
      playerStatus: currentPlayerStatus, // currentPlayerStatus を使う
      lastUpdated: new Date().getTime()
    };
    
    storyStorage.saveProgress(saveData);
    this.launchStoryStage();
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
    let bossType = "kappaOyabun";

    const stageInfo = getStoryStage(this.currentStageIndex);
    if (this.isStoryMode && stageInfo) {
      activeConfig = stageInfo;
      enemyTypes = stageInfo.enemyTypes || stageInfo.enemyType || "Kappa";
      bossType = stageInfo.bossType || "kappaOyabun";
    } else if (activeConfig) {
      enemyTypes = activeConfig.enemyTypes || activeConfig.enemyType || "Kappa";
      bossType = activeConfig.bossType || "kappaOyabun";
    }

    const bgKey = activeConfig ? activeConfig.bgKey : null;
    const enemyLevel = activeConfig?.enemyLevel || null;
    quizManager.quizMode = "normal";

    // 読み込んだ savedStatus を渡すことでレベルが継続される
    battleManager.init(savedStatus, bgKey, enemyTypes, enemyLevel, bossType);
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
    if (assets?.sounds?.bgm_BossBattle) {
      assets.sounds.bgm_BossBattle.pause();
    }

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
    itemManager.applyItem(itemId, battleManager.player);
    refreshPlayerBuffIcons();
    
    this.hideSkillPanel();
    
    // スキルを使ったのでゲージはリセット
    quizManager.correctQuestionCount = 0;
    quizManager.updateKiwamiIcon();

    // ★チェック：全問正解してボスモードに切り替わっているか？ かつ まだ演出前か？
    if (quizManager.quizMode === "boss" && !quizManager.hasBossAppeared) {
      console.log("スキル選択完了：ボス演出を開始します");
      quizManager.triggerBossAppearance();
    } else {
      // すでにボス戦の真っ最中、あるいはまだ雑魚戦の途中なら次の問題へ
      quizManager.randomQuestion();
    }
  }
}

gameManager.init();
window.gameManager = gameManager;
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".item-choice");
  if (btn) window.gameManager.selectItem(btn.dataset.id);
});
