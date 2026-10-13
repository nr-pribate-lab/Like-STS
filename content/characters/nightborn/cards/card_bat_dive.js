window.GameContent.characters["character_nightborn"].cards["card_bat_dive"] = {
  id: "card_bat_dive", name: "夜蝠の葬送", description: "蝙蝠を1匹消費し、敵1体に14ダメージを与える。",
  type: "attack", target: "enemy", cost: 1, rarity: 1, rewardWeight: 5, shopWeight: 3,
  requires: { bats: 1 }, effects: [{ type: "bat_strike", amount: 14 }],
  upgrade: { description: "蝙蝠を1匹消費し、敵1体に18ダメージを与える。", effects: [{ type: "bat_strike", amount: 18 }] },
};
