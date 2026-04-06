// Joyo Kanji Grade 4 — Formula Defense Cartridge
// 202 kanji · compound-completion blanks · reading-in-word subconcepts
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

const G4_SOURCE = [
  [
    "欠",
    "fail",
    "regular",
    "ケツ, ケン",
    "か.く, か.ける",
    "欠席",
    "けっせき",
    "absence",
    "欠如",
    "欠:component;一:component",
    "The attendance sheet shows one desk staying empty today."
  ],
  [
    "氏",
    "clan",
    "regular",
    "シ",
    "-うじ, うじ",
    "氏名",
    "しめい",
    "full name",
    "氏族",
    "氏:component;一:component",
    "A familiar term read しめい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "井",
    "well",
    "regular",
    "ショウ, セイ",
    "い",
    "井戸",
    "いど",
    "water well",
    "天井",
    "二:component;廾:component;十:component",
    "A rope and bucket drop into the old stone shaft in the yard."
  ],
  [
    "不",
    "not",
    "core",
    "フ, ブ",
    "—",
    "不要",
    "ふよう",
    "unnecessary",
    "不況",
    "一:component;丿:component;丨:component",
    "A familiar term read ふよう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "夫",
    "husband",
    "regular",
    "フ, フウ, ブ",
    "おっと, それ",
    "夫妻",
    "ふさい",
    "husband and wife",
    "夫婦",
    "大:big;丿:component",
    "A familiar term read ふさい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "以",
    "by means of",
    "core",
    "イ",
    "もっ.て",
    "以来",
    "いらい",
    "since",
    "以降",
    "丶:component;人:person",
    "A familiar term read いらい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "加",
    "add",
    "core",
    "カ",
    "くわ.える, くわ.わる",
    "追加",
    "ついか",
    "addition",
    "参加",
    "力:power;口:mouth",
    "One more item or person gets added after the first count is announced."
  ],
  [
    "功",
    "achievement",
    "regular",
    "ク, コウ",
    "いさお",
    "成功",
    "せいこう",
    "success",
    "功労",
    "工:component;力:power",
    "A familiar term read せいこう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "札",
    "bid",
    "regular",
    "サツ",
    "ふだ",
    "名札",
    "なふだ",
    "name tag",
    "改札",
    "木:tree;乙:component",
    "A name tag is pinned to the front of the shirt before the event begins."
  ],
  [
    "司",
    "administer",
    "regular",
    "シ",
    "つかさど.る",
    "司会",
    "しかい",
    "master of ceremonies",
    "司法",
    "一:component;口:mouth",
    "One person stands at the front and guides the whole event from start to finish."
  ],
  [
    "失",
    "lose",
    "regular",
    "シツ",
    "う.せる, うしな.う",
    "失敗",
    "しっぱい",
    "failure",
    "失う",
    "丿:component;夫:component;大:big",
    "The first try goes wrong, so everyone has to start over and fix it."
  ],
  [
    "必",
    "certain",
    "core",
    "ヒツ",
    "かなら.ず",
    "必修",
    "ひっしゅう",
    "required",
    "必着",
    "心:heart;丿:component;丶:component",
    "A familiar term read ひっしゅう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "付",
    "adhere",
    "core",
    "フ",
    "-つ.き, -つ.け, -つ.ける, -つき, -づ.き, -づ.く, -づ.け, -づ.ける, -づき, -づけ, つ.き, つ.く, つ.け, つ.け-, つ.ける",
    "付加",
    "ふか",
    "addition",
    "付近",
    "亻:person side;寸:component",
    "A familiar term read ふか appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "辺",
    "border",
    "regular",
    "ヘン",
    "-べ, あた.り, ほと.り",
    "周辺",
    "しゅうへん",
    "surrounding area",
    "海辺",
    "刀:knife;⻌:component",
    "The clue points to the area around a place, not the center of it."
  ],
  [
    "包",
    "wrap",
    "regular",
    "ホウ",
    "くる.む, つつ.む",
    "包装",
    "ほうそう",
    "wrapping",
    "包む",
    "勹:component;己:component;丿:component",
    "Paper or cloth is folded around the item before it is handed over."
  ],
  [
    "末",
    "end",
    "regular",
    "バツ, マツ",
    "うら, うれ, すえ",
    "年末",
    "ねんまつ",
    "year-end",
    "週末",
    "木:tree;丿:component",
    "The calendar points to the final part of the period just before it changes over."
  ],
  [
    "未",
    "not yet",
    "regular",
    "ビ, ミ",
    "いま.だ, ひつじ, ま.だ",
    "未来",
    "みらい",
    "future",
    "未定",
    "木:tree;丿:component",
    "The plan still is not settled, so the answer is left for later."
  ],
  [
    "民",
    "nation",
    "core",
    "ミン",
    "たみ",
    "民謡",
    "みんよう",
    "folk song",
    "民衆",
    "氏:component;一:component",
    "A familiar term read みんよう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "令",
    "decree",
    "regular",
    "レイ",
    "—",
    "命令",
    "めいれい",
    "command",
    "法令",
    "人:person;一:component;マ:component",
    "The rule is stated clearly and everyone is expected to follow it."
  ],
  [
    "衣",
    "clothes",
    "regular",
    "イ, エ",
    "-ぎ, きぬ, ころも",
    "衣服",
    "いふく",
    "clothes",
    "衣料",
    "亠:component;衣:cloth",
    "A familiar term read いふく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "印",
    "stamp",
    "regular",
    "イン",
    "-じるし, しる.す, しるし",
    "印刷",
    "いんさつ",
    "printing",
    "印象",
    "丿:component;卩:component;丨:component",
    "Ink, paper, and repeated copies give the clue here."
  ],
  [
    "各",
    "each",
    "regular",
    "カク",
    "おのおの",
    "各自",
    "かくじ",
    "each",
    "各位",
    "夂:component;口:mouth",
    "A familiar term read かくじ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "共",
    "together",
    "regular",
    "キョウ",
    "-ども, とも, とも.に",
    "共同",
    "きょうどう",
    "working together",
    "共通",
    "八:component;共:component",
    "Several people combine their efforts, or different things share one common point."
  ],
  [
    "好",
    "fond",
    "regular",
    "コウ",
    "い.い, この.む, す.く, よ.い",
    "好物",
    "こうぶつ",
    "favourite dish",
    "好感",
    "女:woman;子:child",
    "A familiar term read こうぶつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "成",
    "become",
    "core",
    "ジョウ, セイ",
    "-な.す, な.す, な.る",
    "成年",
    "せいねん",
    "adult age",
    "成熟",
    "𠂊:component;戈:component;丿:component",
    "A familiar term read せいねん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "争",
    "argue",
    "regular",
    "ソウ",
    "あらそ.う, いか.でか",
    "争議",
    "そうぎ",
    "dispute",
    "紛争",
    "𠂊:component;⺕:component;丿:component",
    "A familiar term read そうぎ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "仲",
    "relationship",
    "regular",
    "チュウ",
    "なか",
    "仲間",
    "なかま",
    "companion",
    "仲直り",
    "亻:person side;中:component;口:mouth",
    "Friends repair things after a disagreement and get back on the same side."
  ],
  [
    "兆",
    "sign",
    "regular",
    "チョウ",
    "きざ.し, きざ.す",
    "兆し",
    "きざし",
    "sign",
    "兆候",
    "儿:component;丿:component;冫:component",
    "A familiar term read きざし appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "伝",
    "communicate",
    "core",
    "テン, デン",
    "-づた.い, つた.う, つた.える, つた.わる, つだ.う, つて",
    "伝統",
    "でんとう",
    "tradition",
    "伝言",
    "亻:person side;云:component;二:component",
    "A familiar term read でんとう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "灯",
    "lamp",
    "regular",
    "トウ",
    "あかり, とも.す, ともしび, ひ, ほ-",
    "電灯",
    "でんとう",
    "electric light",
    "街灯",
    "火:fire;丁:component;一:component",
    "Light stands out in the dark so people can keep moving safely."
  ],
  [
    "老",
    "grow old",
    "regular",
    "ロウ",
    "お.いる, ふ.ける",
    "老後",
    "ろうご",
    "old age",
    "老化",
    "耂:component;匕:component;土:earth",
    "A familiar term read ろうご appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "位",
    "rank",
    "core",
    "イ",
    "くらい, ぐらい",
    "地位",
    "ちい",
    "rank",
    "位置",
    "亻:person side;立:component;亠:component",
    "The clue is about where something stands or where it belongs."
  ],
  [
    "改",
    "change",
    "core",
    "カイ",
    "あらた.まる, あらた.める",
    "改良",
    "かいりょう",
    "improvement",
    "改革",
    "己:component;攴:component;乂:component",
    "A familiar term read かいりょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "完",
    "completion",
    "core",
    "カン",
    "—",
    "完了",
    "かんりょう",
    "perfect",
    "完全",
    "宀:roof;元:component;冖:component",
    "A familiar term read かんりょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "岐",
    "branch",
    "regular",
    "キ, ギ",
    "—",
    "岐阜",
    "ぎふ",
    "Gifu",
    "分岐",
    "山:component;支:component;十:component",
    "A map quiz highlights ぎふ as a place name students memorize in social studies."
  ],
  [
    "希",
    "hope",
    "regular",
    "キ, ケ",
    "こいねが.う, まれ",
    "希望",
    "きぼう",
    "prospects",
    "希少",
    "乂:component;布:component;丿:component",
    "A familiar term read きぼう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "求",
    "demand",
    "core",
    "キュウ, グ",
    "もと.める",
    "要求",
    "ようきゅう",
    "demand",
    "追求",
    "氺:component;丶:component",
    "Someone strongly asks for something and does not let the issue go."
  ],
  [
    "芸",
    "art",
    "regular",
    "ウン, ゲイ",
    "う.える, のり, わざ",
    "芸術",
    "げいじゅつ",
    "art",
    "芸能",
    "艹:grass top;云:component;二:component",
    "A familiar term read げいじゅつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "佐",
    "assist",
    "regular",
    "サ",
    "—",
    "補佐",
    "ほさ",
    "assistance",
    "佐賀",
    "亻:person side;左:component;工:component",
    "A map quiz highlights ほさ as a place name students memorize in social studies."
  ],
  [
    "材",
    "ingredients",
    "regular",
    "ザイ",
    "—",
    "材木",
    "ざいもく",
    "wood",
    "木材",
    "木:tree;才:component;扌:hand side",
    "A familiar term read ざいもく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "児",
    "child",
    "regular",
    "ゲイ, ジ, ニ",
    "-こ, -っこ, こ",
    "児童",
    "じどう",
    "children",
    "乳児",
    "旧:component;儿:component;丨:component",
    "A familiar term read じどう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "初",
    "beginning",
    "core",
    "ショ",
    "-そ.める, -ぞ.め, うい-, はじ.め, はじ.めて, はつ, はつ-",
    "初日",
    "しょじつ",
    "first day",
    "初級",
    "衤:cloth side;刀:knife",
    "A familiar term read しょじつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "臣",
    "retainer",
    "regular",
    "シン, ジン",
    "—",
    "大臣",
    "だいじん",
    "cabinet minister",
    "総理大臣",
    "臣:component;一:component",
    "A familiar term read だいじん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "折",
    "bend",
    "regular",
    "シャク, セツ",
    "-お.り, お.り, お.る, お.れる, おり",
    "折衷",
    "せっちゅう",
    "compromise",
    "時折",
    "扌:hand side;斤:component",
    "A familiar term read せっちゅう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "束",
    "bundle",
    "regular",
    "ソク",
    "たば, たば.ねる, つか, つか.ねる",
    "花束",
    "はなたば",
    "bunch of flowers",
    "拘束",
    "木:tree;口:mouth;丿:component",
    "A familiar term read はなたば appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "沖",
    "offing",
    "regular",
    "チュウ",
    "おき, おきつ, ちゅう.する, わく",
    "沖縄",
    "おきなわ",
    "Okinawa",
    "沖合",
    "氵:water side;中:component;口:mouth",
    "A map quiz highlights おきなわ as a place name students memorize in social studies."
  ],
  [
    "低",
    "humble",
    "regular",
    "テイ",
    "ひく.い, ひく.まる, ひく.める",
    "低温",
    "ていおん",
    "low temperature",
    "低下",
    "亻:person side;氏:component;一:component",
    "A familiar term read ていおん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "努",
    "diligent",
    "regular",
    "ド",
    "つと.める",
    "努力",
    "どりょく",
    "effort",
    "努める",
    "奴:component;力:power;女:woman",
    "A familiar term read どりょく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "阪",
    "slope",
    "regular",
    "ハン",
    "さか",
    "大阪",
    "おおさか",
    "Osaka",
    "阪神",
    "⻖:component;反:component;厂:cliff",
    "A map quiz highlights おおさか as a place name students memorize in social studies."
  ],
  [
    "兵",
    "army",
    "regular",
    "ヒョウ, ヘイ",
    "つわもの",
    "兵士",
    "へいし",
    "soldier",
    "兵役",
    "丘:component;八:component;斤:component",
    "A familiar term read へいし appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "別",
    "another",
    "core",
    "ベツ",
    "わ.ける, わか.れる",
    "別々",
    "べつべつ",
    "separate",
    "別居",
    "口:mouth;刂:knife side;勹:component",
    "A familiar term read べつべつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "利",
    "advantage",
    "core",
    "リ",
    "き.く",
    "利子",
    "りし",
    "interest",
    "利息",
    "禾:grain;刂:knife side;丿:component",
    "A familiar term read りし appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "良",
    "good",
    "core",
    "リョウ",
    "-い.い, -よ.い, い.い, よ.い",
    "良心",
    "りょうしん",
    "conscience",
    "良好",
    "艮:component;良:component",
    "A familiar term read りょうしん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "冷",
    "chill",
    "core",
    "レイ",
    "さ.ます, さ.める, つめ.たい, ひ.える, ひ.や, ひ.やかす, ひ.やす, ひ.ややか",
    "冷水",
    "れいすい",
    "cold water",
    "冷房",
    "冫:component;令:component;人:person",
    "A familiar term read れいすい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "労",
    "labor",
    "core",
    "ロウ",
    "いた.ずき, いたわ.る, つか.れる, ねぎら, ねぎら.う, ろう.する",
    "労力",
    "ろうりょく",
    "labour",
    "労働",
    "⺍:component;力:power;冖:component",
    "A familiar term read ろうりょく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "英",
    "English",
    "core",
    "エイ",
    "はなぶさ",
    "英語",
    "えいご",
    "English language",
    "英会話",
    "艹:grass top;央:component;大:big",
    "A familiar term read えいご appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "岡",
    "hill",
    "regular",
    "コウ",
    "おか",
    "岡山",
    "おかやま",
    "Okayama",
    "福岡",
    "冂:component;山:component",
    "A map quiz highlights おかやま as a place name students memorize in social studies."
  ],
  [
    "果",
    "fruit",
    "core",
    "カ",
    "-は.たす, -は.てる, は.たす, は.て, は.てる, はた.す",
    "結果",
    "けっか",
    "result",
    "果物",
    "田:field;木:tree;日:sun",
    "A familiar term read けっか appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "芽",
    "bud",
    "regular",
    "ガ",
    "め",
    "発芽",
    "はつが",
    "sprouting",
    "新芽",
    "艹:grass top;牙:component;亅:component",
    "A familiar term read はつが appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "官",
    "official",
    "core",
    "カン",
    "—",
    "官邸",
    "かんてい",
    "official residence",
    "官僚",
    "宀:roof;口:mouth;冖:component",
    "A familiar term read かんてい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "季",
    "seasons",
    "regular",
    "キ",
    "—",
    "季語",
    "きご",
    "seasonal word",
    "季節",
    "禾:grain;子:child;丿:component",
    "A familiar term read きご appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "泣",
    "cry",
    "regular",
    "キュウ",
    "な.く",
    "泣き声",
    "なきごえ",
    "cry",
    "泣く",
    "氵:water side;立:component;亠:component",
    "A familiar term read なきごえ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "協",
    "co-",
    "core",
    "キョウ",
    "—",
    "協議",
    "きょうぎ",
    "conference",
    "協力",
    "十:component;力:power",
    "A familiar term read きょうぎ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "径",
    "diameter",
    "regular",
    "ケイ",
    "こみち, さしわたし, ただちに, みち",
    "直径",
    "ちょっけい",
    "diameter",
    "半径",
    "彳:component;圣:component;亻:person side",
    "A familiar term read ちょっけい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "固",
    "clot",
    "regular",
    "コ",
    "かた.い, かた.まり, かた.まる, かた.める",
    "固形",
    "こけい",
    "solid",
    "固体",
    "囗:enclosure;古:component;十:component",
    "A familiar term read こけい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "刷",
    "brush",
    "regular",
    "サツ",
    "-ず.り, -ずり, す.る, は.く",
    "印刷",
    "いんさつ",
    "printing",
    "刷る",
    "尸:component;刂:knife side;丿:component",
    "Ink, paper, and repeated copies give the clue here."
  ],
  [
    "参",
    "participate",
    "core",
    "サン, シン",
    "まい-, まい.る, まじわる, みつ",
    "参加",
    "さんか",
    "participation",
    "参考",
    "厶:component;大:big;彡:component",
    "One more item or person gets added after the first count is announced."
  ],
  [
    "治",
    "govern",
    "core",
    "ジ, チ",
    "おさ.まる, おさ.める, なお.す, なお.る",
    "政治",
    "せいじ",
    "politics",
    "治療",
    "氵:water side;台:component;厶:component",
    "Public rules and official decisions are at the center of this clue."
  ],
  [
    "周",
    "circuit",
    "regular",
    "シュウ",
    "まわ.り",
    "周期",
    "しゅうき",
    "cycle",
    "周辺",
    "冂:component;吉:component;士:component",
    "A familiar term read しゅうき appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "松",
    "pine",
    "regular",
    "ショウ",
    "まつ",
    "松葉",
    "まつば",
    "pine needle",
    "門松",
    "木:tree;公:component;八:component",
    "Needle-like leaves and winter greenery point to the tree in question."
  ],
  [
    "卒",
    "graduate",
    "regular",
    "シュツ, ソツ",
    "お.える, お.わる, そっ.する, ついに, にわか",
    "卒業",
    "そつぎょう",
    "graduation",
    "卒業式",
    "亠:component;十:component;从:component",
    "Caps, certificates, and one big ceremony mark the end of school life."
  ],
  [
    "底",
    "bottom",
    "regular",
    "テイ",
    "そこ",
    "海底",
    "かいてい",
    "sea bottom",
    "底力",
    "广:shelter;氐:component;厂:cliff",
    "Think of the deepest layer under the waterline or the strength hidden underneath."
  ],
  [
    "的",
    "target",
    "core",
    "テキ",
    "まと",
    "目的",
    "もくてき",
    "goal",
    "的中",
    "日:sun;勺:component;勹:component",
    "The sheet at the top of the lesson makes the aim perfectly clear."
  ],
  [
    "典",
    "ceremony",
    "regular",
    "テン, デン",
    "のり, ふみ",
    "辞典",
    "じてん",
    "dictionary",
    "典型",
    "曲:component;八:component;日:sun",
    "A student flips pages to check a word before writing the answer."
  ],
  [
    "奈",
    "what",
    "regular",
    "ダイ, ナ, ナイ",
    "いかん, からなし",
    "奈良",
    "なら",
    "Nara",
    "奈良県",
    "大:big;示:altar",
    "A map quiz highlights なら as a place name students memorize in social studies."
  ],
  [
    "念",
    "thought",
    "core",
    "ネン",
    "—",
    "念頭",
    "ねんとう",
    "mind",
    "念願",
    "今:component;心:heart;人:person",
    "A familiar term read ねんとう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "府",
    "government office",
    "regular",
    "フ",
    "—",
    "政府",
    "せいふ",
    "government",
    "京都府",
    "广:shelter;付:component;厂:cliff",
    "Public rules and official decisions are at the center of this clue."
  ],
  [
    "阜",
    "hill",
    "regular",
    "フ, フウ",
    "—",
    "岐阜",
    "ぎふ",
    "Gifu",
    "岐阜県",
    "𠂤:component;十:component;丿:component",
    "A map quiz highlights ぎふ as a place name students memorize in social studies."
  ],
  [
    "法",
    "method",
    "core",
    "ハッ, フラン, ホウ, ホッ",
    "のり",
    "法的",
    "ほうてき",
    "legal",
    "法廷",
    "氵:water side;去:component;土:earth",
    "A familiar term read ほうてき appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "牧",
    "breed",
    "regular",
    "ボク",
    "まき",
    "牧場",
    "ぼくじょう",
    "pasture",
    "牧畜",
    "牛:component;攴:component;乂:component",
    "A familiar term read ぼくじょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "例",
    "example",
    "core",
    "レイ",
    "たと.える",
    "例文",
    "れいぶん",
    "example sentence",
    "例外",
    "亻:person side;列:component;歹:component",
    "A familiar term read れいぶん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "茨",
    "briar",
    "regular",
    "シ, ジ",
    "いばら, かや, くさぶき",
    "茨城",
    "いばらき",
    "Ibaraki",
    "茨城県",
    "艹:grass top;次:component;冫:component",
    "A map quiz highlights いばらき as a place name students memorize in social studies."
  ],
  [
    "栄",
    "flourish",
    "regular",
    "エイ, ヨウ",
    "-ば.え, え, さか.える, は.え, は.える",
    "栄光",
    "えいこう",
    "glory",
    "栄養",
    "⺍:component;木:tree;冖:component",
    "A familiar term read えいこう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "軍",
    "army",
    "regular",
    "グン",
    "いくさ",
    "軍事",
    "ぐんじ",
    "military affairs",
    "軍備",
    "冖:component;車:component",
    "A familiar term read ぐんじ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "建",
    "build",
    "core",
    "ケン, コン",
    "-だ.て, た.つ, た.て, た.てる",
    "建物",
    "たてもの",
    "building",
    "建築",
    "聿:writing brush;廴:long stride;⺕:component",
    "A familiar term read たてもの appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "香",
    "incense",
    "regular",
    "キョウ, コウ",
    "か, かお.り, かお.る",
    "香水",
    "こうすい",
    "perfume",
    "香り",
    "禾:grain;日:sun;丿:component",
    "A familiar term read こうすい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "昨",
    "previous",
    "regular",
    "サク",
    "—",
    "昨日",
    "きのう",
    "yesterday",
    "昨年",
    "日:sun;乍:component;丿:component",
    "A familiar term read きのう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "祝",
    "celebrate",
    "regular",
    "シュウ, シュク",
    "いわ.う",
    "祝日",
    "しゅくじつ",
    "national holiday",
    "祝福",
    "礻:spirit sign;兄:component;口:mouth",
    "A familiar term read しゅくじつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "城",
    "castle",
    "regular",
    "ジョウ, セイ",
    "しろ",
    "城",
    "しろ",
    "castle",
    "城内",
    "土:earth;成:component;𠂊:component",
    "A familiar term read しろ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "信",
    "faith",
    "core",
    "シン",
    "—",
    "信仰",
    "しんこう",
    "faith",
    "信念",
    "亻:person side;言:speech;口:mouth",
    "A familiar term read しんこう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "省",
    "reflect",
    "core",
    "ショウ, セイ",
    "かえり.みる, はぶ.く",
    "反省",
    "はんせい",
    "reflection",
    "省略",
    "少:component;目:eye;小:small",
    "A familiar term read はんせい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "浅",
    "frivolous",
    "regular",
    "セン",
    "あさ.い",
    "浅い",
    "あさい",
    "shallow",
    "浅はか",
    "氵:water side;戋:component;三:component",
    "A familiar term read あさい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "単",
    "single",
    "core",
    "タン",
    "ひとえ",
    "単一",
    "たんいつ",
    "single",
    "単語",
    "⺍:component;甲:component;丶:component",
    "A familiar term read たんいつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "栃",
    "horse chestnut",
    "regular",
    "—",
    "とち",
    "栃木",
    "とちぎ",
    "Tochigi",
    "栃木県",
    "木:tree;厂:cliff;万:component",
    "A map quiz highlights とちぎ as a place name students memorize in social studies."
  ],
  [
    "飛",
    "fly",
    "core",
    "ヒ",
    "-と.ばす, と.ばす, と.ぶ",
    "飛行",
    "ひこう",
    "fly",
    "飛躍",
    "升:component;十:component;廾:component",
    "A familiar term read ひこう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "変",
    "change",
    "core",
    "ヘン",
    "か.える, か.わり, か.わる",
    "変動",
    "へんどう",
    "change",
    "変容",
    "亦:component;夂:component;亠:component",
    "A familiar term read へんどう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "便",
    "convenience",
    "core",
    "ビン, ベン",
    "たよ.り",
    "便利",
    "べんり",
    "convenient",
    "便宜",
    "亻:person side;更:component;日:sun",
    "A familiar term read べんり appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "約",
    "approximately",
    "core",
    "ヤク",
    "つづ.まる, つづ.める, つづま.やか",
    "約束",
    "やくそく",
    "convention",
    "節約",
    "糸:thread;勺:component;勹:component",
    "A familiar term read やくそく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "勇",
    "courage",
    "regular",
    "ユウ",
    "いさ.む",
    "勇気",
    "ゆうき",
    "courage",
    "勇敢",
    "マ:component;男:component;田:field",
    "A familiar term read ゆうき appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "要",
    "need",
    "core",
    "ヨウ",
    "い.る, かなめ",
    "必要",
    "ひつよう",
    "necessary",
    "要点",
    "西:component;女:woman",
    "The list shows what must be ready before the activity can begin."
  ],
  [
    "案",
    "plan",
    "core",
    "アン",
    "つくえ",
    "案内",
    "あんない",
    "guidance",
    "提案",
    "安:component;木:tree;宀:roof",
    "Someone gives guidance or presents an idea for what should happen next."
  ],
  [
    "害",
    "harm",
    "core",
    "ガイ",
    "—",
    "害虫",
    "がいちゅう",
    "harmful insect",
    "利害",
    "宀:roof;口:mouth;冖:component",
    "A familiar term read がいちゅう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "挙",
    "raise",
    "regular",
    "キョ",
    "あ.がる, あ.げる, こぞ.る",
    "選挙",
    "せんきょ",
    "election",
    "挙手",
    "⺍:component;手:hand;八:component",
    "Ballots are being counted after people mark their choices."
  ],
  [
    "訓",
    "instruction",
    "regular",
    "キン, クン",
    "おし.える, くん.ずる, よ.む",
    "訓練",
    "くんれん",
    "training",
    "特訓",
    "言:speech;川:component;口:mouth",
    "A familiar term read くんれん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "郡",
    "county",
    "regular",
    "グン",
    "こおり",
    "郡部",
    "ぐんぶ",
    "rural district",
    "郡山",
    "君:component;⻏:component;尹:component",
    "A familiar term read ぐんぶ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "候",
    "season",
    "core",
    "コウ",
    "そうろう",
    "気候",
    "きこう",
    "climate",
    "候補",
    "亻:person side;丨:component;矢:component",
    "A familiar term read きこう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "差",
    "difference",
    "core",
    "サ",
    "さ.し, さ.す",
    "差別",
    "さべつ",
    "discrimination",
    "時差",
    "羊:sheep;丿:component;工:component",
    "A familiar term read さべつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "残",
    "remain",
    "core",
    "サン, ザン",
    "そこな.う, のこ.す, のこ.り, のこ.る",
    "残業",
    "ざんぎょう",
    "overtime",
    "残高",
    "歹:component;戋:component;一:component",
    "A familiar term read ざんぎょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "借",
    "borrow",
    "core",
    "シャク",
    "か.りる",
    "借りる",
    "かりる",
    "borrow",
    "借金",
    "亻:person side;昔:component;廾:component",
    "Something is taken for a while with the expectation that it will be returned."
  ],
  [
    "笑",
    "laugh",
    "regular",
    "ショウ",
    "え.む, わら.う",
    "笑顔",
    "えがお",
    "smiling face",
    "微笑",
    "竹:bamboo;夭:component;丿:component",
    "A familiar term read えがお appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "席",
    "seat",
    "core",
    "セキ",
    "むしろ",
    "座席",
    "ざせき",
    "seat",
    "欠席",
    "广:shelter;廿:component;巾:component",
    "Rows of chairs and names on a classroom chart set the scene."
  ],
  [
    "倉",
    "cellar",
    "regular",
    "ソウ",
    "くら",
    "倉庫",
    "そうこ",
    "storehouse",
    "倉敷",
    "人:person;口:mouth",
    "A familiar term read そうこ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "孫",
    "descendants",
    "regular",
    "ソン",
    "まご",
    "孫",
    "まご",
    "grandchild",
    "子孫",
    "子:child;系:component;丿:component",
    "A familiar term read まご appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "帯",
    "belt",
    "regular",
    "タイ",
    "お.びる, おび",
    "熱帯",
    "ねったい",
    "tropics",
    "世帯",
    "丗:component;冖:component;卅:component",
    "A familiar term read ねったい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "徒",
    "pupil",
    "regular",
    "ト",
    "あだ, いたずら",
    "生徒",
    "せいと",
    "pupil",
    "徒歩",
    "彳:component;走:component;亻:person side",
    "The clue is either a child in class or going on foot without a ride."
  ],
  [
    "特",
    "special",
    "core",
    "トク",
    "—",
    "特権",
    "とっけん",
    "privilege",
    "特集",
    "牛:component;寺:component;土:earth",
    "A familiar term read とっけん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "梅",
    "plum",
    "regular",
    "バイ",
    "うめ",
    "梅雨",
    "つゆ",
    "rainy season",
    "梅雨明け",
    "木:tree;毎:component;丿:component",
    "A familiar term read つゆ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "浴",
    "bask in",
    "regular",
    "ヨク",
    "あ.びせる, あ.びる",
    "浴室",
    "よくしつ",
    "bathroom",
    "浴槽",
    "氵:water side;谷:component;口:mouth",
    "A familiar term read よくしつ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "料",
    "fee",
    "core",
    "リョウ",
    "—",
    "料理",
    "りょうり",
    "cooking",
    "給料",
    "米:rice;斗:component;丶:component",
    "A familiar term read りょうり appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "連",
    "connect",
    "core",
    "レン",
    "-づ.れ, つ.れる, つら.なる, つら.ねる",
    "連休",
    "れんきゅう",
    "consecutive holidays",
    "連日",
    "車:component;⻌:component",
    "A familiar term read れんきゅう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "貨",
    "goods",
    "regular",
    "カ",
    "たから",
    "貨幣",
    "かへい",
    "money",
    "貨物",
    "化:component;貝:shell/money;亻:person side",
    "A familiar term read かへい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "械",
    "machine",
    "regular",
    "カイ",
    "かせ",
    "機械",
    "きかい",
    "machine",
    "器械",
    "木:tree;戒:component;戈:component",
    "The key moment finally arrives, or a device with moving parts does the work."
  ],
  [
    "健",
    "healthy",
    "core",
    "ケン",
    "すこ.やか",
    "健康",
    "けんこう",
    "health",
    "健全",
    "亻:person side;建:build block;聿:writing brush",
    "The nurse talks about daily habits before the class fitness check."
  ],
  [
    "康",
    "peace",
    "core",
    "コウ",
    "—",
    "健康",
    "けんこう",
    "health",
    "健康診断",
    "广:shelter;隶:capture component;厂:cliff",
    "The nurse talks about daily habits before the class fitness check."
  ],
  [
    "菜",
    "greens",
    "regular",
    "サイ",
    "な",
    "野菜",
    "やさい",
    "vegetable",
    "菜食",
    "艹:grass top;采:component;⺤:component",
    "A familiar term read やさい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "埼",
    "cape",
    "regular",
    "キ",
    "さい, さき, みさき",
    "埼玉",
    "さいたま",
    "Saitama",
    "埼玉県",
    "土:earth;奇:component;大:big",
    "A map quiz highlights さいたま as a place name students memorize in social studies."
  ],
  [
    "崎",
    "cape point",
    "regular",
    "キ",
    "さい, さき, みさき",
    "長崎",
    "ながさき",
    "Nagasaki",
    "川崎",
    "山:component;奇:component;大:big",
    "A map quiz highlights ながさき as a place name students memorize in social studies."
  ],
  [
    "産",
    "produce",
    "core",
    "サン",
    "う.まれる, う.む, うぶ-, む.す",
    "産地",
    "さんち",
    "producing area",
    "産業",
    "立:component;生:component;亠:component",
    "A familiar term read さんち appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "鹿",
    "deer",
    "regular",
    "ロク",
    "か, しか",
    "鹿児島",
    "かごしま",
    "Kagoshima",
    "鹿",
    "广:shelter;比:component;厂:cliff",
    "A map quiz highlights かごしま as a place name students memorize in social studies."
  ],
  [
    "唱",
    "chant",
    "regular",
    "ショウ",
    "とな.える",
    "合唱",
    "がっしょう",
    "chorus",
    "独唱",
    "口:mouth;昌:component;日:sun",
    "Voices rise together in music practice before the performance starts."
  ],
  [
    "清",
    "pure",
    "core",
    "ショウ, シン, セイ",
    "きよ.い, きよ.まる, きよ.める",
    "清潔",
    "せいけつ",
    "cleanliness",
    "清水",
    "氵:water side;青:component;月:moon/flesh",
    "Everything feels fresh and spotless, like water that has not been dirtied."
  ],
  [
    "巣",
    "nest",
    "regular",
    "ソウ",
    "す, す.くう",
    "鳥の巣",
    "とりのす",
    "bird nest",
    "巣箱",
    "⺍:component;果:component;丶:component",
    "Twigs and a sheltered spot suggest where chicks would be raised."
  ],
  [
    "側",
    "side",
    "regular",
    "ソク",
    "かわ, がわ, そば",
    "両側",
    "りょうがわ",
    "both sides",
    "右側",
    "亻:person side;則:component;貝:shell/money",
    "The clue depends on which direction from the center something is placed."
  ],
  [
    "梨",
    "pear",
    "regular",
    "リ",
    "なし",
    "梨",
    "なし",
    "pear",
    "洋梨",
    "利:component;木:tree;禾:grain",
    "A crisp orchard fruit gives the clue here."
  ],
  [
    "敗",
    "defeat",
    "regular",
    "ハイ",
    "やぶ.れる",
    "敗戦",
    "はいせん",
    "defeat",
    "敗北",
    "貝:shell/money;攴:component;目:eye",
    "A familiar term read はいせん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "票",
    "vote",
    "regular",
    "ヒョウ",
    "—",
    "投票",
    "とうひょう",
    "voting",
    "票",
    "襾:component;示:altar;西:component",
    "Ballots are being counted after people mark their choices."
  ],
  [
    "副",
    "vice",
    "regular",
    "フク",
    "—",
    "副作用",
    "ふくさよう",
    "side effect",
    "副詞",
    "畐:component;刂:knife side;一:component",
    "A medicine helps with one thing but causes another effect at the same time."
  ],
  [
    "望",
    "hope",
    "core",
    "ボウ, モウ",
    "のぞ.む, もち",
    "要望",
    "ようぼう",
    "demand for",
    "絶望",
    "亡:component;王:king/jade;亠:component",
    "A familiar term read ようぼう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "陸",
    "land",
    "regular",
    "リク, ロク",
    "おか",
    "陸軍",
    "りくぐん",
    "army",
    "陸上",
    "⻖:component;坴:component;土:earth",
    "A familiar term read りくぐん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "媛",
    "princess",
    "regular",
    "エン",
    "ひめ",
    "愛媛",
    "えひめ",
    "Ehime",
    "愛媛県",
    "女:woman;爰:component;⺤:component",
    "A map quiz highlights えひめ as a place name students memorize in social studies."
  ],
  [
    "賀",
    "congratulations",
    "regular",
    "ガ",
    "—",
    "年賀状",
    "ねんがじょう",
    "New Year card",
    "祝賀",
    "加:component;貝:shell/money;力:power",
    "A map quiz highlights ねんがじょう as a place name students memorize in social studies."
  ],
  [
    "街",
    "street",
    "regular",
    "カイ, ガイ",
    "まち",
    "商店街",
    "しょうてんがい",
    "shopping street",
    "街角",
    "行:component;圭:component;彳:component",
    "Small stores line both sides of the road while people walk from shop to shop."
  ],
  [
    "覚",
    "remember",
    "core",
    "カク",
    "おぼ.える, さ.ます, さ.める, さと.る",
    "覚える",
    "おぼえる",
    "remember",
    "自覚",
    "⺍:component;見:see;冖:component",
    "The clue is about keeping something in mind instead of letting it slip away."
  ],
  [
    "給",
    "allow",
    "core",
    "キュウ",
    "-たま.え, たま.う, たも.う",
    "給食",
    "きゅうしょく",
    "provision of lunch",
    "給料",
    "糸:thread;合:component;人:person",
    "A familiar term read きゅうしょく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "極",
    "extreme",
    "regular",
    "キョク, ゴク",
    "-ぎ.め, き.まる, き.める, きわ.まり, きわ.まる, きわ.み, きわ.める",
    "究極",
    "きゅうきょく",
    "ultimate",
    "極点",
    "木:tree;亟:component;二:component",
    "A familiar term read きゅうきょく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "景",
    "scenery",
    "core",
    "ケイ",
    "—",
    "景色",
    "けしき",
    "scenery",
    "風景",
    "日:sun;京:component;亠:component",
    "A lookout opens onto mountains, water, and town below."
  ],
  [
    "結",
    "tie",
    "core",
    "ケチ, ケツ",
    "むす.ぶ, ゆ.う, ゆ.わえる",
    "結ぶ",
    "むすぶ",
    "tie",
    "結婚",
    "糸:thread;吉:component;士:component",
    "A cord, promise, or partnership is being tied firmly together."
  ],
  [
    "最",
    "extreme",
    "core",
    "サイ, シュ",
    "つま, もっと.も",
    "最上",
    "さいじょう",
    "best",
    "最強",
    "日:sun;取:component;耳:component",
    "A familiar term read さいじょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "散",
    "disperse",
    "core",
    "サン",
    "-ち.らす, ち.らかす, ち.らかる, ち.らす, ち.らばる, ち.る, ばら, ばら.ける",
    "散歩",
    "さんぽ",
    "walk",
    "分散",
    "月:moon/flesh;攴:component;乂:component",
    "A familiar term read さんぽ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "滋",
    "nourish",
    "regular",
    "シ, ジ",
    "—",
    "滋賀",
    "しが",
    "Shiga",
    "滋賀県",
    "氵:water side;兹:component;艹:grass top",
    "A map quiz highlights しが as a place name students memorize in social studies."
  ],
  [
    "順",
    "docility",
    "regular",
    "ジュン",
    "—",
    "順番",
    "じゅんばん",
    "turn",
    "順位",
    "川:component;頁:head;貝:shell/money",
    "A familiar term read じゅんばん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "焼",
    "bake",
    "regular",
    "ショウ",
    "-や.き, や.き, や.き-, や.く, や.ける",
    "燃焼",
    "ねんしょう",
    "burning",
    "焼き肉",
    "火:fire;尭:component;卉:component",
    "A familiar term read ねんしょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "然",
    "so",
    "core",
    "ゼン, ネン",
    "さ, しか, しか.し, しか.り",
    "自然",
    "しぜん",
    "nature",
    "当然",
    "月:moon/flesh;灬:fire dots;犬:component",
    "No one forced it; it seems to happen as part of the way things are."
  ],
  [
    "隊",
    "troop",
    "regular",
    "タイ",
    "—",
    "部隊",
    "ぶたい",
    "troop unit",
    "軍隊",
    "⻖:component;豕:component",
    "Uniformed groups move together under the same orders."
  ],
  [
    "達",
    "attain",
    "core",
    "タツ, ダ",
    "-たち",
    "友達",
    "ともだち",
    "friend",
    "達成",
    "土:earth;羊:sheep;⻌:component",
    "Either friendship or finally reaching a goal gives the clue."
  ],
  [
    "博",
    "doctor",
    "regular",
    "ハク, バク",
    "—",
    "博士",
    "はかせ",
    "doctor",
    "博物館",
    "十:component;尃:component;甫:component",
    "Think of a scholar or a place full of carefully gathered exhibits."
  ],
  [
    "飯",
    "boiled rice",
    "core",
    "ハン",
    "めし",
    "ご飯",
    "ごはん",
    "cooked rice",
    "夕飯",
    "飠:component;反:component;厂:cliff",
    "Steam rises from a bowl just as the family sits down to eat."
  ],
  [
    "富",
    "abundant",
    "regular",
    "フ, フウ",
    "と.む, とみ",
    "貧富",
    "ひんぷ",
    "wealth and poverty",
    "豊富",
    "宀:roof;畐:component;冖:component",
    "A familiar term read ひんぷ appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "満",
    "enough",
    "core",
    "バン, マン",
    "み.たす, み.ちる, み.つ",
    "満員",
    "まんいん",
    "full house",
    "満点",
    "氵:water side;廿:component;十:component",
    "A familiar term read まんいん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "無",
    "none",
    "core",
    "ブ, ム",
    "な.い",
    "無料",
    "むりょう",
    "free of charge",
    "無理",
    "丿:component;灬:fire dots;一:component",
    "No payment is needed, or the request is simply too much to do."
  ],
  [
    "量",
    "amount",
    "core",
    "リョウ",
    "はか.る",
    "質量",
    "しつりょう",
    "mass",
    "多量",
    "旦:component;里:component;日:sun",
    "A familiar term read しつりょう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "愛",
    "affection",
    "core",
    "アイ",
    "いと.しい, お.しむ, かな.しい, まな, め.でる",
    "愛読",
    "あいどく",
    "reading with pleasure",
    "愛情",
    "⺤:component;冖:component;心:heart",
    "A familiar term read あいどく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "塩",
    "salt",
    "regular",
    "エン",
    "しお",
    "塩分",
    "えんぶん",
    "salt",
    "塩水",
    "土:earth;口:mouth;皿:dish",
    "A familiar term read えんぶん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "群",
    "group",
    "regular",
    "グン",
    "む.れ, む.れる, むら, むら.がる",
    "群れ",
    "むれ",
    "group",
    "群馬",
    "君:component;羊:sheep;尹:component",
    "Many of the same kind move or gather together instead of standing alone."
  ],
  [
    "試",
    "attempt",
    "core",
    "シ",
    "こころ.みる, ため.す",
    "試合",
    "しあい",
    "match",
    "試験",
    "言:speech;式:component;口:mouth",
    "A familiar term read しあい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "辞",
    "resign",
    "regular",
    "ジ",
    "いな.む, や.める",
    "辞書",
    "じしょ",
    "dictionary",
    "辞典",
    "舌:component;辛:component;口:mouth",
    "A student flips pages to check a word before writing the answer."
  ],
  [
    "照",
    "shine",
    "regular",
    "ショウ",
    "て.らす, て.る, て.れる",
    "照明",
    "しょうめい",
    "lighting",
    "日照",
    "昭:component;灬:fire dots;日:sun",
    "A familiar term read しょうめい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "節",
    "season",
    "core",
    "セチ, セツ",
    "-ぶし, のっと, ふし",
    "季節",
    "きせつ",
    "season",
    "節約",
    "竹:bamboo;即:component;艮:component",
    "The weather and calendar together signal a changing part of the year."
  ],
  [
    "戦",
    "battle",
    "core",
    "セン",
    "いくさ, おのの.く, そよ.ぐ, たたか.う, わなな.く",
    "戦死",
    "せんし",
    "death in battle",
    "戦災",
    "単:component;戈:component;⺍:component",
    "A familiar term read せんし appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "続",
    "continue",
    "core",
    "キョウ, コウ, ショク, ゾク",
    "つぐ.ない, つづ.く, つづ.ける",
    "続々",
    "ぞくぞく",
    "successively",
    "継続",
    "糸:thread;売:component;士:component",
    "A familiar term read ぞくぞく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "置",
    "place",
    "core",
    "チ",
    "-お.き, お.く",
    "置く",
    "おく",
    "put down",
    "位置",
    "罒:component;直:component;十:component",
    "A familiar term read おく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "働",
    "work",
    "core",
    "ドウ",
    "はたら.く",
    "働く",
    "はたらく",
    "work",
    "労働",
    "亻:person side;動:component;重:component",
    "Hands stay busy from morning on because there is a job to do."
  ],
  [
    "管",
    "manage",
    "regular",
    "カン",
    "くだ",
    "管理",
    "かんり",
    "control",
    "管轄",
    "竹:bamboo;官:component;宀:roof",
    "A familiar term read かんり appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "関",
    "connection",
    "core",
    "カン",
    "-ぜき, かか.わる, からくり, かんぬき, せき",
    "関係",
    "かんけい",
    "relationship",
    "関心",
    "門:gate;关:component;天:component",
    "The clue depends on how things connect to each other."
  ],
  [
    "旗",
    "banner",
    "regular",
    "キ",
    "はた",
    "国旗",
    "こっき",
    "national flag",
    "旗",
    "方:component;其:component;亠:component",
    "A familiar term read こっき appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "漁",
    "fishery",
    "regular",
    "ギョ, リョウ",
    "あさ.る",
    "漁師",
    "りょうし",
    "fisherman",
    "漁船",
    "氵:water side;魚:component;𠂊:component",
    "A familiar term read りょうし appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "熊",
    "bear",
    "regular",
    "ユウ",
    "くま",
    "熊本",
    "くまもと",
    "Kumamoto",
    "熊",
    "能:ability block;灬:fire dots;厶:component",
    "A map quiz highlights くまもと as a place name students memorize in social studies."
  ],
  [
    "察",
    "inspect",
    "regular",
    "サツ",
    "—",
    "観察",
    "かんさつ",
    "observation",
    "警察",
    "宀:roof;祭:component;冖:component",
    "The plant notebook fills with tiny changes noticed day after day."
  ],
  [
    "種",
    "seed",
    "core",
    "シュ",
    "-ぐさ, たね",
    "種類",
    "しゅるい",
    "kind",
    "種目",
    "禾:grain;重:component;丿:component",
    "Items are grouped into categories rather than being listed by size or order."
  ],
  [
    "静",
    "quiet",
    "core",
    "ジョウ, セイ",
    "しず-, しず.か, しず.まる, しず.める",
    "静か",
    "しずか",
    "quiet",
    "静止",
    "青:component;争:component;月:moon/flesh",
    "Everything becomes still enough to notice even the smallest sound."
  ],
  [
    "説",
    "explain",
    "core",
    "セツ, ゼイ",
    "と.く",
    "説得",
    "せっとく",
    "persuasion",
    "説明",
    "言:speech;兌:component;口:mouth",
    "A familiar term read せっとく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "徳",
    "virtue",
    "regular",
    "トク",
    "—",
    "道徳",
    "どうとく",
    "morals",
    "悪徳",
    "彳:component;十:component;亻:person side",
    "A familiar term read どうとく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "億",
    "hundred million",
    "regular",
    "オク",
    "—",
    "十億",
    "じゅうおく",
    "1,000,000,000",
    "百億",
    "亻:person side;意:component;音:component",
    "A familiar term read じゅうおく appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "課",
    "lesson",
    "regular",
    "カ",
    "—",
    "課題",
    "かだい",
    "assignment",
    "課長",
    "言:speech;果:component;口:mouth",
    "A familiar term read かだい appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "潟",
    "lagoon",
    "regular",
    "セキ",
    "-がた, かた",
    "新潟",
    "にいがた",
    "Niigata",
    "干潟",
    "氵:water side;舄:component;臼:component",
    "A map quiz highlights にいがた as a place name students memorize in social studies."
  ],
  [
    "器",
    "vessel",
    "regular",
    "キ",
    "うつわ",
    "楽器",
    "がっき",
    "musical instrument",
    "器具",
    "口:mouth;大:big",
    "The object is a tool made to be used for a specific job or sound."
  ],
  [
    "縄",
    "rope",
    "regular",
    "ジョウ",
    "ただ.す, なわ",
    "沖縄",
    "おきなわ",
    "Okinawa",
    "縄跳び",
    "糸:thread;日:sun",
    "A map quiz highlights おきなわ as a place name students memorize in social studies."
  ],
  [
    "選",
    "choose",
    "core",
    "セン",
    "え.る, えら.ぶ, よ.る",
    "選挙",
    "せんきょ",
    "election",
    "選定",
    "巽:component;⻌:component;己:component",
    "Ballots are being counted after people mark their choices."
  ],
  [
    "熱",
    "heat",
    "core",
    "ネツ",
    "あつ.い",
    "熱湯",
    "ねっとう",
    "boiling water",
    "熱気",
    "埶:heat-source block;灬:fire dots;土:earth",
    "A familiar term read ねっとう appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "標",
    "mark",
    "regular",
    "ヒョウ",
    "しるし, しるべ",
    "目標",
    "もくひょう",
    "goal",
    "標本",
    "木:tree;票:component;襾:component",
    "The sheet at the top of the lesson makes the aim perfectly clear."
  ],
  [
    "養",
    "nourish",
    "core",
    "ヨウ, リョウ",
    "やしな.う",
    "栄養",
    "えいよう",
    "nutrition",
    "養う",
    "羊:sheep;食:component",
    "The nurse talks about daily habits before the class fitness check."
  ],
  [
    "輪",
    "wheel",
    "regular",
    "リン",
    "わ",
    "車輪",
    "しゃりん",
    "wheel",
    "指輪",
    "車:component;侖:component;人:person",
    "Round shapes that turn or circle around a finger point the way."
  ],
  [
    "機",
    "opportunity",
    "core",
    "キ",
    "はた",
    "機会",
    "きかい",
    "chance",
    "機械",
    "木:tree;幾:fine detail block;幺:short thread",
    "The key moment finally arrives, or a device with moving parts does the work."
  ],
  [
    "積",
    "accumulate",
    "core",
    "セキ",
    "-づ.み, つ.む, つ.もり, つ.もる",
    "面積",
    "めんせき",
    "area",
    "積む",
    "禾:grain;責:component;丿:component",
    "Either space is being measured or things are being piled one on another."
  ],
  [
    "録",
    "record",
    "core",
    "ロク",
    "しる.す, と.る",
    "録音",
    "ろくおん",
    "recording",
    "録画",
    "金:metal;彔:component;⺕:component",
    "A familiar term read ろくおん appears in class and everyday life, and this kanji supplies one part of it."
  ],
  [
    "観",
    "view",
    "core",
    "カン",
    "しめ.す, み.る",
    "観察",
    "かんさつ",
    "observation",
    "観光",
    "隹:bird component;見:see;亻:person side",
    "The plant notebook fills with tiny changes noticed day after day."
  ],
  [
    "験",
    "test",
    "core",
    "ケン, ゲン",
    "あかし, しるし, ため.す, ためし",
    "試験",
    "しけん",
    "examination",
    "実験",
    "馬:horse;僉:all-together block;灬:fire dots",
    "Desks, notes, and careful checking make this feel like a test day."
  ],
  [
    "類",
    "kind",
    "core",
    "ルイ",
    "たぐ.い",
    "種類",
    "しゅるい",
    "kind",
    "人類",
    "米:rice;頁:head;大:big",
    "Items are sorted into broad categories rather than by size or order."
  ],
  [
    "願",
    "wish",
    "core",
    "ガン",
    "-ねがい, ねが.う",
    "願い",
    "ねがい",
    "wish",
    "願書",
    "原:meadow source;頁:head;厂:cliff",
    "Someone strongly hopes for a result and puts that hope into words."
  ],
  [
    "鏡",
    "mirror",
    "regular",
    "キョウ, ケイ",
    "かがみ",
    "鏡",
    "かがみ",
    "mirror",
    "眼鏡",
    "金:metal;竟:component;立:component",
    "A clear image or a pair of lenses gives the clue."
  ],
  [
    "議",
    "deliberate",
    "core",
    "ギ",
    "—",
    "会議",
    "かいぎ",
    "meeting",
    "議論",
    "言:speech;義:righteousness block;口:mouth",
    "People sit around a table and work through ideas before deciding."
  ],
  [
    "競",
    "compete",
    "core",
    "キョウ, ケイ",
    "きそ.う, くら.べる, せ.る",
    "競争",
    "きょうそう",
    "competition",
    "競技",
    "立:component;亠:component;兄:component",
    "Rivals line up, and only one can finish ahead of the others."
  ]
];

const G4_RECORDS = G4_SOURCE.map(([kanji,action,tier,on,kun,exampleWord,exampleReading,exampleMeaning,blank2Word,componentSpec,scenario])=>({
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

const COMPONENT_POOL = uniqueBy(G4_RECORDS.map(record=>record.components[0]&&`${record.components[0].s} (${record.components[0].d})`).filter(Boolean),item=>item);
const READING_POOL = uniqueBy(G4_RECORDS.map(record=>record.exampleReading).filter(Boolean),item=>item);
const MEANING_POOL = uniqueBy(G4_RECORDS.map(record=>record.exampleMeaning).filter(Boolean),item=>item);

function buildCommand(record,index){
  const componentLead=record.components[0]||{s:record.kanji,d:'whole character form'};
  const componentCorrect=`${componentLead.s} (${componentLead.d})`;
  return {
    id:record.id,
    action:record.action,
    tier:record.tier,
    dom:'g4',
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

const COMMANDS = G4_RECORDS.map(buildCommand);

const KANJI_G4 = {
  id:'joyo-kanji-g4',
  name:'Joyo Kanji - Grade 4',
  description:'Kanji defense for 202 Grade 4 (elementary year 4) Joyo kanji',
  icon:'令',
  inputMode:'quiz',
  prefixLabel:null,
  title:'KANJI 四年',
  subtitle:'DEFENSE',
  startButton:'出陣',
  instructions:'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub:'Grade 4 - 202 kanji - Recognition → Recall → Compounds',
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

const VARIABLE_BANK = Object.fromEntries(G4_RECORDS.map(record=>[
  record.id,
  uniqueBy(
    [...record.components, {s:record.kanji,d:'whole character form'}],
    entry=>`${entry.s}|${entry.d}`
  ).slice(0,3)
]));

const RELATIONSHIP_BANK = {};

const EXPLANATION_GLOSSARY = G4_RECORDS.map(record=>({
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
  'g4':['Grade 4 (fourth-year elementary)'],
};

const CONFUSABLE_GROUPS = [
  '末未',
  '氏民',
  '令冷',
  '信伝',
  '争戦競',
  '健康',
  '試験',
  '覚観鏡',
  '結続縄給',
  '浅浴清治沖泣滋潟',
  '松梅梨栃栄機械極標材果',
  '灯焼然熱熊照',
  '功加努労勇',
  '芸英芽菜茨',
  '仲伝位佐信借候億健側働',
  '辺連達選',
  '訓説議試辞',
  '鏡録',
  '城塩埼',
  '府康',
  '軍兵戦隊',
  '民令官府法管関議',
  '松梅梨菜芽果牧',
  '鹿熊漁',
  '岐奈阪岡栃茨埼崎滋媛潟熊鹿阜賀佐沖',
  '量積億',
  '倉城席街',
  '貨札賀給料',
  '刷別副利初'
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

const APPLICATION_BANK = Object.fromEntries(G4_RECORDS.map(record=>[
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
  }
};

function wireL1toL2(PREREQ_DAG) {
  const rules = [
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

KANJI_G4.variableBank = VARIABLE_BANK;
KANJI_G4.applicationBank = APPLICATION_BANK;
KANJI_G4.relationshipBank = RELATIONSHIP_BANK;
KANJI_G4.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G4.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G4.domLabels = DOM_LABELS;
KANJI_G4.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G4.normalizeExplanationLookup = normalizeLookup;
KANJI_G4.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G4.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G4);
window.KANJI_G4_CARTRIDGE = KANJI_G4;
})();
