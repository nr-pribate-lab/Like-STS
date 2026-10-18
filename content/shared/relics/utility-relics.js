window.GameContentRelicHandlers = window.GameContentRelicHandlers || {};
window.GameContentRelicHandlers.relic_first_breath = {
  onCardPlayed({ state, card }) {
    if (card.type !== "attack" || state.relicTurnState.firstAttack) return;
    state.relicTurnState.firstAttack = true;
    state.energy += 1;
    return "初手の火花が灯り、エネルギーを1得た";
  },
};
window.GameContentRelicHandlers.relic_quiet_script = {
  onCardPlayed({ state, card }) {
    if (card.type !== "skill" || state.relicTurnState?.firstSkill) return;
    state.relicTurnState.firstSkill = true;
    window.GameCombat.drawCards(state, 1);
    return "静謐のしおりでカードを1枚引いた";
  },
};
window.GameContentRelicHandlers.relic_rhythm_bead = {
  onCardPlayed({ state }) {
    state.relicTurnState ||= {};
    state.relicTurnState.cardsPlayed = (state.relicTurnState.cardsPlayed || 0) + 1;
    if (state.relicTurnState.cardsPlayed % 3 !== 0) return;
    state.energy += 1;
    return "三拍子の珠が鳴り、エネルギーを1得た";
  },
};
window.GameContentRelicHandlers.relic_guardian_thread = {
  onCardPlayed({ state, card }) {
    if (!card.tags?.includes("defense")) return;
    state.player.block += 3;
    return "守り糸が反応し、3ブロックを得た";
  },
};
window.GameContentRelicHandlers.relic_ash_salve = {
  onDamageTaken({ state, damage }) {
    if (damage <= 0 || state.relicTurnState?.salveUsed) return;
    state.relicTurnState ||= {};
    state.relicTurnState.salveUsed = true;
    const healed = Math.min(2, state.player.maxHp - state.player.hp);
    state.player.hp += healed;
    return healed > 0 ? `灰蜜の小瓶でHPを${healed}回復した` : "灰蜜の小瓶が傷を塞いだ";
  },
};
window.GameContentRelicHandlers.relic_last_light = {
  onBattleStart({ state }) {
    if (state.player.hp > state.player.maxHp / 2) return;
    state.energy += 1;
    window.GameCombat.drawCards(state, 1);
    return "残光の灯がともり、エネルギーを1得てカードを1枚引いた";
  },
};
window.GameContentRelicHandlers.relic_sera_signal = {
  onPlayerTurnStart({ state }) {
    state.player.block += 4;
    return "セラの合図で4ブロックを得た";
  },
};
