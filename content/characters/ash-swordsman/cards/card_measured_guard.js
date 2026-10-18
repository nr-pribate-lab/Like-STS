window.GameContent.characters["character_ash_swordsman"].cards.card_measured_guard = {
  id: "card_measured_guard",
  name: "量りの構え",
  description: "5ブロックを得る。このターン斬撃カードを使っていれば、カードを1枚引く。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [
    { type: "block", amount: 5 },
    { type: "conditional_draw", requiredTag: "strike", amount: 1 },
  ],
  upgrade: {
    description: "7ブロックを得る。このターン斬撃カードを使っていれば、カードを1枚引く。",
    effects: [
      { type: "block", amount: 7 },
      { type: "conditional_draw", requiredTag: "strike", amount: 1 },
    ],
  },
};
