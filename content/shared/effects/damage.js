window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.damage = ({ targets }, effect) => {
  const results = [];
  for (const target of targets) {
    const damage = Math.max(0, effect.amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - effect.amount);
    target.hp = Math.max(0, target.hp - damage);
    results.push(`${target.name || "対象"}に ${damage} ダメージ`);
  }
  return results.join("。");
};
