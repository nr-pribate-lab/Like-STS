window.GameContentRelicHandlers = window.GameContentRelicHandlers || {};
window.GameContentRelicHandlers["relic_power_belt"] = {
  onBattleStart({ state }) {
    state.player.attackBonus += 2;
  },
};
