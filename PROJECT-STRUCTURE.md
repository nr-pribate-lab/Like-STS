# プロジェクトのディレクトリ構成

`.git` の内部ファイルを除いた、現在のプロジェクト構成です。`dist/` は `build.ps1` が出力するビルド成果物です。

```text
LikeSlayTheSpire/
├── .gitignore
├── build.ps1
├── index.html
├── README.md
├── PROJECT-STRUCTURE.md
├── TODO.md
├── 要件定義.md
├── screens.css
├── styles.css
├── src/
│   ├── boot.js
│   └── main.js
├── game-core/
│   ├── README.md
│   └── combat.js
├── content/
│   ├── manifest.js
│   ├── characters/
│   │   ├── README.md
│   │   ├── ash-swordsman/
│   │   │   ├── character.js
│   │   │   └── cards/
│   │   │       ├── card_ash_slash/card_ash_slash.js
│   │   │       ├── card_defense/card_defense.js
│   │   │       ├── card_flurry/card_flurry.js
│   │   │       ├── card_focus/card_focus.js
│   │   │       ├── card_heavy_strike/card_heavy_strike.js
│   │   │       ├── card_parry/card_parry.js
│   │   │       └── card_zone/card_zone.js
│   │   └── nightborn/
│   │       ├── character.js
│   │       └── cards/
│   │           ├── card_bat_absorption.js
│   │           ├── card_bat_call.js
│   │           ├── card_bat_dive.js
│   │           ├── card_blood_frenzy.js
│   │           ├── card_blood_pact.js
│   │           ├── card_vampire_bite.js
│   │           ├── card_vampire_claw.js
│   │           └── card_vampire_guard.js
│   └── shared/
│       ├── effects/
│       │   ├── README.md
│       │   ├── bats.js
│       │   ├── block.js
│       │   ├── blood-bat.js
│       │   ├── damage.js
│       │   ├── draw.js
│       │   ├── lifesteal.js
│       │   └── strength.js
│       ├── enemies/ash-warden.js
│       ├── items/
│       │   ├── README.md
│       │   ├── energy-tonic.js
│       │   ├── guarding-tonic.js
│       │   ├── healing-potion.js
│       │   └── registry.js
│       ├── map-nodes/registry.js
│       ├── relics/
│       │   ├── README.md
│       │   ├── ember-ward.js
│       │   ├── first-flame.js
│       │   ├── foresight-compass.js
│       │   ├── power-belt.js
│       │   └── registry.js
│       └── stages/ash-corridor.js
├── docs/
│   └── P0-REMAINING.md
└── dist/  (build.ps1 の出力。現在の生成ファイル)
    ├── index.html
    ├── screens.css
    ├── styles.css
    ├── content/
    │   ├── manifest.js
    │   ├── characters/ash-swordsman/character.js
    │   ├── characters/ash-swordsman/cards/card_ash_slash/card_ash_slash.js
    │   ├── shared/effects/damage.js
    │   ├── shared/enemies/ash-warden.js
    │   ├── shared/map-nodes/registry.js
    │   ├── shared/relics/power-belt.js
    │   ├── shared/relics/registry.js
    │   └── shared/stages/ash-corridor.js
    ├── game-core/combat.js
    └── src/
        ├── boot.js
        └── main.js
```

## 主な役割

- `src/`: 画面の初期化とアプリケーション UI
- `game-core/`: 戦闘などのゲーム処理
- `content/`: キャラクター、カード、効果、敵、アイテム、レリック、マップ、ステージの定義
- `content/manifest.js`: ゲームに読み込むコンテンツの一覧
- `docs/`: 設計・作業用ドキュメント
- `dist/`: 配布向けビルドの出力先
- `build.ps1`: `dist/` を生成するビルドスクリプト
