window.GameContent.characters["character_ash_swordsman"].cards["card_ash_slash"] = {
  id: "card_ash_slash",
  name: "斬撃",
  description: "敵1体に6ダメージを与える。",
  type: "attack",
  tags: ["strike"],
  target: "enemy",
  cost: 1,
  rarity: 0,
  rewardWeight: 0,
  shopWeight: 0,
  effects: [
    { type: "damage", amount: 6 },
  ],
  upgrade: {
    description: "敵1体に8ダメージを与える。",
    tags: ["strike"],
    effects: [
      { type: "damage", amount: 8 },
    ],
  },
};
