window.GameContent = window.GameContent || {};
window.GameContent.enemies = window.GameContent.enemies || {};
window.GameContent.enemies["enemy_ashling"] = {
  id: "enemy_ashling",
  name: "灰火の小鬼",
  description: "灰の隙間から飛び出す小さな魔物。",
  rank: "normal",
  maxHp: 16,
  actions: [
    { type: "attack", amount: 3, description: "火の粉を飛ばして3ダメージ" },
    { type: "weaken", amount: 1, description: "灰を浴びせて次のターンの攻撃を弱める" },
  ],
};
