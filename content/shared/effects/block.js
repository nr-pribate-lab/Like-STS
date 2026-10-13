window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.block = ({ targets }, effect) => {
  for (const target of targets) target.block = (target.block || 0) + effect.amount;
  return `ブロックを ${effect.amount} 得た`;
};
