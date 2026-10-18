window.GameContent = window.GameContent || {};
window.GameContent.enemies = window.GameContent.enemies || {};
window.GameContent.enemies["enemy_ash_tyrant"] = {
  id: "enemy_ash_tyrant",
  name: "灰燼の王",
  description: "灰の回廊の最奥に君臨し、旅人を塔の灰へと変える古き王。",
  rank: "boss",
  maxHp: 120,
  actions: [
    { type: "attack", amount: 11, description: "灰の剣で斬りつけ11ダメージ" },
    { type: "defend", amount: 12, description: "灰の鎧をまとい12ブロックを得る" },
    { type: "attack", amount: 17, description: "王の一閃で17ダメージ" },
    { type: "strengthen", amount: 2, description: "灰の王気で筋力を2得る" },
    { type: "attack", amount: 20, description: "すべてを焼く一撃で20ダメージ" },
  ],
};
