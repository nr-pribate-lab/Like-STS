window.GameContent.characters["character_nightborn"].cards["card_vampire_bite"] = {
  id: "card_vampire_bite", name: "吸血", description: "敵1体に5ダメージを与え、与えたダメージ分体力を回復する。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 7, shopWeight: 4,
  effects: [{ type: "lifesteal", amount: 5 }],
  upgrade: { description: "敵1体に7ダメージを与え、与えたダメージ分体力を回復する。", effects: [{ type: "lifesteal", amount: 7 }] },
};
