import { Samurai } from "../characters/players/samurai.js";
import { Peasant } from "../characters/enemies/peasant.js";
import { Shougun } from "../characters/enemies/shougun.js";
import { Ninja } from "../characters/enemies/ninja.js";
import { quizManager } from "./quizManager.js";


const ENEMY_EXTRA_LEVEL_EVERY_N_CORRECT = 0;

export const battleManager = {
  player: null,
  enemy: null,
  bgImages: {},

  ///////////////////////////////////
  //    キャラクター・モンスターの生成
  ///////////////////////////////////
  init() {
    this.clearCharacters();
    this.setupBackgrounds();
    this.player = new Samurai();

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.player.el) {
      actionArea.appendChild(this.player.el);
    }

    this.updateBackground();
    this.enemySpawn();
  },

  ///////////////////////////////////
  //   　　プレイヤーの攻撃
  ///////////////////////////////////
  playerAttack() {
    if (!this.player || !this.enemy) return;
    if (!this.player.el || !this.enemy.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;

    this.player.attack(this.enemy);
    this.checkBattleStatus();
  },


  ///////////////////////////////////
  //         　 敵の攻撃
  ///////////////////////////////////
  enemyAttack() {
    if (!this.enemy || !this.player) return;
    if (!this.enemy.el || !this.player.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;
    if (this.player.hp <= 0) return;

    this.enemy.attack(this.player);
  },


  ///////////////////////////////////
  //       キャラクターリセット
  ///////////////////////////////////
  clearCharacters() {
    if (this.player) this.player.destroy();
    if (this.enemy) this.enemy.destroy();
    this.player = null;
    this.enemy = null;
  },


  ///////////////////////////////////
  //       　　敵の再生成
  ///////////////////////////////////
  enemySpawn() {
    if (this.enemy && this.enemy.el) {
      this.enemy.destroy();
    }

    const enemyTypes = [Peasant, Ninja, Shougun];
    const EnemyClass = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.enemy = new EnemyClass();
    this.scaleEnemyToPlayerLevel(this.enemy);
    this.enemy.refreshStats();

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.enemy.el) {
      this.enemy.el.classList.remove("fade-out");
      actionArea.appendChild(this.enemy.el);
    }
  },


  ///////////////////////////////////
  //          敵のレベルを調整
  ///////////////////////////////////
  scaleEnemyToPlayerLevel(enemy) {
    if (!enemy || !this.player) return;

    const playerLevel = Math.max(1, this.player.level || 1);

    let bonusFromQuiz = 0;
    if (ENEMY_EXTRA_LEVEL_EVERY_N_CORRECT > 0) {
      const correct = window.quizManager?.stageCorrectCount ?? 0;
      bonusFromQuiz = Math.floor(Math.max(0, correct) / ENEMY_EXTRA_LEVEL_EVERY_N_CORRECT);
    }

    const level = Math.max(1, playerLevel + bonusFromQuiz);
    enemy.level = level;
    const hpScale = 1 + (level - 1) * 0.25;
    const statScale = 1 + (level - 1) * 0.15;
    const expScale = 1 + (level - 1) * 0.1;

    enemy.maxHp = Math.floor(enemy.maxHp * hpScale);
    enemy.hp = enemy.maxHp;
    enemy.baseAtk = Math.floor(enemy.baseAtk * statScale);
    enemy.baseDef = Math.floor(enemy.baseDef * statScale);
    enemy.mdf = Math.floor(enemy.mdf * statScale);
    enemy.expReward = Math.floor((enemy.expReward || 5) * expScale);
  },


  ///////////////////////////////////
  //         敵の生存状態を管理
  ///////////////////////////////////
  checkBattleStatus() {
    if (this.enemy && this.enemy.hp <= 0 && !this.enemy.ishandled) {
      this.enemy.ishandled = true;
      this.defeatEnemy();
    }
  },
  

  ///////////////////////////////////
  //       経験値の獲得処理
  ///////////////////////////////////
  defeatEnemy() {
    if (!this.player || !this.enemy) return;

    const exp = this.enemy.expReward || 5;
    this.player.gainExp(exp);

    setTimeout(() => {
      this.enemySpawn();
    }, 1100);
  },


  ///////////////////////////////////
  //  Streakボーナスの更新 (追加)
  ///////////////////////////////////
  updateStreakBonus(streakCount) {
    if (!this.player) return;

    this.refreshStreakDisplay(streakCount);
  // 1. ボーナス倍率を計算 (例: 1コンボにつき 5% アップなら 0.05)
  // streakCountが 2 以上なら 1.1, 1.2... と増えていくイメージ
    const bonus = streakCount >= 2 ? 1.0 + (streakCount * 0.05) : 1.0;
  
    // 2. 攻撃力そのものではなく、「倍率」の変数に代入する
    this.player.streakMultiplier = bonus;

    // 3. バフ状態のフラグ更新
    this.player.hasStreakBonus = (streakCount >= 2);

    // 4. UI更新
    this.player.refreshStats();
    if (typeof refreshPlayerBuffIcons === 'function') {
      refreshPlayerBuffIcons();
    }
  },


  ///////////////////////////////////
  //  Streakボーナスの設定とHTML
  ///////////////////////////////////
  refreshStreakDisplay(streakCount) {
  const actionArea = document.getElementById("actionArea");
  if (!actionArea) return;

  // 既存の表示があれば削除
  let el = document.getElementById("battle-streak");
  if (el) el.remove();

  // 2以上なら新しく作成
  if (streakCount >= 2) {
    const getStreakClass = (s) => {
      if (s >= 30) return 'rainbow';
      if (s >= 20) return 'gold';
      if (s >= 10) return 'red';
      if (s >= 5) return 'blue';
      return 'white';
    };

    el = document.createElement("div");
    el.id = "battle-streak";
    el.className = `streak-display ${getStreakClass(streakCount)}`;
    el.innerHTML = `<div class="streak-number">${streakCount}x</div>`;
    
    actionArea.appendChild(el);
  }
},


///////////////////////////////////
//      背景の準備
///////////////////////////////////
  setupBackgrounds() {
    // 既にあればスキップ
    if (Object.keys(this.bgImages).length > 0) return;

    // 指定の形式で画像を登録
    const bgList = {
      "stage_1": "assets/images/stage_castle.png",
      //"stage_2": "assets/images/stage_bambooGrove.png",
      "stage_3": "assets/images/stage_field.png",
      "stage_4": "assets/images/stage_shrine.png",
    };

    for (const key in bgList) {
      this.bgImages[key] = new Image();
      this.bgImages[key].src = bgList[key];
    }
  },


  ///////////////////////////////////
  //      背景の表示更新
  ///////////////////////////////////
  updateBackground(bgKey = null) {
    // ターゲットを親要素の battleScreen に変更
    const target = document.getElementById("actionArea"); 
    if (!target) return;

    let selectedSrc;
    const keys = Object.keys(this.bgImages);

    if (bgKey && this.bgImages[bgKey]) {
      selectedSrc = this.bgImages[bgKey].src;
    } else if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      selectedSrc = this.bgImages[randomKey].src;
    }

   if (selectedSrc) {
      // 親要素(battleScreen)に背景がついている場合は消去する（念のため）
      const parent = document.getElementById("battleScreen");
      if (parent) parent.style.backgroundImage = "none";

      // actionArea だけに背景を適用
      target.style.backgroundImage = `url('${selectedSrc}')`;
      target.style.backgroundSize = "cover"; 
      target.style.backgroundPosition = "center 25%";
    }
  },
};

window.battleManager = battleManager;
