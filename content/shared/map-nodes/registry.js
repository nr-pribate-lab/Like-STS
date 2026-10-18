window.GameContent = window.GameContent || {};
window.GameContent.mapNodes = window.GameContent.mapNodes || {};

window.GameContent.mapNodes.node_ash_battle = {
  id: "node_ash_battle",
  type: "normal_battle",
  name: "通常戦闘",
  description: "灰守りが道を塞いでいる。",
  enemyIds: ["enemy_ash_warden", "enemy_ashling"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_event = {
  id: "node_ash_event",
  type: "event",
  name: "イベント",
  description: "旅の出来事に遭遇する地点です。",
  eventIds: ["event_ash_wagon", "event_ember_idol", "event_wayfarer"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_rest = {
  id: "node_ash_rest",
  type: "rest",
  name: "休息",
  description: "HPを回復するか、カードを1枚強化できます。",
  implemented: true,
};

window.GameContent.mapNodes.node_ash_elite = {
  id: "node_ash_elite",
  type: "elite",
  name: "強敵",
  description: "灰冠の執行者が立ちはだかる。勝利すると通常報酬に加えてレリックを得る。",
  enemyIds: ["enemy_ash_champion"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_shop = {
  id: "node_ash_shop",
  type: "shop",
  name: "ショップ",
  description: "カード、レリック、アイテムの購入やカード削除ができます。",
  implemented: true,
};

window.GameContent.mapNodes.node_ash_social = {
  id: "node_ash_social",
  type: "event",
  name: "イベント",
  description: "以前出会った旅人と再会します。",
  eventIds: ["event_ash_companion_return"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_social_first = {
  id: "node_ash_social_first",
  type: "event",
  name: "イベント",
  description: "旅人や仲間との出会いが待っています。",
  eventIds: ["event_ash_card_broker", "event_ash_ally_gift", "event_ash_duelist"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_social_intro = {
  id: "node_ash_social_intro",
  type: "event",
  name: "イベント",
  description: "傷ついた旅人を助けます。",
  eventIds: ["event_ash_sera_first_meeting"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_social_third = {
  id: "node_ash_social_third",
  type: "event",
  name: "イベント",
  description: "セラと三度目の再会を果たします。",
  eventIds: ["event_ash_sera_third_meeting"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_final_boss = {
  id: "node_ash_final_boss",
  type: "boss",
  name: "最終ボス",
  description: "灰の回廊を支配する灰燼の王との決戦です。勝利すれば冒険は完結します。",
  enemyIds: ["enemy_ash_tyrant"],
  implemented: true,
};
