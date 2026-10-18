window.GameContent = window.GameContent || {};
window.GameContent.enemies = window.GameContent.enemies || {};
window.GameContent.enemies["enemy_ash_champion"] = {
  id: "enemy_ash_champion",
  name: "灰冠の執行者",
  description: "灰の回廊を巡回する強敵。重い剣撃と防御を織り交ぜる。",
  rank: "elite",
  maxHp: 56,
  actions: [
    { type: "attack", amount: 9, description: "大剣を振り下ろし9ダメージ" },
    { type: "defend", amount: 10, description: "盾を構えて10ブロックを得る" },
    { type: "attack", amount: 13, description: "強烈な一撃で13ダメージ" },
  ],
};
