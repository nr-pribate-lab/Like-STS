window.GameContent.characters["character_nightborn"].cards["card_blood_pact"] = {
  id: "card_blood_pact",
  name: "血蝠の契約",
  description: "永続：次の自分のターン開始から、HPを1失い蝙蝠を1体召喚する。",
  type: "persistent",
  target: "self",
  cost: 1,
  rarity: 2,
  rewardWeight: 5,
  shopWeight: 4,
  effects: [],
  triggers: {
    onPlayerTurnStart: [{ type: "blood_bat", hpLoss: 1, bats: 1 }],
  },
  upgrade: {
    description: "永続：次の自分のターン開始から、HPを1失い蝙蝠を2体召喚する。",
    triggers: {
      onPlayerTurnStart: [{ type: "blood_bat", hpLoss: 1, bats: 2 }],
    },
  },
};
