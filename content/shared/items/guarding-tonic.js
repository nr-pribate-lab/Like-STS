window.GameContentItemHandlers = window.GameContentItemHandlers || {};
window.GameContentItemHandlers["item_guarding_tonic"] = {
  use({ state }) {
    state.player.block += 8;
    return { used: true, message: "護りの薬を使い、8ブロックを得た。" };
  },
};
