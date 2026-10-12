(() => {
const { character, cards, enemies, stages } = window.GameContent;

function createRun(random = Math.random) {
  const stage = stages["ash-corridor"];
  const enemy = enemies[stage.enemyId];
  const deck = shuffle([...character.startingDeck], random);
  const state = {
    character, stage, enemyDefinition: enemy,
    player: { hp: character.maxHp, maxHp: character.maxHp, block: 0 },
    enemy: { hp: enemy.maxHp, maxHp: enemy.maxHp, block: 0 },
    drawPile: deck, hand: [], discardPile: [], energy: character.startingEnergy,
    turn: 1, phase: "player", outcome: "ongoing", log: "灰守りが道を塞いでいる。手札から行動を選ぼう。",
    random,
  };
  drawCards(state, character.handSize);
  return state;
}

function playCard(state, handIndex) {
  if (state.phase !== "player" || state.outcome !== "ongoing") return state;
  const cardId = state.hand[handIndex];
  const card = cards[cardId];
  if (!card || state.energy < card.cost) return state;
  state.energy -= card.cost;
  state.hand.splice(handIndex, 1);
  if (card.damage) {
    const damage = Math.max(0, card.damage - state.enemy.block);
    state.enemy.block = Math.max(0, state.enemy.block - card.damage);
    state.enemy.hp = Math.max(0, state.enemy.hp - damage);
    state.log = `${card.name}！ 灰守りに ${damage} ダメージ。`;
  }
  state.discardPile.push(cardId);
  if (state.enemy.hp <= 0) {
    state.outcome = "victory";
    state.log = "灰守りを打ち倒した。回廊に静寂が戻る。";
  }
  return state;
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
  state.energy = character.startingEnergy;
  state.phase = "player";
  drawCards(state, character.handSize);
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
