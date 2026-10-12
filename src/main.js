(() => {
const cardDefinitions = window.GameContent.cards;
const { createRun, endTurn, playCard } = window.GameCombat;

let state = null;
const $ = (id) => document.getElementById(id);
const ui = {
  hand: $("hand"), enemyHp: $("enemy-hp"), playerHp: $("player-hp"),
  enemyHealth: $("enemy-health"), playerHealth: $("player-health"),
  energy: $("energy-value"), draw: $("draw-count"), discard: $("discard-count"),
  block: $("block-value"), log: $("combat-log"), intent: $("enemy-intent"),
  enemyStatus: $("enemy-status"), banner: $("turn-banner"), enemyArt: $("enemy-art"),
  endTurn: $("end-turn"), message: $("message-dialog"), help: $("help-dialog"),
  runLabel: $("run-label"), helpButton: $("help-button"),
  screens: ["title-screen", "town-screen", "adventure-screen", "upgrade-screen", "social-screen", "combat-screen"].map($),
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
  button.className = `card ${state.energy < card.cost ? "is-unplayable" : ""}`;
  button.type = "button";
  button.disabled = state.energy < card.cost || state.outcome !== "ongoing";
  button.setAttribute("aria-label", `${card.name}, コスト${card.cost}。${card.description}`);
  const top = document.createElement("div"); top.className = "card-top";
  const type = document.createElement("span"); type.className = "card-type"; type.textContent = "攻撃";
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
  $("dialog-mark").textContent = won ? "✦" : "…";
  $("dialog-eyebrow").textContent = won ? "STAGE CLEAR" : "RUN ENDED";
  $("dialog-title").textContent = won ? "道がひらけた" : "旅はここで終わる";
  $("dialog-copy").textContent = won
    ? "灰の回廊を突破した。これは最初の一歩。"
    : "灰守りに敗れた。手札の使い方を変えて、もう一度挑もう。";
  $("dialog-action").textContent = "町へ戻る";
  ui.message.showModal();
}

ui.endTurn.addEventListener("click", () => { endTurn(state); render(); });
ui.enemyArt.addEventListener("animationend", (event) => {
  if (event.animationName === "hit") ui.enemyArt.classList.remove("is-hit");
});
$("dialog-action").addEventListener("click", () => {
  ui.message.close();
  state = null;
  showScreen("town-screen");
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
  state = createRun();
  showScreen("combat-screen");
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
