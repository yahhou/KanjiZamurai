import { itemManager } from "./itemManager.js";

const ITEMS_SHEET_URL = "assets/images/items-Sheet.webp";

function getEquippedItem(typeKey, rarity) {
  if (!rarity) return null;

  return itemManager.items.find(
    (candidate) => candidate[typeKey] && candidate.rarity === rarity
  ) || null;
}

/**
 * HP数字の下に出す装備・状態アイコン定義。
 * 回復だけの消費アイテムはここに入れない。
 */
export const PLAYER_STATUS_ICON_SOURCES = [
  {
    id: "weapon",
    title: "武器",
    getItem: (player) => getEquippedItem("isWeapon", player?.weaponRarity),
    isActive: (player) => player?.isWeaponEquipped === true,
  },
  {
    id: "haori",
    title: "羽織",
    getItem: (player) => getEquippedItem("isHaori", player?.haoriRarity),
    isActive: (player) => player?.isHaoriEquipped === true,
  },
  {
    id: "band",
    title: "鉢金",
    getItem: (player) => getEquippedItem("isBand", player?.bandRarity),
    isActive: (player) => player?.isBandEquipped === true,
  },
  {
    id: "beads",
    title: "数珠",
    getItem: (player) => getEquippedItem("isBeads", player?.beadsRarity),
    isActive: (player) => player?.isBeadsEquipped === true,
  },
  {
    id: "regeneration",
    title: "リジェネ（緑茶）",
    getItem: () => itemManager.getItem("green tea"),
    isActive: (player) => player?.isRegenerating === true,
  },
];

////////////////////////////////////////////////////////////////
 /* #player-buff-icons を、いまアクティブなバフだけで上から順に描き直す。
  複数あるときは配列の順（上→下）で並ぶ。*/
///////////////////////////////////////////////////////////////
export function refreshPlayerBuffIcons() {
  const root = document.getElementById("player-buff-icons");
  if (!root) return;

  const player = window.battleManager?.player;
  root.innerHTML = "";

  const frameCount = itemManager.getFrameCount();
  const activeDefs = PLAYER_STATUS_ICON_SOURCES.filter((def) => def.isActive(player));

  for (const def of activeDefs) {
    const item = def.getItem(player);
    if (!item) continue;

    const cell = document.createElement("div");
    const rarityClass = String(item.rarity || "common").toLowerCase().replace(/\s+/g, "-");
    cell.className = `player-buff-icon rarity-${rarityClass}`;
    cell.dataset.buffId = def.id;
    cell.setAttribute("role", "img");

    const body = document.createElement("div");
    body.className = "player-buff-icon-body";

    const pos = itemManager.getFramePosition(item.frame, frameCount);
    const sprite = document.createElement("div");
    sprite.className = "player-buff-icon-sprite";
    sprite.style.backgroundImage = `url('${ITEMS_SHEET_URL}')`;
    sprite.style.backgroundSize = `${frameCount * 100}% 100%`;
    sprite.style.backgroundPosition = `${pos}% 0`;
    sprite.style.backgroundRepeat = "no-repeat";
    sprite.style.imageRendering = "pixelated";

    body.appendChild(sprite);

    if (def.id === "weapon" || def.id === "haori" || def.id === "band" || def.id === "beads") {
      const durability = document.createElement("div");
      durability.className = "player-buff-durability";
      const currentMap = {
        weapon: player?.weaponDurability,
        haori: player?.haoriDurability,
        band: player?.bandDurability,
        beads: player?.beadsDurability,
      };
      const maxMap = {
        weapon: player?.weaponMaxDurability,
        haori: player?.haoriMaxDurability,
        band: player?.bandMaxDurability,
        beads: player?.beadsMaxDurability,
      };
      const current = currentMap[def.id];
      const max = maxMap[def.id];
      const text = `${Math.max(0, current || 0)}/${Math.max(0, max || 0)}`;
      cell.title = `${def.title} ${text}`;
      durability.textContent = text;
      body.appendChild(durability);
    } else {
      cell.title = def.title;
    }

    cell.appendChild(body);

    root.appendChild(cell);
  }
}
