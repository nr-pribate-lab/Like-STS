window.GameContentItemHandlers = window.GameContentItemHandlers || {};
window.GameContentItemHandlers["item_healing_potion"] = {
  use({ state }) {
    if (state.player.hp >= state.player.maxHp) {
      return { used: false, message: "体力はすでに最大です。回復薬は使えなかった。" };
    }
    const healed = Math.min(20, state.player.maxHp - state.player.hp);
    state.player.hp += healed;
    return { used: true, message: "回復薬を使い、体力を" + healed + "回復した。" };
  },
};
