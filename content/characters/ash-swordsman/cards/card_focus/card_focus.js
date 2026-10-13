window.GameContent.characters["character_ash_swordsman"].cards["card_focus"] = {
  id: "card_focus",
  name: "集中",
  description: "3ブロックを得て、カードを1枚引く。",
  type: "skill",
  target: "self",
  cost: 1,
  rarity: 1,
  rewardWeight: 7,
  shopWeight: 4,
  effects: [
    { type: "block", amount: 3 },
    { type: "draw", amount: 1 },
  ],
  upgrade: {
    description: "5ブロックを得て、カードを1枚引く。",
    effects: [
      { type: "block", amount: 5 },
      { type: "draw", amount: 1 },
    ],
  },
};
