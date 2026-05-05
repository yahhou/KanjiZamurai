import { Character } from '../../js/characterManager.js';
import { gameManager } from '../../js/gameManager.js';
import { refreshPlayerBuffIcons } from '../../js/playerBuffIcons.js';

export class Player extends Character {
  constructor(config) {
    super(config);
    // プレイヤー共通の初期化（例：現在のレベルなど）
    this.level = 1;
    this.exp = 0;
    this.maxExp = 20;
    this.pendingExp = 0;
    this.isAnimatingExp = false;
    this.createExpBar();
    this.updateExpBar();
    this.hasStreakBouns = false;

    this.levelUpSound = new Audio('assets/sounds/levelUp.mp3');
  }

 /* ==========================================================================
  経験値のバー要素を作る
  ========================================================================== */ 
  createExpBar() {
      const playerUi = document.getElementById('player-ui');
      if (!playerUi) return;

      if (!playerUi.querySelector('.level-text')) {
        const levelEl = document.createElement('div');
        levelEl.className = 'level-text';
        playerUi.appendChild(levelEl);
      }

      if (!playerUi.querySelector('.exp-bar-container')) {
        const expCont = document.createElement('div');
        expCont.className = 'exp-bar-container';
        expCont.innerHTML = `<div class="exp-bar-inner"></div>`;
        playerUi.appendChild(expCont);
      }
    }

  /* ==========================================================================
  経験値を獲得
  ========================================================================== */ 
 
    gainExp(amount) {
      this.pendingExp += amount;
      if (!this.isAnimatingExp) {
        this.animateExpGain();
      }
    } 

    animateExpGain() {
      if (this.pendingExp <= 0) {
        this.isAnimatingExp = false;
        return;
      }

      this.isAnimatingExp = true;

      const neededExp = this.maxExp - this.exp;

      if (this.pendingExp >= neededExp) {
        this.pendingExp -= neededExp;
        this.exp = this.maxExp;
        this.updateExpBar();

        setTimeout(() => {
          this.levelUp();
          this.exp = 0;
          this.resetExpBarToZero();

          setTimeout(() => {
            this.animateExpGain();
          }, 80);
        }, 350);

        return;
      }

      this.exp += this.pendingExp;
      this.pendingExp = 0;
      this.updateExpBar();

      setTimeout(() => {
        this.isAnimatingExp = false;
      }, 350);
    }

   /* ==========================================================================
  レベルアップ
  ========================================================================== */ 
 
    levelUp() {
      this.level++;

      this.maxHp += 10;
      this.hp += 10;

      this.atk = this.baseAtk += 3;
      this.def = this.baseDef += 2;
      this.mdf = this.baseMdf += 2;

      this.maxExp = Math.floor(this.maxExp * 1.4);

      this.refreshStats();
      this.showLevelUpEffect();
      this.levelUpSound.play();
      
    }

  /**
   * 経験値バーとレベル表示を、いまの exp / maxExp に合わせて更新する。
   */
  updateExpBar() {
    const playerUi = document.getElementById("player-ui");
    if (!playerUi) return;

    const inner = playerUi.querySelector(".exp-bar-inner");
    if (inner) {
      const pct = this.maxExp > 0 ? (this.exp / this.maxExp) * 100 : 0;
      inner.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }

    const levelEl = playerUi.querySelector(".level-text");
    if (levelEl) {
      levelEl.textContent = `Lv.${this.level}`;
    }
  }

  /** レベルアップ直後など、経験値バーを 0% 表示に戻す */
  resetExpBarToZero() {
    const playerUi = document.getElementById("player-ui");
    if (!playerUi) return;
    const inner = playerUi.querySelector(".exp-bar-inner");
    if (inner) inner.style.width = "0%";
  }

  refreshStats() {
    super.refreshStats();
    refreshPlayerBuffIcons();
  }

  /* ==========================================================================
  レベルアップした時のエフェクト
  ========================================================================== */ 

    showLevelUpEffect() {
      if (!this.el) return;

      const levelUpEl = document.createElement('div');
      levelUpEl.className = 'damage-popup level-up-popup';
      levelUpEl.innerText = 'Level Up!';

      this.el.appendChild(levelUpEl);

      const timeoutId = setTimeout(() => {
        levelUpEl.remove();
        this.activeTimeouts = this.activeTimeouts.filter((id) => id !== timeoutId);
      }, 2000);

      this.activeTimeouts.push(timeoutId);
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
