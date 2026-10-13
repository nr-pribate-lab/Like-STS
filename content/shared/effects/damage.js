window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.damage = ({ state, targets }, effect) => {
  const results = [];
  for (const target of targets) {
    const isEnemy = (state.enemies || [state.enemy]).includes(target);
    const amount = effect.amount + (isEnemy ? (state.player.attackBonus || 0) + (state.player.strength || 0) : 0);
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    target.hp = Math.max(0, target.hp - damage);
    results.push(`${target.name || "対象"}に ${damage} ダメージ`);
  }
  return results.join("。");
};
