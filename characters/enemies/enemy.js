import { Character } from '../../js/characterManager.js';

export class Enemy extends Character {
     constructor(config) {
    super(config);
    // プレイヤー共通の初期化（例：現在のレベルなど）
      this.level = 1;
    }
  
    die() {
      super.die();
      console.log("敵を倒した！勝利演出へ");
    // ここで quizManager.victory() などを呼ぶ
}
}