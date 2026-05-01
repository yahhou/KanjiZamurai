import { Character } from '../../js/characterManager.js';

export class Enemy extends Character {
    constructor(config) {
    super(config);

    this.attackSound1 = new Audio('assets/sounds/enemyAttack1.mp3');
    // プレイヤー共通の初期化（例：現在のレベルなど）
    this.level = 1;
  }

  /* ==========================================================================
  敵の攻撃音１
  ========================================================================== */ 
  
  playAttackSE(){
    // 攻撃アニメーションの関数内
    if (this.attackSound1) {
      this.attackSound1.currentTime = 0;
      this.attackSound1.play();
    }
  }

  /* ==========================================================================
  死亡
  ========================================================================== */ 
 
    die() {
      super.die();
      console.log("敵を倒した！勝利演出へ");
    // ここで quizManager.victory() などを呼ぶ
}
}