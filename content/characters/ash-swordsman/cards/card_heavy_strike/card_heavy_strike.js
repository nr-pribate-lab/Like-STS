window.GameContent.characters["character_ash_swordsman"].cards["card_heavy_strike"] = {
  id: "card_heavy_strike",
  name: "重撃",
  description: "敵1体に12ダメージを与える。",
  type: "attack",
  target: "enemy",
  cost: 2,
  rarity: 1,
  rewardWeight: 6,
  shopWeight: 4,
  effects: [{ type: "damage", amount: 12 }],
  upgrade: {
    description: "敵1体に15ダメージを与える。",
    effects: [{ type: "damage", amount: 15 }],
  },
};
