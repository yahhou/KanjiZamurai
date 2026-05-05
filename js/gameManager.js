import { assets } from "./assets.js";
import { battleManager } from "./battleManager.js";
import { quizManager } from "./quizManager.js";
import { itemManager } from "./itemManager.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";

const INITIAL_LOAD_MS = 2000;

/**
 * 単語 JSON のURLを「このファイル（js/gameManager.js）」基準で決める。
 * index.html の置き場所や <base> に依存せず、コピーしたフォルダでも assets/words/ を探しにいける。
 */
function stageWordUrl(fileName) {
  return new URL(`../assets/words/${fileName}`, import.meta.url);
}

export const gameManager = {
  stageConfigs: [
    { id: 1, name: "Legendary Samurai", files: ["word_list_7.json"] },
    { id: 2, name: "Novice Samurai 6", files: ["word_list_6.json"] },
    { id: 3, name: "Novice Samurai 5", files: ["word_list_5.json"] },
    { id: 4, name: "Novice Samurai 4", files: ["word_list_4.json"] },
    { id: 5, name: "Novice Samurai 3", files: ["word_list_3.json"] },
    { id: 6, name: "Novice Samurai 2", files: ["word_list_2.json"] },
    { id: 7, name: "Novice Samurai 1", files: ["word_list_1.json"] },
  ],

  startBtnSE: new Audio("assets/sounds/StartButton.mp3"),
  gameOverSE: new Audio("assets/sounds/gameOver.mp3"),
  itemBonusSE: new Audio("assets/sounds/itemBonus.mp3"),
  /** 初回ロード済みか（リトライ時は true のまま） */
  isLoaded: false,
  loadingInterval: null,

  init() {
    this.startLoadingAnimation();

    // クイズの正誤が「誰が攻撃するか」に直結するルール（ここで一度だけ結線）
    quizManager.onCorrect = () => battleManager.playerAttack();
    quizManager.onWrong = () => battleManager.enemyAttack();

    if (!this.isLoaded) {
      assets.loadAssets();
      setTimeout(() => {
        this.isLoaded = true;
        this.stopLoadingAnimation();
        this.showStartMessage();
      }, INITIAL_LOAD_MS);
    } else {
      this.stopLoadingAnimation();
      this.showStartMessage();
    }

    // ブラウザの自動再生制限を避ける：最初のクリックで BGM を一度だけ「解錠」する
    document.addEventListener(
      "click",
      () => {
        const bgm = assets.sounds.bgm_Battle;
        if (bgm && bgm.paused) {
          bgm
            .play()
            .then(() => {
              bgm.pause();
              bgm.currentTime = 0;
            })
            .catch((e) => console.warn("Audio unlock failed:", e));
        }
      },
      { once: true }
    );
  },

  startLoadingAnimation() {
    const loadingArea = document.getElementById("loadingArea");
    if (!loadingArea) return;

    loadingArea.style.display = "flex";
    let dots = 0;
    this.loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingArea.innerText = "Loading" + ".".repeat(dots);
    }, 500);
  },

  stopLoadingAnimation() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }

    const loadingArea = document.getElementById("loadingArea");
    if (loadingArea) {
      loadingArea.style.display = "none";
      loadingArea.innerText = "";
    }
  },

  loadSelectedStageData(files) {
    this.startLoadingAnimation();

    const fetchPromises = files.map((fileName) => {
      const url = stageWordUrl(fileName);
      return fetch(url).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${fileName} (${url})`);
        }
        return res.json();
      });
    });

    Promise.all(fetchPromises)
      .then((results) => {
        quizManager.wordList = results;
        quizManager.images = {
          ui_Kiwami: assets.images.ui_Kiwami,
          ui_Kiwami_BG: assets.images.ui_Kiwami,
        };
        this.isLoaded = true;
        this.stopLoadingAnimation();
        this.startBattle();
      })
      .catch((err) => {
        console.error(err);
        this.stopLoadingAnimation();

        const isFileProtocol = window.location.protocol === "file:";
        const message = isFileProtocol
          ? [
              "いまのアドレスが file:// だと、ブラウザの仕様で JSON を読み込めません（コピーしただけでダブルクリックで開いている場合など）。",
              "",
              "次のどちらかで、このフォルダを一度「サーバー」として出してから、http:// で開いてください。",
              "",
              "例1: python3 -m http.server 8080",
              "例2: npx --yes serve . -l 8080",
              "",
              "そのあとブラウザで http://localhost:8080/ を開き、index.html に進んでください。",
            ].join("\n")
          : [
              "ステージデータの読み込みに失敗しました。",
              "",
              "・index.html と同じ階層に assets フォルダがあるか",
              "・assets/words/ に word_list_*.json があるか",
              "・ブラウザの開発者ツール（F12）→ Console に出ているエラー",
              "",
              "を確認してください。",
            ].join("\n");

        alert(message);
        this.showStartMessage();
      });
  },

  showStartMessage() {
    const container = document.getElementById("uiWrapper");
    if (!container) return;

    container.style.display = "flex";
    container.style.backgroundColor = "transparent";
    container.style.opacity = "1";

    const buttonsHtml =
      `<div class="menu-container">` +
      this.stageConfigs
        .map(
          (stage) =>
            `<button type="button" class="mode-btn" data-stage-id="${stage.id}">${stage.name}</button>`
        )
        .join("") +
      `</div>`;

    container.innerHTML = buttonsHtml;

    container.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.playStartBtnSE();

        const bgm = assets.sounds.bgm_Battle;
        if (bgm) {
          bgm
            .play()
            .then(() => {
              bgm.pause();
            })
            .catch(() => {});
        }

        const stageId = parseInt(e.currentTarget.dataset.stageId, 10);
        const selectedStage = this.stageConfigs.find((s) => s.id === stageId);
        if (!selectedStage) return;

        container.style.transition = "1s";
        container.style.backgroundColor = "black";
        const menu = e.currentTarget.parentElement;
        if (menu) menu.style.opacity = "0";

        setTimeout(() => {
          container.style.display = "none";
          this.loadSelectedStageData(selectedStage.files);
        }, 1000);
      });
    });
  },

  startBattle() {
    this.hideStartScreen();
    this.showBattleScreen();
    battleManager.init();

    const bgm = assets.sounds.bgm_Battle;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
      bgm.volume = 0.5;
      const p = bgm.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    }

    quizManager.start();
  },

  hideStartScreen() {
    const wrapper = document.getElementById("uiWrapper");
    if (wrapper) wrapper.style.display = "none";
  },

  showBattleScreen() {
    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "flex";
  },

  handleGameOver() {
    const bgm = assets.sounds.bgm_Battle;
    if (bgm) bgm.pause();
    this.playGameOverSE();

    const container = document.getElementById("quizArea");
    if (!container) return;

    container.style.display = "flex";
    const reviewHtml = quizManager.buildWrongAnswersReviewHtml();
    container.innerHTML = `
      <div class="announcement-area announcement-area--gameover">
        <div class="game-over-area">
          <h2>Game Over</h2>
        </div>
        ${reviewHtml}
        <button type="button" id="retryBtn" class="retry-btn">メニューへ</button>
      </div>
    `;

    document.getElementById("retryBtn")?.addEventListener("click", () => this.retry());
  },

  retry() {
    this.hideSkillPanel();

    const bgm = assets.sounds.bgm_Battle;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }

    const quizContainer = document.getElementById("quizArea");
    if (quizContainer) quizContainer.innerHTML = "";

    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "none";

    this.init();
  },

  playStartBtnSE() {
    if (this.startBtnSE) {
      this.startBtnSE.currentTime = 0;
      this.startBtnSE.play();
    }
  },

  playGameOverSE() {
    if (this.gameOverSE) {
      this.gameOverSE.currentTime = 0;
      this.gameOverSE.play();
    }
  },

  showSkillPanel() {
    if (quizManager.isVictoryActive) return;

    this.itemBonusSE?.play();

    const panel = document.getElementById("skill-panel");
    if (!panel) return;

    this.renderSkillOptions();
    panel.style.display = "flex";
  },

  renderSkillOptions() {
    const content = document.querySelector("#skill-panel .panel-content");
    if (!content) return;

    content.innerHTML = "";
    itemManager.renderOptions(content, 2);
  },

  selectItem(itemId) {
    itemManager.applyItem(itemId, battleManager.player);
    refreshPlayerBuffIcons();
    this.hideSkillPanel();

    quizManager.correctQuestionCount = 0;
    quizManager.updateKiwamiIcon();
    quizManager.randomQuestion();
  },

  hideSkillPanel() {
    const panel = document.getElementById("skill-panel");
    if (panel) panel.style.display = "none";
  },
};

gameManager.init();
window.gameManager = gameManager;

// アイテム選択は document に一本化（HTML の onclick を減らす）
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".item-choice");
  if (!btn || btn.disabled) return;

  const id = btn.dataset.id;
  if (id == null || id === "") return;

  window.gameManager.selectItem(id);
});
