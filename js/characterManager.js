

export class Player {
  constructor({ id, imgSrc, hp, mp, atk, def, mdf, spd, frameCount }) {
    this.id = id;
    this.imgSrc = imgSrc;
    this.hp = hp;
    this.maxHp = hp;
    this.mp = mp;
    this.atk = atk;
    this.def = def;
    this.mdf = mdf;
    this.spd = spd;
    this.frameCount = frameCount;
    this.currentFrame = 0; // 追加：初期フレーム
    this.frameInterval = 200; // 追加：アニメ速度（ミリ秒）
    this.el = document.getElementById(id);
    this.init();
  }

  /* ==========================================================================
  // キャラクター描画セットアップ
  ========================================================================== */

  init() {
    if (!this.el) return;
    Object.assign(this.el.style, {
      backgroundImage: `url('${this.imgSrc}')`,
      backgroundSize: `${this.frameCount * 100}% 100%`, // アニメ用シートの幅
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated" // ドット絵をクッキリさせる
    });
    this.startIdle();
  }

  /* ==========================================================================
  待機アニメーション
  ========================================================================== */

  // 待機アニメーション（パラパラ漫画）
  startIdle() {
    this.idleInterval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      const xShift = this.currentFrame * 100;
      this.el.style.backgroundPosition = `${xShift}% 0px`;
    }, this.frameInterval);
  }
}