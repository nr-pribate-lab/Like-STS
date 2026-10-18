window.GameContentManifest = {
  version: "51",
  shared: {
    effects: [
      "content/shared/effects/damage.js",
      "content/shared/effects/block.js",
      "content/shared/effects/draw.js",
      "content/shared/effects/strength.js",
      "content/shared/effects/lifesteal.js",
      "content/shared/effects/bats.js",
      "content/shared/effects/blood-bat.js",
      "content/shared/effects/card-actions.js",
    ],
    relics: [
      "content/shared/relics/registry.js",
    ],
    relicHandlers: [
      "content/shared/relics/power-belt.js",
      "content/shared/relics/ember-ward.js",
      "content/shared/relics/first-flame.js",
      "content/shared/relics/foresight-compass.js",
      "content/shared/relics/character-relics.js",
      "content/shared/relics/utility-relics.js",
    ],
    items: [
      "content/shared/items/registry.js",
    ],
    itemHandlers: [
      "content/shared/items/healing-potion.js",
      "content/shared/items/energy-tonic.js",
      "content/shared/items/guarding-tonic.js",
      "content/shared/items/utility-items.js",
    ],
    enemies: [
      "content/shared/enemies/ash-warden.js",
      "content/shared/enemies/ashling.js",
      "content/shared/enemies/ash-champion.js",
      "content/shared/enemies/ash-tyrant.js",
    ],
    stages: [
      "content/shared/stages/ash-corridor.js",
    ],
    mapNodes: [
      "content/shared/map-nodes/registry.js",
    ],
    events: [
      "content/shared/events/registry.js",
    ],
    progression: [
      "content/shared/progression/trees.js",
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
        "content/characters/ash-swordsman/cards/card_perfect_rhythm.js",
        "content/characters/ash-swordsman/cards/card_edge_echo.js",
        "content/characters/ash-swordsman/cards/card_guard_echo.js",
        "content/characters/ash-swordsman/cards/card_hand_strength.js",
        "content/characters/ash-swordsman/cards/card_reform_defense.js",
        "content/characters/ash-swordsman/cards/card_guard_crush.js",
        "content/characters/ash-swordsman/cards/card_riposte.js",
        "content/characters/ash-swordsman/cards/card_measured_guard.js",
        "content/characters/ash-swordsman/cards/card_shared_beat.js",
        "content/characters/ash-swordsman/cards/card_pivot_assault.js",
        "content/characters/ash-swordsman/cards/card_iron_advance.js",
        "content/characters/ash-swordsman/cards/card_shield_breaker.js",
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
    {
      id: "character_sera",
      definition: "content/characters/sera/character.js",
      cards: [
        "content/characters/sera/cards/card_sera_slash.js",
        "content/characters/sera/cards/card_sera_guard.js",
        "content/characters/sera/cards/card_sera_signal.js",
        "content/characters/sera/cards/card_sera_flare.js",
        "content/characters/sera/cards/card_sera_focus.js",
      ],
    },
  ],
  gameCore: [
    "game-core/combat.js",
  ],
  application: [
    "src/save.js",
    "src/main.js",
  ],
};
