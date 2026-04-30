
export const quizManager = {
  // --- 管理するデータ（プロパティ） ---
  wordList: [],
  currentStage: 0,
  correctQuestionCount: 0,
  MAX_QUESTIONS: 1,
  usedWords: [],
  currentQuestion: {},
  streak: 0,
  wrongAnswers: [],
  
  /* ==========================================================================
  クイズ自体のスタート
  ========================================================================== */

  start() {
    if (this.wordList.length === 0) {
      alert("Spells not loaded yet!");
      return;
    }
    // HTML要素の表示切り替えなど
    const container = document.getElementById("kiwami-container");
    if (container) container.style.display = "block";

    this.randomQuestion();
  },
  
  /* ==========================================================================
  //問題の選定
  ========================================================================== */

  randomQuestion() {
    if (this.correctQuestionCount >= this.MAX_QUESTIONS) {
      this.victory();
      return;
    }

    const currentStageWords = this.wordList[this.currentStage];
    const availableWords = currentStageWords.filter(item => !this.usedWords.includes(item.kanji));

    if (availableWords.length === 0) {
      this.usedWords = [];
      this.randomQuestion();
      return;
    }

    const correct = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.usedWords.push(correct.kanji);

    let options = [correct];
    while (options.length < 4) {
      const rand = currentStageWords[Math.floor(Math.random() * currentStageWords.length)];
      if (!options.some(opt => opt.english === rand.english)) {
        options.push(rand);
      }
    }

    options.sort(() => Math.random() - 0.5);
    this.currentQuestion = correct;

    this.renderQuestion(correct, options);
  }, 

  /* ==========================================================================
  クイズの描画
  ========================================================================== */

  renderQuestion(correct, options) {
    const { kanji, yomi, romaji } = correct;
    
    document.getElementById("quizArea").innerHTML = `
      <div class="question-container">
        <h2>${kanji}</h2>
        <p>${yomi} / ${romaji}</p>
      </div>
      <div id="optionArea" class="button-container">
        ${options.map(o => `
          <button class="quiz-button" onclick="import('./quizManager.js').then(m => m.quizManager.answer('${o.english}'))">
            <div class="yomi-text">${o.english}</div>
          </button>
        `).join("")}
      </div>
    `;
    this.updateKiwamiIcon();
  },
  
  /* ==========================================================================
  // ボタンの判定
  ========================================================================== */
  
  answer(selected) {
    const buttons = document.querySelectorAll("#optionArea button");
    this.disableOptionButtons(buttons);

    if (selected === this.currentQuestion.english) {
      this.handleCorrectAnswer(buttons);
    } else {
      this.handleWrongAnswer(buttons);
    }
  },
  
  /* ==========================================================================
  //ボタン無効化
  ========================================================================== */

  disableOptionButtons(buttons) {
    buttons.forEach(btn => btn.disabled = true);
  },
  
  /* ==========================================================================
  正解後の処理まとめ
  ========================================================================== */
  
  handleCorrectAnswer(buttons) {
    this.correctQuestionCount++;
    this.updateKiwamiIcon();
    this.highlightCorrectButton(buttons);
    
    if (this.correctQuestionCount >= this.MAX_QUESTIONS) {
      setTimeout(() => this.victory(), 1000);
      return;
    }

    setTimeout(() => this.randomQuestion(), 1000);
  },
  
  /* ==========================================================================
  正解ボタン点灯（緑）
  ========================================================================== */
  
  highlightCorrectButton(buttons) {
    buttons.forEach(btn => {
      if (btn.innerText.includes(this.currentQuestion.english)) {
        btn.classList.add("correct-answer");
      }
    });
  },  

  /* ==========================================================================
  不正解後の処理まとめ
  ========================================================================== */

  handleWrongAnswer(buttons) {
    this.streak = 0;
    this.highlightWrongButton(buttons);
  
    if (!this.wrongAnswers.some(item => item[0] === this.currentQuestion.kanji)) {
      this.wrongAnswers.push([this.currentQuestion.kanji, this.currentQuestion.english]);
    }
    setTimeout(() => this.randomQuestion(), 1500);
  },
  
  /* ==========================================================================
  不正解時の正解ボタン点灯
  ========================================================================== */
  
  highlightWrongButton(buttons) {
    buttons.forEach(btn => {
      if (btn.innerText.includes(this.currentQuestion.english)) {
        btn.classList.add("wrong-answer");
      }
    });
  },
  
  /* ==========================================================================
  極アイコンの更新
  ========================================================================== */

  updateKiwamiIcon() {
    const img = document.getElementById("kiwami-image");
    if (!img) return;
    const xPosition = this.correctQuestionCount * 15;
    img.style.left = `-${xPosition}cqw`; 
    if (this.correctQuestionCount >= 1) {
      img.classList.add("is-flashing");
    } else {
      img.classList.remove("is-flashing");
    }
  },
  
  /* ==========================================================================
  ステージクリア
  ========================================================================== */

  victory() {
    // 勝利演出のコード（中身はそのまま）
    const quizArea = document.getElementById("quizArea");
    quizArea.innerHTML = `
      <div class="victory-message-area">
        <h2>Stage ${this.currentStage + 1} Clear!</h2>
        <button class="next-stage-btn" onclick="import('./quizManager.js').then(m => m.quizManager.goToNextStage())">Go to next stage</button>
      </div>
    `;
  },
  
  /* ==========================================================================
  次ステージ移行
  ========================================================================== */

  goToNextStage() {
    this.currentStage++;
    if (this.currentStage < this.wordList.length) {
      this.usedWords = [];
      this.correctQuestionCount = 0;
      this.updateKiwamiIcon();
      this.randomQuestion();
    } else {
      alert("You've completed all the stages!");
    }
  }
};