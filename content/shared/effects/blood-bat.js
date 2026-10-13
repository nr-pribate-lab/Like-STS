window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.blood_bat = ({ state }, effect) => {
  state.player.hp = Math.max(0, state.player.hp - effect.hpLoss);
  state.bats.push(...Array.from({ length: effect.bats }, () => ({ id: "bat" })));
  return `HPを${effect.hpLoss}失い、蝙蝠を${effect.bats}体召喚`;
};
