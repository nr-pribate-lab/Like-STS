window.GameContent.characters["character_ash_swordsman"].cards["card_defense"] = {
  id: "card_defense",
  name: "防御",
  description: "5ブロックを得る。",
  type: "skill",
  tags: ["defense"],
  target: "self",
  cost: 1,
  rarity: 0,
  rewardWeight: 0,
  shopWeight: 0,
  effects: [{ type: "block", amount: 5 }],
  upgrade: {
    description: "8ブロックを得る。",
    tags: ["defense"],
    effects: [{ type: "block", amount: 8 }],
  },
};
