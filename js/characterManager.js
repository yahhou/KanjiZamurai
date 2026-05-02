

export class Character {
  constructor({ id, imgSrc, hp, mp, atk, def, mdf, spd, critRate, width, height,
              frameCount, sizeRatio,idleFrameCount, deathFrame}) {
    this.id = id;
    this.imgSrc = imgSrc;
    this.hp = hp;
    this.maxHp = hp;
    this.mp = mp;
    this.atk = atk;
    this.def = def;
    this.mdf = mdf;
    this.spd = spd;
    this.critRate = critRate || 5;
    this.width = width || 80;  // デフォルト値
    this.height = height || 80; // デフォルト値
    this.frameCount = frameCount;
    this.sizeRatio = sizeRatio || 50;
    this.currentFrame = 0; // 追加：初期フレーム
    this.frameInterval = 500; // 追加：アニメ速度（ミリ秒）
    this.idleFrameCount = idleFrameCount || frameCount;
    this.deathFrame = deathFrame || 0;

    this.el = document.getElementById(id);
    if (!this.el) return; // 要素がない場合は中断
    
    this.sprite = document.createElement('div');
    this.sprite.className = 'character-sprite';
    this.el.appendChild(this.sprite); // 親要素の中に入れる

    this.init();
    this.isAttacking = false; // 今攻撃中かどうかのフラグ
    this.activeTimeouts = [];

     this.criticalSound = new Audio('assets/sounds/criticalHit.mp3');
  }

  /* ==========================================================================
  // キャラクター描画セットアップ
  ========================================================================== */

  init() {
    if (!this.el) return;
    this.el.innerHTML = "";

    // --- 再びスプライトとHPバーを作成して入れ直す ---
    this.sprite = document.createElement('div');
    this.sprite.className = 'character-sprite';
    this.el.appendChild(this.sprite);

    // HPバーのコンテナ作成（ここも init の中で行うと確実です）
    const hpCont = document.createElement('div');
    hpCont.className = 'player-hp-bar-container';
    hpCont.innerHTML = `<div class="player-hp-bar-inner"></div>`;
    this.el.appendChild(hpCont);
    // --------------------------------------------------

    this.hp = this.maxHp;
    this.updateHPBar();

    const displaySize = `${this.sizeRatio}cqw`;

    // 親(this.el)の設定：サイズと位置だけ決める
    Object.assign(this.el.style, {
      width: displaySize,
      height: displaySize,
      position: "absolute" // 絶対配置を確実にする
      });

      // 子(this.sprite)の設定：見た目（画像）をこっちに引っ越し！
      Object.assign(this.sprite.style, {
      width: "100%",
      height: "100%",
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
    this.sprite.style.backgroundPosition = `${xShift}% 0px`;
    },
    this.frameInterval); 

    
  }

  /* ==========================================================================
　　停止アニメーション
  ========================================================================== */
  
  stopIdle() {
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
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
    
    const { amount, isCritical }= this.calculateDamage(target);

    this.playAttackAnimation(target, amount, isCritical)
  }
   /* ==========================================================================
  ダメージを受ける
  ========================================================================== */

  takeDamage(amount, isCritical = false) {
    this.hp = Math.max(0, this.hp - amount);
    this.updateHPBar();

    this.showDamageEffect(amount, isCritical);

    if(this.hp <= 0){
    this.die();
    }
  }

  /* ==========================================================================
  ダメージ計算(会心の一撃含む)
  ========================================================================== */
  // 共通の被ダメージロジック
  calculateDamage(target) {
    const baseDamage = this.atk - Math.floor(target.def / 2);
    const variation = 0.7 + (Math.random() * 0.2); 
    let finalDamage = Math.floor(Math.max(1, baseDamage * variation));

    const isCritical = Math.random() * 100 < this.critRate;

    if(isCritical){

      finalDamage = Math.floor(finalDamage * 1.7);
    }
  return{
    amount: finalDamage,
    isCritical: isCritical
  };

  }
  /* ==========================================================================
   死亡
  ========================================================================== */

  die() {
    this.stopIdle();
  }

/* ==========================================================================
　　ダメージ数字の演出表示
========================================================================== */
  showDamageEffect(amount, isCritical) {
    if (!this.el) return;

    const damageEl = document.createElement("div");
    damageEl.className = "damage-popup";

    if(isCritical){

      damageEl.classList.add("critical");
      damageEl.innerText = `✨${amount}✨`;
      this.playCriticalHitSE();
      if(isCritical) this.triggerFlash();
       
    }else {
      damageEl.innerText = amount; // 通常時も数字を出す
    }
  
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
  共通攻撃アニメーション
========================================================================== */
playAttackAnimation(target, damage, isCritical) {
  this.isAttacking = true;

  if (isCritical){
    console.log(`%c💀 敵の会心の一撃！ ダメージ: ${damage}`, "color: #8e44ad; font-weight: bold;");
    this.triggerFlash();
    this.playCriticalHitSE();
  }else{
     this.playAttackSE();
  }
    
    this.playEnemyAttackAnimation();
    target.takeDamage(damage, isCritical); // これで動く

    setTimeout(() => {
      this.isAttacking = false;
    }, 150);
  }

/* ==========================================================================
 攻撃アニメーションがないキャラ（敵）
========================================================================== */

playEnemyAttackAnimation() {
    this.sprite.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-50px)' }, // グイッと前に出る
      { transform: 'translateX(0)' }
    ], { duration: 150 });
  }
/* ==========================================================================
　　会心の一撃
========================================================================== */
triggerFlash() {
 const layer = document.getElementById('flash-layer');
 if(!layer) {
  console.error("flash-layerが}見つかりません。HTMLにIDがあるか確認してください。");
    return;
}
 // クラスを一度消して、付け直すことでアニメーションを再実行
 layer.classList.remove('flash-active');
 void layer.offsetWidth;// おまじない（再描画を強制）
 layer.classList.add('flash-active');

console.log("✨ 画面フラッシュ実行"); // これでコンソールでも確認可能
}

/* ==========================================================================
クリティカルヒットサウンド
========================================================================== */
playCriticalHitSE(){
     
     if (this.criticalSound) {
      this.criticalSound.currentTime = 0;
      this.criticalSound.play();

   }
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
