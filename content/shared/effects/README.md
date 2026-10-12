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
