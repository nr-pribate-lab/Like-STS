(() => {
const { characters, enemies, stages } = window.GameContent;
const UPGRADED_CARD_SUFFIX = "::upgraded";

function getCardDefinition(character, cardRef) {
  const upgraded = cardRef.endsWith(UPGRADED_CARD_SUFFIX);
  const cardId = upgraded ? cardRef.slice(0, -UPGRADED_CARD_SUFFIX.length) : cardRef;
  const base = character.cards[cardId];
  if (!base) return null;
  return upgraded && base.upgrade
    ? {
      ...base,
      description: base.upgrade.description,
      effects: base.upgrade.effects ?? base.effects,
      tags: base.upgrade.tags ?? base.tags,
      triggers: base.upgrade.triggers ?? base.triggers,
      upgraded: true,
    }
    : base;
}

function createRun(enemyIds = ["enemy_ash_warden"], random = Math.random, relicIds = [], startingDeck = null, itemIds = [], gold = 100, characterId = "character_ash_swordsman", startingHp = null) {
  if (typeof enemyIds === "string") enemyIds = [enemyIds];
  if (!Array.isArray(enemyIds) || enemyIds.length === 0) {
    throw new Error("戦闘には1体以上の敵IDが必要です。");
  }
  if (!Array.isArray(relicIds) || new Set(relicIds).size !== relicIds.length) {
    throw new Error("所持レリックIDは重複のない配列で指定してください。");
  }
  for (const relicId of relicIds) {
    if (!window.GameContent.relics?.[relicId]) {
      throw new Error(`存在しないレリックIDです: ${relicId}`);
    }
  }
  if (!Array.isArray(itemIds)) {
    throw new Error("所持アイテムIDは配列で指定してください。");
  }
  for (const itemId of itemIds) {
    if (!window.GameContent.items?.[itemId]) {
      throw new Error("存在しないアイテムIDです: " + itemId);
    }
  }
  const itemCapacity = getItemCapacity(relicIds);
  if (!Number.isInteger(gold) || gold < 0) {
    throw new Error("所持金は0以上の整数で指定してください。");
  }
  if (itemIds.length > itemCapacity) {
    throw new Error("アイテム所持数が上限を超えています: " + itemIds.length + "/" + itemCapacity);
  }
  const character = characters[characterId];
  if (!character) throw new Error(`存在しないキャラクターIDです: ${characterId}`);
  const playerHp = startingHp ?? character.maxHp;
  if (!Number.isInteger(playerHp) || playerHp < 1 || playerHp > character.maxHp) {
    throw new Error(`開始HPは1から最大HPまでの整数で指定してください: ${playerHp}`);
  }
  const stage = stages["stage_ash_corridor"];
  const enemyDefinitions = enemyIds.map((enemyId) => {
    const enemy = enemies[enemyId];
    if (!enemy) throw new Error(`存在しない敵IDです: ${enemyId}`);
    if (!Array.isArray(enemy.actions) || enemy.actions.length === 0) {
      throw new Error(`敵 ${enemyId} に行動配列がありません。`);
    }
    return enemy;
  });
  const enemyStates = enemyDefinitions.map((definition) => ({
    id: definition.id,
    name: definition.name,
    hp: definition.maxHp,
    maxHp: definition.maxHp,
    block: 0,
    strength: 0,
    actionIndex: 0,
  }));
  const deck = shuffle([...(startingDeck || character.startingDeck)], random);
  const state = {
    character, stage, enemyDefinitions,
    player: { hp: playerHp, maxHp: character.maxHp, block: 0, attackBonus: 0, strength: 0, expiringStrength: 0, weakTurns: 0 },
    enemies: enemyStates, enemy: enemyStates[0], enemyDefinition: enemyDefinitions[0], selectedTargetIndex: enemyStates.length === 1 ? 0 : null,
    handModifiers: [], doubledCardTags: [], playedCardTagsThisTurn: [],
    drawPile: deck, hand: [], discardPile: [], energy: character.startingEnergy,
    turn: 1, phase: "player", outcome: "ongoing", relicIds: [...relicIds], itemIds: [...itemIds], itemCapacity, gold, bats: [], powers: [], log: enemyDefinitions.map((enemy) => enemy.name).join("、") + "が立ちはだかる。手札から行動を選ぼう。",
    random,
  };
  triggerRelicEvent(state, "onBattleStart");
  state.relicTurnState = {};
  triggerRelicEvent(state, "onPlayerTurnStart");
  drawCards(state, character.handSize);
  return state;
}

function getItemCapacity(relicIds = []) {
  return 3 + relicIds.reduce((bonus, relicId) => {
    const relic = window.GameContent.relics?.[relicId];
    return bonus + (Number.isInteger(relic?.itemCapacityBonus) ? Math.max(0, relic.itemCapacityBonus) : 0);
  }, 0);
}

function addItemToInventory(itemIds, itemId, capacity = 3) {
  if (!Array.isArray(itemIds) || !window.GameContent.items?.[itemId]) return false;
  if (!Number.isInteger(capacity) || capacity < 0 || itemIds.length >= capacity) return false;
  itemIds.push(itemId);
  return true;
}

function purchaseItem(owner, itemId, capacity = 3) {
  const item = window.GameContent.items?.[itemId];
  if (!owner || !Number.isInteger(owner.gold) || !Array.isArray(owner.itemIds) || !item) return false;
  if (!Number.isInteger(item.price) || item.price < 0 || owner.gold < item.price) return false;
  if (!addItemToInventory(owner.itemIds, itemId, capacity)) return false;
  owner.gold -= item.price;
  return true;
}

function useItem(state, inventoryIndex) {
  if (state.phase !== "player" || state.outcome !== "ongoing") return false;
  if (!Number.isInteger(inventoryIndex) || inventoryIndex < 0 || inventoryIndex >= state.itemIds.length) return false;

  const itemId = state.itemIds[inventoryIndex];
  const item = window.GameContent.items?.[itemId];
  const handler = window.GameContentItemHandlers?.[itemId]?.use;
  if (!item || typeof handler !== "function") return false;

  const result = handler({ state, item });
  if (!result || result.used !== true) {
    if (result?.message) state.log = result.message;
    return false;
  }
  state.itemIds.splice(inventoryIndex, 1);
  state.log = result.message || (item.name + "を使った。");
  resolveCombatOutcome(state);
  return true;
}

function resolveCombatOutcome(state) {
  if (!state || state.outcome !== "ongoing") return state;
  if (state.player.hp <= 0) {
    state.player.hp = 0;
    state.outcome = "defeat";
    state.log = "力尽きてしまった。もう一度、塔に挑もう。";
  } else if (state.enemies.every((enemy) => enemy.hp <= 0)) {
    state.outcome = "victory";
    state.log = "敵をすべて打ち倒した。回廊に静寂が戻る。";
  }
  return state;
}

function triggerRelicEvent(state, eventName, details = {}) {
  const handlers = window.GameContentRelicHandlers || {};
  const logs = [];
  for (const relicId of state.relicIds) {
    const handler = handlers[relicId]?.[eventName];
    const result = handler?.({ state, relic: window.GameContent.relics[relicId], ...details });
    if (result) logs.push(result);
  }
  return logs;
}

function triggerPowerEvent(state, eventName, details = {}) {
  const handlers = window.GameContentEffects || {};
  const logs = [];
  for (const cardId of state.powers) {
    const card = getCardDefinition(state.character, cardId);
    for (const trigger of card.triggers?.[eventName] || []) {
      if (trigger.whenTag && !details.card?.tags?.includes(trigger.whenTag)) continue;
      const handler = handlers[trigger.type];
      if (!handler) continue;
      const result = handler({ state, card, targets: [], random: state.random, ...details }, trigger);
      if (result) logs.push(result);
    }
  }
  return logs;
}

function getCardEffectValues(state, card, cardModifier = {}) {
  const result = { damage: 0, block: 0 };
  for (const effect of card.effects) {
    if (effect.type !== "damage" && effect.type !== "block") continue;
    let amount = effect.amount || 0;
    if (effect.type === "damage" && card.tags?.includes("strike") && cardModifier.strikeDamage != null) amount = cardModifier.strikeDamage;
    if (effect.type === "block" && card.tags?.includes("defense") && cardModifier.defenseBlock != null) amount = cardModifier.defenseBlock;
    if (card.tags?.some((tag) => state.doubledCardTags.includes(tag))) amount *= 2;
    result[effect.type] += amount;
  }
  return result;
}

function playCard(state, handIndex) {
  if (state.phase !== "player" || state.outcome !== "ongoing") return state;
  const cardId = state.hand[handIndex];
  const card = getCardDefinition(state.character, cardId);
  if (!card || state.energy < card.cost) return state;
  if ((card.requires?.bats || 0) > state.bats.length) {
    state.log = "このカードを使うには蝙蝠が必要です。";
    return state;
  }
  const effectHandlers = window.GameContentEffects || {};
  const missingEffect = card.effects.find((effect) => typeof effectHandlers[effect.type] !== "function");
  if (missingEffect) {
    state.log = `未登録のカード効果です: ${missingEffect.type}`;
    return state;
  }
  const targets = getTargets(state, card.target);
  if (card.target === "enemy" && targets.length === 0) return state;
  const cardModifier = state.handModifiers[handIndex] || {};
  const playedCardValues = getCardEffectValues(state, card, cardModifier);
  state.energy -= card.cost;
  state.hand.splice(handIndex, 1);
  state.handModifiers.splice(handIndex, 1);
  const effectLogs = [];
  for (const effect of card.effects) {
    const effectTargets = effect.target ? getTargets(state, effect.target) : targets;
    const result = effectHandlers[effect.type](
      { state, card, targets: effectTargets, random: state.random, cardModifier },
      effect,
    );
    if (result) effectLogs.push(result);
  }
  state.log = effectLogs.length ? `${card.name}！ ${effectLogs.join("。")}。` : `${card.name}を使用した。`;
  if (card.type === "persistent") {
    state.powers.push(cardId);
    state.log = `${card.name}を使用した。永続効果が有効になった。`;
  } else {
    state.discardPile.push(cardId);
  }
  const triggerDetails = { card, cardId, values: playedCardValues };
  const triggerLogs = [
    ...triggerRelicEvent(state, "onCardPlayed", triggerDetails),
    ...triggerPowerEvent(state, "onCardPlayed", triggerDetails),
  ];
  if (triggerLogs.length) state.log += ` ${triggerLogs.join("。")}`;
  state.playedCardTagsThisTurn.push(...(card.tags || []));
  resolveCombatOutcome(state);
  if (state.outcome === "ongoing" && state.selectedTargetIndex != null && state.enemies[state.selectedTargetIndex]?.hp <= 0) {
    state.selectedTargetIndex = state.enemies.findIndex((enemy) => enemy.hp > 0);
  }
  return state;
}

function getTargets(state, targetType) {
  if (targetType === "self") return [state.player];
  if (targetType === "none") return [];
  if (targetType === "all_enemies") return state.enemies.filter((enemy) => enemy.hp > 0);
  if (targetType === "enemy") {
    const livingEnemies = state.enemies.filter((enemy) => enemy.hp > 0);
    const selected = state.selectedTargetIndex == null && livingEnemies.length === 1
      ? livingEnemies[0]
      : state.enemies[state.selectedTargetIndex];
    return selected?.hp > 0 ? [selected] : [];
  }
  return [];
}

function endTurn(state) {
  if (state.phase !== "player" || state.outcome !== "ongoing") return state;
  state.discardPile.push(...state.hand);
  state.hand = [];
  state.handModifiers = [];
  state.phase = "enemy";
  if (state.player.weakTurns > 0) state.player.weakTurns -= 1;
  const enemyLogs = [];
  for (let index = 0; index < state.enemies.length; index += 1) {
    const enemy = state.enemies[index];
    if (enemy.hp <= 0) continue;
    const definition = state.enemyDefinitions[index];
    const action = definition.actions[enemy.actionIndex];
    enemy.actionIndex = (enemy.actionIndex + 1) % definition.actions.length;
    enemy.block = 0;
    const log = enemy.skipNextAction
      ? (enemy.skipNextAction = false, "黒砂に封じられ、行動できなかった")
      : executeEnemyAction(state, enemy, action);
    if (log) enemyLogs.push(`${enemy.name}：${log}`);
    if (state.player.hp <= 0) {
      state.outcome = "defeat";
      state.log = "力尽きてしまった。もう一度、塔に挑もう。";
      return state;
    }
  }
  state.turn += 1;
  state.energy = state.character.startingEnergy;
  state.phase = "player";
  const startTurnLogs = startPlayerTurn(state);
  if (state.outcome !== "ongoing") {
    state.log = `${startTurnLogs.join("。")}。HPが0になった。`;
    return state;
  }
  drawCards(state, state.character.handSize);
  state.log = `ターン ${state.turn}。${enemyLogs.join("。")}${startTurnLogs.length ? " " + startTurnLogs.join("。") : ""}`;
  return state;
}

function executeEnemyAction(state, enemy, action) {
  if (action.type === "attack") {
    const amount = action.amount + enemy.strength;
    const damage = Math.max(0, amount - state.player.block);
    state.player.block = Math.max(0, state.player.block - amount);
    state.player.hp = Math.max(0, state.player.hp - damage);
    const relicLogs = damage > 0 ? triggerRelicEvent(state, "onDamageTaken", { damage, enemy }) : [];
    return `${damage}ダメージを与えた${relicLogs.length ? `。${relicLogs.join("。")}` : ""}`;
  }
  if (action.type === "defend") {
    enemy.block += action.amount;
    return `${action.amount}ブロックを得た`;
  }
  if (action.type === "strengthen") {
    enemy.strength += action.amount;
    return `筋力が${action.amount}上がった`;
  }
  if (action.type === "weaken") {
    state.player.weakTurns = Math.max(state.player.weakTurns, action.amount || 1);
    return "灰を浴びせ、次のターンの攻撃を弱めた";
  }
  const handler = window.GameContentEnemyActions?.[action.type];
  return handler ? handler({ state, enemy, action }) : "行動できなかった";
}

function startPlayerTurn(state) {
  const logs = [];
  state.doubledCardTags = [];
  state.playedCardTagsThisTurn = [];
  state.relicTurnState = {};
  state.player.block = 0;
  logs.push(...triggerRelicEvent(state, "onPlayerTurnStart"));
  if (state.player.expiringStrength > 0) {
    state.player.strength = Math.max(0, state.player.strength - 1);
    state.player.expiringStrength -= 1;
  }
  const handlers = window.GameContentEffects || {};
  for (const cardId of state.powers) {
    const card = getCardDefinition(state.character, cardId);
    for (const effect of card.triggers?.onPlayerTurnStart || []) {
      const handler = handlers[effect.type];
      if (handler) {
        const result = handler({ state, card, targets: [state.player], random: state.random }, effect);
        if (result) logs.push(result);
      }
      if (state.player.hp <= 0) {
        state.outcome = "defeat";
        break;
      }
    }
    if (state.outcome !== "ongoing") break;
  }
  return logs;
}

function drawCards(state, count) {
  for (let i = 0; i < count; i += 1) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) break;
      state.drawPile = shuffle(state.discardPile.splice(0), state.random);
    }
    state.hand.push(state.drawPile.pop());
    state.handModifiers.push({});
  }
}

function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

window.GameCombat = { createRun, playCard, endTurn, drawCards, useItem, getItemCapacity, addItemToInventory, purchaseItem, getCardDefinition };
})();
