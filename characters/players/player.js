import { Character } from '../../js/characterManager.js';
import { gameManager } from '../../js/gameManager.js';
import { refreshPlayerBuffIcons } from '../../js/playerBuffIcons.js';
import { EQUIPMENT_BALANCE, PLAYER_BALANCE } from '../../js/balanceConfig.js';

export class Player extends Character {
  constructor(config) {
    super(config);
    // プレイヤー共通の初期化（例：現在のレベルなど）
    this.level = 1;
    this.exp = 0;
    this.maxExp = PLAYER_BALANCE.initialMaxExp;
    this.pendingExp = 0;
    this.isAnimatingExp = false;
    this.createExpBar();
    this.updateExpBar();
    this.hasStreakBouns = false;
    this.isWeaponEquipped = false;
    this.weaponRarity = null;
    this.weaponDurability = 0;
    this.weaponMaxDurability = 0;
    this.isHaoriEquipped = false;
    this.haoriRarity = null;
    this.haoriDurability = 0;
    this.haoriMaxDurability = 0;
    this.isBandEquipped = false;
    this.isBeadsEquipped = false;
    this.bandRarity = null;
    this.bandDurability = 0;
    this.bandMaxDurability = 0;
    this.beadsRarity = null;
    this.beadsDurability = 0;
    this.beadsMaxDurability = 0;
    this.battleGrade = "C";

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

    // --- HPの上昇 ---
    const hpRange = PLAYER_BALANCE.maxHpGainOnLevelUp - PLAYER_BALANCE.minHpGainOnLevelUp + 1;
    const hpGain = PLAYER_BALANCE.minHpGainOnLevelUp + Math.floor(Math.random() * hpRange);
    this.maxHp += hpGain;
    this.hp += hpGain;

    // --- ステータスポイントの割り振り ---
    // 合計ポイントを Atk, Def, Mdf にランダムに振り分ける
    // これにより合計値が一定（上がりすぎ防止）になりつつ、個性が生まれる
    let totalStatPoints = PLAYER_BALANCE.statPointsOnLevelUp;
    const stats = ["baseAtk", "baseDef", "baseMdf"];

    // 最低でも各ステータス 1 は上がるように保証（上がらなすぎ防止）
    this.baseAtk += PLAYER_BALANCE.guaranteedStatGain;
    this.baseDef += PLAYER_BALANCE.guaranteedStatGain;
    this.baseMdf += PLAYER_BALANCE.guaranteedStatGain;
    totalStatPoints -= stats.length * PLAYER_BALANCE.guaranteedStatGain;

    // 残りポイントをランダムに割り振る
    for (let i = 0; i < totalStatPoints; i++) {
      const targetStat = stats[Math.floor(Math.random() * stats.length)];
      this[targetStat] += 1;
    }

    // 次のレベルまでの経験値を増加
    this.maxExp = Math.floor(this.maxExp * PLAYER_BALANCE.maxExpMultiplier);

    this.refreshStats();
    this.showLevelUpEffect();
    
    if (this.levelUpSound) {
      this.levelUpSound.currentTime = 0;
      this.levelUpSound.play();
    }
    
    console.log(`Level Up! ${this.level} になりました。`);
  }

  applyStageRankGrowth(rank = "C") {
    const growthTable = {
      S: { hp: 16, stats: 9 },
      A: { hp: 13, stats: 7 },
      B: { hp: 10, stats: 5 },
      C: { hp: 7, stats: 3 },
    };
    const growth = growthTable[rank] || growthTable.C;
    const stats = ["baseAtk", "baseDef", "baseMdf"];
    const before = {
      level: this.level,
      hp: this.maxHp,
      atk: this.baseAtk,
      def: this.baseDef,
      mdf: this.baseMdf,
    };

    this.level++;
    this.maxHp += growth.hp;
    this.hp = this.maxHp;

    for (let i = 0; i < growth.stats; i++) {
      const targetStat = stats[i % stats.length];
      this[targetStat] += 1;
    }

    this.maxExp = Math.floor(this.maxExp * PLAYER_BALANCE.maxExpMultiplier);
    this.exp = 0;
    this.refreshStats();
    this.updateExpBar();
    this.showLevelUpEffect();

    return {
      rank,
      before,
      after: {
        level: this.level,
        hp: this.maxHp,
        atk: this.baseAtk,
        def: this.baseDef,
        mdf: this.baseMdf,
      },
    };
  }

  getEquipmentDurabilityMax(slot, rarity) {
    const normalized = String(rarity || "").toLowerCase();
    const tableMap = {
      weapon: EQUIPMENT_BALANCE.weaponDurabilityByRarity,
      haori: EQUIPMENT_BALANCE.haoriDurabilityByRarity,
      band: EQUIPMENT_BALANCE.bandDurabilityByRarity,
      beads: EQUIPMENT_BALANCE.beadsDurabilityByRarity,
    };
    const table = tableMap[slot] || tableMap.weapon;

    return table[normalized] || 0;
  }

  equipWeapon({ rarity, multiplier, maxDurability = null }) {
    const normalized = String(rarity || "").toLowerCase();
    this.isWeaponEquipped = true;
    this.weaponRarity = normalized;
    this.weaponMultiplier = multiplier ?? this.weaponMultiplier ?? 1.0;
    this.weaponMaxDurability = maxDurability ?? this.getEquipmentDurabilityMax("weapon", normalized);
    this.weaponDurability = this.weaponMaxDurability;
    this.refreshStats();
  }

  equipHaori({ rarity, multiplier, maxDurability = null }) {
    const normalized = String(rarity || "").toLowerCase();
    this.isHaoriEquipped = true;
    this.haoriRarity = normalized;
    this.haoriMultiplier = multiplier ?? this.haoriMultiplier ?? 1.0;
    this.haoriMaxDurability = maxDurability ?? this.getEquipmentDurabilityMax("haori", normalized);
    this.haoriDurability = this.haoriMaxDurability;
    this.refreshStats();
  }

  equipBand({ rarity, critRate, maxDurability = null }) {
    const normalized = String(rarity || "").toLowerCase();
    this.isBandEquipped = true;
    this.bandRarity = normalized;
    this.critRate = critRate ?? this.baseCritRate ?? this.critRate ?? 5;
    this.bandMaxDurability = maxDurability ?? this.getEquipmentDurabilityMax("band", normalized);
    this.bandDurability = this.bandMaxDurability;
    this.refreshStats();
  }

  equipBeads({ rarity, eva, maxDurability = null }) {
    const normalized = String(rarity || "").toLowerCase();
    this.isBeadsEquipped = true;
    this.beadsRarity = normalized;
    this.eva = eva ?? this.baseEva ?? this.eva ?? 0;
    this.beadsMaxDurability = maxDurability ?? this.getEquipmentDurabilityMax("beads", normalized);
    this.beadsDurability = this.beadsMaxDurability;
    this.refreshStats();
  }

  breakWeapon() {
    this.isWeaponEquipped = false;
    this.weaponRarity = null;
    this.weaponMultiplier = 1.0;
    this.weaponDurability = 0;
    this.weaponMaxDurability = 0;
    this.refreshStats();
  }

  breakHaori() {
    this.isHaoriEquipped = false;
    this.haoriRarity = null;
    this.haoriMultiplier = 1.0;
    this.haoriDurability = 0;
    this.haoriMaxDurability = 0;
    this.refreshStats();
  }

  breakBand() {
    this.isBandEquipped = false;
    this.bandRarity = null;
    this.bandDurability = 0;
    this.bandMaxDurability = 0;
    this.critRate = this.baseCritRate ?? 5;
    this.refreshStats();
  }

  breakBeads() {
    this.isBeadsEquipped = false;
    this.beadsRarity = null;
    this.beadsDurability = 0;
    this.beadsMaxDurability = 0;
    this.eva = this.baseEva ?? 0;
    this.refreshStats();
  }

  damageWeaponDurability(amount = 1) {
    if (!this.isWeaponEquipped) return false;

    this.weaponDurability = Math.max(0, (this.weaponDurability || 0) - amount);
    if (this.weaponDurability <= 0) {
      this.breakWeapon();
    } else {
      this.refreshStats();
    }

    return true;
  }

  damageHaoriDurability(amount = 1) {
    if (!this.isHaoriEquipped) return false;

    this.haoriDurability = Math.max(0, (this.haoriDurability || 0) - amount);
    if (this.haoriDurability <= 0) {
      this.breakHaori();
    } else {
      this.refreshStats();
    }

    return true;
  }

  damageBandDurability(amount = 1) {
    if (!this.isBandEquipped) return false;

    this.bandDurability = Math.max(0, (this.bandDurability || 0) - amount);
    if (this.bandDurability <= 0) {
      this.breakBand();
    } else {
      this.refreshStats();
    }

    return true;
  }

  damageBeadsDurability(amount = 1) {
    if (!this.isBeadsEquipped) return false;

    this.beadsDurability = Math.max(0, (this.beadsDurability || 0) - amount);
    if (this.beadsDurability <= 0) {
      this.breakBeads();
    } else {
      this.refreshStats();
    }

    return true;
  }

  damageEquipmentDurability(amount = 1) {
    const damagedWeapon = this.damageWeaponDurability(amount);
    const damagedHaori = this.damageHaoriDurability(amount);
    const damagedBand = this.damageBandDurability(amount);
    const damagedBeads = this.damageBeadsDurability(amount);

    if (!damagedWeapon && !damagedHaori && !damagedBand && !damagedBeads) {
      return false;
    }

    refreshPlayerBuffIcons();
    return true;
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
      const rank = this.battleGrade ? `${this.battleGrade} ` : "";
      levelEl.innerHTML = `${rank}<span class="level-number">Lv.${this.level}</span>`;
      levelEl.dataset.rank = this.battleGrade || "";
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
      weaponMultiplier: this.weaponMultiplier,
      weaponRarity: this.weaponRarity,
      weaponDurability: this.weaponDurability,
      weaponMaxDurability: this.weaponMaxDurability,
      haoriMultiplier: this.haoriMultiplier,
      haoriRarity: this.haoriRarity,
      haoriDurability: this.haoriDurability,
      haoriMaxDurability: this.haoriMaxDurability,
      bandRarity: this.bandRarity,
      bandDurability: this.bandDurability,
      bandMaxDurability: this.bandMaxDurability,
      beadsRarity: this.beadsRarity,
      beadsDurability: this.beadsDurability,
      beadsMaxDurability: this.beadsMaxDurability,
      critRate: this.critRate,
      eva: this.eva,
      baseCritRate: this.baseCritRate,
      baseEva: this.baseEva,
      isRegenerating: this.isRegenerating,
      battleGrade: this.battleGrade,
    };
  }
  

  /* ==========================================================================
  ステータスのインポート（ロード用）
  ========================================================================== */
  importStatus(status) {
    /* Player.js の importStatus */

    this.level = status.level || 1;
    this.exp = status.exp || 0;
    this.maxExp = status.maxExp || PLAYER_BALANCE.initialMaxExp;
    
    // ★追加：前ステージのアニメーション残骸をクリアする
    this.pendingExp = 0;
    this.isAnimatingExp = false;

    this.maxHp = status.maxHp || this.maxHp;
    this.hp = status.hp || this.maxHp;

    this.baseAtk = status.baseAtk || this.baseAtk;
    this.baseDef = status.baseDef || this.baseDef;
    this.baseMdf = status.baseMdf || this.baseMdf;
    this.weaponMultiplier = status.weaponMultiplier || this.weaponMultiplier;
    this.weaponRarity = status.weaponRarity || null;
    this.weaponMaxDurability = status.weaponMaxDurability ?? this.getEquipmentDurabilityMax("weapon", this.weaponRarity);
    this.weaponDurability = status.weaponDurability ?? this.weaponMaxDurability;
    this.haoriMultiplier = status.haoriMultiplier || this.haoriMultiplier;
    this.haoriRarity = status.haoriRarity || null;
    this.haoriMaxDurability = status.haoriMaxDurability ?? this.getEquipmentDurabilityMax("haori", this.haoriRarity);
    this.haoriDurability = status.haoriDurability ?? this.haoriMaxDurability;
    this.bandRarity = status.bandRarity || null;
    this.bandMaxDurability = status.bandMaxDurability ?? this.getEquipmentDurabilityMax("band", this.bandRarity);
    this.bandDurability = status.bandDurability ?? this.bandMaxDurability;
    this.beadsRarity = status.beadsRarity || null;
    this.beadsMaxDurability = status.beadsMaxDurability ?? this.getEquipmentDurabilityMax("beads", this.beadsRarity);
    this.beadsDurability = status.beadsDurability ?? this.beadsMaxDurability;
    this.critRate = status.critRate || this.critRate;
    this.eva = status.eva || this.eva;
    this.baseCritRate = status.baseCritRate ?? this.baseCritRate ?? this.critRate;
    this.baseEva = status.baseEva ?? this.baseEva ?? this.eva;
    this.isRegenerating = Boolean(status.isRegenerating);
    this.battleGrade = status.battleGrade || this.battleGrade;
    this.isWeaponEquipped = Boolean(this.weaponRarity);
    this.isHaoriEquipped = Boolean(this.haoriRarity);
    this.isBandEquipped = Boolean(this.bandRarity);
    this.isBeadsEquipped = Boolean(this.beadsRarity);

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
