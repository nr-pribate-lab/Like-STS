window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.draw = ({ state }, effect) => {
  const handSize = state.hand.length;
  window.GameCombat.drawCards(state, effect.amount);
  return `${state.hand.length - handSize} 枚引いた`;
};
