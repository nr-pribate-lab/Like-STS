window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.summon_bat = ({ state }, effect) => {
  state.bats.push(...Array.from({ length: effect.amount }, () => ({ id: "bat" })));
  return `蝙蝠を${effect.amount}匹召喚`;
};
window.GameContentEffects.bat_strike = ({ state, targets }, effect) => {
  if (state.bats.length === 0) return "蝙蝠がいない";
  state.bats.pop();
  const amount = effect.amount + (state.player.attackBonus || 0) + (state.player.strength || 0);
  let totalDamage = 0;
  for (const target of targets) {
    const damage = Math.max(0, amount - (target.block || 0));
    target.block = Math.max(0, (target.block || 0) - amount);
    totalDamage += Math.min(target.hp, damage);
    target.hp = Math.max(0, target.hp - damage);
  }
  return `蝙蝠を1匹消費し、${totalDamage}ダメージ`;
};
window.GameContentEffects.bat_absorb = ({ state }, effect) => {
  if (state.bats.length === 0) return "蝙蝠がいない";
  state.bats.pop();
  const healed = Math.min(effect.amount, state.player.maxHp - state.player.hp);
  state.player.hp += healed;
  return `蝙蝠を1匹吸収し、体力を${healed}回復`;
};
