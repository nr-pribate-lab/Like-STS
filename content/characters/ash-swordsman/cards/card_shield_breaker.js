window.GameContent.characters["character_ash_swordsman"].cards.card_shield_breaker = {
  id: "card_shield_breaker",
  name: "盾砕き",
  description: "自分のブロックをすべて消費し、その値+4のダメージを敵1体に与える。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 3, shopWeight: 2,
  effects: [{ type: "spend_block_for_damage", bonus: 4 }],
  upgrade: {
    description: "自分のブロックをすべて消費し、その値+8のダメージを敵1体に与える。",
    effects: [{ type: "spend_block_for_damage", bonus: 8 }],
  },
};
