import { battleManager } from "./battleManager.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";
import { assets } from "./assets.js";

/** innerHTML に渡す前に、タグや引用符で壊れないようにする */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const quizManager = {
  wordList: [],
  currentStage: 0,
  correctQuestionCount: 0,
  // MAX_QUESTIONSは極ゲージ（スキルパネル）の閾値としてのみ使用
  MAX_QUESTIONS: 6,
  usedWords: [],
  /** いま出題中の正解データ */
  currentQuestion: {},
  images: {},
  isVictoryActive: false,
  correctAnswerCount: 0,
  /** 不正解のたびに追記（ゲームオーバー時の振り返り用） */
  wrongAnswersLog: [],
  onCorrect: null,
  onWrong: null,
  streak: 0,
  quizMode: "normal", // "normal" か "boss"
  hasBossAppeared: false, // ★追加: ボスが既に出現したか

  
  /////////////////////////
  //   クイズ（スタート）
  /////////////////////////
  start() {
    if (this.wordList.length === 0) {
      alert("単語データがまだ読み込まれていません。");
      return;
    }
    this.reset();
    this.quizMode = "normal"; // スタート時は必ずnormal
    this.setupKiwami();
    this.randomQuestion();
  },


  /////////////////////////
  //   ランダムクイズの準備）
  /////////////////////////
  randomQuestion() {
    if (this.isVictoryActive) return;

  const currentStageWords = this.wordList[this.currentStage];
  if (!currentStageWords?.length) return;

  // ★修正: item.kanji -> item.answer
  let availableWords = currentStageWords.filter(
    (item) => !this.usedWords.includes(item.answer)
  );

  if (availableWords.length === 0) {
    if (this.quizMode === "boss") {
      this.usedWords = [];
      availableWords = currentStageWords;
    } else {
      this.victory();
      return;
    }
    
  }

  const correct = availableWords[Math.floor(Math.random() * availableWords.length)];
  const options = [correct];
  while (options.length < 3) {
    const rand = currentStageWords[Math.floor(Math.random() * currentStageWords.length)];
    // ★修正: opt.kanji -> opt.answer
    if (!options.some((opt) => opt.answer === rand.answer)) {
      options.push(rand);
    }
   }

  options.sort(() => Math.random() - 0.5);
  this.currentQuestion = correct;
  this.renderQuestion(correct, options);
  this.updateQuestionProgress();
  },

  /////////////////////////
  //      問題の表示
  /////////////////////////
    renderQuestion(correct, options) {
    const quizArea = document.getElementById("quizArea");
    if (!quizArea) return;

    const isBoss = (this.quizMode === "boss");

    quizArea.innerHTML = `
      <div class="question-container ${isBoss ? 'boss-mode-ui' : ''}">
        <h2>${escapeHtml(correct.question)}</h2>
      </div>
      <div id="optionArea" class="button-container">
        ${options.map(o => {
          // 通常時はローマ字を .romaji-text で囲む。ボス時は答えのみ。
          // <span>タグを活かすため、中身の変数だけを個別にエスケープします。
          const label = isBoss 
            ? escapeHtml(o.answer) 
            : `${escapeHtml(o.answer)} <span class="romaji-text">/ ${escapeHtml(o.romaji)} /</span>`;
          
          return `
            <button type="button" class="quiz-button" data-answer="${escapeHtml(o.answer)}">
              <div class="answer-text">${label}</div>
            </button>`;
        }).join("")}
      </div>
    `;

    /// renderQuestion 内のイベントリスナー部分
  optionArea.querySelectorAll(".quiz-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-answer");
    
    // ★修正: 以前の kanji/english 判定を削除し、answer プロパティで比較
      const isCorrect = (selected === this.currentQuestion.answer);
    
      this.answer(selected, isCorrect);
    });
  });

    this.updateKiwamiIcon();
  },
 
  /////////////////////////
  //      回答
  /////////////////////////
  answer(selected, isCorrect) {
    const buttons = document.querySelectorAll("#optionArea button");
  this.disableOptionButtons(buttons);

  if (isCorrect) {
    // ★修正: kanji -> answer
    if (!this.usedWords.includes(this.currentQuestion.answer)) {
      this.usedWords.push(this.currentQuestion.answer);
    }
    this.handleCorrectAnswer(buttons, selected);
  } else {
    this.handleWrongAnswer(buttons, selected);
  }
},

  /////////////////////////
  //      回答の判定
  /////////////////////////
  handleCorrectAnswer(buttons, selected) {
    this.correctQuestionCount++;
    this.streak++;

    if (this.quizMode === "normal") {
      this.correctAnswerCount++;
    }

    if (battleManager) battleManager.updateStreakBonus(this.streak);
    this.updateKiwamiIcon(); // ここでパネルが出る可能性がある
    this.updateQuestionProgress();

    if (battleManager.player?.isRegenerating) battleManager.player.applyRegeneration();
    if (this.onCorrect) this.onCorrect();

    buttons.forEach((btn) => {
      if (btn.getAttribute("data-answer") === selected) {
        btn.classList.add("correct-answer");
      }
    });

    // ★修正箇所: スキルパネルが出ているかチェック
    const panel = document.getElementById("skill-panel");
    const isSkillPanelVisible = (panel && panel.style.display === "flex");

    // スキルパネルが出ている場合は、ここで処理を終了する。
    // （次の問題やボス移行は、gameManager.selectItem の中で行うため）
    if (isSkillPanelVisible) {
      console.log("スキル選択待ちのため、次問への遷移をストップしました");
      return; 
    }

    // スキルパネルが出ていない場合のみ、1秒後に次へ
    setTimeout(() => {
      if (this.isVictoryActive) return;

      if (this.quizMode === "boss") {
        this.randomQuestion();
      } else {
        const totalInStage = this.wordList[this.currentStage]?.length || 0;
        if (this.correctAnswerCount >= totalInStage) {
          this.victory();
        } else {
          this.randomQuestion();
        }
      }
    }, 1000);
  },
  

  /////////////////////////
  //    不正解時のボタン停止
  /////////////////////////
  disableOptionButtons(buttons) {
    buttons.forEach((btn) => {
      btn.disabled = true;
    });
  },


  /////////////////////////
  //　　　不正解処理
  /////////////////////////
  handleWrongAnswer(buttons, selected) {
    // 極ゲージを減らす（最小0）
    this.correctQuestionCount = Math.max(0, this.correctQuestionCount - 1);
    this.updateKiwamiIcon();
    this.streak = 0;
    
    if (battleManager) battleManager.updateStreakBonus(this.streak);

    const q = this.currentQuestion;
    if (q) {
      this.wrongAnswersLog.push({
        question: q.question,
        answer: q.answer || "",
        romaji: q.romaji || "",
        correctEnglish: q.english,
      });
    }

    if (this.onWrong) this.onWrong();

    buttons.forEach((btn) => {
      if (btn.getAttribute("data-answer") === selected) {
        btn.classList.add("wrong-answer");
      }
    });
    
    // プレイヤーが生きている場合のみ、同じ問題を飛ばして次へ（または同じ問題を出し直すなら usedWordsに入れないだけでOK）
    setTimeout(() => {
        if (battleManager.player && battleManager.player.hp > 0) {
            this.randomQuestion();
        }
    }, 1000);
  },


  /////////////////////////
  //      極アイコン表示
  /////////////////////////
  setupKiwami() {
    const container = document.getElementById("kiwami-container");
    const bg = document.getElementById("kiwami-bg");
    const img = document.getElementById("kiwami-image");

    if (container) container.style.display = "block";

    if (bg && this.images.ui_Kiwami) {
      bg.src = this.images.ui_Kiwami.src;
      bg.style.display = "block";
    }

    if (img && this.images.ui_Kiwami) {
      img.src = this.images.ui_Kiwami.src;
      img.style.display = "block";
      img.style.left = "0cqw";
      img.classList.remove("is-flashing");
    }
  },
  

  /////////////////////////
  // 　　　極アップデート
  /////////////////////////
  updateKiwamiIcon() {
    const img = document.getElementById("kiwami-image");
    if (!img) return;

    // MAX_QUESTIONSを6と仮定して位置計算（または固定値で調整）
    const gaugeMax = 6; 
    const count = Math.max(0, this.correctQuestionCount);
    const xPosition = Math.min(count, gaugeMax) * 15;
    img.style.left = `-${xPosition}cqw`;

    if (count >= 2) img.classList.add("is-flashing");
    else img.classList.remove("is-flashing");

    if (count >= 5) img.classList.add("is-rainbow");
    else img.classList.remove("is-rainbow");

    // ★ 極スキルパネル：連続正解数（ゲージ）が一定に達したら出す
    if (count >= gaugeMax && !this.isVictoryActive) {
      window.gameManager?.showSkillPanel();
    }
  },


  /////////////////////////
  //　　　　勝利
  /////////////////////////
  victory() {
    // すでにリザルト画面が出ているなら重複させない
    if (this.isVictoryActive && document.getElementById("nextStageBtn")) return;

    // 1. 雑魚戦が終わった直後 -> ボス戦へ移行
    if (this.quizMode === "normal") {
      this.quizMode = "boss";
      this.usedWords = [];           

      // 2. スキルパネルが出ているかチェック
      const panel = document.getElementById("skill-panel");
      const isSkillPanelVisible = (panel && panel.style.display === "flex");

      if (isSkillPanelVisible) {
        // スキルパネルが出ているなら、パネルが閉じるのを待つ
        // ※gameManager側の「スキル選択完了」イベント等にフックする
        console.log("スキル選択待ち...");
  
      } else {
        // 出ていなければ即座にボス演出開始
        this.triggerBossAppearance();
      }
      return;
    }

    // 2. ボス戦終了（本当のステージクリア）
    this.isVictoryActive = true;

    // ★追加：ボスBGMを止める
    if (assets && assets.sounds && assets.sounds.bgm_BossBattle) {
      const bossBgm = assets.sounds.bgm_BossBattle;
      bossBgm.pause();
      bossBgm.currentTime = 0; // 次回のために再生位置をリセット
    }
    
    // クリア画面を出すときだけ、スキルパネルを隠す
    window.gameManager?.hideSkillPanel();

    // ボタンのHTMLを先に構築
    let buttonHtml = window.gameManager?.isStoryMode
      ? `<button type="button" id="nextStageBtn" class="retry-btn">Next Stage</button>`
      : `<button type="button" id="retryBtn" class="retry-btn">RETRY</button>`;

    window.gameManager?.showBattleResult(`
      <div class="announcement-area">
        <div class="victory-message-area">
          <h2>Stage Clear!</h2>
          <p>Boss Defeated!</p>
        </div>
        <div class="menu-container result-actions">${buttonHtml}</div>
      </div>
    `);

    // innerHTMLを書き換えた直後にイベントリスナーを再登録
    document.getElementById("nextStageBtn")?.addEventListener("click", () => {
      window.gameManager?.nextStage();
    });
    document.getElementById("retryBtn")?.addEventListener("click", () => {
      window.gameManager?.retry();
    });
  },

  /////////////////////////
  //　ボス登場の演出とBGM開始 
  /////////////////////////
  triggerBossAppearance() {
    // すでに演出済みならスキップ
    if (this.hasBossAppeared) return;
    this.hasBossAppeared = true;

    // 1. 追加先を actionArea に変更
    const actionArea = document.getElementById("actionArea");
    if (!actionArea) return; // 安全策
    
    // ★ ボス戦用の赤いレイヤーを有効にするクラスを付与
    actionArea.classList.add("boss-active");

    // 1. ホワイトアウト用要素の作成
    const overlay = document.createElement("div");
    overlay.className = "black-out-overlay";
    // body ではなく actionArea に追加
    actionArea.appendChild(overlay);

    // 強制的にブラウザに描画させてからアニメーション開始
    requestAnimationFrame(() => {
      overlay.classList.add("black-out-active");
    });

    // 2. 画面が真っ白になった頃（0.8秒後など）に処理を実行
    setTimeout(() => {
    
      // BGM切り替え (gameManager内のassetsを参照)
      if (window.gameManager && assets.sounds.bgm_BossBattle) {
        // 既存のBGMを止める
        if (assets.sounds.bgm_Battle) assets.sounds.bgm_Battle.pause();
        
        assets.sounds.bgm_BossBattle.currentTime = 0;
        assets.sounds.bgm_BossBattle.volume = 0.5;
        assets.sounds.bgm_BossBattle.play().catch(e => console.log("BGM Play Error:", e));
      }

      // ボス出現
      if (window.battleManager) {
        window.battleManager.bossSpawn();
      }

      // クイズ画面をボス用に更新
      this.randomQuestion();
     
      // 3. ホワイトアウト解除（クラスを外す）
      overlay.classList.remove("black-out-active");
      
      // アニメーションが終わるのを待ってから要素自体を削除
      setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
      }, 1000); 
    }, 800); // ここをCSSのtransition時間に合わせる
  },


  /////////////////////////
  //　　　クイズリセット
  /////////////////////////
  reset() {
    // ステージ番号はそのまま（今のステージをやり直すため）
    // それ以外の「そのステージ内での進捗」をすべてゼロにする
    this.currentQuestion = {};
    this.correctQuestionCount = 0; // 極ゲージ用カウント
    this.correctAnswerCount = 0;   // UI表示用の正解数カウント
    this.usedWords = [];           // ★重要：出題済みリストを空にする
    this.wrongAnswersLog = [];     // 誤答ログを空にする
    this.isVictoryActive = false;
    this.streak = 0;               // ストリークリセット
    this.hasBossAppeared = false; // ★リセット時にここも戻す

    // ★ ステージリセット時に赤いフィルターも消す
    const actionArea = document.getElementById("actionArea");
    if (actionArea) {
      actionArea.classList.remove("boss-active");
    }
    
    // UIの更新
    this.updateKiwamiIcon();
    this.updateQuestionProgress();
  },

  //////////////////////////////
    //     レビュー画面
  /////////////////////////
  buildWrongAnswersReviewHtml() {
    if (!this.wrongAnswersLog.length) {
      return `<p class="game-over-review-empty">このバトルで記録された誤答はありません。</p>`;
    }

    const items = this.wrongAnswersLog
      .map(
        (row) => `
      <li class="game-over-review-item">
        <div class="game-over-review-kanji" style="font-size: 0.9em; margin-bottom: 2px;">
          ${escapeHtml(row.question)}
        <div class="game-over-review-answer">
          <span class="game-over-review-label">A:</span> 
          ${escapeHtml(row.answer)}${row.romaji ? ` / ${escapeHtml(row.romaji)}` : ""}
        </div>
      </li>`
      )
      .join("");

    return `
      <div class="game-over-review">
        <p class="game-over-review-title">Missed words</p>
        <ol class="game-over-review-list">${items}</ol>
      </div>
    `;
  },


  /////////////////////////
  //   正解数と問題数の表示
  /////////////////////////
  updateQuestionProgress() {
    const progressEl = document.getElementById("question-progress");
    if (!progressEl) return;

    const total = this.wordList[this.currentStage]?.length || 0;
    progressEl.innerText = `${this.correctAnswerCount} / ${total}`;
  },


};

window.quizManager = quizManager;
