  //他のファイルから Samurai クラスを読み込む
  import { Samurai } from '../characters/players/samurai.js';
  import { Peasant } from '../characters/enemies/peasant.js';


  export const battleManager = {
  player: null,
  enemy: null,

  /* ==========================================================================
  プレイヤーと敵を表示
  ========================================================================== */ 

  init() {
    this.clearCharacters();
    this.player = new Samurai(); 
    this.enemy = new Peasant();
  // 敵のHPバーはどこにも appendChild しなければ画面に出ない
  },

   /* ==========================================================================
  プレイヤー攻撃
  ========================================================================== */ 

  playerAttack() {
    if (this.player && this.enemy) {
   this.player.attack(this.enemy);
  }},

  /* ==========================================================================
  敵の攻撃
  ========================================================================== */ 

  enemyAttack() {
    if (this.enemy && this.player) {
    this.enemy.attack(this.player);
    }
  },

// ★追加：お掃除窓口
  clearCharacters() {
    if (this.player) this.player.destroy();
    if (this.enemy) this.enemy.destroy();
    this.player = null;
    this.enemy = null;

}
}