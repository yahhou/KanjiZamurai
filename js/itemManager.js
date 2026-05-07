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
    apply,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.frame = frame;
    this.rarity = String(rarity || "common").toLowerCase();
    this.weight = weight;
    this.isWeapon = isWeapon;
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
    /*
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
    */

    ///////////////////////////////////////////
    // 　　　刀
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

    if (player?.weaponRarity) {

      const currentRank =
        this.rarityOrder[
          String(player.weaponRarity).toLowerCase()
        ];

      pool = pool.filter((item) => {

        // 武器以外は通す
        if (!item.isWeapon) {
          return true;
        }

        const itemRank =
          this.rarityOrder[
            String(item.rarity).toLowerCase()
          ];

        return itemRank >= currentRank;
      });
    }

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