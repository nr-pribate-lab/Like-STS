window.GameContent.characters["character_ash_swordsman"].cards.card_pivot_assault = {
  id: "card_pivot_assault",
  name: "連環崩し",
  description: "手札の斬撃カード1枚につき全ての敵に3ダメージを与え、防御カード1枚につき2ブロックを得る。",
  type: "attack", target: "all_enemies", cost: 2, rarity: 1, rewardWeight: 3, shopWeight: 2,
  effects: [
    { type: "damage_per_hand_tag", tag: "strike", amount: 3 },
    { type: "block_per_hand_tag", tag: "defense", amount: 2 },
  ],
  upgrade: {
    description: "手札の斬撃カード1枚につき全ての敵に4ダメージを与え、防御カード1枚につき3ブロックを得る。",
    effects: [
      { type: "damage_per_hand_tag", tag: "strike", amount: 4 },
      { type: "block_per_hand_tag", tag: "defense", amount: 3 },
    ],
  },
};
