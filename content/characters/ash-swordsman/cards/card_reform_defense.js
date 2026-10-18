window.GameContent.characters["character_ash_swordsman"].cards.card_reform_defense = {
  id: "card_reform_defense",
  name: "崩し返し",
  description: "手札の防御カードを斬撃カードに変える。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [{ type: "transform_hand_tag", fromTag: "defense", toCardId: "card_ash_slash", preserveUpgrade: true }],
  upgrade: { description: "手札の防御カードを斬撃カードに変え、1枚引く。", effects: [{ type: "transform_hand_tag", fromTag: "defense", toCardId: "card_ash_slash", preserveUpgrade: true }, { type: "draw", amount: 1 }] },
};
