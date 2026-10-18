const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function session(raw = null, fail = false) {
  const elements = new Map();
  class Element {
    constructor(id) { this.id = id; this.hidden = id === "save-status"; this.style = {}; this.dataset = {}; this.handlers = {}; this.children = []; this.classList = { contains: name => this.active === name, toggle: (name, active) => { if (name === 'is-active') this.active = active ? name : null; }, add() {}, remove() {} }; }
    addEventListener(name, cb) { (this.handlers[name] ||= []).push(cb); }
    querySelector() { return null; } setAttribute() {} appendChild(node) { this.children.push(node); } append(...nodes) { this.children.push(...nodes); } replaceChildren(...nodes) { this.children = nodes; }
    showModal() { this.open = true; } close() { this.open = false; }
  }
  const get = id => { if (!elements.has(id)) elements.set(id, new Element(id)); return elements.get(id); };
  const documentHandlers = {};
  const document = { getElementById: get, createElement: () => new Element(), createElementNS: () => new Element(), createDocumentFragment: () => new Element(), querySelectorAll: () => [], querySelector: () => null, addEventListener(name, cb) { (documentHandlers[name] ||= []).push(cb); } };
  const storage = { value: raw, getItem() { return this.value; }, setItem(key, value) { if (fail) throw Error('quota'); this.value = value; } };
  const context = vm.createContext({ window: { addEventListener() {} }, document, localStorage: storage, console, Math });
  const run = path => vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path });
  run('content/manifest.js');
  const manifest = context.window.GameContentManifest;
  for (const files of Object.values(manifest.shared)) for (const file of files) run(file);
  // Character entries in the manifest are grouped by character.
  for (const entry of manifest.characters) { if (typeof entry === 'string') run(entry); else { run(entry.definition); for (const file of entry.cards) run(file); } }
  for (const file of manifest.gameCore) run(file);
  run('src/save.js');
  const source = fs.readFileSync('src/main.js', 'utf8').replace(/\}\)\(\);\s*$/, `window.testSave = { persistGame, finishRun, showMenuView, get: () => ({state, mapProgress, pendingRewards}), set: data => { state=data.state; mapProgress=data.mapProgress; pendingRewards=data.pendingRewards || null; } }; })();`);
  vm.runInContext(source, context);
  return { context, storage, get, click(id) { for (const cb of get(id).handlers.click || []) cb({}); for (const cb of documentHandlers.click || []) cb({}); }, save: context.window.GameSave, api: context.window.testSave };
}
const first = session();
assert.equal(first.save.decode('{"starFragments":9}').profile.starFragments, 9);
assert.throws(() => first.save.decode('{"saveVersion":99}'));
assert.throws(() => first.save.decode('invalid'));
first.click('begin-adventure');
let { mapProgress } = first.api.get();
const combat = first.context.window.GameCombat.createRun(['enemy_ash_warden'], Math.random, [], mapProgress.deck, [], 100, mapProgress.characterId);
mapProgress.currentNodeId = mapProgress.map.floors[0][0].id;
first.api.set({state: combat, mapProgress});
first.get('map-screen').classList.toggle('is-active', false);
first.get('combat-screen').classList.toggle('is-active', true);
combat.player.hp -= 7;
assert.equal(first.api.persistGame(), true);
first.click('menu-button');
// Exercise the actual suspend view and dynamically created confirmation button.
first.api.showMenuView('suspend');
const suspendButton = first.get('menu-detail-content').children.at(-1);
for (const cb of suspendButton.handlers.click) cb({});
assert.equal(first.api.get().mapProgress, null);
assert.equal(first.get('continue-game').hidden, false);
first.click('continue-game');
assert.ok(first.api.get().state);

const second = session(first.storage.value);
second.click('continue-game');
const restored = second.api.get().state;
assert.ok(restored);
assert.equal(restored.player.hp, combat.player.hp);
assert.equal(restored.enemy, restored.enemies[0]);
assert.equal(typeof restored.random, 'function');
assert.deepEqual(JSON.parse(JSON.stringify(restored.hand)), JSON.parse(JSON.stringify(combat.hand)));
second.context.window.GameCombat.endTurn(restored);
assert.equal(restored.turn, 2);
second.api.set({ state: null, mapProgress: second.api.get().mapProgress, pendingRewards: { goldClaimed: true, starFragmentsClaimed: true, cardClaimed: false, cardResolved: false, itemClaimed: true, relicClaimed: true, gold: 20, starFragments: 1 } });
second.get('combat-screen').classList.toggle('is-active', false);
second.get('rewards-screen').classList.toggle('is-active', true);
second.api.persistGame();
assert.equal(JSON.parse(second.storage.value).adventure.pendingRewards.goldClaimed, true);
const rewardSession = session(second.storage.value);
rewardSession.click('continue-game');
assert.ok(rewardSession.api.get().pendingRewards);
const beforeGold = rewardSession.api.get().mapProgress.gold;
rewardSession.click('claim-gold');
assert.equal(rewardSession.api.get().mapProgress.gold, beforeGold, 'claimed gold must not be awarded twice');
const baseSave = JSON.parse(second.storage.value);
baseSave.adventure.pendingRewards.cards = [];
for (const screen of ['map-screen', 'shop-screen', 'rest-screen', 'event-screen', 'card-reward-screen']) {
  const data = JSON.parse(JSON.stringify(baseSave));
  data.adventure.screenId = screen;
  if (screen === 'event-screen') {
    data.adventure.eventId = 'event_ash_wagon';
    data.adventure.choiceId = 'take_rations';
  }
  const resumed = session(JSON.stringify(data));
  resumed.click('continue-game');
  assert.equal(resumed.get('save-status').hidden, true, screen + ' should restore without an error');
  assert.ok(resumed.get(screen).classList.contains('is-active'), screen + ' should be active');
  assert.ok(resumed.api.get().mapProgress);
}

second.api.finishRun(); second.api.persistGame();
assert.equal(JSON.parse(second.storage.value).adventure, null);
const broken = session('{"saveVersion":99}');
assert.equal(broken.api.persistGame(), false);
assert.equal(broken.storage.value, '{"saveVersion":99}');
assert.equal(broken.get('save-status').hidden, false);
const quota = session(null, true);
assert.equal(quota.api.persistGame(), false);
assert.equal(quota.get('save-status').hidden, false);
console.log('Suspend/resume, all adventure screens, save migration, combat round trip and next turn, reward flags, completion, future version protection and storage failure passed.');



