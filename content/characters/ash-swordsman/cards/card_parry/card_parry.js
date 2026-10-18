window.GameContent.characters["character_ash_swordsman"].cards["card_parry"] = {
  id: "card_parry",
  name: "受け流し",
  description: "敵1体に4ダメージを与え、4ブロックを得る。",
  type: "skill",
  target: "enemy",
  cost: 1,
  rarity: 1,
  rewardWeight: 5,
  shopWeight: 4,
  effects: [
    { type: "damage", amount: 4 },
    { type: "block", amount: 4, target: "self" },
  ],
  upgrade: {
    description: "敵1体に6ダメージを与え、5ブロックを得る。",
    effects: [
      { type: "damage", amount: 6 },
      { type: "block", amount: 5, target: "self" },
    ],
  },
};
