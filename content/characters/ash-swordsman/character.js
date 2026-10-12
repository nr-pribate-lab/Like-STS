window.GameContent = window.GameContent || {};
window.GameContent.characters = window.GameContent.characters || {};
window.GameContent.characters["ash-swordsman"] = {
  id: "ash-swordsman",
  name: "灰路の剣士",
  maxHp: 50,
  startingEnergy: 3,
  handSize: 5,
  startingDeck: Array(5).fill("ash-slash"),
};

// The current MVP still exposes one active character through the existing combat UI.
window.GameContent.character = window.GameContent.characters["ash-swordsman"];
