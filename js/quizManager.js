import { battleManager } from "./battleManager.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";

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
  MAX_QUESTIONS: 13,
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

  
  /////////////////////////
  //   クイズ（スタート）
  /////////////////////////
  start() {
    if (this.wordList.length === 0) {
      alert("単語データがまだ読み込まれていません。");
      return;
    }
    this.reset();
    this.setupKiwami();
    this.randomQuestion();
  },

  /////////////////////////
  //   ランダムクイズの準備）
  /////////////////////////
  randomQuestion() {
    const currentStageWords = this.wordList[this.currentStage];
    if (!currentStageWords?.length) {
      this.victory();
      return;
    }

    const availableWords = currentStageWords.filter(
      (item) => !this.usedWords.includes(item.kanji)
    );

    if (availableWords.length === 0) {
      this.victory();
      return;
    }

    const correct =
      availableWords[Math.floor(Math.random() * availableWords.length)];
    this.usedWords.push(correct.kanji);

    const options = [correct];
    while (options.length < 4) {
      const rand =
        currentStageWords[Math.floor(Math.random() * currentStageWords.length)];
      if (!options.some((opt) => opt.english === rand.english)) {
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
  const { kanji, yomi, romaji } = correct;
  const quizArea = document.getElementById("quizArea");
  if (!quizArea) return;

  // streakのHTML表示部分をまるごと削除
  quizArea.innerHTML = `
    <div class="question-container">
      <h2>${escapeHtml(kanji)}</h2>
      <p>${escapeHtml(yomi)} / ${escapeHtml(romaji)}</p>
    </div>
    <div id="optionArea" class="button-container">
      ${options.map(o => `
        <button type="button" class="quiz-button" data-english="${escapeHtml(o.english)}">
          <div class="yomi-text">${escapeHtml(o.english)}</div>
        </button>`).join("")}
    </div>
  `;

    const optionArea = document.getElementById("optionArea");
    if (optionArea) {
      optionArea.querySelectorAll(".quiz-button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const selected = btn.getAttribute("data-english");
          if (selected != null) this.answer(selected);
        });
      });
    }

    this.updateKiwamiIcon();
  },

  /////////////////////////
  //      回答の判定
  /////////////////////////
  answer(selected) {
    const buttons = document.querySelectorAll("#optionArea button");

    if (selected === this.currentQuestion.english) {
      this.disableOptionButtons(buttons);
      this.handleCorrectAnswer(buttons);
    } else {
      this.handleWrongAnswer(buttons, selected);
    }
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
  //　　　　正解処理
  /////////////////////////
  handleCorrectAnswer(buttons) {
    this.correctQuestionCount++;
    this.correctAnswerCount++;
    this.streak++;

    // battleManager経由でボーナス計算とステータス更新を一括で行う
    if (battleManager) {
      battleManager.updateStreakBonus(this.streak);
    }

    this.updateKiwamiIcon();
    this.updateQuestionProgress();

    if (battleManager.player?.isRegenerating) {
      battleManager.player.applyRegeneration();
    }

    if (this.onCorrect) this.onCorrect();

    buttons.forEach((btn) => {
      if (btn.getAttribute("data-english") === this.currentQuestion.english) {
        btn.classList.add("correct-answer");
      }
    });

    if (this.correctQuestionCount >= this.MAX_QUESTIONS) {
      return;
    }

    setTimeout(() => this.randomQuestion(), 1000);
  },
  
  /////////////////////////
  //　　　不正解処理
  /////////////////////////
  handleWrongAnswer(buttons, selected) {
    this.correctQuestionCount--;
    this.updateKiwamiIcon();
    
    this.streak = 0; // ストリークリセット
    
    // battleManagerにリセットを伝える
    if (battleManager) {
      battleManager.updateStreakBonus(this.streak);
    }

    const q = this.currentQuestion;
    if (q && q.kanji) {
      this.wrongAnswersLog.push({
        kanji: q.kanji,
        yomi: q.yomi || "",
        romaji: q.romaji || "",
        correctEnglish: q.english,
      });
    }

    if (battleManager.player) {
      battleManager.player.isRegenerating = false;
    }

    refreshPlayerBuffIcons();

    if (this.onWrong) this.onWrong();

    buttons.forEach((btn) => {
      if (btn.getAttribute("data-english") === selected) {
        btn.classList.add("wrong-answer");
        btn.disabled = true;
      }
    });
  },

  /////////////////////////
  //      極アイコン表示
  /////////////////////////
  setupKiwami() {
    const container = document.getElementById("kiwami-container");
    const bg = document.getElementById("kiwami-bg");
    const img = document.getElementById("kiwami-image");

    if (container) container.style.display = "block";

    if (bg && this.images.ui_Kiwami_BG) {
      bg.src = this.images.ui_Kiwami_BG.src;
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

    const count = Math.max(0, this.correctQuestionCount);
    const xPosition = Math.min(count, this.MAX_QUESTIONS) * 20;
    img.style.left = `-${xPosition}cqw`;

    if (count >= 1) {
      img.classList.add("is-flashing");
    } else {
      img.classList.remove("is-flashing");
    }

    if (count >= 12) {
      img.classList.add("is-rainbow");
    } else {
      img.classList.remove("is-rainbow");
    }

    if (count >= this.MAX_QUESTIONS && !this.isVictoryActive) {
      window.gameManager?.showSkillPanel();
    }
  },

  /////////////////////////
  //　　　　勝利
  /////////////////////////
  victory() {
    this.isVictoryActive = true;
    window.gameManager?.hideSkillPanel();

    const container = document.getElementById("quizArea");
    if (!container) return;

    container.style.display = "flex";
    container.innerHTML = `
      <div class="announcement-area">
        <div class="victory-message-area">
          <h2>Stage ${this.currentStage + 1} Clear!</h2>
        </div>
        <button type="button" id="retryBtn" class="retry-btn">RETRY</button>
      </div>
    `;

    document.getElementById("retryBtn")?.addEventListener("click", () => {
      window.gameManager?.retry();
    });
  },

  /////////////////////////
  //　　　クイズリセット
  /////////////////////////
  reset() {
    this.currentStage = 0;
    this.currentQuestion = {};
    this.correctQuestionCount = 0;
    this.stageCorrectCount = 0;
    this.usedWords = [];
    this.wrongAnswersLog = [];
    this.isVictoryActive = false;
    this.updateKiwamiIcon();
    this.updateQuestionProgress();
    this.streak = 0;
  },

  /////////////////////////
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
        <div class="game-over-review-kanji">${escapeHtml(row.kanji)}</div>
        <div class="game-over-review-meta">${escapeHtml(row.yomi)}${
          row.romaji ? ` · ${escapeHtml(row.romaji)}` : ""
        }</div>
        <div class="game-over-review-answer"><span class="game-over-review-label">Answer</span> ${escapeHtml(
          row.correctEnglish
        )}</div>
      </li>`
      )
      .join("");

    return `
      <div class="game-over-review">
        <p class="game-over-review-title">Wrong ansers</p>
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
