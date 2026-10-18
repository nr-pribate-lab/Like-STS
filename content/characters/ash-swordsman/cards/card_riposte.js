window.GameContent.characters["character_ash_swordsman"].cards.card_riposte = {
  id: "card_riposte",
  name: "返しの刃",
  description: "敵1体に5ダメージを与える。このターン防御カードを使っていれば、さらに5ダメージを与える。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [
    { type: "damage", amount: 5 },
    { type: "conditional_damage", requiredTag: "defense", amount: 5 },
  ],
  upgrade: {
    description: "敵1体に6ダメージを与える。このターン防御カードを使っていれば、さらに6ダメージを与える。",
    effects: [
      { type: "damage", amount: 6 },
      { type: "conditional_damage", requiredTag: "defense", amount: 6 },
    ],
  },
};
