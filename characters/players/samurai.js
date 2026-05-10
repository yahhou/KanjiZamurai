import { Player } from './player.js';

  export class Samurai extends Player {
    constructor() {
      super({
        id: "player",          
        imgSrc: "assets/images/Samurai-Sheet.png", 
        hp: 25,
        mp: 0,
        atk: 5,
        def: 5,
        mdf: 5,
        eva: 5,
        critRate: 5,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 40,
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

  playAttackAnimation(target, damage, isCritical, isEvaded = false) { // 引数をオブジェクトとダメージに変更
  if (!this.el || !target || !target.el) return;

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
      setTimeout(nextFrame, 400); 
    } 
    else if (frame === 3) {
      // --- 【4枚目】斬撃 ＆ 突進 ---

      // ★ぬるっと動かすための設定 (0.15秒かけて移動)
      this.sprite.style.transition = "transform 0.15s ease-out";

      this.sprite.style.backgroundPosition = `75% 100%`; 
      this.sprite.style.transform = `translateX(${distanceX}px)`;
      
      // ★ここで音を鳴らす！
        this.attackSound.currentTime = 0; // 再生位置をリセット（連続攻撃対策）

      
      if(isCritical){
        this.triggerFlash();
        this.playCriticalHitSE();
      }else{
        this.attackSound.play();
      }

      if (isEvaded && target.showEvadeEffect) {
        target.showEvadeEffect();
      } else if (target.takeDamage) {
        target.takeDamage(damage, isCritical);
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
  

  ////////////////////////////////////////////////
  // 現在のステータスをプレーンなオブジェクトとして書き出す
  ////////////////////////////////////////////////
  exportStatus() {
    return {
      level: this.level,
      hp: this.hp,
      maxHp: this.maxHp,
      exp: this.exp,
      nextExp: this.nextExp,
      baseAtk: this.baseAtk,
      baseDef: this.baseDef,
      // 習得したスキルやバフなども必要ならここに入れる
    };
  }


///////////////////////////////////////
// 保存されたデータからステータスを復元する
///////////////////////////////////////
  importStatus(data) {
    if (!data) return;
    this.level = data.level;
    this.hp = data.hp;
    this.maxHp = data.maxHp;
    this.exp = data.exp;
    this.nextExp = data.nextExp;
    this.baseAtk = data.baseAtk;
    this.baseDef = data.baseDef;
    this.refreshStats(); // UI更新
  }
}
