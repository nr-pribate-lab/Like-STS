# 効果スクリプト

新しい効果はJavaScriptファイルとしてこのフォルダに追加し、content/manifest.js の shared.effects に登録します。効果IDに対応する関数を window.GameContentEffects に登録してください。

カードの effects 配列は上から順に実行されます。ハンドラーには context と効果パラメーターが渡されます。context には戦闘 state、使用中の card、target 配列、乱数関数 random が含まれます。ハンドラーが返した文字列は戦闘ログに表示されます。

```js
window.GameContentEffects = window.GameContentEffects || {};
window.GameContentEffects.damage = (context, effect) => {
  for (const target of context.targets) {
    target.hp = Math.max(0, target.hp - effect.amount);
  }
  return "対象にダメージを与えた";
};
```

効果ハンドラーはゲームコアを変更せず追加できます。ハンドラーは戦闘状態を直接操作できるため、HPやカードの山札などの整合性を保ってください。

現在の共有効果: `damage`（ダメージ）、`block`（ブロック付与）、`draw`（ドロー）、`strength`（筋力付与）。筋力効果はプレイヤーに付与し、自分のターン開始時に1ずつ減衰する一時筋力として扱います。

灰路の剣士向けのタグ連携効果には、`conditional_damage` / `conditional_draw`（今ターンに指定タグを使用済みなら追加効果）、`draw_if_hand_has_tags`（手札に指定タグがそろっていればエネルギーとカードを得る）、`damage_per_hand_tag` / `block_per_hand_tag`（手札の指定タグ数に応じて効果量を決める）があります。使用済みタグは `state.playedCardTagsThisTurn` に記録され、ターン開始時にリセットされます。

`damage_equal_block` はプレイヤーのブロック値と効果の `amount` を合計したダメージを与えます。`player_block` はカードの対象に関係なくプレイヤー自身にブロックを付与し、`spend_block_for_damage` はプレイヤーのブロックを全て消費して、その値と指定ボーナス分のダメージを与えます。

吸血鬼専用の `lifesteal` は、敵に与えた実ダメージ分だけHPを回復します。`summon_bat` は戦闘状態に蝙蝠を追加し、`bat_strike` と `bat_absorb` は蝙蝠を1匹消費して攻撃または回復します。蝙蝠を必要とするカードはカード定義に `requires: { bats: 1 }` を指定します。

永続カードはカード定義の `triggers.onPlayerTurnStart` または `triggers.onCardPlayed` に効果を指定します。使用すると戦闘状態の `powers` に残り、条件に合うカード使用や自分のターン開始時に効果が発動します。`onCardPlayed` の各トリガーは任意で `whenTag` を指定して対象カードを絞れます。

灰路の剣士の基礎カード「斬撃」と「防御」はそれぞれ `tags: ["strike"]`、`tags: ["defense"]` を持ちます。タグ参照効果は手札から対象を数え、変換後も対応するタグを引き継ぎます。
