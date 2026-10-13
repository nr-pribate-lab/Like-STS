window.GameContentRelicHandlers = window.GameContentRelicHandlers || {};
window.GameContentRelicHandlers["relic_first_flame"] = {
  onBattleStart({ state }) {
    state.energy += 1;
  },
};
