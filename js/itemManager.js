import { assets } from "./assets.js";
import { battleManager } from "./battleManager.js";
import { gameManager } from "./gameManager.js";

export class Item {
  constructor({
    id,
    name,
    description,
    frame,
    rarity,
    weight,
    isWeapon = false,
    isBand = false, // 追加
    isBeads = false,
    apply,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.frame = frame;
    this.rarity = String(rarity || "common").toLowerCase();
    this.weight = weight;
    this.isWeapon = isWeapon;
    this.isBand = isBand;
    this.isBeads = isBeads;
    this.apply = apply;
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const itemManager = {

  //////////////////////////////
  //     レアリティ設定
  //////////////////////////////
  rarities: {
    common: { label: "Common", weight: 60 },
    uncommon: { label: "Uncommon", weight: 40 },
    rare: { label: "Rare", weight: 25 },
    legendary: { label: "Legendary", weight: 10 },
    mythic: { label: "Mythic", weight: 3 },
  },

  //////////////////////////////
  //     レア度順
  //////////////////////////////
  rarityOrder: {
    common: 0,
    uncommon: 1,
    rare: 2,
    legendary: 3,
    mythic: 4,
  },

  //////////////////////////////
  //     アイテム一覧
  //////////////////////////////
  items: [
    ///////////////////////////////////////////
    //          回復
    ///////////////////////////////////////////

    new Item({//onigiri
      id: "onigiri",
      name: "Onigiri",
      description: "HP 50%Restore",
      frame: 0,
      rarity: "common",
      apply(player) {
        const restoreAmount = Math.floor(player.maxHp * 0.5);
        player.hp = Math.min(player.maxHp, player.hp + restoreAmount);
        player.refreshStats();
      },
    }),
    new Item({//greenTea
      id: "green tea",
      name: "Green tea",
      description: "HP +3%/turn",
      frame: 1,
      rarity: "uncommon",
      apply(player) {
        player.isRegenerating = true;
      },
    }),
    new Item({//dango
      id: "dango",
      name: "Dango",
      description: "HP FullRestore",
      frame: 2,
      rarity: "rare",
      apply(player) {
        player.hp = player.maxHp;
        player.refreshStats();
      },
    }),

    ///////////////////////////////////////////
    // 　　　      刀
    ///////////////////////////////////////////

    new Item({
      id: "kanesada",
      name: "Kanesada",
      description: "Atk +150%",
      frame: 3,
      rarity: "common",
      isWeapon: true,

      apply(player) {
        player.isWeaponEquipped = true;
        player.weaponMultiplier = 1.5;
        player.weaponRarity = "common";

        player.refreshStats();
      },
    }),

    new Item({
      id: "kiku-ichimonji",
      name: "Kiku-Ichimonji",
      description: "Atk +200%",
      frame: 4,
      rarity: "uncommon",
      isWeapon: true,

      apply(player) {
        player.isWeaponEquipped = true;
        player.weaponMultiplier = 2;
        player.weaponRarity = "uncommon";

        player.refreshStats();
      },
    }),

    new Item({
      id: "muramasa",
      name: "Muramasa",
      description: "Atk +300%",
      frame: 5,
      rarity: "rare",
      isWeapon: true,

      apply(player) {
        player.isWeaponEquipped = true;
        player.weaponMultiplier = 3;
        player.weaponRarity = "rare";

        player.refreshStats();
      },
    }),

    new Item({
      id: "masamune",
      name: "Masamune",
      description: "Atk +400%",
      frame: 6,
      rarity: "legendary",
      isWeapon: true,

      apply(player) {
        player.isWeaponEquipped = true;
        player.weaponMultiplier = 4;
        player.weaponRarity = "legendary";

        player.refreshStats();
      },
    }),

    new Item({
      id: "kusanagi-no-tsurugi",
      name: "Kusanagi-no-Tsurugi",
      description: "Atk +500%",
      frame: 7,
      rarity: "mythic",
      isWeapon: true,

      apply(player) {
        player.isWeaponEquipped = true;
        player.weaponMultiplier = 6;
        player.weaponRarity = "mythic";

        player.refreshStats();
      },
    }),

     ///////////////////////////////////////////
    // 　　　      鉢金（会心率）
    ///////////////////////////////////////////
    new Item({
    id: "Novice Band",
      name: "Novice Band",
      description: "CRT → 10%",
      frame: 8,
      rarity: "common",
      isBand: true,

      apply(player) {
        player.isBandEquipped = true;
        player.critRate = 10;
        player.bandRarity = "common";

        player.refreshStats();
      },
    }),

    new Item({
    id: "Insight Band",
      name: "Insight Band",
      description: "CRT → 20%",
      frame: 9,
      rarity: "uncommon",
      isBand: true,

      apply(player) {
        player.isBandEquipped = true;
        player.critRate = 20;
        player.bandRarity = "uncommon";

        player.refreshStats();
      },
    }),

     new Item({
    id: "Mindeye Band",
      name: "Mindeye Band",
      description: "CRT → 30%",
      frame: 10,
      rarity: "rare",
      isBand: true,

      apply(player) {
        player.isBandEquipped = true;
        player.critRate = 30;
        player.bandRarity = "rare";

        player.refreshStats();
      },
    }),

    new Item({
    id: "Demon Gaze Band",
      name: "Oni Eye Band",
      description: "CRT → 40%",
      frame: 11,
      rarity: "legendary",
      isBand: true,

      apply(player) {
        player.isBandEquipped = true;
        player.critRate = 40;
        player.bandRarity = "legendary";

        player.refreshStats();
      },
    }),

    new Item({
    id: "Musou Band",
      name: "Musou Band",
      description: "CRT → 70%",
      frame: 12,
      rarity: "mythic",
      isBand: true,

      apply(player) {
        player.isBandEquipped = true;
        player.critRate = 70;
        player.bandRarity = "mythic";

        player.refreshStats();
      },
    }),
    
    ///////////////////////////////////////////
    // 　　　      数珠(回避率)
    ///////////////////////////////////////////
    new Item({
    id: "Old Beads",
      name: "Old Beads",
      description: "DEV → 10%",
      frame: 13,
      rarity: "common",
      isBeads: true,

      apply(player) {
        player.isBeadsEquipped = true;
        player.eva = 10;
        player.beadsRarity = "common";

        player.refreshStats();
      },
    }),
    
    new Item({
    id: "Warding Beads",
      name: "Warding Beads",
      description: "DEV → 20%",
      frame: 14,
      rarity: "uncommon",
      isBeads: true,

      apply(player) {
        player.isBeadsEquipped = true;
        player.eva = 20;
        player.beadsRarity = "uncommon";

        player.refreshStats();
      },
    }),

    new Item({
    id: "Phantom Beads",
      name: "Phantom Beads",
      description: "DEV → 30%",
      frame: 15,
      rarity: "rare",
      isBeads: true,

      apply(player) {
        player.isBeadsEquipped = true;
        player.eva = 30;
        player.beadsRarity = "rare";

        player.refreshStats();
      },
    }),

    new Item({
    id: "Onyx Beads",
      name: "Onyx Beads",
      description: "DEV → 40%",
      frame: 16,
      rarity: "legendary",
      isBeads: true,

      apply(player) {
        player.isBeadsEquipped = true;
        player.eva = 40;
        player.beadsRarity = "legendary";

        player.refreshStats();
      },
    }),

    new Item({
    id: "Amaterasu Beads",
      name: "Amaterasu Beads",
      description: "DEV → 70%",
      frame: 17,
      rarity: "mythic",
      isBeads: true,

      apply(player) {
        player.isBeadsEquipped = true;
        player.eva = 70;
        player.beadsRarity = "mythic";

        player.refreshStats();
      },
    }),
  ],

  //////////////////////////////
  //     アイテム取得
  //////////////////////////////
    getItem(id) {
      return this.items.find((item) => item.id === id);
    },

  //////////////////////////////
  //     レアリティ取得
  //////////////////////////////
    getRarity(item) {
    const key = String(item.rarity || "common").toLowerCase();
    return this.rarities[key] || this.rarities.common;
    },

  //////////////////////////////
  //     重み取得
  //////////////////////////////
    getItemWeight(item) {
      return item.weight || this.getRarity(item).weight;
    },

  //////////////////////////////
  //     抽選
  //////////////////////////////
    pickItems(count, player) {

    
    let pool = [...this.items];
    ///////////////////////////////////////////
    // 装備武器より低いレア度を除外
    ///////////////////////////////////////////

    // --- レアリティ順序の定義（共通で使う） ---
    const getRank = (rarity) => this.rarityOrder[String(rarity).toLowerCase()] || 0;

    pool = pool.filter((item) => {
      // 1. 武器（isWeapon）のチェック
      if (item.isWeapon && player?.weaponRarity) {
        const currentWeaponRank = getRank(player.weaponRarity);
        const itemRank = getRank(item.rarity);
        if (itemRank < currentWeaponRank) return false;
      }

      // 2. 鉢金（仮に isBand プロパティがある場合）のチェック
      // アイテムデータに "isBand: true" を持たせるのが理想的です
      if (item.isBand && player?.bandRarity) {
        const currentBandRank = getRank(player.bandRarity);
        const itemRank = getRank(item.rarity);
        if (itemRank < currentBandRank) return false;
      }

      if (item.isBeads && player?.beadsRarity) {
        const currentBandRank = getRank(player.beadsRarity);
        const itemRank = getRank(item.rarity);
        if (itemRank < currentBandRank) return false;
      }

      return true;
    });

    ///////////////////////////////////////////
    // 重み付きランダム
    ///////////////////////////////////////////

    const choices = [];

    while (choices.length < count && pool.length > 0) {

      const totalWeight = pool.reduce(
        (sum, item) => sum + this.getItemWeight(item),
        0
      );

      let roll = Math.random() * totalWeight;

      const index = pool.findIndex((item) => {
        roll -= this.getItemWeight(item);
        return roll <= 0;
      });

      choices.push(...pool.splice(Math.max(0, index), 1));
    }

    return choices;
    },

  //////////////////////////////
  //     選択肢表示
  //////////////////////////////
    renderOptions(container, count = 2) {

    if (!container) return;

    const choices = this.pickItems(
      count,
      battleManager.player
    );

    const frameCount = this.getFrameCount();

    container.innerHTML = `
      <h2>Choose one</h2>

      <div class="item-choice-list">
        ${choices
          .map((item) =>
            this.renderItemButton(item, frameCount)
          )
          .join("")}
      </div>
    `;
    },

  //////////////////////////////
  //     ボタンHTML
  //////////////////////////////
    renderItemButton(item, frameCount) {

    const rarityClass =
      String(item.rarity || "common")
        .toLowerCase()
        .replace(/\s+/g, "-");

    return `
      <button
        type="button"
        class="item-choice rarity-${escapeHtml(rarityClass)}"
        data-id="${escapeHtml(item.id)}"
      >

        <div class="item-icon-wrapper">

          <span
            class="item-icon"
            style="
              background-image: url('assets/images/items-Sheet.png');
              background-size: ${frameCount * 100}% 100%;
              background-position:
                ${this.getFramePosition(item.frame, frameCount)}% 0;
            "
          ></span>

        </div>

        <div class="item-info">

          <div class="item-name">
            ${escapeHtml(item.name)}
          </div>

          <div class="item-description">
            ${escapeHtml(item.description)}
          </div>

        </div>

      </button>
    `;
  },

  ///////////////////////////////////////////
  // スプライト分割数
  ///////////////////////////////////////////
    getFrameCount() {

    const image = assets.images.ui_Items;

    return image?.naturalWidth
      ? Math.max(1, Math.floor(image.naturalWidth / 32))
      : 3;
  },

  //////////////////////////////
  //     アイコン位置
  //////////////////////////////
    getFramePosition(frame, frameCount) {

    return frameCount <= 1
      ? 0
      : (frame / (frameCount - 1)) * 100;
  },

  //////////////////////////////
  //     アイテム適用
  //////////////////////////////
    applyItem(itemId, player) {

    const item = this.getItem(itemId);

    if (!item || !player) return;

    item.apply(player);
  },
};