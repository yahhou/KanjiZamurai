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
    // ここでさっき作った子クラスを呼び出す
    this.player = new Samurai(); 
    this.enemy = new Peasant();
  }
}