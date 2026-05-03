  //他のファイルから Samurai クラスを読み込む
  import { Samurai } from '../characters/players/samurai.js';
  import { Peasant } from '../characters/enemies/peasant.js';
  import { Shougun } from '../characters/enemies/shougun.js';
  import { Ninja } from '../characters/enemies/ninja.js';

  export const battleManager = {
  player: null,
  enemy: null,

  /* ==========================================================================
  プレイヤーと敵を表示
  ========================================================================== */ 

   init() {
    this.clearCharacters();

    this.player = new Samurai();

    const actionArea = document.getElementById('actionArea');
    if (actionArea && this.player.el) {
      actionArea.appendChild(this.player.el);
    }

    this.enemySpawn();
  },

  /* ==========================================================================
  プレイヤー攻撃
  ========================================================================== */ 

  playerAttack() {
     if (!this.player || !this.enemy) return;
    if (!this.player.el || !this.enemy.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;

       this.player.attack(this.enemy);
    this.checkBattleStatus();
  },

  /* ==========================================================================
  敵の攻撃
  ========================================================================== */ 
  
   enemyAttack() {

  if (!this.enemy || !this.player) return;
    if (!this.enemy.el || !this.player.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;
    if (this.player.hp <= 0) return;

    this.enemy.attack(this.player);

  },

  /* ==========================================================================
  clean up
  ========================================================================== */ 

// ★追加：お掃除窓口
  clearCharacters() {
    if (this.player) this.player.destroy();
    if (this.enemy) this.enemy.destroy();
    this.player = null;
    this.enemy = null;
  },
  /* ==========================================================================
  敵のランダムスポーン
  ========================================================================== */ 
  enemySpawn(){
    if (this.enemy && this.enemy.el) {
      this.enemy.destroy();
    }

    const enemyTypes = [Peasant, Ninja, Shougun];
    const RandomEnemy = enemyTypes[Math.floor(Math.random() *  enemyTypes.length)];
    this.enemy = new RandomEnemy();
    this.scaleEnemyToPlayerLevel(this.enemy);
    this.enemy.updateHPBar();

    const actionArea = document.getElementById('actionArea');
      if(actionArea && this.enemy.el) {

        this.enemy.el.classList.remove('fade-out');


      actionArea.appendChild(this.enemy.el);
    }
  },

  /* ==========================================================================
  プレイヤーレベルに合わせた敵強化
  ========================================================================== */ 
  scaleEnemyToPlayerLevel(enemy) {
    if (!enemy || !this.player) return;

    const level = Math.max(1, this.player.level || 1);
    const hpScale = 1 + ((level - 1) * 0.25);
    const statScale = 1 + ((level - 1) * 0.15);
    const expScale = 1 + ((level - 1) * 0.1);

    enemy.maxHp = Math.floor(enemy.maxHp * hpScale);
    enemy.hp = enemy.maxHp;
    enemy.atk = Math.floor(enemy.atk * statScale);
    enemy.def = Math.floor(enemy.def * statScale);
    enemy.mdf = Math.floor(enemy.mdf * statScale);
    enemy.expReward = Math.floor((enemy.expReward || 5) * expScale);
  },
  
  /* ==========================================================================
  生死状態チェック 
  ========================================================================== */ 
  checkBattleStatus(){
    if (this.enemy && this.enemy.hp <= 0 && !this.enemy.ishandled){
      this.enemy.ishandled = true;
      this.defeatEnemy();
    }
  },

  /* ==========================================================================
  敵を倒した時の処理
  ========================================================================== */ 
    defeatEnemy(){
    
      if (this.player && this.enemy) {
      const exp = this.enemy.expReward || 5;
      this.player.gainExp(exp);

      setTimeout(() => {
        this.enemySpawn();
      }, 1100);
    }
  }
}
