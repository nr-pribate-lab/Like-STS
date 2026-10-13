(() => {
const { characters, enemies, stages } = window.GameContent;

function createRun(enemyId = "enemy_ash_warden", random = Math.random, relicIds = [], startingDeck = null, itemIds = [], gold = 100, characterId = "character_ash_swordsman") {
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
  const stage = stages["stage_ash_corridor"];
  const enemy = enemies[enemyId];
  const deck = shuffle([...(startingDeck || character.startingDeck)], random);
  const state = {
    character, stage, enemyDefinition: enemy,
    player: { hp: character.maxHp, maxHp: character.maxHp, block: 0, attackBonus: 0, strength: 0, expiringStrength: 0 },
    enemy: { name: enemy.name, hp: enemy.maxHp, maxHp: enemy.maxHp, block: 0 },
    drawPile: deck, hand: [], discardPile: [], energy: character.startingEnergy,
    turn: 1, phase: "player", outcome: "ongoing", relicIds: [...relicIds], itemIds: [...itemIds], itemCapacity, gold, bats: [], powers: [], log: "灰守りが道を塞いでいる。手札から行動を選ぼう。",
    random,
  };
  triggerRelicEvent(state, "onBattleStart");
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
  return true;
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
  if (card.type === "persistent") {
    state.powers.push(cardId);
    state.log = `${card.name}を使用した。永続効果が次の自分のターンから発動する。`;
  } else {
    state.discardPile.push(cardId);
  }
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
  state.player.block = Math.max(0, state.player.block - intent.damage);
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
  const startTurnLogs = startPlayerTurn(state);
  if (state.outcome !== "ongoing") {
    state.log = `${startTurnLogs.join("。")}。HPが0になった。`;
    return state;
  }
  drawCards(state, state.character.handSize);
  state.log = `ターン ${state.turn}。灰守りは攻撃の構えを崩さない。${startTurnLogs.length ? " " + startTurnLogs.join("。") + "。" : ""}`;
  return state;
}

function startPlayerTurn(state) {
  const logs = [];
  state.player.block = 0;
  if (state.player.expiringStrength > 0) {
    state.player.strength = Math.max(0, state.player.strength - 1);
    state.player.expiringStrength -= 1;
  }
  const handlers = window.GameContentEffects || {};
  for (const cardId of state.powers) {
    const card = state.character.cards[cardId];
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
  }
}

function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

window.GameCombat = { createRun, playCard, endTurn, drawCards, useItem, getItemCapacity, addItemToInventory, purchaseItem };
})();
