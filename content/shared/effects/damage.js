window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.damage = ({ state, targets, card, cardModifier = {} }, effect) => {
  const results = [];
  for (const target of targets) {
    const isEnemy = (state.enemies || [state.enemy]).includes(target);
    let baseAmount = effect.amount;
    if (card?.tags?.includes("strike") && cardModifier.strikeDamage != null) baseAmount = cardModifier.strikeDamage;
    if (card?.tags?.some((tag) => state.doubledCardTags.includes(tag))) baseAmount *= 2;
    let amount = baseAmount + (isEnemy ? (state.player.attackBonus || 0) + (state.player.strength || 0) : 0);
    if (isEnemy && state.player.weakTurns > 0) amount = Math.floor(amount * 0.75);
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    target.hp = Math.max(0, target.hp - damage);
    results.push(`${target.name || "対象"}に ${damage} ダメージ`);
  }
  return results.join("。");
};
