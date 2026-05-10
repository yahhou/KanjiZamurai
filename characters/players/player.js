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
    this.isWeaponEquipped = false;
    this.weaponRarity = null;
    this.isHaoriEquipped = false;
    this.haoriRarity = null;
    this.isBandEquipped = false;
    this.isBeadsEquipped = false;
    this.bandRarity = null;
    this.beadsRarity = null;

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


  /* ==========================================================================
  経験値のアニメーション
  ========================================================================== */ 
    animateExpGain() {
      if (this.pendingExp <= 0) {
    this.isAnimatingExp = false;
    return;
  }

  this.isAnimatingExp = true;
  const neededExp = this.maxExp - this.exp;

  if (this.pendingExp >= neededExp) {
    // 1. まずゲージを 100% にする
    this.pendingExp -= neededExp;
    this.exp = this.maxExp;
    this.updateExpBar();

    // 2. ゲージが 100% に到達するのを待ってからリセット
    setTimeout(() => {
      this.levelUp(); // ここで maxExp が増える
      this.exp = 0;
      this.resetExpBarToZero(); // ★アニメなしで 0% に戻す

      // 3. 0.1秒待ってから、余った経験値を左から伸ばし始める
      setTimeout(() => {
        this.animateExpGain();
      }, 100); 
    }, 400); // ゲージが右端に届くまでの時間

  } else {
    // 通常の加算
    this.exp += this.pendingExp;
    this.pendingExp = 0;
    this.updateExpBar();

    setTimeout(() => {
      this.isAnimatingExp = false;
    }, 350);
  }
}


   /* ==========================================================================
  レベルアップ
  ========================================================================== */ 
    levelUp() {
      this.level++;

    // --- HPの上昇（10〜15の範囲でランダム） ---
    const hpGain = 10 + Math.floor(Math.random() * 6);
    this.maxHp += hpGain;
    this.hp += hpGain;

    // --- ステータスポイントの割り振り ---
    // 合計で「7ポイント」を Atk, Def, Mdf にランダムに振り分ける
    // これにより合計値が一定（上がりすぎ防止）になりつつ、個性が生まれる
    let totalStatPoints = 7;
    const stats = ["baseAtk", "baseDef", "baseMdf"];

    // 最低でも各ステータス 1 は上がるように保証（上がらなすぎ防止）
    this.baseAtk += 1;
    this.baseDef += 1;
    this.baseMdf += 1;
    totalStatPoints -= 3;

    // 残りの 4ポイントをランダムに割り振る
    for (let i = 0; i < totalStatPoints; i++) {
      const targetStat = stats[Math.floor(Math.random() * stats.length)];
      this[targetStat] += 1;
    }

    // 次のレベルまでの経験値を増加
    this.maxExp = Math.floor(this.maxExp * 1.4);

    this.refreshStats();
    this.showLevelUpEffect();
    
    if (this.levelUpSound) {
      this.levelUpSound.currentTime = 0;
      this.levelUpSound.play();
    }
    
    console.log(`Level Up! ${this.level} になりました。`);
  }


 /* ==========================================================================
  経験値の更新
  ========================================================================== */ 
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


  /* ==========================================================================
  経験値がmmaxになった後の処理
  ========================================================================== */ 
  /** レベルアップ直後など、経験値バーを 0% 表示に戻す */
    /** ゲージを「アニメなし」で 0% に戻す */
  resetExpBarToZero() {
    const playerUi = document.getElementById("player-ui");
      if (!playerUi) return;
    const inner = playerUi.querySelector(".exp-bar-inner");
      if (inner) {
    // transition を一時的に消すことで、右から左へ戻る動きをカットする
      inner.style.transition = "none";
      inner.style.width = "0%";
    
    // 次の更新でアニメーションが効くように戻す
    // reflow（強制再描画）を発生させるための呪文
      inner.offsetHeight; 
      inner.style.transition = "width 0.35s ease-out";
    }
  }


   /* ==========================================================================
  ステータスのリフレッシュ
  ========================================================================== */ 
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
  ステータスのエクスポート（セーブ用）
  ========================================================================== */
  exportStatus() {
    return {
      level: this.level,
      exp: this.exp,
      maxExp: this.maxExp,
      hp: this.hp,
      maxHp: this.maxHp,
      baseAtk: this.baseAtk,
      baseDef: this.baseDef,
      baseMdf: this.baseMdf,
      // 装備品の状態も継続したい場合はここに追加
      //isWeaponEquipped: this.isWeaponEquipped,
      //weaponRarity: this.weaponRarity,
      //isHaoriEquipped: this.isHaoriEquipped,
      //haoriRarity: this.haoriRarity
      // ...他、必要なフラグ
    };
  }
  

  /* ==========================================================================
  ステータスのインポート（ロード用）
  ========================================================================== */
  importStatus(status) {
    /* Player.js の importStatus */

    this.level = status.level || 1;
    this.exp = status.exp || 0;
    this.maxExp = status.maxExp || 20;
    
    // ★追加：前ステージのアニメーション残骸をクリアする
    this.pendingExp = 0;
    this.isAnimatingExp = false;

    this.maxHp = status.maxHp || this.maxHp;
    this.hp = status.hp || this.maxHp;

    this.baseAtk = status.baseAtk || this.baseAtk;
    this.baseDef = status.baseDef || this.baseDef;
    this.baseMdf = status.baseMdf || this.baseMdf;

    this.refreshStats();
    this.updateExpBar(); // ここでも呼んでいるので、基本的にはこれで同期されます
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
