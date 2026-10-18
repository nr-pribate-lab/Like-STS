window.GameContent = window.GameContent || {};
window.GameContent.relics = window.GameContent.relics || {};
window.GameContent.relics["relic_power_belt"] = {
  id: "relic_power_belt",
  name: "パワーベルト",
  description: "巻くだけで強くなった気分に。筋力を+2",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "elite"],
};
window.GameContent.relics["relic_ember_ward"] = {
  id: "relic_ember_ward",
  name: "熾火の護符",
  description: "戦闘開始時、6ブロックを得る。",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics["relic_first_flame"] = {
  id: "relic_first_flame",
  name: "先制の火種",
  description: "戦闘開始時、このターンのエネルギーを1得る。",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics["relic_foresight_compass"] = {
  id: "relic_foresight_compass",
  name: "先見の羅針盤",
  description: "戦闘開始時、カードを1枚追加で引く。",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_sera_signal = {
  id: "relic_sera_signal",
  name: "セラの合図",
  description: "仲間になったセラが、各ターンの開始時に4ブロックを与える。",
  scope: "common",
  timing: "onPlayerTurnStart",
  acquisition: ["event"],
};
window.GameContent.relics.relic_wayfarer_satchel = {
  id: "relic_wayfarer_satchel", name: "旅人の小袋", description: "アイテムの所持上限が1増える。",
  scope: "common", itemCapacityBonus: 1, acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_first_breath = {
  id: "relic_first_breath", name: "初手の火花", description: "各ターン最初に攻撃カードを使うと、エネルギーを1得る。",
  scope: "common", timing: "onCardPlayed", acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_quiet_script = {
  id: "relic_quiet_script", name: "静謐のしおり", description: "各ターン最初にスキルカードを使うと、カードを1枚引く。",
  scope: "common", timing: "onCardPlayed", acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_rhythm_bead = {
  id: "relic_rhythm_bead", name: "三拍子の珠", description: "各ターン、カードを3枚使うたびにエネルギーを1得る。",
  scope: "common", timing: "onCardPlayed", acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_guardian_thread = {
  id: "relic_guardian_thread", name: "守り糸", description: "防御カードを使うたび、追加で3ブロックを得る。",
  scope: "common", timing: "onCardPlayed", acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_ash_salve = {
  id: "relic_ash_salve", name: "灰蜜の小瓶", description: "各ターン最初にHPダメージを受けたとき、HPを2回復する。",
  scope: "common", timing: "onDamageTaken", acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_gilded_signet = {
  id: "relic_gilded_signet", name: "金箔の印章", description: "戦闘勝利時のラン中ゴールド報酬が10$増える。",
  scope: "common", battleGoldBonus: 10, acquisition: ["shop", "event", "elite"],
};
window.GameContent.relics.relic_last_light = {
  id: "relic_last_light", name: "残光の灯", description: "HPが最大値の半分以下で戦闘を始めると、カードを1枚引き、エネルギーを1得る。",
  scope: "common", timing: "onBattleStart", acquisition: ["shop", "event", "elite"],
};
