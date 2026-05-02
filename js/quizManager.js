
export const quizManager = {
  // --- 管理するデータ（プロパティ） ---
  wordList: [],
  currentStage: 0,
  correctQuestionCount: 0,
  MAX_QUESTIONS: 13,
  usedWords: [],
  currentQuestion: {},
  streak: 0,
  wrongAnswers: [],
  images: {}, 
  
  /* ==========================================================================
  クイズ自体のスタート
  ========================================================================== */

  start() {
    if (this.wordList.length === 0) {
      alert("Spells not loaded yet!");
      return;
    }
    this.reset();
    this.setupKiwami();

    this.randomQuestion();
  },
  
  /* ==========================================================================
  //問題の選定
  ========================================================================== */

  randomQuestion() {

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
          <button class="quiz-button" onclick="quizManager.answer('${o.english}')">
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

    if (selected === this.currentQuestion.english) {
      this.disableOptionButtons(buttons);
      this.handleCorrectAnswer(buttons);
    } else {
      // 不正解の処理をメソッドに集約
      this.handleWrongAnswer(buttons, selected);
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
    
    if (this.onCorrect) this.onCorrect();
      
    // 正解ボタンを光らせる
    buttons.forEach(btn => {
      if (btn.innerText.trim() === this.currentQuestion.english) {
        btn.classList.add("correct-answer");
      }
    });
    
    // --- ここで分岐！ ---
    if (this.correctQuestionCount >= this.MAX_QUESTIONS) {
      // 規定数に達したら、1秒後に勝利画面へ
      setTimeout(() => this.victory(), 1000);
    } else {
      
      // まだなら、1秒後に次の問題へ
      setTimeout(() => this.randomQuestion(), 1000);
    }
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
  handleWrongAnswer(buttons, selected) {
    this.streak = 0;
    this.correctQuestionCount--;
    this.updateKiwamiIcon(); // ★ここでアイコンの位置を更新

    if (this.onWrong) this.onWrong();

    // 間違えたボタンを赤くして無効化
    buttons.forEach(btn => {
      if (btn.innerText.trim() === selected) {
        btn.classList.add("wrong-answer");
        btn.disabled = true;
      }
    });

    // 誤答リストへの追加
    if (!this.wrongAnswers.some(item => item[0] === this.currentQuestion.kanji)) {
      this.wrongAnswers.push([this.currentQuestion.kanji, this.currentQuestion.english]);
    }
  },

  /* ==========================================================================
  極みのセットアップ
  ========================================================================== */
  setupKiwami() {
    const container = document.getElementById("kiwami-container");
    const bg = document.getElementById("kiwami-bg");
    const img = document.getElementById("kiwami-image");

    // 1. まずコンテナ（窓枠）を表示
    if (container) {
      container.style.display = "block";
    }

    // 2. 背景画像をセット（動かさない固定画像）
    if (bg && this.images.ui_Kiwami_BG) {
      bg.src = this.images.ui_Kiwami_BG.src;
      bg.style.display = "block";
    }

    // 3. アニメーション用画像をセット
    if (img && this.images.ui_Kiwami) {
      img.src = this.images.ui_Kiwami.src;
      img.style.display = "block";
    
      // 最初の位置（0枚目）にリセット
      img.style.left = "0cqw";
      img.classList.remove("is-flashing");
    }
  },

  /* ==========================================================================
  極アイコンの更新
  ========================================================================== */

  updateKiwamiIcon() {
    const img = document.getElementById("kiwami-image");
    if (!img) return;

    const count = Math.max(0, this.correctQuestionCount);
        console.log(count);
    const xPosition = this.correctQuestionCount * 20;
    img.style.left = `-${xPosition}cqw`; 

    if (count >= 1) {
      img.classList.add("is-flashing");
    } else {
      img.classList.remove("is-flashing");
    }

    if(count >= 12) {
      img.classList.add("is-rainbow");
        console.log("rainbow ON");
    } else{
      img.classList.remove("is-rainbow");
    }
  },
  
  /* ==========================================================================
  ステージクリア
  ========================================================================== */

  victory() {
    // 勝利演出のコード（中身はそのまま）
    const container = document.getElementById("quizArea");
    container.style.display = "flex";
    container.innerHTML = `
      <div class="announcement-area">
        <div class="victory-message-area">
          <h2>Stage ${this.currentStage + 1} Clear!</h2>
        </div>
        <button class="next-stage-btn"onclick="quizManager.goToNextStage()">Go to next stage</button>
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
  },

  /* ==========================================================================
  ゲームオーバー時のデータリセット
  ========================================================================== */
  reset(){

    this.currentStage = 0;           // 何問目かを最初に戻す
    this.currentQuestion = 0;           // 念のためスイッチも空に（gameManagerで再設定するため）
    this.correctQuestionCount = 0;
    this.updateKiwamiIcon();
  }
};

window.quizManager = quizManager;