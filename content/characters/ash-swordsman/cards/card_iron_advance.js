window.GameContent.characters["character_ash_swordsman"].cards.card_iron_advance = {
  id: "card_iron_advance",
  name: "鉄壁の踏み込み",
  description: "6ブロックを得て、自分のブロック値に等しいダメージを敵1体に与える。ブロックは消費しない。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [
    { type: "player_block", amount: 6 },
    { type: "damage_equal_block", amount: 0 },
  ],
  upgrade: {
    description: "8ブロックを得て、自分のブロック値に等しいダメージを敵1体に与える。ブロックは消費しない。",
    effects: [
      { type: "player_block", amount: 8 },
      { type: "damage_equal_block", amount: 0 },
    ],
  },
};
