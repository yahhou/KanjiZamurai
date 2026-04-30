

export class Character {
  constructor({ id, imgSrc, hp, mp, atk, def, mdf, spd, width, height,
              frameCount, sizeRatio, idleFrameCount}) {
    this.id = id;
    this.imgSrc = imgSrc;
    this.hp = hp;
    this.maxHp = hp;
    this.mp = mp;
    this.atk = atk;
    this.def = def;
    this.mdf = mdf;
    this.spd = spd;
    this.width = width || 80;  // デフォルト値
    this.height = height || 80; // デフォルト値
    this.frameCount = frameCount;
    this.sizeRatio = sizeRatio || 50;
    this.idleFrameCount = idleFrameCount || frameCount;
    this.currentFrame = 0; // 追加：初期フレーム
    this.frameInterval = 500; // 追加：アニメ速度（ミリ秒）
    this.el = document.getElementById(id);
    this.init();
  }

  /* ==========================================================================
  // キャラクター描画セットアップ
  ========================================================================== */

  init() {
    if (!this.el) return;
    const displaySize = `${this.sizeRatio}cqw`;

    Object.assign(this.el.style, {
      width: displaySize,
      height: displaySize,
      backgroundImage: `url('${this.imgSrc}')`,
      backgroundSize: `${this.frameCount * 100}% 100%`, // アニメ用シートの幅
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated", // ドット絵をクッキリさせる
      backgroundPosition: "0% 0px" // 初期位置（1枚目
    });
    this.startIdle();
  }

  /* ==========================================================================
  待機アニメーション
  ========================================================================== */
  
  startIdle() {
  // 待機アニメーション（パラパラ漫画）
  if (this.idleInterval) clearInterval(this.idleInterval);
  
  this.idleInterval = setInterval(() => {
    this.currentFrame = (this.currentFrame + 1) % this.idleFrameCount;
    // パーセント指定の場合は (100 / (枚数 - 1)) * 現在の枚数


    const xShift = (this.currentFrame / (this.frameCount - 1)) * 100;
    this.el.style.backgroundPosition = `${xShift}% 0px`;
    },
    this.frameInterval); 
  }
}