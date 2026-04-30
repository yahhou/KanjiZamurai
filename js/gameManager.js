
import { battleManager } from './battleManager.js';
import { assets } from './assets.js';
import { quizManager } from './quizManager.js';

export const gameManager = {

  /* ==========================================================================
  1　.初期化（起動）
  ========================================================================== */
  init() {
    this.startLoadingAnimation();
    assets.loadAssets();
    this.loadAllWordData();
  },
/* ==========================================================================
  2.　ローディング演出
  ========================================================================== */
  startLoadingAnimation() {
    const loadingArea = document.getElementById("loadingArea");
    let dots = 0;
    // windowに保存せず、このオブジェクト内で管理するのが綺麗
    this.loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingArea.innerText = "loading" + ".".repeat(dots);
    }, 500);
  },
  /* ==========================================================================
  3.　ロード終了演出
  ========================================================================== */
  stopLoadingAnimation() {
    clearInterval(this.loadingInterval);
    const loadingArea = document.getElementById("loadingArea");
    if (loadingArea) loadingArea.innerText = "";
  },
  /* ==========================================================================
  4.　データ呼び込み
  ========================================================================== */
  loadAllWordData() {
    const stages = [
      'word_list_1.json', 'word_list_2.json', 'word_list_3.json',
      'word_list_4.json', 'word_list_5.json', 'word_list_6.json'
    ];

    const fetchPromises = stages.map(stage => 
      fetch(`assets/words/${stage}`).then(res => res.json())
    );

    Promise.all(fetchPromises)
      .then(results => {
        // クイズマネージャーにデータを渡す
        quizManager.wordList = results;
        
        this.stopLoadingAnimation();
        this.showStartMessage();
      })
      .catch(error => console.error("読み込みエラー:", error));
  },
  /* ==========================================================================
  4. 画面の切り替え
  ========================================================================== */ 
  showStartMessage() {
    const container = document.getElementById("uiWrapper");
    container.innerHTML = `<button id="startBtn"> QUIZ & BATTLE </button>`;

    const startBtn = document.getElementById("startBtn");
    // this.startBattle.bind(this) で「このオブジェクトの関数だよ」と正しく伝える
    startBtn.addEventListener("click", () => this.startBattle());
  },
  /* ==========================================================================
  5.　バトル開始処理
  ========================================================================== */
  startBattle() {
    // ステータスパネルの表示
    const pPanel = document.getElementById('playerStatusPanel');
    const ePanel = document.getElementById('enemyStatusPanel');
    if (pPanel) pPanel.style.display = 'flex';
    if (ePanel) ePanel.style.display = 'flex';
    
    this.hideStartScreen();
    this.showBattleScreen();

    // 他のマネージャーを起動
    battleManager.init(); // 侍たちを登場させる
    quizManager.start();  // クイズを開始する

    if (assets.sounds.bgm_Battle) {
      assets.sounds.bgm_Battle.play();
    }
  },
  /* ==========================================================================
  6. 開始画面の非表示
  ========================================================================== */
  hideStartScreen() {
    const wrapper = document.getElementById("uiWrapper");
    if (wrapper) wrapper.style.display = "none";
  }, 
  /* ==========================================================================
  7.　バトルスクリーン表示
  ========================================================================== */ 
  showBattleScreen() {
    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "block";
  }
};
  /* ==========================================================================
  8.　ゲーム起動
  ========================================================================== */ 
  battleManager.init();