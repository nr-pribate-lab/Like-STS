window.GameContent.characters["character_ash_swordsman"].cards.card_guard_crush = {
  id: "card_guard_crush",
  name: "堅守崩し",
  description: "自分のブロック値に等しいダメージを敵1体に与える。ブロックは消費しない。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [{ type: "damage_equal_block", amount: 0 }],
  upgrade: { description: "自分のブロック値+3のダメージを敵1体に与える。ブロックは消費しない。", effects: [{ type: "damage_equal_block", amount: 3 }] },
};
