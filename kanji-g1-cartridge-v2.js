(function() {
  'use strict';

  const SMALL_Y_KANA = new Set(['ゃ', 'ゅ', 'ょ']);
  const DIGRAPH_ROMAJI = {
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  };
  const KANA_ROMAJI = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  };

  // [kanji, hiragana, english, tier]
  const KANJI = [
    ['一', 'いち', 'one', 'core'],
    ['右', 'みぎ', 'right', 'core'],
    ['雨', 'あめ', 'rain', 'core'],
    ['円', 'えん', 'yen', 'core'],
    ['王', 'おう', 'king', 'regular'],
    ['音', 'おと', 'sound', 'core'],
    ['下', 'した', 'down', 'core'],
    ['火', 'ひ', 'fire', 'core'],
    ['花', 'はな', 'flower', 'core'],
    ['貝', 'かい', 'shell', 'regular'],
    ['学', 'がく', 'study', 'core'],
    ['気', 'き', 'spirit', 'core'],
    ['九', 'きゅう', 'nine', 'core'],
    ['休', 'やすむ', 'rest', 'core'],
    ['玉', 'たま', 'jewel', 'regular'],
    ['金', 'かね', 'gold', 'core'],
    ['空', 'そら', 'sky', 'core'],
    ['月', 'つき', 'moon', 'core'],
    ['犬', 'いぬ', 'dog', 'core'],
    ['見', 'みる', 'see', 'core'],
    ['五', 'ご', 'five', 'core'],
    ['口', 'くち', 'mouth', 'core'],
    ['校', 'こう', 'school', 'core'],
    ['左', 'ひだり', 'left', 'core'],
    ['三', 'さん', 'three', 'core'],
    ['山', 'やま', 'mountain', 'core'],
    ['子', 'こ', 'child', 'core'],
    ['四', 'し', 'four', 'core'],
    ['糸', 'いと', 'thread', 'regular'],
    ['字', 'じ', 'character', 'core'],
    ['耳', 'みみ', 'ear', 'core'],
    ['七', 'しち', 'seven', 'core'],
    ['車', 'くるま', 'car', 'core'],
    ['手', 'て', 'hand', 'core'],
    ['十', 'じゅう', 'ten', 'core'],
    ['出', 'でる', 'exit', 'core'],
    ['女', 'おんな', 'woman', 'core'],
    ['小', 'ちいさい', 'small', 'core'],
    ['上', 'うえ', 'up', 'core'],
    ['森', 'もり', 'forest', 'regular'],
    ['人', 'ひと', 'person', 'core'],
    ['水', 'みず', 'water', 'core'],
    ['正', 'ただしい', 'correct', 'regular'],
    ['生', 'せい', 'life', 'core'],
    ['青', 'あお', 'blue', 'core'],
    ['夕', 'ゆう', 'evening', 'regular'],
    ['石', 'いし', 'stone', 'regular'],
    ['赤', 'あか', 'red', 'core'],
    ['千', 'せん', 'thousand', 'core'],
    ['川', 'かわ', 'river', 'core'],
    ['先', 'さき', 'ahead', 'core'],
    ['早', 'はやい', 'early', 'core'],
    ['草', 'くさ', 'grass', 'regular'],
    ['足', 'あし', 'foot', 'core'],
    ['村', 'むら', 'village', 'regular'],
    ['大', 'おおきい', 'big', 'core'],
    ['男', 'おとこ', 'man', 'core'],
    ['竹', 'たけ', 'bamboo', 'regular'],
    ['中', 'なか', 'middle', 'core'],
    ['虫', 'むし', 'insect', 'regular'],
    ['町', 'まち', 'town', 'regular'],
    ['天', 'てん', 'sky', 'core'],
    ['田', 'た', 'field', 'regular'],
    ['土', 'つち', 'soil', 'core'],
    ['二', 'に', 'two', 'core'],
    ['日', 'ひ', 'day', 'core'],
    ['入', 'いる', 'enter', 'core'],
    ['年', 'とし', 'year', 'core'],
    ['白', 'しろ', 'white', 'core'],
    ['八', 'はち', 'eight', 'core'],
    ['百', 'ひゃく', 'hundred', 'core'],
    ['文', 'ぶん', 'sentence', 'regular'],
    ['木', 'き', 'tree', 'core'],
    ['本', 'ほん', 'book', 'core'],
    ['名', 'な', 'name', 'core'],
    ['目', 'め', 'eye', 'core'],
    ['立', 'たつ', 'stand', 'regular'],
    ['力', 'ちから', 'power', 'core'],
    ['林', 'はやし', 'grove', 'regular'],
    ['六', 'ろく', 'six', 'core'],
  ];

  // [compound, hiragana, english, tier]
  const COMPOUNDS = [
    ['一月', 'いちがつ', 'January', 'core'],
    ['一人', 'ひとり', 'one person', 'core'],
    ['一日', 'いちにち', 'one day', 'core'],
    ['右手', 'みぎて', 'right hand', 'core'],
    ['雨水', 'あまみず', 'rainwater', 'regular'],
    ['雨天', 'うてん', 'rainy weather', 'regular'],
    ['王子', 'おうじ', 'prince', 'regular'],
    ['下手', 'へた', 'unskillful', 'regular'],
    ['下町', 'したまち', 'old downtown', 'regular'],
    ['火山', 'かざん', 'volcano', 'core'],
    ['花火', 'はなび', 'fireworks', 'core'],
    ['花見', 'はなみ', 'flower viewing', 'regular'],
    ['学校', 'がっこう', 'school', 'core'],
    ['学生', 'がくせい', 'student', 'core'],
    ['学年', 'がくねん', 'school year', 'core'],
    ['休日', 'きゅうじつ', 'holiday', 'core'],
    ['九月', 'くがつ', 'September', 'core'],
    ['空気', 'くうき', 'air', 'core'],
    ['見学', 'けんがく', 'field trip', 'regular'],
    ['見本', 'みほん', 'sample', 'regular'],
    ['五月', 'ごがつ', 'May', 'core'],
    ['五人', 'ごにん', 'five people', 'core'],
    ['左右', 'さゆう', 'left and right', 'core'],
    ['左手', 'ひだりて', 'left hand', 'core'],
    ['三月', 'さんがつ', 'March', 'core'],
    ['三人', 'さんにん', 'three people', 'core'],
    ['三千', 'さんぜん', 'three thousand', 'regular'],
    ['三百', 'さんびゃく', 'three hundred', 'regular'],
    ['山川', 'やまかわ', 'mountains and rivers', 'regular'],
    ['四月', 'しがつ', 'April', 'core'],
    ['子犬', 'こいぬ', 'puppy', 'core'],
    ['糸口', 'いとぐち', 'clue', 'regular'],
    ['七月', 'しちがつ', 'July', 'core'],
    ['七夕', 'たなばた', 'Star Festival', 'regular'],
    ['十月', 'じゅうがつ', 'October', 'core'],
    ['出口', 'でぐち', 'exit', 'core'],
    ['女王', 'じょおう', 'queen', 'regular'],
    ['女子', 'じょし', 'girl', 'core'],
    ['小学校', 'しょうがっこう', 'elementary school', 'core'],
    ['小川', 'おがわ', 'stream', 'regular'],
    ['上下', 'じょうげ', 'up and down', 'core'],
    ['上手', 'じょうず', 'skillful', 'regular'],
    ['森林', 'しんりん', 'forest', 'regular'],
    ['人口', 'じんこう', 'population', 'regular'],
    ['水田', 'すいでん', 'rice paddy', 'regular'],
    ['正月', 'しょうがつ', 'New Year', 'core'],
    ['生花', 'せいか', 'fresh flowers', 'regular'],
    ['青空', 'あおぞら', 'blue sky', 'core'],
    ['青年', 'せいねん', 'youth', 'regular'],
    ['赤字', 'あかじ', 'deficit', 'regular'],
    ['先月', 'せんげつ', 'last month', 'core'],
    ['先生', 'せんせい', 'teacher', 'core'],
    ['先日', 'せんじつ', 'the other day', 'regular'],
    ['千円', 'せんえん', '1000 yen', 'core'],
    ['千人', 'せんにん', '1000 people', 'regular'],
    ['川上', 'かわかみ', 'upstream', 'regular'],
    ['早耳', 'はやみみ', 'keen ears', 'regular'],
    ['草花', 'くさばな', 'flowers and grasses', 'regular'],
    ['足音', 'あしおと', 'footsteps', 'regular'],
    ['村人', 'むらびと', 'villager', 'regular'],
    ['大雨', 'おおあめ', 'heavy rain', 'core'],
    ['大学', 'だいがく', 'university', 'regular'],
    ['大人', 'おとな', 'adult', 'core'],
    ['大木', 'たいぼく', 'large tree', 'regular'],
    ['男子', 'だんし', 'boy', 'core'],
    ['竹林', 'ちくりん', 'bamboo grove', 'regular'],
    ['中学校', 'ちゅうがっこう', 'middle school', 'regular'],
    ['町中', 'まちなか', 'in town', 'regular'],
    ['天気', 'てんき', 'weather', 'core'],
    ['二月', 'にがつ', 'February', 'core'],
    ['二十', 'にじゅう', 'twenty', 'core'],
    ['二人', 'ふたり', 'two people', 'core'],
    ['日中', 'にっちゅう', 'daytime', 'regular'],
    ['日本', 'にほん', 'Japan', 'core'],
    ['日本人', 'にほんじん', 'Japanese person', 'core'],
    ['入学', 'にゅうがく', 'enrollment', 'regular'],
    ['入口', 'いりぐち', 'entrance', 'core'],
    ['八月', 'はちがつ', 'August', 'core'],
    ['百円', 'ひゃくえん', '100 yen', 'core'],
    ['百人', 'ひゃくにん', '100 people', 'regular'],
    ['文字', 'もじ', 'letter', 'core'],
    ['名人', 'めいじん', 'master', 'regular'],
    ['目玉', 'めだま', 'eyeball', 'regular'],
    ['夕日', 'ゆうひ', 'setting sun', 'core'],
    ['六月', 'ろくがつ', 'June', 'core'],
    ['六百', 'ろっぴゃく', 'six hundred', 'regular'],
    ['一年', 'いちねん', 'first year', 'core'],
    ['二年', 'にねん', 'second year', 'core'],
    ['三年', 'さんねん', 'third year', 'core'],
    ['四年', 'よねん', 'fourth year', 'core'],
    ['五年', 'ごねん', 'fifth year', 'core'],
    ['六年', 'ろくねん', 'sixth year', 'core'],
    ['七年', 'しちねん', 'seven years', 'regular'],
    ['八年', 'はちねん', 'eight years', 'regular'],
    ['一円', 'いちえん', '1 yen', 'core'],
    ['二円', 'にえん', '2 yen', 'core'],
    ['三円', 'さんえん', '3 yen', 'core'],
    ['四円', 'よえん', '4 yen', 'core'],
    ['五円', 'ごえん', '5 yen', 'core'],
    ['六円', 'ろくえん', '6 yen', 'core'],
  ];

  function shuffleArr(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function toRomaji(word) {
    const chars = [...String(word || '')];
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const pair = ch + (chars[i + 1] || '');
      if (ch === 'っ') {
        const nextPair = (chars[i + 1] || '') + (chars[i + 2] || '');
        const nextRomaji = DIGRAPH_ROMAJI[nextPair] || KANA_ROMAJI[chars[i + 1]] || '';
        out += nextRomaji ? nextRomaji.charAt(0) : 't';
        continue;
      }
      if (DIGRAPH_ROMAJI[pair]) {
        out += DIGRAPH_ROMAJI[pair];
        i++;
        continue;
      }
      if (SMALL_Y_KANA.has(ch)) continue;
      out += KANA_ROMAJI[ch] || ch;
    }
    return out;
  }

  function kanjiId(char) {
    return 'k-' + char.codePointAt(0).toString(16);
  }

  function compoundId(chars) {
    return 'kc-' + [...chars].map(char => char.codePointAt(0).toString(16)).join('-');
  }

  function pickWrongs(pool, correctValue, count) {
    return shuffleArr(unique(pool).filter(value => value !== correctValue)).slice(0, count);
  }

  function buildChain(prompt, reading, meaning, pools) {
    const romaji = toRomaji(reading);
    return [
      {
        type: 'kanji-to-furigana',
        prompt: prompt,
        correct: reading,
        wrong: pickWrongs(pools.readings, reading, 2),
      },
      {
        type: 'furigana-to-romaji',
        prompt: reading,
        correct: romaji,
        wrong: pickWrongs(pools.romaji, romaji, 2),
      },
      {
        type: 'romaji-to-english',
        prompt: romaji,
        correct: meaning,
        wrong: pickWrongs(pools.meanings, meaning, 2),
      },
      {
        type: 'kanji-to-english',
        prompt: prompt,
        correct: meaning,
        wrong: pickWrongs(pools.meanings, meaning, 2),
      },
    ];
  }

  function buildCommands() {
    const kanjiPools = {
      readings: KANJI.map(row => row[1]),
      romaji: KANJI.map(row => toRomaji(row[1])),
      meanings: KANJI.map(row => row[2]),
    };
    const compoundPools = {
      readings: COMPOUNDS.map(row => row[1]),
      romaji: COMPOUNDS.map(row => toRomaji(row[1])),
      meanings: COMPOUNDS.map(row => row[2]),
    };

    const kanjiCommands = KANJI.map(([kanji, reading, meaning, tier]) => ({
      id: kanjiId(kanji),
      action: meaning,
      tier: tier,
      dom: 'g1',
      latex: kanji,
      chain: buildChain(kanji, reading, meaning, kanjiPools),
    }));

    const compoundCommands = COMPOUNDS.map(([compound, reading, meaning, tier]) => ({
      id: compoundId(compound),
      action: meaning,
      tier: tier,
      dom: 'g1',
      latex: compound,
      chain: buildChain(compound, reading, meaning, compoundPools),
      requires: unique([...compound].map(kanjiId)),
    }));

    return kanjiCommands.concat(compoundCommands);
  }

  function buildExplanationBank() {
    return { byId: {}, byLabel: {} };
  }

  window.KANJI_G1_DATA = {
    id: 'g1',
    name: 'Grade 1',
    domLabels: { g1: ['Grade 1 (一年)'] },
    commands: buildCommands(),
    kanaRomaji: KANA_ROMAJI,
    digraphRomaji: DIGRAPH_ROMAJI,
    variableBank: {},
    applicationBank: {},
    relationshipBank: {},
    explanationGlossary: [],
    autoBlankSpecs: [],
    sharedPrereqNodes: {},
    normalizeExplanationLookup: function(label) {
      return String(label || '').toLowerCase().trim();
    },
    buildExplanationBank: buildExplanationBank,
    wireL1toL2: function() {},
  };
})();
