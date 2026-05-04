import { assets } from './assets.js';

export class Item {
  constructor({ id, name, description, frame, rarity, weight, apply }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.frame = frame;
    this.rarity = rarity;
    this.weight = weight;
    this.apply = apply;
  }
}

export const itemManager = {
  rarities: {
    common: { label: 'Common', weight: 60 },
    uncommon: { label: 'Uncommon', weight: 40 },
    rare: { label: 'Rare', weight: 25 },
    legendary: { label: 'Legendary', weight: 10 },
    mythic: { label: 'Mythic', weight: 3 }
  },

  items: [
    new Item({
      id: 'onigiri',
      name: 'Onigiri',
      description: 'HP 50% Restore',
      frame: 0,
      rarity: 'common',
      apply(player) {
        const restoreAmount = Math.floor(player.maxHp * 0.5);
        player.hp = Math.min(player.maxHp, player.hp + restoreAmount);
        player.updateHPBar();
      }
    }),
    new Item({
      id: 'green tea',
      name: 'Green tea',
      description: 'HP +3%',
      frame: 1,
      rarity: 'Uncommon',
      apply(player) {
        player.isRegenerating = true; // 自動回復フラグをON
      }
    }),
    new Item({
      id: 'dango',
      name: 'Dango',
      description: 'HP Full Restore',
      frame: 2,
      rarity: 'Rare',
      apply(player) {
        player.hp = player.maxHp;
        player.updateHPBar()
      }
    })
  ],

  getItem(id) {
    return this.items.find(item => item.id === id);
  },

  getRarity(item) {
    return this.rarities[item.rarity] || this.rarities.common;
  },

  getItemWeight(item) {
    return item.weight || this.getRarity(item).weight;
  },

  pickItems(count) {
    const pool = [...this.items];
    const choices = [];

    while (choices.length < count && pool.length > 0) {
      const totalWeight = pool.reduce((sum, item) => sum + this.getItemWeight(item), 0);
      let roll = Math.random() * totalWeight;
      const index = pool.findIndex(item => {
        roll -= this.getItemWeight(item);
        return roll <= 0;
      });

      choices.push(...pool.splice(Math.max(0, index), 1));
    }

    return choices;
  },

  renderOptions(container, count = 2) {
    if (!container) return;

    const choices = this.pickItems(count);
    const frameCount = this.getFrameCount();

    container.innerHTML = `
      <h2>Choose one</h2>
      <div class="item-choice-list">
        ${choices.map(item => this.renderItemButton(item, frameCount)).join("")}
      </div>
    `;
  },

  renderItemButton(item, frameCount) {
  const rarity = this.getRarity(item);

  return `
    <button class="item-choice rarity-${item.rarity.toLowerCase()}" onclick="gameManager.selectItem('${item.id}')">
      <!-- アイコンを上に配置 -->
      <div class="item-icon-wrapper">
        <span
          class="item-icon"
          style="
            background-image: url('assets/images/items-Sheet-Sheet.png');
            background-size: ${frameCount * 100}% 100%;
            background-position: ${this.getFramePosition(item.frame, frameCount)}% 0;
          "
        ></span>
      </div>
      
      <!-- テキスト情報を下に配置 -->
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
      </div>
    </button>
  `;
},

  getFrameCount() {
    const image = assets.images.ui_Items;
    return image?.naturalWidth ? Math.max(1, Math.floor(image.naturalWidth / 32)) : 3;
  },

  getFramePosition(frame, frameCount) {
    return frameCount <= 1 ? 0 : (frame / (frameCount - 1)) * 100;
  },

  applyItem(itemId, player) {
    const item = this.getItem(itemId);
    if (!item || !player) return;

    item.apply(player);
  }
};
