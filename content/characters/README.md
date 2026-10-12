# キャラクター

キャラクターごとに専用フォルダを作成します。各キャラクターのフォルダにはキャラクター定義と `cards/` を置き、そのキャラクター専用のカードを管理します。

```text
characters/<character-id>/
  character.js
  cards/
    <card-id>.js
```

カードは `window.GameContent.cards["<card-id>"]` に登録します。コンテンツ定義は利用者が編集できるリポジトリ側で管理します。
