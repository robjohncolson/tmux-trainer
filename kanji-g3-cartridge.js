// Joyo Kanji Grade 3 — Formula Defense Cartridge
// 200 kanji · compound-completion blanks · reading-in-word subconcepts
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

const G3_SOURCE = [
  [
    "丁",
    "block",
    "regular",
    "チョウ, テイ, チン, トウ, チ",
    "ひのと",
    "一丁",
    "いっちょう",
    "one leaf",
    "丁寧",
    "一:horizontal stroke;亅:hook",
    "The address narrows from district to numbered sections before the right building appears."
  ],
  [
    "化",
    "change",
    "core",
    "カ, ケ",
    "ばける, ばかす, ふける, けする",
    "分化",
    "ぶんか",
    "specialization",
    "劣化",
    "亻:person side;匕:spoon shape",
    "One thing is being transformed into another during the lesson."
  ],
  [
    "区",
    "district",
    "regular",
    "ク, オウ, コウ",
    "—",
    "区内",
    "くない",
    "in a ward",
    "区分",
    "匚:box frame;丶:dot stroke;ノ:slanting stroke",
    "The map divides the city into labeled sections with clear borders."
  ],
  [
    "反",
    "oppose",
    "regular",
    "ハン, ホン, タン, ホ",
    "そる, そらす, かえす, かえる",
    "反乱",
    "はんらん",
    "insurrection",
    "反共",
    "又:hand action mark;厂:cliff",
    "The second idea pushes back against the first instead of agreeing with it."
  ],
  [
    "予",
    "beforehand",
    "regular",
    "ヨ, シャ",
    "あらかじめ",
    "予備",
    "よび",
    "reserve",
    "予告",
    "龴:curved frame;一:horizontal stroke;亅:hook",
    "The class gets ready early so nothing is left to the last minute."
  ],
  [
    "央",
    "center",
    "regular",
    "オウ",
    "—",
    "中央",
    "ちゅうおう",
    "centre",
    "中央集権",
    "ノ:slanting stroke;一:horizontal stroke;大:big form",
    "Everyone gathers around the exact middle of the room."
  ],
  [
    "去",
    "leave",
    "core",
    "キョ, コ",
    "さる",
    "去就",
    "きょしゅう",
    "leaving or staying",
    "去年",
    "土:earth;厶:private mark",
    "A person steps away from a place and does not stay."
  ],
  [
    "号",
    "number",
    "regular",
    "ゴウ",
    "さけぶ, よびな",
    "二号",
    "にごう",
    "number two",
    "信号",
    "一:horizontal stroke;口:mouth enclosure;勹:wrapping shape",
    "The clue is the label used to identify an item in order."
  ],
  [
    "皿",
    "dish",
    "regular",
    "ベイ",
    "さら",
    "小皿",
    "こざら",
    "small plate",
    "灰皿",
    "皿:dish base;一:top stroke;｜:vertical support",
    "Flat tableware is being stacked after the meal."
  ],
  [
    "仕",
    "serve",
    "regular",
    "シ, ジ",
    "つかえる",
    "仕事",
    "しごと",
    "work",
    "仕手",
    "亻:person side;士:scholar top",
    "Someone is helping in an official role rather than acting alone."
  ],
  [
    "写",
    "copy",
    "regular",
    "シャ, ジャ",
    "うつす, うつる, うつ-, うつし",
    "写生",
    "しゃせい",
    "sketching",
    "写真",
    "一:horizontal stroke;冖:cover;勹:wrapping shape",
    "The task is to make another version from an original page."
  ],
  [
    "主",
    "main",
    "regular",
    "シュ, ス, シュウ",
    "ぬし, おも, あるじ",
    "主人",
    "しゅじん",
    "head",
    "主任",
    "王:king/jade base;丶:dot stroke",
    "One person or thing is clearly treated as the central one."
  ],
  [
    "申",
    "report",
    "regular",
    "シン",
    "もうす, もうし-, さる",
    "内申",
    "ないしん",
    "unofficial report",
    "申告",
    "｜:vertical line;日:sun window;田:field box",
    "A claim is being made clearly and formally."
  ],
  [
    "世",
    "world",
    "core",
    "セイ, セ, ソウ",
    "よ",
    "世帯",
    "せたい",
    "household",
    "世界",
    "｜:vertical line;一:horizontal stroke;世:generation shape",
    "The clue is about the broader age or society people live in."
  ],
  [
    "他",
    "other",
    "core",
    "タ",
    "ほか",
    "他人",
    "たにん",
    "another person",
    "他国",
    "亻:person side;也:component",
    "The sentence points to a different person or thing than the one already named."
  ],
  [
    "打",
    "hit",
    "regular",
    "ダ, ダース",
    "うつ, うち-, ぶつ",
    "一打",
    "いちだ",
    "stroke",
    "代打",
    "亅:hook;扌:hand side",
    "The action depends on a quick strike from a hand or tool."
  ],
  [
    "代",
    "substitute",
    "core",
    "ダイ, タイ",
    "かわる, かわり, がわり, かえる, よ, しろ",
    "交代",
    "こうたい",
    "change",
    "代人",
    "亻:person side;弋:stake mark",
    "One person takes over in place of another."
  ],
  [
    "皮",
    "skin",
    "regular",
    "ヒ",
    "かわ",
    "樹皮",
    "じゅひ",
    "bark",
    "毛皮",
    "皮:skin;又:hand action mark",
    "The clue is the outer layer that covers a body or fruit."
  ],
  [
    "氷",
    "ice",
    "regular",
    "ヒョウ",
    "こおり, ひ, こおる",
    "氷山",
    "ひょうざん",
    "iceberg",
    "氷河",
    "水:water;丶:dot stroke",
    "The surface is hard, cold, and slippery in the morning."
  ],
  [
    "平",
    "flat",
    "core",
    "ヘイ, ビョウ, ヒョウ",
    "たいら, たいらげる, ひら",
    "不平",
    "ふへい",
    "discontent",
    "公平",
    "干:dry shaft;并:paired top",
    "The road or surface has no rise at all."
  ],
  [
    "由",
    "reason",
    "regular",
    "ユ, ユウ, ユイ",
    "よし, よる",
    "事由",
    "じゆう",
    "reason",
    "理由",
    "｜:vertical line;日:sun window;田:field box",
    "The explanation focuses on what caused something to happen."
  ],
  [
    "礼",
    "thanks",
    "regular",
    "レイ, ライ",
    "—",
    "儀礼",
    "ぎれい",
    "courtesy",
    "失礼",
    "乙:component;礻:spirit altar",
    "A small polite gesture closes the exchange."
  ],
  [
    "安",
    "safe",
    "core",
    "アン",
    "やすい, やすまる, やす, やすらか",
    "不安",
    "ふあん",
    "anxiety",
    "保安",
    "女:woman;宀:roof",
    "The room finally feels calm and free of danger."
  ],
  [
    "曲",
    "bend",
    "regular",
    "キョク",
    "まがる, まげる, くま",
    "一曲",
    "いっきょく",
    "tune",
    "作曲",
    "｜:vertical line;日:sun window",
    "The line or path does not stay straight as it goes on."
  ],
  [
    "血",
    "blood",
    "regular",
    "ケツ",
    "ち",
    "出血",
    "しゅっけつ",
    "bleeding",
    "流血",
    "血:blood dish;皿:dish base",
    "The clue involves what runs inside the body."
  ],
  [
    "向",
    "toward",
    "core",
    "コウ",
    "むく, むい, むき, むける, むけ, むかう, むかい, むこう, むこう-, むこ",
    "一向",
    "いっこう",
    "completely",
    "偏向",
    "口:mouth enclosure;冂:open frame",
    "The key detail is the direction someone turns or faces."
  ],
  [
    "死",
    "die",
    "core",
    "シ",
    "しぬ, しに-",
    "二死",
    "にし",
    "two out",
    "凍死",
    "一:horizontal stroke;夕:evening;匕:spoon shape",
    "The scene is about something no longer living."
  ],
  [
    "次",
    "next",
    "core",
    "ジ, シ",
    "つぐ, つぎ",
    "三次",
    "さんじ",
    "third",
    "二次",
    "欠:open mouth;冫:ice",
    "The choice depends on what comes immediately after the current one."
  ],
  [
    "式",
    "ceremony",
    "regular",
    "シキ",
    "—",
    "一式",
    "いっしき",
    "set",
    "儀式",
    "工:work bar;弋:stake mark",
    "A formal occasion follows a fixed pattern in front of a crowd."
  ],
  [
    "守",
    "guard",
    "regular",
    "シュ, ス",
    "まもる, まもり, もり, かみ",
    "保守",
    "ほしゅ",
    "maintenance",
    "厳守",
    "寸:measuring hand;宀:roof",
    "The important role here is watching over and protecting something."
  ],
  [
    "州",
    "province",
    "regular",
    "シュウ, ス",
    "す",
    "九州",
    "きゅうしゅう",
    "Kyūshū",
    "州都",
    "｜:vertical line;川:river;丶:dot stroke",
    "The map label names a broad administrative region."
  ],
  [
    "全",
    "whole",
    "core",
    "ゼン",
    "まったく, すべて",
    "万全",
    "ばんぜん",
    "perfection",
    "不全",
    "王:king/jade base;ハ:split-open shape;𠆢:person roof",
    "Nothing is missing from the thing being described."
  ],
  [
    "有",
    "have",
    "core",
    "ユウ, ウ",
    "ある",
    "保有",
    "ほゆう",
    "possession",
    "公有",
    "ノ:slanting stroke;一:horizontal stroke;月:moon/flesh",
    "The sentence tells you that someone possesses or contains something."
  ],
  [
    "羊",
    "sheep",
    "regular",
    "ヨウ",
    "ひつじ",
    "子羊",
    "こひつじ",
    "lamb",
    "小羊",
    "王:king/jade base;并:paired top;羊:sheep",
    "The clue points to a woolly farm animal."
  ],
  [
    "両",
    "both",
    "regular",
    "リョウ",
    "てる, ふたつ",
    "一両",
    "いちりょう",
    "one vehicle",
    "両側",
    "｜:vertical line;一:horizontal stroke;冂:open frame",
    "The sentence refers to the two sides together, not just one."
  ],
  [
    "列",
    "line",
    "regular",
    "レツ, レ",
    "—",
    "列国",
    "れっこく",
    "nations",
    "列島",
    "刂:component;歹:death bone",
    "People or objects are arranged one after another."
  ],
  [
    "医",
    "medicine",
    "regular",
    "イ",
    "いやす, いする, くすし",
    "侍医",
    "じい",
    "court physician",
    "医大",
    "矢:arrow;匚:box frame;乞:hooked lower part",
    "The clue belongs with doctors, treatment, or a clinic."
  ],
  [
    "究",
    "research",
    "regular",
    "キュウ, ク",
    "きわめる",
    "学究",
    "がっきゅう",
    "scholar",
    "探究",
    "穴:hole;九:bent stroke;儿:legs",
    "Someone is investigating deeply instead of stopping at the surface."
  ],
  [
    "局",
    "bureau",
    "regular",
    "キョク",
    "つぼね",
    "郵便局",
    "ゆうびんきょく",
    "post office",
    "局員",
    "口:mouth enclosure;尸:body flag",
    "The setting is an office or branch with staff and counters."
  ],
  [
    "君",
    "lord",
    "regular",
    "クン",
    "きみ, ぎみ",
    "君主",
    "くんしゅ",
    "monarch",
    "君子",
    "一:horizontal stroke;口:mouth enclosure;ノ:slanting stroke",
    "The word refers to a person with status."
  ],
  [
    "決",
    "decide",
    "core",
    "ケツ",
    "きめる, ぎめ, きまる, さく",
    "先決",
    "せんけつ",
    "deciding first",
    "判決",
    "氵:water side;人:person;大:big form",
    "A choice is settled firmly after uncertainty."
  ],
  [
    "住",
    "live",
    "core",
    "ジュウ, ヂュウ, チュウ",
    "すむ, すまう, ずまい",
    "住人",
    "じゅうにん",
    "dweller",
    "住宅",
    "王:king/jade base;亻:person side;丶:dot stroke",
    "The sentence is about where someone makes a home."
  ],
  [
    "助",
    "help",
    "core",
    "ジョ",
    "たすける, たすかる, すける, すけ",
    "一助",
    "いちじょ",
    "help",
    "互助",
    "目:component;力:power",
    "Someone is giving support so another person can finish the task."
  ],
  [
    "身",
    "body",
    "core",
    "シン",
    "み",
    "一身",
    "いっしん",
    "oneself",
    "中身",
    "身:body form;ノ:slanting stroke;｜:center line",
    "The situation points to the right Grade 3 character without stating the definition directly."
  ],
  [
    "対",
    "versus",
    "core",
    "タイ, ツイ",
    "あいて, こたえる, そろい, つれあい, ならぶ, むかう",
    "反対",
    "はんたい",
    "opposition",
    "対中",
    "寸:measuring hand;文:pattern",
    "Two sides are placed directly against each other."
  ],
  [
    "投",
    "throw",
    "regular",
    "トウ",
    "なげる, なげ",
    "好投",
    "こうとう",
    "good pitching",
    "投下",
    "扌:hand side;殳:weapon hand;几:table frame",
    "The hand sends something forward through the air."
  ],
  [
    "豆",
    "beans",
    "regular",
    "トウ, ズ",
    "まめ, まめ-",
    "大豆",
    "だいず",
    "soya bean",
    "小豆",
    "口:mouth enclosure;豆:bean vessel;并:paired top",
    "The food clue is a small seed used in cooking."
  ],
  [
    "坂",
    "slope",
    "regular",
    "ハン",
    "さか",
    "坂道",
    "さかみち",
    "hill road",
    "京坂",
    "土:earth;又:hand action mark;厂:cliff",
    "The road rises at an angle instead of staying flat."
  ],
  [
    "返",
    "return",
    "regular",
    "ヘン",
    "かえす, かえる",
    "返上",
    "へんじょう",
    "return",
    "返事",
    "辶:walk road;又:hand action mark;厂:cliff",
    "Travel, direction, or motion is the important clue here."
  ],
  [
    "役",
    "duty",
    "regular",
    "ヤク, エキ",
    "—",
    "三役",
    "さんやく",
    "three highest ranks",
    "主役",
    "彳:step;殳:weapon hand;几:table frame",
    "The key idea is the role someone is assigned to carry out."
  ],
  [
    "委",
    "entrust",
    "regular",
    "イ",
    "ゆだねる",
    "委任",
    "いにん",
    "entrusting",
    "委員",
    "禾:grain;女:woman",
    "Responsibility is being handed over to another person or group."
  ],
  [
    "育",
    "nurture",
    "regular",
    "イク",
    "そだつ, そだち, そだてる, はぐくむ",
    "体育",
    "たいいく",
    "physical education",
    "保育",
    "月:moon/flesh;亠:top cap;厶:private mark",
    "The clue is about raising or helping something grow."
  ],
  [
    "泳",
    "swim",
    "regular",
    "エイ",
    "およぐ",
    "水泳",
    "すいえい",
    "swimming",
    "競泳",
    "氵:water side;水:water;丶:dot stroke",
    "The pool, strokes, and water lanes matter more than solid ground."
  ],
  [
    "岸",
    "shore",
    "regular",
    "ガン",
    "きし",
    "両岸",
    "りょうがん",
    "both banks",
    "対岸",
    "干:dry shaft;山:mountain;厂:cliff",
    "Land and water meet at the edge in this scene."
  ],
  [
    "苦",
    "pain",
    "regular",
    "ク",
    "くるしい, ぐるしい, くるしむ, くるしめる, にがい, にがる",
    "病苦",
    "びょうく",
    "pain of sickness",
    "苦労",
    "口:mouth enclosure;十:cross mark;艹:grass top",
    "The feeling here is unpleasant and hard to endure."
  ],
  [
    "具",
    "tool",
    "regular",
    "グ",
    "そなえる, つぶさに",
    "具体",
    "ぐたい",
    "concreteness",
    "具合",
    "一:horizontal stroke;ハ:split-open shape;目:component",
    "An instrument or piece of equipment is needed for the task."
  ],
  [
    "幸",
    "luck",
    "regular",
    "コウ",
    "さいわい, さち, しあわせ",
    "不幸",
    "ふこう",
    "unhappiness",
    "幸福",
    "十:cross mark;辛:needle/spicy mark;立:standing top",
    "The sentence hints that things turned out well by fortune."
  ],
  [
    "使",
    "use",
    "core",
    "シ",
    "つかう, つかい, づかい",
    "使命",
    "しめい",
    "mission",
    "使徒",
    "ノ:slanting stroke;一:horizontal stroke;亻:person side",
    "The key detail is putting something into service for a purpose."
  ],
  [
    "始",
    "begin",
    "core",
    "シ",
    "はじめる, はじまる",
    "創始",
    "そうし",
    "creation",
    "原始",
    "口:mouth enclosure;女:woman;厶:private mark",
    "This is the moment something first gets underway."
  ],
  [
    "事",
    "matter",
    "core",
    "ジ, ズ",
    "こと, つかう, つかえる",
    "万事",
    "ばんじ",
    "all",
    "事件",
    "一:horizontal stroke;口:mouth enclosure;亅:hook",
    "The clue points to an event, affair, or task under discussion."
  ],
  [
    "実",
    "real",
    "core",
    "ジツ, シツ",
    "み, みのる, まこと, みの, みちる",
    "事実",
    "じじつ",
    "fact",
    "充実",
    "士:scholar top;大:big form;宀:roof",
    "The sentence contrasts what is true with what is only appearance."
  ],
  [
    "者",
    "person",
    "core",
    "シャ",
    "もの",
    "三者",
    "さんしゃ",
    "three persons",
    "両者",
    "日:sun window;耂:old person top",
    "The situation points to the right Grade 3 character without stating the definition directly."
  ],
  [
    "取",
    "take",
    "core",
    "シュ",
    "とる, とり, とり-, どり",
    "先取",
    "せんしゅ",
    "earning the first",
    "取引",
    "耳:ear;又:hand action mark",
    "A hand receives or pulls something in."
  ],
  [
    "受",
    "receive",
    "core",
    "ジュ",
    "うける, うけ, うかる",
    "享受",
    "きょうじゅ",
    "enjoyment",
    "傍受",
    "爪:claw;又:hand action mark;冖:cover",
    "Something is accepted from someone else."
  ],
  [
    "所",
    "place",
    "core",
    "ショ",
    "ところ, どころ, とこ",
    "住所",
    "じゅうしょ",
    "address",
    "余所",
    "斤:axe;戸:door;一:horizontal stroke",
    "The answer depends on the location itself."
  ],
  [
    "昔",
    "long ago",
    "regular",
    "セキ, シャク",
    "むかし",
    "一昔",
    "ひとむかし",
    "an age",
    "今昔",
    "｜:vertical line;一:horizontal stroke;二:two-level mark",
    "The sentence is set in times far before the present."
  ],
  [
    "注",
    "note",
    "core",
    "チュウ",
    "そそぐ, さす, つぐ",
    "傾注",
    "けいちゅう",
    "devoting to",
    "受注",
    "王:king/jade base;氵:water side;丶:dot stroke",
    "A written mark or brief record is being added for attention."
  ],
  [
    "定",
    "fixed",
    "core",
    "テイ, ジョウ",
    "さだめる, さだまる, さだか",
    "一定",
    "いってい",
    "to fix",
    "不定",
    "疋:foot bolt;宀:roof",
    "The plan or amount is settled and not changing."
  ],
  [
    "波",
    "wave",
    "regular",
    "ハ",
    "なみ",
    "寒波",
    "かんぱ",
    "cold wave",
    "波乱",
    "氵:water side;皮:skin;又:hand action mark",
    "The sea keeps rising and falling against the shore."
  ],
  [
    "板",
    "board",
    "regular",
    "ハン, バン",
    "いた",
    "合板",
    "ごうはん",
    "veneer board",
    "甲板",
    "又:hand action mark;木:tree;厂:cliff",
    "A flat wooden panel is the important object."
  ],
  [
    "表",
    "surface",
    "core",
    "ヒョウ",
    "おもて, あらわす, あらわれる",
    "代表",
    "だいひょう",
    "representation",
    "公表",
    "衣:clothing;士:scholar top;土:earth",
    "The outside face or visible side matters here."
  ],
  [
    "服",
    "clothes",
    "regular",
    "フク",
    "—",
    "不服",
    "ふふく",
    "dissatisfaction",
    "克服",
    "月:moon/flesh;又:hand action mark;卩:seal kneel",
    "An outfit rather than a tool or building gives the clue here."
  ],
  [
    "物",
    "thing",
    "core",
    "ブツ, モツ",
    "もの, もの-",
    "乾物",
    "かんぶつ",
    "dry provisions",
    "人物",
    "勿:brush-like stroke;牛:cow;勹:wrapping shape",
    "The context is about an object, not a person or place."
  ],
  [
    "放",
    "release",
    "core",
    "ホウ",
    "はなす, っぱなし, はなつ, はなれる, こく, ほうる",
    "奔放",
    "ほんぽう",
    "wild",
    "放任",
    "方:direction;攵:action tap;乞:hooked lower part",
    "Something is let out instead of kept in."
  ],
  [
    "味",
    "taste",
    "core",
    "ミ",
    "あじ, あじわう",
    "加味",
    "かみ",
    "seasoning",
    "吟味",
    "｜:vertical line;口:mouth enclosure;二:two-level mark",
    "The answer comes from flavor on the tongue."
  ],
  [
    "命",
    "life",
    "core",
    "メイ, ミョウ",
    "いのち",
    "人命",
    "じんめい",
    "life",
    "任命",
    "口:mouth enclosure;𠆢:person roof;卩:seal kneel",
    "The sentence centers on living or the span of a person."
  ],
  [
    "油",
    "oil",
    "regular",
    "ユ, ユウ",
    "あぶら",
    "原油",
    "げんゆ",
    "crude oil",
    "油井",
    "｜:vertical line;氵:water side;日:sun window",
    "A thick liquid for cooking, fuel, or lubrication is mentioned."
  ],
  [
    "和",
    "harmony",
    "core",
    "ワ, オ, カ",
    "やわらぐ, やわらげる, なごむ, なごやか, あえる",
    "不和",
    "ふわ",
    "discord",
    "中和",
    "禾:grain;口:mouth enclosure",
    "The clue is peace, agreement, or Japanese style."
  ],
  [
    "屋",
    "shop",
    "core",
    "オク",
    "や",
    "問屋",
    "とんや",
    "wholesale store",
    "大屋",
    "至:arrive mark;土:earth;厶:private mark",
    "This is the kind of building or business someone goes into."
  ],
  [
    "界",
    "boundary",
    "core",
    "カイ",
    "—",
    "下界",
    "げかい",
    "the earth below",
    "世界",
    "田:field box;𠆢:person roof;儿:legs",
    "The clue comes from the edge where one area stops and another begins."
  ],
  [
    "客",
    "guest",
    "core",
    "キャク, カク",
    "—",
    "乗客",
    "じょうきゃく",
    "passenger",
    "客員",
    "口:mouth enclosure;夂:foot/going mark;宀:roof",
    "Someone has arrived to be received rather than to work there."
  ],
  [
    "急",
    "hurry",
    "core",
    "キュウ",
    "いそぐ, いそぎ, せく",
    "危急",
    "ききゅう",
    "emergency",
    "応急",
    "彐:hand broom;心:heart;勹:wrapping shape",
    "Everything is happening with urgency and little time."
  ],
  [
    "級",
    "grade",
    "regular",
    "キュウ",
    "—",
    "学級",
    "がっきゅう",
    "class; grade",
    "上級",
    "ノ:slanting stroke;糸:thread;幺:short thread",
    "The clue comes from level, class, or rank."
  ],
  [
    "係",
    "relation",
    "core",
    "ケイ",
    "かかる, かかり, がかり, かかわる",
    "係争",
    "けいそう",
    "dispute",
    "係員",
    "ノ:slanting stroke;亻:person side;糸:thread",
    "The sentence depends on a connection between people or things."
  ],
  [
    "研",
    "polish",
    "core",
    "ケン",
    "とぐ",
    "研修",
    "けんしゅう",
    "training",
    "研磨",
    "｜:vertical line;口:mouth enclosure;石:stone",
    "The work involves sharpening, smoothing, or closely studying something."
  ],
  [
    "県",
    "prefecture",
    "core",
    "ケン",
    "かける",
    "県庁",
    "けんちょう",
    "prefectural office",
    "県立",
    "小:small mark;目:component",
    "The map or office label names a regional government area."
  ],
  [
    "指",
    "finger",
    "regular",
    "シ",
    "ゆび, さす, さし",
    "中指",
    "なかゆび",
    "middle finger",
    "小指",
    "日:sun window;匕:spoon shape;扌:hand side",
    "The clue is a part of the hand used for pointing."
  ],
  [
    "持",
    "hold",
    "core",
    "ジ",
    "もつ, もち, もてる",
    "保持",
    "ほじ",
    "retention",
    "堅持",
    "寸:measuring hand;土:earth;扌:hand side",
    "A hand is keeping something in place."
  ],
  [
    "拾",
    "pick up",
    "regular",
    "シュウ, ジュウ",
    "ひろう",
    "収拾",
    "しゅうしゅう",
    "control",
    "拾得",
    "口:mouth enclosure;𠆢:person roof;扌:hand side",
    "Someone notices an item and lifts it from the ground."
  ],
  [
    "重",
    "heavy",
    "core",
    "ジュウ, チョウ",
    "え, おもい, おもり, おもなう, かさねる, かさなる, おも",
    "一重",
    "ひとえ",
    "one layer",
    "丁重",
    "｜:vertical line;ノ:slanting stroke;一:horizontal stroke",
    "The object is difficult to lift or carry."
  ],
  [
    "昭",
    "bright",
    "regular",
    "ショウ",
    "—",
    "昭和",
    "しょうわ",
    "Shōwa era",
    "昭然",
    "口:mouth enclosure;刀:component;日:sun window",
    "Light or clarity fills the scene."
  ],
  [
    "乗",
    "ride",
    "core",
    "ジョウ, ショウ",
    "のる, のり, のせる",
    "乗員",
    "じょういん",
    "crew member",
    "乗客",
    "｜:vertical line;ノ:slanting stroke;一:horizontal stroke",
    "A person gets on top of or into something to travel."
  ],
  [
    "神",
    "god",
    "core",
    "シン, ジン",
    "かみ, かん-, こう-",
    "天神",
    "てんじん",
    "heavenly god",
    "失神",
    "｜:vertical line;日:sun window;礻:spirit altar",
    "The clue belongs to prayer, ritual, or something sacred."
  ],
  [
    "相",
    "mutual",
    "core",
    "ソウ, ショウ",
    "あい-",
    "世相",
    "せそう",
    "social conditions",
    "人相",
    "木:tree;目:component",
    "The meaning depends on two sides in relation to each other."
  ],
  [
    "送",
    "send",
    "core",
    "ソウ",
    "おくる",
    "伝送",
    "でんそう",
    "transmission",
    "回送",
    "辶:walk road;并:paired top;大:big form",
    "Something or someone is being dispatched away."
  ],
  [
    "待",
    "wait",
    "core",
    "タイ",
    "まつ, まち",
    "待合",
    "まちあい",
    "rendezvous",
    "待望",
    "寸:measuring hand;土:earth;彳:step",
    "The scene pauses until another moment arrives."
  ],
  [
    "炭",
    "charcoal",
    "regular",
    "タン",
    "すみ",
    "採炭",
    "さいたん",
    "coal mining",
    "木炭",
    "火:fire;山:mountain;厂:cliff",
    "Black fuel from burned wood is the key object."
  ],
  [
    "柱",
    "pillar",
    "regular",
    "チュウ",
    "はしら",
    "円柱",
    "えんちゅう",
    "column",
    "支柱",
    "王:king/jade base;木:tree;丶:dot stroke",
    "A tall support is holding something above it."
  ],
  [
    "追",
    "chase",
    "core",
    "ツイ",
    "おう",
    "訴追",
    "そつい",
    "prosecution",
    "追伸",
    "｜:vertical line;口:mouth enclosure;辶:walk road",
    "One thing follows after another, trying to catch up."
  ],
  [
    "度",
    "degree",
    "core",
    "ド, ト, タク",
    "たび, たい",
    "一度",
    "いちど",
    "once",
    "丁度",
    "又:hand action mark;广:wide shelter;一:horizontal stroke",
    "The sentence is about amount, level, or extent."
  ],
  [
    "畑",
    "field",
    "regular",
    "—",
    "はた, はたけ, ばたけ",
    "桑畑",
    "くわばたけ",
    "mulberry field",
    "田畑",
    "火:fire;田:field box",
    "Crops or open farmland are the setting."
  ],
  [
    "発",
    "depart",
    "core",
    "ハツ, ホツ",
    "たつ, あばく, おこる, つかわす, はなつ",
    "一発",
    "いっぱつ",
    "one shot",
    "不発",
    "二:two-level mark;儿:legs;癶:two feet",
    "The important moment is starting out or being set in motion."
  ],
  [
    "美",
    "beauty",
    "core",
    "ビ, ミ",
    "うつくしい",
    "優美",
    "ゆうび",
    "grace",
    "甘美",
    "王:king/jade base;大:big form;并:paired top",
    "The clue is attractiveness or something admired."
  ],
  [
    "秒",
    "second",
    "regular",
    "ビョウ",
    "—",
    "秒速",
    "びょうそく",
    "speed per second",
    "秒読み",
    "ノ:slanting stroke;禾:grain;小:small mark",
    "The time unit is very small and precise."
  ],
  [
    "品",
    "goods",
    "core",
    "ヒン, ホン",
    "しな",
    "一品",
    "いっぴん",
    "item",
    "上品",
    "口:mouth enclosure;品:component",
    "The clue refers to products or articles for use or sale."
  ],
  [
    "負",
    "lose",
    "regular",
    "フ",
    "まける, まかす, おう",
    "勝負",
    "しょうぶ",
    "victory or defeat",
    "抱負",
    "貝:shell money;目:component;ハ:split-open shape",
    "One side fails to win or must carry a burden."
  ],
  [
    "面",
    "face",
    "core",
    "メン, ベン",
    "おも, おもて, つら",
    "一面",
    "いちめん",
    "one face",
    "両面",
    "面:face frame;一:top line;目:features frame",
    "The clue comes from appearance or the outward side of something."
  ],
  [
    "洋",
    "ocean",
    "regular",
    "ヨウ",
    "—",
    "外洋",
    "がいよう",
    "open sea",
    "大洋",
    "王:king/jade base;氵:water side;并:paired top",
    "The setting points to the wide sea beyond the shore."
  ],
  [
    "員",
    "member",
    "core",
    "イン",
    "—",
    "一員",
    "いちいん",
    "one person",
    "乗員",
    "貝:shell money;目:component;ハ:split-open shape",
    "Someone belongs to a group or staff."
  ],
  [
    "院",
    "institution",
    "regular",
    "イン",
    "—",
    "上院",
    "じょういん",
    "upper house",
    "下院",
    "二:two-level mark;儿:legs;宀:roof",
    "The scene is inside an organized place like a school or clinic."
  ],
  [
    "荷",
    "load",
    "regular",
    "カ",
    "に",
    "入荷",
    "にゅうか",
    "arrival of goods",
    "出荷",
    "亻:person side;口:mouth enclosure;亅:hook",
    "Luggage or bundled goods are being moved from place to place."
  ],
  [
    "起",
    "rise",
    "core",
    "キ",
    "おきる, おこる, おこす, たつ",
    "再起",
    "さいき",
    "comeback",
    "勃起",
    "走:component;土:earth;己:self shape",
    "Something stands up or starts from rest."
  ],
  [
    "宮",
    "palace",
    "regular",
    "キュウ, グウ, ク, クウ",
    "みや",
    "子宮",
    "しきゅう",
    "womb",
    "宮中",
    "口:mouth enclosure;宀:roof;ノ:slanting stroke",
    "The clue points to a grand residence or shrine-like building."
  ],
  [
    "庫",
    "storehouse",
    "regular",
    "コ, ク",
    "くら",
    "倉庫",
    "そうこ",
    "storehouse",
    "国庫",
    "車:vehicle;广:wide shelter",
    "Stored things are kept in a protected building."
  ],
  [
    "根",
    "root",
    "regular",
    "コン",
    "ね",
    "垣根",
    "かきね",
    "hedge",
    "大根",
    "艮:stopping root;木:tree",
    "The hidden base below the surface matters here."
  ],
  [
    "酒",
    "sake",
    "regular",
    "シュ",
    "さけ, さか-",
    "梅酒",
    "うめしゅ",
    "ume liqueur",
    "清酒",
    "氵:water side;酉:wine jar",
    "A bottled drink for adults is being poured."
  ],
  [
    "消",
    "extinguish",
    "core",
    "ショウ",
    "きえる, けす",
    "消化",
    "しょうか",
    "digestion",
    "消印",
    "月:moon/flesh;氵:water side;尚:component",
    "Light, heat, or a mark is being erased or put out."
  ],
  [
    "真",
    "true",
    "core",
    "シン",
    "ま, ま-, まこと",
    "写真",
    "しゃしん",
    "photograph",
    "真上",
    "一:horizontal stroke;十:cross mark;ハ:split-open shape",
    "The answer depends on what is genuine or correct."
  ],
  [
    "息",
    "breath",
    "core",
    "ソク",
    "いき",
    "一息",
    "ひといき",
    "one breath",
    "休息",
    "自:self nose;心:heart;目:component",
    "Air moving in or out of a person is the clue."
  ],
  [
    "速",
    "fast",
    "core",
    "ソク",
    "はやい, はや-, はやめる, すみやか",
    "失速",
    "しっそく",
    "stall",
    "快速",
    "｜:vertical line;一:horizontal stroke;口:mouth enclosure",
    "The scene stresses speed rather than slowness."
  ],
  [
    "庭",
    "garden",
    "core",
    "テイ",
    "にわ",
    "中庭",
    "なかにわ",
    "courtyard",
    "前庭",
    "王:king/jade base;广:wide shelter;廴:component",
    "A yard or cultivated space around a building matters here."
  ],
  [
    "島",
    "island",
    "core",
    "トウ",
    "しま",
    "列島",
    "れっとう",
    "archipelago",
    "千島",
    "山:mountain;鳥:component;白:white",
    "Land is surrounded by water on every side."
  ],
  [
    "配",
    "distribute",
    "regular",
    "ハイ",
    "くばる",
    "分配",
    "ぶんぱい",
    "division",
    "勾配",
    "酉:wine jar;己:self shape",
    "Items are handed out one by one."
  ],
  [
    "倍",
    "double",
    "regular",
    "バイ",
    "—",
    "一倍",
    "いちばい",
    "multiplying by one",
    "倍加",
    "亻:person side;口:mouth enclosure;立:standing top",
    "The amount becomes two times as much."
  ],
  [
    "病",
    "illness",
    "core",
    "ビョウ, ヘイ",
    "やむ, やみ, やまい",
    "同病",
    "どうびょう",
    "the same sickness",
    "大病",
    "一:horizontal stroke;人:person;冂:open frame",
    "Fever, pain, or a clinic visit is the key clue."
  ],
  [
    "勉",
    "effort",
    "core",
    "ベン",
    "つとめる",
    "勉学",
    "べんがく",
    "study",
    "勉強",
    "力:power;免:component;儿:legs",
    "The scene involves studying or working hard at something."
  ],
  [
    "流",
    "flow",
    "core",
    "リュウ, ル",
    "ながれる, ながれ, ながす",
    "一流",
    "いちりゅう",
    "first-class",
    "三流",
    "氵:water side;川:river;亠:top cap",
    "Water or people continue moving in one direction."
  ],
  [
    "旅",
    "trip",
    "core",
    "リョ",
    "たび",
    "旅人",
    "たびびと",
    "traveller",
    "旅先",
    "ノ:slanting stroke;方:direction;乞:hooked lower part",
    "Someone is traveling away from home for a while."
  ],
  [
    "悪",
    "bad",
    "core",
    "アク, オ",
    "わるい, わる-, あし, にくい, ああ, いずくに, いずくんぞ, にくむ",
    "最悪",
    "さいあく",
    "worst",
    "凶悪",
    "｜:vertical line;一:horizontal stroke;口:mouth enclosure",
    "The quality or behavior is clearly poor or wrong."
  ],
  [
    "球",
    "ball",
    "regular",
    "キュウ",
    "たま",
    "初球",
    "しょきゅう",
    "pitcher's first pitch",
    "制球",
    "王:king/jade base;水:water;丶:dot stroke",
    "The clue is a round object used in play or sport."
  ],
  [
    "祭",
    "festival",
    "regular",
    "サイ",
    "まつる, まつり",
    "祭典",
    "さいてん",
    "festival",
    "祭壇",
    "示:component;二:two-level mark;小:small mark",
    "Stalls, music, and a local celebration fill the scene."
  ],
  [
    "終",
    "end",
    "core",
    "シュウ",
    "おわる, おえる, つい, ついに",
    "最終",
    "さいしゅう",
    "last",
    "始終",
    "糸:thread;幺:short thread;小:small mark",
    "Something reaches its last part and stops."
  ],
  [
    "習",
    "learn",
    "core",
    "シュウ, ジュ",
    "ならう, ならい",
    "学習",
    "がくしゅう",
    "learning",
    "実習",
    "羽:component;白:white;冫:ice",
    "Practice and repetition are part of getting better at it."
  ],
  [
    "宿",
    "lodge",
    "regular",
    "シュク",
    "やど, やどる, やどす",
    "下宿",
    "げしゅく",
    "boarding",
    "合宿",
    "亻:person side;白:white;宀:roof",
    "People stay overnight away from home."
  ],
  [
    "商",
    "trade",
    "core",
    "ショウ",
    "あきなう",
    "商事",
    "しょうじ",
    "commercial affairs",
    "商人",
    "口:mouth enclosure;并:paired top;立:standing top",
    "Buying, selling, or business activity is central."
  ],
  [
    "章",
    "chapter",
    "regular",
    "ショウ",
    "—",
    "勲章",
    "くんしょう",
    "decoration",
    "喪章",
    "音:sound;十:cross mark;日:sun window",
    "The clue points to a labeled section of writing or a book."
  ],
  [
    "深",
    "deep",
    "core",
    "シン",
    "ふかい, ぶかい, ふかまる, ふかめる, み-",
    "水深",
    "すいしん",
    "depth of water",
    "深刻",
    "氵:water side;木:tree;儿:legs",
    "The water, color, or thought goes far below the surface."
  ],
  [
    "進",
    "advance",
    "core",
    "シン",
    "すすむ, すすめる",
    "促進",
    "そくしん",
    "promotion",
    "先進",
    "辶:walk road;隹:short-tailed bird",
    "Movement or progress continues forward step by step."
  ],
  [
    "族",
    "tribe",
    "regular",
    "ゾク",
    "—",
    "一族",
    "いちぞく",
    "family",
    "家族",
    "方:direction;矢:arrow;乞:hooked lower part",
    "The word refers to a family line or group of people."
  ],
  [
    "第",
    "ordinal",
    "regular",
    "ダイ, テイ",
    "—",
    "次第",
    "しだい",
    "depending on",
    "第一",
    "弓:component;竹:bamboo;乞:hooked lower part",
    "The clue is an ordered number in a list or sequence."
  ],
  [
    "帳",
    "notebook",
    "regular",
    "チョウ",
    "とばり",
    "台帳",
    "だいちょう",
    "account book",
    "帳簿",
    "巾:component;長:component",
    "A bound record book is opened on the desk."
  ],
  [
    "笛",
    "flute",
    "regular",
    "テキ",
    "ふえ",
    "口笛",
    "くちぶえ",
    "whistle",
    "汽笛",
    "｜:vertical line;竹:bamboo;日:sun window",
    "Breath moves through a musical tube with finger holes."
  ],
  [
    "転",
    "turn",
    "regular",
    "テン",
    "ころがる, ころげる, ころがす, ころぶ, まろぶ, うたた, うつる, くるめく",
    "反転",
    "はんてん",
    "rolling over",
    "回転",
    "車:vehicle;二:two-level mark;厶:private mark",
    "Something rotates or changes direction."
  ],
  [
    "都",
    "capital",
    "regular",
    "ト, ツ",
    "みやこ",
    "京都",
    "きょうと",
    "Kyoto",
    "古都",
    "日:sun window;阝:mound/city side;耂:old person top",
    "The main city of a country or region is implied."
  ],
  [
    "動",
    "move",
    "core",
    "ドウ",
    "うごく, うごかす",
    "不動",
    "ふどう",
    "immovable",
    "出動",
    "｜:vertical line;一:horizontal stroke;日:sun window",
    "The key detail is motion rather than stillness."
  ],
  [
    "部",
    "section",
    "core",
    "ブ",
    "べ",
    "一部",
    "いちぶ",
    "one part",
    "三部",
    "口:mouth enclosure;阝:mound/city side;立:standing top",
    "One part of a larger whole is being discussed."
  ],
  [
    "問",
    "question",
    "core",
    "モン",
    "とう, とい, とん",
    "一問",
    "いちもん",
    "one question",
    "不問",
    "口:mouth enclosure;門:gate",
    "Someone is asking or wondering about something."
  ],
  [
    "飲",
    "drink",
    "core",
    "イン, オン",
    "のむ, のみ",
    "飲物",
    "のみもの",
    "drink",
    "飲酒",
    "欠:open mouth;食:food",
    "The clue is swallowing liquid from a cup or bottle."
  ],
  [
    "運",
    "carry",
    "core",
    "ウン",
    "はこぶ",
    "不運",
    "ふうん",
    "misfortune",
    "命運",
    "辶:walk road;車:vehicle;冖:cover",
    "Something is being transported from one place to another."
  ],
  [
    "温",
    "warm",
    "core",
    "オン",
    "あたたか, あたたかい, あたたまる, あたためる, ぬく",
    "保温",
    "ほおん",
    "retaining warmth",
    "温厚",
    "皿:dish base;氵:water side;日:sun window",
    "The air, water, or hands feel gently heated."
  ],
  [
    "開",
    "open",
    "core",
    "カイ",
    "ひらく, ひらき, びらき, ひらける, あく, あける",
    "再開",
    "さいかい",
    "reopening",
    "展開",
    "一:horizontal stroke;門:gate;廾:two hands",
    "A closed thing is being made accessible."
  ],
  [
    "階",
    "stairs",
    "regular",
    "カイ",
    "きざはし",
    "一階",
    "いっかい",
    "first floor",
    "二階",
    "白:white;比:component;阝:mound/city side",
    "The path rises step by step between levels."
  ],
  [
    "寒",
    "cold",
    "core",
    "カン",
    "さむい",
    "寒中",
    "かんちゅう",
    "mid-winter",
    "寒冷",
    "一:horizontal stroke;ハ:split-open shape;宀:roof",
    "The air bites and people reach for extra layers."
  ],
  [
    "期",
    "period",
    "regular",
    "キ, ゴ",
    "—",
    "一期",
    "いちご",
    "one's whole life",
    "中期",
    "甘:component;月:moon/flesh;ハ:split-open shape",
    "A planned span of time or expected season matters here."
  ],
  [
    "軽",
    "light",
    "core",
    "ケイ, キョウ, キン",
    "かるい, かろやか, かろんじる",
    "手軽",
    "てがる",
    "easy",
    "気軽",
    "車:vehicle;土:earth;又:hand action mark",
    "The object is easy to lift and not heavy."
  ],
  [
    "湖",
    "lake",
    "regular",
    "コ",
    "みずうみ",
    "湖水",
    "こすい",
    "lake",
    "湖沼",
    "月:moon/flesh;口:mouth enclosure;十:cross mark",
    "Still inland water is the main setting."
  ],
  [
    "港",
    "harbor",
    "regular",
    "コウ",
    "みなと",
    "入港",
    "にゅうこう",
    "entry into port",
    "港内",
    "氵:water side;ハ:split-open shape;己:self shape",
    "Boats and docks show that ships can stop here."
  ],
  [
    "歯",
    "tooth",
    "regular",
    "シ",
    "よわい, は, よわいする",
    "歯科",
    "しか",
    "dentistry",
    "歯車",
    "止:stop foot;歯:component;米:component",
    "The clue belongs inside the mouth."
  ],
  [
    "集",
    "gather",
    "core",
    "シュウ",
    "あつまる, あつめる, つどう",
    "全集",
    "ぜんしゅう",
    "complete works",
    "募集",
    "木:tree;隹:short-tailed bird",
    "People or things come together into one place."
  ],
  [
    "暑",
    "hot",
    "regular",
    "ショ",
    "あつい",
    "暑中",
    "しょちゅう",
    "height of summer",
    "残暑",
    "日:sun window;耂:old person top",
    "Summer heat or high temperature is the point."
  ],
  [
    "勝",
    "win",
    "core",
    "ショウ",
    "かつ, がち, まさる, すぐれる",
    "全勝",
    "ぜんしょう",
    "complete victory",
    "勝利",
    "月:moon/flesh;人:person;大:big form",
    "One side comes out ahead of the other."
  ],
  [
    "植",
    "plant",
    "regular",
    "ショク",
    "うえる, うわる",
    "入植",
    "にゅうしょく",
    "settlement",
    "植木",
    "十:cross mark;木:tree;目:component",
    "A seedling or tree is being placed into the ground."
  ],
  [
    "短",
    "short",
    "core",
    "タン",
    "みじかい",
    "最短",
    "さいたん",
    "shortest",
    "短冊",
    "口:mouth enclosure;豆:bean vessel;并:paired top",
    "The key measure is small in length or time."
  ],
  [
    "着",
    "wear",
    "core",
    "チャク, ジャク",
    "きる, きせる, つく, つける",
    "一着",
    "いっちゃく",
    "first place",
    "上着",
    "ノ:slanting stroke;王:king/jade base;并:paired top",
    "Clothing is being put on the body."
  ],
  [
    "湯",
    "hot water",
    "regular",
    "トウ",
    "ゆ",
    "湯気",
    "ゆげ",
    "steam",
    "湯治",
    "｜:vertical line;一:horizontal stroke;氵:water side",
    "Steam rises from the bath or kettle while everyone waits for it to cool."
  ],
  [
    "登",
    "climb",
    "core",
    "トウ, ト, ドウ, ショウ, チョウ",
    "のぼる, あがる",
    "登場",
    "とうじょう",
    "entrance",
    "登山",
    "口:mouth enclosure;豆:bean vessel;并:paired top",
    "The movement goes upward step by step."
  ],
  [
    "等",
    "equal",
    "regular",
    "トウ",
    "ひとしい, など, ら",
    "一等",
    "いっとう",
    "first class",
    "上等",
    "寸:measuring hand;竹:bamboo;土:earth",
    "The compared amounts or positions match."
  ],
  [
    "童",
    "child",
    "regular",
    "ドウ",
    "わらべ",
    "児童",
    "じどう",
    "children",
    "学童",
    "里:village;立:standing top",
    "The clue is a young person rather than an adult."
  ],
  [
    "悲",
    "sad",
    "regular",
    "ヒ",
    "かなしい, かなしむ",
    "悲劇",
    "ひげき",
    "tragedy",
    "悲哀",
    "心:heart;非:component",
    "The mood is heavy and sorrowful."
  ],
  [
    "筆",
    "brush",
    "regular",
    "ヒツ",
    "ふで",
    "主筆",
    "しゅひつ",
    "editor-in-chief",
    "執筆",
    "竹:bamboo;聿:component;乞:hooked lower part",
    "The writing tool itself is what matters."
  ],
  [
    "遊",
    "play",
    "regular",
    "ユウ, ユ",
    "あそぶ, あそばす",
    "周遊",
    "しゅうゆう",
    "tour",
    "外遊",
    "辶:walk road;子:component;方:direction",
    "Time is being spent for fun or leisure."
  ],
  [
    "葉",
    "leaf",
    "regular",
    "ヨウ",
    "は",
    "千葉",
    "ちば",
    "Chiba",
    "双葉",
    "木:tree;世:generation shape;艹:grass top",
    "A flat green part of a plant is the clue."
  ],
  [
    "陽",
    "sunshine",
    "regular",
    "ヨウ",
    "ひ",
    "太陽",
    "たいよう",
    "Sun",
    "斜陽",
    "一:horizontal stroke;日:sun window;阝:mound/city side",
    "Warm light comes from the sky and brightens the scene."
  ],
  [
    "落",
    "fall",
    "core",
    "ラク",
    "おちる, おち, おとす",
    "下落",
    "げらく",
    "depreciation",
    "低落",
    "口:mouth enclosure;氵:water side;夂:foot/going mark",
    "Something drops from a higher place or level."
  ],
  [
    "暗",
    "dark",
    "regular",
    "アン",
    "くらい, くらむ, くれる",
    "明暗",
    "めいあん",
    "light and darkness",
    "暗号",
    "音:sound;日:sun window;立:standing top",
    "There is little light and details are hard to see."
  ],
  [
    "意",
    "idea",
    "core",
    "イ",
    "—",
    "不意",
    "ふい",
    "sudden",
    "任意",
    "音:sound;心:heart;日:sun window",
    "A thought or intention forms in the mind."
  ],
  [
    "感",
    "feeling",
    "core",
    "カン",
    "—",
    "予感",
    "よかん",
    "presentiment",
    "五感",
    "ノ:slanting stroke;口:mouth enclosure;心:heart",
    "An inner reaction matters more than an outside action."
  ],
  [
    "漢",
    "Chinese",
    "regular",
    "カン",
    "—",
    "巨漢",
    "きょかん",
    "giant",
    "漢字",
    "氵:water side;艹:grass top;口:mouth enclosure",
    "The clue points to old writing and words borrowed from the continent."
  ],
  [
    "業",
    "work",
    "regular",
    "ギョウ, ゴウ",
    "わざ",
    "事業",
    "じぎょう",
    "business",
    "仕業",
    "｜:vertical line;一:horizontal stroke;王:king/jade base",
    "The word is about business, study, or a line of occupation."
  ],
  [
    "詩",
    "poem",
    "regular",
    "シ",
    "うた",
    "漢詩",
    "かんし",
    "Chinese poem",
    "詩人",
    "言:speech;寸:measuring hand;土:earth",
    "Short lines with rhythm are being written or read."
  ],
  [
    "想",
    "thought",
    "core",
    "ソウ, ソ",
    "おもう",
    "予想",
    "よそう",
    "expectation",
    "仮想",
    "心:heart;木:tree;目:component",
    "A mental image or recollection is forming."
  ],
  [
    "鉄",
    "iron",
    "regular",
    "テツ",
    "くろがね",
    "国鉄",
    "こくてつ",
    "national railway",
    "私鉄",
    "ノ:slanting stroke;金:metal;二:two-level mark",
    "The material is strong metal used in tools or rails."
  ],
  [
    "農",
    "farming",
    "regular",
    "ノウ",
    "—",
    "営農",
    "えいのう",
    "farming",
    "農園",
    "｜:vertical line;衣:clothing;一:horizontal stroke",
    "Fields, crops, and rural work are central."
  ],
  [
    "福",
    "fortune",
    "regular",
    "フク",
    "—",
    "幸福",
    "こうふく",
    "happiness",
    "祝福",
    "一:horizontal stroke;口:mouth enclosure;田:field box",
    "The scene suggests blessing, luck, or good outcome."
  ],
  [
    "路",
    "road",
    "regular",
    "ロ, ル",
    "じ, みち",
    "回路",
    "かいろ",
    "circuit",
    "岐路",
    "口:mouth enclosure;足:component;夂:foot/going mark",
    "The clue is the route people travel along."
  ],
  [
    "駅",
    "station",
    "regular",
    "エキ",
    "—",
    "宿駅",
    "しゅくえき",
    "relay station",
    "駅伝",
    "馬:component;尸:body flag;杰:component",
    "Platforms, trains, and departure boards define the scene."
  ],
  [
    "銀",
    "silver",
    "regular",
    "ギン",
    "しろがね",
    "世銀",
    "せぎん",
    "World Bank",
    "水銀",
    "金:metal;艮:stopping root",
    "The metal is pale and shiny like coins or jewelry."
  ],
  [
    "鼻",
    "nose",
    "regular",
    "ビ",
    "はな",
    "鼻先",
    "はなさき",
    "tip of nose",
    "鼻息",
    "自:self nose;田:field box;廾:two hands",
    "The clue is a part of the face used for smelling."
  ],
  [
    "様",
    "manner",
    "regular",
    "ヨウ, ショウ",
    "さま, さん",
    "一様",
    "いちよう",
    "uniform",
    "人様",
    "王:king/jade base;水:water;并:paired top",
    "The answer depends on the way something is done or appears."
  ],
  [
    "緑",
    "green",
    "regular",
    "リョク, ロク",
    "みどり",
    "新緑",
    "しんりょく",
    "fresh verdure",
    "緑化",
    "彐:hand broom;糸:thread;幺:short thread",
    "Fresh plant color is the important clue."
  ],
  [
    "練",
    "practice",
    "regular",
    "レン",
    "ねる, ねり",
    "修練",
    "しゅうれん",
    "training",
    "未練",
    "｜:vertical line;糸:thread;幺:short thread",
    "The same action is repeated to improve skill."
  ],
  [
    "横",
    "side",
    "regular",
    "オウ",
    "よこ",
    "専横",
    "せんおう",
    "arbitrariness",
    "横幅",
    "｜:vertical line;黄:component;田:field box",
    "The clue comes from left-right position rather than front-back."
  ],
  [
    "談",
    "talk",
    "regular",
    "ダン",
    "—",
    "会談",
    "かいだん",
    "talks",
    "余談",
    "火:fire;言:speech",
    "People are discussing something together."
  ],
  [
    "調",
    "tune",
    "regular",
    "チョウ",
    "しらべる, しらべ, ととのう, ととのえる",
    "不調",
    "ふちょう",
    "bad condition",
    "乱調",
    "言:speech;口:mouth enclosure;土:earth",
    "The key idea is adjusting, matching, or carefully checking."
  ],
  [
    "箱",
    "box",
    "regular",
    "ソウ",
    "はこ",
    "本箱",
    "ほんばこ",
    "bookcase",
    "重箱",
    "竹:bamboo;木:tree;目:component",
    "A container with sides holds the item inside."
  ],
  [
    "館",
    "hall",
    "regular",
    "カン",
    "やかた, たて",
    "休館",
    "きゅうかん",
    "closure",
    "会館",
    "口:mouth enclosure;食:food;宀:roof",
    "A public building or large facility is being used."
  ],
  [
    "橋",
    "bridge",
    "regular",
    "キョウ",
    "はし",
    "石橋",
    "いしばし",
    "stone bridge",
    "鉄橋",
    "ノ:slanting stroke;口:mouth enclosure;木:tree",
    "A crossing connects one side to the other over water or road."
  ],
  [
    "整",
    "arrange",
    "regular",
    "セイ",
    "ととのえる, ととのう",
    "均整",
    "きんせい",
    "symmetry",
    "整備",
    "｜:vertical line;一:horizontal stroke;口:mouth enclosure",
    "Things are put in order and made neat."
  ],
  [
    "薬",
    "drug",
    "regular",
    "ヤク",
    "くすり",
    "劇薬",
    "げきやく",
    "powerful medicine",
    "医薬",
    "日:sun window;木:tree;冫:ice",
    "Pills, bottles, or a medicine cabinet provide the clue."
  ],
  [
    "題",
    "topic",
    "regular",
    "ダイ",
    "—",
    "問題",
    "もんだい",
    "problem; question",
    "主題",
    "貝:shell money;目:component;ハ:split-open shape",
    "The clue is the subject written at the top or discussed in class."
  ]
];

const G3_RECORDS = G3_SOURCE.map(([kanji,action,tier,on,kun,exampleWord,exampleReading,exampleMeaning,blank2Word,componentSpec,scenario])=>({
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

const COMPONENT_POOL = uniqueBy(G3_RECORDS.map(record=>record.components[0]&&`${record.components[0].s} (${record.components[0].d})`).filter(Boolean),item=>item);
const READING_POOL = uniqueBy(G3_RECORDS.map(record=>record.exampleReading).filter(Boolean),item=>item);
const MEANING_POOL = uniqueBy(G3_RECORDS.map(record=>record.exampleMeaning).filter(Boolean),item=>item);

function buildCommand(record,index){
  const componentLead=record.components[0]||{s:record.kanji,d:'whole character form'};
  const componentCorrect=`${componentLead.s} (${componentLead.d})`;
  return {
    id:record.id,
    action:record.action,
    tier:record.tier,
    dom:'g3',
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

const COMMANDS = G3_RECORDS.map(buildCommand);

const KANJI_G3 = {
  id:'joyo-kanji-g3',
  name:'Joyo Kanji - Grade 3',
  description:'Kanji defense for 200 Grade 3 (elementary year 3) Joyo kanji',
  icon:'漢',
  inputMode:'quiz',
  prefixLabel:null,
  title:'KANJI 三年',
  subtitle:'DEFENSE',
  startButton:'出陣',
  instructions:'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub:'Grade 3 - 200 kanji - Recognition → Recall → Compounds',
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

const VARIABLE_BANK = Object.fromEntries(G3_RECORDS.map(record=>[
  record.id,
  uniqueBy(
    [...record.components, {s:record.kanji,d:'whole character form'}],
    entry=>`${entry.s}|${entry.d}`
  ).slice(0,3)
]));

const RELATIONSHIP_BANK = {};

const EXPLANATION_GLOSSARY = G3_RECORDS.map(record=>({
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
  'g3':['Grade 3 (third-year elementary)'],
};

const CONFUSABLE_GROUPS = [
  "反返坂",
  "写主注申",
  "打投指持拾",
  "氷波泳湖湯温洋油酒消流港深",
  "仕住使係待",
  "去返追送進運転遊落路速",
  "宮庫宿院館屋庭",
  "岸島畑庭湖港橋",
  "昔昭暑暗寒期",
  "号味命飲問",
  "植葉緑薬荷",
  "鉄銀駅",
  "勝負",
  "病悪苦医薬",
  "陽温暑湯寒氷",
  "悪悲意感想",
  "球笛筆詩章題談調",
  "重軽短",
  "客員者君",
  "配倍等級第",
  "都県州局部",
  "開問階館",
  "豆酒味飲",
  "神祭福",
  "発起登落",
  "動進速",
  "柱橋館箱"
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

const APPLICATION_BANK = Object.fromEntries(G3_RECORDS.map(record=>[
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

KANJI_G3.variableBank = VARIABLE_BANK;
KANJI_G3.applicationBank = APPLICATION_BANK;
KANJI_G3.relationshipBank = RELATIONSHIP_BANK;
KANJI_G3.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G3.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G3.domLabels = DOM_LABELS;
KANJI_G3.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G3.normalizeExplanationLookup = normalizeLookup;
KANJI_G3.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G3.wireL1toL2 = wireL1toL2;

window.KANJI_G3_DATA = KANJI_G3;
})();
