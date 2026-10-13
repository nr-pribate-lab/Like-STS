window.GameContentItemHandlers = window.GameContentItemHandlers || {};
window.GameContentItemHandlers["item_energy_tonic"] = {
  use({ state }) {
    state.energy += 1;
    return { used: true, message: "活力薬を使い、このターンのエネルギーを1得た。" };
  },
};
