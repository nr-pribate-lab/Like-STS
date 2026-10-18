(() => {
  const key = "ash-tower-profile";
  const saveVersion = 1;
  function decode(raw) {
    const value = JSON.parse(raw || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("保存データの形式が不正です。");
    if (value.saveVersion === undefined) return { saveVersion, profile: value, adventure: null };
    if (value.saveVersion !== saveVersion) throw new Error("このバージョンでは保存データを開けません。新しいゲーム版をご利用ください。");
    if (!value.profile || typeof value.profile !== "object") throw new Error("町の保存データが不正です。");
    return value;
  }
  function restoreCombat(saved, content) {
    if (!saved) return null;
    const state = JSON.parse(JSON.stringify(saved));
    state.character = content.characters[state.characterId];
    state.stage = content.stages[state.stageId];
    if (!state.character || !state.stage || !Array.isArray(state.enemies) || !state.enemies.length) throw new Error("戦闘の保存データに対応するコンテンツがありません。");
    state.enemyDefinitions = state.enemies.map(enemy => {
      if (!content.enemies[enemy.id]) throw new Error("保存された敵が見つかりません。");
      return content.enemies[enemy.id];
    });
    for (const pile of [state.hand, state.drawPile, state.discardPile, state.powers]) {
      if (!Array.isArray(pile) || pile.some(id => typeof id !== "string" || !state.character.cards[id.replace(/::upgraded$/, "")])) throw new Error("保存されたカードが見つかりません。");
    }
    state.enemy = state.enemies[0];
    state.enemyDefinition = state.enemyDefinitions[0];
    state.random = Math.random;
    return state;
  }
  function packCombat(state) {
    if (!state) return null;
    const { character, stage, enemyDefinitions, enemyDefinition, enemy, random, ...data } = state;
    return { ...data, characterId: character.id, stageId: stage.id };
  }
  window.GameSave = { key, saveVersion, decode, restoreCombat, packCombat };
})();
