  
  let wordList = [];//JSONから読み込んだ、すべての単語データが入る巨大な倉庫。
  let currentStage = 0; //今「第何ステージ」にいるかを記録。クリアするたびに増える。
  let correctQuestionCount = 0; //今のバトルで「何問解いたか」を数える。
  const MAX_QUESTIONS = 2; //この数に達するとバトル終了（勝利）になる。
  let usedWords = [];//同じ問題が何度も出ないように、一度出した単語をメモしておく。
  let currentQuestion = {};//今、画面に出ている「たった一つの問題」のデータ。
  let streak = 0;//コンボ数。ミスせずに連続で正解すると増えていく。
  let wrongAnswers = [];//間違えた単語をメモしておき、最後に「復習」として表示するために使う

  //クイズスタート
  function startQuiz() {
    if (wordList.length === 0) {// 1. もし単語リスト（wordList）が空っぽだったら...
      alert("Spells not loaded yet!");// 警告を表示する
      return;//処理を中断（return）する
    }

    const container = document.getElementById("kiwami-container");
  if (container) container.style.display = "block";

  // 画像をセット
  const img = document.getElementById("kiwami-image");
  const bg = document.getElementById("kiwami-bg");
  
  // assets.jsで定義した画像パスを代入
  if (img && assets.images.ui_Kiwami) {
    img.src = assets.images.ui_Kiwami.src;
    bg.src = assets.images.ui_Kiwami.src;
  }

  randomQuestion();
  }

  //クイズの選定
  function randomQuestion() {
  // 1. 勝利判定
  if (correctQuestionCount >= MAX_QUESTIONS) {
    if (assets.sounds.bgm_victory) assets.sounds.bgm_victory.play();
    // ここで retryBattle(); を呼ぶと全てリセットされるので、
    // ステージ継続なら呼ばないか、内容を調整した方が良いです。
    return; // 勝利画面を出したら、以下の処理（問題作成）は中断する
  }

  // --- 修正ポイント：現在のステージの単語リストを特定する ---
  // wordListがステージごとの配列になっている前提です
  const currentStageWords = wordList[currentStage]; 

  // 2. 未出題のフィルタリング（現在のステージ内から探す）
  const availableWords = currentStageWords.filter(item => !usedWords.includes(item.kanji));

  if (availableWords.length === 0) {
    usedWords = []; // そのステージの単語を使い切ったらリセット
    randomQuestion();
    return;
  }

  // 3. 正解を決定
  const correct = availableWords[Math.floor(Math.random() * availableWords.length)];
  usedWords.push(correct.kanji);

  // 4. 選択肢の作成
  let options = [correct];
  while (options.length < 4) {
    // 誤選択肢も「現在のステージ」から選ぶように変更
    const rand = currentStageWords[Math.floor(Math.random() * currentStageWords.length)];
    const isDuplicate = options.some(opt => opt.yomi === rand.yomi);// 【修正ポイント】
    // すでに options の中に、同じ「yomi（読み）」を持っているものがいないか確認する

    if (!isDuplicate) {
      options.push(rand);
    }
  }

  // 5. シャッフルと保存
  options.sort(() => Math.random() - 0.5);
  currentQuestion = correct;

  // 6. 描画
  renderQuestion(correct, options);
}

//クイズを表示
function renderQuestion(correct, options) {

    const kanji = correct.kanji;//問題データから「日本語の意味」を取り出す
    const english = correct.english || ""; //問題データから「英語の意味」を取り出す
    
    //quizArea という箱の中身を、新しい問題のHTMLに書き換える
    document.getElementById("quizArea").innerHTML = `

      <div class="question-container">
        <h2 style="font-size: 2.5rem; margin-bottom: 5px;">${kanji}</h2>
        <p style="font-size: 1em; opacity: 0.6; color: #aaa; margin-top: 2.5px;">${english}</p>
      </div>
      <div id="optionArea" class="button-container">
        ${options.map(o => `
        <button onclick="answer('${o.yomi}')">
          <div style=margin-bottom: 5px;>${o.yomi}</div>
          <div style="font-size: 0.75em; opacity: 0.6; color: #aaa; margin-top: 2.5px; ">${o.romaji}</div>
        </button>
      `).join("")}
    </div>
  `;
  updateKiwamiIcon();
    }
  //ボタンの判定
  function answer(selected) {//誰が押されたかを受け取る
    const buttons = document.querySelectorAll("#optionArea button");//全てのボタンを操作対象にする
    disableOptionButtons(buttons);//3連打を防止する

    if (selected === currentQuestion.yomi) {//正解かどうかのジャッジ
      handleCorrectAnswer(buttons);//一致した場合
    } else {
      handleWrongAnswer(buttons);//ハズレの場合
    }
  }
   
  //ボタンをクリックできないように無効化
  function disableOptionButtons(buttons) {// 全ての選択肢ボタンをクリックできないように無効化する関数
    buttons.forEach(btn => {// buttons（ボタンのリスト）の中から、ボタンを一つずつ「btn」として取り出して処理する
      btn.disabled = true;// 取り出したボタンのdisabled属性を「真（true）」にして、クリックを禁止する
    });
  }
  
  // 正解した時の処理
  function handleCorrectAnswer(buttons) { // 正解した時の処理をまとめた関数
    correctQuestionCount++;// 正解コンボを1増やす
    updateKiwamiIcon();
    highlightCorrectButton(buttons);// 正解のボタンを光らせる（緑色にするなど）演出を実行  
    
    
    if (correctQuestionCount >= MAX_QUESTIONS) {// もし13問答えられたら（全問クリアなどの条件）
    setTimeout(() => {// 1秒（1000ミリ秒）待ってから実行
      if (assets.sounds.bgm_Battle) {
                assets.sounds.bgm_Battle.pause();      // 一時停止
                assets.sounds.bgm_Battle.currentTime = 0; // 時間を最初に戻す

            }// バトル中のBGMを止める
        // --- 勝利BGMを再生する処理 ---
           victory(); 
    }, 1000);
    return;
    }

setTimeout(() => {
      randomQuestion(); 
      console.log("現在の正解数:", correctQuestionCount);
    }, 1000);
}

    //正解のボタンを強調
    function highlightCorrectButton(buttons) {// 正解のボタンを強調（ハイライト）する関数
    buttons.forEach(btn => {// 画面にある全てのボタン（buttons）を一つずつ「btn」としてチェックする
      if (btn.innerText.includes(currentQuestion.yomi)) {// もしボタンに書いてある文字（innerText）が、今の問題の正解（yomi）と同じなら
        btn.classList.add("correct-answer");// そのボタンに「correct-answer」というCSSクラスを追加する
        // （これにより、CSSで設定した緑色などのスタイルが適用される）
      }
    });
  }

//不正解だった時の処理
    function handleWrongAnswer(buttons) {// 不正解だった時の処理をまとめた関数
    streak = 0;

    highlightWrongButton(buttons);// 間違えたボタンを赤くするなどの演出を実行
  
    if (!wrongAnswers.some(item => item[0] === currentQuestion.kanji)) {// 今回間違えた問題が、まだ「間違えたリスト（wrongAnswers）」に入っていないか確認
      wrongAnswers.push([currentQuestion.kanji, currentQuestion.yomi]);// リストになければ、問題の漢字(currentQuestion[0])と答え(currentQuestion[yomi])を保存

      // --- ここを追加：1.5秒後に次の問題へ進む ---
    setTimeout(() => {
      // 本来はここにHP判定を入れますが、まずは進むかどうか確認しましょう
      randomQuestion(); 
    }, 1500);
    }
  } 
  //不正解のボタンを強調
    function highlightWrongButton(buttons) {//不正解のボタンを強調（ハイライト）する関数
    buttons.forEach(btn => {// 画面にある全てのボタン（buttons）を一つずつ「btn」としてチェックする
      if (btn.innerText.includes(currentQuestion.yomi)) {// もしボタンに書いてある文字（innerText）が、不正解と同じなら
        btn.classList.add("wrong-answer");// リストになければ、問題の漢字(currentQuestion[0]))を保存
      }
    });
  }
//ゲームオーバー
       function gameOver() {
            if (assets.sounds.bgm_Battle) {
                assets.sounds.bgm_Battle.pause();      // 一時停止
                assets.sounds.bgm_Battle.currentTime = 0; // 時間を最初に戻す
        
            }// バトル中のBGMを止める
        // --- gameoverBGMを再生する処理 ---
            if (assets.sounds.bgm_GameOver) {
                assets.sounds.bgm_GameOver.currentTime = 0; // 念のため最初から
                assets.sounds.bgm_GameOver.play();          // 再生
            }

    const wrongListHtml = wrongAnswers.length > 0// --- 2. 復習リストの作成 ---
      ? wrongAnswers.map(item => `<li>${item[0]} ＝ ${item[1]}</li>`).join("")// --- 2. 復習リストの作成 ---
      : "<li>No mistakes</li>"; //一度も間違えなかった場合（HP減少などの特殊な終了時用）
    
      // --- 3. 画面（HTML）の書き換え ---
      // quizArea の中身を、結果表示とリトライボタンに置き換える
    document.getElementById("quizArea").innerHTML = `
      <div class="last-word-review">
        <h2 style="color: #ff4d4d;">Missed Words</h2>
        <ul class="wrong-answer-list">
          ${wrongListHtml}
        </ul>
      </div>
      <hr>
      <h1>GAME OVER</h1>
      <div class="gameover-buttons">
        <button onclick="retryBattle()">Retry</button>
      </div>
    `;
    }

    //リトライバトル
    function retryBattle() {
    streak = 0; // 連勝（コンボ）数を0にリセット
    currentStage = 1; // ← ステージリセット
    correctQuestionCount = 0 // 解いた問題の合計数を0にリセット

               if (assets.sounds.bgm_Battle) {
                assets.sounds.bgm_Battle.pause();      // 一時停止
                assets.sounds.bgm_Battle.currentTime = 0; // 時間を最初に戻す        
            }// バトル中のBGMを止める

            if (assets.sounds.bgm_GameOver) {// 【重要】もしゲームオーバーBGMが鳴っていたら、ここで止める必要があります
        assets.sounds.bgm_GameOver.pause();
        assets.sounds.bgm_GameOver.currentTime = 0;
    }

               if (assets.sounds.bgm_Battle) {
                assets.sounds.bgm_Battle.play(); 
            }// // 再生開始

    //startBattle();
   }

   // 「極」アイコンの状態を更新する関数
function updateKiwamiIcon() {
  const img = document.getElementById("kiwami-image"); // 前の画像
  const bg = document.getElementById("kiwami-bg");    // 後ろの画像
  
  if (!img || !bg) return;

  // 「前の画像」だけを動かす
  const xPosition = correctQuestionCount * 48;
  img.style.left = `-${xPosition}px`; 

  // 「後ろの画像」は 0px のまま動かさない！
  bg.style.left = `0px`; 

  // 点滅処理...
 if (correctQuestionCount >= 1) {
    img.classList.add("is-flashing"); // 前の画像だけピカピカ
  } else {
    img.classList.remove("is-flashing");
  }
}

function victory() {
  const sound = assets.sounds.bgm_victory;
  if (assets.sounds.bgm_Battle) {
    assets.sounds.bgm_Battle.pause();
  }
  // 再生処理
  if (sound && sound.src) {
    sound.currentTime = 0;
    // エラーが出てもゲームが止まらないように catch する
    sound.play().catch(error => {
      console.error("再生に失敗しました。パスを確認してください:", sound.src);
      console.error("エラー詳細:", error);
    });
  }

  // クイズエリアをクリアして勝利メッセージを表示
  const quizArea = document.getElementById("quizArea");
  quizArea.innerHTML = `
    <div class="victory-message">
      <h2>Stage ${currentStage + 1} Clear!</h2>
      <button onclick="goToNextStage()">Go to next stage</button>
    </div>
  `;
  
}

function goToNextStage() {
  currentStage++; // ステージ番号を増やす

  // 次のステージのデータがあるか確認
  if (currentStage < wordList.length) {
    // ステージを切り替える際の初期化処理
    usedWords = [];
    correctQuestionCount = 0; // アイコンのカウントをリセット
    updateKiwamiIcon();      // アイコンを1フレーム目に戻す
    if (assets.sounds.bgm_Battle) {
    assets.sounds.bgm_Battle.play(); 
    }
    // ゲーム再開
    randomQuestion(); 
  } else {
    // 全ステージクリア時の処理
    alert("全ステージを制覇しました！");
    // タイトルに戻る処理など
  }
}