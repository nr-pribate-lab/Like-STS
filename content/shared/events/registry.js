window.GameContent = window.GameContent || {};
window.GameContent.events = window.GameContent.events || {};

window.GameContent.events.event_ash_wagon = {
  id: "event_ash_wagon",
  name: "灰道の荷車",
  description: "道端で荷車が横倒しになっている。御者は無事だが、散らばった荷を前に困り果てている。",
  choices: [
    {
      id: "take_rations",
      label: "食料を分けてもらう",
      result: "HPを12回復する。",
      aftermath: "温かな食事で疲れが和らいだ。あなたは礼を言い、再び塔への道を進む。",
      effects: [{ type: "heal", amount: 12 }],
    },
    {
      id: "sell_supplies",
      label: "荷の運び出しを手伝う",
      result: "お礼に25ゴールドを受け取る。",
      aftermath: "荷車を起こすと、御者は礼としていくらかの金貨を渡した。",
      effects: [{ type: "gold", amount: 25 }],
    },
  ],
};

window.GameContent.events.event_ember_idol = {
  id: "event_ember_idol",
  name: "熾火の石像",
  description: "灰の中に、赤い火を抱いた石像が立っている。台座には『痛みを捧げる者に、火を託す』と刻まれている。",
  choices: [
    {
      id: "offer_vitality",
      label: "体力を捧げる",
      result: "HPを10失い、熾火の護符を得る。",
      aftermath: "胸に熱が走り、石像の火は護符へと移った。",
      requirements: [{ type: "minHp", value: 11 }, { type: "notOwnedRelic", relicId: "relic_ember_ward" }],
      unavailable: "HPが足りないか、熾火の護符をすでに持っている。",
      effects: [{ type: "damage", amount: 10 }, { type: "relic", relicId: "relic_ember_ward" }],
    },
    {
      id: "search_ashes",
      label: "石像の周りを探す",
      result: "15ゴールドを見つける。",
      aftermath: "像の足元から、灰に埋もれた金貨を見つけた。火には触れず、先へ進む。",
      effects: [{ type: "gold", amount: 15 }],
    },
  ],
};

window.GameContent.events.event_wayfarer = {
  id: "event_wayfarer",
  name: "夜営の旅人",
  description: "道の脇で旅人が焚き火を囲んでいる。旅人は手当てか古いカードを、少しのゴールドと交換してくれるという。",
  choices: [
    {
      id: "buy_treatment",
      label: "手当てを頼む（20ゴールド）",
      result: "20ゴールドを払い、HPを18回復する。",
      aftermath: "旅人の手当てで傷がふさがった。焚き火に別れを告げ、旅を続ける。",
      requirements: [{ type: "minGold", value: 20 }],
      unavailable: "ゴールドが足りない。",
      effects: [{ type: "gold", amount: -20 }, { type: "heal", amount: 18 }],
    },
    {
      id: "buy_card",
      label: "古いカードを買う（20ゴールド）",
      result: "20ゴールドを払い、カードを1枚デッキに加える。",
      aftermath: "旅人は古いカードを手渡した。新たな技を胸に、あなたは再び歩き出す。",
      requirements: [{ type: "minGold", value: 20 }],
      unavailable: "ゴールドが足りない。",
      effects: [{ type: "gold", amount: -20 }, { type: "card", cardIds: { character_ash_swordsman: "card_parry", character_nightborn: "card_vampire_guard" } }],
    },
  ],
};

window.GameContent.events.event_ash_card_broker = {
  id: "event_ash_card_broker",
  name: "灰市の交換人",
  description: "旅装の交換人が、あなたのデッキから一枚を選ぶなら金貨を渡すと持ちかけてきた。",
  choices: [
    {
      id: "trade_card_for_gold",
      label: "カードを一枚渡す",
      result: "選んだカードをデッキから除き、35ゴールドを得る。",
      aftermath: "交換人はカードを丁寧に包み、代わりの金貨を手渡した。",
      requirements: [{ type: "minDeckCards", value: 2 }],
      unavailable: "交換に出せるカードがありません。",
      effects: [{ type: "removeSelectedCard" }, { type: "gold", amount: 35 }],
    },
    {
      id: "leave_broker",
      label: "取引せずに別れる",
      result: "カードもゴールドも変化しない。",
      aftermath: "互いに礼をして、別々の道を歩き出した。",
      effects: [],
    },
  ],
};

window.GameContent.events.event_ash_ally_gift = {
  id: "event_ash_ally_gift",
  name: "灰路の援軍",
  description: "灰の獣に追われた旅人を助けると、かつて塔へ挑んだ剣士が現れた。あなたの戦い方に合わせた技を教えてくれる。",
  choices: [
    {
      id: "learn_ally_technique",
      label: "技を教わる",
      result: "現在のキャラクターに合ったカードを1枚デッキに加える。",
      aftermath: "剣士はあなたの構えを見て、すぐに使える技を伝授した。",
      effects: [{ type: "card", cardIds: { character_ash_swordsman: "card_riposte", character_nightborn: "card_bat_dive", character_sera: "card_sera_signal" } }],
    },
    {
      id: "thank_ally",
      label: "礼を言って先を急ぐ",
      result: "デッキは変化しない。",
      aftermath: "旅人を送り届け、剣士に礼を告げて道へ戻った。",
      effects: [],
    },
  ],
};

window.GameContent.events.event_ash_duelist = {
  id: "event_ash_duelist",
  name: "灰冠の決闘者",
  description: "灰冠の執行者が道を塞ぎ、腕試しを求めている。勝負を受けるか、争いを避けるか選べる。",
  choices: [
    {
      id: "accept_duel",
      label: "決闘を受ける",
      result: "灰冠の執行者と戦う。勝てば強敵相応の報酬を得る。",
      aftermath: "執行者は剣を抜き、正面から一騎打ちを挑んできた。",
      effects: [{ type: "eliteBattle", enemyId: "enemy_ash_champion" }],
    },
    {
      id: "avoid_duel",
      label: "戦いを避けて迂回する",
      result: "戦闘は起きず、報酬も発生しない。",
      aftermath: "相手の隙を見て脇道へ抜け、無用な消耗を避けた。",
      effects: [],
    },
  ],
};

window.GameContent.events.event_ash_companion_return = {
  id: "event_ash_companion_return",
  companionId: "sera",
  name: "再会した旅人セラ",
  description: "以前助けた旅人セラが、灰の回廊で再びあなたを待っていた。",
  choices: [
    {
      id: "invite_sera",
      label: "一緒に塔を登ろうと誘う",
      result: "セラが仲間になり、以後の各ターン開始時に4ブロックを与えるレリックを得る。",
      aftermath: "セラはうなずき、あなたの旅に加わった。戦いでは合図を送り、守りを助けてくれる。",
      requirements: [{ type: "minCompanionMeetings", companionId: "sera", value: 1 }, { type: "notOwnedRelic", relicId: "relic_sera_signal" }],
      unavailable: "セラとはまだ会っていないか、すでに仲間になっている。",
      effects: [{ type: "companionMeeting", companionId: "sera" }, { type: "relic", relicId: "relic_sera_signal" }],
    },
    {
      id: "part_from_sera",
      label: "互いの道を進む",
      result: "追加の報酬はない。",
      aftermath: "セラと無事を祈り合い、それぞれの目的地へ向かった。",
      effects: [{ type: "companionMeeting", companionId: "sera" }],
    },
  ],
};

window.GameContent.events.event_ash_sera_first_meeting = {
  id: "event_ash_sera_first_meeting",
  companionId: "sera",
  name: "灰道の旅人セラ",
  description: "倒れた荷車のそばで、旅人セラが怪我人の手当てをしている。手を貸せば、また会う約束ができそうだ。",
  choices: [
    {
      id: "help_sera",
      label: "手当てを手伝う",
      result: "HPを6回復し、セラとの出会いを記録する。",
      aftermath: "手当てを終えると、セラは回廊の先で再会したら一緒に進もうと約束した。",
      effects: [{ type: "heal", amount: 6 }, { type: "companionMeeting", companionId: "sera" }],
    },
    {
      id: "share_supplies_sera",
      label: "薬を分ける",
      result: "10ゴールドを払い、セラとの出会いを記録する。",
      aftermath: "薬を受け取ったセラは礼を言い、先の道で再会する約束をした。",
      requirements: [{ type: "minGold", value: 10 }],
      unavailable: "ゴールドが足りない。",
      effects: [{ type: "gold", amount: -10 }, { type: "companionMeeting", companionId: "sera" }],
    },
  ],
};

window.GameContent.events.event_ash_sera_third_meeting = {
  id: "event_ash_sera_third_meeting",
  companionId: "sera",
  name: "三度目の再会",
  description: "セラはあなたとの約束を守り、灰の回廊で待っていた。三度目の再会を経て、彼女は町で薬屋を開くことを決めた。",
  choices: [
    {
      id: "sera_joins_as_character",
      label: "町で薬屋を開くよう勧める",
      result: "三度目の出会いを記録する。町に戻るとセラの薬屋が開く。",
      aftermath: "セラは町で薬屋を始めることにした。薬屋で星のかけらを合計10個分使うと、彼女を冒険者として選べるようになる。",
      requirements: [{ type: "minCompanionMeetings", companionId: "sera", value: 2 }],
      unavailable: "まだセラとの出会いを重ねていない。",
      effects: [{ type: "companionMeeting", companionId: "sera" }],
    },
    {
      id: "sera_third_goodbye",
      label: "互いの旅路を祈って別れる",
      result: "三度目の出会いを記録する。町に戻るとセラの薬屋が開く。",
      aftermath: "セラは自分の旅を続けることにした。いつかまた道が交わるかもしれない。",
      effects: [{ type: "companionMeeting", companionId: "sera" }],
    },
  ],
};
