

export class Character {
  constructor({ id, imgSrc, hp, mp, atk, def, mdf, eva, critRate, width, height,
              frameCount, sizeRatio, frameInterval, idleFrameCount, idleFrames, deathFrame}) {
    this.id = id;
    this.imgSrc = imgSrc;
    this.hp = hp;
    this.maxHp = hp;
    this.mp = mp;
    this.baseAtk = atk;
    this.weaponMultiplier = 1.0; // ★これを追加（初期値1倍）
    this.atkMultiplier = 1.0;
    this.streakMultiplier = 1.0; // コンボ用（デフォルト1倍）
    
    this.baseDef = def; // ★ 基礎防御力を保存
    this.haoriMultiplier = 1.0;    // ★ 防御アイテム用の倍率を追加
    
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

    this.baseMdf = mdf;
    this.isAttacking = false; // 今攻撃中かどうかのフラグ
    this.isRegenerating = false;// 今リジェネ中かフラグ

    this.activeTimeouts = [];

     this.criticalSound = new Audio('assets/sounds/criticalHit.mp3');
     this.evadeSound = new Audio('assets/sounds/evade1.mp3');

     this.init();  
  }

  ///////////////////////////////////
  //    現在の攻撃力を計算して返す
  ///////////////////////////////////
  get atk() {
  // すべての倍率を掛け算する。
  // baseAtk(基礎) × weapon(武器) × streak(コンボ)
    const totalAtk = this.baseAtk * this.weaponMultiplier * this.streakMultiplier;
  
  // もし計算ミスでNaNになった時のために「|| 0」をつけておくと安全
    return Math.floor(totalAtk) || 0;
  }
  

  ///////////////////////////////////
  //    現在の防御力を計算して返す
  ///////////////////////////////////
  get def() {
    // 基礎防御力 × アイテム倍率
    const totalDef = this.baseDef * this.haoriMultiplier;
    
    // 小数点を切り捨てて返す
    return Math.floor(totalDef) || 0;
  }


  ///////////////////////////////////
  //       キャラクター生成・描画
  ///////////////////////////////////
  init() {
    if (!this.el) return;

    this.sprite = this.el.querySelector('.character-sprite');
    if (!this.sprite) {
      this.sprite = document.createElement('div');
      this.sprite.className = 'character-sprite';
      this.el.appendChild(this.sprite);
    }

    this.hp = this.maxHp;
    this.refreshStats();

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


  ///////////////////////////////////
  //       待機モーション
  ///////////////////////////////////
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


  ///////////////////////////////////
  //       フレームの取得
  ///////////////////////////////////
  setSpriteFrame(frame) {
    if (!this.sprite) return;
    const xShift = this.frameCount <= 1 ? 0 : (frame / (this.frameCount - 1)) * 100;
    this.sprite.style.backgroundPosition = `${xShift}% 0px`;
  }


  ///////////////////////////////////
  //       停止モーション
  ///////////////////////////////////
  stopIdle() {
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }
  

  ///////////////////////////////////
  //       HP等のステータスの処理
  ///////////////////////////////////
  refreshStats() {
  const pct = (this.hp / this.maxHp) * 100;
  // 自分のIDに基づいて、対象のコンテナ（#player-ui か #enemy-ui）を絞り込む
  const uiContainer = document.querySelector(this.id === 'player' ? '#player-ui' : '#enemy-ui');

  if (!uiContainer) return;

  // 1. バーの更新
  const innerBar = uiContainer.querySelector('.hp-bar-inner');
  if (innerBar) {
    innerBar.style.width = `${pct}%`;
    if (pct < 20) innerBar.style.backgroundColor = "#e74c3c";
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
  updateParam('.val-eva', `${this.eva}%`);

  // クリティカル率が定義されていれば表示
  if (this.critRate !== undefined) {
    updateParam('.val-cri', `${this.critRate}%`);
  }
}


  ///////////////////////////////////
  //      攻撃の処理
  ///////////////////////////////////
  attack(target, damageMultiplier = 1) {
    const isEvaded = target.checkEvade(this);
    const { amount, isCritical }= this.calculateDamage(target);
    const adjustedAmount = Math.max(1, Math.floor(amount * damageMultiplier));

    this.playAttackAnimation(target, adjustedAmount, isCritical, isEvaded)
  }


  ///////////////////////////////////
  //      　回避計算
  ///////////////////////////////////
  checkEvade(attacker) {
    const evadeRate = this.eva;

    return Math.random() * 100 < evadeRate;
  }


  ///////////////////////////////////
  //       ダメージの処理
  ///////////////////////////////////
  takeDamage(amount, isCritical = false) {
    this.hp = Math.max(0, this.hp - amount);
    this.refreshStats();

    this.showDamageEffect(amount, isCritical);

    if(this.hp <= 0){
    this.die();
    }
  }


  ///////////////////////////////////
  //       ダメージ計算
  ///////////////////////////////////
  // characterManager.js 内の calculateDamage を改良
calculateDamage(target, customAtk = null) {
  // customAtk が指定されていればそれ（必殺技用など）、なければ通常の計算値
  const currentAtk = customAtk !== null ? customAtk : this.atk;
  
  // 防御力の計算（減算しつつ、最低でも攻撃力の10%は通るように救済）
  let baseDamage = currentAtk - Math.floor(target.def / 2);
  const minDamage = Math.max(1, Math.floor(currentAtk * 0.1)); 
  if (baseDamage < minDamage) {
    baseDamage = minDamage;
  }

  // ダメージの振れ幅 (0.9 ~ 1.1倍)
  const variation = 0.9 + (Math.random() * 0.2); 
  let finalDamage = Math.floor(baseDamage * variation);

  // クリティカル判定（一貫して1.5倍、または1.7倍に統一）
  const isCritical = Math.random() * 100 < this.critRate;
  if (isCritical) {
    finalDamage = Math.floor(finalDamage * 1.5); // 倍率は統一
  }

  return {
    amount: Math.max(1, finalDamage),
    isCritical: isCritical
  };
}


  ///////////////////////////////////
  //      死亡時の処理
  ///////////////////////////////////
  die() {
    this.stopIdle();
  }


  ///////////////////////////////////
  //    ダメージエフェクト表示
  ///////////////////////////////////
  appendDamagePopup(popupEl) {
    const actionArea = document.getElementById("actionArea");
    if (!actionArea || !this.el) {
      this.el?.appendChild(popupEl);
      return;
    }

    const targetRect = this.el.getBoundingClientRect();
    const areaRect = actionArea.getBoundingClientRect();
    popupEl.classList.add("damage-popup--world");
    popupEl.style.left = `${targetRect.left - areaRect.left + targetRect.width / 2}px`;
    popupEl.style.top = `${targetRect.top - areaRect.top + targetRect.height * 0.85}px`;
    actionArea.appendChild(popupEl);
  }

  showDamageEffect(amount, isCritical) {
  if (!this.el) return;

  const damageEl = document.createElement("div");
  damageEl.className = "damage-popup";

  if(isCritical){
    damageEl.classList.add("critical");
    damageEl.innerText = `✨${amount}✨`;

  } else {
    damageEl.innerText = amount;
  }

  this.appendDamagePopup(damageEl);

  const timeoutId = setTimeout(() => {
    damageEl.remove();
    this.activeTimeouts = this.activeTimeouts.filter(id => id !== timeoutId);
  }, 2000);

  this.activeTimeouts.push(timeoutId);
}


  ///////////////////////////////////
  //     回避エフェクト表示
  ///////////////////////////////////
  showEvadeEffect() {
  if (!this.el) return;

  const evadeEl = document.createElement("div");
  evadeEl.className = "damage-popup evade-popup";
  evadeEl.innerText = "MISS";

  this.appendDamagePopup(evadeEl);
  this.playEvadeSE();

  const timeoutId = setTimeout(() => {
    evadeEl.remove();
    this.activeTimeouts = this.activeTimeouts.filter(id => id !== timeoutId);
  }, 1500);

  this.activeTimeouts.push(timeoutId);
}


  ///////////////////////////////////
  //   ダメージエフェクト表示場所指定
  ///////////////////////////////////
  getDamagePopupRoot() {
    if (this.id === 'player') {
      return document.getElementById('player-ui') || this.el;
    }

    if (this.id === 'enemy') {
      return document.getElementById('enemy-ui') || this.el;
    }

    return this.el;
  }


  ///////////////////////////////////
  //    共通攻撃アニメーション
  ///////////////////////////////////
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


  ///////////////////////////////////
  //    敵の攻撃アニメーション
  ///////////////////////////////////
  playEnemyAttackAnimation() {
    this.sprite.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-50px)' }, // グイッと前に出る
      { transform: 'translateX(0)' }
    ], { duration: 150 });
  }


  ///////////////////////////////////
  //       会心の一撃
  ///////////////////////////////////
  triggerFlash() {
    const layer = document.getElementById('flash-layer');
    if(!layer) {return;}
    // クラスを一度消して、付け直すことでアニメーションを再実行
    layer.classList.remove('flash-active');
    void layer.offsetWidth;// おまじない（再描画を強制）
    layer.classList.add('flash-active');
  }


  ///////////////////////////////////
  //    会心の一撃サウンド
  ///////////////////////////////////
  playCriticalHitSE(){
     
     if (this.criticalSound) {
      this.criticalSound.currentTime = 0;
      this.criticalSound.volume = 0.5;
      this.criticalSound.play();
    }
  }


  ///////////////////////////////////
  //    回避サウンド
  ///////////////////////////////////
  playEvadeSE(){
     
     if (this.evadeSound) {
      this.evadeSound.currentTime = 0;
      this.evadeSound.play();

   }
  }


  ///////////////////////////////////
  //    リジェネ効果発動
  ///////////////////////////////////
  applyRegeneration() {  

    if (!this.isRegenerating) return;

    const heal = Math.max(1, Math.floor(this.maxHp * 0.05));
    this.hp = Math.min(this.maxHp, this.hp + heal);
    this.refreshStats();
  }


  ///////////////////////////////////
  //    　　　消去処理
  ///////////////////////////////////
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
