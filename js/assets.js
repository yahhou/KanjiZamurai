
export const assets = {
  images: {},
  sounds: {}, 

  loadAssets() {
  
  /* ==========================================================================
  プレイヤー＆サポーター
  ========================================================================== */

  this.images.samurai = new Image();
  this.images.samurai.src = 'assets/images/Samurai-Sheet.png';

  this.images.onmyoji = new Image();
  this.images.onmyoji.src = 'assets/images/Onmyoji-Sheet.png';
  
 /* ==========================================================================
  敵
  ========================================================================== */

  assets.images.peasant = new Image();
  assets.images.peasant.src = 'assets/images/peasant-Sheet.png'; 

  this.images.pirate = new Image();
  this.images.pirate.src = 'assets/images/pirate-Sheet.png';

  this.images.soldier = new Image();
  this.images.soldier.src = 'assets/images/Soldier-Sheet.png';

  this.images.mage = new Image();
  this.images.mage.src = 'assets/images/mage.png';

  this.images.ninja = new Image();
  this.images.ninja.src = 'assets/images/Ninja-Sheet.png';

  this.images.shougun = new Image();
  this.images.shougun.src = 'assets/images/Shougun-Sheet.png';

  this.images.dragon = new Image();
  this.images.dragon.src = 'assets/images/dragon-Sheet.png';
  
  /* ==========================================================================
  UI
  ========================================================================== */

  this.images.ui_Kiwami = new Image();
  this.images.ui_Kiwami.src = 'assets/images/Kiwami-Sheet.png';

  this.images.ui_Items = new Image();
  this.images.ui_Items.src = 'assets/images/items-Sheet-Sheet.png';
  
  /* ==========================================================================
  BGM
  ========================================================================== */

  this.sounds.bgm_Battle = new Audio('assets/sounds/battle1.mp3');
  this.sounds.bgm_Battle.load();
  this.sounds.bgm_Battle.loop = true;
  
  this.sounds.bgm_victory = new Audio('assets/sounds/victory.mp3');
  
  /* ==========================================================================
  SE
  ========================================================================== */

  this.sounds.sE_Samurai_AttakSound = new Audio('assets/sounds/attack1.mp3');
  this.sounds.sE_Enemy_AttakSound1 = new Audio('assets/sounds/enemyAttack1.mp3');
  this.sounds.sE_Samurai_Damage = new Audio('assets/sounds/samuraiDamage.mp3');
  this.sounds.sE_Evade = new Audio('assets/sounds/evade1.mp3');
  this.sounds.sE_Onmyoji_Spell = new Audio('assets/sounds/onmyouji_cast_spell.mp3');
  this.sounds.sE_Start_Button = new Audio('assets/sounds/StartButton.mp3');
  this.sounds.sE_Game_Over = new Audio('assets/sounds/gameOver.mp3');
   this.sounds.sE_CriticalHit = new Audio('assets/sounds/criticalHit.mp3');
  }
};
