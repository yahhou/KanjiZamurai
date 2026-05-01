
import { assets } from './assets.js';
import { battleManager } from './battleManager.js';
import { quizManager } from './quizManager.js';
import { Samurai } from '../characters/players/samurai.js';
import { Peasant } from '../characters/enemies/peasant.js';
export const gameManager = {


   startBtnSE: new Audio('assets/sounds/StartButton.mp3'),
   gameOverSE: new Audio('assets/sounds/gameOver.mp3'),
   isLoaded: false, // 追加：ロード完了フラグ
  /* ==========================================================================
  1　.初期化（起動）
  ========================================================================== */
  init() {
    if (this.isLoaded) {
      this.showStartMessage();
      return;
    }

    this.startLoadingAnimation();
    assets.loadAssets();
    this.loadAllWordData();

    // --- ここで「ルール」を1回だけ決めてしまう ---
    quizManager.onCorrect = () => {
      battleManager.playerAttack();
    };
    quizManager.onWrong = () => {
      battleManager.enemyAttack();
    };
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
    if (loadingArea) loadingArea.style.display = "none";
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
        
        // 2. クイズマネージャーに「画像データ」を渡す（ここが重要！）
        // assets.images.ui_Kiwami に画像パスが入っている想定
        quizManager.images = {
          ui_Kiwami: assets.images.ui_Kiwami,
          ui_Kiwami_BG: assets.images.ui_Kiwami
        };
        
        this.isLoaded = true; // ロード完了！
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
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        
        gameManager.playStartBtnSE();
        // 2. 演出：ボタンを消して画面を少し暗くする（あるいは非表示にする）
        startBtn.style.pointerEvents = "none"; // 連打防止
        container.style.backgroundColor = "black"; // 1秒間の暗転演出
        startBtn.style.opacity = "0"; // ボタンだけ先に消す

        setTimeout(() => {
          container.style.display = "none";
          this.startBattle();
        }, 1000); // 1000ミリ秒 = 1秒
      });
    }
  },
  /* ==========================================================================
  5.　バトル開始処理
  ========================================================================== */
  startBattle() {
    // ステータスパネルの表示
    
    this.hideStartScreen();
    this.showBattleScreen();

    // 他のマネージャーを起動
    battleManager.init(); // 侍たちを登場させる


    if (assets.sounds.bgm_Battle) {
      assets.sounds.bgm_Battle.play();
    }

    quizManager.start();
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
  },
  /* ==========================================================================
  ゲームオーバー
  ========================================================================== */ 
  handleGameOver() {
    // BGMを止めるなどの演出
    if (assets.sounds.bgm_Battle) assets.sounds.bgm_Battle.pause();
    gameManager.playGameOverSE();
    const container = document.getElementById("quizArea");
    container.style.display = "flex";
    container.innerHTML = `
      
      <div class="announcement-area">
        <div class="game-over-area">
          <h2>Game Over</h2>
        </div>
        <button id="retryBtn" class="retry-btn">RETRY</button>
    </div>
    `;

    // 2. ボタンを捕まえて、クリックイベントを登録する
    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        this.retry(); // this は gameManager 自身を指します
      });
    }
  },

  /* ==========================================================================
  リトライ
  ========================================================================== */
  retry() {
    // --- BGMのリセット処理 ---
    if (assets.sounds.bgm_Battle) {
      assets.sounds.bgm_Battle.pause();      // 一旦止める
      assets.sounds.bgm_Battle.currentTime = 0; // 再生位置を最初に戻す
    }
    
    const quizContainer = document.getElementById("quizArea");
    if (quizContainer) quizContainer.innerHTML = "";

    const battle = document.getElementById("battleScreen");
    if (battle) battle.style.display = "none";

    // 再び初期化処理へ（isLoadedがtrueなので、ロードを飛ばしてスタートボタンへ戻る）
    this.init();

    // ★重要：スタートボタンがある「uiWrapper」を再び表示させる
    const wrapper = document.getElementById("uiWrapper");
    if (wrapper) {
      wrapper.style.display = "flex"; // ここが none のままだと何も映らなくなります
    }

  },
  /* ==========================================================================
  スタート音
  ========================================================================== */ 
   playStartBtnSE(){
     
     if (this.startBtnSE) {
      this.startBtnSE.currentTime = 0;
      this.startBtnSE.play();

   }
  },
   /* ==========================================================================
  スタート音
  ========================================================================== */ 
   
  playGameOverSE(){
     
     if (this.gameOverSE) {
      this.gameOverSE.currentTime = 0;
      this.gameOverSE.play();

   }
  }

  /* ==========================================================================
  8.　ゲーム起動
  ========================================================================== */ 
   };
  gameManager.init();