window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.lifesteal = ({ state, targets }, effect) => {
  let totalDamage = 0;
  for (const target of targets) {
    const amount = effect.amount + (state.player.attackBonus || 0) + (state.player.strength || 0);
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    const dealt = Math.min(target.hp, damage);
    target.hp = Math.max(0, target.hp - damage);
    totalDamage += dealt;
  }
  const healed = Math.min(totalDamage, state.player.maxHp - state.player.hp);
  state.player.hp += healed;
  return `${totalDamage}ダメージを与え、体力を${healed}回復`;
};
