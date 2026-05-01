import { Character } from '../../js/characterManager.js';
import { gameManager } from '../../js/gameManager.js';

export class Player extends Character {
  constructor(config) {
    super(config);
    // プレイヤー共通の初期化（例：現在のレベルなど）
    this.level = 1;
  }
  die() {
    super.die(); // 親クラスの「倒れた...」ログも一応出す
    console.log("ゲームオーバー画面へ移行します");
    gameManager.handleGameOver();
  }
}