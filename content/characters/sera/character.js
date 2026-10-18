window.GameContent = window.GameContent || {};
window.GameContent.characters = window.GameContent.characters || {};
window.GameContent.characters.character_sera = {
  id: "character_sera",
  name: "セラ",
  description: "灰道を旅する支援役。守りを固め、機を見て攻める。",
  maxHp: 48,
  startingEnergy: 3,
  handSize: 5,
  startingDeck: [
    ...Array(5).fill("card_sera_slash"),
    ...Array(5).fill("card_sera_guard"),
  ],
  cards: {},
};
