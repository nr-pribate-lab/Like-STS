window.GameContent = window.GameContent || {};
window.GameContent.characters = window.GameContent.characters || {};
window.GameContent.characters["character_nightborn"] = {
  id: "character_nightborn",
  name: "夜血の眷属",
  description: "血を糧に戦い、蝙蝠を使役する吸血鬼。",
  maxHp: 45,
  startingEnergy: 3,
  handSize: 5,
  startingDeck: [
    ...Array(3).fill("card_vampire_claw"),
    ...Array(2).fill("card_vampire_guard"),
    ...Array(2).fill("card_bat_call"),
    "card_vampire_bite",
    "card_bat_dive",
    "card_bat_absorption",
  ],
  cards: {},
};
