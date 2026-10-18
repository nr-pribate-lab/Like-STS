# 敵の定義

敵は `content/shared/enemies/` にJavaScript定義を置き、`content/manifest.js` の `shared.enemies` に登録します。各定義は一意な `id`、表示用の `name` と `description`、`maxHp`、`rank`、`actions` 配列を持ちます。

`actions` は敵の行動順です。戦闘中は配列の現在位置の行動を予告し、敵ターンに生存している敵を編成順に1体ずつ行動させます。敵が倒れるとその敵の行動は飛ばします。配列の最後まで進むと先頭へ戻ります。

標準行動は以下の通りです。数値は1以上の整数です。

- `{ type: "attack", amount, description }`：プレイヤーを攻撃する。
- `{ type: "defend", amount, description }`：敵自身がブロックを得る。
- `{ type: "strengthen", amount, description }`：敵自身の以後の攻撃を強化する。
- `{ type: "weaken", amount, description }`：プレイヤーの攻撃を `amount` ターン弱める。

未登録の `type` は `window.GameContentEnemyActions[type]` に関数を登録すると独自行動として解決できます。関数は `{ state, enemy, action }` を受け取り、ログ用の文字列を返します。

戦闘地点の `enemyIds` は編成順の配列です。カードの `target` は `enemy`（選択した敵1体）、`all_enemies`（生存中の敵全員）、`self`、`none` を指定できます。
