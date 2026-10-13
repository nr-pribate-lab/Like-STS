window.GameContent.characters["character_ash_swordsman"].cards["card_flurry"] = {
  id: "card_flurry", name: "連撃", description: "敵1体に3ダメージを2回与える。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 5, shopWeight: 4,
  effects: [{ type: "damage", amount: 3 }, { type: "damage", amount: 3 }],
  upgrade: { description: "敵1体に4ダメージを2回与える。", effects: [{ type: "damage", amount: 4 }, { type: "damage", amount: 4 }] },
};
