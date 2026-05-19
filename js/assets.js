const MUTE_STORAGE_KEY = "rpg_game_muted";

function readMutedPreference() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMutedPreference(isMuted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, isMuted ? "1" : "0");
  } catch {
    // ignore storage failures
  }
}

const audioRegistry = new Set();
let muted = readMutedPreference();

export function registerAudio(audio) {
  if (!audio) return audio;
  audio.muted = muted;
  audioRegistry.add(audio);
  return audio;
}

export function setAudioMuted(nextMuted) {
  muted = Boolean(nextMuted);
  audioRegistry.forEach((audio) => {
    audio.muted = muted;
  });
  writeMutedPreference(muted);
  return muted;
}

export function toggleAudioMuted() {
  return setAudioMuted(!muted);
}

export function isAudioMuted() {
  return muted;
}

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
    this.images.samurai.src = "assets/images/Samurai-Sheet.webp";

    // --- UI ---
    this.images.ui_Kiwami = new Image();
    this.images.ui_Kiwami.src = "assets/images/KiwamiGauge-Sheet.webp";

    this.images.ui_Items = new Image();
    this.images.ui_Items.src = "assets/images/items-Sheet.webp";

    // --- BGM ---
    this.sounds.bgm_Battle = new Audio("assets/sounds/Battle1.mp3");
    registerAudio(this.sounds.bgm_Battle);
    this.sounds.bgm_Battle.load();
    this.sounds.bgm_Battle.loop = true;

    this.sounds.bgm_victory = new Audio("assets/sounds/victory.mp3");
    registerAudio(this.sounds.bgm_victory);

    // --- 効果音 ---
    this.sounds.sE_Samurai_AttakSound = new Audio("assets/sounds/attack1.mp3");
    registerAudio(this.sounds.sE_Samurai_AttakSound);
    this.sounds.sE_Enemy_AttakSound1 = new Audio("assets/sounds/enemyAttack1.mp3");
    registerAudio(this.sounds.sE_Enemy_AttakSound1);
    this.sounds.sE_Samurai_Damage = new Audio("assets/sounds/samuraiDamage.mp3");
    registerAudio(this.sounds.sE_Samurai_Damage);
    this.sounds.sE_Evade = new Audio("assets/sounds/evade1.mp3");
    registerAudio(this.sounds.sE_Evade);
    this.sounds.sE_Onmyoji_Spell = new Audio("assets/sounds/onmyouji_cast_spell.mp3");
    registerAudio(this.sounds.sE_Onmyoji_Spell);
    this.sounds.sE_Start_Button = new Audio("assets/sounds/StartButton.mp3");
    registerAudio(this.sounds.sE_Start_Button);
    this.sounds.sE_Game_Over = new Audio("assets/sounds/gameOver.mp3");
    registerAudio(this.sounds.sE_Game_Over);
    this.sounds.sE_CriticalHit = new Audio("assets/sounds/criticalHit.mp3");
    registerAudio(this.sounds.sE_CriticalHit);
    this.sounds.sE_LevelUp = new Audio("assets/sounds/levelUp.mp3");
    registerAudio(this.sounds.sE_LevelUp);
    this.sounds.sE_ItemBonus = new Audio("assets/sounds/itemBonus.mp3");
    registerAudio(this.sounds.sE_ItemBonus);
  },
};
