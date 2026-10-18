# キャラクター強化ツリー

`trees.js` の `window.GameContent.upgradeTrees` にキャラクターごとのノードを定義します。各ノードは `id`、`name`、`description`、`cost`、任意の `requires`、`rewardType`（`card` または `relic`）、`rewardId` を持ちます。

解放済みノードと星のかけらはブラウザーの `localStorage` に保存され、冒険をまたいで残ります。カード報酬やショップには、ツリーで解放されたカードだけが候補に加わります。ツリー解放レリックは対応キャラクターのショップと強敵報酬に加わります。
