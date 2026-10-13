window.GameContentRelicHandlers = window.GameContentRelicHandlers || {};
window.GameContentRelicHandlers["relic_ember_ward"] = {
  onBattleStart({ state }) {
    state.player.block += 6;
  },
};
