window.GameContentRelicHandlers = window.GameContentRelicHandlers || {};
window.GameContentRelicHandlers["relic_foresight_compass"] = {
  onBattleStart({ state }) {
    if (state.drawPile.length > 0) {
      state.hand.push(state.drawPile.pop());
      state.handModifiers.push({});
    }
  },
};
