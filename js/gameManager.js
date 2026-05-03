
import { assets } from './assets.js';
import { battleManager } from './battleManager.js';
import { quizManager } from './quizManager.js';

export const gameManager = {

   stageConfigs:[
    {id: 1, name:"Legendary Samurai", files:['word_list_7.json']},
    {id: 2, name:"Novice Samurai 6", files:['word_list_6.json']},
    {id: 3, name:"Novice Samurai 5", files:['word_list_5.json']},
    {id: 4, name:"Novice Samurai 4", files:['word_list_4.json']},
    {id: 5, name:"Novice Samurai 3", files:['word_list_3.json']},
    {id: 6, name:"Novice Samurai 2", files:['word_list_2.json']},
    {id: 7, name:"Novice Samurai 1", files:['word_list_1.json']},
  ],

   startBtnSE: new Audio('assets/sounds/StartButton.mp3'),
   gameOverSE: new Audio('assets/sounds/gameOver.mp3'),
   isLoaded: false, // 追加：ロード完了フラグ
   loadingInterval: null,

  /* ==========================================================================
  1　.初期化（起動）
  ========================================================================== */
  init() {
    this.startLoadingAnimation();

    if (!this.isLoaded) {
      assets.loadAssets();

    setTimeout(() => {
    this.isLoaded = true;
    this.stopLoadingAnimation();
    this.showStartMessage();
    },2000);
  } else {
    this.stopLoadingAnimation();
    this.showStartMessage();
  }

    // --- ここで「ルール」を1回だけ決めてしまう ---
    quizManager.onCorrect = () => battleManager.playerAttack();
    quizManager.onWrong = () => battleManager.enemyAttack();

  },
/* ==========================================================================
  2.　ローディング演出
  ========================================================================== */
  startLoadingAnimation() {
    const loadingArea = document.getElementById("loadingArea");
    if(!loadingArea) return;
    loadingArea.style.display = "flex";
    let dots = 0;
    this.loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingArea.innerText = "Loading" + ".".repeat(dots);
    }, 500);
  },
  /* ==========================================================================
  3.　ロード終了演出
  ========================================================================== */
  stopLoadingAnimation() {
    if(this.loadingInterval){
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }

    const loadingArea = document.getElementById("loadingArea");
    if (loadingArea) {
      loadingArea.style.display = "none";
      loadingArea.innerText = "";
    }
  },
  /* ==========================================================================
  4.　データ呼び込み（選択されたファイルをフェッチ）
  ========================================================================== */
  loadSelectedStageData(files) {
    this.startLoadingAnimation();

    // 修正：files（配列）の中身を一つずつfetchする
    const fetchPromises = files.map(fileName => 
      fetch(`assets/words/${fileName}`).then(res => {
        if (!res.ok) throw new Error(`Fetch error: ${fileName}`);
        return res.json();
      })
    );

    Promise.all(fetchPromises)
      .then(results => {
        quizManager.wordList = results; 
        this.stopLoadingAnimation();
        
        quizManager.images = {
          ui_Kiwami: assets.images.ui_Kiwami,    // 実際のファイルパスを直接書く
          ui_Kiwami_BG: assets.images.ui_Kiwami
        };
        
        this.isLoaded = true;
        this.stopLoadingAnimation();
        this.startBattle();
      })
      .catch(error => {
        this.stopLoadingAnimation();
      });
  },

  /* ==========================================================================
  4. 画面の切り替え
  ========================================================================== */ 
  showStartMessage() {
    const container = document.getElementById("uiWrapper");
    if(!container) return;

    container.style.display = "flex";// リトライ時などのために表示を確実にする
    container.style.backgroundColor = "transparent"; // 暗転リセット
    container.style.opacity = "1";

    // ボタンの自動生成
    let buttonsHtml = `<div class="menu-container">`;
    this.stageConfigs.forEach(stage => {
      buttonsHtml += `<button class = "mode-btn" data-stage-id="${stage.id}">${stage.name}</button>`;
    });
    buttonsHtml += `</div>`;
    container.innerHTML = buttonsHtml;

    // 全てのボタンにイベントを設定
    const buttons = container.querySelectorAll(".mode-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.playStartBtnSE();
        if(assets.sounds.bgm_Battle){
          assets.sounds.bgm_Battle.play().then(() => {
            assets.sounds.bgm_Battle.pause();
          }).catch(e => console.log("Audio play blocked"));
        }

        const stageId = parseInt(e.currentTarget.dataset.stageId);
        const selectedStage = this.stageConfigs.find(s => s.id === stageId);
        
        container.style.transition = "1s";
        container.style.backgroundColor = "black";
        btn.parentElement.style.opacity = "0";

        setTimeout(() => {
          container.style.display = "none";
         // 選択されたステージのファイルを読み込む
          this.loadSelectedStageData(selectedStage.files);
        },1000);
      });
    });
  },

  /* ==========================================================================
  5.　バトル開始処理
  ========================================================================== */
  startBattle() {  
    this.hideStartScreen();
    this.showBattleScreen();
    battleManager.init(); 

    if (assets.sounds.bgm_Battle) {
      // 一度 pause してから再生し直すと、ブラウザの再生制限を突破しやすいです
      assets.sounds.bgm_Battle.pause();
      assets.sounds.bgm_Battle.currentTime = 0;

      // play() は Promise を返すので、エラーをキャッチできるようにします
      const playPromise = assets.sounds.bgm_Battle.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // 失敗した場合は、画面のどこかをクリックしたら流れるように仕込むのも手です
        });
      }
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
    if (battle) battle.style.display = "flex";
  },
  /* ==========================================================================
  ゲームオーバー
  ========================================================================== */ 
  handleGameOver() {
    // BGMを止めるなどの演出
    if (assets.sounds.bgm_Battle) assets.sounds.bgm_Battle.pause();
    this.playGameOverSE();

    const container = document.getElementById("quizArea");
    if(!container) return;
    container.style.display = "flex";
    container.innerHTML = `
      
      <div class="announcement-area">
        <div class="game-over-area">
          <h2>Game Over</h2></div>
        <button id="retryBtn" class="retry-btn">RETRY</button>
      </div>
    `;

    document.getElementById("retryBtn")?.addEventListener("click", () => this.retry());
  },

  /* ==========================================================================
  リトライ
  ========================================================================== */
  retry() {
    this.hideSkillPanel();

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
  },
  /* ==========================================================================
  スキルパネルh表示
  ========================================================================== */ 
  
  showSkillPanel(){
    if (quizManager.isVictoryActive) return;

    const panel = document.getElementById('skill-panel');
    if(panel){
      panel.style.display = 'flex';
    }
  },

  hideSkillPanel(){
    const panel = document.getElementById('skill-panel');
    if(panel){
      panel.style.display = 'none';
    }
  },
  
  /* ==========================================================================
  スキルパネルh表示
  ============================================================================*/

  selectSkill(type){
    if(type === 'attack'){
      battleManager.player.atk += 5;
    }else if(type === 'hp'){
    battleManager.player.maxHp += 20;
    battleManager.player.hp += 20;
    battleManager.player.updateHPBar();
    }


    document.getElementById('skill-panel').style.display = "none";

    quizManager.correctQuestionCount = 0;
    quizManager.updateKiwamiIcon();
    quizManager.randomQuestion();
  }

  /* ==========================================================================
  8.　ゲーム起動
  ========================================================================== */ 
};
  gameManager.init();
  window.gameManager = gameManager;
