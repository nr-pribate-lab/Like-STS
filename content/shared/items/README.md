# アイテム定義と使用処理

アイテム定義は window.GameContent.items に登録し、content/manifest.js の shared.items にファイルを追加します。アイテムIDに対応する使用関数は window.GameContentItemHandlers[itemId].use に登録します。

GameCombat.createRun(enemyId, random, relicIds, startingDeck, itemIds) に所持アイテムID配列を渡すと、戦闘状態にコピーされます。アイテム使用関数は { state, item } を受け取り、使用できた場合は { used: true, message: "..." }、使用できない場合は { used: false, message: "..." } を返します。used: true のときだけ所持リストから1個消費します。

使用可否（自分のターン中か、効果が発生するか）はゲームコアが確認します。ハンドラーは効果を適用し、使用できたかどうかを返します。アイテムの所持数はラン状態で管理し、次の戦闘の createRun に引き継いでください。

基本の所持上限は3個です。所持品へ加えるときは GameCombat.addItemToInventory(itemIds, itemId, capacity) を使い、戻り値が false の場合は上限到達などにより追加できません。容量を増やすレリックは定義に itemCapacityBonus（0以上の整数）を持たせます。GameCombat.getItemCapacity(relicIds) がレリック分を加算した上限を返します。

アイテムの基本的な入手経路は、村で購入して冒険へ持ち込む、冒険途中のショップで購入する、イベントで偶然入手する、の3つです。

回復薬（item_healing_potion）はHPを20回復し、価格は40です。購入処理には GameCombat.purchaseItem(owner, itemId, capacity) を使います。owner は gold と itemIds を持つオブジェクトです。所持数に空きがあり、所持金が価格以上の場合に購入し、成功すると所持金を減らしてアイテムを1個追加します。

活力薬（item_energy_tonic）は自分のターン中に使うと、このターンのエネルギーを1増やします。価格は30です。

護りの薬（item_guarding_tonic）は自分のターン中に使うと8ブロックを得ます。価格は30です。

追加の共通アイテムは、閃光弾（item_flash_bomb：全敵に10ダメージ、45$）、猛りの霊薬（item_berserker_draught：このターン筋力+3、45$）、追い風の巻物（item_draw_scroll：2枚ドロー、40$）、清めの煙（item_purifying_smoke：弱体解除、25$）、黒砂時計（item_black_sand：選択中の敵の次の行動を1回阻止、50$）、幸運の欠片（item_lucky_shard：ラン中ゴールド+15、35$）、呼び戻しの羽（item_recall_feather：捨て札からランダムに1枚手札へ戻す、35$）、砕き膏（item_shatter_paste：選択中の敵のブロックを解除、30$）です。いずれも一度使うと消費されます。
