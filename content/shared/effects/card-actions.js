window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.double_tag_effects = ({ state }, effect) => {
  state.doubledCardTags = [...new Set([...state.doubledCardTags, ...(effect.tags || [])])];
  const count = state.hand.filter((cardId) => {
    const card = window.GameCombat.getCardDefinition(state.character, cardId);
    return (card?.tags || []).some((tag) => effect.tags?.includes(tag));
  }).length;
  return `このターン、手札の斬撃・防御カード${count}枚の効果が2倍になる`;
};
window.GameContentEffects.strength_per_hand_tag = ({ state }, effect) => {
  const count = state.hand.filter((cardId) => window.GameCombat.getCardDefinition(state.character, cardId)?.tags?.includes(effect.tag)).length;
  const amount = count * effect.amount;
  state.player.strength += amount;
  state.player.expiringStrength += amount;
  return `手札の斬撃${count}枚分、筋力を${amount}得た`;
};
window.GameContentEffects.transform_hand_tag = ({ state }, effect) => {
  let count = 0;
  state.hand = state.hand.map((cardId) => {
    const card = window.GameCombat.getCardDefinition(state.character, cardId);
    if (!card?.tags?.includes(effect.fromTag)) return cardId;
    count += 1;
    const upgraded = cardId.endsWith("::upgraded");
    const target = state.character.cards[effect.toCardId];
    return effect.preserveUpgrade && upgraded && target?.upgrade ? effect.toCardId + "::upgraded" : effect.toCardId;
  });
  return `手札の防御${count}枚を斬撃に変えた`;
};
window.GameContentEffects.add_card_to_hand = ({ state }, effect) => {
  const card = state.character.cards[effect.cardId];
  if (!card) return "加えるカードが見つからない";
  state.hand.push(effect.preserveUpgrade && card.upgrade ? effect.cardId + "::upgraded" : effect.cardId);
  state.handModifiers.push({});
  return `${card.name}を手札に加えた`;
};
window.GameContentEffects.damage_equal_block = ({ state, targets }, effect) => {
  const amount = state.player.block + (effect.amount || 0);
  for (const target of targets) {
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    target.hp = Math.max(0, target.hp - damage);
  }
  return `自分のブロックと追加値で${amount}ダメージ`;
};
window.GameContentEffects.spend_block_for_damage = ({ state, targets }, effect) => {
  const spent = state.player.block;
  const amount = spent + (effect.bonus || 0);
  state.player.block = 0;
  const results = [];
  for (const target of targets) {
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    target.hp = Math.max(0, target.hp - damage);
    results.push(`${target.name || "対象"}に${damage}ダメージ`);
  }
  return `ブロック${spent}を消費。${results.join("、")}`;
};
window.GameContentEffects.player_block = ({ state }, effect) => {
  const amount = effect.amount || 0;
  state.player.block += amount;
  return `ブロックを${amount}得た`;
};
window.GameContentEffects.conditional_damage = ({ state, targets, card }, effect) => {
  if (!state.playedCardTagsThisTurn.includes(effect.requiredTag)) return "条件未達のため追加効果なし";
  const handler = window.GameContentEffects.damage;
  return handler({ state, targets, card }, effect);
};
window.GameContentEffects.conditional_draw = ({ state }, effect) => {
  if (!state.playedCardTagsThisTurn.includes(effect.requiredTag)) return "条件未達のためドローなし";
  window.GameCombat.drawCards(state, effect.amount);
  return `斬撃に続いてカードを${effect.amount}枚引いた`;
};
window.GameContentEffects.draw_if_hand_has_tags = ({ state }, effect) => {
  const counts = Object.fromEntries((effect.tags || []).map((tag) => [tag, 0]));
  for (const cardId of state.hand) {
    const card = window.GameCombat.getCardDefinition(state.character, cardId);
    for (const tag of card?.tags || []) if (tag in counts) counts[tag] += 1;
  }
  if (!Object.values(counts).every((count) => count > 0)) return "斬撃と防御が手札にそろわず、追加効果なし";
  state.energy += effect.energy || 0;
  window.GameCombat.drawCards(state, effect.amount || 0);
  return `斬撃と防御がそろい、エネルギー${effect.energy || 0}とカード${effect.amount || 0}枚を得た`;
};
window.GameContentEffects.damage_per_hand_tag = ({ state, targets }, effect) => {
  const count = state.hand.filter((cardId) => window.GameCombat.getCardDefinition(state.character, cardId)?.tags?.includes(effect.tag)).length;
  const baseAmount = count * effect.amount;
  const results = [];
  for (const target of targets) {
    const isEnemy = state.enemies.includes(target);
    let amount = baseAmount + (isEnemy ? (state.player.attackBonus || 0) + (state.player.strength || 0) : 0);
    if (isEnemy && state.player.weakTurns > 0) amount = Math.floor(amount * 0.75);
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    target.hp = Math.max(0, target.hp - damage);
    results.push(`${target.name || "対象"}に${damage}ダメージ`);
  }
  return `手札の斬撃${count}枚分。${results.join("、")}`;
};
window.GameContentEffects.block_per_hand_tag = ({ state }, effect) => {
  const count = state.hand.filter((cardId) => window.GameCombat.getCardDefinition(state.character, cardId)?.tags?.includes(effect.tag)).length;
  const amount = count * effect.amount;
  state.player.block += amount;
  return `手札の防御${count}枚分、${amount}ブロックを得た`;
};
