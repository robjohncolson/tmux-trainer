// Joyo Kanji Grade 5 — Formula Defense Cartridge
// 193 kanji · compound-completion blanks · reading-in-word subconcepts
(function(){

function shuffleArr(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function uniqueBy(items,keyFn){const seen=new Set();return items.filter(item=>{const key=keyFn(item);if(seen.has(key))return false;seen.add(key);return true})}
function makeId(kanji){return 'k-'+kanji.charCodeAt(0).toString(16)}
function parseComponents(spec){
  return String(spec||'').split(';').map(part=>part.trim()).filter(Boolean).map(part=>{
    const idx=part.indexOf(':');
    return idx===-1?{s:part,d:'component'}:{s:part.slice(0,idx),d:part.slice(idx+1)};
  });
}
function buildBlankLatex(word,kanji){
  const blank='\\boxed{\\,?\\,}';
  return word.includes(kanji)?word.replace(kanji,blank):blank+word;
}
function normalizeLookup(s){return String(s||'').toLowerCase().trim().replace(/\s+/g,'-')}
function pickDistinct(pool,correct,index,step){
  const picks=[];
  if(!pool.length)return ['unknown','unknown'];
  let cursor=index+1;
  const stride=step||11;
  while(picks.length<2){
    const candidate=pool[cursor%pool.length];
    if(candidate&&candidate!==correct&&!picks.includes(candidate))picks.push(candidate);
    cursor+=stride;
  }
  return picks;
}

const G5_SOURCE = [
  [
    "久",
    "long time",
    "regular",
    "キュウ, ク",
    "ひさ.しい",
    "久しぶり",
    "ひさしぶり",
    "after a long time",
    "恒久",
    "久:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ひさしぶり appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "士",
    "warrior",
    "regular",
    "シ",
    "さむらい",
    "武士",
    "ぶし",
    "samurai",
    "兵士",
    "士:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read ぶし, and this character is one piece of it."
  ],
  [
    "支",
    "support",
    "regular",
    "シ",
    "か.う, ささ.える, つか.える",
    "支援",
    "しえん",
    "support",
    "支持",
    "支:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read しえん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "比",
    "compare",
    "core",
    "ヒ",
    "くら.べる",
    "比較",
    "ひかく",
    "comparison",
    "比例",
    "比:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read ひかく, and this character is one piece of it."
  ],
  [
    "仏",
    "Buddha",
    "regular",
    "フツ, ブツ",
    "ほとけ",
    "仏教",
    "ぶっきょう",
    "Buddhism",
    "仏像",
    "仏:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ぶっきょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "圧",
    "pressure",
    "core",
    "アツ, エン, オウ",
    "お.さえる, お.す, おさ.える, へ.す",
    "圧力",
    "あつりょく",
    "pressure",
    "弾圧",
    "土:earth/ground;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read あつりょく, and this character is one piece of it."
  ],
  [
    "永",
    "eternal",
    "core",
    "エイ",
    "なが.い",
    "永遠",
    "えいえん",
    "eternity",
    "永久",
    "永:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read えいえん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "可",
    "possible",
    "core",
    "カ, コク",
    "-べ.き, -べ.し",
    "可能",
    "かのう",
    "possible",
    "可決",
    "可:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read かのう, and this character is one piece of it."
  ],
  [
    "刊",
    "publish",
    "regular",
    "カン",
    "—",
    "週刊",
    "しゅうかん",
    "weekly publication",
    "創刊",
    "刂:knife/blade;phonetic:phonetic side;support:structural support",
    "A familiar term read しゅうかん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "旧",
    "former",
    "core",
    "キュウ",
    "ふる.い, もと",
    "旧友",
    "きゅうゆう",
    "old friend",
    "旧式",
    "旧:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きゅうゆう, and this character is one piece of it."
  ],
  [
    "句",
    "phrase",
    "regular",
    "ク",
    "—",
    "俳句",
    "はいく",
    "haiku",
    "文句",
    "句:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read はいく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "史",
    "history",
    "core",
    "シ",
    "—",
    "歴史",
    "れきし",
    "history",
    "歷史",
    "史:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read れきし, and this character is one piece of it."
  ],
  [
    "示",
    "show",
    "core",
    "シ, ジ",
    "しめ.す",
    "指示",
    "しじ",
    "instructions",
    "展示",
    "示:altar/show;phonetic:phonetic side;support:structural support",
    "A familiar term read しじ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "犯",
    "offense",
    "core",
    "ハン, ボン",
    "おか.す",
    "犯罪",
    "はんざい",
    "crime",
    "犯行",
    "犯:whole character form;stroke:stroke anchor;shape:overall shape",
    "Law, order, or an official decision is involved, and a familiar term read はんざい fits the scene."
  ],
  [
    "布",
    "cloth",
    "core",
    "フ, ホ",
    "きれ, し.く, ぬの",
    "布団",
    "ふとん",
    "bedding",
    "配布",
    "布:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ふとん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "弁",
    "speech",
    "regular",
    "ヘン, ベン",
    "あらそ.う, かんむり, はなびら, わ.ける, わきま.える",
    "弁当",
    "べんとう",
    "boxed lunch",
    "弁護",
    "弁:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read べんとう, and this character is one piece of it."
  ],
  [
    "因",
    "cause",
    "core",
    "イン",
    "ちな.む, よ.る",
    "原因",
    "げんいん",
    "cause",
    "要因",
    "囗:enclosure;phonetic:phonetic side;support:structural support",
    "A familiar term read げんいん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "仮",
    "temporary",
    "core",
    "カ, ケ",
    "かり, かり-",
    "仮粧",
    "けしょう",
    "decoration",
    "仮面",
    "亻:person side;role:person cue;support:structural support",
    "The clue turns on who someone is or how they are treated, and a familiar term read けしょう fits it."
  ],
  [
    "件",
    "matter",
    "core",
    "ケン",
    "くだん",
    "事件",
    "じけん",
    "event",
    "条件",
    "亻:person side;role:person cue;support:structural support",
    "A person's role, identity, or position is central here, and a familiar term read じけん fits the scene."
  ],
  [
    "再",
    "again",
    "core",
    "サ, サイ",
    "ふたた.び",
    "再開",
    "さいかい",
    "reopening",
    "再建",
    "再:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read さいかい, and this character is one piece of it."
  ],
  [
    "在",
    "exist",
    "core",
    "ザイ",
    "あ.る",
    "存在",
    "そんざい",
    "existence",
    "在学",
    "在:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read そんざい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "団",
    "group",
    "core",
    "ダン, トン",
    "かたまり, まる.い",
    "団体",
    "だんたい",
    "group",
    "集団",
    "囗:enclosure;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read だんたい, and this character is one piece of it."
  ],
  [
    "任",
    "duty",
    "core",
    "ニン",
    "まか.す, まか.せる",
    "責任",
    "せきにん",
    "duty",
    "辞任",
    "亻:person side;role:person cue;support:structural support",
    "A person's role, identity, or position is central here, and a familiar term read せきにん fits the scene."
  ],
  [
    "囲",
    "surround",
    "regular",
    "イ",
    "かこ.い, かこ.う, かこ.む",
    "周囲",
    "しゅうい",
    "circumference",
    "範囲",
    "囗:enclosure;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read しゅうい, and this character is one piece of it."
  ],
  [
    "応",
    "respond",
    "core",
    "-ノウ, オウ, ヨウ",
    "あた.る, こた.える, まさに",
    "反応",
    "はんのう",
    "reaction",
    "対応",
    "応:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read はんのう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "快",
    "pleasant",
    "regular",
    "カイ",
    "こころよ.い",
    "快適",
    "かいてき",
    "comfort",
    "快晴",
    "忄:heart/mind;mind:mind cue;support:structural support",
    "The clue depends on emotion or state of mind, and a familiar term read かいてき fits the scene."
  ],
  [
    "技",
    "skill",
    "core",
    "ギ",
    "わざ",
    "技術",
    "ぎじゅつ",
    "art",
    "競技",
    "扌:hand radical;grip:hand action cue;support:structural support",
    "Hands-on work like taking, giving, or handling something makes a familiar term read ぎじゅつ fit here."
  ],
  [
    "均",
    "equal",
    "core",
    "キン",
    "なら.す",
    "均衡",
    "きんこう",
    "equilibrium",
    "均等",
    "土:earth/ground;number:quantity cue;support:structural support",
    "The scene depends on rates, averages, or measured size, and a familiar term read きんこう fits it."
  ],
  [
    "告",
    "inform",
    "core",
    "コク",
    "つ.げる",
    "報告",
    "ほうこく",
    "report",
    "広告",
    "告:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ほうこく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "災",
    "disaster",
    "core",
    "サイ",
    "わざわ.い",
    "災害",
    "さいがい",
    "calamity",
    "火災",
    "災:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read さいがい, and this character is one piece of it."
  ],
  [
    "志",
    "ambition",
    "core",
    "シ",
    "こころざ.す, こころざし, シリング",
    "志望",
    "しぼう",
    "aspiration",
    "意志",
    "志:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read しぼう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "似",
    "resemble",
    "regular",
    "ジ",
    "に.る, ひ.る",
    "類似",
    "るいじ",
    "resemblance",
    "真似",
    "亻:person side;role:person cue;support:structural support",
    "The clue turns on who someone is or how they are treated, and a familiar term read るいじ fits it."
  ],
  [
    "序",
    "order",
    "regular",
    "ジョ",
    "つい.で, ついで",
    "秩序",
    "ちつじょ",
    "order",
    "順序",
    "序:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ちつじょ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "条",
    "clause",
    "core",
    "ジョウ, チョウ, デキ",
    "えだ, すじ",
    "条件",
    "じょうけん",
    "condition",
    "条約",
    "条:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read じょうけん, and this character is one piece of it."
  ],
  [
    "状",
    "condition",
    "core",
    "ジョウ",
    "—",
    "状況",
    "じょうきょう",
    "state of affairs",
    "状勢",
    "状:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read じょうきょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "判",
    "judge",
    "core",
    "ハン, バン",
    "わか.る",
    "判断",
    "はんだん",
    "judgment",
    "判定",
    "刂:knife/blade;rule:rule cue;support:structural support",
    "Law, order, or an official decision is involved, and a familiar term read はんだん fits the scene."
  ],
  [
    "防",
    "prevent",
    "core",
    "ボウ",
    "ふせ.ぐ",
    "防衛",
    "ぼうえい",
    "defense",
    "国防",
    "防:whole character form;stroke:stroke anchor;shape:overall shape",
    "A rule, ruling, or public notice makes a familiar term read ぼうえい fit here."
  ],
  [
    "余",
    "surplus",
    "regular",
    "ヨ",
    "あま.す, あま.り, あま.る, あんま.り",
    "余裕",
    "よゆう",
    "composure",
    "余地",
    "余:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read よゆう, and this character is one piece of it."
  ],
  [
    "易",
    "easy",
    "core",
    "イ, エキ",
    "やさ.しい, やす.い",
    "貿易",
    "ぼうえき",
    "trade",
    "容易",
    "易:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ぼうえき appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "往",
    "go toward",
    "core",
    "オウ",
    "い.く, いにしえ, さき.に, ゆ.く",
    "往復",
    "おうふく",
    "correspondence",
    "一往",
    "往:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read おうふく, and this character is one piece of it."
  ],
  [
    "価",
    "value",
    "core",
    "カ, ケ",
    "あたい",
    "価格",
    "かかく",
    "price",
    "評価",
    "亻:person side;value:value cue;support:structural support",
    "A receipt, budget, or account sheet makes a familiar term read かかく fit this scene."
  ],
  [
    "河",
    "river",
    "regular",
    "カ",
    "かわ",
    "河口",
    "かわぐち",
    "mouth of river",
    "河川",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Something fluid or mixed is central, and a familiar term read かわぐち fits the situation."
  ],
  [
    "居",
    "reside",
    "core",
    "キョ, コ",
    "-い, い.る, お.る",
    "住居",
    "じゅうきょ",
    "dwelling",
    "居間",
    "居:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read じゅうきょ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "効",
    "effect",
    "core",
    "コウ",
    "き.く, ききめ, なら.う",
    "効果",
    "こうか",
    "effects",
    "有効",
    "効:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read こうか, and this character is one piece of it."
  ],
  [
    "妻",
    "wife",
    "regular",
    "サイ",
    "つま",
    "夫妻",
    "ふさい",
    "husband and wife",
    "妻子",
    "女:woman;phonetic:phonetic side;support:structural support",
    "A familiar term read ふさい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "枝",
    "branch",
    "regular",
    "シ",
    "えだ",
    "枝",
    "えだ",
    "branch",
    "小枝",
    "木:tree/wood;nature:nature cue;support:structural support",
    "The clue points to something natural or material, and a familiar term read えだ fits it."
  ],
  [
    "舎",
    "building",
    "regular",
    "シャ, セキ",
    "やど.る",
    "校舎",
    "こうしゃ",
    "school building",
    "田舎",
    "宀:roof;structure:building cue;support:structural support",
    "A room, school site, or large hall is central here, and a familiar term read こうしゃ fits the scene."
  ],
  [
    "述",
    "state",
    "core",
    "ジュツ",
    "の.べる",
    "記述",
    "きじゅつ",
    "description",
    "供述",
    "述:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きじゅつ, and this character is one piece of it."
  ],
  [
    "招",
    "invite",
    "regular",
    "ショウ",
    "まね.く",
    "招待",
    "しょうたい",
    "invitation",
    "招致",
    "扌:hand radical;grip:hand action cue;support:structural support",
    "Hands-on work like taking, giving, or handling something makes a familiar term read しょうたい fit here."
  ],
  [
    "制",
    "control",
    "core",
    "セイ",
    "—",
    "規制",
    "きせい",
    "regulation",
    "制度",
    "刂:knife/blade;rule:rule cue;support:structural support",
    "Law, order, or an official decision is involved, and a familiar term read きせい fits the scene."
  ],
  [
    "性",
    "nature",
    "core",
    "ショウ, セイ",
    "さが",
    "女性",
    "じょせい",
    "feminine gender",
    "男性",
    "忄:heart/mind;mind:mind cue;support:structural support",
    "Feelings, habits, or someone's inner state make a familiar term read じょせい fit here."
  ],
  [
    "毒",
    "poison",
    "regular",
    "ドク",
    "—",
    "中毒",
    "ちゅうどく",
    "addiction",
    "消毒",
    "毒:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read ちゅうどく, and this character is one piece of it."
  ],
  [
    "版",
    "edition",
    "regular",
    "ハン",
    "—",
    "出版",
    "しゅっぱん",
    "publication",
    "版画",
    "版:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read しゅっぱん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "肥",
    "fertile",
    "regular",
    "ヒ",
    "こ.える, こ.やし, こ.やす, こえ, ふと.る",
    "肥満",
    "ひまん",
    "corpulence",
    "肥料",
    "月:flesh/body;body:body cue;support:structural support",
    "A bodily feature or state matters here, and a familiar term read ひまん fits it."
  ],
  [
    "非",
    "wrong",
    "core",
    "ヒ",
    "あら.ず",
    "非常",
    "ひじょう",
    "emergency",
    "是非",
    "非:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ひじょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "武",
    "military",
    "core",
    "ブ, ム",
    "たけ, たけ.し",
    "武道",
    "ぶどう",
    "martial arts",
    "武器",
    "止:foot/stop;phonetic:phonetic side;support:structural support",
    "The clue points to defense or rough public disorder, and a familiar term read ぶどう fits here."
  ],
  [
    "紀",
    "chronicle",
    "regular",
    "キ",
    "—",
    "世紀",
    "せいき",
    "century",
    "紀元",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "Linked strands, cloth, totals, or putting parts together makes a familiar term read せいき fit the scene."
  ],
  [
    "逆",
    "reverse",
    "regular",
    "ギャク, ゲキ",
    "さか, さか.さ, さか.らう",
    "逆さ",
    "さかさ",
    "inverted",
    "反逆",
    "辶:walk road;path:movement cue;support:structural support",
    "Movement along a path matters in this clue, and a familiar term read さかさ fits the scene."
  ],
  [
    "型",
    "model",
    "regular",
    "ケイ",
    "-がた, かた",
    "大型",
    "おおがた",
    "large type",
    "型紙",
    "型:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read おおがた appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "限",
    "limit",
    "core",
    "ゲン",
    "-かぎ.り, かぎ.り, かぎ.る",
    "期限",
    "きげん",
    "term",
    "権限",
    "限:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きげん, and this character is one piece of it."
  ],
  [
    "故",
    "reason",
    "core",
    "コ",
    "ふる.い, もと, ゆえ",
    "故郷",
    "ふるさと",
    "ruins",
    "故里",
    "故:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ふるさと appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "厚",
    "thick",
    "core",
    "コウ",
    "あか, あつ.い",
    "濃厚",
    "のうこう",
    "passionate",
    "厚さ",
    "厚:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read のうこう, and this character is one piece of it."
  ],
  [
    "査",
    "investigate",
    "core",
    "サ",
    "—",
    "捜査",
    "そうさ",
    "search",
    "調査",
    "査:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read そうさ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "政",
    "politics",
    "core",
    "ショウ, セイ",
    "まつりごと, まん",
    "行政",
    "ぎょうせい",
    "administration",
    "財政",
    "政:whole character form;stroke:stroke anchor;shape:overall shape",
    "Law, order, or an official decision is involved, and a familiar term read ぎょうせい fits the scene."
  ],
  [
    "祖",
    "ancestor",
    "regular",
    "ソ",
    "—",
    "祖父",
    "そふ",
    "grandfather",
    "祖母",
    "示:altar/show;phonetic:phonetic side;support:structural support",
    "A familiar term read そふ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "則",
    "rule",
    "core",
    "ソク",
    "すなわち, のっと.る, のり",
    "原則",
    "げんそく",
    "principle",
    "規則",
    "則:whole character form;stroke:stroke anchor;shape:overall shape",
    "Law, order, or an official decision is involved, and a familiar term read げんそく fits the scene."
  ],
  [
    "独",
    "alone",
    "core",
    "トク, ドク",
    "ひと.り",
    "独立",
    "どくりつ",
    "independence",
    "独特",
    "独:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read どくりつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "保",
    "protect",
    "core",
    "ホ, ホウ",
    "たも.つ",
    "保護",
    "ほご",
    "preservation",
    "確保",
    "亻:person side;role:person cue;support:structural support",
    "The clue turns on who someone is or how they are treated, and a familiar term read ほご fits it."
  ],
  [
    "迷",
    "astray",
    "core",
    "メイ",
    "まよ.う",
    "混迷",
    "こんめい",
    "turmoil",
    "迷惑",
    "辶:walk road;path:movement cue;support:structural support",
    "A route, direction change, or moving from place to place makes a familiar term read こんめい fit here."
  ],
  [
    "益",
    "benefit",
    "core",
    "エキ, ヤク",
    "ま.す",
    "利益",
    "りえき",
    "profit",
    "損益",
    "益:whole character form;stroke:stroke anchor;shape:overall shape",
    "Money is being tracked carefully, and a familiar term read りえき comes up here."
  ],
  [
    "桜",
    "cherry",
    "regular",
    "オウ, ヨウ",
    "さくら",
    "桜",
    "さくら",
    "hired applauder",
    "桜花",
    "木:tree/wood;nature:nature cue;support:structural support",
    "Plants, materials, or the natural world make a familiar term read さくら fit the scene."
  ],
  [
    "格",
    "status",
    "core",
    "カク, キャク, コウ, ゴウ",
    "—",
    "価格",
    "かかく",
    "price",
    "格差",
    "木:tree/wood;value:value cue;support:structural support",
    "Money is being tracked carefully, and a familiar term read かかく comes up here."
  ],
  [
    "個",
    "individual",
    "core",
    "カ, コ",
    "—",
    "個人",
    "こじん",
    "natural person",
    "個性",
    "亻:person side;role:person cue;support:structural support",
    "A person's role, identity, or position is central here, and a familiar term read こじん fits the scene."
  ],
  [
    "耕",
    "cultivate",
    "regular",
    "コウ",
    "たがや.す",
    "農耕",
    "のうこう",
    "farming",
    "耕地",
    "木:tree/wood;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read のうこう, and this character is one piece of it."
  ],
  [
    "航",
    "navigate",
    "core",
    "コウ",
    "—",
    "航空",
    "こうくう",
    "aviation",
    "航海",
    "航:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read こうくう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "財",
    "wealth",
    "core",
    "サイ, ザイ, ゾク",
    "たから",
    "財政",
    "ざいせい",
    "public finance",
    "財界",
    "貝:shell/money;value:value cue;support:structural support",
    "Money is being tracked carefully, and a familiar term read ざいせい comes up here."
  ],
  [
    "殺",
    "kill",
    "regular",
    "サイ, サツ, セツ",
    "-ごろ.し, あや.める, ころ.す, そ.ぐ",
    "殺人",
    "さつじん",
    "murder",
    "自殺",
    "殺:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read さつじん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "師",
    "expert",
    "core",
    "シ",
    "いくさ",
    "教師",
    "きょうし",
    "teacher",
    "医師",
    "師:whole character form;stroke:stroke anchor;shape:overall shape",
    "Schooling or specialized know-how is involved, and a familiar term read きょうし fits the scene."
  ],
  [
    "修",
    "repair",
    "core",
    "シュ, シュウ",
    "おさ.まる, おさ.める",
    "修理",
    "しゅうり",
    "repair",
    "修正",
    "亻:person side;role:person cue;support:structural support",
    "A person's role, identity, or position is central here, and a familiar term read しゅうり fits the scene."
  ],
  [
    "素",
    "element",
    "core",
    "ス, ソ",
    "もと",
    "元素",
    "げんそ",
    "chemical element",
    "素直",
    "素:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read げんそ, and this character is one piece of it."
  ],
  [
    "造",
    "create",
    "core",
    "ゾウ",
    "-づく.り, つく.り, つく.る",
    "造る",
    "つくる",
    "to commit",
    "構造",
    "辶:walk road;path:movement cue;support:structural support",
    "A route, direction change, or moving from place to place makes a familiar term read つくる fit here."
  ],
  [
    "能",
    "ability",
    "core",
    "ノウ",
    "あた.う, よ.く",
    "可能",
    "かのう",
    "possible",
    "機能",
    "月:flesh/body;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read かのう, and this character is one piece of it."
  ],
  [
    "破",
    "break",
    "core",
    "ハ",
    "やぶ.る, やぶ.れる, わ.れる",
    "破壊",
    "はかい",
    "crash",
    "突破",
    "石:stone radical;phonetic:phonetic side;support:structural support",
    "A familiar term read はかい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "粉",
    "powder",
    "regular",
    "フン",
    "こ, こな, デシメートル",
    "粉末",
    "ふんまつ",
    "fine powder",
    "小麦粉",
    "米:rice/grain;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read ふんまつ, and this character is one piece of it."
  ],
  [
    "脈",
    "pulse",
    "regular",
    "ミャク",
    "すじ",
    "山脈",
    "さんみゃく",
    "mountain range",
    "動脈",
    "月:flesh/body;body:body cue;support:structural support",
    "The clue centers on the body or a physical condition, and a familiar term read さんみゃく fits the scene."
  ],
  [
    "容",
    "contain",
    "core",
    "ヨウ",
    "い.れる",
    "内容",
    "ないよう",
    "contents",
    "內容",
    "宀:roof;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read ないよう, and this character is one piece of it."
  ],
  [
    "留",
    "stay",
    "core",
    "リュウ, ル",
    "と.まる, と.める, とど.まる, とど.める, るうぶる",
    "留学",
    "りゅうがく",
    "study abroad",
    "保留",
    "留:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read りゅうがく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "移",
    "move",
    "core",
    "イ",
    "うつ.す, うつ.る",
    "移動",
    "いどう",
    "movement",
    "移民",
    "移:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read いどう, and this character is one piece of it."
  ],
  [
    "液",
    "liquid",
    "core",
    "エキ",
    "—",
    "血液",
    "けつえき",
    "blood",
    "液体",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Fluid, mixing, cleaning, or a flowing substance makes a familiar term read けつえき fit here."
  ],
  [
    "眼",
    "eye",
    "core",
    "ガン, ゲン",
    "まなこ, め",
    "眼鏡",
    "めがね",
    "glasses",
    "人眼",
    "目:eye;body:body cue;support:structural support",
    "A bodily feature or state matters here, and a familiar term read めがね fits it."
  ],
  [
    "基",
    "basis",
    "core",
    "キ",
    "もと, もとい",
    "基準",
    "きじゅん",
    "standard",
    "基本",
    "土:earth/ground;phonetic:phonetic side;support:structural support",
    "A familiar term read きじゅん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "寄",
    "approach",
    "regular",
    "キ",
    "-よ.り, よ.せる, よ.る",
    "寄付",
    "きふ",
    "contribution",
    "寄附",
    "寄:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きふ, and this character is one piece of it."
  ],
  [
    "規",
    "rule",
    "core",
    "キ",
    "—",
    "規則",
    "きそく",
    "rule",
    "規模",
    "規:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read きそく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "救",
    "rescue",
    "core",
    "キュウ",
    "すく.う",
    "救援",
    "きゅうえん",
    "relief",
    "救済",
    "救:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きゅうえん, and this character is one piece of it."
  ],
  [
    "許",
    "permit",
    "core",
    "キョ",
    "もと, ゆる.す",
    "許可",
    "きょか",
    "permission",
    "免許",
    "言:speech radical;sound:speaking cue;support:structural support",
    "Someone explains, proves, thanks, or speaks formally, and a familiar term read きょか fits the scene."
  ],
  [
    "経",
    "manage",
    "core",
    "キョウ, キン, ケイ",
    "た.つ, たていと, のり, はか.る, へ.る",
    "経験",
    "けいけん",
    "experience",
    "経営",
    "糸:thread/silk;value:value cue;support:structural support",
    "Money is being tracked carefully, and a familiar term read けいけん comes up here."
  ],
  [
    "険",
    "danger",
    "core",
    "ケン",
    "けわ.しい",
    "危険",
    "きけん",
    "risk",
    "保険",
    "険:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read きけん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "現",
    "appear",
    "core",
    "ゲン",
    "あらわ.す, あらわ.れる, うつ.つ, うつつ",
    "現在",
    "げんざい",
    "present time",
    "表現",
    "現:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read げんざい, and this character is one piece of it."
  ],
  [
    "混",
    "mix",
    "core",
    "コン",
    "-ま.じり, こ.む, ま.ざる, ま.じる, ま.ぜる",
    "混乱",
    "こんらん",
    "disorder",
    "混迷",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Liquid, mixing, cleaning, or a flowing substance makes a familiar term read こんらん fit here."
  ],
  [
    "採",
    "gather",
    "core",
    "サイ",
    "と.る",
    "採点",
    "さいてん",
    "grading",
    "採用",
    "扌:hand radical;grip:hand action cue;support:structural support",
    "A direct action with the hands matters in this scene, and a familiar term read さいてん fits it."
  ],
  [
    "授",
    "grant",
    "core",
    "ジュ",
    "さず.かる, さず.ける",
    "授業",
    "じゅぎょう",
    "lesson",
    "教授",
    "扌:hand radical;grip:hand action cue;support:structural support",
    "Hands-on work like taking, giving, or handling something makes a familiar term read じゅぎょう fit here."
  ],
  [
    "術",
    "technique",
    "core",
    "ジュツ",
    "すべ",
    "技術",
    "ぎじゅつ",
    "technology",
    "手術",
    "術:whole character form;stroke:stroke anchor;shape:overall shape",
    "Schooling or expert knowledge is involved, and a familiar term read ぎじゅつ fits the scene."
  ],
  [
    "常",
    "usual",
    "core",
    "ジョウ",
    "つね, とこ-",
    "日常",
    "にちじょう",
    "everyday life",
    "正常",
    "常:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read にちじょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "情",
    "feeling",
    "core",
    "ジョウ, セイ",
    "なさ.け",
    "感情",
    "かんじょう",
    "emotion",
    "情報",
    "忄:heart/mind;mind:mind cue;support:structural support",
    "The clue depends on emotion or state of mind, and a familiar term read かんじょう fits the scene."
  ],
  [
    "責",
    "blame",
    "core",
    "セキ",
    "せ.める",
    "責任",
    "せきにん",
    "duty",
    "無責任",
    "責:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read せきにん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "接",
    "connect",
    "core",
    "ショウ, セツ",
    "つ.ぐ",
    "直接",
    "ちょくせつ",
    "direct",
    "接触",
    "扌:hand radical;grip:hand action cue;support:structural support",
    "A direct action with the hands matters in this scene, and a familiar term read ちょくせつ fits it."
  ],
  [
    "設",
    "establish",
    "core",
    "セツ",
    "もう.ける",
    "建設",
    "けんせつ",
    "construction",
    "施設",
    "言:speech radical;sound:speaking cue;support:structural support",
    "Someone explains, proves, thanks, or speaks formally, and a familiar term read けんせつ fits the scene."
  ],
  [
    "率",
    "rate",
    "core",
    "シュツ, ソツ, リツ",
    "ひき.いる",
    "比率",
    "ひりつ",
    "ratio",
    "効率",
    "率:whole character form;stroke:stroke anchor;shape:overall shape",
    "The scene depends on averages, proportions, or measured size, and a familiar term read ひりつ fits it."
  ],
  [
    "断",
    "decide",
    "core",
    "ダン",
    "ことわ.る, さだ.める, た.つ",
    "判断",
    "はんだん",
    "divination",
    "決断",
    "断:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read はんだん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "張",
    "stretch",
    "core",
    "チョウ",
    "-は.り, -ば.り, は.る",
    "緊張",
    "きんちょう",
    "tension",
    "主張",
    "張:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きんちょう, and this character is one piece of it."
  ],
  [
    "停",
    "halt",
    "core",
    "テイ",
    "と.まる, と.める",
    "停まる",
    "とまる",
    "to alight",
    "停止",
    "停:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read とまる appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "堂",
    "hall",
    "regular",
    "ドウ",
    "—",
    "食堂",
    "しょくどう",
    "restaurant",
    "講堂",
    "土:earth/ground;structure:building cue;support:structural support",
    "The setting points to a structure or place, and a familiar term read しょくどう fits it."
  ],
  [
    "得",
    "gain",
    "core",
    "トク",
    "う.る, え.る",
    "得点",
    "とくてん",
    "score",
    "取得",
    "得:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read とくてん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "貧",
    "poor",
    "core",
    "ヒン, ビン",
    "まず.しい",
    "貧困",
    "ひんこん",
    "shortage",
    "貧富",
    "貝:shell/money;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read ひんこん, and this character is one piece of it."
  ],
  [
    "婦",
    "lady",
    "regular",
    "フ",
    "よめ",
    "夫婦",
    "ふうふ",
    "married couple",
    "主婦",
    "女:woman;phonetic:phonetic side;support:structural support",
    "A familiar term read ふうふ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "務",
    "duty",
    "core",
    "ム",
    "つと.める",
    "事務",
    "じむ",
    "office work",
    "専務",
    "務:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read じむ, and this character is one piece of it."
  ],
  [
    "略",
    "omit",
    "core",
    "リャク",
    "おか.す, おさ.める, はか.る, はかりごと, はぶ.く, ほぼ",
    "省略",
    "しょうりゃく",
    "omission",
    "戦略",
    "略:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read しょうりゃく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "営",
    "operate",
    "core",
    "エイ",
    "いとな.み, いとな.む",
    "経営",
    "けいえい",
    "management",
    "運営",
    "営:whole character form;stroke:stroke anchor;shape:overall shape",
    "Money is being tracked carefully, and a familiar term read けいえい comes up here."
  ],
  [
    "過",
    "exceed",
    "core",
    "カ",
    "あやま.ち, あやま.つ, す.ぎる, す.ごす, よ.ぎる, よぎ.る",
    "過程",
    "かてい",
    "process",
    "経過",
    "過:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read かてい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "喜",
    "rejoice",
    "regular",
    "キ",
    "よろこ.ばす, よろこ.ぶ",
    "喜劇",
    "きげき",
    "comedy",
    "喜び",
    "喜:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きげき, and this character is one piece of it."
  ],
  [
    "検",
    "inspect",
    "core",
    "ケン",
    "しら.べる",
    "検査",
    "けんさ",
    "inspection",
    "検察",
    "検:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read けんさ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "減",
    "reduce",
    "core",
    "ゲン",
    "へ.らす, へ.る",
    "削減",
    "さくげん",
    "cut",
    "減少",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Something fluid or mixed is central, and a familiar term read さくげん fits the situation."
  ],
  [
    "証",
    "proof",
    "core",
    "ショウ",
    "あかし",
    "証明",
    "しょうめい",
    "proof",
    "証拠",
    "言:speech radical;sound:speaking cue;support:structural support",
    "Someone explains, proves, thanks, or speaks formally, and a familiar term read しょうめい fits the scene."
  ],
  [
    "象",
    "elephant",
    "core",
    "ショウ, ゾウ",
    "かたど.る",
    "印象",
    "いんしょう",
    "impression",
    "現象",
    "象:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read いんしょう, and this character is one piece of it."
  ],
  [
    "税",
    "tax",
    "core",
    "ゼイ",
    "—",
    "税金",
    "ぜいきん",
    "tax money",
    "消費税",
    "税:whole character form;stroke:stroke anchor;shape:overall shape",
    "A receipt, budget, or account sheet makes a familiar term read ぜいきん fit this scene."
  ],
  [
    "絶",
    "sever",
    "regular",
    "ゼツ",
    "た.える, た.つ, た.やす",
    "絶対",
    "ぜったい",
    "absoluteness",
    "中絶",
    "絶:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read ぜったい, and this character is one piece of it."
  ],
  [
    "測",
    "measure",
    "core",
    "ソク",
    "はか.る",
    "観測",
    "かんそく",
    "observation",
    "測定",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Liquid, mixing, cleaning, or a flowing substance makes a familiar term read かんそく fit here."
  ],
  [
    "属",
    "belong",
    "core",
    "ショク, ゾク",
    "さかん, つく, やから",
    "金属",
    "きんぞく",
    "metal",
    "所属",
    "属:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きんぞく, and this character is one piece of it."
  ],
  [
    "貸",
    "lend",
    "core",
    "タイ",
    "か.し-, か.す, かし-",
    "貸出",
    "かしだし",
    "lending",
    "貸出し",
    "貝:shell/money;value:value cue;support:structural support",
    "A receipt, budget, or account sheet makes a familiar term read かしだし fit this scene."
  ],
  [
    "貯",
    "save",
    "regular",
    "チョ",
    "た.める, たくわ.える",
    "貯金",
    "ちょきん",
    "savings",
    "貯蔵",
    "貝:shell/money;value:value cue;support:structural support",
    "Money is being tracked carefully, and a familiar term read ちょきん comes up here."
  ],
  [
    "提",
    "present",
    "core",
    "ダイ, チョウ, テイ",
    "さ.げる",
    "前提",
    "ぜんてい",
    "premise",
    "提案",
    "提:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ぜんてい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "程",
    "extent",
    "core",
    "テイ",
    "-ほど, ほど",
    "程度",
    "ていど",
    "degree",
    "日程",
    "程:whole character form;stroke:stroke anchor;shape:overall shape",
    "The scene depends on rates, averages, or measured size, and a familiar term read ていど fits it."
  ],
  [
    "統",
    "unite",
    "core",
    "トウ",
    "す.べる, ほび.る",
    "統一",
    "とういつ",
    "unity",
    "伝統",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "Linked strands, cloth, totals, or putting parts together makes a familiar term read とういつ fit the scene."
  ],
  [
    "費",
    "expense",
    "core",
    "ヒ",
    "つい.える, つい.やす",
    "消費",
    "しょうひ",
    "consumption",
    "費用",
    "貝:shell/money;value:value cue;support:structural support",
    "Money is being tracked carefully, and a familiar term read しょうひ comes up here."
  ],
  [
    "備",
    "prepare",
    "core",
    "ビ",
    "そな.える, そな.わる, つぶさ.に",
    "準備",
    "じゅんび",
    "preparation",
    "備品",
    "備:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read じゅんび appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "評",
    "evaluate",
    "core",
    "ヒョウ",
    "—",
    "評価",
    "ひょうか",
    "evaluation",
    "評判",
    "言:speech radical;sound:speaking cue;support:structural support",
    "The clue turns on words, explanation, or formal speech, and a familiar term read ひょうか fits here."
  ],
  [
    "復",
    "restore",
    "core",
    "フク",
    "また",
    "回復",
    "かいふく",
    "recovery",
    "快復",
    "復:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read かいふく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "報",
    "report",
    "core",
    "ホウ",
    "むく.いる",
    "報告",
    "ほうこく",
    "report",
    "情報",
    "報:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read ほうこく, and this character is one piece of it."
  ],
  [
    "貿",
    "trade",
    "regular",
    "ボウ",
    "—",
    "貿易",
    "ぼうえき",
    "trade",
    "保護貿易",
    "貝:shell/money;value:value cue;support:structural support",
    "A receipt, budget, or account sheet makes a familiar term read ぼうえき fit this scene."
  ],
  [
    "解",
    "solve",
    "core",
    "カイ, ゲ",
    "さと.る, と.かす, と.く, と.ける, ほど.く, ほど.ける, わか.る",
    "理解",
    "りかい",
    "understanding",
    "解決",
    "解:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read りかい, and this character is one piece of it."
  ],
  [
    "幹",
    "trunk",
    "regular",
    "カン",
    "みき",
    "幹事",
    "かんじ",
    "executive secretary",
    "幹部",
    "幹:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read かんじ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "義",
    "justice",
    "core",
    "ギ",
    "—",
    "主義",
    "しゅぎ",
    "doctrine",
    "義務",
    "羊:sheep;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read しゅぎ, and this character is one piece of it."
  ],
  [
    "禁",
    "forbid",
    "core",
    "キン",
    "—",
    "禁止",
    "きんし",
    "prohibition",
    "禁煙",
    "禁:whole character form;stroke:stroke anchor;shape:overall shape",
    "A rule, ruling, or public notice makes a familiar term read きんし fit here."
  ],
  [
    "鉱",
    "ore",
    "regular",
    "コウ",
    "あらがね",
    "鉱山",
    "こうざん",
    "mine",
    "鉱業",
    "石:stone radical;nature:nature cue;support:structural support",
    "The clue points to something natural or material, and a familiar term read こうざん fits it."
  ],
  [
    "罪",
    "crime",
    "core",
    "ザイ",
    "つみ",
    "犯罪",
    "はんざい",
    "crime",
    "無罪",
    "罒:net cover;rule:rule cue;support:structural support",
    "A rule, ruling, or public notice makes a familiar term read はんざい fit here."
  ],
  [
    "資",
    "resources",
    "core",
    "シ",
    "—",
    "資料",
    "しりょう",
    "materials",
    "資金",
    "貝:shell/money;value:value cue;support:structural support",
    "Money is being tracked carefully, and a familiar term read しりょう comes up here."
  ],
  [
    "飼",
    "raise",
    "regular",
    "シ",
    "か.う",
    "飼育",
    "しいく",
    "breeding",
    "飼犬",
    "飼:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read しいく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "準",
    "standard",
    "core",
    "ジュン",
    "じゅん.じる, じゅん.ずる, なぞら.える, のり, ひと.しい, みずもり",
    "基準",
    "きじゅん",
    "standard",
    "規準",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Something fluid or mixed is central, and a familiar term read きじゅん fits the situation."
  ],
  [
    "勢",
    "force",
    "core",
    "セイ, ゼイ",
    "いきお.い, はずみ",
    "姿勢",
    "しせい",
    "attitude",
    "情勢",
    "力:power;phonetic:phonetic side;support:structural support",
    "A familiar term read しせい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "損",
    "damage",
    "core",
    "ソン",
    "-そこ.なう, -そこ.ねる, そこ.なう, そこ.ねる, そこな.う",
    "損害",
    "そんがい",
    "damage",
    "損失",
    "扌:hand radical;grip:hand action cue;support:structural support",
    "A direct action with the hands matters in this scene, and a familiar term read そんがい fits it."
  ],
  [
    "墓",
    "grave",
    "regular",
    "ボ",
    "はか",
    "墓地",
    "ぼち",
    "cemetery",
    "墓参",
    "土:earth/ground;structure:building cue;support:structural support",
    "A room, building, or large structure is central here, and a familiar term read ぼち fits the scene."
  ],
  [
    "豊",
    "abundant",
    "core",
    "ブ, ホウ",
    "とよ, ゆた.か",
    "豊富",
    "ほうふ",
    "abundance",
    "豊作",
    "豊:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read ほうふ, and this character is one piece of it."
  ],
  [
    "夢",
    "dream",
    "regular",
    "ボウ, ム",
    "くら.い, ゆめ, ゆめ.みる",
    "夢中",
    "むちゅう",
    "absorbed in",
    "悪夢",
    "夢:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read むちゅう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "演",
    "perform",
    "core",
    "エン",
    "—",
    "演説",
    "えんぜつ",
    "speech",
    "公演",
    "演:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read えんぜつ, and this character is one piece of it."
  ],
  [
    "慣",
    "accustomed",
    "core",
    "カン",
    "な.らす, な.れる",
    "習慣",
    "しゅうかん",
    "habit",
    "慣習",
    "忄:heart/mind;mind:mind cue;support:structural support",
    "Feelings, habits, or someone's inner state make a familiar term read しゅうかん fit here."
  ],
  [
    "境",
    "boundary",
    "core",
    "キョウ, ケイ",
    "さかい",
    "環境",
    "かんきょう",
    "environment",
    "国境",
    "土:earth/ground;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read かんきょう, and this character is one piece of it."
  ],
  [
    "構",
    "structure",
    "core",
    "コウ",
    "かま.う, かま.える",
    "構造",
    "こうぞう",
    "structure",
    "機構",
    "構:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read こうぞう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "際",
    "occasion",
    "core",
    "サイ",
    "-ぎわ, きわ",
    "実際",
    "じっさい",
    "actual situation",
    "国際",
    "際:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read じっさい, and this character is one piece of it."
  ],
  [
    "雑",
    "mixed",
    "core",
    "ザツ, ゾウ",
    "まじ.える, まじ.る",
    "雑誌",
    "ざっし",
    "magazine",
    "複雑",
    "雑:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ざっし appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "酸",
    "acid",
    "regular",
    "サン",
    "す.い",
    "酸化",
    "さんか",
    "oxidation",
    "酸性",
    "酸:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to something natural or material, and a familiar term read さんか fits it."
  ],
  [
    "精",
    "refined",
    "core",
    "ショウ, セイ",
    "くわ.しい, しら.げる",
    "精神",
    "せいしん",
    "spirit",
    "精密",
    "米:rice/grain;phonetic:phonetic side;support:structural support",
    "A familiar term read せいしん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "製",
    "manufacture",
    "core",
    "セイ",
    "—",
    "製造",
    "せいぞう",
    "manufacture",
    "製品",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "The clue involves something woven, connected, or gathered together, and a familiar term read せいぞう fits here."
  ],
  [
    "総",
    "total",
    "core",
    "ソウ",
    "す.べて, すべ.て, ふさ",
    "総合",
    "そうごう",
    "comprehensive",
    "総会",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "Linked strands, cloth, or putting parts together makes a familiar term read そうごう fit the scene."
  ],
  [
    "像",
    "image",
    "core",
    "ゾウ",
    "—",
    "画像",
    "がぞう",
    "image",
    "映像",
    "亻:person side;role:person cue;support:structural support",
    "The clue turns on who someone is or how they are treated, and a familiar term read がぞう fits it."
  ],
  [
    "増",
    "increase",
    "core",
    "ゾウ",
    "ふ.える, ふ.やす, ま.し, ま.す",
    "増加",
    "ぞうか",
    "increase",
    "増大",
    "増:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ぞうか appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "態",
    "condition",
    "core",
    "タイ",
    "わざ.と",
    "事態",
    "じたい",
    "situation",
    "情態",
    "忄:heart/mind;mind:mind cue;support:structural support",
    "The clue depends on emotion or state of mind, and a familiar term read じたい fits the scene."
  ],
  [
    "適",
    "suitable",
    "core",
    "テキ",
    "かな.う",
    "適切",
    "てきせつ",
    "appropriate",
    "適用",
    "辶:walk road;path:movement cue;support:structural support",
    "A route, direction change, or moving from place to place makes a familiar term read てきせつ fit here."
  ],
  [
    "銅",
    "copper",
    "regular",
    "ドウ",
    "あかがね",
    "銅像",
    "どうぞう",
    "bronze statue",
    "銅",
    "金:metal;nature:nature cue;support:structural support",
    "The clue points to something natural or material, and a familiar term read どうぞう fits it."
  ],
  [
    "複",
    "duplicate",
    "core",
    "フク",
    "—",
    "複雑",
    "ふくざつ",
    "complex",
    "複数",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "Linked strands, cloth, totals, or putting parts together makes a familiar term read ふくざつ fit the scene."
  ],
  [
    "綿",
    "cotton",
    "regular",
    "メン",
    "わた",
    "綿花",
    "めんか",
    "cotton plant",
    "木綿",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "The clue involves something woven, connected, or gathered together, and a familiar term read めんか fits here."
  ],
  [
    "領",
    "territory",
    "core",
    "リョウ",
    "えり",
    "領土",
    "りょうど",
    "territory",
    "要領",
    "領:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read りょうど appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "歴",
    "history",
    "core",
    "レキ, レッキ",
    "—",
    "歴史",
    "れきし",
    "history",
    "学歴",
    "歴:whole character form;stroke:stroke anchor;shape:overall shape",
    "Schooling or expert knowledge is involved, and a familiar term read れきし fits the scene."
  ],
  [
    "確",
    "certain",
    "core",
    "カク, コウ",
    "たし.か, たし.かめる",
    "確認",
    "かくにん",
    "confirmation",
    "確実",
    "石:stone radical;phonetic:phonetic side;support:structural support",
    "A familiar term read かくにん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "潔",
    "clean",
    "regular",
    "ケツ",
    "いさぎよ.い",
    "清潔",
    "せいけつ",
    "clean",
    "潔白",
    "氵:water radical;flow:liquid cue;support:structural support",
    "Something fluid or mixed is central, and a familiar term read せいけつ fits the situation."
  ],
  [
    "賛",
    "approve",
    "regular",
    "サン",
    "たす.ける, たた.える",
    "賛成",
    "さんせい",
    "approval",
    "賛否",
    "貝:shell/money;phonetic:phonetic side;support:structural support",
    "A familiar term read さんせい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "質",
    "quality",
    "core",
    "シチ, シツ, チ",
    "ただ.す, たち, もと, わりふ",
    "質問",
    "しつもん",
    "question",
    "物質",
    "貝:shell/money;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read しつもん, and this character is one piece of it."
  ],
  [
    "賞",
    "prize",
    "core",
    "ショウ",
    "ほ.める",
    "賞金",
    "しょうきん",
    "prize money",
    "入賞",
    "貝:shell/money;phonetic:phonetic side;support:structural support",
    "A familiar term read しょうきん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "導",
    "guide",
    "core",
    "ドウ",
    "みちび.く",
    "指導",
    "しどう",
    "guidance",
    "導入",
    "導:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read しどう, and this character is one piece of it."
  ],
  [
    "編",
    "compile",
    "core",
    "ヘン",
    "-あ.み, あ.む",
    "編集",
    "へんしゅう",
    "editing",
    "編成",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "Linked strands, cloth, totals, or putting parts together makes a familiar term read へんしゅう fit the scene."
  ],
  [
    "暴",
    "violent",
    "core",
    "バク, ボウ",
    "あば.く, あば.れる",
    "暴力",
    "ぼうりょく",
    "violence",
    "暴動",
    "灬:fire dots;phonetic:phonetic side;support:structural support",
    "The clue points to defense or rough public disorder, and a familiar term read ぼうりょく fits here."
  ],
  [
    "衛",
    "defend",
    "core",
    "エ, エイ",
    "—",
    "防衛",
    "ぼうえい",
    "defense",
    "衛星",
    "衛:whole character form;stroke:stroke anchor;shape:overall shape",
    "Protection, force, or public disorder makes a familiar term read ぼうえい fit the situation."
  ],
  [
    "興",
    "interest",
    "core",
    "キョウ, コウ",
    "おこ.す, おこ.る",
    "興味",
    "きょうみ",
    "interest",
    "振興",
    "興:whole character form;stroke:stroke anchor;shape:overall shape",
    "The clue points to a common word read きょうみ, and this character is one piece of it."
  ],
  [
    "築",
    "build",
    "core",
    "チク",
    "きず.く",
    "建築",
    "けんちく",
    "construction",
    "新築",
    "築:whole character form;stroke:stroke anchor;shape:overall shape",
    "A room, school site, or large hall is central here, and a familiar term read けんちく fits the scene."
  ],
  [
    "燃",
    "burn",
    "regular",
    "ネン",
    "も.える, も.す, も.やす",
    "燃料",
    "ねんりょう",
    "fuel",
    "燃焼",
    "灬:fire dots;phonetic:phonetic side;support:structural support",
    "The clue points to a common word read ねんりょう, and this character is one piece of it."
  ],
  [
    "輸",
    "transport",
    "core",
    "シュ, ユ",
    "—",
    "輸送",
    "ゆそう",
    "transport",
    "輸出",
    "輸:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read ゆそう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "講",
    "lecture",
    "core",
    "コウ",
    "—",
    "講演",
    "こうえん",
    "lecture",
    "講師",
    "言:speech radical;sound:speaking cue;support:structural support",
    "The clue turns on words, explanation, or formal speech, and a familiar term read こうえん fits here."
  ],
  [
    "謝",
    "apologize",
    "core",
    "シャ",
    "あやま.る",
    "感謝",
    "かんしゃ",
    "thanks",
    "謝罪",
    "言:speech radical;sound:speaking cue;support:structural support",
    "Someone explains, proves, thanks, or speaks formally, and a familiar term read かんしゃ fits the scene."
  ],
  [
    "績",
    "achievements",
    "core",
    "セキ",
    "—",
    "実績",
    "じっせき",
    "achievements",
    "業績",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "The clue involves something woven, connected, or gathered together, and a familiar term read じっせき fits here."
  ],
  [
    "額",
    "amount",
    "core",
    "ガク",
    "ひたい",
    "金額",
    "きんがく",
    "amount of money",
    "総額",
    "額:whole character form;stroke:stroke anchor;shape:overall shape",
    "A receipt, budget, or account sheet makes a familiar term read きんがく fit this scene."
  ],
  [
    "織",
    "weave",
    "core",
    "シキ, ショク",
    "-お.り, -おり, お.り, お.る, おり",
    "組織",
    "そしき",
    "organization",
    "織物",
    "糸:thread/silk;fiber:thread cue;support:structural support",
    "The clue involves something woven, connected, or gathered together, and a familiar term read そしき fits here."
  ],
  [
    "職",
    "employment",
    "core",
    "ショク, ソク",
    "—",
    "就職",
    "しゅうしょく",
    "finding employment",
    "職員",
    "職:whole character form;stroke:stroke anchor;shape:overall shape",
    "A familiar term read しゅうしょく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "識",
    "knowledge",
    "core",
    "シキ",
    "し.る, しる.す",
    "知識",
    "ちしき",
    "knowledge",
    "意識",
    "言:speech radical;sound:speaking cue;support:structural support",
    "The clue turns on words, explanation, or formal speech, and a familiar term read ちしき fits here."
  ],
  [
    "護",
    "protect",
    "core",
    "ゴ",
    "まも.る",
    "保護",
    "ほご",
    "protection",
    "看護",
    "言:speech radical;sound:speaking cue;support:structural support",
    "Someone explains, proves, thanks, or speaks formally, and a familiar term read ほご fits the scene."
  ]
];

const G5_RECORDS = G5_SOURCE.map(([kanji,action,tier,on,kun,exampleWord,exampleReading,exampleMeaning,blank2Word,componentSpec,scenario])=>({
  kanji,
  id:makeId(kanji),
  action,
  tier,
  on,
  kun,
  exampleWord,
  exampleReading,
  exampleMeaning,
  blankWords:[exampleWord,blank2Word].filter(Boolean),
  components:parseComponents(componentSpec),
  scenario
}));

const COMPONENT_POOL = uniqueBy(G5_RECORDS.map(record=>record.components[0]&&`${record.components[0].s} (${record.components[0].d})`).filter(Boolean),item=>item);
const READING_POOL = uniqueBy(G5_RECORDS.map(record=>record.exampleReading).filter(Boolean),item=>item);
const MEANING_POOL = uniqueBy(G5_RECORDS.map(record=>record.exampleMeaning).filter(Boolean),item=>item);

function buildCommand(record,index){
  const componentLead=record.components[0]||{s:record.kanji,d:'whole character form'};
  const componentCorrect=`${componentLead.s} (${componentLead.d})`;
  return {
    id:record.id,
    action:record.action,
    tier:record.tier,
    dom:'g5',
    hint:`オン: ${record.on||'—'} | くん: ${record.kun||'—'} | 例: ${record.exampleWord} (${record.exampleReading})`,
    explain:`${record.kanji} uses ${record.components.map(part=>part.s).join(' + ')}. Common in ${record.exampleWord} (${record.exampleMeaning}).`,
    latex:record.kanji,
    blanks:record.blankWords.map(word=>({latex:buildBlankLatex(word,record.kanji),answer:record.kanji,choices:[record.kanji,record.kanji,record.kanji]})),
    subconcepts:[
      {
        q:`Which component/radical appears in ${record.kanji}?`,
        correct:componentCorrect,
        wrong:pickDistinct(COMPONENT_POOL,componentCorrect,index,13)
      },
      {
        q:`In ${record.exampleWord}, what is the reading?`,
        correct:record.exampleReading,
        wrong:pickDistinct(READING_POOL,record.exampleReading,index,17)
      },
      {
        q:`What does ${record.exampleWord} mean?`,
        correct:record.exampleMeaning,
        wrong:pickDistinct(MEANING_POOL,record.exampleMeaning,index,19)
      }
    ]
  };
}

const COMMANDS = G5_RECORDS.map(buildCommand);

const KANJI_G5 = {
  id:'joyo-kanji-g5',
  name:'Joyo Kanji - Grade 5',
  description:'Kanji defense for 193 Grade 5 (elementary year 5) Joyo kanji',
  icon:'経',
  inputMode:'quiz',
  prefixLabel:null,
  title:'KANJI 五年',
  subtitle:'DEFENSE',
  startButton:'出陣',
  instructions:'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub:'Grade 5 - 193 kanji - Recognition → Recall → Compounds',
  identifyPrompt:'What is the meaning of this kanji?',
  variablePrompt:'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt:'Which kanji fits this context?',
  commands:COMMANDS,

  generateQuestion(cmd, allCommands) {
    const difficulty = (typeof G !== 'undefined' && G && G.difficulty) || 'learn';
    const baseWeights = {
      learn:{identify:0.40,fillblank:0.25,variable:0.15,application:0.10},
      practice:{identify:0.25,fillblank:0.325,variable:0.15,application:0.175},
      challenge:{identify:0.10,fillblank:0.40,variable:0.15,application:0.25},
    };
    const selected = baseWeights[difficulty] || baseWeights.learn;
    const weights = {identify:selected.identify};
    if(cmd.blanks && cmd.blanks.length) weights.fillblank = selected.fillblank;
    if(this.variableBank && this.variableBank[cmd.id] && this.variableBank[cmd.id].length) weights.variable = selected.variable;
    if(this.applicationBank && this.applicationBank[cmd.id] && this.applicationBank[cmd.id].length) weights.application = selected.application;

    const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
    let roll = Math.random() * total;
    let pick = 'identify';
    for (const [type, weight] of Object.entries(weights)) {
      roll -= weight;
      if (roll <= 0) {
        pick = type;
        break;
      }
    }

    if (pick === 'identify') {
      const distractors = pickActionDistractors(cmd, allCommands, 3);
      const options = shuffleArr([cmd.action, ...distractors.map(item => item.action)]);
      const correctIdx = options.indexOf(cmd.action);
      return{type:'identify',latex:cmd.latex,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    if (pick === 'variable') {
      const vars = this.variableBank[cmd.id];
      const entry = vars[Math.floor(Math.random()*vars.length)];
      const otherDescs = [];
      for (const [id, entries] of Object.entries(this.variableBank || {})) {
        if (id === cmd.id) continue;
        for (const candidate of entries) {
          if (candidate.d !== entry.d && !otherDescs.includes(candidate.d)) otherDescs.push(candidate.d);
        }
      }
      const options = shuffleArr([entry.d, ...shuffleArr(otherDescs).slice(0, 3)]);
      const correctIdx = options.indexOf(entry.d);
      return{type:'variable',latex:cmd.latex,symbol:entry.s,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    if (pick === 'application') {
      const apps = this.applicationBank[cmd.id];
      const app = apps[Math.floor(Math.random()*apps.length)];
      const options = [];
      const used = new Set();
      function addOption(text) {
        if (!text) return;
        const key = text.toLowerCase();
        if (used.has(key)) return;
        used.add(key);
        options.push(text);
      }
      addOption(cmd.action);
      for (const id of app.confusionSet || []) addOption(commandActionFromId(id));
      for (const distractor of pickActionDistractors(cmd, allCommands, 3)) addOption(distractor.action);
      const shuffled = shuffleArr(options.slice(0, 4));
      const correctIdx = shuffled.indexOf(cmd.action);
      return{type:'application',scenario:app.scenario,options:shuffled,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    const blank = cmd.blanks[Math.floor(Math.random()*cmd.blanks.length)];
    const shuffled = shuffleArr([...blank.choices]);
    const correctIdx = shuffled.indexOf(blank.answer);
    return{type:'fillblank',latex:blank.latex,answer:blank.answer,choices:shuffled,correctIdx,fullLatex:cmd.latex};
  },

  formatPrompt(cmd) { return cmd.latex + ' — ' + cmd.action; },
  formatAnswer(cmd) { return cmd.action; },

  validateBlank(input, answer) {
    function norm(s) {
      return s.trim().toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[\\{}_^]/g, '')
        .replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
        .replace(/ō/g,'ou').replace(/ū/g,'uu').replace(/ā/g,'aa')
        .replace(/-/g,'');
    }
    return norm(input) === norm(answer);
  },
};

const VARIABLE_BANK = Object.fromEntries(G5_RECORDS.map(record=>[
  record.id,
  uniqueBy(
    [...record.components, {s:record.kanji,d:'whole character form'}],
    entry=>`${entry.s}|${entry.d}`
  ).slice(0,3)
]));

const RELATIONSHIP_BANK = {};

const EXPLANATION_GLOSSARY = G5_RECORDS.map(record=>({
  keys:[record.kanji],
  title:`${record.kanji} (${record.action})`,
  lines:[
    `Meaning: ${record.action}.`,
    `On: ${record.on||'—'} | Kun: ${record.kun||'—'}`,
    `Example: ${record.exampleWord} (${record.exampleReading})`
  ]
}));

const AUTO_BLANK_SPECS = [];

const DOM_LABELS = {
  'g5':['Grade 5 (fifth-year elementary)'],
};

const CONFUSABLE_GROUPS = [
  '財貸貯費貧資貿質賛賞',
  '技採授接招損',
  '許証設講識謝護評',
  '経総織績統紀編複綿製',
  '破確鉱',
  '精粉',
  '脈肥',
  '再在',
  '仮似',
  '査検',
  '証象像',
  '識織職',
  '復複',
  '財税貸貯費資貿益営経',
  '政則制防判犯禁罪',
  '均率測程統',
  '肥脈眼',
  '仮件任似保修個像',
  '逆迷造適',
  '液混減測潔準',
  '堂墓築舎',
  '桜酸鉱銅',
  '師術識講歴',
  '武衛暴'
].map(group=>[...group].map(makeId));

const COMMAND_BY_ID = Object.fromEntries(COMMANDS.map(cmd=>[cmd.id,cmd]));
const COMMAND_IDS = COMMANDS.map(cmd=>cmd.id);

function commandActionFromId(id) {
  return COMMAND_BY_ID[id] ? COMMAND_BY_ID[id].action : null;
}

const CONFUSABLE_MAP = (() => {
  const map = Object.fromEntries(COMMAND_IDS.map(id => [id, []]));
  for (const group of CONFUSABLE_GROUPS) {
    for (const id of group) {
      if (!map[id]) continue;
      for (const peer of group) {
        if (peer !== id && !map[id].includes(peer)) map[id].push(peer);
      }
    }
  }
  for (const id of COMMAND_IDS) {
    if (map[id].length >= 3) continue;
    for (const peer of COMMAND_IDS) {
      if (peer === id || map[id].includes(peer)) continue;
      map[id].push(peer);
      if (map[id].length >= 3) break;
    }
  }
  return map;
})();

function buildBlankChoices(cmd, blank, blankIndex) {
  const pool = [...CONFUSABLE_MAP[cmd.id], ...COMMAND_IDS]
    .filter(id => id !== cmd.id)
    .map(id => COMMAND_BY_ID[id].latex)
    .filter(choice => choice && choice !== blank.answer);
  const uniquePool = [...new Set(pool)];
  const distractors = [];
  let cursor = blankIndex % uniquePool.length;
  const step = blankIndex + 1;
  while (distractors.length < 2) {
    const candidate = uniquePool[cursor % uniquePool.length];
    if (!distractors.includes(candidate)) distractors.push(candidate);
    cursor += step;
  }
  return [blank.answer, ...distractors];
}

function pickActionDistractors(cmd, allCommands, count) {
  const byId = Object.fromEntries(allCommands.map(item => [item.id, item]));
  const picked = [];
  const used = new Set([cmd.id]);
  function addFromIds(ids) {
    for (const id of ids) {
      if (picked.length >= count) break;
      const candidate = byId[id];
      if (!candidate || used.has(candidate.id)) continue;
      picked.push(candidate);
      used.add(candidate.id);
    }
  }
  addFromIds(shuffleArr([...(CONFUSABLE_MAP[cmd.id] || [])]));
  addFromIds(shuffleArr(allCommands.filter(item => item.id !== cmd.id).map(item => item.id)));
  return picked.slice(0, count);
}

for (const cmd of COMMANDS) {
  cmd.blanks.forEach((blank, index) => {
    blank.choices = buildBlankChoices(cmd, blank, index);
  });
}

const APPLICATION_BANK = Object.fromEntries(G5_RECORDS.map(record=>[
  record.id,
  [{scenario:record.scenario,confusionSet:CONFUSABLE_MAP[record.id].slice(0,3)}]
]));

const SHARED_PREREQ_NODES = {
  "radical-mouth": {
    "id": "radical-mouth",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 口?",
    "correct": "Mouth (kuchi)",
    "wrong": [
      "Sun (nichi)",
      "Eye (me)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-sun": {
    "id": "radical-sun",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 日?",
    "correct": "Sun/day (nichi)",
    "wrong": [
      "Mouth",
      "Eye"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-eye": {
    "id": "radical-eye",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 目?",
    "correct": "Eye (me)",
    "wrong": [
      "Sun",
      "Mouth"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-tree": {
    "id": "radical-tree",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 木?",
    "correct": "Tree (ki)",
    "wrong": [
      "Person",
      "Fire"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-person": {
    "id": "radical-person",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 亻?",
    "correct": "Person (left form of 人)",
    "wrong": [
      "Tree",
      "Hand"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-water": {
    "id": "radical-water",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 氵?",
    "correct": "Water (left form of 水)",
    "wrong": [
      "Fire",
      "Person"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-fire": {
    "id": "radical-fire",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 火?",
    "correct": "Fire (hi)",
    "wrong": [
      "Water",
      "Tree"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-earth": {
    "id": "radical-earth",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 土?",
    "correct": "Earth/soil (tsuchi)",
    "wrong": [
      "King",
      "Work"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-grass": {
    "id": "radical-grass",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 艹?",
    "correct": "Grass/plant (kusakanmuri)",
    "wrong": [
      "Bamboo",
      "Rain"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-woman": {
    "id": "radical-woman",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 女?",
    "correct": "Woman (onna)",
    "wrong": [
      "Child",
      "Person"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-child": {
    "id": "radical-child",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 子?",
    "correct": "Child (ko)",
    "wrong": [
      "Woman",
      "Person"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-hand": {
    "id": "radical-hand",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 扌?",
    "correct": "Hand (left form of 手)",
    "wrong": [
      "Person",
      "Water"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-field": {
    "id": "radical-field",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 田?",
    "correct": "Rice field (ta)",
    "wrong": [
      "Mouth",
      "Eye"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-power": {
    "id": "radical-power",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 力?",
    "correct": "Power/strength (chikara)",
    "wrong": [
      "Sword",
      "Nine"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-shell": {
    "id": "radical-shell",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 貝?",
    "correct": "Shell/money (kai)",
    "wrong": [
      "Eye",
      "Field"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-rain": {
    "id": "radical-rain",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 雨?",
    "correct": "Rain/weather (ame)",
    "wrong": [
      "Roof",
      "Cloud"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-roof": {
    "id": "radical-roof",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 宀?",
    "correct": "Roof (ukanmuri)",
    "wrong": [
      "Hole",
      "Rain"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-vehicle": {
    "id": "radical-vehicle",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 車?",
    "correct": "Vehicle (kuruma)",
    "wrong": [
      "Field",
      "East"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-insect": {
    "id": "radical-insect",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 虫?",
    "correct": "Insect (mushi)",
    "wrong": [
      "Wind",
      "Shell"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-metal": {
    "id": "radical-metal",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 金?",
    "correct": "Metal/gold (kane)",
    "wrong": [
      "Shell",
      "Jewel"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-sword": {
    "id": "radical-sword",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical represents a blade or cutting?",
    "correct": "刂 (sword/knife)",
    "wrong": [
      "力 (power)",
      "十 (ten)"
    ],
    "prereqs": [
      "nature-elements"
    ]
  },
  "radical-speech": {
    "id": "radical-speech",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical relates to speech or language?",
    "correct": "言 / 訁 (speech radical)",
    "wrong": [
      "糸 (thread)",
      "門 (gate)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-walk": {
    "id": "radical-walk",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical suggests movement or walking?",
    "correct": "辶 (walk road radical)",
    "wrong": [
      "土 (earth)",
      "月 (moon)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-gate": {
    "id": "radical-gate",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 門?",
    "correct": "Gate (mon)",
    "wrong": [
      "Bird",
      "Rice"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-food": {
    "id": "radical-food",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical relates to eating or food?",
    "correct": "食 / 飠 (food radical)",
    "wrong": [
      "言 (speech)",
      "水 (water)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-horse": {
    "id": "radical-horse",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 馬?",
    "correct": "Horse (uma)",
    "wrong": [
      "Fish",
      "Bird"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-bird": {
    "id": "radical-bird",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 鳥?",
    "correct": "Bird (tori)",
    "wrong": [
      "Horse",
      "Rice"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-rice": {
    "id": "radical-rice",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 米?",
    "correct": "Rice (kome)",
    "wrong": [
      "Bird",
      "Gate"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "body-parts": {
    "id": "body-parts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 1 body-part kanji",
    "correct": "目 耳 口 手 足 (eye, ear, mouth, hand, foot)",
    "wrong": [
      "山 川 田",
      "一 二 三"
    ],
    "prereqs": [
      "radical-eye",
      "radical-mouth",
      "radical-hand"
    ]
  },
  "nature-elements": {
    "id": "nature-elements",
    "type": "conceptual",
    "level": 3,
    "q": "Name the 5 classical element kanji",
    "correct": "火 水 木 金 土 (fire, water, tree, metal, earth)",
    "wrong": [
      "上 下 左 右",
      "一 二 三 四 五"
    ],
    "prereqs": [
      "radical-fire",
      "radical-water",
      "radical-tree",
      "radical-earth"
    ]
  },
  "direction-concepts": {
    "id": "direction-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name the direction/position kanji",
    "correct": "上 下 左 右 中 東 西 南 北 (positions and cardinal directions)",
    "wrong": [
      "一 二 三",
      "男 女 子"
    ],
    "prereqs": []
  },
  "number-system": {
    "id": "number-system",
    "type": "conceptual",
    "level": 3,
    "q": "Order: 十 百 千",
    "correct": "十(10) → 百(100) → 千(1000)",
    "wrong": [
      "千→百→十",
      "百→千→十"
    ],
    "prereqs": []
  },
  "tree-density": {
    "id": "tree-density",
    "type": "conceptual",
    "level": 3,
    "q": "Order by vegetation density",
    "correct": "木(1 tree) → 林(2=grove) → 森(3=forest)",
    "wrong": [
      "森→林→木",
      "林→木→森"
    ],
    "prereqs": [
      "radical-tree"
    ]
  },
  "similar-kanji-dai": {
    "id": "similar-kanji-dai",
    "type": "conceptual",
    "level": 3,
    "q": "Distinguish: 大 犬 太 天",
    "correct": "大=big, 犬=dog(dot right), 太=fat(dot left), 天=heaven(top bar)",
    "wrong": [
      "All identical",
      "Only size differs"
    ],
    "prereqs": []
  },
  "similar-kanji-nichi": {
    "id": "similar-kanji-nichi",
    "type": "conceptual",
    "level": 3,
    "q": "Distinguish: 日 目 白 田",
    "correct": "日=sun(tall), 目=eye(wide), 白=white(top stroke), 田=field(cross)",
    "wrong": [
      "All identical",
      "Only width differs"
    ],
    "prereqs": [
      "radical-sun",
      "radical-eye",
      "radical-field"
    ]
  },
  "family-relationships": {
    "id": "family-relationships",
    "type": "conceptual",
    "level": 3,
    "q": "Name the Grade 2 family relationship kanji",
    "correct": "父 母 兄 姉 妹 弟 (family words)",
    "wrong": [
      "東 西 南 北",
      "春 夏 秋 冬"
    ],
    "prereqs": [
      "radical-woman",
      "radical-child"
    ]
  },
  "time-concepts": {
    "id": "time-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name time-related Grade 2 kanji",
    "correct": "朝 昼 夜 春 夏 秋 冬 時 週 曜 (times and seasons)",
    "wrong": [
      "刀 馬 魚 鳥",
      "言 読 書 語"
    ],
    "prereqs": [
      "radical-sun"
    ]
  },
  "communication-concepts": {
    "id": "communication-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name communication-related Grade 2 kanji",
    "correct": "言 話 語 読 聞 声 歌 答 書 (speech, reading, writing, sound)",
    "wrong": [
      "牛 馬 魚 鳥",
      "東 西 南 北"
    ],
    "prereqs": [
      "radical-speech",
      "hiragana-reading"
    ]
  },
  "onyomi-kunyomi": {
    "id": "onyomi-kunyomi",
    "type": "conceptual",
    "level": 4,
    "q": "Difference between on'yomi and kun'yomi?",
    "correct": "On = Chinese-derived reading; Kun = native Japanese reading",
    "wrong": [
      "They are the same",
      "On is always used alone"
    ],
    "prereqs": [
      "hiragana-reading",
      "katakana-vowels",
      "katakana-ka-row"
    ]
  },
  "compound-reading-rules": {
    "id": "compound-reading-rules",
    "type": "conceptual",
    "level": 4,
    "q": "In a two-kanji compound (熟語), which reading is most common?",
    "correct": "On'yomi for both kanji (音読み×2)",
    "wrong": [
      "Kun'yomi for both",
      "Mix is most common"
    ],
    "prereqs": [
      "onyomi-kunyomi"
    ]
  },
  "hiragana-reading": {
    "id": "hiragana-reading",
    "type": "conceptual",
    "level": 4,
    "q": "Can you read hiragana?",
    "correct": "Yes — basic syllabary for native Japanese words",
    "wrong": [
      "Hiragana is for foreign words",
      "Same as kanji"
    ],
    "prereqs": [
      "hiragana-vowels",
      "hiragana-ka-row",
      "hiragana-sa-row",
      "hiragana-ta-row",
      "hiragana-na-row"
    ]
  },
  "hiragana-vowels": {
    "id": "hiragana-vowels",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for あ い う え お?",
    "correct": "a i u e o",
    "wrong": [
      "e i u o a",
      "ka ki ku ke ko"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-ka-row": {
    "id": "hiragana-ka-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for か?",
    "correct": "ka",
    "wrong": [
      "ga",
      "ki"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-sa-row": {
    "id": "hiragana-sa-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for さ?",
    "correct": "sa",
    "wrong": [
      "za",
      "shi"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-ta-row": {
    "id": "hiragana-ta-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for た?",
    "correct": "ta",
    "wrong": [
      "da",
      "chi"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-na-row": {
    "id": "hiragana-na-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for な?",
    "correct": "na",
    "wrong": [
      "ni",
      "nu"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-ha-row": {
    "id": "hiragana-ha-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for は?",
    "correct": "ha",
    "wrong": [
      "ba",
      "pa"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-ma-row": {
    "id": "hiragana-ma-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for ま?",
    "correct": "ma",
    "wrong": [
      "mi",
      "na"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-ya-row": {
    "id": "hiragana-ya-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for や?",
    "correct": "ya",
    "wrong": [
      "yu",
      "wa"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-ra-row": {
    "id": "hiragana-ra-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for ら?",
    "correct": "ra",
    "wrong": [
      "la",
      "ri"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "hiragana-wa-n": {
    "id": "hiragana-wa-n",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for ん?",
    "correct": "n",
    "wrong": [
      "m",
      "ng"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "katakana-vowels": {
    "id": "katakana-vowels",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for ア イ ウ エ オ?",
    "correct": "a i u e o",
    "wrong": [
      "e i u o a",
      "ka ki ku ke ko"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "katakana-ka-row": {
    "id": "katakana-ka-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for カ?",
    "correct": "ka",
    "wrong": [
      "ga",
      "sa"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "katakana-sa-row": {
    "id": "katakana-sa-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for サ?",
    "correct": "sa",
    "wrong": [
      "za",
      "ka"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "katakana-ta-row": {
    "id": "katakana-ta-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for タ?",
    "correct": "ta",
    "wrong": [
      "da",
      "ka"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "katakana-na-row": {
    "id": "katakana-na-row",
    "type": "computational",
    "level": 4,
    "q": "What is the romaji for ナ?",
    "correct": "na",
    "wrong": [
      "ni",
      "ma"
    ],
    "prereqs": [
      "kana-basics"
    ]
  },
  "kana-basics": {
    "id": "kana-basics",
    "type": "conceptual",
    "level": 5,
    "q": "Japanese has two phonetic scripts. What are they called?",
    "correct": "Hiragana and Katakana",
    "wrong": [
      "Romaji and Kanji",
      "Hiragana and Romaji"
    ],
    "prereqs": []
  },
  "stroke-basics": {
    "id": "stroke-basics",
    "type": "conceptual",
    "level": 5,
    "q": "What are the basic stroke types?",
    "correct": "Horizontal, vertical, diagonal, turning, dot",
    "wrong": [
      "Only horizontal and vertical",
      "Only diagonal"
    ],
    "prereqs": []
  },
  "radical-water-g3": {
    "id": "radical-water-g3",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 氵?",
    "correct": "Water (left form of 水)",
    "wrong": [
      "Fire",
      "Person"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-person-action": {
    "id": "radical-person-action",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 亻?",
    "correct": "Person (left form of 人)",
    "wrong": [
      "Hand",
      "Water"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-road": {
    "id": "radical-road",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical suggests movement or a road?",
    "correct": "辶 (walk road radical)",
    "wrong": [
      "門 (gate)",
      "土 (earth)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-illness": {
    "id": "radical-illness",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical relates to sickness?",
    "correct": "疒 (illness radical)",
    "wrong": [
      "心 (heart)",
      "石 (stone)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-metal-g3": {
    "id": "radical-metal-g3",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 金 / 釒?",
    "correct": "Metal/gold (kane)",
    "wrong": [
      "Shell",
      "Jewel"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-earth-g3": {
    "id": "radical-earth-g3",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 土?",
    "correct": "Earth/soil (tsuchi)",
    "wrong": [
      "Stone",
      "Power"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-heart-g3": {
    "id": "radical-heart-g3",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical relates to heart or mind?",
    "correct": "忄 / 心 (heart radical)",
    "wrong": [
      "月 (moon/flesh)",
      "言 (speech)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-cloth": {
    "id": "radical-cloth",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical relates to clothing?",
    "correct": "衤 / 衣 (cloth radical)",
    "wrong": [
      "糸 (thread)",
      "竹 (bamboo)"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-stone": {
    "id": "radical-stone",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 石?",
    "correct": "Stone (ishi)",
    "wrong": [
      "Earth",
      "Metal"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-bamboo-g3": {
    "id": "radical-bamboo-g3",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 竹 / ⺮?",
    "correct": "Bamboo (take)",
    "wrong": [
      "Grass",
      "Tree"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "emotion-concepts": {
    "id": "emotion-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 3 emotion and mind kanji",
    "correct": "悪 意 感 想 悲 (emotion and thought words)",
    "wrong": [
      "岸 島 畑 湖",
      "鉄 銀 駅 路"
    ],
    "prereqs": [
      "radical-heart-g3"
    ]
  },
  "geography-concepts": {
    "id": "geography-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 3 geography and landscape kanji",
    "correct": "岸 島 畑 庭 湖 港 橋 (land and place words)",
    "wrong": [
      "悪 意 感 想 悲",
      "鉄 銀 駅 路"
    ],
    "prereqs": [
      "radical-water-g3",
      "radical-earth-g3"
    ]
  },
  "health-concepts": {
    "id": "health-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 3 health-related kanji",
    "correct": "病 薬 医 息 (health and body words)",
    "wrong": [
      "岸 島 畑 湖",
      "詩 談 調 題"
    ],
    "prereqs": [
      "radical-illness",
      "radical-heart-g3"
    ]
  },
  "radical-thread": {
    "id": "radical-thread",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 糸?",
    "correct": "Thread/silk (ito)",
    "wrong": [
      "Grass",
      "Bamboo"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-grain": {
    "id": "radical-grain",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 禾?",
    "correct": "Grain/rice plant (nogi)",
    "wrong": [
      "Tree",
      "Thread"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-shelter": {
    "id": "radical-shelter",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 广?",
    "correct": "Shelter/cliff (madare)",
    "wrong": [
      "Roof",
      "Gate"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-fire-g4": {
    "id": "radical-fire-g4",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 火 / 灬?",
    "correct": "Fire/flame (hi)",
    "wrong": [
      "Water",
      "Earth"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-grass-g4": {
    "id": "radical-grass-g4",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 艹?",
    "correct": "Grass/herb top (kusakanmuri)",
    "wrong": [
      "Bamboo",
      "Thread"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-power-g4": {
    "id": "radical-power-g4",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 力?",
    "correct": "Power/strength (chikara)",
    "wrong": [
      "Knife",
      "Earth"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-earth-g4": {
    "id": "radical-earth-g4",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 土?",
    "correct": "Earth/ground (tsuchi)",
    "wrong": [
      "Fire",
      "Tree"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-enclosure": {
    "id": "radical-enclosure",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 囗?",
    "correct": "Enclosure/surround (kunigamae)",
    "wrong": [
      "Mouth",
      "Gate"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-knife-g4": {
    "id": "radical-knife-g4",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 刂 / 刀?",
    "correct": "Knife/blade (katana)",
    "wrong": [
      "Power",
      "Thread"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-dish": {
    "id": "radical-dish",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 皿?",
    "correct": "Dish/plate (sara)",
    "wrong": [
      "Bowl",
      "Field"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-roof-g4": {
    "id": "radical-roof-g4",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 宀?",
    "correct": "Roof/house top (ukanmuri)",
    "wrong": [
      "Shelter",
      "Rain"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "government-concepts": {
    "id": "government-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 4 government and law kanji",
    "correct": "民 令 官 府 法 管 関 議 (government and law words)",
    "wrong": [
      "軍 兵 戦 隊",
      "松 梅 梨 菜"
    ],
    "prereqs": [
      "radical-speech",
      "radical-roof-g4",
      "radical-shelter"
    ]
  },
  "military-concepts": {
    "id": "military-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 4 military kanji",
    "correct": "軍 兵 戦 隊 (military and battle words)",
    "wrong": [
      "民 令 官 府",
      "票 選 試 験"
    ],
    "prereqs": [
      "radical-knife-g4",
      "radical-power-g4"
    ]
  },
  "measurement-concepts": {
    "id": "measurement-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 4 quantity and amount kanji",
    "correct": "量 積 億 (amount, accumulation, big numbers)",
    "wrong": [
      "松 梅 梨 菜",
      "軍 兵 戦 隊"
    ],
    "prereqs": [
      "number-system",
      "radical-grain"
    ]
  },
  "nature-g4-concepts": {
    "id": "nature-g4-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 4 nature and living-thing kanji",
    "correct": "松 梅 梨 菜 芽 果 漁 熊 (nature and living things)",
    "wrong": [
      "民 令 官 府",
      "量 積 億"
    ],
    "prereqs": [
      "radical-tree",
      "radical-grass-g4",
      "radical-fire-g4"
    ]
  },
  "prefecture-concepts": {
    "id": "prefecture-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 4 prefecture-name kanji",
    "correct": "岐 奈 阪 岡 栃 茨 埼 崎 滋 媛 潟 熊 鹿 阜 賀 佐 沖 (prefecture names)",
    "wrong": [
      "軍 兵 戦 隊",
      "量 積 億"
    ],
    "prereqs": [
      "geography-concepts",
      "direction-concepts"
    ]
  },
  "radical-shell-g5": {
    "id": "radical-shell-g5",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 貝?",
    "correct": "Shell/money (kai)",
    "wrong": [
      "Eye",
      "Field"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-hand-g5": {
    "id": "radical-hand-g5",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 扌?",
    "correct": "Hand (left form of 手)",
    "wrong": [
      "Person",
      "Water"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-speech-g5": {
    "id": "radical-speech-g5",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 言 / 訁?",
    "correct": "Speech/language (gonben)",
    "wrong": [
      "Thread",
      "Gate"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-stone-g5": {
    "id": "radical-stone-g5",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 石?",
    "correct": "Stone/rock (ishi)",
    "wrong": [
      "Earth",
      "Metal"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-flesh-g5": {
    "id": "radical-flesh-g5",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 月 / ⺝ when it means body parts?",
    "correct": "Flesh/body (nikuzuki)",
    "wrong": [
      "Moon only",
      "Heart"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-thread-g5": {
    "id": "radical-thread-g5",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 糸?",
    "correct": "Thread/silk (ito)",
    "wrong": [
      "Rice",
      "Speech"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-net": {
    "id": "radical-net",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 罒?",
    "correct": "Net/cover (yongashira)",
    "wrong": [
      "Eye",
      "Shell"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "radical-altar": {
    "id": "radical-altar",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 示 / 礻?",
    "correct": "Altar/show (shimesu)",
    "wrong": [
      "Cloth",
      "Thread"
    ],
    "prereqs": [
      "stroke-basics"
    ]
  },
  "economics-concepts": {
    "id": "economics-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 5 economics and money kanji",
    "correct": "財 税 貸 貯 費 資 貿 益 営 経 (money and economics words)",
    "wrong": [
      "肥 脈 眼",
      "武 衛 暴"
    ],
    "prereqs": [
      "radical-shell-g5",
      "measurement-concepts"
    ]
  },
  "governance-g5-concepts": {
    "id": "governance-g5-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 5 law and governance kanji",
    "correct": "政 則 制 防 判 犯 禁 罪 (government and law words)",
    "wrong": [
      "財 税 貸 貯",
      "夢 演 慣 境"
    ],
    "prereqs": [
      "government-concepts",
      "radical-net",
      "radical-knife-g4"
    ]
  },
  "body-g5-concepts": {
    "id": "body-g5-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 5 body and physical-state kanji",
    "correct": "肥 脈 眼 (body and physical condition words)",
    "wrong": [
      "財 税 費 資",
      "桜 酸 銅 鉱"
    ],
    "prereqs": [
      "radical-flesh-g5",
      "radical-eye"
    ]
  },
  "measurement-g5-concepts": {
    "id": "measurement-g5-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Name Grade 5 measurement and quantity kanji",
    "correct": "均 率 測 程 統 (measurement and quantity words)",
    "wrong": [
      "武 衛 暴",
      "祖 示 禁 罪"
    ],
    "prereqs": [
      "number-system"
    ]
  }
};

function wireL1toL2(PREREQ_DAG) {
  const rules = [
    [/radical.*貝|shell|money|treasure/i, ['radical-shell-g5']],
    [/radical.*扌|hand.*radical|grasp/i, ['radical-hand-g5']],
    [/radical.*言|訁|speech|language|word|say/i, ['radical-speech-g5']],
    [/radical.*石|stone|rock|mineral/i, ['radical-stone-g5']],
    [/radical.*米|rice|grain|powder/i, ['radical-rice']],
    [/radical.*月|⺝|flesh|meat|organ/i, ['radical-flesh-g5']],
    [/radical.*糸|thread|silk|weave|fabric/i, ['radical-thread-g5']],
    [/radical.*罒|net|cover/i, ['radical-net']],
    [/radical.*示|礻|altar|ritual|show/i, ['radical-altar']],
    [/econom|financ|money|tax|cost|price|trade|profit|wealth/i, ['economics-concepts']],
    [/govern|politic|law|rule|justice|crime|punish|restrict/i, ['governance-g5-concepts']],
    [/body.*part|flesh|organ|fat|vein|eye/i, ['body-g5-concepts']],
    [/measure|average|rate|ratio|distance|statistic|degree/i, ['measurement-g5-concepts']],
    [/on.yomi|音読/i, ['onyomi-kunyomi']],
    [/kun.yomi|訓読/i, ['onyomi-kunyomi']],
    [/reading|よみ|romaji/i, ['hiragana-reading']],
    [/カタカナ|katakana|オン.*yomi/i, ['katakana-vowels']],
    [/compound.*reading|熟語/i, ['compound-reading-rules']],
    [/radical.*口|mouth/i, ['radical-mouth']],
    [/radical.*日|sun.*radical/i, ['radical-sun']],
    [/radical.*目|eye.*radical/i, ['radical-eye']],
    [/radical.*木|tree.*radical/i, ['radical-tree']],
    [/radical.*人|person|亻/i, ['radical-person','radical-person-action']],
    [/radical.*水|water|氵|liquid/i, ['radical-water','radical-water-g3']],
    [/radical.*火|fire/i, ['radical-fire']],
    [/radical.*土|earth|soil/i, ['radical-earth','radical-earth-g3']],
    [/radical.*艹|grass|plant/i, ['radical-grass']],
    [/radical.*女|woman/i, ['radical-woman']],
    [/radical.*子|child.*radical/i, ['radical-child']],
    [/radical.*手|hand|扌/i, ['radical-hand']],
    [/radical.*田|field/i, ['radical-field']],
    [/radical.*力|power|strength/i, ['radical-power']],
    [/radical.*貝|shell/i, ['radical-shell']],
    [/radical.*雨|rain/i, ['radical-rain']],
    [/radical.*宀|roof/i, ['radical-roof']],
    [/radical.*車|vehicle/i, ['radical-vehicle']],
    [/radical.*虫|insect/i, ['radical-insect']],
    [/radical.*金|metal|釒/i, ['radical-metal','radical-metal-g3']],
    [/radical.*刀|刂|sword|blade|knife/i, ['radical-sword']],
    [/radical.*言|訁|speech|language|word/i, ['radical-speech']],
    [/radical.*辶|walk|road|path|movement/i, ['radical-walk','radical-road']],
    [/radical.*門|gate/i, ['radical-gate']],
    [/radical.*食|飠|food|eat/i, ['radical-food']],
    [/radical.*馬|horse/i, ['radical-horse']],
    [/radical.*鳥|bird/i, ['radical-bird']],
    [/radical.*米|rice/i, ['radical-rice']],
    [/radical.*疒|illness|sickness|disease/i, ['radical-illness']],
    [/radical.*心|忄|heart|mind|emotion/i, ['radical-heart-g3']],
    [/radical.*衤|衣|cloth|clothing/i, ['radical-cloth']],
    [/radical.*石|stone/i, ['radical-stone']],
    [/radical.*竹|⺮|bamboo/i, ['radical-bamboo-g3']],
    [/radical.*糸|thread|silk/i, ['radical-thread']],
    [/radical.*禾|grain|rice plant/i, ['radical-grain']],
    [/radical.*广|shelter|cliff/i, ['radical-shelter']],
    [/radical.*火|灬|fire|flame|heat|burn/i, ['radical-fire-g4']],
    [/radical.*艹|grass|plant|herb/i, ['radical-grass-g4']],
    [/radical.*力|power|strength|effort/i, ['radical-power-g4']],
    [/radical.*土|earth|ground/i, ['radical-earth-g4']],
    [/radical.*囗|enclosure|surround/i, ['radical-enclosure']],
    [/radical.*刂|刀|knife|blade|cut/i, ['radical-knife-g4']],
    [/radical.*皿|dish|plate|vessel/i, ['radical-dish']],
    [/radical.*宀|roof|house/i, ['radical-roof-g4']],
    [/government|law|rule|official|authority|administration/i, ['government-concepts']],
    [/military|army|soldier|troops|war|battle|defense/i, ['military-concepts']],
    [/measure|count|amount|accumulate|volume|billion/i, ['measurement-concepts']],
    [/prefecture|region|province|県|岐|奈|阪|岡|栃|茨|埼|崎|滋|媛|潟/i, ['prefecture-concepts']],
    [/pine|plum|pear|vegetable|bud|fruit|fishing|bear|nature/i, ['nature-g4-concepts']],
    [/component/i, ['stroke-basics']],
    [/stroke/i, ['stroke-basics']],
    [/大.*犬|犬.*大|太.*天/i, ['similar-kanji-dai']],
    [/日.*目|目.*日|白.*田/i, ['similar-kanji-nichi']],
    [/木.*林.*森|grove.*forest|density/i, ['tree-density']],
    [/十.*百.*千|hundred.*thousand/i, ['number-system']],
    [/body.*part|目.*耳|hand.*foot/i, ['body-parts']],
    [/element|火.*水.*木|nature/i, ['nature-elements']],
    [/direction|上.*下|左.*右|east|west|south|north/i, ['direction-concepts']],
    [/mother|father|sister|brother|parent|family|sibling/i, ['family-relationships']],
    [/spring|summer|autumn|winter|morning|noon|night|week|season|time/i, ['time-concepts']],
    [/talk|speak|language|word|read|write|hear|voice|song|answer|communication/i, ['communication-concepts']],
    [/emotion|feeling|mind|sad|thought|idea/i, ['emotion-concepts']],
    [/shore|island|field|garden|lake|harbor|bridge|geography|landscape/i, ['geography-concepts']],
    [/medicine|doctor|clinic|health|sick|illness|drug/i, ['health-concepts']],
  ];
  for (const node of Object.values(PREREQ_DAG)) {
    if (node.level !== 1 || !node.autoGen || node.prereqs.length > 0) continue;
    const matched = new Set();
    for (const [re, ids] of rules) {
      if (re.test(node.q) || re.test(node.correct)) {
        ids.forEach(id => { if (PREREQ_DAG[id]) matched.add(id) });
      }
    }
    if (matched.size === 0 && PREREQ_DAG['stroke-basics']) matched.add('stroke-basics');
    node.prereqs = [...matched];
  }
}

KANJI_G5.variableBank = VARIABLE_BANK;
KANJI_G5.applicationBank = APPLICATION_BANK;
KANJI_G5.relationshipBank = RELATIONSHIP_BANK;
KANJI_G5.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G5.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G5.domLabels = DOM_LABELS;
KANJI_G5.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G5.normalizeExplanationLookup = normalizeLookup;
KANJI_G5.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G5.wireL1toL2 = wireL1toL2;

window.KANJI_G5_DATA = KANJI_G5;
})();
