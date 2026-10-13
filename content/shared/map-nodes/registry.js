window.GameContent = window.GameContent || {};
window.GameContent.mapNodes = window.GameContent.mapNodes || {};

window.GameContent.mapNodes.node_ash_battle = {
  id: "node_ash_battle",
  type: "normal_battle",
  name: "通常戦闘",
  description: "灰守りが道を塞いでいる。",
  enemyIds: ["enemy_ash_warden"],
  implemented: true,
};

window.GameContent.mapNodes.node_ash_event = {
  id: "node_ash_event",
  type: "event",
  name: "イベント",
  description: "旅の出来事に遭遇する地点です。",
  implemented: false,
};

window.GameContent.mapNodes.node_ash_rest = {
  id: "node_ash_rest",
  type: "rest",
  name: "休息",
  description: "休息やカード強化を行う地点です。",
  implemented: false,
};

window.GameContent.mapNodes.node_ash_shop = {
  id: "node_ash_shop",
  type: "shop",
  name: "ショップ",
  description: "パワーベルトを取得できる簡易ショップです。",
  implemented: true,
};

window.GameContent.mapNodes.node_ash_social = {
  id: "node_ash_social",
  type: "social",
  name: "交流",
  description: "人物と会話する地点です。",
  implemented: false,
};

window.GameContent.mapNodes.node_ash_final_boss = {
  id: "node_ash_final_boss",
  type: "boss",
  name: "最終ボス",
  description: "ゴール地点です。最終ボス戦と勝利後のゲームクリアは未実装です。",
  implemented: false,
};
