window.GameContent = window.GameContent || {};
window.GameContent.relics = window.GameContent.relics || {};
window.GameContent.relics["relic_power_belt"] = {
  id: "relic_power_belt",
  name: "パワーベルト",
  description: "巻くだけで強くなった気分に。筋力を+2",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop"],
};
window.GameContent.relics["relic_ember_ward"] = {
  id: "relic_ember_ward",
  name: "熾火の護符",
  description: "戦闘開始時、6ブロックを得る。",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "event"],
};
window.GameContent.relics["relic_first_flame"] = {
  id: "relic_first_flame",
  name: "先制の火種",
  description: "戦闘開始時、このターンのエネルギーを1得る。",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "event"],
};
window.GameContent.relics["relic_foresight_compass"] = {
  id: "relic_foresight_compass",
  name: "先見の羅針盤",
  description: "戦闘開始時、カードを1枚追加で引く。",
  scope: "common",
  timing: "onBattleStart",
  acquisition: ["shop", "event"],
};
