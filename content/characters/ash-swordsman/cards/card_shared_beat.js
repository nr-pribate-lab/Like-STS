window.GameContent.characters["character_ash_swordsman"].cards.card_shared_beat = {
  id: "card_shared_beat",
  name: "交互の呼吸",
  description: "手札に斬撃カードと防御カードが両方あれば、エネルギーを1得てカードを2枚引く。",
  type: "skill", target: "self", cost: 1, rarity: 1, rewardWeight: 3, shopWeight: 2,
  effects: [{ type: "draw_if_hand_has_tags", tags: ["strike", "defense"], energy: 1, amount: 2 }],
  upgrade: {
    description: "手札に斬撃カードと防御カードが両方あれば、エネルギーを1得てカードを3枚引く。",
    effects: [{ type: "draw_if_hand_has_tags", tags: ["strike", "defense"], energy: 1, amount: 3 }],
  },
};
