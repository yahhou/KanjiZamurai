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
        frameCount: 7,
        deathFrame: 4,
        idleFrameCount: 2,
      });
      this.name = "Samurai";
      // 効果音の設定
      this.attackSound = new Audio('assets/sounds/attack1.mp3');
      }
   

  // フレーム番号から背景位置を計算するヘルパー（ズレ防止）
  getFramePos(frameIndex) {
    const totalFrames = 7; 
    return `${(frameIndex / (totalFrames - 1)) * 100}% 100%`;
  }

  /* ==========================================================================
  通常攻撃
  ========================================================================== */ 
  /* ==========================================================================
  通常攻撃 (修正版)
  ========================================================================== */
  playAttackAnimation(target, damage, isCritical, isEvaded = false) {
    if (!this.el || !target || !target.el) return;
    this.isAttacking = true;
    this.stopIdle();

    const targetRect = target.el.getBoundingClientRect();
    const selfRect = this.el.getBoundingClientRect();
    const distanceX = (targetRect.left - selfRect.left) * 0.7;

    // --- ステップ1: 構え (フレーム2) ---
    this.sprite.style.backgroundPosition = this.getFramePos(2);

    setTimeout(() => {
      // --- ステップ2: 斬撃＆突進 (フレーム3) ---
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

      // --- ステップ3: 帰還 ---
      setTimeout(() => {
        this.sprite.style.transition = "none";
        this.sprite.style.transform = `translateX(0px)`;
        this.isAttacking = false;
        this.startIdle();
      }, 400);
    }, 300);
  }

  /* ==========================================================================
  必殺技: 三連正解時 (フレーム5, 6を使用)
  ========================================================================== */
  playFinishingMove(target, damage) {
    if (!this.el || !target || !target.el) return;
    this.isAttacking = true;
    this.stopIdle();

    const targetRect = target.el.getBoundingClientRect();
    const selfRect = this.el.getBoundingClientRect();
    const distanceX = (targetRect.left - selfRect.left) * 0.8;

    // 1. 空中モーションへ (フレーム5)
    this.sprite.style.transition = "transform 0.2s ease-out";
    this.sprite.style.backgroundPosition = this.getFramePos(5);
    this.sprite.style.transform = `translate(${distanceX * 0.5}px, -40px)`; 

    setTimeout(() => {
      // 2. 急降下攻撃 (フレーム6)
      this.sprite.style.transition = "transform 0.1s ease-in";
      this.sprite.style.backgroundPosition = this.getFramePos(6);
      this.sprite.style.transform = `translate(${distanceX}px, 0px)`; 

      this.triggerFlash();
      this.playCriticalHitSE();
      
      if (target.takeDamage) {
        target.takeDamage(damage * 1.5, true);
      }

      // 3. 元の場所へ一瞬で戻り、待機モーションを開始
      setTimeout(() => {
        // 位置を即座にリセット
        this.sprite.style.transition = "none";
        this.sprite.style.transform = "translate(0px, 0px)";
        
        // --- ここが重要：戻ると同時に見た目を待機に戻す ---
        this.isAttacking = false; 
        this.sprite.style.backgroundPosition = this.getFramePos(0); // 最初のフレームに強制セット
        this.startIdle(); // 待機アニメーション（0と1のループ）を再開
        
      }, 400); // 攻撃ポーズ（フレーム6）を見せる時間
    }, 400);
  }
}