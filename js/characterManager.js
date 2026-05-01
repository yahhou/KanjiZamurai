

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
    this.activeTimeouts = [];
    this.el = document.getElementById(id);
    this.init();
  }

  /* ==========================================================================
  // キャラクター描画セットアップ
  ========================================================================== */

  init() {
    if (!this.el) return;
    this.hp = this.maxHp;
    this.updateHPBar();
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

  /* ==========================================================================
  HPの処理
  ========================================================================== */
  updateHPBar() {
    const pct = (this.hp / this.maxHp) * 100;

    // キャラクター自身の要素(this.el)の中から、指定したクラス名のバーを探す
    const innerBar = this.el.querySelector('.player-hp-bar-inner');

    if (innerBar) {
      innerBar.style.width = `${pct}%`;

    if (pct < 20) {
      innerBar.style.backgroundColor = "#e74c3c"; // 赤
    } else if (pct < 50) {
      // 50%未満なら黄色（20%以上50%未満）
        innerBar.style.backgroundColor = "#f1c40f";
    } else {
        innerBar.style.backgroundColor = "#2ecc71"; // 緑
      }
    }
  }

  /* ==========================================================================
  攻撃ロジック
  ========================================================================== */
  attack(target) {
    // ダメージ計算（ここで一括管理！）
    const baseDamage = this.atk - Math.floor(target.def / 2);
    const variation = 0.7 + (Math.random() * 0.2);
    const finalDamage = Math.floor(Math.max(1, baseDamage * variation));

    console.log(`${this.name}の攻撃！`);
    target.takeDamage(finalDamage);
  }
  /* ==========================================================================
  ダメージロジック
  ========================================================================== */
  // 共通の被ダメージロジック
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    console.log(`${this.name}は ${amount} のダメージを受けた！残りHP: ${this.hp}`);
    
    this.updateHPBar();
    // ★演出を呼び出す
    this.showDamageEffect(amount);
    if (this.hp <= 0) {
      this.die(); // 0になったら共通の「死亡メソッド」を呼ぶ
    }
  }

  die() {
  // ここは空っぽ、あるいは共通の消滅エフェクトなど
    console.log(`${this.name}は倒れた...`);
  }

/* ==========================================================================
ダメージ数字の演出表示
========================================================================== */
showDamageEffect(amount) {
    if (!this.el) return;

    const damageEl = document.createElement("div");
    damageEl.className = "damage-popup";
    damageEl.innerText = amount;
    this.el.appendChild(damageEl);

    // ★setTimeoutの戻り値（ID）を保存する
    const timeoutId = setTimeout(() => {
      damageEl.remove();
      // 終わったらリストから削除
      this.activeTimeouts = this.activeTimeouts.filter(id => id !== timeoutId);
    }, 2000);

    this.activeTimeouts.push(timeoutId);
  }
/* ==========================================================================
掃除用
========================================================================== */
destroy() {
    // 1. 全てのダメージ表示タイマーをキャンセル
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts = [];

    // 2. 待機アニメーションを止める
    if (this.idleInterval) clearInterval(this.idleInterval);

    // 3. 画面に残っているダメージ数字を物理的に消す
    const popups = this.el.querySelectorAll('.damage-popup');
    popups.forEach(p => p.remove());
  }
}
