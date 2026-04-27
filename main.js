
let wordList = [];

window.onload = function() {/* ブラウザが画面（HTMLなど）をすべて読み込み終わった時に実行 */
  startLoadingAnimation();
  loadWordData();
}

function startLoadingAnimation() {/* ロード画面のアニメーション（文字を動かす）の仕組み */
  const loadingArea = document.getElementById("loadingArea");/* 画面上の「loadingArea」というIDの場所を探して保存 */
  let dots = 0;/* 点（.）の数を数えるための変数を用意 */

  window.loadingInterval = setInterval(() => {/* 0.5秒（500ミリ秒）ごとに、中の処理を繰り返す */
    dots = (dots + 1) % 4;/* 点の数を 0→1→2→3→0... とループさせる計算 */
    loadingArea.innerText = "longding" + ".".repeat(dots);/* 画面に "loading..." のように文字を表示する */
    }, 500);
  }

 function stopLoadingAnimation() {/* ローディングを止める関数 */
  clearInterval(window.loadingInterval); /* 0.5秒おきの繰り返しを強制終了する */
  const loadingArea = document.getElementById("loadingArea"); /* 表示場所を特定 */
  loadingArea.innerText = ""; /* 「loading...」という文字を消して空っぽにする */
  }

  function loadWordData() {/* JSONファイルから単語データを読み込む関数 */
  fetch('words1.json') /* words1.jsonファイルをネット越しに取ってくるイメージ */
    .then(response => response.json()) /* 届いたデータを「JSON形式」として解釈する */
    .then(words => {
      wordList = words; /* 読み込んだデータをwordListに入れる */
      stopLoadingAnimation(); /* ローディングを止める（後で作ります） */
    })
  }