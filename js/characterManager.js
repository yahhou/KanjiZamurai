

export class Character {
  constructor({ id, imgSrc, hp, mp, atk, def, mdf, eva, critRate, width, height,
              frameCount, sizeRatio, frameInterval, idleFrameCount, idleFrames, deathFrame}) {
    this.id = id;
    this.imgSrc = imgSrc;
    this.hp = hp;
    this.maxHp = hp;
    this.mp = mp;
    this.atk = atk;
    this.def = def;
    this.mdf = mdf;
    this.eva = eva;
    this.critRate = critRate || 5;
    this.width = width || 80;  // デフォルト値
    this.height = height || 80; // デフォルト値
    this.frameCount = frameCount;
    this.sizeRatio = sizeRatio || 50;
    this.currentFrame = 0; // 追加：初期フレーム
    this.frameInterval = frameInterval || 500; // アニメ速度（ミリ秒）
    this.idleFrameCount = idleFrameCount || frameCount;
    this.idleFrames = idleFrames || null;
    this.idleFrameIndex = 0;
    this.deathFrame = deathFrame || 0;
    this.hpBarCreated = false; // ★追加

    this.el = document.createElement('div');
    this.el.id = id;
    this.el.className = 'character-container';

    this.init();  
    this.baseAtk = atk;
    this.isAttacking = false; // 今攻撃中かどうかのフラグ
    this.isRegenerating = false;// 今リジェネ中かフラグ

    this.activeTimeouts = [];

     this.criticalSound = new Audio('assets/sounds/criticalHit.mp3');
     this.evadeSound = new Audio('assets/sounds/evade1.mp3');
  }

  /* ==========================================================================
  // キャラクター描画セットアップ
  ========================================================================== */

  init() {
    if (!this.el) return;

    this.sprite = this.el.querySelector('.character-sprite');
    if (!this.sprite) {
      this.sprite = document.createElement('div');
      this.sprite.className = 'character-sprite';
      this.el.appendChild(this.sprite);
    }

    this.hp = this.maxHp;
    this.updateHPBar();

    const displaySize = `${this.sizeRatio}cqw`;
    Object.assign(this.el.style, {
      width: displaySize,
      height: displaySize,
      position: "absolute",
      opacity: "1",
      display: "block",
      visibility: "visible"
    });

    Object.assign(this.sprite.style, {
      width: "100%",
      height: "100%",
      backgroundImage: `url('${this.imgSrc}')`,
      backgroundSize: `${this.frameCount * 100}% 100%`,
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
      backgroundPosition: "0% 0px"
    });

    this.startIdle();
  }


  /* ==========================================================================
  待機アニメーション
  ========================================================================== */
  
  startIdle() {
  // 待機アニメーション（パラパラ漫画）
  if (this.idleInterval) clearInterval(this.idleInterval);
  this.idleFrameIndex = 0;
  if (this.idleFrames) {
    this.currentFrame = this.idleFrames[this.idleFrameIndex];
    this.setSpriteFrame(this.currentFrame);
  }
  
  this.idleInterval = setInterval(() => {
    if (this.idleFrames) {
      this.idleFrameIndex = (this.idleFrameIndex + 1) % this.idleFrames.length;
      this.currentFrame = this.idleFrames[this.idleFrameIndex];
    } else {
      this.currentFrame = (this.currentFrame + 1) % this.idleFrameCount;
    }
    this.setSpriteFrame(this.currentFrame);
    },
    this.frameInterval); 

    
  }

  setSpriteFrame(frame) {
    if (!this.sprite) return;
    const xShift = this.frameCount <= 1 ? 0 : (frame / (this.frameCount - 1)) * 100;
    this.sprite.style.backgroundPosition = `${xShift}% 0px`;
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
   /* Characterクラス内の updateHPBar */
updateHPBar() {
  const pct = (this.hp / this.maxHp) * 100;
  // 自分のIDに基づいて、対象のコンテナ（#player-ui か #enemy-ui）を絞り込む
  const uiContainer = document.querySelector(this.id === 'player' ? '#player-ui' : '#enemy-ui');

  if (!uiContainer) return;

  // 1. バーの更新
  const innerBar = uiContainer.querySelector('.hp-bar-inner');
  if (innerBar) {
    innerBar.style.width = `${pct}%`;
    if (pct < 20) innerBar.style.backgroundColor = "#e74c3c";
    else if (pct < 50) innerBar.style.backgroundColor = "#f1c40f";
    else innerBar.style.backgroundColor = "#2ecc71";
  }

  // 2. テキストの更新（HP）
  const hpText = uiContainer.querySelector('.hp-text');
  if (hpText) {
    hpText.innerText = `${Math.ceil(this.hp)} / ${this.maxHp}`;
  }

  // 2b. レベル表示（プレイヤー・敵とも this.level を反映）
  const levelText = uiContainer.querySelector('.level-text');
  if (levelText != null && this.level != null) {
    levelText.textContent = `Lv.${this.level}`;
  }

  // 3. パラメータの更新 (重要：uiContainer内から探す)
  const updateParam = (cls, val) => {
    // 自分のUI（#player-ui等）の中から、そのクラスを持つ要素を探す
    const el = uiContainer.querySelector(cls);
    if (el) el.innerText = val;
  };

  updateParam('.val-atk', this.atk);
  updateParam('.val-def', this.def);
  updateParam('.val-mdf', this.mdf);
  updateParam('.val-eva', this.eva);
  // クリティカル率が定義されていれば表示
  if (this.critRate !== undefined) {
    updateParam('.val-cri', `${this.critRate}%`);
  }
}
  /* ==========================================================================
  攻撃ロジック
  ========================================================================== */
  attack(target) {
    const isEvaded = target.checkEvade(this);
    const { amount, isCritical }= this.calculateDamage(target);

    this.playAttackAnimation(target, amount, isCritical, isEvaded)
  }

  /* ==========================================================================
  回避判定
  ========================================================================== */
  checkEvade(attacker) {
    const evaDiff = this.eva - attacker.eva;
    const evadeRate = Math.min(35, Math.max(5, 10 + (evaDiff * 0.3)));

    return Math.random() * 100 < evadeRate;
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
  } else {
    damageEl.innerText = amount;
  }

  this.el.appendChild(damageEl);  // ← 修正: getDamagePopupRoot() から this.el に変更

  const timeoutId = setTimeout(() => {
    damageEl.remove();
    this.activeTimeouts = this.activeTimeouts.filter(id => id !== timeoutId);
  }, 2000);

  this.activeTimeouts.push(timeoutId);
}

/* ==========================================================================
　　回避時の表示
========================================================================== */

  showEvadeEffect() {
  if (!this.el) return;

  const evadeEl = document.createElement("div");
  evadeEl.className = "damage-popup evade-popup";
  evadeEl.innerText = "MISS";

  this.el.appendChild(evadeEl);  // ← 修正: getDamagePopupRoot() から this.el に変更
  this.playEvadeSE();

  const timeoutId = setTimeout(() => {
    evadeEl.remove();
    this.activeTimeouts = this.activeTimeouts.filter(id => id !== timeoutId);
  }, 1500);

  this.activeTimeouts.push(timeoutId);
}


/* ==========================================================================
　　ダメージ表示の場所指定
========================================================================== */

  getDamagePopupRoot() {
    if (this.id === 'player') {
      return document.getElementById('player-ui') || this.el;
    }

    if (this.id === 'enemy') {
      return document.getElementById('enemy-ui') || this.el;
    }

    return this.el;
  }

/* ==========================================================================
  共通攻撃アニメーション
========================================================================== */
playAttackAnimation(target, damage, isCritical, isEvaded = false) {
  this.isAttacking = true;

  if (isCritical){
    this.triggerFlash();
    this.playCriticalHitSE();
  }else{
     this.playAttackSE();
  }
    
    this.playEnemyAttackAnimation();
    if (isEvaded) {
      target.showEvadeEffect();
    } else {
      target.takeDamage(damage, isCritical);
    }

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
      return;
}
 // クラスを一度消して、付け直すことでアニメーションを再実行
 layer.classList.remove('flash-active');
 void layer.offsetWidth;// おまじない（再描画を強制）
 layer.classList.add('flash-active');
}

/* ==========================================================================
サウンドエフェクト
========================================================================== */
playCriticalHitSE(){
     
     if (this.criticalSound) {
      this.criticalSound.currentTime = 0;
      this.criticalSound.volume = 0.5;
      this.criticalSound.play();

   }
  }

playEvadeSE(){
     
     if (this.evadeSound) {
      this.evadeSound.currentTime = 0;
      this.evadeSound.play();

   }
  }

/* ==========================================================================
// 自動回復
========================================================================== */
  applyRegeneration() {  

    if (!this.isRegenerating) return;

    const heal = Math.max(1, Math.floor(this.maxHp * 0.05));
    this.hp = Math.min(this.maxHp, this.hp + heal);
    this.updateHPBar();
  }

/* ==========================================================================
掃除用
========================================================================== */
destroy() {
    // 1. 全てのダメージ表示タイマーをキャンセル
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts = []
    if(this.idleInterval) clearInterval(this.idleInterval);

    if(this.el && this.el.parentNode){
      this.el.parentNode.removeChild(this.el);
    }
  }
}
