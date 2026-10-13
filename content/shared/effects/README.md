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

吸血鬼専用の `lifesteal` は、敵に与えた実ダメージ分だけHPを回復します。`summon_bat` は戦闘状態に蝙蝠を追加し、`bat_strike` と `bat_absorb` は蝙蝠を1匹消費して攻撃または回復します。蝙蝠を必要とするカードはカード定義に `requires: { bats: 1 }` を指定します。

永続カードはカード定義の `triggers.onPlayerTurnStart` に効果を指定します。使用すると戦闘状態の `powers` に残り、次の自分のターン開始時から毎回効果が発動します。
