window.GameContentManifest = {
  version: "12",
  shared: {
    effects: [
      "content/shared/effects/damage.js",
    ],
    relics: [
      "content/shared/relics/registry.js",
    ],
    relicHandlers: [
      "content/shared/relics/power-belt.js",
    ],
    enemies: [
      "content/shared/enemies/ash-warden.js",
    ],
    stages: [
      "content/shared/stages/ash-corridor.js",
    ],
    mapNodes: [
      "content/shared/map-nodes/registry.js",
    ],
  },
  characters: [
    {
      id: "character_ash_swordsman",
      definition: "content/characters/ash-swordsman/character.js",
      cards: [
        "content/characters/ash-swordsman/cards/card_ash_slash/card_ash_slash.js",
      ],
    },
  ],
  gameCore: [
    "game-core/combat.js",
  ],
  application: [
    "src/main.js",
  ],
};
