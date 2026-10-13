window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.strength = ({ state }, effect) => {
  state.player.strength += effect.amount;
  state.player.expiringStrength += effect.amount;
  return `筋力が ${effect.amount} 上がった`;
};
