import { Player } from './player.js';

  export class Samurai extends Player {
    constructor() {
      super({
        id: "player",          
        imgSrc: "assets/images/Samurai-Sheet.png", 
        hp: 20,
        mp: 0,
        atk: 10,
        def: 5,
        mdf: 5,
        spd: 5,
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

  playAttackAnimation(target, damage) { // 引数をオブジェクトとダメージに変更
  this.isAttacking = true;
  this.stopIdle();

  // ★ここで target.el を使うことでエラーを回避
  const targetEl = target.el; 
  const selfRect = this.el.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const distanceX = targetRect.left - selfRect.left - 50; 
  // 手入力で管理しやすいように、開始フレームを3枚目の「2」にする
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
      this.sprite.style.backgroundPosition = `75% 100%`; 
      this.sprite.style.transform = `translateX(${distanceX}px)`;
      
      // ★ここで音を鳴らす！
        this.attackSound.currentTime = 0; // 再生位置をリセット（連続攻撃対策）
        this.attackSound.play();

      if (target.takeDamage) {
        target.takeDamage(damage);
      }

      // 突っ込んだあと、元の位置に戻るタイミング
      setTimeout(() => {
        this.sprite.style.transform = `translateX(0px)`;
        frame = 999; // 2枚（2と3）以外なら何でもOK。終了フラグへ
        nextFrame();
      }, 150);
    } 
    else {
      // --- 終了（待機に戻る） ---
      this.isAttacking = false;
      this.startIdle(); // ここで自動的に待機フレーム（0〜1）のループに戻ります
    }
  };
  // ★これを忘れていました！（アニメーションの起動スイッチ）
    nextFrame();
}
}