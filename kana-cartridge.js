(function(){

function shuffleArr(arr){
  const copy = arr.slice();
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function uniqueBy(items, keyFn){
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toHiragana(text){
  return String(text || '').replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

function normalizeLookup(text){
  return toHiragana(String(text || '').toLowerCase())
    .trim()
    .replace(/\s+/g, '')
    .replace(/['".,!?()\-:;[\]{}]/g, '');
}

function stripActionLabel(text){
  return String(text || '').replace(/\s*\([^)]*\)/g, '').trim();
}

function takeDistinct(items, correct, count, normalizer){
  const norm = normalizer || normalizeLookup;
  const seen = new Set([norm(correct)]);
  const picked = [];
  items.forEach(item => {
    if(item == null) return;
    const key = norm(item);
    if(!key || seen.has(key)) return;
    seen.add(key);
    picked.push(item);
  });
  return picked.slice(0, count);
}

function simpleHash(text){
  let hash = 0;
  for(const ch of String(text || '')){
    hash = (hash * 131 + ch.charCodeAt(0)) % 1679616;
  }
  return hash.toString(36);
}

function makeId(word){
  const chars = [...String(word || '')];
  const firstHex = chars[0] ? chars[0].charCodeAt(0).toString(16) : '0000';
  return `kv-${firstHex}-${chars.length}-${simpleHash(word)}`;
}

function isKanaChar(ch){
  return /^[ぁ-ん]$/.test(ch);
}

const SMALL_KANA = new Set(['ゃ','ゅ','ょ','っ']);
const SMALL_Y_KANA = new Set(['ゃ','ゅ','ょ']);
const REQUIRED_BASIC = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const REQUIRED_VOICED = [...'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ'];

const DIGRAPH_ROMAJI = {
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'しゃ':'sha','しゅ':'shu','しょ':'sho',
  'じゃ':'ja','じゅ':'ju','じょ':'jo',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
};

const KANA_ROMAJI = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
};

const KANA_LABELS = Object.assign({}, KANA_ROMAJI, {
  'ゃ':'small ya',
  'ゅ':'small yu',
  'ょ':'small yo',
  'っ':'small tsu',
});

const ROW_CHARS = {
  'row-a':['あ','い','う','え','お'],
  'row-k':['か','き','く','け','こ','が','ぎ','ぐ','げ','ご'],
  'row-s':['さ','し','す','せ','そ','ざ','じ','ず','ぜ','ぞ'],
  'row-t':['た','ち','つ','て','と','だ','ぢ','づ','で','ど','っ'],
  'row-n':['な','に','ぬ','ね','の'],
  'row-h':['は','ひ','ふ','へ','ほ','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ'],
  'row-m':['ま','み','む','め','も'],
  'row-y':['や','ゆ','よ','ゃ','ゅ','ょ'],
  'row-r':['ら','り','る','れ','ろ'],
  'row-w':['わ','を','ん'],
};

const ROW_ROMAJI = {
  'row-a':'a i u e o',
  'row-k':'ka ki ku ke ko',
  'row-s':'sa shi su se so',
  'row-t':'ta chi tsu te to',
  'row-n':'na ni nu ne no',
  'row-h':'ha hi fu he ho',
  'row-m':'ma mi mu me mo',
  'row-y':'ya yu yo',
  'row-r':'ra ri ru re ro',
  'row-w':'wa wo n',
};

const VOICED_PAIRS = {
  'が':'か','ぎ':'き','ぐ':'く','げ':'け','ご':'こ',
  'ざ':'さ','じ':'し','ず':'す','ぜ':'せ','ぞ':'そ',
  'だ':'た','ぢ':'ち','づ':'つ','で':'て','ど':'と',
  'ば':'は','び':'ひ','ぶ':'ふ','べ':'へ','ぼ':'ほ',
  'ぱ':'は','ぴ':'ひ','ぷ':'ふ','ぺ':'へ','ぽ':'ほ',
  'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご',
  'さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ',
  'た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど',
  'は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ',
};

const CONFUSABLE_KANA = {
  'は':['ほ'],'ほ':['は'],
  'ぬ':['め'],'め':['ぬ'],
  'る':['ろ'],'ろ':['る'],
  'き':['さ'],'さ':['き'],
  'わ':['ね','れ'],'ね':['わ','れ'],'れ':['わ','ね'],
  'い':['り'],'り':['い'],
  'あ':['お'],'お':['あ'],
  'う':['つ'],'つ':['う'],
};

const LESS_COMMON_KANA = new Set(['ぬ','む','ゆ','を','れ','ろ','ぜ','ぢ','づ','ぺ','ぽ','ぱ','ぴ','ぷ']);

function rowIdForKana(kana){
  for(const id of Object.keys(ROW_CHARS)){
    if(ROW_CHARS[id].indexOf(kana) >= 0) return id;
  }
  return 'row-a';
}

function voicingNodeForKana(kana){
  if('がぎぐげご'.indexOf(kana) >= 0) return 'voicing-k-g';
  if('ざじずぜぞ'.indexOf(kana) >= 0) return 'voicing-s-z';
  if('だぢづでど'.indexOf(kana) >= 0) return 'voicing-t-d';
  if('ばびぶべぼ'.indexOf(kana) >= 0) return 'voicing-h-b';
  if('ぱぴぷぺぽ'.indexOf(kana) >= 0) return 'semi-voicing-h-p';
  return null;
}

function kanaPrereqs(kana){
  if(kana === 'っ') return ['small-tsu-rule'];
  if(SMALL_Y_KANA.has(kana)) return ['yoon-blends'];
  const prereqs = [rowIdForKana(kana)];
  const voicing = voicingNodeForKana(kana);
  if(voicing) prereqs.push(voicing);
  return prereqs;
}

function romajiForKanaQuestion(kana){
  return KANA_LABELS[kana] || KANA_ROMAJI[kana] || String(kana || '');
}

function toRomaji(word){
  const chars = [...String(word || '')];
  let out = '';
  for(let i = 0; i < chars.length; i++){
    const ch = chars[i];
    const pair = ch + (chars[i + 1] || '');
    if(ch === 'っ'){
      const nextPair = (chars[i + 1] || '') + (chars[i + 2] || '');
      const nextRomaji = DIGRAPH_ROMAJI[nextPair] || KANA_ROMAJI[chars[i + 1]] || '';
      out += nextRomaji ? nextRomaji.charAt(0) : 't';
      continue;
    }
    if(DIGRAPH_ROMAJI[pair]){
      out += DIGRAPH_ROMAJI[pair];
      i++;
      continue;
    }
    if(SMALL_Y_KANA.has(ch)) {
      out += KANA_LABELS[ch].replace('small ', '');
      continue;
    }
    out += KANA_ROMAJI[ch] || ch;
  }
  return out;
}

const G1_SOURCE_ROWS = [
  ['あおい', 'blue; green', '青', 'k-9752', 'regular'],
  ['あおぞら', 'blue sky', '青空', 'k-9752', 'core'],
  ['あかい', 'red', '赤', 'k-8d64', 'regular'],
  ['あかちゃん', 'baby', '赤ちゃん', 'k-8d64', 'core'],
  ['あがる', 'above; up; on top', '上', 'k-4e0a', 'regular'],
  ['あし', 'foot; leg; enough', '足', 'k-8db3', 'regular'],
  ['あめ', 'rain', '雨', 'k-96e8', 'regular'],
  ['いきる', 'life; birth; raw', '生', 'k-751f', 'regular'],
  ['いし', 'stone; rock', '石', 'k-77f3', 'regular'],
  ['いしばし', 'stone bridge', '石橋', 'k-77f3', 'regular'],
  ['いちにち', 'one day', '一日', 'k-4e00', 'core'],
  ['いつつ', 'five', '五', 'k-4e94', 'regular'],
  ['いと', 'thread; string', '糸', 'k-7cf8', 'regular'],
  ['いぬ', 'dog', '犬', 'k-72ac', 'regular'],
  ['いりぐち', 'entrance', '入口', 'k-53e3', 'core'],
  ['うえ', 'above; up; on top', '上', 'k-4e0a', 'regular'],
  ['うまれる', 'life; birth; raw', '生', 'k-751f', 'regular'],
  ['おうさま', 'king', '王様', 'k-738b', 'regular'],
  ['おおあめ', 'heavy rain', '大雨', 'k-96e8', 'core'],
  ['おおきい', 'big; large', '大', 'k-5927', 'regular'],
  ['おかね', 'money', 'お金', 'k-91d1', 'core'],
  ['おがわ', 'stream', '小川', 'k-5ddd', 'core'],
  ['おたま', 'ladle', 'お玉', 'k-7389', 'regular'],
  ['おと', 'sound', '音', 'k-97f3', 'regular'],
  ['おとこ', 'man; male', '男', 'k-7537', 'regular'],
  ['おとな', 'adult', '大人', 'k-4eba', 'core'],
  ['おんがく', 'music', '音楽', 'k-97f3', 'regular'],
  ['おんな', 'woman', '女', 'k-5973', 'regular'],
  ['かい', 'shell', '貝', 'k-8c9d', 'regular'],
  ['かいがら', 'seashell', '貝殻', 'k-8c9d', 'regular'],
  ['がくせい', 'student', '学生', 'k-5b66', 'regular'],
  ['かじ', 'fire (disaster)', '火事', 'k-706b', 'core'],
  ['がっこう', 'school', '学校', 'k-5b66', 'regular'],
  ['かね', 'gold; money; metal', '金', 'k-91d1', 'regular'],
  ['かわ', 'river', '川', 'k-5ddd', 'regular'],
  ['かんじ', 'kanji', '漢字', 'k-5b57', 'regular'],
  ['きゅうじつ', 'holiday', '休日', 'k-4f11', 'regular'],
  ['くうき', 'air; atmosphere', '空気', 'k-7a7a', 'core'],
  ['くがつ', 'September', '九月', 'k-4e5d', 'core'],
  ['くさ', 'grass', '草', 'k-8349', 'regular'],
  ['くだる', 'below; down', '下', 'k-4e0b', 'regular'],
  ['くち', 'mouth', '口', 'k-53e3', 'regular'],
  ['くるま', 'car; vehicle', '車', 'k-8eca', 'regular'],
  ['けいと', 'yarn', '毛糸', 'k-7cf8', 'regular'],
  ['げつようび', 'Monday', '月曜日', 'k-6708', 'core'],
  ['こいぬ', 'puppy', '子犬', 'k-72ac', 'regular'],
  ['ごがつ', 'May', '五月', 'k-4e94', 'core'],
  ['ここのつ', 'nine', '九', 'k-4e5d', 'regular'],
  ['ことし', 'this year', '今年', 'k-5e74', 'regular'],
  ['こども', 'children', '子供', 'k-5b50', 'core'],
  ['こんちゅう', 'insect', '昆虫', 'k-866b', 'regular'],
  ['さがる', 'below; down', '下', 'k-4e0b', 'regular'],
  ['さき', 'ahead; before; previous', '先', 'k-5148', 'regular'],
  ['さんがつ', 'March', '三月', 'k-4e09', 'core'],
  ['しがつ', 'April', '四月', 'k-56db', 'core'],
  ['した', 'below; down', '下', 'k-4e0b', 'regular'],
  ['しちがつ', 'July', '七月', 'k-4e03', 'core'],
  ['じどうしゃ', 'automobile', '自動車', 'k-8eca', 'regular'],
  ['じびか', 'ENT clinic', '耳鼻科', 'k-8033', 'regular'],
  ['じゅうがつ', 'October', '十月', 'k-5341', 'core'],
  ['しょうがっこう', 'elementary school', '小学校', 'k-5c0f', 'core'],
  ['じょうず', 'skillful', '上手', 'k-4e0a', 'core'],
  ['じょし', 'girl/woman', '女子', 'k-5b50', 'core'],
  ['しろい', 'white', '白い', 'k-767d', 'core'],
  ['しんりん', 'forest', '森林', 'k-68ee', 'regular'],
  ['すいようび', 'Wednesday', '水曜日', 'k-6c34', 'core'],
  ['せんえん', '1000 yen', '千円', 'k-5343', 'regular'],
  ['せんせい', 'teacher', '先生', 'k-751f', 'regular'],
  ['そうげん', 'grassland', '草原', 'k-8349', 'regular'],
  ['そら', 'sky; empty', '空', 'k-7a7a', 'regular'],
  ['たけ', 'bamboo', '竹', 'k-7af9', 'regular'],
  ['だす', 'exit; go out; put out', '出', 'k-51fa', 'regular'],
  ['ただしい', 'correct', '正しい', 'k-6b63', 'regular'],
  ['たつ', 'to stand', '立つ', 'k-7acb', 'regular'],
  ['たてる', 'stand; establish', '立', 'k-7acb', 'regular'],
  ['たま', 'jewel; ball', '玉', 'k-7389', 'regular'],
  ['たりる', 'to be enough', '足りる', 'k-8db3', 'core'],
  ['だんし', 'boy; male', '男子', 'k-7537', 'core'],
  ['たんぼ', 'rice paddy', '田んぼ', 'k-7530', 'regular'],
  ['ちいさい', 'small; little', '小', 'k-5c0f', 'regular'],
  ['ちから', 'power; strength; force', '力', 'k-529b', 'regular'],
  ['ちからもち', 'strong person', '力持ち', 'k-529b', 'regular'],
  ['ちくりん', 'bamboo grove', '竹林', 'k-6797', 'regular'],
  ['ちゅうがっこう', 'middle school', '中学校', 'k-4e2d', 'core'],
  ['つき', 'moon; month', '月', 'k-6708', 'regular'],
  ['つち', 'earth; soil; ground', '土', 'k-571f', 'regular'],
  ['でぐち', 'exit', '出口', 'k-53e3', 'core'],
  ['でる', 'exit; go out; put out', '出', 'k-51fa', 'regular'],
  ['てんき', 'weather', '天気', 'k-6c17', 'regular'],
  ['とお', 'ten', '十', 'k-5341', 'regular'],
  ['とし', 'year', '年', 'k-5e74', 'regular'],
  ['どようび', 'Saturday', '土曜日', 'k-571f', 'core'],
  ['なか', 'middle; inside; during', '中', 'k-4e2d', 'regular'],
  ['ななつ', 'seven', '七', 'k-4e03', 'regular'],
  ['なま', 'life; birth; raw', '生', 'k-751f', 'regular'],
  ['なまえ', 'name', '名前', 'k-540d', 'regular'],
  ['にがつ', 'February', '二月', 'k-4e8c', 'core'],
  ['にほん', 'Japan', '日本', 'k-65e5', 'core'],
  ['のぼる', 'above; up; on top', '上', 'k-4e0a', 'regular'],
  ['はいる', 'enter; put in', '入', 'k-5165', 'regular'],
  ['はちがつ', 'August', '八月', 'k-516b', 'core'],
  ['はな', 'flower', '花', 'k-82b1', 'regular'],
  ['はなび', 'fireworks', '花火', 'k-82b1', 'regular'],
  ['はなみ', 'flower viewing', '花見', 'k-82b1', 'regular'],
  ['はやい', 'early; fast', '早', 'k-65e9', 'regular'],
  ['はやおき', 'early rising', '早起き', 'k-65e9', 'regular'],
  ['はやし', 'grove; woods', '林', 'k-6797', 'regular'],
  ['ひだり', 'left', '左', 'k-5de6', 'regular'],
  ['ひだりて', 'left hand', '左手', 'k-5de6', 'regular'],
  ['ひと', 'person', '人', 'k-4eba', 'regular'],
  ['ひとつ', 'one', '一', 'k-4e00', 'regular'],
  ['ひゃくえん', '100 yen', '百円', 'k-5186', 'regular'],
  ['ふたつ', 'two', '二', 'k-4e8c', 'regular'],
  ['ふみ', 'writing; sentence; text', '文', 'k-6587', 'regular'],
  ['へた', 'unskillful', '下手', 'k-4e0b', 'core'],
  ['まち', 'town', '町', 'k-753a', 'regular'],
  ['まなぶ', 'study; learning', '学', 'k-5b66', 'regular'],
  ['まるい', 'round', '円い', 'k-5186', 'regular'],
  ['みえる', 'see; look', '見', 'k-898b', 'regular'],
  ['みぎ', 'right', '右', 'k-53f3', 'regular'],
  ['みぎて', 'right hand', '右手', 'k-53f3', 'core'],
  ['みず', 'water', '水', 'k-6c34', 'regular'],
  ['みっつ', 'three', '三', 'k-4e09', 'regular'],
  ['みみ', 'ear', '耳', 'k-8033', 'regular'],
  ['みる', 'see; look', '見', 'k-898b', 'regular'],
  ['むし', 'insect; bug', '虫', 'k-866b', 'regular'],
  ['むっつ', 'six', '六', 'k-516d', 'regular'],
  ['むら', 'village', '村', 'k-6751', 'regular'],
  ['もくてき', 'purpose', '目的', 'k-76ee', 'core'],
  ['もくようび', 'Thursday', '木曜日', 'k-6728', 'core'],
  ['もじ', 'character; letter', '文字', 'k-5b57', 'regular'],
  ['もと', 'book; origin; true', '本', 'k-672c', 'regular'],
  ['もり', 'forest', '森', 'k-68ee', 'regular'],
  ['やすむ', 'rest', '休', 'k-4f11', 'regular'],
  ['やっつ', 'eight', '八', 'k-516b', 'regular'],
  ['やま', 'mountain', '山', 'k-5c71', 'regular'],
  ['やまみち', 'mountain path', '山道', 'k-5c71', 'core'],
  ['ゆう', 'evening', '夕', 'k-5915', 'regular'],
  ['ゆうがた', 'evening', '夕方', 'k-5915', 'regular'],
  ['よっつ', 'four', '四', 'k-56db', 'regular'],
  ['よん', 'four', '四', 'k-56db', 'regular'],
  ['りんどう', 'forest road', '林道', 'k-6797', 'regular'],
  ['ろくがつ', 'June', '六月', 'k-516d', 'core'],
];

const SUPPLEMENT_ROWS = [
  ['ありがとう', 'thank you', '有難う', 'supp-arigatou', 'core'],
  ['こんにちは', 'hello', '今日は', 'supp-konnichiwa', 'core'],
  ['すみません', 'excuse me', '済みません', 'supp-sumimasen', 'core'],
  ['ざっし', 'magazine', '雑誌', 'supp-zasshi', 'regular'],
  ['ぜんぶ', 'all', '全部', 'supp-zenbu', 'core'],
  ['ちぢむ', 'shrink', '縮む', 'supp-chidimu', 'regular'],
  ['つづく', 'continue', '続く', 'supp-tsuzuku', 'regular'],
  ['おべんとう', 'lunch box', 'お弁当', 'supp-obentou', 'core'],
  ['ぱん', 'bread', 'パン', 'supp-pan', 'core'],
  ['ぴあの', 'piano', 'ピアノ', 'supp-piano', 'regular'],
  ['てんぷら', 'tempura', '天ぷら', 'supp-tempura', 'regular'],
  ['ぺん', 'pen', 'ペン', 'supp-pen', 'regular'],
  ['さんぽ', 'walk', '散歩', 'supp-sanpo', 'regular'],
  ['ほんをよむ', 'read a book', '本を読む', 'supp-honwoyomu', 'regular'],
  ['みずをのむ', 'drink water', '水を飲む', 'supp-mizuwonomu', 'regular'],
  ['へや', 'room', '部屋', 'supp-heya', 'core'],
  ['これ', 'this', '此れ', 'supp-kore', 'core'],
];

const ENGLISH_OVERRIDES = {
  'あがる':'go up',
  'いきる':'live',
  'うえ':'up',
  'うまれる':'be born',
  'おおきい':'big',
  'おとこ':'man',
  'かね':'money',
  'かわ':'river',
  'くだる':'go down',
  'くるま':'car',
  'ここのつ':'nine things',
  'さがる':'go down',
  'した':'down',
  'そら':'sky',
  'だす':'take out',
  'たてる':'set upright',
  'たま':'ball',
  'たりる':'be enough',
  'だんし':'boy',
  'ちいさい':'small',
  'ちから':'strength',
  'つき':'moon',
  'つち':'soil',
  'でる':'go out',
  'なか':'middle',
  'ななつ':'seven things',
  'なま':'raw',
  'のぼる':'go up',
  'はいる':'enter',
  'はやし':'grove',
  'ひとつ':'one thing',
  'ふたつ':'two things',
  'ふみ':'writing',
  'じょし':'girl',
  'みえる':'be visible',
  'むし':'insect',
  'むっつ':'six things',
  'もじ':'letter',
  'もと':'origin',
  'やっつ':'eight things',
  'ゆうがた':'late afternoon',
  'よっつ':'four things',
};

const COMPONENT_HINTS = {
  'ありがとう':'thanks',
  'あお':'blue',
  'あか':'red',
  'あめ':'rain',
  'いし':'stone',
  'ばし':'bridge',
  'いち':'one',
  'にち':'day',
  'いと':'thread',
  'いり':'enter',
  'ぐち':'entrance or exit',
  'うえ':'up',
  'おう':'king',
  'さま':'honorific title',
  'おお':'big or great',
  'お':'honorific prefix',
  'かね':'money',
  'がわ':'river or side',
  'たま':'ball or jewel',
  'おん':'sound',
  'がく':'study or music',
  'がっこう':'school',
  'せい':'student or life',
  'くう':'sky or air',
  'き':'air or spirit',
  'がつ':'month',
  'ようび':'day of the week',
  'こ':'child',
  'ども':'plural people',
  'こん':'this',
  'ちゅう':'middle or inside',
  'さん':'three',
  'し':'four or white',
  'じ':'character or ear/nose/throat',
  'じゅう':'ten',
  'しょう':'small or elementary',
  'しん':'deep or true',
  'りん':'woods or forest',
  'すい':'water',
  'せん':'thousand',
  'そう':'grass or whole',
  'たけ':'bamboo',
  'ただ':'correct',
  'たつ':'stand',
  'たりる':'be enough',
  'たん':'field',
  'ちから':'strength',
  'もち':'holder or person with',
  'つき':'moon',
  'つち':'soil',
  'てん':'heaven or weather',
  'とし':'year',
  'なまえ':'name',
  'に':'two or Japan',
  'はな':'flower',
  'び':'fire or day suffix',
  'み':'look or see',
  'はや':'early',
  'おき':'waking up',
  'ひだり':'left',
  'みぎ':'right',
  'て':'hand',
  'ひゃく':'hundred',
  'ぶ':'part or all',
  'まち':'town',
  'まる':'round',
  'みず':'water',
  'みみ':'ear',
  'もく':'wood or purpose',
  'てき':'target or purpose',
  'もり':'forest',
  'やす':'rest',
  'やま':'mountain',
  'みち':'road or path',
  'ゆう':'evening',
  'がた':'time of day',
  'よ':'four',
  'ろく':'six',
  'ざっし':'magazine',
  'ぜん':'whole',
  'ちぢむ':'shrink',
  'つづく':'continue',
  'べんとう':'lunch box',
  'ぱん':'bread',
  'ぴあの':'piano',
  'てんぷら':'tempura',
  'ぺん':'pen',
  'さんぽ':'walk',
  'ほん':'book',
  'をよむ':'read it',
  'をのむ':'drink it',
  'へや':'room',
  'これ':'this',
  'こんにちは':'hello',
  'すみません':'excuse me',
};

const PREFIX_HINTS = [
  'こんにちは','すみません','ありがとう','しょう','ちゅう','みぎ','ひだり','ちから','べんとう',
  'がっこう','ようび','なまえ','がた','ちゅう','お','ほん','みず','さん','ぜん','ざっし',
  'へや','これ','てんぷら','ぴあの'
];

const SUFFIX_HINTS = [
  'ようび','がっこう','べんとう','をよむ','をのむ','がた','ぐち','みち','ちゃん','がつ','てき',
  'び','み','て','えん','りん','ぽ','し','き','や'
];

function sanitizeEnglish(reading, english){
  if(ENGLISH_OVERRIDES[reading]) return ENGLISH_OVERRIDES[reading];
  return String(english || '').split(';')[0].trim();
}

function buildSourceRows(rows){
  return rows.map(row => ({
    reading: row[0],
    romaji: toRomaji(row[0]),
    english: sanitizeEnglish(row[0], row[1]),
    kanjiForm: row[2],
    sourceKanjiId: row[3],
    tier: row[4],
  }));
}

const SOURCE_WORDS = buildSourceRows(G1_SOURCE_ROWS.concat(SUPPLEMENT_ROWS));

function checkCoverage(records){
  const counts = {};
  records.forEach(record => {
    [...record.reading].forEach(ch => {
      if(!isKanaChar(ch)) return;
      counts[ch] = (counts[ch] || 0) + 1;
    });
  });
  const missingBasic = REQUIRED_BASIC.filter(ch => !counts[ch]);
  const missingVoiced = REQUIRED_VOICED.filter(ch => !counts[ch]);
  const underCoveredBasic = REQUIRED_BASIC.filter(ch => (counts[ch] || 0) < 2);
  if(missingBasic.length || missingVoiced.length || underCoveredBasic.length){
    console.warn('[kana] Coverage warning', {
      missingBasic,
      missingVoiced,
      underCoveredBasic
    });
  }
}

checkCoverage(SOURCE_WORDS);

function sameRowKana(kana){
  return (ROW_CHARS[rowIdForKana(kana)] || []).filter(candidate => candidate !== kana && !SMALL_KANA.has(candidate));
}

function sameRowOrConfusableKana(kana){
  const pool = [];
  sameRowKana(kana).forEach(candidate => pool.push(candidate));
  if(VOICED_PAIRS[kana]) pool.push(VOICED_PAIRS[kana]);
  (CONFUSABLE_KANA[kana] || []).forEach(candidate => pool.push(candidate));
  if(kana === 'っ') pool.push('つ', 'ゃ', 'ゅ');
  if(kana === 'ゃ') pool.push('ゅ', 'ょ', 'や');
  if(kana === 'ゅ') pool.push('ゃ', 'ょ', 'ゆ');
  if(kana === 'ょ') pool.push('ゃ', 'ゅ', 'よ');
  if(kana === 'を') pool.push('わ', 'お', 'ん');
  if(kana === 'ん') pool.push('わ', 'を', 'ぬ');
  return uniqueBy(pool, item => item).filter(item => item !== kana);
}

function getSameRowDistractors(kana, count){
  const pool = sameRowOrConfusableKana(kana);
  const out = [];
  for(const candidate of pool){
    if(out.indexOf(candidate) >= 0 || candidate === kana) continue;
    out.push(candidate);
    if(out.length >= count) break;
  }
  if(out.length < count){
    for(const rowId of Object.keys(ROW_CHARS)){
      for(const candidate of ROW_CHARS[rowId]){
        if(candidate === kana || out.indexOf(candidate) >= 0 || SMALL_KANA.has(candidate)) continue;
        out.push(candidate);
        if(out.length >= count) break;
      }
      if(out.length >= count) break;
    }
  }
  return out.slice(0, count);
}

function kanaWrongRomaji(kana){
  const correct = romajiForKanaQuestion(kana);
  const pool = sameRowOrConfusableKana(kana).map(candidate => romajiForKanaQuestion(candidate));
  return takeDistinct(pool, correct, 2, normalizeLookup);
}

function scoreKanaForTrickiness(kana){
  let score = 0;
  if(voicingNodeForKana(kana)) score += 100;
  if(CONFUSABLE_KANA[kana]) score += 80;
  if(LESS_COMMON_KANA.has(kana)) score += 60;
  if(SMALL_KANA.has(kana)) score -= 100;
  return score;
}

function pickTrickiestIndex(word){
  const chars = [...String(word || '')];
  let bestIndex = 0;
  let bestScore = -Infinity;
  chars.forEach((kana, index) => {
    if(!isKanaChar(kana)) return;
    const score = scoreKanaForTrickiness(kana) - index * 0.01;
    if(score > bestScore){
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function pickBlankPositions(word){
  const chars = [...String(word || '')];
  const preferred = chars
    .map((kana, index) => ({kana, index}))
    .filter(entry => isKanaChar(entry.kana) && !SMALL_KANA.has(entry.kana));
  const trickyIndex = pickTrickiestIndex(word);
  const other = preferred.find(entry => entry.index !== trickyIndex) || preferred[preferred.length - 1];
  if(!other) return [0, Math.min(1, chars.length - 1)];
  return uniqueBy([trickyIndex, other.index, preferred[0].index], item => String(item)).slice(0, 2);
}

function buildBlank(word, position){
  const chars = [...String(word || '')];
  const answer = chars[position];
  chars[position] = '□';
  const distractors = getSameRowDistractors(answer, 2);
  return {
    latex: chars.join(''),
    answer: answer,
    choices: [answer].concat(distractors)
  };
}

function splitWord(word){
  const chars = [...String(word || '')];
  if(chars.length <= 2) return [chars[0], chars.slice(1).join('') || chars[0]];

  for(const prefix of PREFIX_HINTS.sort((a, b) => b.length - a.length)){
    if(word.indexOf(prefix) === 0 && prefix.length < word.length){
      return [prefix, word.slice(prefix.length)];
    }
  }
  for(const suffix of SUFFIX_HINTS.sort((a, b) => b.length - a.length)){
    if(word.endsWith(suffix) && suffix.length < word.length){
      return [word.slice(0, word.length - suffix.length), suffix];
    }
  }

  let splitAt = Math.floor(chars.length / 2);
  if(SMALL_KANA.has(chars[splitAt])) splitAt++;
  if(splitAt <= 0) splitAt = 1;
  if(splitAt >= chars.length) splitAt = chars.length - 1;
  return [chars.slice(0, splitAt).join(''), chars.slice(splitAt).join('')];
}

function describeChunk(chunk, record, index){
  if(COMPONENT_HINTS[chunk]) return COMPONENT_HINTS[chunk];
  if(index === 0) return `opening chunk in "${record.english}"`;
  return `ending chunk in "${record.english}"`;
}

function buildComponents(record){
  const parts = splitWord(record.reading).filter(Boolean);
  if(parts.length === 1){
    return [
      {s: parts[0], d: record.english},
      {s: [...record.reading][0], d: 'opening kana sound'},
    ];
  }
  return parts.slice(0, 2).map((chunk, index) => ({
    s: chunk,
    d: describeChunk(chunk, record, index),
  }));
}

function explainParts(parts){
  return parts.map(part => `${part.s} = ${part.d}`).join(' + ');
}

function inferSemanticGroup(record){
  const english = normalizeLookup(record.english);
  const clue = record.kanjiForm;
  if(/monday|wednesday|thursday|saturday|january|february|march|april|may|june|july|august|september|october|holiday|year|month|day|evening|weather/.test(english)) return 'time';
  if(/onething|twothing|three|four|five|six|seven|eight|nine|ten/.test(english) || /一|二|三|四|五|六|七|八|九|十/.test(clue)) return 'numbers';
  if(/student|teacher|adult|children|baby|person|man|woman|boy|girl|king/.test(english)) return 'people';
  if(/hand|ear|mouth|foot|nose|eye/.test(english) || /手|耳|口|足|目|鼻/.test(clue)) return 'body';
  if(/right|left|up|down|middle|entrance|exit|road|path|bridge/.test(english) || /右|左|上|下|中|口|道|橋/.test(clue)) return 'direction';
  if(/school|kanji|letter|writing|learn|study|music/.test(english) || /学|校|字|文|音/.test(clue)) return 'school';
  if(/rain|sky|air|river|mountain|bamboo|grass|forest|woods|soil|stone|fire|flower|moon|water|stream|shell|insect/.test(english) || /雨|空|川|山|竹|草|森|林|土|石|火|花|月|水|貝|虫/.test(clue)) return 'nature';
  if(/money|yen/.test(english) || /円|金/.test(clue)) return 'money';
  if(/car|automobile/.test(english) || /車/.test(clue)) return 'transport';
  return 'general';
}

function relatedRecords(record){
  return SOURCE_RECORDS
    .filter(candidate => candidate.id !== record.id)
    .map(candidate => {
      let score = 0;
      if(candidate.group === record.group) score += 50;
      if([...candidate.reading][0] === [...record.reading][0]) score += 15;
      if([...candidate.reading].length === [...record.reading].length) score += 10;
      if(candidate.tier === record.tier) score += 5;
      return {candidate, score};
    })
    .sort((a, b) => b.score - a.score || a.candidate.reading.localeCompare(b.candidate.reading, 'ja'))
    .map(entry => entry.candidate);
}

function buildRomajiWrongs(record){
  const chars = [...record.reading];
  const trickyIndex = pickTrickiestIndex(record.reading);
  const mutated = getSameRowDistractors(chars[trickyIndex], 4).map(candidate => {
    const copy = chars.slice();
    copy[trickyIndex] = candidate;
    return toRomaji(copy.join(''));
  });
  const semantic = relatedRecords(record).map(candidate => candidate.romaji);
  const fallback = [
    record.romaji.replace(/i$/, 'e'),
    record.romaji.replace(/u$/, 'o'),
    record.romaji + 'n',
    record.romaji.replace(/a(?!.*a)/, 'o'),
  ];
  return takeDistinct(mutated.concat(semantic).concat(fallback), record.romaji, 2, normalizeLookup);
}

function buildReverseWrongs(record){
  const related = relatedRecords(record).filter(candidate => normalizeLookup(candidate.english) !== normalizeLookup(record.english));
  const sameGroup = related.map(candidate => candidate.reading);
  const sameLength = SOURCE_RECORDS
    .filter(candidate => candidate.id !== record.id && [...candidate.reading].length === [...record.reading].length)
    .map(candidate => candidate.reading);
  return takeDistinct(sameGroup.concat(sameLength), record.reading, 2, normalizeLookup);
}

function buildScenario(record){
  return `A clue card shows the written clue ${record.kanjiForm}. Which hiragana word matches it?`;
}

function commandById(allCommands, id){
  for(const cmd of allCommands || []){
    if(cmd && cmd.id === id) return cmd;
  }
  return null;
}

function pickActionDistractors(cmd, allCommands, count){
  const correct = stripActionLabel(cmd.action);
  const current = RECORD_BY_ID[cmd.id];
  const pools = [];
  if(current){
    pools.push(relatedRecords(current).map(record => commandById(allCommands, record.id) || COMMAND_BY_ID[record.id]).filter(Boolean));
  }
  pools.push((allCommands || []).filter(candidate => candidate.id !== cmd.id && candidate.dom === cmd.dom));
  pools.push((allCommands || []).filter(candidate => candidate.id !== cmd.id));

  const picked = [];
  const seen = new Set([normalizeLookup(correct)]);
  pools.forEach(pool => {
    pool.forEach(candidate => {
      const action = stripActionLabel(candidate.action);
      const key = normalizeLookup(action);
      if(!action || seen.has(key)) return;
      seen.add(key);
      picked.push(candidate);
    });
  });
  return picked.slice(0, count);
}

function buildApplicationOptions(cmd, allCommands, confusionSet){
  const byLatex = [];
  const byAction = [];
  const usedLatex = new Set();
  const usedAction = new Set();

  function addLatexOption(value){
    if(!value || usedLatex.has(value)) return;
    usedLatex.add(value);
    byLatex.push(value);
  }
  function addActionOption(value){
    const key = normalizeLookup(value);
    if(!value || usedAction.has(key)) return;
    usedAction.add(key);
    byAction.push(value);
  }

  if(cmd.dom === 'kana'){
    addLatexOption(cmd.latex);
    confusionSet.forEach(id => {
      const candidate = commandById(allCommands, id) || COMMAND_BY_ID[id];
      if(candidate) addLatexOption(candidate.latex);
    });
    (allCommands || []).forEach(candidate => {
      if(candidate.id !== cmd.id && candidate.dom === cmd.dom) addLatexOption(candidate.latex);
    });
    return byLatex.slice(0, 4);
  }

  addActionOption(stripActionLabel(cmd.action));
  confusionSet.forEach(id => {
    const candidate = commandById(allCommands, id);
    if(candidate) addActionOption(stripActionLabel(candidate.action));
  });
  pickActionDistractors(cmd, allCommands, 6).forEach(candidate => addActionOption(stripActionLabel(candidate.action)));
  return byAction.slice(0, 4);
}

const SOURCE_RECORDS = SOURCE_WORDS.map(source => {
  const components = buildComponents(source);
  return {
    id: makeId(source.reading),
    reading: source.reading,
    romaji: source.romaji,
    english: source.english,
    kanjiForm: source.kanjiForm,
    sourceKanjiId: source.sourceKanjiId,
    tier: source.tier,
    dom: 'kana',
    group: inferSemanticGroup(source),
    components: components,
  };
});

const RECORD_BY_ID = Object.fromEntries(SOURCE_RECORDS.map(record => [record.id, record]));

const COMMANDS = SOURCE_RECORDS.map(record => {
  const blankPositions = pickBlankPositions(record.reading);
  const reverseWrongs = buildReverseWrongs(record);
  const trickyIndex = pickTrickiestIndex(record.reading);
  const trickyKana = [...record.reading][trickyIndex];
  const trickyWrongRomaji = kanaWrongRomaji(trickyKana);
  return {
    id: record.id,
    action: record.english,
    tier: record.tier,
    dom: record.dom,
    hint: `Kanji: ${record.kanjiForm} | Romaji: ${record.romaji}`,
    explain: `${record.english}. ${explainParts(record.components)}.`,
    latex: record.reading,
    blanks: blankPositions.map(position => buildBlank(record.reading, position)),
    subconcepts: [
      {
        q: `What is the romaji for ${record.reading}?`,
        correct: record.romaji,
        wrong: buildRomajiWrongs(record),
      },
      {
        q: `What is the romaji for ${trickyKana}?`,
        correct: romajiForKanaQuestion(trickyKana),
        wrong: trickyWrongRomaji,
      },
      {
        q: `Which word means "${record.english}"?`,
        correct: record.reading,
        wrong: reverseWrongs,
      }
    ]
  };
});

const COMMAND_BY_ID = Object.fromEntries(COMMANDS.map(cmd => [cmd.id, cmd]));

const VARIABLE_BANK = Object.fromEntries(SOURCE_RECORDS.map(record => [
  record.id,
  record.components.slice(0, 2).map(component => ({s: component.s, d: component.d}))
]));

function buildConfusionSet(record){
  const picked = [];
  relatedRecords(record).forEach(candidate => {
    if(picked.indexOf(candidate.id) >= 0 || candidate.id === record.id) return;
    picked.push(candidate.id);
  });
  return picked.slice(0, 3);
}

const APPLICATION_BANK = Object.fromEntries(SOURCE_RECORDS.map(record => [
  record.id,
  [{scenario: buildScenario(record), confusionSet: buildConfusionSet(record)}]
]));

const RELATIONSHIP_BANK = {};
const AUTO_BLANK_SPECS = [];
const DOM_LABELS = {'kana':['Kana Reading (ひらがな)']};

const EXPLANATION_GLOSSARY = SOURCE_RECORDS.map(record => ({
  keys: [record.reading, record.kanjiForm],
  title: `${record.romaji} — ${record.english}`,
  lines: [
    `Meaning: ${record.english}.`,
    `Kanji: ${record.kanjiForm} | Romaji: ${record.romaji}`,
    `Components: ${explainParts(record.components)}`
  ]
}));

function buildHiraNodes(records){
  const chars = uniqueBy(
    records.flatMap(record => [...record.reading]).filter(isKanaChar),
    ch => ch
  );
  const nodes = {};
  chars.forEach(kana => {
    const nodeId = `hira-${kana.charCodeAt(0).toString(16)}`;
    nodes[nodeId] = {
      id: nodeId,
      type: 'conceptual',
      level: 2,
      q: `What is the romaji for ${kana}?`,
      correct: romajiForKanaQuestion(kana),
      wrong: kanaWrongRomaji(kana),
      prereqs: kanaPrereqs(kana),
    };
  });
  return nodes;
}

const ROW_NODES = {
  'row-a':{id:'row-a',type:'conceptual',level:3,q:'Name the a-row sounds.',correct:'a i u e o',wrong:['ka ki ku ke ko','sa shi su se so'],prereqs:['kana-foundation']},
  'row-k':{id:'row-k',type:'conceptual',level:3,q:'Name the k-row sounds.',correct:'ka ki ku ke ko',wrong:['sa shi su se so','ta chi tsu te to'],prereqs:['kana-foundation']},
  'row-s':{id:'row-s',type:'conceptual',level:3,q:'Name the s-row sounds.',correct:'sa shi su se so',wrong:['ka ki ku ke ko','na ni nu ne no'],prereqs:['kana-foundation']},
  'row-t':{id:'row-t',type:'conceptual',level:3,q:'Name the t-row sounds.',correct:'ta chi tsu te to',wrong:['sa shi su se so','ha hi fu he ho'],prereqs:['kana-foundation']},
  'row-n':{id:'row-n',type:'conceptual',level:3,q:'Name the n-row sounds.',correct:'na ni nu ne no',wrong:['ma mi mu me mo','ra ri ru re ro'],prereqs:['kana-foundation']},
  'row-h':{id:'row-h',type:'conceptual',level:3,q:'Name the h-row sounds.',correct:'ha hi fu he ho',wrong:['ba bi bu be bo','pa pi pu pe po'],prereqs:['kana-foundation']},
  'row-m':{id:'row-m',type:'conceptual',level:3,q:'Name the m-row sounds.',correct:'ma mi mu me mo',wrong:['na ni nu ne no','ra ri ru re ro'],prereqs:['kana-foundation']},
  'row-y':{id:'row-y',type:'conceptual',level:3,q:'Name the y-row sounds.',correct:'ya yu yo',wrong:['wa wo n','ra ri ru re ro'],prereqs:['kana-foundation']},
  'row-r':{id:'row-r',type:'conceptual',level:3,q:'Name the r-row sounds.',correct:'ra ri ru re ro',wrong:['na ni nu ne no','ya yu yo'],prereqs:['kana-foundation']},
  'row-w':{id:'row-w',type:'conceptual',level:3,q:'Name the w-row sounds.',correct:'wa wo n',wrong:['ya yu yo','a i u e o'],prereqs:['kana-foundation']},
};

const VOICING_NODES = {
  'voicing-k-g':{id:'voicing-k-g',type:'conceptual',level:3,q:'What happens when dakuten is added to the k-row?',correct:'K becomes G: ka to ga, ki to gi, ku to gu, ke to ge, ko to go',wrong:['K becomes S','K becomes T'],prereqs:['kana-foundation']},
  'voicing-s-z':{id:'voicing-s-z',type:'conceptual',level:3,q:'What happens when dakuten is added to the s-row?',correct:'S becomes Z/J: sa to za, shi to ji, su to zu, se to ze, so to zo',wrong:['S becomes K','S becomes T'],prereqs:['kana-foundation']},
  'voicing-t-d':{id:'voicing-t-d',type:'conceptual',level:3,q:'What happens when dakuten is added to the t-row?',correct:'T becomes D/J/Z: ta to da, chi to ji, tsu to zu, te to de, to to do',wrong:['T becomes K','T becomes B'],prereqs:['kana-foundation']},
  'voicing-h-b':{id:'voicing-h-b',type:'conceptual',level:3,q:'What happens when dakuten is added to the h-row?',correct:'H becomes B: ha to ba, hi to bi, fu to bu, he to be, ho to bo',wrong:['H becomes G','H becomes M'],prereqs:['kana-foundation']},
  'semi-voicing-h-p':{id:'semi-voicing-h-p',type:'conceptual',level:3,q:'What happens when handakuten is added to the h-row?',correct:'H becomes P: ha to pa, hi to pi, fu to pu, he to pe, ho to po',wrong:['H becomes D','H becomes R'],prereqs:['kana-foundation']},
};

const SPECIAL_NODES = {
  'yoon-blends':{id:'yoon-blends',type:'conceptual',level:3,q:'How do small ya, yu, and yo change a kana?',correct:'They blend the syllable into a yoon sound such as kya, shu, or ryo',wrong:['They make the word plural','They erase the vowel'],prereqs:['kana-foundation']},
  'small-tsu-rule':{id:'small-tsu-rule',type:'conceptual',level:3,q:'What does small tsu (っ) do?',correct:'It doubles the next consonant sound, like gakko or zasshi',wrong:['It adds a long vowel','It changes the word to katakana'],prereqs:['kana-foundation']},
};

const CONFUSABLE_NODES = {
  'confuse-ha-ho':{id:'confuse-ha-ho',type:'conceptual',level:3,q:'How do you tell は from ほ?',correct:'は has two simple side strokes, while ほ has a crossing middle line and a tail',wrong:['They are the same kana','は is the voiced form of ほ'],prereqs:['row-h']},
  'confuse-nu-me':{id:'confuse-nu-me',type:'conceptual',level:3,q:'How do you tell ぬ from め?',correct:'ぬ has an extra looped finish, while め closes more simply',wrong:['め is the looped one','They belong to the same exact reading'],prereqs:['row-n']},
  'confuse-ki-sa':{id:'confuse-ki-sa',type:'conceptual',level:3,q:'How do you tell き from さ?',correct:'き has separated horizontal strokes, while さ flows in a single curved body',wrong:['さ has more bars than き','き and さ differ only by dakuten'],prereqs:['row-k','row-s']},
  'confuse-wa-ne-re':{id:'confuse-wa-ne-re',type:'conceptual',level:3,q:'How do you tell わ, ね, and れ apart?',correct:'わ loops low, ね has a fuller looped tail, and れ ends in a simpler hook',wrong:['They are the same shape','Only れ is a real kana'],prereqs:['row-w','row-n','row-r']},
  'confuse-ru-ro':{id:'confuse-ru-ro',type:'conceptual',level:3,q:'How do you tell る from ろ?',correct:'る curls into a hook, while ろ ends more cleanly',wrong:['ろ has the hook','They sound the same'],prereqs:['row-r']},
  'confuse-i-ri':{id:'confuse-i-ri',type:'conceptual',level:3,q:'How do you tell い from り?',correct:'い opens with two separate strokes, while り starts with a longer left stroke and shorter right stroke',wrong:['り is just a voiced い','They belong to different scripts'],prereqs:['row-a','row-r']},
  'confuse-a-o':{id:'confuse-a-o',type:'conceptual',level:3,q:'How do you tell あ from お?',correct:'あ has a fuller loop and crossing shape, while お opens with a curved left stroke and simpler right side',wrong:['お is just a smaller あ','They sound the same'],prereqs:['row-a']},
  'confuse-u-tsu':{id:'confuse-u-tsu',type:'conceptual',level:3,q:'How do you tell う from つ?',correct:'う is more open and rounded, while つ sweeps farther to the left before curling down',wrong:['つ is the voiced form of う','They are from the same row'],prereqs:['row-a','row-t']},
};

const FOUNDATION_NODE = {
  'kana-foundation':{id:'kana-foundation',type:'conceptual',level:4,q:'What are the two phonetic scripts in Japanese?',correct:'Hiragana and Katakana',wrong:['Kanji and Romaji','Latin and Greek'],prereqs:[]},
};

const SHARED_PREREQ_NODES = Object.assign(
  {},
  buildHiraNodes(SOURCE_RECORDS),
  ROW_NODES,
  VOICING_NODES,
  SPECIAL_NODES,
  CONFUSABLE_NODES,
  FOUNDATION_NODE
);

function wireL1toL2(PREREQ_DAG){
  const rules = [
    [/which word means/i, ['kana-foundation']],
    [/a-row|vowel/i, ['row-a']],
    [/k-row/i, ['row-k']],
    [/s-row/i, ['row-s']],
    [/t-row/i, ['row-t']],
    [/n-row/i, ['row-n']],
    [/h-row/i, ['row-h']],
    [/m-row/i, ['row-m']],
    [/y-row/i, ['row-y']],
    [/r-row/i, ['row-r']],
    [/w-row|を\b|ん\b/i, ['row-w']],
    [/dakuten|voiced/i, ['voicing-k-g','voicing-s-z','voicing-t-d','voicing-h-b']],
    [/handakuten|semi-voiced|p-row/i, ['semi-voicing-h-p']],
    [/small tsu|っ/i, ['small-tsu-rule']],
    [/small ya|small yu|small yo|ゃ|ゅ|ょ|yoon/i, ['yoon-blends']],
    [/は.*ほ|ほ.*は/i, ['confuse-ha-ho']],
    [/ぬ.*め|め.*ぬ/i, ['confuse-nu-me']],
    [/き.*さ|さ.*き/i, ['confuse-ki-sa']],
    [/わ.*ね|ね.*れ|わ.*れ/i, ['confuse-wa-ne-re']],
    [/る.*ろ|ろ.*る/i, ['confuse-ru-ro']],
    [/い.*り|り.*い/i, ['confuse-i-ri']],
    [/あ.*お|お.*あ/i, ['confuse-a-o']],
    [/う.*つ|つ.*う/i, ['confuse-u-tsu']],
  ];

  Object.values(PREREQ_DAG).forEach(node => {
    if(node.level !== 1 || !node.autoGen || (node.prereqs || []).length > 0) return;
    const matched = new Set();
    const question = String(node.q || '');
    const answer = String(node.correct || '');
    const kanaChars = [...question].filter(isKanaChar);
    const singleKanaMatch = question.match(/romaji for\s+([ぁ-ん])\s*\?/i);

    if(singleKanaMatch){
      const kana = singleKanaMatch[1];
      const nodeId = `hira-${kana.charCodeAt(0).toString(16)}`;
      if(PREREQ_DAG[nodeId]) matched.add(nodeId);
      kanaPrereqs(kana).forEach(id => { if(PREREQ_DAG[id]) matched.add(id); });
    }

    if(/romaji for/i.test(question) && kanaChars.length > 1){
      uniqueBy(kanaChars.map(rowIdForKana), id => id).forEach(id => {
        if(PREREQ_DAG[id]) matched.add(id);
      });
      kanaChars.map(voicingNodeForKana).filter(Boolean).forEach(id => {
        if(PREREQ_DAG[id]) matched.add(id);
      });
      if(kanaChars.some(ch => ch === 'っ') && PREREQ_DAG['small-tsu-rule']) matched.add('small-tsu-rule');
      if(kanaChars.some(ch => SMALL_Y_KANA.has(ch)) && PREREQ_DAG['yoon-blends']) matched.add('yoon-blends');
    }

    rules.forEach(([re, ids]) => {
      if(re.test(question) || re.test(answer)){
        ids.forEach(id => { if(PREREQ_DAG[id]) matched.add(id); });
      }
    });

    if(matched.size === 0 && PREREQ_DAG['kana-foundation']) matched.add('kana-foundation');
    node.prereqs = [...matched];
  });
}

const KANA = {
  id:'kana',
  name:'Kana Reading',
  description:'Learn hiragana by reading Grade 1 vocabulary words',
  icon:'あ',
  inputMode:'quiz',
  prefixLabel:null,
  title:'よみかた',
  subtitle:'DEFENSE',
  startButton:'はじめ',
  instructions:'Read Japanese words written in <b>hiragana</b>. Identify the English meaning, fill missing kana, and decompose misses into romaji and single-kana reading practice.',
  instructionsSub:'Grade 1 vocabulary + beginner supplements · 160 cards · meaning → romaji → kana',
  identifyPrompt:'What does this word mean?',
  variablePrompt:'What does <span id="var-symbol" style="display:inline-block"></span> represent in this word?',
  applicationPrompt:'Which word matches this written clue?',
  commands: COMMANDS,

  generateQuestion(cmd, allCommands){
    const difficulty = (typeof G !== 'undefined' && G && G.difficulty) || 'learn';
    const weightsByDifficulty = {
      learn:{identify:0.40,fillblank:0.25,variable:0.15,application:0.10},
      practice:{identify:0.25,fillblank:0.325,variable:0.15,application:0.175},
      challenge:{identify:0.10,fillblank:0.40,variable:0.15,application:0.25},
    };
    const selected = weightsByDifficulty[difficulty] || weightsByDifficulty.learn;
    const weights = {identify:selected.identify};
    if(cmd.blanks && cmd.blanks.length) weights.fillblank = selected.fillblank;
    if(this.variableBank && this.variableBank[cmd.id] && this.variableBank[cmd.id].length) weights.variable = selected.variable;
    if(this.applicationBank && this.applicationBank[cmd.id] && this.applicationBank[cmd.id].length) weights.application = selected.application;

    const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
    let roll = Math.random() * total;
    let pick = 'identify';
    Object.keys(weights).forEach(type => {
      if(pick !== 'identify' && pick !== type) return;
      if(roll <= 0) return;
      roll -= weights[type];
      if(roll <= 0) pick = type;
    });

    if(pick === 'identify'){
      const distractors = pickActionDistractors(cmd, allCommands, 3);
      const options = shuffleArr([stripActionLabel(cmd.action)].concat(distractors.map(candidate => stripActionLabel(candidate.action))));
      const correctLabel = stripActionLabel(cmd.action);
      const correctIdx = options.indexOf(correctLabel);
      return {type:'identify',latex:cmd.latex,options:options,correctIdx:correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    if(pick === 'variable'){
      const vars = this.variableBank[cmd.id];
      const entry = vars[Math.floor(Math.random() * vars.length)];
      const otherDescs = [];
      Object.keys(this.variableBank || {}).forEach(id => {
        if(id === cmd.id) return;
        (this.variableBank[id] || []).forEach(candidate => {
          if(candidate.d !== entry.d && otherDescs.indexOf(candidate.d) < 0) otherDescs.push(candidate.d);
        });
      });
      const options = shuffleArr([entry.d].concat(shuffleArr(otherDescs).slice(0, 3)));
      const correctIdx = options.indexOf(entry.d);
      return {type:'variable',latex:cmd.latex,symbol:entry.s,options:options,correctIdx:correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    if(pick === 'application'){
      const apps = this.applicationBank[cmd.id];
      const app = apps[Math.floor(Math.random() * apps.length)];
      const options = shuffleArr(buildApplicationOptions(cmd, allCommands || [], app.confusionSet || []));
      const correctValue = cmd.dom === 'kana' ? cmd.latex : stripActionLabel(cmd.action);
      const correctIdx = options.indexOf(correctValue);
      return {type:'application',scenario:app.scenario,options:options,correctIdx:correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    const blank = cmd.blanks[Math.floor(Math.random() * cmd.blanks.length)];
    const choices = shuffleArr(blank.choices.slice());
    const correctIdx = choices.indexOf(blank.answer);
    return {type:'fillblank',latex:blank.latex,answer:blank.answer,choices:choices,correctIdx:correctIdx,fullLatex:cmd.latex};
  },

  formatPrompt(cmd){ return cmd.latex || cmd.action; },
  formatAnswer(cmd){ return cmd.action; },

  validateBlank(input, answer){
    return normalizeLookup(input) === normalizeLookup(answer);
  },
};

KANA.variableBank = VARIABLE_BANK;
KANA.applicationBank = APPLICATION_BANK;
KANA.relationshipBank = RELATIONSHIP_BANK;
KANA.explanationGlossary = EXPLANATION_GLOSSARY;
KANA.autoBlankSpecs = AUTO_BLANK_SPECS;
KANA.domLabels = DOM_LABELS;
KANA.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANA.normalizeExplanationLookup = normalizeLookup;
KANA.buildExplanationBank = function(){
  const byId = {};
  const byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, index) => {
    byId[index] = entry;
    (entry.keys || []).forEach(key => {
      byLabel[normalizeLookup(key)] = entry;
    });
  });
  return {byId: byId, byLabel: byLabel};
};
KANA.wireL1toL2 = wireL1toL2;

if(typeof process !== 'undefined' && process && Array.isArray(process.argv) && /(^|[\\/])kana-cartridge\.js$/.test(process.argv[2] || '')){
  window.KANA_CARTRIDGE = KANA;
}

window.KANA_DATA = KANA;

if(typeof window.TD_CARTRIDGES !== 'undefined' && !window.KANJI_G1_DATA){
  window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
  const existingIndex = window.TD_CARTRIDGES.findIndex(cart => cart && cart.id === KANA.id);
  if(existingIndex >= 0) window.TD_CARTRIDGES[existingIndex] = KANA;
  else window.TD_CARTRIDGES.push(KANA);
}

})();
