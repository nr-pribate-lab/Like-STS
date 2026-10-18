window.GameContent.characters["character_ash_swordsman"].cards.card_edge_echo = {
  id: "card_edge_echo",
  name: "刃の余韻",
  description: "永続：斬撃カード使用時、防御カードを1枚手札に加える。",
  type: "persistent", target: "self", cost: 1, rarity: 1, rewardWeight: 4, shopWeight: 3,
  effects: [],
  triggers: { onCardPlayed: [{ type: "add_card_to_hand", cardId: "card_defense", whenTag: "strike" }] },
  upgrade: { description: "永続：斬撃カード使用時、防御カードを1枚手札に加える。強化された防御は強化状態で加わる。", effects: [], triggers: { onCardPlayed: [{ type: "add_card_to_hand", cardId: "card_defense", whenTag: "strike", preserveUpgrade: true }] } },
};
