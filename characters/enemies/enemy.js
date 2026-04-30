import { Character } from '../../js/characterManager.js';

export class Enemy extends Character {
     constructor(config) {
    super(config);
    // プレイヤー共通の初期化（例：現在のレベルなど）
    this.level = 1;
  }

  // 攻撃メソッド
  attack(target) {
    console.log(`${this.name}の攻撃！`);
    const damage = Math.max(1, this.atk - target.def);
    target.takeDamage(damage);
  }

  // ダメージを受ける処理（Characterに入れてもOK）
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
    console.log(`${this.name}は${amount}のダメージを受けた！残りHP: ${this.hp}`);
    // ここでHPバーの更新などを呼ぶと便利
  }
}