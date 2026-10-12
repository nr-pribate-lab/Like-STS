(() => {
const characterId = "character_ash_swordsman";
const cardDefinitions = window.GameContent.characters[characterId].cards;
const mapStage = window.GameContent.stages["stage_ash_corridor"];
const mapNodes = window.GameContent.mapNodes;
const { createRun, endTurn, playCard } = window.GameCombat;

let state = null;
let mapProgress = null;
let mapDialogMode = null;
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
  screens: ["title-screen", "town-screen", "adventure-screen", "map-screen", "upgrade-screen", "social-screen", "combat-screen"].map($),
};

function showScreen(screenId) {
  for (const screen of ui.screens) {
    const active = screen.id === screenId;
    screen.classList.toggle("is-active", active);
    screen.setAttribute("aria-hidden", String(!active));
  }
  const inCombat = screenId === "combat-screen";
  ui.runLabel.hidden = !inCombat;
  ui.helpButton.hidden = !inCombat;
  if (inCombat) render();
  if (screenId === "map-screen") renderMap();
}

function renderMap() {
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

function enterMapNode(node, index) {
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
    state = createRun(node.enemyIds[0]);
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

function render() {
  const enemy = state.enemy;
  const player = state.player;
  ui.hand.replaceChildren(...state.hand.map((id, index) => makeCard(cardDefinitions[id], index)));
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

function playEnemyHit() {
  ui.enemyArt.classList.remove("is-hit");
  void ui.enemyArt.offsetWidth;
  ui.enemyArt.classList.add("is-hit");
}

function makeCard(card, index) {
  const button = document.createElement("button");
  button.className = `card rarity-${card.rarity} ${state.energy < card.cost ? "is-unplayable" : ""}`;
  button.type = "button";
  button.disabled = state.energy < card.cost || state.outcome !== "ongoing";
  button.setAttribute("aria-label", `${card.name}, コスト${card.cost}。${card.description}`);
  const top = document.createElement("div"); top.className = "card-top";
  const type = document.createElement("span"); type.className = "card-type"; type.textContent = ({ attack: "攻撃", skill: "スキル", persistent: "永続" })[card.type] || card.type;
  const cost = document.createElement("span"); cost.className = "card-cost"; cost.textContent = card.cost;
  const art = document.createElement("div"); art.className = "card-art"; art.innerHTML = "<span class=\"slash slash-a\"></span><span class=\"slash slash-b\"></span><span class=\"card-spark\">✦</span>";
  const name = document.createElement("strong"); name.className = "card-name"; name.textContent = card.name;
  const description = document.createElement("span"); description.className = "card-description"; description.textContent = card.description;
  const footer = document.createElement("span"); footer.className = "card-footer"; footer.textContent = "灰路の剣士";
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
      : "この地点の戦闘に勝利した。マップへ戻り、次の道を選ぼう。"
    : "敵に敗れた。手札の使い方を変えて、もう一度挑もう。";
  $("dialog-action").textContent = finalBossVictory ? "旅を終える" : won ? "マップへ戻る" : "町へ戻る";
  ui.message.showModal();
}

ui.endTurn.addEventListener("click", () => { endTurn(state); render(); });
ui.enemyArt.addEventListener("animationend", (event) => {
  if (event.animationName === "hit") ui.enemyArt.classList.remove("is-hit");
});
$("dialog-action").addEventListener("click", () => {
  const victory = state?.outcome === "victory";
  const finalBossVictory = victory && mapNodes[mapStage.nodeIds[mapProgress?.nodeIndex]]?.type === "boss";
  ui.message.close();
  state = null;
  if (finalBossVictory) {
    mapProgress = null;
    showScreen("title-screen");
  } else if (victory && mapProgress) {
    mapProgress.nodeIndex += 1;
    showScreen("map-screen");
  } else {
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
for (const option of [$("select-dungeon"), $("select-character")]) {
  option.addEventListener("click", () => {
    option.classList.add("is-selected");
    option.setAttribute("aria-pressed", "true");
  });
}
$("begin-adventure").addEventListener("click", () => {
  state = null;
  mapProgress = { stageId: mapStage.id, nodeIndex: 0 };
  showScreen("map-screen");
});
$("map-dialog-action").addEventListener("click", () => {
  ui.mapDialog.close();
  if (mapDialogMode === "skip") {
    mapProgress.nodeIndex = Number(ui.mapDialog.dataset.nextIndex);
    showScreen("map-screen");
  } else if (mapDialogMode === "endRun") {
    mapProgress = null;
    showScreen("town-screen");
  }
  mapDialogMode = null;
});
$("brand-home").addEventListener("click", (event) => {
  event.preventDefault();
  showScreen("town-screen");
});
$("help-button").addEventListener("click", () => ui.help.showModal());
$("help-close").addEventListener("click", () => ui.help.close());
$("help-done").addEventListener("click", () => ui.help.close());
ui.help.addEventListener("click", (event) => { if (event.target === ui.help) ui.help.close(); });
showScreen("title-screen");
})();
