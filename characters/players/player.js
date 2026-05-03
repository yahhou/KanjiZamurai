import { Character } from '../../js/characterManager.js';
import { gameManager } from '../../js/gameManager.js';

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

      this.atk += 3;
      this.def += 2;
      this.mdf += 2;

      this.maxExp = Math.floor(this.maxExp * 1.4);

      this.updateHPBar();
      this.showLevelUpEffect();
    }
    
  /* ==========================================================================
  HPバーの更新
  ========================================================================== */ 
 
    updateHPBar() {
    const pct = (this.hp / this.maxHp) * 100;

    let innerBar = null;

    if (this.id === 'player') {
      innerBar = document.querySelector('#player-ui .hp-bar-inner');
    } else if (this.id === 'enemy') {
      innerBar = document.querySelector('#enemy-ui .hp-bar-inner');
    } else {
      innerBar = this.el.querySelector('.hp-bar-inner');
    }

    if (innerBar) {
      innerBar.style.width = `${pct}%`;

      if (pct < 20) {
        innerBar.style.backgroundColor = "#e74c3c";
      } else if (pct < 50) {
        innerBar.style.backgroundColor = "#f1c40f";
      } else {
        innerBar.style.backgroundColor = "#2ecc71";
      }
    }
  }

  /* ==========================================================================
  経験値バーの更新
  ========================================================================== */ 

    updateExpBar() {
      const levelEl = document.querySelector('#player-ui .level-text');
      const expBar = document.querySelector('#player-ui .exp-bar-inner');

      if (levelEl) {
        levelEl.innerText = `Lv.${this.level}`;
      }

      if (expBar) {
        const pct = this.maxExp > 0 ? (this.exp / this.maxExp) * 100 : 0;
        expBar.style.transition = "width 0.3s ease-out";
        expBar.style.width = `${pct}%`;
      }
    }

    resetExpBarToZero() {
      const expBar = document.querySelector('#player-ui .exp-bar-inner');
      if (!expBar) return;

      expBar.style.transition = "none";
      expBar.style.width = "0%";
      void expBar.offsetWidth;
      expBar.style.transition = "width 0.3s ease-out";
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
        this.activeTimeouts = this.activeTimeouts.filter(id => id !==
  timeoutId);
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
