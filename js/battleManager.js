import { Samurai } from "../characters/players/samurai.js";
import { Tengu } from "../characters/enemies/tengu.js";
import { Kappa } from "../characters/enemies/kappa.js";
import { KappaOyabun } from "../characters/enemies/kappaOyabun.js";
import { OneEyedGoblinOyabun } from "../characters/enemies/oneEyedGoblinOyabun.js";
import { OneEyedGoblin } from "../characters/enemies/oneEyedGoblin.js";
import { Oogama } from "../characters/enemies/oogama.js";
import { ObakeKinoko } from "../characters/enemies/obakeKinoko.js";
import { Kakashi } from "../characters/enemies/kakashi.js";
import { Genin } from "../characters/enemies/genin.js";
import { KoganeKozou } from "../characters/enemies/koganeKozou.js";
import { Kamaitachi } from "../characters/enemies/kamaitachi.js";
import { AkaOni } from "../characters/enemies/akaOni.js";
import { AoOni } from "../characters/enemies/aoOni.js";
import { OoOni } from "../characters/enemies/ooOni.js";
import { NoroiMusha } from "../characters/enemies/noroiMusha.js";
import { HitotsumeKomori } from "../characters/enemies/hitotsumeKomori.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";
import { ENEMY_BALANCE } from "./balanceConfig.js";

const ENEMY_CLASSES = {
  Tengu,
  OneEyedGoblin,
  Kappa,
  KappaOyabun,
  OneEyedGoblinOyabun,
  Oogama,
  ObakeKinoko,
  Kakashi,
  Genin,
  Kamaitachi,
  KoganeKozou,
  AkaOni,
  AoOni,
  OoOni,
  NoroiMusha,
  HitotsumeKomori,
};

function normalizeEnemyTypes(enemyTypes) {
  if (Array.isArray(enemyTypes)) {
    return enemyTypes.filter((typeName) => ENEMY_CLASSES[typeName]);
  }

  return ENEMY_CLASSES[enemyTypes] ? [enemyTypes] : [];
}

export const battleManager = {
  player: null,
  enemy: null,
  bgImages: {},
  currentEnemyTypes: [],
  currentEnemyLevel: null,
  currentBossType: null,
  counterAttackDelayMs: 1000,
  answerTurnDelayMs: 1500,

  ///////////////////////////////////
  //    キャラクター・モンスターの生成
  ///////////////////////////////////
  init(savedStatus = null, bgKey = null, enemyTypes = null, enemyLevel = null, bossType = null) { // 引数で保存データを受け取れるようにする
    this.clearCharacters();
    this.setupBackgrounds();
    // ★追加：コンボとStreakの内部数値をリセット

    // ★追加：コンボとStreakの内部数値をリセット
    this.comboCount = 0;
    if (this.player) {
      this.player.streakMultiplier = 1.0;
      this.player.hasStreakBonus = false;
    }
    
    this.currentEnemyTypes = normalizeEnemyTypes(enemyTypes);
    this.currentEnemyLevel = enemyLevel;
    this.currentBossType = bossType;

    // 1. まず新しいインスタンスを作る（この時点ではLv1, Exp0）
    this.player = new Samurai();
    
    // 2. ステータスを読み込む
    if (savedStatus) {
      this.player.importStatus(savedStatus);
      
      // ★重要：読み込んだあとに「現在の経験値」でバーを即座に描画し直す
      // これをしないと、Samuraiのconstructorが作った「0%」のままになってしまう
      this.player.updateExpBar(); 
      
      this.player.hp = this.player.maxHp; 
      if (this.player.refreshStats) this.player.refreshStats();
    }

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.player.el) {
      actionArea.appendChild(this.player.el);
    }

    this.updateBackground(bgKey);
    this.enemySpawn();
  },


  ///////////////////////////////////////////////////////////
  // 敵を倒した時など、適切なタイミングで「最新のステータス」を取得する用
  ////////////////////////////////////////////////////////////
  getCurrentPlayerStatus() {
    return this.player ? this.player.exportStatus() : null;
  },
  
  
  ///////////////////////////////////
  //   　　ボスのスポーン
  ///////////////////////////////////
  bossSpawn(bossTypeName = null) {
    if (this.enemy) this.enemy.destroy();

    const BossClass = ENEMY_CLASSES[bossTypeName || this.currentBossType] || Ninja;

    this.enemy = new BossClass(); 
    this.scaleEnemyToStageLevel(this.enemy, this.getBossLevel());
    this.enemy.maxHp = Math.floor(this.enemy.maxHp * ENEMY_BALANCE.bossHpMultiplier);
    this.enemy.hp = this.enemy.maxHp;
    this.enemy.baseAtk = Math.floor(this.enemy.baseAtk * ENEMY_BALANCE.bossAtkMultiplier);
    this.enemy.refreshStats();

    const actionArea = document.getElementById("actionArea");
    if (actionArea && this.enemy.el) {
      actionArea.appendChild(this.enemy.el);
    }
  },


  ///////////////////////////////////
  //   　　プレイヤーの攻撃
  ///////////////////////////////////
  playerAttack(damageMultiplier = 1) {
    if (!this.player || !this.enemy) return;
    if (!this.player.el || !this.enemy.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;

    this.player.attack(this.enemy, damageMultiplier);
    
    // 攻撃直後にHPチェックを行い、死んでいたらフラグを立てる
    this.checkBattleStatus();
  },


  ///////////////////////////////////
  //         　 敵の攻撃
  ///////////////////////////////////
  enemyAttack(damageMultiplier = 1) {
    if (!this.enemy || !this.player) return;
    if (!this.enemy.el || !this.player.el) return;
    if (this.enemy.hp <= 0 || this.enemy.isDead) return;
    if (this.player.hp <= 0) return;

    this.enemy.attack(this.player, damageMultiplier);
  },

  ///////////////////////////////////
  //    プレイヤーのダメージ計算
  ///////////////////////////////////
  calculatePlayerDamage() {
    // 基礎攻撃力
    let atk = this.player.atk || 10;
    
    // クリティカル判定（例: 10%の確率）
    const isCritical = Math.random() < (this.player.critRate / 100);
    let damage = isCritical ? Math.floor(atk * 1.5) : atk;

    return { damage, isCritical };
  },

  
  ///////////////////////////////////
  //    正解時のターン処理
  ///////////////////////////////////
  resolveCorrectAnswerTurn() {
    this.comboCount = (this.comboCount || 0) + 1;
    const { damage, isCritical } = this.calculatePlayerDamage();

    // 攻撃前のターゲットを保持しておく（リスポーン後の新敵への攻撃化け防止）
    const targetEnemy = this.enemy;

   if (this.comboCount >= 3 && this.player.playFinishingMove) {
  this.player.playFinishingMove(targetEnemy, damage);
} else {
  this.player.playAttackAnimation(targetEnemy, damage, isCritical);
}

    // 2. 反撃の予約
    setTimeout(() => {
      // プレイヤーが消えている、または死んでいる場合は何もしない
      if (!this.player || this.player.hp <= 0) return;

      // 【重要】攻撃した対象（targetEnemy）がまだ存在し、かつ生きているかチェック
      // 新しくスポーンした敵（this.enemy）ではなく、さっき攻撃した相手を見ることがポイント
      if (!targetEnemy || targetEnemy.hp <= 0 || targetEnemy.isDead || targetEnemy.ishandled) {
        console.log("ターゲットは撃破済みのため、反撃をスキップします");
        return; 
      }

      // まだ生きていれば反撃
      this.enemyAttack(0.5);
    }, 1500); 
  },

  ///////////////////////////////////
  //    不正解時のターン処理
  ///////////////////////////////////
  resolveWrongAnswerTurn() {
    this.comboCount = 0; // コンボ途絶
    this.enemyAttack();

    setTimeout(() => {
      if (!this.player || !this.enemy) return;
      if (this.player.hp <= 0) return;
      if (this.enemy.hp <= 0 || this.enemy.isDead) return;

      this.playerAttack(0.5);
    }, this.counterAttackDelayMs);
  },


  ///////////////////////////////////
  //       キャラクターリセット
  ///////////////////////////////////
  clearCharacters() {
    // 1. まずプレイヤーと敵のインスタンスを破棄
    if (this.player) {
      this.player.streakMultiplier = 1.0;
      this.player.hasStreakBonus = false;
      this.player.destroy();
    }
    if (this.enemy) this.enemy.destroy();
    this.player = null;
    this.enemy = null;

    // 2. 画面に残った Streak UI を削除
    const streakEl = document.getElementById("battle-streak");
    if (streakEl) streakEl.remove();

    // 3. 画面に残ったダメージポップアップなどの残骸を強制掃除
    const actionArea = document.getElementById("actionArea");
    if (actionArea) {
      // actionArea の中にある「要素（el）以外の残骸」を消す、
      // またはポップアップのクラス名（.damage-popup等）が分かればそれを指定して削除
      const oldPopups = actionArea.querySelectorAll(".damage-popup"); 
      oldPopups.forEach(popup => popup.remove());
    }
  },


  ///////////////////////////////////
  //       　　敵の再生成
  ///////////////////////////////////
  enemySpawn(specifiedType = null) {
    if (this.enemy && this.enemy.el) {
      this.enemy.destroy();
    }

    const candidateTypes = specifiedType
      ? normalizeEnemyTypes(specifiedType)
      : this.currentEnemyTypes;

    let EnemyClass;
    if (candidateTypes.length > 0) {
      const typeName = candidateTypes[Math.floor(Math.random() * candidateTypes.length)];
      EnemyClass = ENEMY_CLASSES[typeName];
    } else {
      // どこにも指定がない場合のみランダム（練習モード用など）
      const classes = Object.values(ENEMY_CLASSES);
      EnemyClass = classes[Math.floor(Math.random() * classes.length)];
    }

    this.enemy = new EnemyClass();
    this.scaleEnemyToStageLevel(this.enemy);
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
  scaleEnemyToStageLevel(enemy, specifiedLevel = null) {
    if (!enemy || !this.player) return;

    const playerLevel = Math.max(1, this.player.level || 1);
    const stageLevel = specifiedLevel || this.currentEnemyLevel;

    let bonusFromQuiz = 0;
    if (ENEMY_BALANCE.extraLevelEveryNCorrect > 0) {
      const correct = window.quizManager?.stageCorrectCount ?? 0;
      bonusFromQuiz = Math.floor(Math.max(0, correct) / ENEMY_BALANCE.extraLevelEveryNCorrect);
    }

    const fallbackLevel = Math.max(1, Math.floor(playerLevel * ENEMY_BALANCE.fallbackPlayerLevelRatio));
    const baseLevel = stageLevel || fallbackLevel;
    const level = Math.max(1, baseLevel + bonusFromQuiz);
    enemy.level = level;
    const hpScale = 1 + (level - 1) * ENEMY_BALANCE.hpScalePerLevel;
    const statScale = 1 + (level - 1) * ENEMY_BALANCE.statScalePerLevel;
    const expScale = 1 + (level - 1) * ENEMY_BALANCE.expScalePerLevel;

    enemy.maxHp = Math.floor(enemy.maxHp * hpScale);
    enemy.hp = enemy.maxHp;
    enemy.baseAtk = Math.floor(enemy.baseAtk * statScale);
    enemy.baseDef = Math.floor(enemy.baseDef * statScale);
    enemy.mdf = Math.floor(enemy.mdf * statScale);
    enemy.expReward = Math.floor((enemy.expReward || 5) * expScale);
  },

  getBossLevel() {
    const baseLevel = this.currentEnemyLevel || Math.max(1, Math.floor((this.player?.level || 1) * ENEMY_BALANCE.fallbackPlayerLevelRatio));
    return baseLevel + ENEMY_BALANCE.bossLevelBonus;
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
    
    if (window.quizManager.quizMode === "boss") {
      this.player.exp += exp;
      while (this.player.exp >= this.player.maxExp) {
        this.player.exp -= this.player.maxExp;
        this.player.levelUp();
      }
      this.player.updateExpBar();
      window.quizManager.victory(); 
      return;
    }

    // ザコ敵の経験値獲得
    this.player.gainExp(exp);

    // 次の敵を出すタイマー
    setTimeout(() => {
      // クイズが継続中なら敵を出す
      if (!window.quizManager.isVictoryActive) {
        if (window.quizManager.quizMode === "normal") {
          this.enemySpawn(); // ここで確実に新しい敵を生成
        }
      }
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
      "stage_1": "assets/images/stage_field.png",
      "stage_2": "assets/images/stage_field.png",
      "stage_3": "assets/images/stage_village.png",
      "stage_4": "assets/images/stage_village.png",
      "stage_5": "assets/images/stage_riceField.png",
      "stage_6": "assets/images/stage_riceField.png",
      "stage_7": "assets/images/stage_creek.png",
      "stage_8": "assets/images/stage_creek.png",
      "stage_9": "assets/images/stage_bambooGrove.png",
      "stage_10": "assets/images/stage_bambooGrove.png",
      "stage_11": "assets/images/stage_bambooGrove.png",
      "stage_12": "assets/images/stage_mountainPath.png",
      "stage_13": "assets/images/stage_mountainPath.png",
      "stage_14": "assets/images/stage_mountainPath.png",
      "stage_15": "assets/images/stage_shrine.png",
      "stage_16": "assets/images/stage_shrine.png",
      "stage_17": "assets/images/stage_shrine.png",
      "stage_18": "assets/images/stage_shrine.png",
      "stage_19": "assets/images/stage_shrine.png",
      "stage_20": "assets/images/stage_pluvialVillage.png",
      "stage_21": "assets/images/stage_pluvialVillage.png",
      "stage_22": "assets/images/stage_pluvialVillage.png",
      "stage_23": "assets/images/stage_pluvialVillage.png",
      "stage_24": "assets/images/stage_pluvialVillage.png",
      "stage_25": "assets/images/stage_pluvialVillage.png",
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
   const target = document.getElementById("actionArea"); 
    if (!target) return;

    let selectedSrc;

    // bgKey が指定されていて、かつ bgImages に存在する場合
    if (bgKey && this.bgImages[bgKey]) {
      selectedSrc = this.bgImages[bgKey].src;
    } else {
      // 指定がない場合のみランダム
      const keys = Object.keys(this.bgImages);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      selectedSrc = this.bgImages[randomKey]?.src;
    }

    if (selectedSrc) {
      target.style.backgroundImage = `url('${selectedSrc}')`;
      target.style.backgroundSize = "cover"; 
      target.style.backgroundPosition = "center 25%";
    }
  },
};

window.battleManager = battleManager;
