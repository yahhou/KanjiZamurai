import { itemManager } from "./itemManager.js";

const ITEMS_SHEET_URL = "assets/images/items-Sheet-Sheet.png";

/**
 * プレイヤー横の「バフアイコン」行に出す定義。
 * 新しいアイテム効果を足すときは、ここにオブジェクトを1行追加する。
 *
 * - id: DOM の data-buff-id（デバッグ用）
 * - title: ホバー時の説明
 * - itemFrame: items-Sheet-Sheet.png のフレーム番号（itemManager の Item と同じ）
 * - isActive: そのバフが付いているか
 */
export const PLAYER_BUFF_SOURCES = [
  {
    id: "regeneration",
    title: "リジェネ（緑茶）",
    itemFrame: 1,
    isActive: (player) => player?.isRegenerating === true,
  },
];

/**
 * #player-buff-icons を、いまアクティブなバフだけで上から順に描き直す。
 * 複数あるときは配列の順（上→下）で並ぶ。
 */
export function refreshPlayerBuffIcons() {
  const root = document.getElementById("player-buff-icons");
  if (!root) return;

  const player = window.battleManager?.player;
  root.innerHTML = "";

  const frameCount = itemManager.getFrameCount();
  const activeDefs = PLAYER_BUFF_SOURCES.filter((def) => def.isActive(player));

  for (const def of activeDefs) {
    const cell = document.createElement("div");
    cell.className = "player-buff-icon";
    cell.dataset.buffId = def.id;
    cell.title = def.title;
    cell.setAttribute("role", "img");

    const pos = itemManager.getFramePosition(def.itemFrame, frameCount);
    cell.style.backgroundImage = `url('${ITEMS_SHEET_URL}')`;
    cell.style.backgroundSize = `${frameCount * 100}% 100%`;
    cell.style.backgroundPosition = `${pos}% 0`;
    cell.style.backgroundRepeat = "no-repeat";
    cell.style.imageRendering = "pixelated";

    root.appendChild(cell);
  }
}
