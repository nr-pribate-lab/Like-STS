(() => {
let selectedCharacterId = "character_ash_swordsman";
let cardDefinitions = window.GameContent.characters[selectedCharacterId].cards;
const mapStage = window.GameContent.stages["stage_ash_corridor"];
const mapNodes = window.GameContent.mapNodes;
const { createRun, endTurn, playCard } = window.GameCombat;

let state = null;
let mapProgress = null;
let mapDialogMode = null;
const townSupplies = { gold: 100, itemIds: [] };
const cardPrices = { card_focus: 65, card_zone: 60, card_heavy_strike: 75, card_parry: 60, card_flurry: 65 };
const vampireCardPrices = { card_vampire_bite: 65, card_bat_call: 65, card_bat_dive: 75, card_bat_absorption: 70, card_blood_frenzy: 65, card_blood_pact: 80 };
const relicPrices = { relic_power_belt: 80, relic_ember_ward: 90, relic_first_flame: 100, relic_foresight_compass: 110 };
const removeCardPrice = 75;
let currentShopCardIds = [];
let currentShopCardPrices = cardPrices;
let currentShopRelicIds = [];
let pendingRewards = null;
const $ = (id) => document.getElementById(id);
const ui = {
  hand: $("hand"), enemyHp: $("enemy-hp"), playerHp: $("player-hp"),
  enemyHealth: $("enemy-health"), playerHealth: $("player-health"),
  energy: $("energy-value"), draw: $("draw-count"), discard: $("discard-count"),
  block: $("block-value"), log: $("combat-log"), intent: $("enemy-intent"),
  enemyStatus: $("enemy-status"), banner: $("turn-banner"), enemyArt: $("enemy-art"),
  endTurn: $("end-turn"), message: $("message-dialog"), help: $("help-dialog"),
  mapDialog: $("map-node-dialog"),
  runLabel: $("run-label"), helpButton: $("help-button"),
  combatActions: $("combat-actions"), menuDialog: $("run-menu-dialog"),
  screens: ["title-screen", "town-screen", "adventure-screen", "map-screen", "town-item-shop-screen", "shop-screen", "rewards-screen", "card-reward-screen", "upgrade-screen", "social-screen", "combat-screen"].map($),
};

function showScreen(screenId) {
  for (const screen of ui.screens) {
    const active = screen.id === screenId;
    screen.classList.toggle("is-active", active);
    screen.setAttribute("aria-hidden", String(!active));
  }
  const inCombat = screenId === "combat-screen";
  const onMap = screenId === "map-screen";
  ui.runLabel.hidden = !inCombat;
  ui.combatActions.hidden = !inCombat && !onMap;
  $("menu-button").hidden = !inCombat && !onMap;
  ui.helpButton.hidden = !inCombat;
  if (inCombat) render();
  if (screenId === "map-screen") renderMap();
  if (screenId === "town-screen") $("town-gold").textContent = townSupplies.gold + "$";
  if (screenId === "town-item-shop-screen") renderTownItemShop();
}

function renderMap() {
  $("map-gold").textContent = mapProgress.gold + "$";
  $("map-items-count").textContent = mapProgress.itemIds.length + " / " + window.GameCombat.getItemCapacity(mapProgress.relicIds);
  const track = $("map-track");
  const note = $("map-note");
  const entries = mapStage.nodeIds.map((id) => mapNodes[id]);
  const fragment = document.createDocumentFragment();

  entries.forEach((node, index) => {
    if (index > 0) {
      const connector = document.createElement("div");
      connector.className = "map-connector " + (index <= mapProgress.nodeIndex ? "is-cleared" : "");
      connector.setAttribute("aria-hidden", "true");
      fragment.append(connector);
    }
    const current = index === mapProgress.nodeIndex;
    const complete = index < mapProgress.nodeIndex;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-node " + (current ? "is-current " : "") + (complete ? "is-cleared " : "") + (node.implemented ? "" : "is-unimplemented");
    button.disabled = !current;
    button.setAttribute("aria-label", node.name + (complete ? "、通過済み" : node.implemented ? "、進行可能" : "、未実装"));
    button.title = node.name + (node.implemented ? "" : "（未実装）");
    button.setAttribute("aria-current", current ? "step" : "false");
    const icon = document.createElement("span");
    icon.className = "map-node-icon";
    icon.textContent = ({ normal_battle: "⚔", elite: "♛", boss: "♛", event: "?", rest: "⌂", shop: "◇", social: "◌" })[node.type] || "·";
    button.append(icon);
    if (current) button.addEventListener("click", () => enterMapNode(node, index));
    fragment.append(button);
  });

  track.replaceChildren(fragment);
  const currentNode = entries[mapProgress.nodeIndex];
  note.textContent = currentNode?.implemented
    ? "現在地のアイコンを選択してください。"
    : currentNode
      ? currentNode.type === "boss" ? "最終ボス戦は未実装です。" : "現在地は未実装です。表示後に次の地点へ進めます。"
      : "マップを踏破しました。";
}

function renderTownItemShop() {
  const capacity = window.GameCombat.getItemCapacity([]);
  $("town-shop-gold").textContent = townSupplies.gold + "$";
  $("town-shop-items").textContent = townSupplies.itemIds.length + " / " + capacity;
  renderItemOffers($("town-item-offers"), townSupplies, capacity, "town");
}

function renderShop() {
  $("shop-deck-count").textContent = "現在のデッキ：" + mapProgress.deck.length + "枚";
  $("run-shop-gold").textContent = mapProgress.gold + "$";
  renderCardOffers();
  renderRelicOffers();
  renderItemOffers($("shop-item-offers"), mapProgress, window.GameCombat.getItemCapacity(mapProgress.relicIds), "run");
  renderRemovalOptions();
}

function pickShopOffers(ids, count) {
  const pool = [...ids];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count);
}

function renderSelectedCharacter() {
  const character = window.GameContent.characters[selectedCharacterId];
  $("selected-character-name").textContent = character.name;
  $("selected-character-description").textContent = `HP ${character.maxHp} · ${character.description}`;
  $("selected-character-art").className = "choice-art " + (selectedCharacterId === "character_nightborn" ? "vampire-art" : "character-art");
}

function renderCharacterOptions() {
  const container = $("character-options");
  container.replaceChildren();
  for (const character of Object.values(window.GameContent.characters)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-option";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(character.id === selectedCharacterId));
    const name = document.createElement("strong");
    name.textContent = character.name;
    const description = document.createElement("small");
    description.textContent = `HP ${character.maxHp} · ${character.description}`;
    button.append(name, description);
    button.addEventListener("click", () => {
      selectedCharacterId = character.id;
      cardDefinitions = character.cards;
      renderSelectedCharacter();
      renderCharacterOptions();
      container.hidden = true;
      $("character-select-toggle").setAttribute("aria-expanded", "false");
    });
    container.append(button);
  }
}

function pickRewardCards(characterId, count = 3) {
  const pool = Object.values(window.GameContent.characters[characterId].cards)
    .filter((card) => Number.isFinite(card.rewardWeight) && card.rewardWeight > 0);
  const picks = [];
  while (pool.length && picks.length < count) {
    const totalWeight = pool.reduce((total, card) => total + card.rewardWeight, 0);
    let roll = Math.random() * totalWeight;
    const chosenIndex = pool.findIndex((card) => (roll -= card.rewardWeight) < 0);
    picks.push(pool.splice(chosenIndex < 0 ? pool.length - 1 : chosenIndex, 1)[0]);
  }
  return picks;
}

function createBattleRewards() {
  const itemDrops = Object.keys(window.GameContent.items);
  const itemId = Math.random() < 0.25 && itemDrops.length
    ? itemDrops[Math.floor(Math.random() * itemDrops.length)]
    : null;
  return {
    gold: 20,
    goldClaimed: false,
    itemId,
    itemClaimed: !itemId,
    cards: pickRewardCards(mapProgress.characterId),
    cardClaimed: false,
    cardResolved: false,
  };
}

function renderRewards() {
  $("reward-gold-copy").textContent = `所持金に20$加わります（現在 ${mapProgress.gold}$）。`;
  $("claim-gold").disabled = pendingRewards.goldClaimed;
  $("claim-gold").textContent = pendingRewards.goldClaimed ? "受け取り済み" : "20$を受け取る";
  const itemArea = $("reward-item-area");
  itemArea.hidden = !pendingRewards.itemId;
  if (pendingRewards.itemId) {
    const item = window.GameContent.items[pendingRewards.itemId];
    const capacity = window.GameCombat.getItemCapacity(mapProgress.relicIds);
    const hasRoom = mapProgress.itemIds.length < capacity;
    $("reward-item-copy").textContent = hasRoom
      ? `${item.name}：${item.description} 所持数 ${mapProgress.itemIds.length}/${capacity}`
      : `${item.name}が見つかったが、アイテム所持数が上限です。`;
    $("claim-item").disabled = pendingRewards.itemClaimed || !hasRoom;
    $("claim-item").textContent = pendingRewards.itemClaimed ? "受け取り済み" : hasRoom ? "受け取る" : "所持上限";
    if (!hasRoom) pendingRewards.itemClaimed = true;
  }
  $("open-card-reward").disabled = pendingRewards.cardClaimed;
  $("open-card-reward").textContent = pendingRewards.cardClaimed ? "選択済み" : "カードを選ぶ";
  $("reward-card-copy").textContent = pendingRewards.cardClaimed
    ? "カード報酬を受け取りました。"
    : pendingRewards.cardResolved
      ? "カード報酬は見送りました。受け取る場合は候補を選べます。"
      : "3枚の候補から1枚を選びます。";
  $("continue-after-rewards").disabled = !(pendingRewards.goldClaimed && pendingRewards.itemClaimed && pendingRewards.cardResolved);
}

function chooseRewardCard(cardId) {
  if (pendingRewards.cardClaimed || !pendingRewards.cards.some((card) => card.id === cardId)) return;
  mapProgress.deck.push(cardId);
  pendingRewards.cardClaimed = true;
  pendingRewards.cardResolved = true;
  renderRewards();
  showScreen("rewards-screen");
}

function renderCardRewardChoices() {
  const container = $("reward-card-options");
  container.replaceChildren();
  for (const card of pendingRewards.cards) {
    const button = document.createElement("button");
    button.className = "reward-card-button";
    button.type = "button";
    const title = document.createElement("strong");
    title.textContent = card.name;
    const description = document.createElement("span");
    description.textContent = card.description;
    const cost = document.createElement("small");
    cost.textContent = `コスト ${card.cost} · ${{ attack: "攻撃", skill: "スキル", persistent: "永続" }[card.type] || card.type}`;
    button.append(title, description, cost);
    button.addEventListener("click", () => chooseRewardCard(card.id));
    container.append(button);
  }
}

function renderItemOffers(container, owner, capacity, scope) {
  container.replaceChildren();
  for (const item of Object.values(window.GameContent.items)) {
    const entry = document.createElement("article");
    entry.className = "shop-relic-card shop-offer";
    const icon = document.createElement("span");
    icon.className = "shop-relic-icon";
    icon.textContent = "✚";
    const detail = document.createElement("div");
    detail.className = "shop-offer-detail";
    const title = document.createElement("strong");
    title.textContent = item.name;
    const description = document.createElement("p");
    description.textContent = item.description;
    detail.append(title, description);
    const buy = document.createElement("button");
    buy.className = "secondary-button shop-offer-button";
    buy.textContent = item.price + "$で購入";
    buy.dataset.shopKind = "item";
    buy.dataset.shopId = item.id;
    buy.dataset.shopScope = scope;
    buy.disabled = owner.gold < item.price || owner.itemIds.length >= capacity;
    entry.append(icon, detail, buy);
    container.append(entry);
  }
}

function renderCardOffers() {
  const container = $("shop-card-offers");
  container.replaceChildren();
  for (const cardId of currentShopCardIds) {
    const price = currentShopCardPrices[cardId];
    const card = cardDefinitions[cardId];
    const entry = document.createElement("article");
    entry.className = "shop-relic-card shop-offer";
    const icon = document.createElement("span");
    icon.className = "shop-relic-icon";
    icon.textContent = "✧";
    const detail = document.createElement("div");
    detail.className = "shop-offer-detail";
    const title = document.createElement("strong");
    title.textContent = card.name;
    const description = document.createElement("p");
    description.textContent = card.description;
    detail.append(title, description);
    const buy = document.createElement("button");
    buy.className = "secondary-button shop-offer-button";
    buy.textContent = price + "$で購入";
    buy.dataset.shopKind = "card";
    buy.dataset.shopId = cardId;
    buy.disabled = mapProgress.gold < price;
    entry.append(icon, detail, buy);
    container.append(entry);
  }
}

function renderRelicOffers() {
  const container = $("shop-relic-offers");
  container.replaceChildren();
  for (const relicId of currentShopRelicIds) {
    const price = relicPrices[relicId];
    const relic = window.GameContent.relics[relicId];
    const entry = document.createElement("article");
    entry.className = "shop-relic-card shop-offer";
    const icon = document.createElement("span");
    icon.className = "shop-relic-icon";
    icon.textContent = "✦";
    const detail = document.createElement("div");
    detail.className = "shop-offer-detail";
    const title = document.createElement("strong");
    title.textContent = relic.name;
    const description = document.createElement("p");
    description.textContent = relic.description;
    detail.append(title, description);
    const buy = document.createElement("button");
    buy.className = "secondary-button shop-offer-button";
    buy.textContent = price + "$で購入";
    buy.dataset.shopKind = "relic";
    buy.dataset.shopId = relicId;
    buy.disabled = mapProgress.gold < price || mapProgress.relicIds.includes(relicId);
    entry.append(icon, detail, buy);
    container.append(entry);
  }
}

function renderRemovalOptions() {
  const container = $("shop-remove-options");
  container.replaceChildren();
  const instruction = document.createElement("p");
  instruction.className = "shop-remove-instruction";
  instruction.textContent = "削除するカードを選んでください。選んだカードを1枚削除します。";
  container.append(instruction);
  for (const cardId of new Set(mapProgress.deck)) {
    const card = cardDefinitions[cardId];
    const button = document.createElement("button");
    button.className = "secondary-button shop-remove-card";
    const title = document.createElement("strong");
    title.textContent = card.name + "を削除（" + mapProgress.deck.filter((id) => id === cardId).length + "枚所持）";
    const description = document.createElement("span");
    description.textContent = card.description;
    button.append(title, description);
    button.dataset.shopKind = "remove-card";
    button.dataset.shopId = cardId;
    button.disabled = mapProgress.gold < removeCardPrice || mapProgress.deck.length <= 1;
    container.append(button);
  }
  $("shop-remove-toggle").disabled = mapProgress.gold < removeCardPrice || mapProgress.deck.length <= 1;
}

function enterMapNode(node, index) {
  if (node.type === "shop" && node.implemented) {
    currentShopCardPrices = mapProgress.characterId === "character_nightborn" ? vampireCardPrices : cardPrices;
    cardDefinitions = window.GameContent.characters[mapProgress.characterId].cards;
    currentShopCardIds = pickShopOffers(Object.keys(currentShopCardPrices), 5);
    currentShopRelicIds = pickShopOffers(Object.keys(relicPrices), 3);
    renderShop();
    showScreen("shop-screen");
    return;
  }

  if (node.type === "boss" && !node.implemented) {
    mapDialogMode = "endRun";
    $("map-dialog-eyebrow").textContent = "FINAL BOSS";
    $("map-dialog-title").textContent = "未実装";
    $("map-dialog-copy").textContent = "最終ボスとの戦闘と、勝利後のゲームクリアは未実装です。";
    $("map-dialog-action").textContent = "町へ戻る";
    ui.mapDialog.showModal();
    return;
  }

  if (["normal_battle", "boss"].includes(node.type) && node.implemented) {
    cardDefinitions = window.GameContent.characters[mapProgress.characterId].cards;
    state = createRun(node.enemyIds[0], Math.random, mapProgress.relicIds || [], mapProgress.deck, mapProgress.itemIds, mapProgress.gold, mapProgress.characterId);
    showScreen("combat-screen");
    return;
  }

  mapDialogMode = "skip";
  $("map-dialog-eyebrow").textContent = node.name;
  $("map-dialog-title").textContent = "未実装";
  $("map-dialog-copy").textContent = node.description + " この地点の機能は未実装です。今回はそのまま次へ進みます。";
  $("map-dialog-action").textContent = "次の地点へ";
  ui.mapDialog.dataset.nextIndex = String(index + 1);
  ui.mapDialog.showModal();
}

function leaveShop() {
  mapProgress.nodeIndex += 1;
  showScreen("map-screen");
}

function render() {
  const enemy = state.enemy;
  const player = state.player;
  ui.hand.replaceChildren(...state.hand.map((id, index) => makeCard(cardDefinitions[id], index)));
  $("player-name").textContent = state.character.name;
  const batCounter = $("bat-count");
  batCounter.hidden = state.bats.length === 0;
  batCounter.textContent = "🦇 " + state.bats.length;
  const persistentCards = $("persistent-cards");
  persistentCards.hidden = state.powers.length === 0;
  persistentCards.textContent = "永続：" + state.powers.map((id) => state.character.cards[id].name).join("・");
  $("enemy-name").textContent = state.enemyDefinition.name;
  ui.enemyHp.textContent = `${enemy.hp} / ${enemy.maxHp}`;
  ui.playerHp.textContent = `${player.hp} / ${player.maxHp}`;
  ui.enemyHealth.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  ui.playerHealth.style.width = `${(player.hp / player.maxHp) * 100}%`;
  ui.energy.textContent = state.energy;
  ui.draw.textContent = state.drawPile.length;
  ui.discard.textContent = state.discardPile.length;
  ui.block.textContent = player.block;
  ui.log.textContent = state.log;
  ui.intent.textContent = `⚔ ${state.enemyDefinition.intent.damage}`;
  ui.enemyStatus.textContent = state.enemyDefinition.intent.description;
  ui.endTurn.disabled = state.outcome !== "ongoing";
  ui.endTurn.classList.toggle("is-disabled", ui.endTurn.disabled);
  if (state.outcome !== "ongoing" && !ui.message.open) showOutcome();
}

function openMenu(view = null) {
  if (!ui.menuDialog.open) ui.menuDialog.showModal();
  showMenuView(view);
}

function showMenuView(view) {
  const home = $("menu-home");
  const detail = $("menu-detail");
  const content = $("menu-detail-content");
  const title = $("menu-view-title");
  const confirmAbandon = $("menu-abandon-confirm");
  $("menu-gold-count").textContent = (state?.gold ?? mapProgress?.gold ?? townSupplies.gold) + "$";
  home.hidden = Boolean(view);
  detail.hidden = !view;
  confirmAbandon.hidden = view !== "abandon";
  if (!view) {
    title.textContent = "メニュー";
    content.replaceChildren();
    return;
  }

  content.replaceChildren();
  const addParagraph = (text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    content.append(paragraph);
    return paragraph;
  };
  if (view === "deck") {
    title.textContent = "デッキ";
    const counts = new Map();
    if (state) {
      for (const id of [...state.drawPile, ...state.hand, ...state.discardPile, ...state.powers]) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    } else if (mapProgress?.deck) {
      for (const id of mapProgress.deck) counts.set(id, (counts.get(id) || 0) + 1);
    }
    const heading = document.createElement("p");
    heading.textContent = "合計 " + [...counts.values()].reduce((sum, count) => sum + count, 0) + " 枚";
    content.append(heading);
    const list = document.createElement("ul");
    list.className = "menu-card-list";
    [...counts.entries()]
      .sort((a, b) => (cardDefinitions[a[0]]?.name || a[0]).localeCompare(cardDefinitions[b[0]]?.name || b[0], "ja"))
      .forEach(([id, count]) => {
        const card = cardDefinitions[id];
        const item = document.createElement("li");
        const name = document.createElement("strong");
        name.textContent = (card?.name || id) + " × " + count;
        const description = document.createElement("small");
        description.textContent = card?.description || "";
        item.append(name, description);
        list.append(item);
      });
    content.append(list);
  } else if (view === "relics") {
    title.textContent = "レリック";
    const relicIds = mapProgress?.relicIds || state?.relicIds || [];
    if (relicIds.length === 0) addParagraph("所持しているレリックはありません。");
    for (const id of relicIds) {
      const relic = window.GameContent.relics[id];
      const item = document.createElement("article");
      item.className = "menu-relic-item";
      const name = document.createElement("strong");
      name.textContent = relic?.name || id;
      const description = document.createElement("p");
      description.textContent = relic?.description || "";
      item.append(name, description);
      content.append(item);
    }
  } else if (view === "items") {
    title.textContent = "アイテム";
    const itemIds = state?.itemIds || mapProgress?.itemIds || [];
    const capacity = state?.itemCapacity ?? window.GameCombat.getItemCapacity(mapProgress?.relicIds || []);
    addParagraph("所持数 " + itemIds.length + " / " + capacity);
    if (itemIds.length === 0) {
      addParagraph("所持しているアイテムはありません。");
    } else {
      itemIds.forEach((itemId, index) => {
        const item = window.GameContent.items[itemId];
        const article = document.createElement("article");
        article.className = "menu-relic-item";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const description = document.createElement("p");
        description.textContent = item.description;
        article.append(name, description);
        if (state) {
          const useButton = document.createElement("button");
          useButton.type = "button";
          useButton.className = "secondary-button item-use-button";
          useButton.textContent = "使う";
          useButton.disabled = state.phase !== "player" || state.outcome !== "ongoing";
          useButton.addEventListener("click", () => {
            window.GameCombat.useItem(state, index);
            mapProgress.itemIds = [...state.itemIds];
            render();
            showMenuView("items");
          });
          article.append(useButton);
        }
        content.append(article);
      });
    }
  } else if (view === "suspend") {
    title.textContent = "中断する";
    addParagraph("中断と状態の保存は未実装です。今はこのメニューを閉じて戦闘に戻れます。");
  } else if (view === "abandon") {
    title.textContent = "冒険をあきらめる";
    addParagraph("進行中の冒険を終了して町へ戻ります。よろしいですか？");
  }
}

function abandonRun() {
  returnRunSupplies();
  ui.menuDialog.close();
  state = null;
  mapProgress = null;
  showScreen("town-screen");
}

function returnRunSupplies() {
  if (!mapProgress) return;
  townSupplies.gold = state?.gold ?? mapProgress.gold;
  townSupplies.itemIds = [...(state?.itemIds || mapProgress.itemIds)].slice(0, window.GameCombat.getItemCapacity([]));
}

function playEnemyHit() {
  ui.enemyArt.classList.remove("is-hit");
  void ui.enemyArt.offsetWidth;
  ui.enemyArt.classList.add("is-hit");
}

function makeCard(card, index) {
  const button = document.createElement("button");
  const hasRequiredBats = (card.requires?.bats || 0) <= state.bats.length;
  button.className = `card rarity-${card.rarity} ${state.energy < card.cost ? "is-unplayable" : ""}`;
  button.type = "button";
  button.disabled = state.energy < card.cost || state.outcome !== "ongoing" || !hasRequiredBats;
  button.setAttribute("aria-label", `${card.name}, コスト${card.cost}。${card.description}`);
  const top = document.createElement("div"); top.className = "card-top";
  const type = document.createElement("span"); type.className = "card-type"; type.textContent = ({ attack: "攻撃", skill: "スキル", persistent: "永続" })[card.type] || card.type;
  const cost = document.createElement("span"); cost.className = "card-cost"; cost.textContent = card.cost;
  const art = document.createElement("div"); art.className = "card-art"; art.innerHTML = "<span class=\"slash slash-a\"></span><span class=\"slash slash-b\"></span><span class=\"card-spark\">✦</span>";
  const name = document.createElement("strong"); name.className = "card-name"; name.textContent = card.name;
  const description = document.createElement("span"); description.className = "card-description"; description.textContent = card.description;
  const footer = document.createElement("span"); footer.className = "card-footer"; footer.textContent = state.character.name;
  top.append(type, cost); button.append(top, art, name, description, footer);
  button.addEventListener("click", () => {
    const previousEnemyHp = state.enemy.hp;
    playCard(state, index);
    if (state.enemy.hp < previousEnemyHp) playEnemyHit();
    render();
  });
  return button;
}

function showOutcome() {
  const won = state.outcome === "victory";
  const finalBossVictory = won && mapNodes[mapStage.nodeIds[mapProgress?.nodeIndex]]?.type === "boss";
  $("dialog-mark").textContent = won ? "✦" : "…";
  $("dialog-eyebrow").textContent = finalBossVictory ? "FINAL BOSS DEFEATED" : won ? "ENCOUNTER CLEAR" : "RUN ENDED";
  $("dialog-title").textContent = finalBossVictory ? "灰の回廊を踏破した" : won ? "敵を退けた" : "旅はここで終わる";
  $("dialog-copy").textContent = won
    ? finalBossVictory
      ? "最終ボスを倒し、灰の回廊を踏破した。"
      : "この地点の戦闘に勝利した。報酬を選んで受け取ろう。"
    : "敵に敗れた。手札の使い方を変えて、もう一度挑もう。";
  $("dialog-action").textContent = finalBossVictory ? "旅を終える" : won ? "報酬を確認する" : "町へ戻る";
  ui.message.showModal();
}

ui.endTurn.addEventListener("click", () => { endTurn(state); render(); });
ui.enemyArt.addEventListener("animationend", (event) => {
  if (event.animationName === "hit") ui.enemyArt.classList.remove("is-hit");
});
$("dialog-action").addEventListener("click", () => {
  const victory = state?.outcome === "victory";
  const finalBossVictory = victory && mapNodes[mapStage.nodeIds[mapProgress?.nodeIndex]]?.type === "boss";
  if (mapProgress && state) {
    mapProgress.itemIds = [...state.itemIds];
    mapProgress.gold = state.gold;
  }
  if (finalBossVictory || !victory) returnRunSupplies();
  ui.message.close();
  if (victory && !finalBossVictory && mapProgress) {
    mapProgress.itemIds = [...state.itemIds];
    mapProgress.gold = state.gold;
    state = null;
    pendingRewards = createBattleRewards();
    renderRewards();
    showScreen("rewards-screen");
    return;
  }
  state = null;
  if (finalBossVictory) {
    mapProgress = null;
    showScreen("title-screen");
  } else {
    if (mapProgress) mapProgress.relicIds = [];
    mapProgress = null;
    showScreen("town-screen");
  }
});
$("start-game").addEventListener("click", () => showScreen("town-screen"));
$("town-adventure").addEventListener("click", () => showScreen("adventure-screen"));
$("town-upgrade").addEventListener("click", () => showScreen("upgrade-screen"));
$("town-social").addEventListener("click", () => showScreen("social-screen"));
for (const button of document.querySelectorAll("[data-go]")) {
  button.addEventListener("click", () => showScreen(button.dataset.go));
}
$("claim-gold").addEventListener("click", () => {
  if (!pendingRewards || pendingRewards.goldClaimed) return;
  mapProgress.gold += pendingRewards.gold;
  pendingRewards.goldClaimed = true;
  renderRewards();
});
$("claim-item").addEventListener("click", () => {
  if (!pendingRewards?.itemId || pendingRewards.itemClaimed) return;
  const capacity = window.GameCombat.getItemCapacity(mapProgress.relicIds);
  if (window.GameCombat.addItemToInventory(mapProgress.itemIds, pendingRewards.itemId, capacity)) {
    pendingRewards.itemClaimed = true;
    renderRewards();
  }
});
$("open-card-reward").addEventListener("click", () => {
  if (!pendingRewards || pendingRewards.cardClaimed) return;
  renderCardRewardChoices();
  showScreen("card-reward-screen");
});
$("skip-card-reward").addEventListener("click", () => {
  if (!pendingRewards) return;
  pendingRewards.cardResolved = true;
  renderRewards();
  showScreen("rewards-screen");
});
$("continue-after-rewards").addEventListener("click", () => {
  if (!pendingRewards || !pendingRewards.goldClaimed || !pendingRewards.itemClaimed || !pendingRewards.cardResolved) return;
  mapProgress.relicIds = [];
  mapProgress.nodeIndex += 1;
  pendingRewards = null;
  showScreen("map-screen");
});
for (const option of [$("select-dungeon")]) {
  option.addEventListener("click", () => {
    option.classList.add("is-selected");
    option.setAttribute("aria-pressed", "true");
  });
}
$("character-select-toggle").addEventListener("click", () => {
  const options = $("character-options");
  options.hidden = !options.hidden;
  $("character-select-toggle").setAttribute("aria-expanded", String(!options.hidden));
});
renderSelectedCharacter();
renderCharacterOptions();
$("begin-adventure").addEventListener("click", () => {
  state = null;
  mapProgress = {
    stageId: mapStage.id,
    nodeIndex: 0,
    relicIds: [],
    itemIds: [...townSupplies.itemIds],
    gold: townSupplies.gold,
    characterId: selectedCharacterId,
    deck: [...window.GameContent.characters[selectedCharacterId].startingDeck],
  };
  townSupplies.itemIds = [];
  townSupplies.gold = 0;
  showScreen("map-screen");
});
$("town-item-shop").addEventListener("click", () => showScreen("town-item-shop-screen"));
$("shop-skip").addEventListener("click", leaveShop);
$("town-item-offers").addEventListener("click", (event) => {
  const button = event.target.closest("[data-shop-kind='item']");
  if (button && window.GameCombat.purchaseItem(townSupplies, button.dataset.shopId, window.GameCombat.getItemCapacity([]))) renderTownItemShop();
});
$("shop-remove-toggle").addEventListener("click", () => {
  const options = $("shop-remove-options");
  options.hidden = !options.hidden;
  const expanded = !options.hidden;
  $("shop-remove-toggle").setAttribute("aria-expanded", String(expanded));
  $("shop-remove-toggle").textContent = expanded ? "カード選択を閉じる" : "カードを1枚削除 · 75$";
  if (expanded) options.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
$("shop-screen").addEventListener("click", (event) => {
  const button = event.target.closest("[data-shop-kind]");
  if (!button || button.disabled) return;
  if (button.dataset.shopKind === "item") {
    window.GameCombat.purchaseItem(mapProgress, button.dataset.shopId, window.GameCombat.getItemCapacity(mapProgress.relicIds));
  } else if (button.dataset.shopKind === "card") {
    const price = currentShopCardPrices[button.dataset.shopId];
    if (mapProgress.gold >= price) {
      mapProgress.gold -= price;
      mapProgress.deck.push(button.dataset.shopId);
    }
  } else if (button.dataset.shopKind === "relic") {
    const price = relicPrices[button.dataset.shopId];
    if (mapProgress.gold >= price && !mapProgress.relicIds.includes(button.dataset.shopId)) {
      mapProgress.gold -= price;
      mapProgress.relicIds.push(button.dataset.shopId);
    }
  } else if (button.dataset.shopKind === "remove-card") {
    if (mapProgress.gold >= removeCardPrice && mapProgress.deck.length > 1) {
      mapProgress.gold -= removeCardPrice;
      mapProgress.deck.splice(mapProgress.deck.indexOf(button.dataset.shopId), 1);
    }
  }
  $("shop-remove-options").hidden = false;
  renderShop();
});
$("menu-button").addEventListener("click", () => openMenu());
$("menu-close").addEventListener("click", () => ui.menuDialog.close());
$("menu-back").addEventListener("click", () => showMenuView());
$("menu-abandon-confirm").addEventListener("click", abandonRun);
for (const button of document.querySelectorAll("[data-menu-view]")) {
  button.addEventListener("click", () => showMenuView(button.dataset.menuView));
}
$("map-dialog-action").addEventListener("click", () => {
  ui.mapDialog.close();
  if (mapDialogMode === "skip") {
    mapProgress.nodeIndex = Number(ui.mapDialog.dataset.nextIndex);
    showScreen("map-screen");
  } else if (mapDialogMode === "endRun") {
    returnRunSupplies();
    mapProgress = null;
    showScreen("town-screen");
  }
  mapDialogMode = null;
});
$("brand-home").addEventListener("click", (event) => {
  event.preventDefault();
  if (mapProgress) openMenu("abandon");
  else showScreen("town-screen");
});
$("help-button").addEventListener("click", () => ui.help.showModal());
$("help-close").addEventListener("click", () => ui.help.close());
$("help-done").addEventListener("click", () => ui.help.close());
ui.help.addEventListener("click", (event) => { if (event.target === ui.help) ui.help.close(); });
showScreen("title-screen");
})();
