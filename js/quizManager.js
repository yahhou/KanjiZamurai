import { battleManager } from "./battleManager.js";
import { assets } from "./assets.js";

/** innerHTML に渡す前に、タグや引用符で壊れないようにする */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHighlightSentence(sentence, highlight) {
  let displaySentence = escapeHtml(sentence);
  const rawHighlight = String(highlight || "").trim();
  if (!rawHighlight) return displaySentence;

  const escapedFull = escapeHtml(rawHighlight);
  const safeFull = escapedFull.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fullRegex = new RegExp(`(^|[^A-Za-z])(${safeFull})(?=[^A-Za-z]|$)`, "g");
  const highlightedFull = displaySentence.replace(
    fullRegex,
    (_match, prefix, word) => `${prefix}<span class="highlight-word">${word}</span>`
  );

  if (highlightedFull !== displaySentence) {
    return highlightedFull;
  }

  const tokens = rawHighlight.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return displaySentence;

  for (const token of tokens) {
    const escapedToken = escapeHtml(token);
    const safeToken = escapedToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tokenRegex = new RegExp(`(^|[^A-Za-z])(${safeToken})(?=[^A-Za-z]|$)`, "g");
    displaySentence = displaySentence.replace(
      tokenRegex,
      (_match, prefix, word) => `${prefix}<span class="highlight-word">${word}</span>`
    );
  }

  return displaySentence;
}

export const quizManager = {
  wordList: [],
  currentStage: 0,
  kiwamiGauge: 0,
  MAX_KIWAMI_GAUGE: 9,
  HEAL_GAUGE_COST: 3,
  usedWords: [],
  /** いま出題中の正解データ */
  currentQuestion: {},
  images: {},
  isVictoryActive: false,
  correctAnswerCount: 0,
  totalAnswerCount: 0,
  /** 不正解のたびに追記（ゲームオーバー時の振り返り用） */
  wrongAnswersLog: [],
  onCorrect: null,
  onWrong: null,
  streak: 0,
  quizMode: "normal", // "normal" か "boss"
  hasBossAppeared: false, // ★追加: ボスが既に出現したか
  isBossTransitionPending: false,

  
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

  let availableWords = currentStageWords.filter(
    (item) => !this.usedWords.includes(item.sentence)
  );

  if (availableWords.length === 0) {
    this.usedWords = [];
    availableWords = currentStageWords;
  }

  // =========================
  // 正解問題を決定
  // =========================
  const correct =
    availableWords[Math.floor(Math.random() * availableWords.length)];

  let options = [];

  // =========================
  // は・が専用の二択
  // =========================
  if (correct.choices) {

  options = correct.choices;

} else {

    // 通常問題
    options = [correct];

    while (options.length < 3) {
      const rand =
        currentStageWords[
          Math.floor(Math.random() * currentStageWords.length)
        ];

      if (!options.some((opt) => opt.answer === rand.answer)) {
        options.push(rand);
      }
    }
  }

  options.sort(() => Math.random() - 0.5);

  this.currentQuestion = correct;

  this.renderQuestion(correct, options);
},

  /////////////////////////
  //      問題の表示
  /////////////////////////
   renderQuestion(correct, options) {
  const quizArea = document.getElementById("quizArea");
    if (!quizArea) return;

    const isBoss = (this.quizMode === "boss");

    const displaySentence = buildHighlightSentence(correct.sentence, correct.highlight);

  // =========================
  // HTML生成
  // =========================
  quizArea.innerHTML = `
    <div class="question-container ${isBoss ? 'boss-mode-ui' : ''}">
      <h2 class="question-sentence">
        ${displaySentence.replace(/\n/g, "<br>")}
      </h2>
    </div>

    <div id="optionArea" class="button-container">
      ${options.map(o => {

        const label = isBoss
          ? `
            <div class="answer-wrapper">
              <span class="kanji-text">
                ${escapeHtml(o.answer)}
              </span>
            </div>
          `
          : `
            <div class="answer-wrapper">
              <span class="hiragana-text">
                ${escapeHtml(o.hiragana)}
              </span>

              <span class="kanji-text">
                ${escapeHtml(o.answer)}
              </span>
            </div>
          `;

        return `
          <button
            type="button"
            class="quiz-button"
            data-answer="${escapeHtml(o.answer)}"
          >
            <div class="answer-text">
              ${label}
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `;

  // =========================
  // ボタンイベント
  // =========================
  const optionArea = document.getElementById("optionArea");

  optionArea.querySelectorAll(".quiz-button").forEach((btn) => {
    btn.addEventListener("click", () => {

      const selected = btn.getAttribute("data-answer");

      const isCorrect =
        (selected === this.currentQuestion.answer);

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
   if (!this.usedWords.includes(this.currentQuestion.sentence)) {
  this.usedWords.push(this.currentQuestion.sentence);
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
    this.kiwamiGauge = Math.min(this.MAX_KIWAMI_GAUGE, this.kiwamiGauge + 1);
    this.totalAnswerCount++;
    this.streak++;

    this.correctAnswerCount++;

    if (battleManager) battleManager.updateStreakBonus(this.streak);
    this.updateKiwamiIcon();

    if (battleManager.player?.isRegenerating) battleManager.player.applyRegeneration();
    if (this.onCorrect) this.onCorrect();
    this.updateBattleRankDisplay();

    buttons.forEach((btn) => {
      if (btn.getAttribute("data-answer") === selected) {
        btn.classList.add("correct-answer");
      }
    });

    // スキルパネルが出ている場合は、ここで通常進行のタイマーを止める
    const panel = document.getElementById("skill-panel");
    const isSkillPanelVisible = (panel && panel.style.display === "flex");
    if (isSkillPanelVisible) {
      console.log("スキル選択待ちのため、次問への遷移をストップしました");
      return; 
    }

    // 通常の次問遷移
    setTimeout(() => {
      if (this.isVictoryActive) return;
      this.randomQuestion();
    }, battleManager.answerTurnDelayMs || 1000);
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
    this.kiwamiGauge = Math.max(0, this.kiwamiGauge - 1);
    this.totalAnswerCount++;
    this.updateKiwamiIcon();
    this.streak = 0;

    if (battleManager.player) {
      battleManager.player.damageEquipmentDurability(1);
    }
    
    if (battleManager) battleManager.updateStreakBonus(this.streak);
    this.updateBattleRankDisplay();

    const q = this.currentQuestion;
    if (q) {
      this.wrongAnswersLog.push({
        question: q.sentence,
        answer: q.answer || "",
        hiragana: q.hiragana || "",
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
    }, battleManager.answerTurnDelayMs || 1000);
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

    const healBtn = document.getElementById("kiwami-heal-btn");
    const finisherBtn = document.getElementById("kiwami-finisher-btn");
    if (healBtn) healBtn.onclick = () => this.useKiwamiHeal();
    if (finisherBtn) finisherBtn.onclick = () => this.useKiwamiFinisher();
  },
  

  /////////////////////////
  // 　　　極アップデート
  /////////////////////////
  updateKiwamiIcon() {
    const img = document.getElementById("kiwami-image");
    if (!img) return;

    const count = Math.max(0, Math.min(this.MAX_KIWAMI_GAUGE, this.kiwamiGauge));
    const frameIndex = Math.min(9, count);
    const xPosition = frameIndex * 80;
    img.style.left = `-${xPosition}cqw`;

    const healBtn = document.getElementById("kiwami-heal-btn");
    const finisherBtn = document.getElementById("kiwami-finisher-btn");

    healBtn?.classList.toggle(
      "is-visible",
      count >= this.HEAL_GAUGE_COST && count < this.MAX_KIWAMI_GAUGE && this.quizMode === "normal"
    );
    finisherBtn?.classList.toggle("is-visible", count >= this.MAX_KIWAMI_GAUGE && this.quizMode === "normal");

    //if (count >= this.MAX_KIWAMI_GAUGE) img.classList.add("is-rainbow");
    //else img.classList.remove("is-rainbow");
  },

  useKiwamiHeal() {
    if (!battleManager.player || this.kiwamiGauge < this.HEAL_GAUGE_COST) return;

    this.kiwamiGauge -= this.HEAL_GAUGE_COST;
    const heal = Math.floor(battleManager.player.maxHp * 0.5);
    battleManager.player.hp = Math.min(battleManager.player.maxHp, battleManager.player.hp + heal);
    battleManager.player.refreshStats();
    this.updateKiwamiIcon();
  },

  useKiwamiFinisher() {
    if (this.quizMode !== "normal") return;
    if (this.kiwamiGauge < this.MAX_KIWAMI_GAUGE) return;
    if (!battleManager.enemy || battleManager.enemy.hp <= 0) return;

    this.kiwamiGauge = 0;
    this.updateKiwamiIcon();
    this.isBossTransitionPending = true;
    this.quizMode = "boss";
    this.hasBossAppeared = false;
    battleManager.defeatCurrentEnemyForBossTransition();
    this.usedWords = [];
    window.gameManager?.showSkillPanel({ count: 2, excludeRecovery: true, bossBonus: true });
  },


  /////////////////////////
  //　　　　勝利
  /////////////////////////
  victory() {
    if (this.isVictoryActive && document.getElementById("nextStageBtn")) return;

    if (this.quizMode === "normal") {
      return;
    }

    // 2. ボス戦終了（本当のステージクリア）
    this.isVictoryActive = true;

    if (assets?.sounds?.bgm_BossBattle) {
      const bossBgm = assets.sounds.bgm_BossBattle;
      bossBgm.pause();
      bossBgm.currentTime = 0;
    }
    
    window.gameManager?.hideSkillPanel();

    window.gameManager?.showStageClearRankResult();
  },

  /////////////////////////
  //　ボス登場の演出とBGM開始 
  /////////////////////////
  triggerBossAppearance() {
    // すでに演出済みならスキップ
    if (this.hasBossAppeared) return;
    this.hasBossAppeared = true;
    this.isBossTransitionPending = false;

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
    this.kiwamiGauge = 0;
    this.correctAnswerCount = 0;   // UI表示用の正解数カウント
    this.totalAnswerCount = 0;
    this.usedWords = [];           // ★重要：出題済みリストを空にする
    this.wrongAnswersLog = [];     // 誤答ログを空にする
    this.isVictoryActive = false;
    this.streak = 0;               // ストリークリセット
    this.hasBossAppeared = false; // ★リセット時にここも戻す
    this.isBossTransitionPending = false;

    // ★ ステージリセット時に赤いフィルターも消す
    const actionArea = document.getElementById("actionArea");
    if (actionArea) {
      actionArea.classList.remove("boss-active");
    }

    if (battleManager.player) {
      battleManager.player.battleGrade = window.gameManager?.getOverallStoryRank?.() || "C";
      battleManager.player.refreshStats();
    }
    
    // UIの更新
    this.updateKiwamiIcon();
  },

  //////////////////////////////
    //     レビュー画面
  /////////////////////////
  buildWrongAnswersReviewHtml() {
    if (!this.wrongAnswersLog.length) {
      return `<p class="game-over-review-empty">no wrong answers</p>`;
    }

    const items = this.wrongAnswersLog
      .map(
        (row) => `
      <li class="game-over-review-item">
        <div class="game-over-review-kanji" style="font-size: 0.9em; margin-bottom: 2px;">
          ${escapeHtml(row.question)}
        <div class="game-over-review-answer">
          <span class="game-over-review-label">A:</span> 
          ${escapeHtml(row.answer)}${row.hiragana ? ` / ${escapeHtml(row.hiragana)}` : ""}
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


  updateBattleRankDisplay() {
    if (!battleManager.player) return;
    battleManager.player.battleGrade = window.gameManager?.getOverallStoryRank?.() || "C";
    battleManager.player.refreshStats();
  },


};

window.quizManager = quizManager;
