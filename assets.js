
const assets = {
  images: {},
  sounds: {} // audio ではなく、呼び出し名に合わせた sounds に統一
};

function loadAssets() {
  // --- 味方 ---
  assets.images.samurai = new Image();
  assets.images.samurai.src = 'assets/images/Samurai-Sheet.png';

  assets.images.onmyoji = new Image();
  assets.images.onmyoji.src = 'assets/images/Onmyoji-Sheet.png';
  
  // --- 敵 ---
  assets.images.peasant = new Image();
  assets.images.peasant.src = 'assets/images/peasant-Sheet.png'; 

  assets.images.pirate = new Image();
  assets.images.pirate.src = 'assets/images/pirate-Sheet.png';

  assets.images.soldier = new Image();
  assets.images.soldier.src = 'assets/images/Soldier-Sheet.png';

  assets.images.mage = new Image();
  assets.images.mage.src = 'assets/images/mage.png';

  assets.images.ninja = new Image();
  assets.images.ninja.src = 'assets/images/Ninja-Sheet.png';

  assets.images.shougun = new Image();
  assets.images.shougun.src = 'assets/images/Shougun-Sheet.png';

  assets.images.dragon = new Image();
  assets.images.dragon.src = 'assets/images/dragon-Sheet.png';
  
  // --- UI ---
  assets.images.ui_Kiwami = new Image();
  assets.images.ui_Kiwami.src = 'assets/images/Kiwami-Sheet.png';
  
  // --- Sounds (new Audio を使用) ---
  assets.sounds.bgm_Battle = new Audio('assets/sounds/battle1.mp3');
  assets.sounds.bgm_victory = new Audio('assets/sounds/victory.mp3');
  assets.sounds.bgm_victory.preload = "auto";
  assets.sounds.bgm_GameOver = new Audio('assets/sounds/gameover.mp3');
  
  // --- SE ---
  assets.sounds.sE_Samurai_AttakSound = new Audio('assets/sounds/attack1.mp3');
  assets.sounds.sE_Samurai_Damage = new Audio('assets/sounds/samuraidamage.mp3');
  assets.sounds.sE_Evade = new Audio('assets/sounds/evade1.mp3');
  assets.sounds.sE_Onmyoji_Spell = new Audio('assets/sounds/onmyouji_cast_spell.mp3');
}