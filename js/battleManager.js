import { Samurai } from "../characters/players/samurai.js";
import { Peasant } from "../characters/enemies/peasant.js";
import { Shougun } from "../characters/enemies/shougun.js";
import { Ninja } from "../characters/enemies/ninja.js";
import { quizManager } from "./quizManager.js";


const ENEMY_EXTRA_LEVEL_EVERY_N_CORRECT = 0;

export const battleManager = {
  player: null,
  enemy: null,

  ///////////////////////////////////
  //    キャラクター・モンスターの生成
  ///////////////////////////////////
  init() {
    this.clearCharacters();

    this.player = new Samurai();

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.player.el) {
      actionArea.appendChild(this.player.el);
    }

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
    enemy.atk = Math.floor(enemy.atk * statScale);
    enemy.def = Math.floor(enemy.def * statScale);
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

    // 1. ボーナス値を計算 (2連撃以上で発生)
    const bonusAtk = streakCount >= 2 ? Math.floor(streakCount * 0.5) : 0;
    this.refreshStreakDisplay(streakCount);
    // 2. プレイヤーのステータスに反映
    // baseAtk(レベル依存の基礎値)に加算することで、レベルアップ分を保持しつつボーナスだけを変動させる
    this.player.atk = this.player.baseAtk + bonusAtk;

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
}

};

window.battleManager = battleManager;
