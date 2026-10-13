window.GameContentManifest = {
  version: "26",
  shared: {
    effects: [
      "content/shared/effects/damage.js",
      "content/shared/effects/block.js",
      "content/shared/effects/draw.js",
      "content/shared/effects/strength.js",
      "content/shared/effects/lifesteal.js",
      "content/shared/effects/bats.js",
      "content/shared/effects/blood-bat.js",
    ],
    relics: [
      "content/shared/relics/registry.js",
    ],
    relicHandlers: [
      "content/shared/relics/power-belt.js",
      "content/shared/relics/ember-ward.js",
      "content/shared/relics/first-flame.js",
      "content/shared/relics/foresight-compass.js",
    ],
    items: [
      "content/shared/items/registry.js",
    ],
    itemHandlers: [
      "content/shared/items/healing-potion.js",
      "content/shared/items/energy-tonic.js",
      "content/shared/items/guarding-tonic.js",
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
        "content/characters/ash-swordsman/cards/card_defense/card_defense.js",
        "content/characters/ash-swordsman/cards/card_focus/card_focus.js",
        "content/characters/ash-swordsman/cards/card_zone/card_zone.js",
        "content/characters/ash-swordsman/cards/card_heavy_strike/card_heavy_strike.js",
        "content/characters/ash-swordsman/cards/card_parry/card_parry.js",
        "content/characters/ash-swordsman/cards/card_flurry/card_flurry.js",
      ],
    },
    {
      id: "character_nightborn",
      definition: "content/characters/nightborn/character.js",
      cards: [
        "content/characters/nightborn/cards/card_vampire_claw.js",
        "content/characters/nightborn/cards/card_vampire_guard.js",
        "content/characters/nightborn/cards/card_vampire_bite.js",
        "content/characters/nightborn/cards/card_bat_call.js",
        "content/characters/nightborn/cards/card_bat_dive.js",
        "content/characters/nightborn/cards/card_bat_absorption.js",
        "content/characters/nightborn/cards/card_blood_frenzy.js",
        "content/characters/nightborn/cards/card_blood_pact.js",
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
