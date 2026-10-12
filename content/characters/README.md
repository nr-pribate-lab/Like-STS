# キャラクター

キャラクターごとに専用フォルダを作成します。各キャラクターのフォルダにはキャラクター定義と `cards/` を置き、そのキャラクター専用のカードを管理します。

```text
characters/<character-id>/
  character.js
  cards/
    <card-id>/
      <card-id>.js
      assets/              そのカード専用の画像など
  assets/                  そのキャラクター共通の画像など
```

カードは所属キャラクター定義の `cards` に登録します。たとえば `window.GameContent.characters["character_ash_swordsman"].cards["card_ash_slash"]` のように、キャラクターごとに名前空間を分けます。カードの素材はカード専用フォルダの `assets/` に置き、キャラクター共通の素材はキャラクターフォルダ直下の `assets/` に置きます。新しいカードファイルは `content/manifest.js` の該当キャラクターの `cards` 一覧にも登録してください。
