(() => {
const { characters, enemies, stages } = window.GameContent;

function createRun(enemyId = "enemy_ash_warden", random = Math.random, relicIds = []) {
  if (!Array.isArray(relicIds) || new Set(relicIds).size !== relicIds.length) {
    throw new Error("所持レリックIDは重複のない配列で指定してください。");
  }
  for (const relicId of relicIds) {
    if (!window.GameContent.relics?.[relicId]) {
      throw new Error(`存在しないレリックIDです: ${relicId}`);
    }
  }
  const character = characters["character_ash_swordsman"];
  const stage = stages["stage_ash_corridor"];
  const enemy = enemies[enemyId];
  const deck = shuffle([...character.startingDeck], random);
  const state = {
    character, stage, enemyDefinition: enemy,
    player: { hp: character.maxHp, maxHp: character.maxHp, block: 0, attackBonus: 0 },
    enemy: { name: enemy.name, hp: enemy.maxHp, maxHp: enemy.maxHp, block: 0 },
    drawPile: deck, hand: [], discardPile: [], energy: character.startingEnergy,
    turn: 1, phase: "player", outcome: "ongoing", relicIds: [...relicIds], log: "灰守りが道を塞いでいる。手札から行動を選ぼう。",
    random,
  };
  triggerRelicEvent(state, "onBattleStart");
  drawCards(state, character.handSize);
  return state;
}

function triggerRelicEvent(state, eventName) {
  const handlers = window.GameContentRelicHandlers || {};
  for (const relicId of state.relicIds) {
    const handler = handlers[relicId]?.[eventName];
    if (handler) handler({ state, relic: window.GameContent.relics[relicId] });
  }
}

function playCard(state, handIndex) {
  if (state.phase !== "player" || state.outcome !== "ongoing") return state;
  const cardId = state.hand[handIndex];
  const card = state.character.cards[cardId];
  if (!card || state.energy < card.cost) return state;
  const effectHandlers = window.GameContentEffects || {};
  const missingEffect = card.effects.find((effect) => typeof effectHandlers[effect.type] !== "function");
  if (missingEffect) {
    state.log = `未登録のカード効果です: ${missingEffect.type}`;
    return state;
  }
  state.energy -= card.cost;
  state.hand.splice(handIndex, 1);
  const effectLogs = [];
  const targets = getTargets(state, card.target);
  for (const effect of card.effects) {
    const result = effectHandlers[effect.type](
      { state, card, targets, random: state.random },
      effect,
    );
    if (result) effectLogs.push(result);
  }
  state.log = effectLogs.length ? `${card.name}！ ${effectLogs.join("。")}。` : `${card.name}を使用した。`;
  state.discardPile.push(cardId);
  if (state.enemy.hp <= 0) {
    state.outcome = "victory";
    state.log = "灰守りを打ち倒した。回廊に静寂が戻る。";
  }
  return state;
}

function getTargets(state, targetType) {
  if (targetType === "self") return [state.player];
  if (targetType === "none") return [];
  if (targetType === "all_enemies") return state.enemies || [state.enemy];
  if (targetType === "enemy") {
    const enemies = state.enemies || [state.enemy];
    return [enemies[state.selectedTargetIndex || 0]].filter(Boolean);
  }
  return [];
}

function endTurn(state) {
  if (state.phase !== "player" || state.outcome !== "ongoing") return state;
  state.discardPile.push(...state.hand);
  state.hand = [];
  state.phase = "enemy";
  const intent = state.enemyDefinition.intent;
  const damage = Math.max(0, intent.damage - state.player.block);
  state.player.block = 0;
  state.player.hp = Math.max(0, state.player.hp - damage);
  state.log = `灰守りの反撃。あなたは ${damage} ダメージを受けた。`;
  if (state.player.hp <= 0) {
    state.outcome = "defeat";
    state.log = "力尽きてしまった。もう一度、塔に挑もう。";
    return state;
  }
  state.turn += 1;
  state.energy = state.character.startingEnergy;
  state.phase = "player";
  drawCards(state, state.character.handSize);
  state.log = `ターン ${state.turn}。灰守りは攻撃の構えを崩さない。`;
  return state;
}

function drawCards(state, count) {
  for (let i = 0; i < count; i += 1) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) break;
      state.drawPile = shuffle(state.discardPile.splice(0), state.random);
    }
    state.hand.push(state.drawPile.pop());
  }
}

function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

window.GameCombat = { createRun, playCard, endTurn };
})();
