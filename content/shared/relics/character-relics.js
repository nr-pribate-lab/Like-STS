window.GameContent = window.GameContent || {};
window.GameContent.relics = window.GameContent.relics || {};
window.GameContent.relics.relic_swordsman_forge = {
  id: "relic_swordsman_forge",
  name: "鍛火の紋章",
  description: "灰路の剣士専用。戦闘開始時、筋力を1得る。",
  scope: "character",
  characterId: "character_ash_swordsman",
  timing: "onBattleStart",
  acquisition: ["tree", "elite"],
};
window.GameContent.relics.relic_nightborn_moonbat = {
  id: "relic_nightborn_moonbat",
  name: "月蝠の護符",
  description: "夜血の眷属専用。戦闘開始時、蝙蝠を1匹召喚する。",
  scope: "character",
  characterId: "character_nightborn",
  timing: "onBattleStart",
  acquisition: ["tree", "elite"],
};
window.GameContent.relics.relic_swordsman_edge_echo = {
  id: "relic_swordsman_edge_echo",
  name: "刃鳴りの構え",
  description: "灰路の剣士専用。防御カード使用時、手札の斬撃カードのダメージがそのカードのブロック値+2になる（ターン終了まで）。",
  scope: "character",
  characterId: "character_ash_swordsman",
  timing: "onCardPlayed",
  acquisition: ["tree", "elite"],
};
window.GameContent.relics.relic_swordsman_guard_echo = {
  id: "relic_swordsman_guard_echo",
  name: "返し刃の構え",
  description: "灰路の剣士専用。斬撃カード使用時、手札の防御カードのブロック値がそのカードのダメージ値+2になる（ターン終了まで）。",
  scope: "character",
  characterId: "character_ash_swordsman",
  timing: "onCardPlayed",
  acquisition: ["tree", "elite"],
};

window.GameContentRelicHandlers = window.GameContentRelicHandlers || {};
window.GameContentRelicHandlers.relic_swordsman_forge = {
  onBattleStart({ state }) { state.player.strength += 1; },
};
window.GameContentRelicHandlers.relic_nightborn_moonbat = {
  onBattleStart({ state }) { state.bats.push({ id: "bat" }); },
};
window.GameContentRelicHandlers.relic_swordsman_edge_echo = {
  onCardPlayed({ state, card, values }) {
    if (!card.tags?.includes("defense") || values.block <= 0) return;
    state.hand.forEach((cardId, index) => {
      if (!window.GameCombat.getCardDefinition(state.character, cardId)?.tags?.includes("strike")) return;
      state.handModifiers[index] ||= {};
      state.handModifiers[index].strikeDamage = values.block + 2;
    });
  },
};
window.GameContentRelicHandlers.relic_swordsman_guard_echo = {
  onCardPlayed({ state, card, values }) {
    if (!card.tags?.includes("strike") || values.damage <= 0) return;
    state.hand.forEach((cardId, index) => {
      if (!window.GameCombat.getCardDefinition(state.character, cardId)?.tags?.includes("defense")) return;
      state.handModifiers[index] ||= {};
      state.handModifiers[index].defenseBlock = values.damage + 2;
    });
  },
};
