window.GameContentItemHandlers = window.GameContentItemHandlers || {};
window.GameContentItemHandlers.item_flash_bomb = {
  use({ state }) {
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      const damage = Math.max(0, 10 - (enemy.block || 0));
      enemy.block = Math.max(0, (enemy.block || 0) - 10);
      enemy.hp = Math.max(0, enemy.hp - damage);
    }
    return { used: true, message: "閃光弾が炸裂し、すべての敵に10ダメージを与えた。" };
  },
};
window.GameContentItemHandlers.item_berserker_draught = {
  use({ state }) {
    state.player.strength += 3;
    state.player.expiringStrength += 3;
    return { used: true, message: "猛りの霊薬で、このターン筋力を3得た。" };
  },
};
window.GameContentItemHandlers.item_draw_scroll = {
  use({ state }) {
    window.GameCombat.drawCards(state, 2);
    return { used: true, message: "追い風の巻物でカードを2枚引いた。" };
  },
};
window.GameContentItemHandlers.item_purifying_smoke = {
  use({ state }) {
    if (state.player.weakTurns <= 0) return { used: false, message: "弱体を受けていないため、清めの煙は使えなかった。" };
    state.player.weakTurns = 0;
    return { used: true, message: "清めの煙が弱体を取り除いた。" };
  },
};
window.GameContentItemHandlers.item_black_sand = {
  use({ state }) {
    const enemy = state.enemies[state.selectedTargetIndex ?? 0];
    if (!enemy || enemy.hp <= 0 || enemy.skipNextAction) return { used: false, message: "止められる敵の行動がない。" };
    enemy.skipNextAction = true;
    return { used: true, message: `${enemy.name}の次の行動を黒砂が封じた。` };
  },
};
window.GameContentItemHandlers.item_lucky_shard = {
  use({ state }) {
    state.gold += 15;
    return { used: true, message: "幸運の欠片を砕き、ラン中の所持金を15$得た。" };
  },
};
window.GameContentItemHandlers.item_recall_feather = {
  use({ state }) {
    if (state.discardPile.length === 0) return { used: false, message: "捨て札がないため、呼び戻しの羽は使えなかった。" };
    const index = Math.floor(state.random() * state.discardPile.length);
    const [cardId] = state.discardPile.splice(index, 1);
    state.hand.push(cardId);
    state.handModifiers.push({});
    return { used: true, message: `${window.GameCombat.getCardDefinition(state.character, cardId).name}を捨て札から手札に戻した。` };
  },
};
window.GameContentItemHandlers.item_shatter_paste = {
  use({ state }) {
    const enemy = state.enemies[state.selectedTargetIndex ?? 0];
    if (!enemy || enemy.hp <= 0 || enemy.block <= 0) return { used: false, message: "砕ける敵のブロックがない。" };
    enemy.block = 0;
    return { used: true, message: `${enemy.name}のブロックをすべて取り除いた。` };
  },
};
