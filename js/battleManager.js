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
import { Ashigaru } from "../characters/enemies/ashigaru.js";
import { SamuraiTaishou } from "../characters/enemies/samuraiTaishou.js";
import { IwaAtama } from "../characters/enemies/iwaAtama.js";
import { OoZaru } from "../characters/enemies/ooZaru.js";
import { Monk } from "../characters/enemies/monk.js";
import { Youko } from "../characters/enemies/youko.js";
import { HitokuiBana } from "../characters/enemies/hitokuiBana.js";
import { ShiroOni } from "../characters/enemies/shiroOni.js";
import { PhantomDeer } from "../characters/enemies/phantomDeer.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";
import { COMBAT_BALANCE, ENEMY_BALANCE } from "./balanceConfig.js";
import { applyEnemyRankStats } from "./enemyRankConfig.js";

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
  Ashigaru,
  SamuraiTaishou,
  IwaAtama,
  OoZaru,
  Monk,
  Youko,
  HitokuiBana,
  ShiroOni,
  PhantomDeer,
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
  currentEnemyRank: null,
  counterAttackDelayMs: 1000,
  answerTurnDelayMs: 1500,

  ///////////////////////////////////
  //    キャラクター・モンスターの生成
  ///////////////////////////////////
  init(savedStatus = null, bgKey = null, enemyTypes = null, enemyLevel = null, enemyRank = null) { // 引数で保存データを受け取れるようにする
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
    this.currentEnemyRank = enemyRank;

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
  calculatePlayerDamage(targetEnemy) {
  if (!this.player || !targetEnemy) return { damage: 10, isCritical: false };
  
  // Characterクラスの計算メソッドをそのまま利用（これで武器・コンボ・乱数が一木に反映される）
  const result = this.player.calculateDamage(targetEnemy);
  
  return { 
    damage: result.amount, 
    isCritical: result.isCritical 
  };
},

  
  ///////////////////////////////////
  //    正解時のターン処理
  ///////////////////////////////////
  resolveCorrectAnswerTurn() {
    this.comboCount = (this.comboCount || 0) + 1;
  const targetEnemy = this.enemy;
  
  if (this.comboCount >= 3 && this.player.playUltimateFinishingMove) {
  this.player.playUltimateFinishingMove(targetEnemy);
} else {
  // 敵の情報を渡して正確に計算
  let { damage, isCritical } = this.calculatePlayerDamage(targetEnemy);
  this.player.playAttackAnimation(targetEnemy, damage, isCritical);
}

    setTimeout(() => {
      if (!this.player || this.player.hp <= 0) return;
      if (!targetEnemy || targetEnemy.hp <= 0 || targetEnemy.isDead || targetEnemy.ishandled) {
        console.log("ターゲットは撃破済みのため、反撃をスキップします");
        return; 
      }
      this.enemyAttack(COMBAT_BALANCE.correctAnswerEnemyAttackMultiplier);
    }, 1000);
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

      this.playerAttack(COMBAT_BALANCE.wrongAnswerPlayerCounterMultiplier);
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
    let selectedTypeName;
    if (candidateTypes.length > 0) {
      selectedTypeName = candidateTypes[Math.floor(Math.random() * candidateTypes.length)];
      EnemyClass = ENEMY_CLASSES[selectedTypeName];
    } else {
      // どこにも指定がない場合のみランダム（練習モード用など）
      const entries = Object.entries(ENEMY_CLASSES);
      const [typeName, enemyClass] = entries[Math.floor(Math.random() * entries.length)];
      selectedTypeName = typeName;
      EnemyClass = enemyClass;
    }

    this.enemy = new EnemyClass();
    applyEnemyRankStats(this.enemy, selectedTypeName, this.currentEnemyRank);
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
      const correct = window.quizManager?.correctAnswerCount ?? 0;
      bonusFromQuiz = Math.floor(Math.max(0, correct) / ENEMY_BALANCE.extraLevelEveryNCorrect);
    }

    const fallbackLevel = Math.max(1, Math.floor(playerLevel * ENEMY_BALANCE.fallbackPlayerLevelRatio));
    const baseLevel = stageLevel || fallbackLevel;
    const level = Math.max(1, baseLevel + bonusFromQuiz);
    enemy.level = level;
    const hpScale = 1 + (level - 1) * ENEMY_BALANCE.hpScalePerLevel;
    const statScale = 1 + (level - 1) * ENEMY_BALANCE.statScalePerLevel;
    const expScale = 1 + (level - 1) * ENEMY_BALANCE.expScalePerLevel;
    const maxExpReward = ENEMY_BALANCE.maxNormalExpReward;

    enemy.maxHp = Math.floor(enemy.maxHp * hpScale);
    enemy.hp = enemy.maxHp;
    enemy.baseAtk = Math.floor(enemy.baseAtk * statScale);
    enemy.baseDef = Math.floor(enemy.baseDef * statScale);
    enemy.mdf = Math.floor(enemy.mdf * statScale);
    const scaledExpReward = Math.floor(
      ((enemy.expReward || 5) * expScale) + (level * ENEMY_BALANCE.expFlatPerLevel)
    );

    enemy.expReward = Math.min(
      maxExpReward,
      Math.max(ENEMY_BALANCE.minExpReward, scaledExpReward)
    );
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

    // 【重要】敵を倒した瞬間にプレイヤー自身も死んでいたら、その場でゲームオーバー
    if (this.player.hp <= 0) {
      console.log("敵を倒しましたがプレイヤーも死亡しているため、ゲームオーバーにします");
      window.gameManager?.handleGameOver();
      return; 
    }

    // 次の敵を出すタイマー
    setTimeout(() => {
      if (this.player && this.player.hp <= 0) return;

      if (!window.quizManager.isVictoryActive) {
        this.enemySpawn();
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
    const bonus = streakCount >= 2
      ? Math.min(
          COMBAT_BALANCE.maxStreakMultiplier,
          1.0 + (streakCount * COMBAT_BALANCE.streakBonusPerCorrect)
        )
      : 1.0;
  
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
      "stage_26": "assets/images/stage_castle.png",
      "stage_27": "assets/images/stage_castle.png",
      "stage_28": "assets/images/stage_castle.png",
      "stage_29": "assets/images/stage_sakuraPath.png",
      "stage_30": "assets/images/stage_forestPath.png",
      "stage_31": "assets/images/stage_forestPath.png",
      "stage_32": "assets/images/stage_mountainPath2.png",
      "stage_33": "assets/images/stage_mountainPath2.png",
      "stage_34": "assets/images/stage_mountainPath2.png",
      "stage_35": "assets/images/stage_mountainPath2.png",
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
