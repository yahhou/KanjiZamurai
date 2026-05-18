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
      width: 80,  
      height: 80,  
      sizeRatio: 45,
      frameCount: 9,
      deathFrame: 4,
      idleFrameCount: 2,
    });
    this.name = "Samurai";
    this.attackSound = new Audio('assets/sounds/attack1.mp3');
  }

  getFramePos(frameIndex) {
    const totalFrames = 9; 
    return `${(frameIndex / (totalFrames - 1)) * 100}% 100%`;
  }

  /* ==========================================================================
  通常攻撃
  ========================================================================== */
  playAttackAnimation(target, damage, isCritical, isEvaded = false) {
    if (!this.el || !target || !target.el) return;
    this.isAttacking = true;
    this.stopIdle();

    const targetRect = target.el.getBoundingClientRect();
    const selfRect = this.el.getBoundingClientRect();
    const distanceX = (targetRect.left - selfRect.left) * 0.8;

    this.sprite.style.backgroundPosition = this.getFramePos(2);

    setTimeout(() => {
      this.sprite.style.transition = "transform 0.1s ease-out";
      this.sprite.style.backgroundPosition = this.getFramePos(3);
      this.sprite.style.transform = `translateX(${distanceX}px)`;

      this.attackSound.currentTime = 0;
      if (isCritical) {
        this.triggerFlash();
        this.playCriticalHitSE();
      } else {
        this.attackSound.play();
      }

      if (isEvaded) {
        target.showEvadeEffect?.();
      } else {
        target.takeDamage?.(damage, isCritical);
      }

      setTimeout(() => {
        this.sprite.style.transition = "none";
        this.sprite.style.backgroundPosition = this.getFramePos(1); 
        this.sprite.style.transform = `translateX(0px)`;
        this.isAttacking = false;
        this.startIdle();
      }, 400);
    }, 300);
  }

  /* ==========================================================================
  必殺技コントロール（コンボ数による出し分け）
  ========================================================================== */
  playUltimateFinishingMove(target) {
    if (!this.el || !target || !target.el) return;

    const currentCombo = window.battleManager?.comboCount || 3;
    
    // ① 9連続以上：3撃の必殺（フレーム5 -> 6 -> 7 -> 8）
    if (currentCombo >= 9) {
      this.play9ComboUltimate(target);
      return;
    }

    // ② 6連続以上：2撃の必殺（フレーム5 -> 6 -> 7）
    if (currentCombo >= 6) {
      this.play6ComboUltimate(target);
      return;
    }

    // ③ 3連続以上：1撃の必殺（フレーム5 -> 6）
    this.play3ComboUltimate(target);
  }

  applyComboHit(target, damageMultiplier = 1) {
    if (!target || target.hp <= 0 || target.isDead) return;

    const { amount, isCritical } = this.calculateDamage(target);
    const damage = Math.max(1, Math.floor(amount * damageMultiplier));

    if (isCritical) {
      this.triggerFlash();
      this.playCriticalHitSE();
    } else {
      this.attackSound.currentTime = 0;
      this.attackSound.play();
    }

    target.takeDamage?.(damage, isCritical);
  }

  /* ==========================================================================
  1. 通常の必殺技: 三連続以上 (1撃)
  ========================================================================== */
  play3ComboUltimate(target) {
    this.isAttacking = true;
    this.stopIdle();

    const distanceX = (target.el.getBoundingClientRect().left - this.el.getBoundingClientRect().left) * 0.8;

    // 空中モーションへ (フレーム5)
    this.sprite.style.transition = "transform 0.2s ease-out";
    this.sprite.style.backgroundPosition = this.getFramePos(5);
    this.sprite.style.transform = `translateX(${distanceX * 0.8}px)`;

    setTimeout(() => {
      // 1撃目：急降下攻撃をして終了 (フレーム6)
      this.sprite.style.transition = "transform 0.1s ease-in";
      this.sprite.style.backgroundPosition = this.getFramePos(6);
      this.sprite.style.transform = `translateX(${distanceX}px)`;

      this.applyComboHit(target, 1.5);

      // 元の位置に戻る
      setTimeout(() => {
        this.resetToIdle();
      }, 400);
    }, 400);
  }

  /* ==========================================================================
  2. 超必殺技: 六連続以上 (2撃)
  ========================================================================== */
  play6ComboUltimate(target) {
    this.isAttacking = true;
    this.stopIdle();

    const distanceX = (target.el.getBoundingClientRect().left - this.el.getBoundingClientRect().left) * 0.8;

    // 空中モーションへ (フレーム5)
    this.sprite.style.transition = "transform 0.2s ease-out";
    this.sprite.style.backgroundPosition = this.getFramePos(5);
    this.sprite.style.transform = `translateX(${distanceX * 0.8}px)`;; 

    setTimeout(() => {
      // 1撃目：急降下攻撃 (フレーム6)
      this.sprite.style.transition = "transform 0.1s ease-in";
      this.sprite.style.backgroundPosition = this.getFramePos(6);
      this.sprite.style.transform = `translateX(${distanceX}px)`;

      this.applyComboHit(target);

      // 2撃目：追加の斬撃 (フレーム7)
      setTimeout(() => {
        this.sprite.style.backgroundPosition = this.getFramePos(7); 

        this.applyComboHit(target);

        // 元の場所へ戻る
        setTimeout(() => {
          this.resetToIdle();
        }, 400);
      }, 300);
    }, 400);
  }

   /* ==========================================================================
  3. 超必殺技(極): 九連続以上 (高速三連斬り)
========================================================================== */
play9ComboUltimate(target) {
  this.isAttacking = true;
  this.stopIdle();

  const distanceX =
    (target.el.getBoundingClientRect().left -
      this.el.getBoundingClientRect().left) * 0.9;

  // 接近 + 構え (5)
  this.sprite.style.transition = "transform 0.3s ease-out";
  this.sprite.style.backgroundPosition = this.getFramePos(5);
  this.sprite.style.transform = `translateX(${distanceX * 0.8}px)`;; 

  setTimeout(() => {

    // 1撃目 (6)
    this.sprite.style.backgroundPosition = this.getFramePos(6);

    this.applyComboHit(target);

    setTimeout(() => {

      // 2撃目 (7)
      this.sprite.style.backgroundPosition = this.getFramePos(7);

      this.applyComboHit(target);

      setTimeout(() => {

        // 最後の斬り (3)
        this.sprite.style.backgroundPosition = this.getFramePos(3);
        this.sprite.style.transform = `translateX(${distanceX * 0.8}px)`;; 

        this.applyComboHit(target);

        // 終了
        setTimeout(() => {
          this.resetToIdle();
        }, 300);

      }, 250);

    }, 250);

  }, 500);
}

  /* ==========================================================================
  共通ヘルパー: 待機状態への強制リセット
  ========================================================================== */
  resetToIdle() {
    this.sprite.style.transition = "none";
    this.sprite.style.transform = "translate(0px, 0px)";
    this.isAttacking = false; 
    this.sprite.style.backgroundPosition = this.getFramePos(0); 
    this.startIdle(); 
  }
}
