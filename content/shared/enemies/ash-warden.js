window.GameContent = window.GameContent || {};
window.GameContent.enemies = window.GameContent.enemies || {};
window.GameContent.enemies["enemy_ash_warden"] = {
  id: "enemy_ash_warden",
  name: "灰守り",
  description: "灰の回廊を守る番人。",
  rank: "normal",
  maxHp: 30,
  actions: [
    { type: "attack", amount: 6, description: "古びた刃で6ダメージ" },
    { type: "defend", amount: 5, description: "身構えて5ブロックを得る" },
    { type: "attack", amount: 8, description: "強く踏み込み8ダメージ" },
  ],
};
