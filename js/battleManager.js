import { Samurai } from "../characters/players/samurai.js";
import { Peasant } from "../characters/enemies/peasant.js";
import { Shougun } from "../characters/enemies/shougun.js";
import { Ninja } from "../characters/enemies/ninja.js";

/**
 * 敵の「スケールに使うレベル」の上乗せ（プレイヤー Lv に足す）
 *
 * - 0 のまま → いままでどおり「敵 Lv = プレイヤー Lv」だけ
 * - 例: 15 → `quizManager.stageCorrectCount`（そのバトル中の正解数っぽい累計）が 15 増えるごとに敵 Lv +1
 *
 * 別案（撃破数で強くしたい等）は `defeatEnemy` でカウンタを足して、下の scale 内で使うとよいです。
 */
const ENEMY_EXTRA_LEVEL_EVERY_N_CORRECT = 0;

export const battleManager = {
  player: null,
  enemy: null,

  init() {
    this.clearCharacters();

    this.player = new Samurai();

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.player.el) {
      actionArea.appendChild(this.player.el);
    }

    this.enemySpawn();
  },

  playerAttack() {
    if (!this.player || !this.enemy) return;
    if (!this.player.el || !this.enemy.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;

    this.player.attack(this.enemy);
    this.checkBattleStatus();
  },

  enemyAttack() {
    if (!this.enemy || !this.player) return;
    if (!this.enemy.el || !this.player.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;
    if (this.player.hp <= 0) return;

    this.enemy.attack(this.player);
  },

  clearCharacters() {
    if (this.player) this.player.destroy();
    if (this.enemy) this.enemy.destroy();
    this.player = null;
    this.enemy = null;
  },

  enemySpawn() {
    if (this.enemy && this.enemy.el) {
      this.enemy.destroy();
    }

    const enemyTypes = [Peasant, Ninja, Shougun];
    const EnemyClass = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.enemy = new EnemyClass();
    this.scaleEnemyToPlayerLevel(this.enemy);
    this.enemy.updateHPBar();

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.enemy.el) {
      this.enemy.el.classList.remove("fade-out");
      actionArea.appendChild(this.enemy.el);
    }
  },

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

  checkBattleStatus() {
    if (this.enemy && this.enemy.hp <= 0 && !this.enemy.ishandled) {
      this.enemy.ishandled = true;
      this.defeatEnemy();
    }
  },

  defeatEnemy() {
    if (!this.player || !this.enemy) return;

    const exp = this.enemy.expReward || 5;
    this.player.gainExp(exp);

    setTimeout(() => {
      this.enemySpawn();
    }, 1100);
  },
};

window.battleManager = battleManager;
