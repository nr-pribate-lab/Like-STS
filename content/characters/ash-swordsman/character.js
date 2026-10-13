window.GameContent = window.GameContent || {};
window.GameContent.characters = window.GameContent.characters || {};
window.GameContent.characters["character_ash_swordsman"] = {
  id: "character_ash_swordsman",
  name: "灰路の剣士",
  description: "灰に閉ざされた塔へ挑む剣士。",
  maxHp: 50,
  startingEnergy: 3,
  handSize: 5,
  startingDeck: [
    ...Array(5).fill("card_ash_slash"),
    ...Array(5).fill("card_defense"),
  ],
  cards: {},
};
