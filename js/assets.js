/**
 * 画像・音声をまとめて読み込むオブジェクト。
 * loadAssets() はゲーム起動時に一度だけ呼ばれる想定です。
 */
export const assets = {
  images: {},
  sounds: {},

  loadAssets() {
    // --- プレイヤー関連 ---
    this.images.samurai = new Image();
    this.images.samurai.src = "assets/images/Samurai-Sheet.png";

    // --- UI ---
    this.images.ui_Kiwami = new Image();
    this.images.ui_Kiwami.src = "assets/images/KiwamiGauge-Sheet.png";

    this.images.ui_Items = new Image();
    this.images.ui_Items.src = "assets/images/items-Sheet.png";

    // --- BGM ---
    this.sounds.bgm_Battle = new Audio("assets/sounds/Battle1.mp3");
    this.sounds.bgm_Battle.load();
    this.sounds.bgm_Battle.loop = true;

    this.sounds.bgm_BossBattle = new Audio("assets/sounds/boss_battle.mp3");
    this.sounds.bgm_BossBattle.load();
    this.sounds.bgm_BossBattle.loop = true;

    this.sounds.bgm_victory = new Audio("assets/sounds/victory.mp3");

    // --- 効果音 ---
    this.sounds.sE_Samurai_AttakSound = new Audio("assets/sounds/attack1.mp3");
    this.sounds.sE_Enemy_AttakSound1 = new Audio("assets/sounds/enemyAttack1.mp3");
    this.sounds.sE_Samurai_Damage = new Audio("assets/sounds/samuraiDamage.mp3");
    this.sounds.sE_Evade = new Audio("assets/sounds/evade1.mp3");
    this.sounds.sE_Onmyoji_Spell = new Audio("assets/sounds/onmyouji_cast_spell.mp3");
    this.sounds.sE_Start_Button = new Audio("assets/sounds/StartButton.mp3");
    this.sounds.sE_Game_Over = new Audio("assets/sounds/gameOver.mp3");
    this.sounds.sE_CriticalHit = new Audio("assets/sounds/criticalHit.mp3");
    this.sounds.sE_LevelUp = new Audio("assets/sounds/levelUp.mp3");
    this.sounds.sE_ItemBonus = new Audio("assets/sounds/itemBonus.mp3");
  },
};
