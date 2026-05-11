import { Samurai } from "../characters/players/samurai.js";
import { Peasant } from "../characters/enemies/peasant.js";
import { Shougun } from "../characters/enemies/shougun.js";
import { Ninja } from "../characters/enemies/ninja.js";
import { quizManager } from "./quizManager.js";
import { refreshPlayerBuffIcons } from "./playerBuffIcons.js";
import { ENEMY_BALANCE } from "./balanceConfig.js";


export const battleManager = {
  player: null,
  enemy: null,
  bgImages: {},
  currentEnemyLevel: null,
  currentBossType: null,

  ///////////////////////////////////
  //    キャラクター・モンスターの生成
  ///////////////////////////////////
  init(savedStatus = null, bgKey = null, enemyType = null, enemyLevel = null, bossType = null) { // 引数で保存データを受け取れるようにする
    this.clearCharacters();
    this.setupBackgrounds();
    
    this.currentEnemyType = enemyType;
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
    this.enemySpawn(enemyType);
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

    const enemyTypes = { Peasant, Ninja, Shougun };
    const BossClass = enemyTypes[bossTypeName || this.currentBossType] || Ninja;

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
  enemySpawn(specifiedType = null) {
    if (this.enemy && this.enemy.el) {
      this.enemy.destroy();
    }
    
    // クラスを名前で引けるようにオブジェクト形式にする
    const enemyMap = { 
      "Peasant": Peasant, 
      "Ninja": Ninja, 
      "Shougun": Shougun 
    };

    let EnemyClass;
    // 引数指定 > 保持しているタイプ > デフォルト(Peasant) の順で決める
    const typeName = specifiedType || this.currentEnemyType;

    if (typeName && enemyMap[typeName]) {
      EnemyClass = enemyMap[typeName];
    } else {
      // どこにも指定がない場合のみランダム（練習モード用など）
      const classes = [Peasant, Ninja, Shougun];
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
    // ボスを倒した時はアニメを待たずに即時加算！
    this.player.exp += exp;
    
    // もし経験値が溢れたらレベルアップ処理
    while (this.player.exp >= this.player.maxExp) {
      this.player.exp -= this.player.maxExp;
      this.player.levelUp();
    }
    
    this.player.updateExpBar();
    window.quizManager.victory(); 
    return;
  }

  // ザコ敵は今まで通りアニメーションさせる
  this.player.gainExp(exp);

    // --- 以下は通常（ザコ戦）の処理 ---
    setTimeout(() => {
      // クイズがまだ終わっていない（ボス戦前）なら、次のザコ敵を出す
      if (!window.quizManager.isVictoryActive) {
        if (window.quizManager.quizMode === "normal") {
          this.enemySpawn();
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
      "stage_2": "assets/images/stage_village.png",
      "stage_3": "assets/images/stage_castle.png",
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
