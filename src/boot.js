(() => {
  const manifest = window.GameContentManifest;
  const errorBox = document.getElementById("boot-error");

  function showLoadError(message) {
    console.error(message);
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function getContentFiles() {
    if (!manifest) throw new Error("content/manifest.js を読み込めません。");
    if (!Array.isArray(manifest.characters)) throw new Error("manifest.characters は配列で定義してください。");

    const shared = manifest.shared || {};
    const files = [
      ...(shared.effects || []),
      ...(shared.relics || []),
      ...(shared.relicHandlers || []),
      ...(shared.items || []),
      ...(shared.itemHandlers || []),
      ...(shared.enemies || []),
      ...(shared.stages || []),
      ...(shared.mapNodes || []),
      ...(shared.events || []),
      ...(shared.progression || []),
    ];

    for (const character of manifest.characters) {
      if (!character.id || !character.definition || !Array.isArray(character.cards)) {
        throw new Error("各キャラクターに id、definition、cards を定義してください。");
      }
      files.push(character.definition, ...character.cards);
    }

    if (files.some((file) => typeof file !== "string" || file.length === 0)) {
      throw new Error("マニフェストに空または不正なファイルパスがあります。");
    }
    return files;
  }

  function validateContentReferences() {
    const content = window.GameContent || {};
    const stages = content.stages || {};
    const nodes = content.mapNodes || {};
    const enemies = content.enemies || {};
    const characters = content.characters || {};
    const seenIds = new Set();
    const definitions = [
      ...Object.values(stages),
      ...Object.values(nodes),
      ...Object.values(content.events || {}),
      ...Object.values(enemies),
      ...Object.values(content.relics || {}),
      ...Object.values(content.items || {}),
      ...Object.values(characters),
      ...Object.values(characters).flatMap((character) => Object.values(character.cards || {})),
    ];

    for (const definition of definitions) {
      if (!definition.id) throw new Error("コンテンツ定義に id がありません。");
      if (seenIds.has(definition.id)) throw new Error(`コンテンツIDが重複しています: ${definition.id}`);
      seenIds.add(definition.id);
    }

    for (const stage of Object.values(stages)) {
      if (!Array.isArray(stage.nodeIds)) {
        throw new Error(`ステージ ${stage.id} に nodeIds 配列がありません。`);
      }
      for (const nodeId of stage.nodeIds) {
        const node = nodes[nodeId];
        if (!node) throw new Error(`ステージ ${stage.id} が存在しない地点IDを参照しています: ${nodeId}`);
        if (["normal_battle", "elite", "boss"].includes(node.type) && node.implemented
          && (!Array.isArray(node.enemyIds) || node.enemyIds.length === 0)) {
          throw new Error(`戦闘地点 ${nodeId} に enemyIds がありません。`);
        }
        if (node.type === "elite" && node.implemented && node.enemyIds.length !== 1) {
          throw new Error(`強敵地点 ${nodeId} は敵1体で構成してください。`);
        }
        if (node.type === "event" && node.implemented
          && (!Array.isArray(node.eventIds) || node.eventIds.length === 0)) {
          throw new Error(`イベント地点 ${nodeId} に eventIds がありません。`);
        }
        for (const eventId of node.eventIds || []) {
          if (!content.events?.[eventId]) {
            throw new Error(`地点 ${nodeId} が存在しないイベントIDを参照しています: ${eventId}`);
          }
        }
        for (const enemyId of node.enemyIds || []) {
          if (!enemies[enemyId]) {
            throw new Error(`地点 ${nodeId} が存在しない敵IDを参照しています: ${enemyId}`);
          }
        }
      }
    }

    for (const enemy of Object.values(enemies)) {
      if (!Array.isArray(enemy.actions) || enemy.actions.length === 0) {
        throw new Error(`敵 ${enemy.id} に行動配列がありません。`);
      }
      for (const action of enemy.actions) {
        if (!action.type || !action.description) {
          throw new Error(`敵 ${enemy.id} の行動に type または description がありません。`);
        }
        if (["attack", "defend", "strengthen", "weaken"].includes(action.type)
          && (!Number.isInteger(action.amount) || action.amount < 1)) {
          throw new Error(`敵 ${enemy.id} の行動 ${action.type} に1以上の整数 amount が必要です。`);
        }
      }
    }

    for (const [characterId, tree] of Object.entries(content.upgradeTrees || {})) {
      const character = characters[characterId];
      if (!character || !Array.isArray(tree)) throw new Error(`強化ツリーのキャラクター定義が不正です: ${characterId}`);
      const nodeIds = new Set(tree.map((node) => node.id));
      for (const node of tree) {
        if (!node.id || !Number.isInteger(node.cost) || node.cost < 0) throw new Error(`強化ノード ${node.id || "(idなし)"} の cost が不正です。`);
        for (const requiredId of node.requires || []) {
          if (!nodeIds.has(requiredId)) throw new Error(`強化ノード ${node.id} が存在しない前提ノードを参照しています: ${requiredId}`);
        }
        if (node.rewardType === "card" && !character.cards?.[node.rewardId]) throw new Error(`強化ノード ${node.id} が存在しないカードを参照しています: ${node.rewardId}`);
        if (node.rewardType === "relic" && !content.relics?.[node.rewardId]) throw new Error(`強化ノード ${node.id} が存在しないレリックを参照しています: ${node.rewardId}`);
        if (!["card", "relic"].includes(node.rewardType)) throw new Error(`強化ノード ${node.id} の報酬タイプが不正です。`);
      }
    }

    for (const character of Object.values(characters)) {
      for (const cardId of character.startingDeck || []) {
        if (!character.cards?.[cardId]) {
          throw new Error(`キャラクター ${character.id} が存在しないカードIDを参照しています: ${cardId}`);
        }
      }
    }
  }

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const separator = path.includes("?") ? "&" : "?";
      script.src = `${path}${separator}v=${encodeURIComponent(manifest.version || "1")}`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`コンテンツの読み込みに失敗しました: ${path}`));
      document.head.appendChild(script);
    });
  }

  async function boot() {
    try {
      for (const path of getContentFiles()) await loadScript(path);
      validateContentReferences();
      for (const path of [...(manifest.gameCore || []), ...(manifest.application || [])]) {
        await loadScript(path);
      }
    } catch (error) {
      showLoadError(`ゲームを開始できません。${error.message}`);
    }
  }

  boot();
})();
