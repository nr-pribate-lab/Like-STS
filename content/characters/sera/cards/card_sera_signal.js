window.GameContent.characters.character_sera.cards.card_sera_signal = {
  id: "card_sera_signal", name: "合図の守り", description: "4ブロックを得て、カードを1枚引く。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 5, shopWeight: 4,
  effects: [{ type: "block", amount: 4 }, { type: "draw", amount: 1 }],
  upgrade: { description: "6ブロックを得て、カードを1枚引く。", effects: [{ type: "block", amount: 6 }, { type: "draw", amount: 1 }] },
};
