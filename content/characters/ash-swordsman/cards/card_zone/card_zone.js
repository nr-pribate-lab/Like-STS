window.GameContent.characters["character_ash_swordsman"].cards["card_zone"] = {
  id: "card_zone",
  name: "ゾーン",
  description: "筋力を3得る。このカードで得た筋力は、自分のターン開始時に1減る。",
  type: "skill",
  target: "self",
  cost: 1,
  rarity: 2,
  rewardWeight: 5,
  shopWeight: 3,
  effects: [{ type: "strength", amount: 3 }],
  upgrade: {
    description: "筋力を4得る。このカードで得た筋力は、自分のターン開始時に1減る。",
    effects: [{ type: "strength", amount: 4 }],
  },
};
