import { assets } from "./assets.js";
import { battleManager } from "./battleManager.js";
import { EQUIPMENT_BALANCE } from "./balanceConfig.js";

export class Item {
  constructor({
    id,
    name,
    description,
    frame,
    rarity,
    weight,
    isWeapon = false,
    isHaori = false,
    isBand = false, // 追加
    isBeads = false,
    isRecovery = false,
    apply,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.frame = frame;
    this.rarity = String(rarity || "common").toLowerCase();
    this.weight = weight;
    this.isWeapon = isWeapon;
    this.isHaori = isHaori;
    this.isBand = isBand;
    this.isBeads = isBeads;
    this.isRecovery = isRecovery;
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

  getEquipmentDurabilityMax(slot, rarity) {
    const normalized = String(rarity || "common").toLowerCase();
    const tableMap = {
      weapon: EQUIPMENT_BALANCE.weaponDurabilityByRarity,
      haori: EQUIPMENT_BALANCE.haoriDurabilityByRarity,
      band: EQUIPMENT_BALANCE.bandDurabilityByRarity,
      beads: EQUIPMENT_BALANCE.beadsDurabilityByRarity,
    };
    const table = tableMap[slot] || tableMap.weapon;

    return table[normalized] || 0;
  },

  equipWeapon(player, multiplier, rarity) {
    if (!player) return;
    player.equipWeapon({
      rarity,
      multiplier,
      maxDurability: this.getEquipmentDurabilityMax("weapon", rarity),
    });
  },

  equipHaori(player, multiplier, rarity) {
    if (!player) return;
    player.equipHaori({
      rarity,
      multiplier,
      maxDurability: this.getEquipmentDurabilityMax("haori", rarity),
    });
  },

  equipBand(player, critRate, rarity) {
    if (!player) return;
    player.equipBand({
      rarity,
      critRate,
      maxDurability: this.getEquipmentDurabilityMax("band", rarity),
    });
  },

  equipBeads(player, eva, rarity) {
    if (!player) return;
    player.equipBeads({
      rarity,
      eva,
      maxDurability: this.getEquipmentDurabilityMax("beads", rarity),
    });
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
      isRecovery: true,
      apply(player) {
        const restoreAmount = Math.floor(player.maxHp * 0.5);
        player.hp = Math.min(player.maxHp, player.hp + restoreAmount);
        player.refreshStats();
      },
    }),
    new Item({//greenTea
      id: "green tea",
      name: "Green tea",
      description: "HP +3%/correct",
      frame: 1,
      rarity: "uncommon",
      isRecovery: true,
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
      isRecovery: true,
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
      description: "Atk +20%",
      frame: 3,
      rarity: "common",
      isWeapon: true,

      apply(player) {
        itemManager.equipWeapon(player, 1.2, "common");
      },
    }),

    new Item({
      id: "kiku-ichimonji",
      name: "Kiku-Ichimonji",
      description: "Atk +45%",
      frame: 4,
      rarity: "uncommon",
      isWeapon: true,

      apply(player) {
        itemManager.equipWeapon(player, 1.45, "uncommon");
      },
    }),

    new Item({
      id: "muramasa",
      name: "Muramasa",
      description: "Atk +75%",
      frame: 5,
      rarity: "rare",
      isWeapon: true,

      apply(player) {
        itemManager.equipWeapon(player, 1.75, "rare");
      },
    }),

    new Item({
      id: "masamune",
      name: "Masamune",
      description: "Atk +110%",
      frame: 6,
      rarity: "legendary",
      isWeapon: true,

      apply(player) {
        itemManager.equipWeapon(player, 2.1, "legendary");
      },
    }),

    new Item({
      id: "kusanagi-no-tsurugi",
      name: "Kusanagi-no-Tsurugi",
      description: "Atk +160%",
      frame: 7,
      rarity: "mythic",
      isWeapon: true,

      apply(player) {
        itemManager.equipWeapon(player, 2.6, "mythic");
      },
    }),


    ///////////////////////////////////////////
    // 　　　     羽織（防御力）
    ///////////////////////////////////////////
    new Item({
      id: "Worn Haori",
      name: "Worn Haori",
      description: "Def +15%",
      frame: 18,
      rarity: "common",
      isHaori: true,

      apply(player) {
        itemManager.equipHaori(player, 1.15, "common");
      },
    }),

    new Item({
      id: "Guardian Haori",
      name: "Guardian Haori",
      description: "Def +35%",
      frame: 19,
      rarity: "uncommon",
      isHaori: true,

      apply(player) {
        itemManager.equipHaori(player, 1.35, "uncommon");
      },
    }),

    new Item({
      id: "Kongou Haori",
      name: "Kongou Haori",
      description: "Def +60%",
      frame: 20,
      rarity: "rare",
      isHaori: true,

      apply(player) {
        itemManager.equipHaori(player, 1.6, "rare");
      },
    }),

    new Item({
      id: "Moonshadow Haori",
      name: "Moonshadow Haori",
      description: "Def +90%",
      frame: 21,
      rarity: "legendary",
      isHaori: true,

      apply(player) {
        itemManager.equipHaori(player, 1.9, "legendary");
      },
    }),

     new Item({
      id: "Yakumo Haori",
      name: "Yakumo Haori",
      description: "Def +130%",
      frame: 22,
      rarity: "mythic",
      isHaori: true,

      apply(player) {
        itemManager.equipHaori(player, 2.3, "mythic");
      },
    }),


     ///////////////////////////////////////////
    // 　　　      鉢金（会心率）
    ///////////////////////////////////////////
    new Item({
      id: "Novice Band",
      name: "Novice Band",
      description: "CRT -> 8%",
      frame: 8,
      rarity: "common",
      isBand: true,

      apply(player) {
        itemManager.equipBand(player, 8, "common");
      },
    }),

    new Item({
    id: "Insight Band",
      name: "Insight Band",
      description: "CRT -> 14%",
      frame: 9,
      rarity: "uncommon",
      isBand: true,

      apply(player) {
        itemManager.equipBand(player, 14, "uncommon");
      },
    }),

     new Item({
    id: "Mindeye Band",
      name: "Mindeye Band",
      description: "CRT -> 20%",
      frame: 10,
      rarity: "rare",
      isBand: true,

      apply(player) {
        itemManager.equipBand(player, 20, "rare");
      },
    }),

    new Item({
    id: "Demon Gaze Band",
      name: "Oni Eye Band",
      description: "CRT -> 27%",
      frame: 11,
      rarity: "legendary",
      isBand: true,

      apply(player) {
        itemManager.equipBand(player, 27, "legendary");
      },
    }),

    new Item({
    id: "Musou Band",
      name: "Musou Band",
      description: "CRT -> 35%",
      frame: 12,
      rarity: "mythic",
      isBand: true,

      apply(player) {
        itemManager.equipBand(player, 35, "mythic");
      },
    }),
    

    ///////////////////////////////////////////
    // 　　　      数珠(回避率)
    ///////////////////////////////////////////
    new Item({
    id: "Old Beads",
      name: "Old Beads",
      description: "Eva -> 8%",
      frame: 13,
      rarity: "common",
      isBeads: true,

      apply(player) {
        itemManager.equipBeads(player, 8, "common");
      },
    }),
    
    new Item({
    id: "Warding Beads",
      name: "Warding Beads",
      description: "Eva -> 13%",
      frame: 14,
      rarity: "uncommon",
      isBeads: true,

      apply(player) {
        itemManager.equipBeads(player, 13, "uncommon");
      },
    }),

    new Item({
    id: "Phantom Beads",
      name: "Phantom Beads",
      description: "Eva -> 18%",
      frame: 15,
      rarity: "rare",
      isBeads: true,

      apply(player) {
        itemManager.equipBeads(player, 18, "rare");
      },
    }),

    new Item({
    id: "Onyx Beads",
      name: "Onyx Beads",
      description: "Eva -> 24%",
      frame: 16,
      rarity: "legendary",
      isBeads: true,

      apply(player) {
        itemManager.equipBeads(player, 24, "legendary");
      },
    }),

    new Item({
    id: "Amaterasu Beads",
      name: "Amaterasu Beads",
      description: "Eva -> 30%",
      frame: 17,
      rarity: "mythic",
      isBeads: true,

      apply(player) {
        itemManager.equipBeads(player, 30, "mythic");
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
    filterAvailableItems(player) {
      let pool = [...this.items];

    ///////////////////////////////////////////
    // 装備武器より低いレア度を除外
    ///////////////////////////////////////////

    // --- レアリティ順序の定義（共通で使う） ---
    const getRank = (rarity) => this.rarityOrder[String(rarity).toLowerCase()] || 0;

    return pool.filter((item) => {
      // 1. 武器（isWeapon）のチェック
      if (item.isWeapon && player?.weaponRarity) {
        const currentWeaponRank = getRank(player.weaponRarity);
        const itemRank = getRank(item.rarity);
        if (itemRank < currentWeaponRank) return false;
      }
      
      // 2. 羽織（ここを追加！）
      if (item.isHaori && player?.haoriRarity) {
        const currentRank = getRank(player.haoriRarity);
        const itemRank = getRank(item.rarity);
        if (itemRank < currentRank) return false;
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
    },

    ///////////////////////////////////////////
    // 重み付きランダム
    ///////////////////////////////////////////
    pickWeightedItem(pool) {
      if (!pool.length) return null;

      const totalWeight = pool.reduce(
        (sum, item) => sum + this.getItemWeight(item),
        0
      );

      let roll = Math.random() * totalWeight;

      const index = pool.findIndex((item) => {
        roll -= this.getItemWeight(item);
        return roll <= 0;
      });

      return pool.splice(Math.max(0, index), 1)[0] || null;
    },

    pickItems(count, player, options = {}) {
    const pool = this.filterAvailableItems(player).filter((item) => {
      if (options.excludeRecovery && item.isRecovery) return false;
      return true;
    });
    const choices = [];

    if (options.guaranteeRecovery) {
      const recoveryPool = pool.filter((item) => item.isRecovery);
      const recoveryItem = this.pickWeightedItem(recoveryPool);
      if (recoveryItem) {
        choices.push(recoveryItem);
        const poolIndex = pool.findIndex((item) => item.id === recoveryItem.id);
        if (poolIndex >= 0) pool.splice(poolIndex, 1);
      }
    }

    while (choices.length < count && pool.length > 0) {
      const item = this.pickWeightedItem(pool);
      if (item) choices.push(item);
    }

    choices.sort(() => Math.random() - 0.5);
    return choices;
    },

  //////////////////////////////
  //     選択肢表示
  //////////////////////////////
    renderOptions(container, count = 2, options = {}) {

    if (!container) return;

    const choices = this.pickItems(
      count,
      battleManager.player,
      options
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
              background-image: url('assets/images/items-Sheet.webp');
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
