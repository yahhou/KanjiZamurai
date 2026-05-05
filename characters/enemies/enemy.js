import { Character } from '../../js/characterManager.js';
import { battleManager } from '../../js/battleManager.js';


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
  死んだ時の処理
  ========================================================================== */ 
  die() {
    if(this.isDead) return;
    this.isDead = true;

    super.die();

    battleManager.checkBattleStatus();

    if (this.el) {
      this.el.classList.add("fade-out");

      setTimeout(() => {
        if (this.el) {
          this.el.remove();
          this.el = null;
        }
        if (battleManager.enemy === this) {
          battleManager.enemy = null;
        }
      }, 1000);
    }
  }
}