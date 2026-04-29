window.onload = function() {/* ブラウザが画面（HTMLなど）をすべて読み込み終わった時に実行 */
  startLoadingAnimation();
  loadAssets();
  loadAllWordData(); 
  }

  function startLoadingAnimation() {/* ロード画面のアニメーション（文字を動かす）の仕組み */
  const loadingArea = document.getElementById("loadingArea");/* 画面上の「loadingArea」というIDの場所を探して保存 */
  let dots = 0;/* 点（.）の数を数えるための変数を用意 */

  window.loadingInterval = setInterval(() => {/* 0.5秒（500ミリ秒）ごとに、中の処理を繰り返す */
    dots = (dots + 1) % 4;/* 点の数を 0→1→2→3→0... とループさせる計算 */
    loadingArea.innerText = "longding" + ".".repeat(dots);/* 画面に "loading..." のように文字を表示する */
    }, 500);
  }

  function loadAllWordData() {
  // 増やしたいファイル名をここに追加していく
  const stages = [
    'word_list_1.json',
    'word_list_2.json',
    'word_list_3.json',
    'word_list_4.json',
    'word_list_5.json',
    'word_list_6.json',
    
  ];

  // 全てのフェッチ（取得）処理を配列に入れる
  const fetchPromises = stages.map(stage => 
    fetch(`assets/words/${stage}`).then(res => res.json())
  );

  // 全てのファイルが読み込み終わったら実行
  Promise.all(fetchPromises)
    .then(results => {
      // resultsは [ {words1のデータ}, {words2のデータ}, ... ] という配列になる
      wordList = results;
      
      stopLoadingAnimation();
      showStartMessage();
    })
    .catch(error => console.error("読み込みエラー:", error));
  }

  function stopLoadingAnimation() {/* ローディングを止める関数 */
  clearInterval(window.loadingInterval); /* 0.5秒おきの繰り返しを強制終了する */
  const loadingArea = document.getElementById("loadingArea"); /* 表示場所を特定 */
  loadingArea.innerText = ""; /* 「loading...」という文字を消して空っぽにする */
  }

  function showStartMessage() {//スタートボタンを表示させる
    const container = document.getElementById("uiWrapper");// 1. HTMLの中から、ボタンを入れるための「箱（uiWrapper）」を見つける
    container.innerHTML = `<button id="startBtn">BATTLE START</button>`;// 2. その箱の中に、ボタンのHTMLを書き込む

    const startBtn = document.getElementById("startBtn");// 3. 今作ったばかりのボタン（id="startBtn"）を改めてプログラムで見つける
    startBtn.addEventListener("click", startBattle);// 4. ボタンに「クリックされたら startBattle という関数を実行してね」と予約する
  }

  function hideStartScreen() {//スタート画面を消す
    const wrapper = document.getElementById("uiWrapper");// 1. UI全体を包んでいる箱（uiWrapper）をプログラムで見つける
    if (wrapper) {//もしその箱が無事に見つかったら...
      wrapper.style.display = "none";// CSSの力を使って、画面から完全に消す（非表示にする）
    }
  }

  function showBattleScreen() {//バトル画面を表示する関数 
    const battle = document.getElementById("battleScreen");
    if (battle) {
      battle.style.display = "block";// 隠れていたバトル画面を「見える状態（block）」にする
    }
  }

  function startBattle() {//クイズの画面に移行
    
    const pPanel = document.getElementById('playerStatusPanel');//  プレイヤーのステータスパネル（HPバーなど）を見えるようにする
    const ePanel = document.getElementById('enemyStatusPanel');// 敵のステータスパネル（HPバーなど）を見えるようにする
     if (pPanel) pPanel.style.display = 'flex';// 横並び（flex）で表示
     if (ePanel) ePanel.style.display = 'flex';// 横並び（flex）で表示
    
    hideStartScreen();
    showBattleScreen();
    startQuiz();

    if (assets.sounds.bgm_Battle) {
    assets.sounds.bgm_Battle.play(); }
  }
