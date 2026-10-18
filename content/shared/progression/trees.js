window.GameContent = window.GameContent || {};
window.GameContent.upgradeTrees = {
  character_ash_swordsman: [
    { id: "ash_edge", name: "灰路の型", description: "「連斬」を解放", cost: 2, rewardType: "card", rewardId: "card_flurry" },
    { id: "ash_focus", name: "研ぎ澄ます", description: "「集中」を解放", cost: 3, requires: ["ash_edge"], rewardType: "card", rewardId: "card_focus" },
    { id: "ash_sigil", name: "鍛火の印", description: "剣士専用レリック「鍛火の紋章」を解放", cost: 4, requires: ["ash_edge"], rewardType: "relic", rewardId: "relic_swordsman_forge" },
    { id: "ash_edge_echo", name: "刃に返す構え", description: "防御使用時、手札の斬撃が防御値+2になるレリックを解放", cost: 5, requires: ["ash_edge"], rewardType: "relic", rewardId: "relic_swordsman_edge_echo" },
    { id: "ash_guard_echo", name: "構えからの返し", description: "斬撃使用時、手札の防御が斬撃値+2になるレリックを解放", cost: 5, requires: ["ash_edge"], rewardType: "relic", rewardId: "relic_swordsman_guard_echo" },
  ],
  character_nightborn: [
    { id: "night_hunger", name: "血への渇望", description: "「血の狂乱」を解放", cost: 2, rewardType: "card", rewardId: "card_blood_frenzy" },
    { id: "night_pact", name: "夜との契り", description: "「血蝠の契約」を解放", cost: 3, requires: ["night_hunger"], rewardType: "card", rewardId: "card_blood_pact" },
    { id: "night_moon", name: "月蝠の加護", description: "眷属専用レリック「月蝠の護符」を解放", cost: 4, requires: ["night_hunger"], rewardType: "relic", rewardId: "relic_nightborn_moonbat" },
  ],
};
