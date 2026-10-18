window.GameContent.characters["character_ash_swordsman"].cards.card_perfect_rhythm = {
  id: "card_perfect_rhythm",
  name: "交互の拍",
  description: "このターン、手札の斬撃・防御カードの効果を2倍にする。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 5, shopWeight: 4,
  effects: [{ type: "double_tag_effects", tags: ["strike", "defense"] }],
  upgrade: { description: "このターン、手札の斬撃・防御カードの効果を2倍にする。カードを1枚引く。", effects: [{ type: "double_tag_effects", tags: ["strike", "defense"] }, { type: "draw", amount: 1 }] },
};
