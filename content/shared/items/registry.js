window.GameContent = window.GameContent || {};
window.GameContent.items = window.GameContent.items || {};
window.GameContentItemHandlers = window.GameContentItemHandlers || {};
window.GameContent.items["item_healing_potion"] = {
  id: "item_healing_potion",
  name: "回復薬",
  description: "体力を20回復する。",
  price: 40,
  townCategory: "medicine",
};
window.GameContent.items["item_energy_tonic"] = {
  id: "item_energy_tonic",
  name: "活力薬",
  description: "このターンのエネルギーを1得る。",
  price: 30,
  townCategory: "medicine",
};
window.GameContent.items["item_guarding_tonic"] = {
  id: "item_guarding_tonic",
  name: "護りの薬",
  description: "8ブロックを得る。",
  price: 30,
  townCategory: "medicine",
};
window.GameContent.items.item_flash_bomb = { id: "item_flash_bomb", name: "閃光弾", description: "すべての敵に10ダメージを与える。", price: 45 };
window.GameContent.items.item_berserker_draught = { id: "item_berserker_draught", name: "猛りの霊薬", description: "このターン、筋力を3得る。", price: 45, townCategory: "medicine" };
window.GameContent.items.item_draw_scroll = { id: "item_draw_scroll", name: "追い風の巻物", description: "カードを2枚引く。", price: 40 };
window.GameContent.items.item_purifying_smoke = { id: "item_purifying_smoke", name: "清めの煙", description: "自分の弱体を解除する。", price: 25 };
window.GameContent.items.item_black_sand = { id: "item_black_sand", name: "黒砂時計", description: "選んだ敵の次の行動を1回だけ止める。", price: 50 };
window.GameContent.items.item_lucky_shard = { id: "item_lucky_shard", name: "幸運の欠片", description: "ラン中の所持金を15$得る。", price: 35 };
window.GameContent.items.item_recall_feather = { id: "item_recall_feather", name: "呼び戻しの羽", description: "捨て札からカードを1枚、ランダムに手札へ戻す。", price: 35 };
window.GameContent.items.item_shatter_paste = { id: "item_shatter_paste", name: "砕き膏", description: "選んだ敵のブロックをすべて取り除く。", price: 30 };
