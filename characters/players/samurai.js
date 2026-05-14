import { Player } from './player.js';

  export class Samurai extends Player {
    constructor() {
      super({
        id: "player",          
        imgSrc: "assets/images/Samurai-Sheet.png", 
        hp: 25,
        mp: 0,
        atk: 10,
        def: 5,
        mdf: 5,
        eva: 5,
        critRate: 5,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 45,
        frameCount: 5,
        deathFrame: 4,
        idleFrameCount: 2,
      });
      this.name = "Samurai";
      // 効果音の設定
      this.attackSound = new Audio('assets/sounds/attack1.mp3');
      }
   
  /* ==========================================================================
  通常攻撃
  ========================================================================== */ 
  playAttackAnimation(target, damage, isCritical, isEvaded = false) {
  if (!this.el || !target || !target.el) return;

  this.isAttacking = true;
  this.stopIdle();

  const targetEl = target.el;
  const targetRect = targetEl.getBoundingClientRect();
  const selfRect = this.el.getBoundingClientRect();

  // 1. 自分と敵の純粋な距離（中心点どうしの差など）を計算
  const fullDistance = targetRect.left - selfRect.left;

  // 2. 「距離の90%」だけ移動するように設定（＝10%手前で止まる）
  // 敵が左にいる場合でも、この掛け算なら正しく計算されます
  const distanceX = fullDistance * 0.7;

  let frame = 2;

  const nextFrame = () => {
    if (frame === 2) {
      // --- 【3枚目】構え ---
      this.sprite.style.backgroundPosition = `50% 100%`;
      frame = 3;
      setTimeout(nextFrame, 300);
    } 
    else if (frame === 3) {
      // --- 【4枚目】斬撃 ＆ 突進 ---
      this.sprite.style.transition = "transform 0.1s ease-out"; // 突進速度
      this.sprite.style.backgroundPosition = `75% 100%`;
      this.sprite.style.transform = `translateX(${distanceX}px)`;

      this.attackSound.currentTime = 0;
      if (isCritical) {
        this.triggerFlash();
        this.playCriticalHitSE();
      } else {
        this.attackSound.play();
      }

      if (isEvaded && target.showEvadeEffect) {
        target.showEvadeEffect();
      } else if (target.takeDamage) {
        target.takeDamage(damage, isCritical);
      }

      // 突っ込んだあと、元の位置に戻るタイミング
      setTimeout(() => {
        // --- 修正点 ---
        this.sprite.style.transition = "none"; // 一瞬で戻る
        this.sprite.style.transform = `translateX(0px)`;
        this.sprite.style.backgroundPosition = `50% 100%`; // 3枚目の座標に切り替え
        
        frame = 999; 
        nextFrame();
      }, 400); // 停止時間（お好みで調整）
    } 
    else {
      this.isAttacking = false;
      this.startIdle();
    }
  };

  nextFrame();
  }
}
