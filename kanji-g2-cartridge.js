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

  const G1_KANJI = new Set('一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六'.split('').map(kanjiId));

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
      { type: 'kanji-to-furigana', prompt: prompt, correct: reading, wrong: pickWrongs(pools.readings, reading, 2) },
      { type: 'furigana-to-romaji', prompt: reading, correct: romaji, wrong: pickWrongs(pools.romaji, romaji, 2) },
      { type: 'romaji-to-english', prompt: romaji, correct: meaning, wrong: pickWrongs(pools.meanings, meaning, 2) },
      { type: 'kanji-to-english', prompt: prompt, correct: meaning, wrong: pickWrongs(pools.meanings, meaning, 2) },
    ];
  }

  const KANJI = [
    ["刀","かたな","sword","regular"],
    ["丸","まる","round; circle","regular"],
    ["弓","ゆみ","bow","regular"],
    ["工","こう","craft; construction","core"],
    ["才","さい","talent","regular"],
    ["万","まん","ten thousand","core"],
    ["引","ひく","pull","core"],
    ["牛","うし","cow","regular"],
    ["元","もと","origin","core"],
    ["戸","と","door","regular"],
    ["午","ご","noon","regular"],
    ["公","おおやけ","public","core"],
    ["今","いま","now","core"],
    ["止","とまる","stop","core"],
    ["少","すこし","few; little","core"],
    ["心","こころ","heart","core"],
    ["切","きる","cut; important","core"],
    ["太","ふとい","thick; big","regular"],
    ["内","うち","inside","core"],
    ["父","ちち","father","regular"],
    ["分","わける","part; minute","core"],
    ["方","かた","direction; way","core"],
    ["毛","け","fur; hair","regular"],
    ["友","とも","friend","core"],
    ["外","そと","outside","core"],
    ["兄","あに","older brother","regular"],
    ["古","ふるい","old","regular"],
    ["広","ひろい","wide","regular"],
    ["市","いち","city; market","regular"],
    ["矢","や","arrow","regular"],
    ["台","だい","stand; platform","regular"],
    ["冬","ふゆ","winter","core"],
    ["半","なかば","half","core"],
    ["母","はは","mother","regular"],
    ["北","きた","north","regular"],
    ["用","もちいる","use","core"],
    ["羽","は","feather; wing","regular"],
    ["回","まわる","times; turn","core"],
    ["会","あう","meet; association","core"],
    ["交","まじわる","mix; exchange","core"],
    ["光","ひかる","light","core"],
    ["考","かんがえる","think; consider","core"],
    ["行","いく","go; line","core"],
    ["合","あう","fit; join","core"],
    ["寺","てら","temple","regular"],
    ["自","みずから","self","core"],
    ["色","いろ","color","core"],
    ["西","にし","west","regular"],
    ["多","おおい","many","core"],
    ["地","ち","ground; area","core"],
    ["池","いけ","pond; pool","regular"],
    ["当","あたる","this; hit","core"],
    ["同","おなじ","same","core"],
    ["肉","にく","meat","regular"],
    ["米","こめ","rice","regular"],
    ["毎","まい","every","core"],
    ["何","なに","what","core"],
    ["角","かど","horn; angle","regular"],
    ["汽","き","steam","regular"],
    ["近","ちかい","near","core"],
    ["形","かたち","shape","regular"],
    ["言","いう","say; word","core"],
    ["谷","たに","valley","regular"],
    ["作","つくる","make","core"],
    ["社","やしろ","shrine; company","regular"],
    ["図","はかる","diagram; plan","regular"],
    ["声","こえ","voice","core"],
    ["走","はしる","run","core"],
    ["体","からだ","body","core"],
    ["弟","おとうと","younger brother","regular"],
    ["売","うる","sell","core"],
    ["麦","むぎ","barley","regular"],
    ["来","くる","come","core"],
    ["里","さと","village","regular"],
    ["画","えがく","picture; draw","regular"],
    ["岩","いわ","boulder","regular"],
    ["京","きょう","capital","regular"],
    ["国","くに","country","core"],
    ["姉","あね","older sister","regular"],
    ["知","しる","know","core"],
    ["長","ながい","long; leader","core"],
    ["直","なおす","straight; fix","regular"],
    ["店","みせ","shop","core"],
    ["東","ひがし","east","core"],
    ["歩","あるく","walk; step","core"],
    ["妹","いもうと","younger sister","regular"],
    ["明","あかるい","bright","core"],
    ["門","かど","gate","core"],
    ["夜","よる","night","core"],
    ["科","か","subject","regular"],
    ["海","うみ","sea","core"],
    ["活","かつ","lively; life","core"],
    ["計","はかる","measure; plan","core"],
    ["後","あと","after; behind","core"],
    ["思","おもう","think","core"],
    ["室","むろ","room","core"],
    ["首","くび","neck; head","regular"],
    ["秋","あき","autumn","core"],
    ["春","はる","spring","core"],
    ["食","たべる","eat; food","core"],
    ["星","ほし","star","regular"],
    ["前","まえ","front; before","core"],
    ["茶","ちゃ","tea","regular"],
    ["昼","ひる","noon; daytime","regular"],
    ["点","てん","point; dot","regular"],
    ["南","みなみ","south","regular"],
    ["風","かぜ","wind","core"],
    ["夏","なつ","summer","core"],
    ["家","いえ","house; home","core"],
    ["記","しるす","write down; record","core"],
    ["帰","かえる","return","core"],
    ["原","はら","field; original","core"],
    ["高","たかい","high","core"],
    ["紙","かみ","paper","core"],
    ["時","とき","time","core"],
    ["弱","よわい","weak","regular"],
    ["書","かく","write; book","core"],
    ["通","かよう","pass; commute","core"],
    ["馬","うま","horse","regular"],
    ["魚","うお","fish","regular"],
    ["強","つよい","strong","core"],
    ["教","おしえる","teach","core"],
    ["黄","き","yellow","regular"],
    ["黒","くろ","black","regular"],
    ["細","ほそい","thin; fine","regular"],
    ["週","しゅう","week","core"],
    ["雪","ゆき","snow","regular"],
    ["船","ふね","boat","regular"],
    ["組","くむ","group; class","regular"],
    ["鳥","とり","bird","regular"],
    ["野","の","field; wild","regular"],
    ["理","り","reason; logic","regular"],
    ["雲","くも","cloud","regular"],
    ["絵","え","picture","regular"],
    ["間","あいだ","interval; space","core"],
    ["場","ば","place","core"],
    ["晴","はれる","clear weather","regular"],
    ["朝","あさ","morning","core"],
    ["答","こたえる","answer","core"],
    ["道","みち","road; way","core"],
    ["買","かう","buy","core"],
    ["番","ばん","turn; number","regular"],
    ["園","その","garden; park","regular"],
    ["遠","とおい","far","core"],
    ["楽","たのしい","music; ease","core"],
    ["新","あたらしい","new","core"],
    ["数","かず","number; count","core"],
    ["電","でん","electricity","core"],
    ["話","はなす","talk","core"],
    ["歌","うた","song","regular"],
    ["語","かたる","language","core"],
    ["算","さん","calculate","core"],
    ["読","よむ","read","core"],
    ["聞","きく","hear; ask","core"],
    ["鳴","なく","chirp; ring","regular"],
    ["線","せん","line","regular"],
    ["親","おや","parent; close","core"],
    ["頭","あたま","head","regular"],
    ["顔","かお","face","regular"],
    ["曜","よう","weekday","regular"],
  ];

  const COMPOUNDS = [
    ["丸太","まるた","log","regular"],
    ["弓道","きゅうどう","archery","regular"],
    ["万円","まんえん","ten thousand yen","regular"],
    ["引力","いんりょく","gravity","regular"],
    ["牛肉","ぎゅうにく","beef","regular"],
    ["元気","げんき","energetic; well","regular"],
    ["戸口","ここう","doorway","regular"],
    ["午前","ごぜん","morning","regular"],
    ["公園","こうえん","park","regular"],
    ["今週","こんしゅう","this week","regular"],
    ["中止","ちゅうし","cancellation","regular"],
    ["少年","しょうねん","boy","regular"],
    ["大切","たいせつ","important","regular"],
    ["内科","ないか","internal medicine","regular"],
    ["父母","ふぼ","parents","regular"],
    ["分数","ぶんすう","fraction","regular"],
    ["毛糸","けいと","yarn","regular"],
    ["外国","がいこく","foreign country","regular"],
    ["兄弟","きょうだい","siblings","regular"],
    ["広場","ひろば","plaza","regular"],
    ["市場","いちば","market","regular"],
    ["台風","たいふう","typhoon","regular"],
    ["冬休み","ふゆやすみ","winter vacation","regular"],
    ["半分","はんぶん","half","regular"],
    ["母親","ははおや","mother","regular"],
    ["北国","きたぐに","northern land","regular"],
    ["羽毛","うもう","down feathers","regular"],
    ["回る","まわる","turn","regular"],
    ["会話","かいわ","conversation","regular"],
    ["交通","こうつう","traffic","regular"],
    ["光線","こうせん","ray","regular"],
    ["考える","かんがえる","think","regular"],
    ["合図","あいず","signal","regular"],
    ["お寺","おてら","temple","regular"],
    ["自分","じぶん","oneself","regular"],
    ["茶色","ちゃいろ","brown","regular"],
    ["西口","にしぐち","west exit","regular"],
    ["多分","たぶん","probably","regular"],
    ["地図","ちず","map","regular"],
    ["電池","でんち","battery","regular"],
    ["本当","ほんとう","truth; real","regular"],
    ["同時","どうじ","same time","regular"],
    ["白米","はくまい","white rice","regular"],
    ["毎日","まいにち","every day","regular"],
    ["何人","なんにん","how many people","regular"],
    ["汽車","きしゃ","steam train","regular"],
    ["近道","ちかみち","shortcut","regular"],
    ["人形","にんぎょう","doll","regular"],
    ["谷間","たにま","valley","regular"],
    ["作文","さくぶん","composition","regular"],
    ["大声","おおごえ","loud voice","regular"],
    ["走る","はしる","run","regular"],
    ["体力","たいりょく","stamina","regular"],
    ["弟子","でし","apprentice","regular"],
    ["売店","ばいてん","kiosk","regular"],
    ["麦茶","むぎちゃ","barley tea","regular"],
    ["来年","らいねん","next year","regular"],
    ["古里","ふるさと","hometown","regular"],
    ["岩石","がんせき","rock","regular"],
    ["東京","とうきょう","Tokyo","regular"],
    ["姉妹","しまい","sisters","regular"],
    ["知人","ちじん","acquaintance","regular"],
    ["校長","こうちょう","principal","regular"],
    ["直線","ちょくせん","straight line","regular"],
    ["歩道","ほどう","sidewalk","regular"],
    ["妹さん","いもうとさん","younger sister","regular"],
    ["明るい","あかるい","bright","regular"],
    ["正門","せいもん","main gate","regular"],
    ["今夜","こんや","tonight","regular"],
    ["科学","かがく","science","regular"],
    ["海外","かいがい","overseas","regular"],
    ["生活","せいかつ","daily life","regular"],
    ["時計","とけい","clock","regular"],
    ["午後","ごご","afternoon","regular"],
    ["思う","おもう","think","regular"],
    ["教室","きょうしつ","classroom","regular"],
    ["秋分","しゅうぶん","autumn equinox","regular"],
    ["春休み","はるやすみ","spring vacation","regular"],
    ["前方","ぜんぽう","ahead","regular"],
    ["お茶","おちゃ","tea","regular"],
    ["昼休み","ひるやすみ","lunch break","regular"],
    ["点数","てんすう","score","regular"],
    ["南口","みなみぐち","south exit","regular"],
    ["夏休み","なつやすみ","summer vacation","regular"],
    ["日記","にっき","diary","regular"],
    ["帰国","きこく","return to one's country","regular"],
    ["草原","そうげん","grassland","regular"],
    ["高校","こうこう","high school","regular"],
    ["手紙","てがみ","letter","regular"],
    ["時間","じかん","time","regular"],
    ["弱い","よわい","weak","regular"],
    ["読書","どくしょ","reading books","regular"],
    ["馬車","ばしゃ","horse-drawn carriage","regular"],
    ["金魚","きんぎょ","goldfish","regular"],
    ["強い","つよい","strong","regular"],
    ["黄色","きいろ","yellow","regular"],
    ["細い","ほそい","thin","regular"],
    ["毎週","まいしゅう","every week","regular"],
    ["雪国","ゆきぐに","snow country","regular"],
    ["船長","せんちょう","captain","regular"],
    ["一組","いちくみ","one group","regular"],
    ["小鳥","ことり","small bird","regular"],
    ["理科","りか","science","regular"],
    ["雲海","うんかい","sea of clouds","regular"],
    ["絵本","えほん","picture book","regular"],
    ["晴天","せいてん","clear sky","regular"],
    ["今朝","けさ","this morning","regular"],
    ["答える","こたえる","answer","regular"],
    ["一番","いちばん","first; best","regular"],
    ["遠足","えんそく","school excursion","regular"],
    ["音楽","おんがく","music","regular"],
    ["新聞","しんぶん","newspaper","regular"],
    ["数学","すうがく","mathematics","regular"],
    ["電話","でんわ","telephone","regular"],
    ["歌う","うたう","sing","regular"],
    ["日本語","にほんご","Japanese language","regular"],
    ["計算","けいさん","calculation","regular"],
    ["聞こえる","きこえる","be heard","regular"],
    ["鳴る","なる","ring","regular"],
    ["先頭","せんとう","front; head","regular"],
    ["日曜日","にちようび","Sunday","regular"],
  ];

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
    const g2Kanji = new Set(KANJI.map(row => kanjiId(row[0])));
    const validKanji = new Set([...G1_KANJI, ...g2Kanji]);

    const kanjiCommands = KANJI.map(([kanji, reading, meaning, tier]) => ({
      id: kanjiId(kanji),
      action: meaning,
      tier: tier,
      dom: 'g2',
      latex: kanji,
      chain: buildChain(kanji, reading, meaning, kanjiPools),
    }));

    const compoundCommands = COMPOUNDS.map(([compound, reading, meaning, tier]) => {
      const requires = unique([...compound].filter(char => /\p{Script=Han}/u.test(char)).map(kanjiId).filter(id => validKanji.has(id)));
      if (!requires.length) return null;
      return {
        id: compoundId(compound),
        action: meaning,
        tier: tier,
        dom: 'g2',
        latex: compound,
        chain: buildChain(compound, reading, meaning, compoundPools),
        requires: requires,
      };
    }).filter(Boolean);

    return kanjiCommands.concat(compoundCommands);
  }

  function buildExplanationBank() {
    return { byId: {}, byLabel: {} };
  }

  window.KANJI_G2_DATA = {
    id: 'g2',
    name: 'Grade 2',
    domLabels: { g2: ['Grade 2 (二年)'] },
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
