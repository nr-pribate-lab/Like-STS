window.GameContent.characters["character_nightborn"].cards["card_bat_absorption"] = {
  id: "card_bat_absorption", name: "血蝠同化", description: "蝙蝠を1匹吸収し、15体力を回復する。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 5, shopWeight: 3,
  requires: { bats: 1 }, effects: [{ type: "bat_absorb", amount: 15 }],
  upgrade: { description: "蝙蝠を1匹吸収し、20体力を回復する。", effects: [{ type: "bat_absorb", amount: 20 }] },
};
