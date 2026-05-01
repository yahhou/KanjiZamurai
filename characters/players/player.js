import { Character } from '../../js/characterManager.js';
import { gameManager } from '../../js/gameManager.js';

export class Player extends Character {
  constructor(config) {
    super(config);
    // プレイヤー共通の初期化（例：現在のレベルなど）
    this.level = 1;
  }

  /* ==========================================================================
  死亡
  ========================================================================== */ 
  die() {
    super.die(); // 親クラスの「倒れた...」ログも一応出す
    // 2. プレイヤー専用：死亡フレームに切り替える
    if (this.deathFrame !== undefined) {
    const xShift = (this.deathFrame / (this.frameCount - 1)) * 100;
    this.sprite.style.backgroundPosition = `${xShift}% 0px`;
    }
    setTimeout(() => {
      gameManager.handleGameOver();
    }, 800);
  }
}