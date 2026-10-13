window.GameContent.characters["character_nightborn"].cards["card_bat_call"] = {
  id: "card_bat_call", name: "蝙蝠召喚", description: "蝙蝠を1匹召喚する。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 6, shopWeight: 4,
  effects: [{ type: "summon_bat", amount: 1 }],
  upgrade: { description: "蝙蝠を2匹召喚する。", effects: [{ type: "summon_bat", amount: 2 }] },
};
