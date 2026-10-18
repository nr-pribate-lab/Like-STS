window.GameContent.characters["character_ash_swordsman"].cards.card_hand_strength = {
  id: "card_hand_strength",
  name: "抜き打ちの気配",
  description: "手札の斬撃カード1枚につき、このターン筋力を1得る。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [{ type: "strength_per_hand_tag", tag: "strike", amount: 1 }],
  upgrade: { description: "手札の斬撃カード1枚につき、このターン筋力を2得る。", effects: [{ type: "strength_per_hand_tag", tag: "strike", amount: 2 }] },
};
