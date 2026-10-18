window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.block = ({ state, targets, card, cardModifier = {} }, effect) => {
  let amount = effect.amount;
  if (card?.tags?.includes("defense") && cardModifier.defenseBlock != null) amount = cardModifier.defenseBlock;
  if (card?.tags?.some((tag) => state.doubledCardTags.includes(tag))) amount *= 2;
  for (const target of targets) target.block = (target.block || 0) + amount;
  return `ブロックを ${amount} 得た`;
};
