(() => {
let selectedCharacterId = "character_ash_swordsman";
let cardDefinitions = window.GameContent.characters[selectedCharacterId].cards;
const mapStage = window.GameContent.stages["stage_ash_corridor"];
const mapNodes = window.GameContent.mapNodes;
const { createRun, endTurn, playCard } = window.GameCombat;

let state = null;
let pendingTargetCardIndex = null;
let mapProgress = null;
let mapDialogMode = null;
let activeEvent = null;
let selectedEventChoice = null;
let selectedEventCardIndex = null;
let museumStage = "scope";
let museumScope = null;
let museumCategory = null;
let townShopMode = "general";
let loadedSave = null;
let storageBlocked = false;
function storageError(message) {
  const box = document.getElementById("save-status");
  box.hidden = false;
  box.textContent = message;
}
function loadTownProfile() {
  try {
    loadedSave = window.GameSave.decode(localStorage.getItem(window.GameSave.key));
    const saved = loadedSave.profile;
    return {
      starFragments: Number.isInteger(saved.starFragments) && saved.starFragments >= 0 ? saved.starFragments : 0,
      itemIds: Array.isArray(saved.itemIds) ? saved.itemIds.filter((id) => window.GameContent.items[id]) : [],
      unlockedNodes: saved.unlockedNodes && typeof saved.unlockedNodes === "object" ? saved.unlockedNodes : {},
      unlockedCharacterIds: Array.isArray(saved.unlockedCharacterIds) ? saved.unlockedCharacterIds.filter((id) => window.GameContent.characters[id]) : [],
      seraApothecaryAvailable: saved.seraApothecaryAvailable === true,
      seraShopSpend: Number.isInteger(saved.seraShopSpend) && saved.seraShopSpend >= 0 ? saved.seraShopSpend : 0,
    };
  } catch (error) {
    storageBlocked = true;
    storageError("保存データを読み込めませんでした。既存データは上書きしません。" + error.message);
    return { starFragments: 0, itemIds: [], unlockedNodes: {}, unlockedCharacterIds: [], seraApothecaryAvailable: false, seraShopSpend: 0 };
  }
}
const savedTownProfile = loadTownProfile();
const townSupplies = { starFragments: savedTownProfile.starFragments, itemIds: savedTownProfile.itemIds, seraApothecaryAvailable: savedTownProfile.seraApothecaryAvailable, seraShopSpend: savedTownProfile.seraShopSpend };
const unlockedNodes = savedTownProfile.unlockedNodes;
const unlockedCharacterIds = new Set(["character_ash_swordsman", "character_nightborn", ...savedTownProfile.unlockedCharacterIds]);
for (const characterId of Object.keys(unlockedNodes)) {
  const validIds = new Set(getCharacterTree(characterId).map((node) => node.id));
  unlockedNodes[characterId] = Array.isArray(unlockedNodes[characterId]) ? [...new Set(unlockedNodes[characterId].filter((id) => validIds.has(id)))] : [];
}
function saveTownProfile() {
  return persistGame();
}
function getCharacterTree(characterId) { return window.GameContent.upgradeTrees?.[characterId] || []; }
function isCharacterUnlocked(characterId) { return unlockedCharacterIds.has(characterId); }
function isNodeUnlocked(characterId, nodeId) { return (unlockedNodes[characterId] || []).includes(nodeId); }
function isCardUnlocked(characterId, cardId) {
  const node = getCharacterTree(characterId).find((entry) => entry.rewardType === "card" && entry.rewardId === cardId);
  return !node || isNodeUnlocked(characterId, node.id);
}
function isRelicUnlocked(relicId, characterId) {
  const node = getCharacterTree(characterId).find((entry) => entry.rewardType === "relic" && entry.rewardId === relicId);
  return !node || isNodeUnlocked(characterId, node.id);
}
const cardPrices = { card_focus: 65, card_zone: 60, card_heavy_strike: 75, card_parry: 60, card_flurry: 65, card_perfect_rhythm: 70, card_edge_echo: 80, card_guard_echo: 80, card_hand_strength: 70, card_reform_defense: 75, card_guard_crush: 75, card_riposte: 70, card_measured_guard: 65, card_shared_beat: 80, card_pivot_assault: 85, card_iron_advance: 75, card_shield_breaker: 80 };
const vampireCardPrices = { card_vampire_bite: 65, card_bat_call: 65, card_bat_dive: 75, card_bat_absorption: 70, card_blood_frenzy: 65, card_blood_pact: 80 };
const seraCardPrices = { card_sera_signal: 65, card_sera_flare: 70, card_sera_focus: 65 };
const relicPrices = { relic_power_belt: 80, relic_ember_ward: 90, relic_first_flame: 100, relic_foresight_compass: 110, relic_swordsman_forge: 125, relic_nightborn_moonbat: 125, relic_swordsman_edge_echo: 130, relic_swordsman_guard_echo: 130, relic_wayfarer_satchel: 95, relic_first_breath: 105, relic_quiet_script: 105, relic_rhythm_bead: 120, relic_guardian_thread: 90, relic_ash_salve: 110, relic_gilded_signet: 100, relic_last_light: 100 };
const removeCardPrice = 75;
let currentShopCardIds = [];
let currentShopCardPrices = cardPrices;
let currentShopRelicIds = [];
let currentShopItemIds = [];
let pendingRewards = null;
const $ = (id) => document.getElementById(id);
const ui = {
  hand: $("hand"), playerHp: $("player-hp"), playerHealth: $("player-health"),
  energy: $("energy-value"), draw: $("draw-count"), discard: $("discard-count"),
  block: $("block-value"), log: $("combat-log"),
  banner: $("turn-banner"),
  endTurn: $("end-turn"), message: $("message-dialog"), help: $("help-dialog"),
  mapDialog: $("map-node-dialog"),
  runLabel: $("run-label"), helpButton: $("help-button"),
  combatActions: $("combat-actions"), menuDialog: $("run-menu-dialog"),
  screens: ["title-screen", "town-screen", "adventure-screen", "map-screen", "town-item-shop-screen", "shop-screen", "rewards-screen", "card-reward-screen", "clear-screen", "rest-screen", "event-screen", "upgrade-screen", "social-screen", "sera-talk-screen", "museum-screen", "combat-screen"].map($),
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
  if (screenId === "adventure-screen") {
    renderSelectedCharacter();
    renderCharacterOptions();
  }
  if (screenId === "town-screen") $("town-gold").textContent = townSupplies.starFragments + "個";
  if (screenId === "social-screen") {
    $("social-sera-shop").hidden = !townSupplies.seraApothecaryAvailable;
    $("social-sera-talk").hidden = !townSupplies.seraApothecaryAvailable;
  }
  if (screenId === "town-item-shop-screen") renderTownItemShop();
  if (screenId === "sera-talk-screen") renderSeraTalkTopics();
  if (screenId === "upgrade-screen") renderUpgradeTree();
  if (screenId === "museum-screen") {
    museumStage = "scope";
    museumScope = null;
    museumCategory = null;
    renderMuseum();
  }
}

function renderMuseum() {
  const navigation = $("museum-navigation");
  const collection = $("museum-collection");
  const back = $("museum-back");
  navigation.replaceChildren();
  collection.replaceChildren();
  const addChoice = (label, callback, note = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "museum-choice";
    const title = document.createElement("strong");
    title.textContent = label;
    button.append(title);
    if (note) {
      const description = document.createElement("small");
      description.textContent = note;
      button.append(description);
    }
    button.addEventListener("click", callback);
    navigation.append(button);
  };
  const addHeading = (text) => {
    const heading = document.createElement("p");
    heading.className = "museum-nav-heading";
    heading.textContent = text;
    navigation.append(heading);
  };
  const characters = Object.values(window.GameContent.characters || {});
  const activeCharacter = characters.find((character) => character.id === museumScope);
  const scopeName = activeCharacter?.name || "共通";
  const categoryNames = { cards: "カード", relics: "レリック", items: "アイテム" };
  const addEntry = ({ title, subtitle, description, extra }) => {
    const article = document.createElement("article");
    article.className = "museum-entry";
    const heading = document.createElement("div");
    heading.className = "museum-entry-heading";
    const name = document.createElement("strong");
    name.textContent = title;
    const note = document.createElement("small");
    note.textContent = subtitle;
    heading.append(name, note);
    const copy = document.createElement("p");
    copy.textContent = description;
    article.append(heading, copy);
    if (extra) {
      const detail = document.createElement("small");
      detail.className = "museum-entry-extra";
      detail.textContent = extra;
      article.append(detail);
    }
    collection.append(article);
  };

  if (museumStage === "scope") {
    addHeading("館長に話を聞くか、収蔵品を見るキャラクターを選んでください。");
    addChoice("館長と話す", () => { museumStage = "talk"; renderMuseum(); }, "展示品やこの町について聞く");
    for (const character of characters) {
      addChoice(character.name, () => { museumScope = character.id; museumStage = "category"; renderMuseum(); }, "キャラクターの収蔵品を見る");
    }
    addChoice("共通", () => { museumScope = "common"; museumStage = "category"; renderMuseum(); }, "共通レリックとアイテムを見る");
    back.hidden = true;
    return;
  }

  back.hidden = false;
  if (museumStage === "talk") {
    addHeading("博物館の館長に質問する");
    const greeting = document.createElement("p");
    greeting.className = "curator-dialogue";
    greeting.textContent = "館長「ようこそ。旅の記録なら、いくらでもお見せしましょう。何について聞きたいですか？」";
    navigation.append(greeting);
    const counts = {
      relics: Object.keys(window.GameContent.relics || {}).length,
      items: Object.keys(window.GameContent.items || {}).length,
      cards: characters.reduce((sum, character) => sum + Object.keys(character.cards || {}).length, 0),
    };
    const replies = {
      relics: `館長「レリックは全部で${counts.relics}種の記録があります。ひとつひとつに、かつての持ち主の旅が刻まれています。」`,
      items: `館長「アイテムは${counts.items}種。使いどころを見極めれば、苦しい戦いも切り抜けられるでしょう。」`,
      cards: `館長「二人の旅人が扱うカードは合わせて${counts.cards}種。強化後の姿も記録してありますよ。」`,
      town: "館長「この宿場は、塔へ挑む者たちが知恵を持ち寄る場所です。無事に戻ったら、また旅の話を聞かせてください。」",
    };
    for (const [topic, question] of [["relics", "レリックについて"], ["items", "アイテムについて"], ["cards", "カードについて"], ["town", "この町について"]]) {
      addChoice(question, () => {
        navigation.querySelector(".curator-dialogue").textContent = replies[topic];
      });
    }
    addChoice("キャラクター選択へ戻る", () => { museumStage = "scope"; renderMuseum(); });
    return;
  }

  if (museumStage === "category") {
    addHeading(`${scopeName}の収蔵品から、見たい種類を選んでください。`);
    for (const [category, label] of Object.entries(categoryNames)) {
      addChoice(label, () => { museumCategory = category; museumStage = "entries"; renderMuseum(); });
    }
    addChoice("キャラクター選択へ戻る", () => { museumScope = null; museumStage = "scope"; renderMuseum(); });
    return;
  }

  addHeading(`${scopeName} · ${categoryNames[museumCategory]}`);
  collection.setAttribute("aria-label", `${scopeName}の${categoryNames[museumCategory]}一覧`);
  let entries = [];
  let emptyMessage = "この分類の収蔵品はまだありません。";
  if (museumCategory === "relics") {
    entries = Object.values(window.GameContent.relics || {}).filter((relic) => museumScope === "common" ? !relic.characterId : relic.characterId === museumScope);
  } else if (museumCategory === "items") {
    entries = museumScope === "common" ? Object.values(window.GameContent.items || {}) : [];
    if (museumScope !== "common") emptyMessage = "アイテムは共通の収蔵品にあります。キャラクター選択へ戻り、「共通」をご覧ください。";
  } else if (activeCharacter) {
    entries = Object.values(activeCharacter.cards || {});
  } else {
    emptyMessage = "現在、共通カードはありません。カードはキャラクターごとの展示でご覧ください。";
  }
  entries.sort((a, b) => a.name.localeCompare(b.name, "ja"));
  const count = document.createElement("p");
  count.className = "museum-count";
  count.textContent = `${entries.length}種`;
  collection.append(count);
  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "museum-empty";
    empty.textContent = emptyMessage;
    collection.append(empty);
  }
  if (museumCategory === "relics") {
    for (const relic of entries) addEntry({ title: relic.name, subtitle: scopeName, description: relic.description });
  } else if (museumCategory === "items") {
    for (const item of entries) addEntry({ title: item.name, subtitle: `冒険中 ${item.price}$ · 町 ${item.townPrice ?? 1}個`, description: item.description });
  } else {
    const types = { attack: "攻撃", skill: "スキル", persistent: "永続" };
    for (const card of entries) {
      const rarity = ["基礎", "通常", "希少"][card.rarity] || "特殊";
      addEntry({
        title: card.name,
        subtitle: `${activeCharacter.name} · ${types[card.type] || card.type} · コスト${card.cost} · ${rarity}`,
        description: card.description,
        extra: card.upgrade ? `強化後：${card.upgrade.description}` : "強化なし",
      });
    }
  }
}

function currentMapNode() {
  const entry=mapProgress?.map.nodes[mapProgress.currentNodeId];
  return entry ? mapNodes[entry.nodeId] : null;
}
function availableMapNodeIds() {
  if (!mapProgress.currentNodeId) return mapProgress.map.floors[0].map(n=>n.id);
  const current=mapProgress.map.nodes[mapProgress.currentNodeId];
  return current.floor===mapProgress.nodeIndex ? current.nextIds : [];
}
function renderMap() {
  $("map-gold").textContent=mapProgress.gold+"$";
  $("map-items-count").textContent=mapProgress.itemIds.length+" / "+window.GameCombat.getItemCapacity(mapProgress.relicIds);
  const track=$("map-track"), available=new Set(availableMapNodeIds()), visited=new Set(mapProgress.path);
  const fragment=document.createDocumentFragment(), ns="http://www.w3.org/2000/svg";
  const svg=document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox","0 0 100 1600"); svg.setAttribute("preserveAspectRatio","none"); svg.setAttribute("aria-hidden","true"); svg.classList.add("map-paths");
  for (const a of mapProgress.map.floors.flat()) for (const id of a.nextIds) {
    const b=mapProgress.map.nodes[id], line=document.createElementNS(ns,"line");
    for (const [key,value] of Object.entries({x1:a.x*100,y1:(16-a.floor)*100+50,x2:b.x*100,y2:(16-b.floor)*100+50})) line.setAttribute(key,String(value));
    line.setAttribute("class",visited.has(a.id)&&visited.has(id)?"is-cleared":a.id===mapProgress.currentNodeId?"is-available":""); svg.append(line);
  }
  fragment.append(svg);
  for (const floor of [...mapProgress.map.floors].reverse()) {
    const row=document.createElement("div"), label=document.createElement("span");
    row.className="map-floor"; label.className="map-floor-label"; label.textContent=floor[0].floor+"階"; row.append(label);
    for (const entry of floor) {
      const node=mapNodes[entry.nodeId], button=document.createElement("button");
      button.type="button"; button.className="map-node"+(available.has(entry.id)?" is-current":"")+(visited.has(entry.id)?" is-cleared":"");
      button.style.left=(entry.x*100)+"%"; button.disabled=!available.has(entry.id);
      button.title=entry.floor+"階："+node.name;
      button.setAttribute("aria-label",button.title+(visited.has(entry.id)?"、通過済み":available.has(entry.id)?"、選択可能":"、選択不可"));
      button.setAttribute("aria-current",entry.id===mapProgress.currentNodeId?"step":"false");
      const icon=document.createElement("span"); icon.className="map-node-icon";
      icon.textContent=({normal_battle:"⚔",elite:"♛",boss:"♛",event:"?",rest:"⌂",shop:"◇"})[node.type]; button.append(icon);
      button.addEventListener("click",()=>{
        if (!availableMapNodeIds().includes(entry.id)) return;
        mapProgress.currentNodeId=entry.id; mapProgress.path.push(entry.id);
        let selected=node;
        if (node.type==="event") {
          const meetings=mapProgress.companionMeetings.sera||0;
          const pool=[...node.eventIds,...mapNodes.node_ash_social_first.eventIds];
          if (!townSupplies.seraApothecaryAvailable) pool.push(meetings===0?"event_ash_sera_first_meeting":meetings===1?"event_ash_companion_return":"event_ash_sera_third_meeting");
          selected={...node,eventIds:pool};
        }
        enterMapNode(selected,entry.floor-1);
      });
      row.append(button);
    }
    fragment.append(row);
  }
  track.replaceChildren(fragment);
  $("map-note").textContent=mapProgress.nodeIndex===0?"1階の光るマスを選んでスタート。16階のボスを目指そう。":(mapProgress.nodeIndex+1)+"階へ進む道を選んでください。";
  if (mapProgress.lastRenderedFloor!==mapProgress.nodeIndex) {
    const next=track.querySelector(".map-node.is-current"), viewport=track.parentElement;
    if (next) viewport.scrollTop=next.parentElement.offsetTop-viewport.clientHeight*0.65;
    mapProgress.lastRenderedFloor=mapProgress.nodeIndex;
  }
}

function renderTownItemShop() {
  const capacity = window.GameCombat.getItemCapacity([]);
  const seraShopOpen = townShopMode === "sera";
  $("town-item-shop-title").textContent = seraShopOpen ? "セラの薬屋" : "道具屋";
  $("town-item-shop-copy").innerHTML = seraShopOpen
    ? isCharacterUnlocked("character_sera")
      ? "セラは冒険者として仲間に加わりました。薬屋では引き続きアイテムを購入できます。<br>所持上限は3個です。"
      : `セラが町で薬屋を始めました。星のかけらで買い物をすると、キャラクター解放に近づきます。<br>解放まであと<strong>${Math.max(0, 10 - townSupplies.seraShopSpend)}個</strong>分の買い物が必要です。`
    : "冒険に持っていくアイテムを購入できます。星のかけらは戦闘勝利報酬で手に入ります。<br>所持上限は3個です。";
  $("town-shop-gold").textContent = townSupplies.starFragments + "個";
  $("town-shop-items").textContent = townSupplies.itemIds.length + " / " + capacity;
  const availableItems = Object.values(window.GameContent.items)
    .filter((item) => townShopMode === "sera" ? item.townCategory === "medicine" : item.townCategory !== "medicine")
    .map((item) => item.id);
  renderItemOffers($("town-item-offers"), townSupplies, capacity, "town", availableItems);
}

function renderSeraTalkTopics() {
  const topics = [
    ["薬屋のこと", "薬草の見分け方なら任せて。旅の途中で覚えた知恵を、今度は町のみんなに返していきたいの。"],
    ["塔への挑戦", "塔は一人で登るには危険すぎる場所よ。だから薬も、道具も、仲間との縁も大切にしてね。"],
    ["これまでの出会い", "何度も会いに来てくれたでしょう。あの出会いがあったから、私もこの町に居場所を作れたの。"],
  ];
  const container = $("sera-talk-topics");
  container.replaceChildren();
  for (const [topic, reply] of topics) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "town-option";
    button.textContent = topic;
    button.addEventListener("click", () => { $("sera-talk-copy").textContent = reply; });
    container.append(button);
  }
}

function renderShop() {
  $("shop-deck-count").textContent = "現在のデッキ：" + mapProgress.deck.length + "枚";
  $("run-shop-gold").textContent = mapProgress.gold + "$";
  renderCardOffers();
  renderRelicOffers();
  renderItemOffers($("shop-item-offers"), mapProgress, window.GameCombat.getItemCapacity(mapProgress.relicIds), "run", currentShopItemIds);
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
    button.disabled = !isCharacterUnlocked(character.id);
    const name = document.createElement("strong");
    name.textContent = character.name;
    const description = document.createElement("small");
    description.textContent = isCharacterUnlocked(character.id)
      ? `HP ${character.maxHp} · ${character.description}`
      : `未解放 · セラと同じランで3回会うと解放`;
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

function renderUpgradeTree() {
  const character = window.GameContent.characters[selectedCharacterId];
  const container = $("upgrade-tree");
  const characterSelect = $("upgrade-character-select");
  $("upgrade-fragments").textContent = townSupplies.starFragments;
  characterSelect.replaceChildren();
  for (const entry of Object.values(window.GameContent.characters).filter((characterEntry) => isCharacterUnlocked(characterEntry.id))) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-character-button" + (entry.id === selectedCharacterId ? " is-selected" : "");
    button.textContent = entry.name;
    button.setAttribute("aria-pressed", String(entry.id === selectedCharacterId));
    button.addEventListener("click", () => {
      selectedCharacterId = entry.id;
      renderUpgradeTree();
    });
    characterSelect.append(button);
  }

  container.replaceChildren();
  const tree = getCharacterTree(character.id);
  tree.forEach((node, index) => {
    const unlocked = isNodeUnlocked(character.id, node.id);
    const requirementsMet = (node.requires || []).every((id) => isNodeUnlocked(character.id, id));
    const reward = node.rewardType === "card"
      ? character.cards[node.rewardId]
      : window.GameContent.relics[node.rewardId];
    const card = document.createElement("article");
    card.className = "upgrade-node" + (unlocked ? " is-unlocked" : "") + (!requirementsMet ? " is-locked" : "");
    if (index > 0) {
      const connector = document.createElement("span");
      connector.className = "upgrade-connector";
      connector.setAttribute("aria-hidden", "true");
      card.append(connector);
    }
    const badge = document.createElement("span");
    badge.className = "upgrade-node-badge";
    badge.textContent = unlocked ? "✓" : node.rewardType === "card" ? "✧" : "✦";
    const heading = document.createElement("h2");
    heading.textContent = node.name;
    const rewardName = document.createElement("strong");
    rewardName.textContent = (node.rewardType === "card" ? "カード：" : "レリック：") + (reward?.name || node.rewardId);
    const description = document.createElement("p");
    description.textContent = node.rewardType === "card" ? reward.description : reward.description;
    const action = document.createElement("button");
    action.type = "button";
    action.className = "primary-button upgrade-unlock-button";
    action.disabled = unlocked || !requirementsMet || townSupplies.starFragments < node.cost;
    action.textContent = unlocked ? "解放済み" : requirementsMet ? `${node.cost}個で解放` : "前のノードが必要";
    action.addEventListener("click", () => unlockUpgradeNode(character.id, node));
    const costNote = document.createElement("small");
    costNote.textContent = unlocked ? "永久解放" : `必要な星のかけら：${node.cost}個`;
    card.append(badge, heading, rewardName, description, action, costNote);
    container.append(card);
  });
}

function unlockUpgradeNode(characterId, node) {
  if (isNodeUnlocked(characterId, node.id)
    || !(node.requires || []).every((id) => isNodeUnlocked(characterId, id))
    || townSupplies.starFragments < node.cost) return;
  townSupplies.starFragments -= node.cost;
  unlockedNodes[characterId] = [...(unlockedNodes[characterId] || []), node.id];
  saveTownProfile();
  renderUpgradeTree();
}

function pickRewardCards(characterId, count = 3, elite = false) {
  const pool = Object.values(window.GameContent.characters[characterId].cards)
    .filter((card) => Number.isFinite(card.rewardWeight) && card.rewardWeight > 0 && isCardUnlocked(characterId, card.id));
  const picks = [];
  while (pool.length && picks.length < count) {
    const weightFor = (card) => card.rewardWeight * (elite ? 1 + card.rarity * card.rarity * 2 : 1);
    const totalWeight = pool.reduce((total, card) => total + weightFor(card), 0);
    let roll = Math.random() * totalWeight;
    const chosenIndex = pool.findIndex((card) => (roll -= weightFor(card)) < 0);
    const card = pool.splice(chosenIndex < 0 ? pool.length - 1 : chosenIndex, 1)[0];
    picks.push({ ...card, rewardUpgraded: elite && Boolean(card.upgrade) && Math.random() < 0.25 });
  }
  return picks;
}

function createBattleRewards() {
  const elite = currentMapNode()?.type === "elite" || Boolean(mapProgress.pendingEliteReward);
  const itemDrops = Object.keys(window.GameContent.items);
  const itemId = Math.random() < 0.25 && itemDrops.length
    ? itemDrops[Math.floor(Math.random() * itemDrops.length)]
    : null;
  const relicCandidates = elite
    ? Object.values(window.GameContent.relics).filter((relic) => relic.acquisition?.includes("elite") && isRelicUnlocked(relic.id, mapProgress.characterId) && (!relic.characterId || relic.characterId === mapProgress.characterId) && !mapProgress.relicIds.includes(relic.id))
    : [];
  const relicId = relicCandidates.length ? relicCandidates[Math.floor(Math.random() * relicCandidates.length)].id : null;
  return {
    elite,
    gold: 20 + mapProgress.relicIds.reduce((bonus, relicId) => bonus + (window.GameContent.relics[relicId]?.battleGoldBonus || 0), 0),
    goldClaimed: false,
    starFragments: 1,
    starFragmentsClaimed: false,
    itemId,
    itemClaimed: !itemId,
    relicId,
    relicClaimed: !elite,
    relicFallbackGold: elite && !relicId ? 50 : 0,
    cards: pickRewardCards(mapProgress.characterId, 3, elite),
    cardClaimed: false,
    cardResolved: false,
  };
}

function renderRewards() {
  $("reward-gold-copy").textContent = `ランの所持金に${pendingRewards.gold}$加わります（現在 ${mapProgress.gold}$）。`;
  $("claim-gold").disabled = pendingRewards.goldClaimed;
  $("claim-gold").textContent = pendingRewards.goldClaimed ? "受け取り済み" : `${pendingRewards.gold}$を受け取る`;
  $("claim-town-token").disabled = pendingRewards.starFragmentsClaimed;
  $("claim-town-token").textContent = pendingRewards.starFragmentsClaimed ? "受け取り済み" : "受け取る";
  $("reward-town-token-copy").textContent = `町で使える星のかけらを${pendingRewards.starFragments}個獲得します。町の道具屋でアイテムを購入できます。`;
  $("reward-relic-area").hidden = !pendingRewards.elite;
  if (pendingRewards.elite) {
    const relic = pendingRewards.relicId ? window.GameContent.relics[pendingRewards.relicId] : null;
    $("reward-relic-copy").textContent = relic
      ? `${relic.name}：${relic.description}`
      : `未所持のレリックがありません。代わりにラン内ゴールド${pendingRewards.relicFallbackGold}$を受け取ります。`;
    $("claim-relic").disabled = pendingRewards.relicClaimed;
    $("claim-relic").textContent = pendingRewards.relicClaimed ? "受け取り済み" : "受け取る";
  }
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
      : pendingRewards.elite
        ? "高レアリティ寄りの3候補から1枚を選びます。強化済みカードが含まれることもあります。"
        : "3枚の候補から1枚を選びます。";
  $("continue-after-rewards").disabled = !(pendingRewards.goldClaimed && pendingRewards.starFragmentsClaimed && pendingRewards.itemClaimed && pendingRewards.cardResolved && pendingRewards.relicClaimed);
}

function chooseRewardCard(cardId) {
  if (pendingRewards.cardClaimed || !pendingRewards.cards.some((card) => card.id === cardId)) return;
  const card = pendingRewards.cards.find((candidate) => candidate.id === cardId);
  mapProgress.deck.push(cardId + (card.rewardUpgraded ? "::upgraded" : ""));
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
    title.textContent = card.name + (card.rewardUpgraded ? "＋" : "");
    const description = document.createElement("span");
    description.textContent = card.rewardUpgraded ? card.upgrade.description : card.description;
    const cost = document.createElement("small");
    cost.textContent = `コスト ${card.cost} · レア度 ${card.rarity}${card.rewardUpgraded ? " · 強化済み" : ""} · ${{ attack: "攻撃", skill: "スキル", persistent: "永続" }[card.type] || card.type}`;
    button.append(title, description, cost);
    button.addEventListener("click", () => chooseRewardCard(card.id));
    container.append(button);
  }
}

function renderItemOffers(container, owner, capacity, scope, itemIds = null) {
  container.replaceChildren();
  const offers = itemIds ? itemIds.map((id) => window.GameContent.items[id]).filter(Boolean) : Object.values(window.GameContent.items);
  for (const item of offers) {
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
    const price = scope === "town" ? (item.townPrice ?? 1) : item.price;
    buy.textContent = scope === "town" ? price + "個の星のかけらで購入" : item.price + "$で購入";
    buy.dataset.shopKind = "item";
    buy.dataset.shopId = item.id;
    buy.dataset.shopScope = scope;
    buy.disabled = (scope === "town" ? owner.starFragments < price : owner.gold < item.price) || owner.itemIds.length >= capacity;
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
    const card = cardDefinitions[cardId.replace("::upgraded", "")];
    const button = document.createElement("button");
    button.className = "secondary-button shop-remove-card";
    const title = document.createElement("strong");
    title.textContent = card.name + (cardId.endsWith("::upgraded") ? "＋" : "") + "を削除（" + mapProgress.deck.filter((id) => id === cardId).length + "枚所持）";
    const description = document.createElement("span");
    description.textContent = cardId.endsWith("::upgraded") ? card.upgrade.description : card.description;
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
    currentShopCardPrices = mapProgress.characterId === "character_nightborn" ? vampireCardPrices : mapProgress.characterId === "character_sera" ? seraCardPrices : cardPrices;
    cardDefinitions = window.GameContent.characters[mapProgress.characterId].cards;
    currentShopCardIds = pickShopOffers(Object.keys(currentShopCardPrices).filter((id) => isCardUnlocked(mapProgress.characterId, id)), 5);
    currentShopRelicIds = pickShopOffers(Object.keys(relicPrices).filter((id) => isRelicUnlocked(id, mapProgress.characterId) && (!window.GameContent.relics[id].characterId || window.GameContent.relics[id].characterId === mapProgress.characterId)), 3);
    currentShopItemIds = pickShopOffers(Object.keys(window.GameContent.items), 3);
    renderShop();
    showScreen("shop-screen");
    return;
  }

  if (node.type === "rest" && node.implemented) {
    cardDefinitions = window.GameContent.characters[mapProgress.characterId].cards;
    renderRestSite();
    showScreen("rest-screen");
    return;
  }

  if (node.type === "event" && node.implemented) {
    const eventIds = node.eventIds || [];
    const eventId = eventIds[Math.floor(Math.random() * eventIds.length)];
    activeEvent = window.GameContent.events[eventId];
    selectedEventChoice = null;
    selectedEventCardIndex = null;
    renderEventScreen();
    showScreen("event-screen");
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

  if (["normal_battle", "elite", "boss"].includes(node.type) && node.implemented) {
    cardDefinitions = window.GameContent.characters[mapProgress.characterId].cards;
    state = createRun(node.enemyIds, Math.random, mapProgress.relicIds || [], mapProgress.deck, mapProgress.itemIds, mapProgress.gold, mapProgress.characterId, mapProgress.hp);
    pendingTargetCardIndex = null;
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

function renderRestSite() {
  const maxHp = window.GameContent.characters[mapProgress.characterId].maxHp;
  const healAmount = Math.ceil(maxHp * 0.3);
  const healed = Math.min(healAmount, maxHp - mapProgress.hp);
  $("rest-heal-copy").textContent = healed > 0
    ? `HPを${healed}回復します（現在 ${mapProgress.hp} / ${maxHp}）。`
    : `HPは最大です（${mapProgress.hp} / ${maxHp}）。`;
  $("rest-heal").disabled = healed <= 0;
  const options = $("rest-upgrade-options");
  options.replaceChildren();
  const cards = window.GameContent.characters[mapProgress.characterId].cards;
  let availableCount = 0;
  mapProgress.deck.forEach((cardRef, index) => {
    if (cardRef.endsWith("::upgraded")) return;
    const card = cards[cardRef];
    if (!card?.upgrade) return;
    availableCount += 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button rest-upgrade-card";
    button.dataset.cardIndex = String(index);
    const title = document.createElement("strong");
    title.textContent = card.name + "を強化";
    const description = document.createElement("span");
    description.textContent = card.upgrade.description;
    button.append(title, description);
    options.append(button);
  });
  if (availableCount === 0) {
    const note = document.createElement("p");
    note.textContent = "強化できるカードがありません。";
    options.append(note);
  }
}

function completeRest(choice) {
  if (choice === "heal") {
    const maxHp = window.GameContent.characters[mapProgress.characterId].maxHp;
    mapProgress.hp = Math.min(maxHp, mapProgress.hp + Math.ceil(maxHp * 0.3));
  }
  mapProgress.nodeIndex += 1;
  showScreen("map-screen");
}

function enemyIntentIcon(type) {
  return ({ attack: "⚔", defend: "🛡", strengthen: "↗", weaken: "◌" })[type] || "?";
}

function selectEnemyTarget(index) {
  if (!state || state.phase !== "player" || state.outcome !== "ongoing" || state.enemies[index]?.hp <= 0) return;
  state.selectedTargetIndex = index;
  if (pendingTargetCardIndex !== null) {
    const handIndex = pendingTargetCardIndex;
    pendingTargetCardIndex = null;
    playCardAndAnimate(handIndex);
    return;
  }
  render();
}

function syncRunProgressFromCombat() {
  if (!state || !mapProgress) return;
  mapProgress.itemIds = [...state.itemIds];
  mapProgress.gold = state.gold;
  mapProgress.hp = state.player.hp;
}

function useCombatItem(inventoryIndex, returnToItemsMenu = false) {
  if (!state) return false;
  const previousEnemyHp = state.enemies.map((enemy) => enemy.hp);
  const used = window.GameCombat.useItem(state, inventoryIndex);
  if (used) {
    syncRunProgressFromCombat();
    state.enemies.forEach((enemy, index) => {
      if (enemy.hp < previousEnemyHp[index]) playEnemyHit(index);
    });
  }
  if (state.outcome !== "ongoing" && ui.menuDialog.open) ui.menuDialog.close();
  render();
  if (returnToItemsMenu && state.outcome === "ongoing") showMenuView("items");
  return used;
}

function playCardAndAnimate(handIndex) {
  const previousHp = state.enemies.map((enemy) => enemy.hp);
  playCard(state, handIndex);
  state.enemies.forEach((enemy, index) => {
    if (enemy.hp < previousHp[index]) playEnemyHit(index);
  });
  render();
}

function getCombatCardDescription(card, cardIndex) {
  const modifier = state.handModifiers[cardIndex] || {};
  if (card.tags?.includes("strike")) {
    const base = card.effects.filter((effect) => effect.type === "damage").reduce((sum, effect) => sum + effect.amount, 0);
    const amount = (modifier.strikeDamage ?? base) * (state.doubledCardTags.includes("strike") ? 2 : 1);
    return card.description.replace(/\d+(?=ダメージ)/, String(amount));
  }
  if (card.tags?.includes("defense")) {
    const base = card.effects.filter((effect) => effect.type === "block").reduce((sum, effect) => sum + effect.amount, 0);
    const amount = (modifier.defenseBlock ?? base) * (state.doubledCardTags.includes("defense") ? 2 : 1);
    return card.description.replace(/\d+(?=ブロック)/, String(amount));
  }
  return card.description;
}

function renderEnemyField() {
  const container = $("enemy-field");
  container.dataset.enemyCount = String(state.enemies.length);
  container.replaceChildren();
  state.enemies.forEach((enemy, index) => {
    const definition = state.enemyDefinitions[index];
    const action = definition.actions[enemy.actionIndex];
    const defeated = enemy.hp <= 0;
    const article = document.createElement("article");
    article.className = "enemy-unit" + (state.selectedTargetIndex === index ? " is-selected" : "") + (defeated ? " is-defeated" : "");
    article.tabIndex = defeated ? -1 : 0;
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `${enemy.name}、HP ${enemy.hp}/${enemy.maxHp}。次の行動：${action.description}`);
    article.addEventListener("click", () => selectEnemyTarget(index));
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectEnemyTarget(index);
      }
    });

    const intent = document.createElement("div");
    intent.className = "enemy-intent";
    intent.textContent = enemyIntentIcon(action.type) + (["attack", "defend", "strengthen"].includes(action.type) && action.amount ? action.amount : "");
    intent.title = action.description;
    const art = document.createElement("div");
    art.className = "enemy-art" + (definition.rank === "elite" ? " elite-enemy-art" : definition.id === "enemy_ashling" ? " ashling-art" : "");
    art.dataset.enemyIndex = String(index);
    art.setAttribute("aria-hidden", "true");
    art.innerHTML = "<div class=\"enemy-halo\"></div><div class=\"enemy-shadow\"></div><div class=\"enemy-cloak\"></div><div class=\"enemy-body\"></div><div class=\"enemy-head\"></div><div class=\"enemy-hood\"></div><div class=\"enemy-eye eye-left\"></div><div class=\"enemy-eye eye-right\"></div><div class=\"enemy-blade\"></div>";

    const info = document.createElement("div");
    info.className = "enemy-info";
    const nameRow = document.createElement("div");
    nameRow.className = "entity-name";
    const rank = document.createElement("span");
    rank.className = "entity-type";
    rank.textContent = definition.rank === "elite" ? "強敵" : "通常敵";
    const name = document.createElement("h2");
    name.textContent = enemy.name;
    nameRow.append(rank, name);
    const healthRow = document.createElement("div");
    healthRow.className = "health-row";
    const label = document.createElement("span");
    label.className = "health-label";
    label.textContent = "HP";
    const track = document.createElement("div");
    track.className = "health-track";
    const fill = document.createElement("div");
    fill.className = "health-fill enemy-health";
    fill.style.width = `${Math.max(0, enemy.hp / enemy.maxHp) * 100}%`;
    track.append(fill);
    const hp = document.createElement("span");
    hp.className = "health-value";
    hp.textContent = `${enemy.hp} / ${enemy.maxHp}`;
    healthRow.append(label, track, hp);
    const status = document.createElement("div");
    status.className = "enemy-status";
    status.textContent = defeated ? "撃破" : `${action.description}${enemy.block ? ` · 🛡${enemy.block}` : ""}${enemy.strength ? ` · 筋力+${enemy.strength}` : ""}`;
    info.append(nameRow, healthRow, status);
    article.append(intent, art, info);
    container.append(article);
  });
}

function renderCombatItems() {
  const container = $("combat-items");
  container.replaceChildren();
  container.hidden = state.itemIds.length === 0;
  state.itemIds.forEach((itemId, index) => {
    const item = window.GameContent.items[itemId];
    if (!item) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "combat-item-button";
    button.dataset.itemIndex = String(index);
    button.disabled = state.phase !== "player" || state.outcome !== "ongoing";
    button.title = item.description;
    const name = document.createElement("strong");
    name.textContent = item.name;
    const description = document.createElement("span");
    description.textContent = item.description;
    button.append(name, description);
    container.append(button);
  });
}

function renderEventScreen() {
  $("event-title").textContent = activeEvent.name;
  $("event-intro").textContent = activeEvent.description;
  const choices = $("event-choices");
  choices.replaceChildren();
  const aftermath = $("event-aftermath");
  aftermath.hidden = !selectedEventChoice;
  const cardOptions = $("event-card-options");
  cardOptions.replaceChildren();
  if (selectedEventChoice) {
    choices.hidden = true;
    $("event-aftermath-copy").textContent = selectedEventChoice.aftermath;
    $("event-result-copy").textContent = "結果：" + selectedEventChoice.result;
    const needsCard = selectedEventChoice.effects?.some((effect) => effect.type === "removeSelectedCard");
    cardOptions.hidden = !needsCard;
    if (needsCard) {
      const cards = window.GameContent.characters[mapProgress.characterId].cards;
      mapProgress.deck.forEach((cardRef, index) => {
        const cardId = cardRef.replace("::upgraded", "");
        const card = cards[cardId];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "secondary-button event-card-button";
        button.dataset.eventCardIndex = String(index);
        button.setAttribute("aria-pressed", String(selectedEventCardIndex === index));
        button.classList.toggle("is-selected", selectedEventCardIndex === index);
        button.textContent = (card?.name || cardId) + (cardRef.endsWith("::upgraded") ? "＋" : "") + " を渡す";
        cardOptions.append(button);
      });
    }
    $("event-finish").disabled = Boolean(selectedEventChoice.effects?.some((effect) => effect.type === "removeSelectedCard")) && selectedEventCardIndex === null;
    return;
  }

  choices.hidden = false;
  for (const choice of activeEvent.choices) {
    const available = (choice.requirements || []).every((requirement) => {
      if (requirement.type === "minGold") return mapProgress.gold >= requirement.value;
      if (requirement.type === "minHp") return mapProgress.hp >= requirement.value;
      if (requirement.type === "notOwnedRelic") return !mapProgress.relicIds.includes(requirement.relicId);
      if (requirement.type === "minDeckCards") return mapProgress.deck.length >= requirement.value;
      if (requirement.type === "minCompanionMeetings") return (mapProgress.companionMeetings?.[requirement.companionId] || 0) >= requirement.value;
      if (requirement.type === "notUnlockedCharacter") return !isCharacterUnlocked(requirement.characterId);
      return false;
    });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-choice";
    button.disabled = !available;
    button.dataset.choiceId = choice.id;
    const label = document.createElement("strong");
    label.textContent = choice.label;
    const result = document.createElement("span");
    result.textContent = available ? choice.result : choice.unavailable || choice.result;
    button.append(label, result);
    choices.append(button);
  }
}

function applyEventEffects(choice) {
  const characterCards = window.GameContent.characters[mapProgress.characterId].cards;
  for (const effect of choice.effects || []) {
    if (effect.type === "gold") {
      mapProgress.gold = Math.max(0, mapProgress.gold + effect.amount);
    } else if (effect.type === "heal") {
      const maxHp = window.GameContent.characters[mapProgress.characterId].maxHp;
      mapProgress.hp = Math.min(maxHp, mapProgress.hp + effect.amount);
    } else if (effect.type === "damage") {
      mapProgress.hp = Math.max(1, mapProgress.hp - effect.amount);
    } else if (effect.type === "relic" && !mapProgress.relicIds.includes(effect.relicId)) {
      mapProgress.relicIds.push(effect.relicId);
    } else if (effect.type === "card") {
      const cardId = effect.cardIds[mapProgress.characterId];
      if (characterCards[cardId]) mapProgress.deck.push(cardId);
    } else if (effect.type === "removeSelectedCard" && Number.isInteger(selectedEventCardIndex)) {
      mapProgress.deck.splice(selectedEventCardIndex, 1);
    } else if (effect.type === "companionMeeting") {
      mapProgress.companionMeetings ||= {};
      mapProgress.companionMeetings[effect.companionId] = (mapProgress.companionMeetings[effect.companionId] || 0) + 1;
      if (effect.companionId === "sera" && mapProgress.companionMeetings.sera >= 3) {
        townSupplies.seraApothecaryAvailable = true;
        saveTownProfile();
      }
    } else if (effect.type === "unlockCharacter" && window.GameContent.characters[effect.characterId]) {
      unlockedCharacterIds.add(effect.characterId);
      saveTownProfile();
    }
  }
}

function finishEvent() {
  if (!activeEvent || !selectedEventChoice) return;
  if (selectedEventChoice.effects?.some((effect) => effect.type === "removeSelectedCard") && selectedEventCardIndex === null) return;
  const eliteBattle = selectedEventChoice.effects?.find((effect) => effect.type === "eliteBattle");
  applyEventEffects(selectedEventChoice);
  activeEvent = null;
  selectedEventChoice = null;
  selectedEventCardIndex = null;
  if (eliteBattle) {
    mapProgress.pendingEliteReward = true;
    cardDefinitions = window.GameContent.characters[mapProgress.characterId].cards;
    state = createRun([eliteBattle.enemyId], Math.random, mapProgress.relicIds || [], mapProgress.deck, mapProgress.itemIds, mapProgress.gold, mapProgress.characterId, mapProgress.hp);
    pendingTargetCardIndex = null;
    showScreen("combat-screen");
    return;
  }
  mapProgress.nodeIndex += 1;
  showScreen("map-screen");
}

function render() {
  const player = state.player;
  renderEnemyField();
  renderCombatItems();
  ui.hand.replaceChildren(...state.hand.map((id, index) => makeCard(window.GameCombat.getCardDefinition(state.character, id), index)));
  $("player-name").textContent = state.character.name;
  const batCounter = $("bat-count");
  batCounter.hidden = state.bats.length === 0;
  batCounter.textContent = "🦇 " + state.bats.length;
  const persistentCards = $("persistent-cards");
  persistentCards.hidden = state.powers.length === 0;
  persistentCards.textContent = "永続：" + state.powers.map((id) => window.GameCombat.getCardDefinition(state.character, id).name).join("・");
  ui.playerHp.textContent = `${player.hp} / ${player.maxHp}`;
  ui.playerHealth.style.width = `${(player.hp / player.maxHp) * 100}%`;
  const strengthStatus = $("player-strength");
  strengthStatus.hidden = player.strength <= 0;
  strengthStatus.textContent = player.strength > 0 ? `⚔ 筋力 +${player.strength}` : "";
  strengthStatus.title = player.expiringStrength > 0
    ? `一時筋力 ${player.expiringStrength}。自分のターン開始時に1減少します。`
    : "筋力によって攻撃ダメージが増加しています。";
  ui.energy.textContent = state.energy;
  ui.draw.textContent = state.drawPile.length;
  ui.discard.textContent = state.discardPile.length;
  ui.block.textContent = player.block;
  ui.log.textContent = state.log;
  $("hand-hint").textContent = pendingTargetCardIndex !== null
    ? "対象の敵をクリックしてください"
    : state.enemies.filter((enemy) => enemy.hp > 0).length > 1 && state.selectedTargetIndex === null
      ? "単体攻撃は敵を選んで使用"
      : "カードを選んで使用";
  $("player-status-note").textContent = player.weakTurns > 0 ? "弱体：攻撃ダメージ−25%" : "次の一撃を待つ";
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
  $("menu-gold-count").textContent = state || mapProgress ? (state?.gold ?? mapProgress?.gold) + "$" : townSupplies.starFragments + "個";
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
      .sort((a, b) => (cardDefinitions[a[0].replace("::upgraded", "")]?.name || a[0]).localeCompare(cardDefinitions[b[0].replace("::upgraded", "")]?.name || b[0], "ja"))
      .forEach(([id, count]) => {
        const isUpgraded = id.endsWith("::upgraded");
        const card = cardDefinitions[id.replace("::upgraded", "")];
        const item = document.createElement("li");
        const name = document.createElement("strong");
        name.textContent = (card?.name || id) + (isUpgraded ? "＋" : "") + " × " + count;
        const description = document.createElement("small");
        description.textContent = isUpgraded ? card?.upgrade?.description || "" : card?.description || "";
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
            useCombatItem(index, true);
          });
          article.append(useButton);
        }
        content.append(article);
      });
    }
  } else if (view === "suspend") {
    title.textContent = "中断する";
    addParagraph("現在の状態をこのブラウザに保存してタイトルへ戻ります。");
    const suspend = document.createElement("button");
    suspend.className = "primary-button";
    suspend.textContent = "保存して中断する";
    suspend.addEventListener("click", () => {
      if (!persistGame()) return;
      suspended = JSON.parse(JSON.stringify(adventureSnapshot()));
      ui.menuDialog.close();
      state = null;
      mapProgress = null;
      showScreen("title-screen");
      updateContinueButton();
    });
    content.append(suspend);
  } else if (view === "abandon") {
    title.textContent = "冒険をあきらめる";
    addParagraph("進行中の冒険を終了して町へ戻ります。よろしいですか？");
  }
}

function abandonRun() {
  ui.menuDialog.close();
  finishRun();
  showScreen("town-screen");
}

function finishRun() {
  suspended = null;
  if (loadedSave) loadedSave.adventure = null;
  state = null;
  mapProgress = null;
  pendingRewards = null;
  activeEvent = null;
  selectedEventChoice = null;
}

function showRunClear() {
  if (!mapProgress) return;
  const character = window.GameContent.characters[mapProgress.characterId];
  $("clear-character").textContent = character?.name || mapProgress.characterId;
  $("clear-hp").textContent = `${Math.max(0, mapProgress.hp)} / ${character?.maxHp ?? "?"}`;
  $("clear-relic-count").textContent = String(mapProgress.relicIds.length);
  $("clear-deck-count").textContent = String(mapProgress.deck.length);
  finishRun();
  showScreen("clear-screen");
}

function playEnemyHit(index) {
  const art = document.querySelector(`.enemy-art[data-enemy-index="${index}"]`);
  if (!art) return;
  art.classList.remove("is-hit");
  void art.offsetWidth;
  art.classList.add("is-hit");
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
  const name = document.createElement("strong"); name.className = "card-name"; name.textContent = card.name + (card.upgraded ? "＋" : "");
  const description = document.createElement("span"); description.className = "card-description"; description.textContent = getCombatCardDescription(card, index);
  const footer = document.createElement("span"); footer.className = "card-footer"; footer.textContent = state.character.name;
  top.append(type, cost); button.append(top, art, name, description, footer);
  button.addEventListener("click", () => {
    if (card.target === "enemy" && state.enemies.filter((enemy) => enemy.hp > 0).length > 1 && state.selectedTargetIndex === null) {
      pendingTargetCardIndex = index;
      render();
      return;
    }
    playCardAndAnimate(index);
  });
  return button;
}

function showOutcome() {
  const won = state.outcome === "victory";
  const finalBossVictory = won && currentMapNode()?.type === "boss";
  const eliteVictory = won && (currentMapNode()?.type === "elite" || mapProgress?.pendingEliteReward);
  $("dialog-mark").textContent = won ? "✦" : "…";
  $("dialog-eyebrow").textContent = finalBossVictory ? "FINAL BOSS DEFEATED" : eliteVictory ? "ELITE DEFEATED" : won ? "ENCOUNTER CLEAR" : "RUN ENDED";
  $("dialog-title").textContent = finalBossVictory ? "灰燼の王を退けた" : eliteVictory ? "強敵を退けた" : won ? "敵を退けた" : "旅はここで終わる";
  $("dialog-copy").textContent = won
    ? finalBossVictory
      ? "灰燼の王を倒した。冒険の記録を確認しよう。"
      : "この地点の戦闘に勝利した。報酬を選んで受け取ろう。"
    : "敵に敗れた。手札の使い方を変えて、もう一度挑もう。";
  $("dialog-action").textContent = finalBossVictory ? "冒険の記録を見る" : won ? "報酬を確認する" : "町へ戻る";
  ui.message.showModal();
}

ui.endTurn.addEventListener("click", () => { pendingTargetCardIndex = null; endTurn(state); render(); });
$("combat-items").addEventListener("click", (event) => {
  const button = event.target.closest("[data-item-index]");
  if (!button || button.disabled || !state) return;
  useCombatItem(Number(button.dataset.itemIndex));
});
$("enemy-field").addEventListener("animationend", (event) => {
  if (event.animationName === "hit") event.target.classList.remove("is-hit");
});
$("dialog-action").addEventListener("click", () => {
  const victory = state?.outcome === "victory";
  const finalBossVictory = victory && currentMapNode()?.type === "boss";
  if (mapProgress && state) {
    mapProgress.itemIds = [...state.itemIds];
    mapProgress.gold = state.gold;
    mapProgress.hp = state.player.hp;
  }
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
    showRunClear();
  } else {
    finishRun();
    showScreen("town-screen");
  }
});
$("clear-return-town").addEventListener("click", () => showScreen("town-screen"));
$("start-game").addEventListener("click", () => showScreen("town-screen"));
$("town-adventure").addEventListener("click", () => showScreen("adventure-screen"));
$("town-upgrade").addEventListener("click", () => showScreen("upgrade-screen"));
$("town-social").addEventListener("click", () => showScreen("social-screen"));
$("town-museum").addEventListener("click", () => showScreen("museum-screen"));
$("museum-back").addEventListener("click", () => {
  if (museumStage === "entries") {
    museumCategory = null;
    museumStage = "category";
  } else {
    museumScope = null;
    museumStage = "scope";
  }
  renderMuseum();
});
for (const button of document.querySelectorAll("[data-go]")) {
  button.addEventListener("click", () => showScreen(button.dataset.go));
}
$("claim-gold").addEventListener("click", () => {
  if (!pendingRewards || pendingRewards.goldClaimed) return;
  mapProgress.gold += pendingRewards.gold;
  pendingRewards.goldClaimed = true;
  renderRewards();
});
$("claim-town-token").addEventListener("click", () => {
  if (!pendingRewards || pendingRewards.starFragmentsClaimed) return;
  townSupplies.starFragments += pendingRewards.starFragments;
  pendingRewards.starFragmentsClaimed = true;
  saveTownProfile();
  renderRewards();
});
$("claim-relic").addEventListener("click", () => {
  if (!pendingRewards?.elite || pendingRewards.relicClaimed) return;
  if (pendingRewards.relicId) {
    if (!mapProgress.relicIds.includes(pendingRewards.relicId)) mapProgress.relicIds.push(pendingRewards.relicId);
  } else {
    mapProgress.gold += pendingRewards.relicFallbackGold;
  }
  pendingRewards.relicClaimed = true;
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
  if (!pendingRewards || !pendingRewards.goldClaimed || !pendingRewards.starFragmentsClaimed || !pendingRewards.itemClaimed || !pendingRewards.cardResolved || !pendingRewards.relicClaimed) return;
  mapProgress.nodeIndex += 1;
  mapProgress.pendingEliteReward = false;
  pendingRewards = null;
  showScreen("map-screen");
});
$("rest-heal").addEventListener("click", () => {
  if (!mapProgress || $("rest-heal").disabled) return;
  completeRest("heal");
});
$("rest-upgrade-options").addEventListener("click", (event) => {
  const button = event.target.closest("[data-card-index]");
  if (!button || !mapProgress) return;
  const index = Number(button.dataset.cardIndex);
  const cardRef = mapProgress.deck[index];
  const card = window.GameContent.characters[mapProgress.characterId].cards[cardRef];
  if (!card?.upgrade) return;
  mapProgress.deck[index] = cardRef + "::upgraded";
  completeRest("upgrade");
});
$("event-choices").addEventListener("click", (event) => {
  const button = event.target.closest("[data-choice-id]");
  if (!button || button.disabled || !activeEvent) return;
  selectedEventChoice = activeEvent.choices.find((choice) => choice.id === button.dataset.choiceId) || null;
  selectedEventCardIndex = null;
  if (selectedEventChoice) renderEventScreen();
});
$("event-card-options").addEventListener("click", (event) => {
  const button = event.target.closest("[data-event-card-index]");
  if (!button || !selectedEventChoice) return;
  selectedEventCardIndex = Number(button.dataset.eventCardIndex);
  renderEventScreen();
});
$("event-finish").addEventListener("click", finishEvent);
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
  suspended = null;
  if (loadedSave) loadedSave.adventure = null;
  state = null;
  mapProgress = {
    stageId: mapStage.id,
    map: window.GameContent.generateDungeonMap(),
    currentNodeId: null,
    path: [],
    nodeIndex: 0,
    relicIds: [],
    companionMeetings: {},
    itemIds: [...townSupplies.itemIds],
    gold: 100,
    hp: window.GameContent.characters[selectedCharacterId].maxHp,
    characterId: selectedCharacterId,
    deck: [...window.GameContent.characters[selectedCharacterId].startingDeck],
  };
  townSupplies.itemIds = [];
  saveTownProfile();
  showScreen("map-screen");
});
$("town-item-shop").addEventListener("click", () => { townShopMode = "general"; showScreen("town-item-shop-screen"); });
$("social-sera-shop").addEventListener("click", () => {
  if (!townSupplies.seraApothecaryAvailable) return;
  townShopMode = "sera";
  showScreen("town-item-shop-screen");
});
$("social-sera-talk").addEventListener("click", () => {
  if (townSupplies.seraApothecaryAvailable) showScreen("sera-talk-screen");
});
$("shop-skip").addEventListener("click", leaveShop);
$("town-item-offers").addEventListener("click", (event) => {
  const button = event.target.closest("[data-shop-kind='item']");
  if (button) {
    const item = window.GameContent.items[button.dataset.shopId];
    const price = item?.townPrice ?? 1;
    if (townSupplies.starFragments >= price && window.GameCombat.addItemToInventory(townSupplies.itemIds, button.dataset.shopId, window.GameCombat.getItemCapacity([]))) {
      townSupplies.starFragments -= price;
      if (townShopMode === "sera" && townSupplies.seraApothecaryAvailable && !isCharacterUnlocked("character_sera")) {
        townSupplies.seraShopSpend = Math.min(10, townSupplies.seraShopSpend + price);
        if (townSupplies.seraShopSpend >= 10) unlockedCharacterIds.add("character_sera");
      }
      saveTownProfile();
      renderTownItemShop();
    }
  }
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
    finishRun();
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
let suspended = loadedSave?.adventure || null;
function adventureSnapshot() {
  if (!mapProgress) return suspended;
  return {
    screenId: ui.screens.find(screen => screen.classList.contains("is-active"))?.id,
    mapProgress, combat: window.GameSave.packCombat(state), pendingRewards,
    eventId: activeEvent?.id || null, choiceId: selectedEventChoice?.id || null,
    selectedEventCardIndex, pendingTargetCardIndex,
    currentShopCardIds, currentShopRelicIds, currentShopItemIds,
  };
}
function persistGame() {
  if (storageBlocked) return false;
  try {
    localStorage.setItem(window.GameSave.key, JSON.stringify({
      saveVersion: window.GameSave.saveVersion,
      profile: { ...townSupplies, unlockedNodes, unlockedCharacterIds: [...unlockedCharacterIds] },
      adventure: adventureSnapshot(),
    }));
    return true;
  } catch (error) {
    storageError("保存できませんでした。このタブを閉じると直前の進行が失われる可能性があります。ブラウザの保存設定や空き容量を確認してください。");
    return false;
  }
}
function updateContinueButton() {
  $("continue-game").hidden = !(suspended || loadedSave?.adventure);
}
$("continue-game").addEventListener("click", () => {
  const saved = suspended || loadedSave?.adventure;
  if (!saved) return;
  try {
    const progress = saved.mapProgress;
    const character = window.GameContent.characters[progress?.characterId];
    const screens = ["map-screen", "combat-screen", "shop-screen", "rest-screen", "event-screen", "rewards-screen", "card-reward-screen"];
    if (!character || !screens.includes(saved.screenId) || !progress.map?.nodes || !Array.isArray(progress.map.floors) ||
        !Array.isArray(progress.deck) || progress.deck.some(id => typeof id !== "string" || !character.cards[id.replace(/::upgraded$/, "")]) ||
        Object.values(progress.map.nodes).some(node => !mapNodes[node.nodeId]) ||
        (progress.currentNodeId && !progress.map.nodes[progress.currentNodeId])) throw new Error("冒険データまたは対応するコンテンツが不正です。");
    const combat = window.GameSave.restoreCombat(saved.combat, window.GameContent);
    if (saved.screenId === "combat-screen" && !combat) throw new Error("戦闘データがありません。");
    const event = saved.eventId ? window.GameContent.events[saved.eventId] : null;
    if (saved.screenId === "event-screen" && !event) throw new Error("イベントが見つかりません。");
    if (["rewards-screen", "card-reward-screen"].includes(saved.screenId) && !saved.pendingRewards) throw new Error("報酬データがありません。");
    mapProgress = progress;
    selectedCharacterId = progress.characterId;
    cardDefinitions = character.cards;
    state = combat;
    pendingRewards = saved.pendingRewards;
    activeEvent = event;
    selectedEventChoice = event?.choices.find(choice => choice.id === saved.choiceId) || null;
    selectedEventCardIndex = saved.selectedEventCardIndex;
    pendingTargetCardIndex = saved.pendingTargetCardIndex;
    currentShopCardIds = saved.currentShopCardIds || [];
    currentShopRelicIds = saved.currentShopRelicIds || [];
    currentShopItemIds = saved.currentShopItemIds || [];
    currentShopCardPrices = selectedCharacterId === "character_nightborn" ? vampireCardPrices : selectedCharacterId === "character_sera" ? seraCardPrices : cardPrices;
    if (saved.screenId === "shop-screen") renderShop();
    if (saved.screenId === "rest-screen") renderRestSite();
    if (saved.screenId === "event-screen") renderEventScreen();
    if (saved.screenId === "rewards-screen") renderRewards();
    if (saved.screenId === "card-reward-screen") renderCardRewardChoices();
    suspended = null;
    loadedSave.adventure = null;
    showScreen(saved.screenId);
  } catch (error) {
    storageBlocked = true;
    state = null;
    mapProgress = null;
    storageError("冒険を再開できませんでした。保存データは保持しています。" + error.message);
    showScreen("title-screen");
  }
});
document.addEventListener("click", () => { persistGame(); updateContinueButton(); });
window.addEventListener("pagehide", persistGame);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") persistGame(); });
updateContinueButton();

showScreen("title-screen");
})();
