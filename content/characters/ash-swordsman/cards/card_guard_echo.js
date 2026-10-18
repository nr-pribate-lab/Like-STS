window.GameContent.characters["character_ash_swordsman"].cards.card_guard_echo = {
  id: "card_guard_echo",
  name: "構えの返答",
  description: "永続：防御カード使用時、斬撃カードを1枚手札に加える。",
  type: "persistent", target: "self", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [],
  triggers: { onCardPlayed: [{ type: "add_card_to_hand", cardId: "card_ash_slash", whenTag: "defense" }] },
  upgrade: { description: "永続：防御カード使用時、強化された斬撃カードを1枚手札に加える。", effects: [], triggers: { onCardPlayed: [{ type: "add_card_to_hand", cardId: "card_ash_slash", whenTag: "defense", preserveUpgrade: true }] } },
};
