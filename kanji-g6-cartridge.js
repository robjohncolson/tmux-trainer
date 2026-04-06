// Joyo Kanji Grade 6 — Formula Defense Cartridge
// 191 kanji · compound-completion blanks · reading-in-word subconcepts
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

const G6_SOURCE = [
  ["干", "dry", "regular", "カン", "ほ.す, ほ.し-, -ぼ.し, ひ.る", "干潟", "ひがた", "tidal flat", "干渉", "干:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read ひがた appears in class and everyday life, and this kanji is one part of it."],
  ["己", "self", "regular", "コ, キ", "おのれ, つちのと, な", "自己", "じこ", "self", "利己", "己:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read じこ, and this character supplies one piece of it."],
  ["寸", "measurement", "regular", "スン", "—", "寸法", "すんぽう", "measurement", "寸断", "寸:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term すんぽう, and this kanji is one character in that word."],
  ["亡", "perish", "regular", "ボウ, モウ", "な.い, な.き-, ほろ.びる, ほろ.ぶ, ほろ.ぼす", "亡骸", "なきがら", "remains", "亡命", "亡:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read なきがら, and this kanji is the missing character in it."],
  ["尺", "measure", "regular", "シャク", "—", "尺度", "しゃくど", "gauge", "尺骨", "尺:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read しゃくど appears in class and everyday life, and this kanji is one part of it."],
  ["収", "income", "core", "シュウ", "おさ.める, おさ.まる", "収集", "しゅうしゅう", "collecting", "収録", "収:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read しゅうしゅう, and this character supplies one piece of it."],
  ["仁", "benevolence", "regular", "ジン, ニ, ニン", "—", "仁愛", "じんあい", "benevolence", "仁義", "亻:person radical;二:two", "A story praises a person who treats others with compassion and care."],
  ["片", "one-sided", "regular", "ヘン", "かた-, かた", "片道", "かたみち", "one-way", "片想い", "片:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read かたみち, and this kanji is the missing character in it."],
  ["穴", "hole", "regular", "ケツ", "あな", "穴埋め", "あなうめ", "filling", "穴場", "宀:roof radical;八:eight", "A familiar term read あなうめ appears in class and everyday life, and this kanji is one part of it."],
  ["冊", "volume", "regular", "サツ, サク", "ふみ", "冊子", "さっし", "book", "別冊", "𦉫:component;一:one", "The clue points to a common word read さっし, and this character supplies one piece of it."],
  ["処", "dispose", "core", "ショ", "ところ, -こ, お.る", "処罰", "しょばつ", "punishment", "処置", "処:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term しょばつ, and this kanji is one character in that word."],
  ["庁", "government office", "regular", "チョウ, テイ", "やくしょ", "官庁", "かんちょう", "government office", "庁舎", "广:shelter radical;丁:nail/peg", "A local news clip shows officials entering a large prefectural administration building."],
  ["幼", "infancy", "regular", "ヨウ", "おさな.い", "幼馴染", "おさななじみ", "childhood friend", "幼稚園", "幼:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read おさななじみ appears in class and everyday life, and this kanji is one part of it."],
  ["宇", "eaves", "regular", "ウ", "—", "宇宙", "うちゅう", "universe", "宇宙船", "宀:roof radical;于:go beyond", "The clue points to a common word read うちゅう, and this character supplies one piece of it."],
  ["灰", "ashes", "regular", "カイ", "はい", "灰色", "はいいろ", "grey", "灰皿", "灰:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term はいいろ, and this kanji is one character in that word."],
  ["危", "dangerous", "core", "キ", "あぶ.ない, あや.うい, あや.ぶむ", "危険", "きけん", "danger", "危篤", "危:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read きけん, and this kanji is the missing character in it."],
  ["机", "desk", "regular", "キ", "つくえ", "机上", "きじょう", "on the desk", "勉強机", "木:tree;几:table/desk legs", "A familiar term read きじょう appears in class and everyday life, and this kanji is one part of it."],
  ["吸", "suck", "core", "キュウ", "す.う", "吸血鬼", "きゅうけつき", "vampire", "吸殻", "口:mouth;及:reach out", "The clue points to a common word read きゅうけつき, and this character supplies one piece of it."],
  ["后", "empress", "regular", "コウ, ゴ", "きさき", "皇后", "こうごう", "empress", "后宮", "口:mouth;𠂋:component", "A palace scene focuses on the ruler's consort rather than the ruler himself."],
  ["至", "reach", "regular", "シ", "いた.る", "至福", "しふく", "beatitude", "至急", "至:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read しふく, and this kanji is the missing character in it."],
  ["舌", "tongue", "regular", "ゼツ", "した", "舌戦", "ぜっせん", "war of words", "毒舌", "口:mouth;千:thousand", "A familiar term read ぜっせん appears in class and everyday life, and this kanji is one part of it."],
  ["存", "exist", "core", "ソン, ゾン", "ながら.える, あ.る, たも.つ, と.う", "存続", "そんぞく", "continuance", "存立", "存:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read そんぞく, and this character supplies one piece of it."],
  ["宅", "home", "core", "タク", "—", "住宅", "じゅうたく", "residence", "宅配", "宀:roof radical;乇:entrust part", "A lesson or news item uses the term じゅうたく, and this kanji is one character in that word."],
  ["我", "self", "core", "ガ", "われ, わ, わ.が-, わが-", "我慢", "がまん", "endurance", "自我", "我:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read がまん, and this kanji is the missing character in it."],
  ["系", "lineage", "regular", "ケイ", "—", "系譜", "けいふ", "genealogy", "系統", "糸:thread;丿:slash stroke", "A familiar term read けいふ appears in class and everyday life, and this kanji is one part of it."],
  ["孝", "filial piety", "regular", "コウ, キョウ", "—", "孝行", "こうこう", "filial piety", "親孝行", "孝:whole character form;stroke:stroke anchor;shape:overall shape", "A history lesson highlights children honoring and caring for their parents."],
  ["困", "quandary", "core", "コン", "こま.る", "困難", "こんなん", "difficulty", "困惑", "木:tree;囗:box", "A lesson or news item uses the term こんなん, and this kanji is one character in that word."],
  ["私", "private", "core", "シ", "わたくし, わたし", "私立", "しりつ", "private", "私語", "禾:grain;厶:private mark", "Someone mentions a word read しりつ, and this kanji is the missing character in it."],
  ["否", "negate", "core", "ヒ", "いな, いや", "否認", "ひにん", "denial", "否決", "口:mouth;不:negative", "A familiar term read ひにん appears in class and everyday life, and this kanji is one part of it."],
  ["批", "criticism", "regular", "ヒ", "—", "批難", "ひなん", "criticism", "批評", "扌:hand radical;比:compare", "The clue points to a common word read ひなん, and this character supplies one piece of it."],
  ["忘", "forget", "core", "ボウ", "わす.れる", "忘年会", "ぼうねんかい", "year-end party", "忘却", "心:heart;亡:perish part", "A lesson or news item uses the term ぼうねんかい, and this kanji is one character in that word."],
  ["乱", "riot", "core", "ラン, ロン", "みだ.れる, みだ.る, みだ.す, みだ, おさ.める, わた.る", "乱雑", "らんざつ", "disorder", "乱闘", "乱:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read らんざつ, and this kanji is the missing character in it."],
  ["卵", "egg", "regular", "ラン", "たまご", "卵形", "らんけい", "oval shape", "卵巣", "卵:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read らんけい appears in class and everyday life, and this kanji is one part of it."],
  ["延", "prolong", "core", "エン", "の.びる, の.べる, の.べ, の.ばす", "延長", "えんちょう", "extension", "延滞", "延:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read えんちょう, and this character supplies one piece of it."],
  ["沿", "run alongside", "regular", "エン", "そ.う, -ぞ.い", "沿道", "えんどう", "roadside", "沿線", "口:mouth;氵:water radical;几:table/desk legs", "A lesson or news item uses the term えんどう, and this kanji is one character in that word."],
  ["拡", "broaden", "core", "カク, コウ", "ひろ.がる, ひろ.げる, ひろ.める", "拡散", "かくさん", "spreading", "拡張子", "扌:hand radical;広:wide", "Someone mentions a word read かくさん, and this kanji is the missing character in it."],
  ["供", "submit", "core", "キョウ, ク, クウ, グ", "そな.える, とも, -ども", "供養", "くよう", "memorial service for", "供述", "亻:person radical;共:together", "A familiar term read くよう appears in class and everyday life, and this kanji is one part of it."],
  ["券", "ticket", "regular", "ケン", "—", "食券", "しょっけん", "meal ticket", "乗車券", "券:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read しょっけん, and this character supplies one piece of it."],
  ["呼", "call", "core", "コ", "よ.ぶ", "呼吸", "こきゅう", "breathing", "呼名", "口:mouth;乎:question mark", "A lesson or news item uses the term こきゅう, and this kanji is one character in that word."],
  ["刻", "engrave", "regular", "コク", "きざ.む, きざ.み", "刻刻", "こっこく", "moment by moment", "刻々", "刻:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read こっこく, and this kanji is the missing character in it."],
  ["若", "young", "core", "ジャク, ニャク, ニャ", "わか.い, わか-, も.しくわ, も.し, も.しくは, ごと.し", "若干", "じゃっかん", "some", "若しも", "若:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read じゃっかん appears in class and everyday life, and this kanji is one part of it."],
  ["宗", "religion", "regular", "シュウ, ソウ", "むね", "宗教", "しゅうきょう", "religion", "宗派", "宀:roof radical;示:altar", "The clue points to a common word read しゅうきょう, and this character supplies one piece of it."],
  ["承", "acquiesce", "core", "ショウ, ジョウ", "うけたまわ.る, う.ける", "承諾", "しょうだく", "consent", "承認", "承:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term しょうだく, and this kanji is one character in that word."],
  ["垂", "droop", "regular", "スイ", "た.れる, た.らす, た.れ, -た.れ, なんなんと.す", "垂直", "すいちょく", "vertical", "垂幕", "垂:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read すいちょく, and this kanji is the missing character in it."],
  ["担", "shouldering", "core", "タン", "かつ.ぐ, にな.う", "担架", "たんか", "stretcher", "担当者", "扌:hand radical;旦:daybreak", "A familiar term read たんか appears in class and everyday life, and this kanji is one part of it."],
  ["宙", "mid-air", "regular", "チュウ", "—", "宇宙", "うちゅう", "universe", "宙返り", "宀:roof radical;由:reason/source", "The clue points to a common word read うちゅう, and this character supplies one piece of it."],
  ["忠", "loyalty", "regular", "チュウ", "—", "忠実", "ちゅうじつ", "faithful", "忠義", "心:heart;中:in", "A retainer stays faithful to his lord even when danger rises."],
  ["届", "deliver", "core", "カイ", "とど.ける, -とど.け, とど.く", "届出", "とどけで", "report", "届け出", "尸:body radical;由:reason/source", "Someone mentions a word read とどけで, and this kanji is the missing character in it."],
  ["乳", "milk", "regular", "ニュウ", "ちち, ち", "乳首", "ちちくび", "nipple", "乳製品", "乳:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read ちちくび appears in class and everyday life, and this kanji is one part of it."],
  ["拝", "worship", "core", "ハイ", "おが.む, おろが.む", "拝見", "はいけん", "seeing", "拝啓", "扌:hand radical;一:one;丰:abundant", "The clue points to a common word read はいけん, and this character supplies one piece of it."],
  ["並", "row", "core", "ヘイ, ホウ", "な.み, なみ, なら.べる, なら.ぶ, なら.びに", "並行", "へいこう", "going side-by-side", "並木", "並:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term へいこう, and this kanji is one character in that word."],
  ["宝", "treasure", "core", "ホウ", "たから", "宝石", "ほうせき", "gem", "宝物", "宀:roof radical;玉:jewel", "Someone mentions a word read ほうせき, and this kanji is the missing character in it."],
  ["枚", "sheet", "regular", "マイ, バイ", "—", "枚数", "まいすう", "the number of", "枚挙", "木:tree;攵:strike/act", "A familiar term read まいすう appears in class and everyday life, and this kanji is one part of it."],
  ["胃", "stomach", "core", "イ", "—", "胃腸", "いちょう", "stomach and intestines", "胃痛", "月:flesh/body radical;田:field", "A health chart points to the body part that starts handling food after it is swallowed."],
  ["映", "reflect", "core", "エイ", "うつ.る, うつ.す, は.える, -ば.え", "映画", "えいが", "movie", "上映", "映:whole character form;stroke:stroke anchor;shape:overall shape", "The room goes dark and an image appears on the screen."],
  ["革", "leather", "core", "カク", "かわ", "革新", "かくしん", "reform", "革命", "革:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read かくしん, and this kanji is the missing character in it."],
  ["巻", "scroll", "regular", "カン, ケン", "ま.く, まき, ま.き", "巻末", "かんまつ", "end of a", "巻添え", "巻:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read かんまつ appears in class and everyday life, and this kanji is one part of it."],
  ["看", "watch over", "core", "カン", "み.る", "看過", "かんか", "overlooking", "看護師", "看:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read かんか, and this character supplies one piece of it."],
  ["皇", "emperor", "regular", "コウ, オウ", "—", "皇室", "こうしつ", "imperial household", "天皇", "皇:whole character form;stroke:stroke anchor;shape:overall shape", "A history unit discusses the imperial household and the ruler at its center."],
  ["紅", "crimson", "regular", "コウ, ク", "べに, くれない, あか.い", "紅葉", "こうよう", "leaves turning red", "紅茶", "紅:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read こうよう, and this kanji is the missing character in it."],
  ["砂", "sand", "regular", "サ, シャ", "すな", "砂糖", "さとう", "sugar", "砂漠", "石:stone;少:few", "A familiar term read さとう appears in class and everyday life, and this kanji is one part of it."],
  ["姿", "figure", "regular", "シ", "すがた", "姿勢", "しせい", "posture", "容姿", "姿:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read しせい, and this character supplies one piece of it."],
  ["宣", "proclaim", "core", "セン", "のたま.う", "宣言", "せんげん", "declaration", "宣伝", "宀:roof radical;亘:span", "A lesson or news item uses the term せんげん, and this kanji is one character in that word."],
  ["専", "specialize", "core", "セン", "もっぱ.ら", "専門", "せんもん", "speciality", "専用", "寸:inch/measure radical;𤰔:component", "Someone mentions a word read せんもん, and this kanji is the missing character in it."],
  ["泉", "spring", "core", "セン", "いずみ", "温泉", "おんせん", "hot spring", "源泉", "泉:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read おんせん appears in class and everyday life, and this kanji is one part of it."],
  ["洗", "wash", "core", "セン", "あら.う", "洗面所", "せんめんじょ", "washroom", "洗錬", "洗:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read せんめんじょ, and this character supplies one piece of it."],
  ["染", "dye", "core", "セン", "そ.める, -ぞ.め, -ぞめ, そ.まる, し.みる, -じ.みる, し.み, -し.める", "染色", "せんしょく", "dyeing", "染める", "木:tree;氿:spring", "A lesson or news item uses the term せんしょく, and this kanji is one character in that word."],
  ["奏", "perform", "regular", "ソウ", "かな.でる", "演奏", "えんそう", "musical performance", "奏者", "奏:whole character form;stroke:stroke anchor;shape:overall shape", "An orchestra rehearsal begins and one musician gives the opening notes."],
  ["退", "retreat", "core", "タイ", "しりぞ.く, しりぞ.ける, ひ.く, の.く, の.ける, ど.く", "退陣", "たいじん", "resignation", "退院", "退:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read たいじん appears in class and everyday life, and this kanji is one part of it."],
  ["段", "step", "core", "ダン, タン", "—", "段階", "だんかい", "stage", "段落", "段:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read だんかい, and this character supplies one piece of it."],
  ["派", "faction", "core", "ハ", "—", "派閥", "はばつ", "clique", "派遣", "派:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term はばつ, and this kanji is one character in that word."],
  ["背", "stature", "core", "ハイ", "せ, せい, そむ.く, そむ.ける", "背景", "はいけい", "background", "背後", "月:flesh/body radical;北:north", "Someone mentions a word read はいけい, and this kanji is the missing character in it."],
  ["肺", "lungs", "core", "ハイ", "—", "肺炎", "はいえん", "pneumonia", "肺活量", "月:flesh/body radical;巿:cloth strip", "A breathing test measures how much air the body can move in and out."],
  ["律", "rhythm", "core", "リツ, リチ, レツ", "—", "律義者", "りちぎもの", "honest person", "律義", "律:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read りちぎもの, and this character supplies one piece of it."],
  ["恩", "grace", "core", "オン", "—", "恩赦", "おんしゃ", "amnesty", "恩恵", "心:heart;因:cause", "A lesson or news item uses the term おんしゃ, and this kanji is one character in that word."],
  ["株", "stocks", "core", "シュ", "かぶ", "株式", "かぶしき", "share", "株券", "木:tree;朱:vermilion", "Someone mentions a word read かぶしき, and this kanji is the missing character in it."],
  ["胸", "bosom", "core", "キョウ", "むね, むな-", "胸部", "きょうぶ", "chest", "胸中", "月:flesh/body radical;匈:turmoil", "A doctor places a stethoscope on the front of the torso to listen to breathing."],
  ["降", "descend", "core", "コウ, ゴ", "お.りる, お.ろす, ふ.る, ふ.り, くだ.る, くだ.す", "降雪", "こうせつ", "snowfall", "降雨", "降:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read こうせつ, and this character supplies one piece of it."],
  ["骨", "skeleton", "core", "コツ", "ほね", "骨骼", "こっかく", "skeleton", "骨董", "月:flesh/body radical;⑤:component", "A lesson or news item uses the term こっかく, and this kanji is one character in that word."],
  ["座", "squat", "core", "ザ", "すわ.る", "座談会", "ざだんかい", "symposium", "座蒲団", "广:shelter radical;坐:sit", "Someone mentions a word read ざだんかい, and this kanji is the missing character in it."],
  ["蚕", "silkworm", "regular", "サン, テン", "かいこ, こ", "蚕霊", "こだま", "guardian deity of", "蚕糸", "蚕:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read こだま appears in class and everyday life, and this kanji is one part of it."],
  ["射", "shoot", "core", "シャ", "い.る, さ.す, う.つ", "射程", "しゃてい", "range", "射殺", "寸:inch/measure radical;身:somebody", "The clue points to a common word read しゃてい, and this character supplies one piece of it."],
  ["従", "accompany", "core", "ジュウ, ショウ, ジュ", "したが.う, したが.える, より", "従業員", "じゅうぎょういん", "employee", "従来", "従:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term じゅうぎょういん, and this kanji is one character in that word."],
  ["純", "genuine", "core", "ジュン", "—", "純金", "じゅんきん", "pure gold", "純粋", "純:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read じゅんきん, and this kanji is the missing character in it."],
  ["除", "exclude", "core", "ジョ, ジ", "のぞ.く, -よ.け", "除外", "じょがい", "exception", "除名", "除:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read じょがい appears in class and everyday life, and this kanji is one part of it."],
  ["将", "leader", "core", "ショウ, ソウ", "まさ.に, はた, まさ, ひきい.る, もって", "将来", "しょうらい", "future", "将軍", "将:whole character form;stroke:stroke anchor;shape:overall shape", "A battle chronicle describes the commander leading troops from the front."],
  ["針", "needle", "core", "シン", "はり", "針金", "はりがね", "wire", "針灸", "金:metal;十:ten", "A lesson or news item uses the term はりがね, and this kanji is one character in that word."],
  ["値", "price", "core", "チ", "ね, あたい", "値段", "ねだん", "price", "値打", "亻:person radical;直:straightaway", "Someone mentions a word read ねだん, and this kanji is the missing character in it."],
  ["展", "unfold", "core", "テン", "—", "展開", "てんかい", "development", "展覧会", "尸:body radical;龷:two hands;𠄌:component", "A familiar term read てんかい appears in class and everyday life, and this kanji is one part of it."],
  ["討", "chastise", "core", "トウ", "う.つ", "討議", "とうぎ", "debate", "討論", "寸:inch/measure radical;言:speech", "The clue points to a common word read とうぎ, and this character supplies one piece of it."],
  ["党", "party", "core", "トウ", "なかま, むら", "政党", "せいとう", "political party", "与党", "党:whole character form;stroke:stroke anchor;shape:overall shape", "An election report compares several political groups competing for seats."],
  ["納", "settlement", "core", "ノウ, ナッ, ナ, ナン, トウ", "おさ.める, -おさ.める, おさ.まる", "納金", "のうきん", "payment", "納豆", "納:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read のうきん, and this kanji is the missing character in it."],
  ["俳", "haiku", "regular", "ハイ", "—", "俳句", "はいく", "haiku", "俳優", "亻:person radical;非:un-", "A literature club studies short verse with season words and tight rhythm."],
  ["班", "group", "regular", "ハン", "—", "班長", "はんちょう", "squad leader", "班員", "班:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read はんちょう, and this character supplies one piece of it."],
  ["秘", "secret", "core", "ヒ", "ひ.める, ひそ.か, かく.す", "秘露", "ペルー", "peru", "秘訣", "秘:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term ペルー, and this kanji is one character in that word."],
  ["俵", "straw bag", "regular", "ヒョウ", "たわら", "米俵", "こめだわら", "bag of rice", "俵物", "亻:person radical;表:surface", "Someone mentions a word read こめだわら, and this kanji is the missing character in it."],
  ["陛", "majesty", "regular", "ヘイ", "—", "陛下", "へいか", "your majesty", "陛衛", "陛:whole character form;stroke:stroke anchor;shape:overall shape", "A formal news report uses an extremely respectful title for the ruler."],
  ["朗", "clear", "regular", "ロウ", "ほが.らか, あき.らか", "朗読", "ろうどく", "reading aloud", "朗報", "月:flesh/body radical;丶:dot;⑤:component", "The clue points to a common word read ろうどく, and this character supplies one piece of it."],
  ["異", "uncommon", "core", "イ", "こと, こと.なる, け", "異議", "いぎ", "objection", "異論", "田:field;共:together", "A lesson or news item uses the term いぎ, and this kanji is one character in that word."],
  ["域", "range", "core", "イキ", "—", "域外", "いきがい", "outside the area", "域内", "域:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read いきがい, and this kanji is the missing character in it."],
  ["郷", "home town", "regular", "キョウ, ゴウ", "さと", "故郷", "ふるさと", "hometown", "郷土", "郷:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read ふるさと appears in class and everyday life, and this kanji is one part of it."],
  ["済", "settle", "core", "サイ, セイ", "す.む, -ず.み, -ずみ, す.まない, す.ます, -す.ます, すく.う, な.す, わたし, わた.る", "済む", "すむ", "finish", "済ます", "済:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read すむ, and this character supplies one piece of it."],
  ["視", "inspection", "core", "シ", "み.る", "視線", "しせん", "one's line of", "視野", "視:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term しせん, and this kanji is one character in that word."],
  ["捨", "discard", "core", "シャ", "す.てる", "捨子", "すてご", "abandoned child", "捨て子", "扌:hand radical;舍:inn", "Someone mentions a word read すてご, and this kanji is the missing character in it."],
  ["推", "conjecture", "core", "スイ", "お.す", "推量", "すいりょう", "guess", "推進", "扌:hand radical;隹:short-tailed bird", "A familiar term read すいりょう appears in class and everyday life, and this kanji is one part of it."],
  ["盛", "boom", "core", "セイ, ジョウ", "も.る, さか.る, さか.ん", "盛況", "せいきょう", "success", "盛大", "盛:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read せいきょう, and this character supplies one piece of it."],
  ["窓", "window", "core", "ソウ, ス", "まど, てんまど, けむだし", "窓際", "まどぎわ", "at the window", "窓口", "穴:hole radical;心:heart;厶:private mark", "A lesson or news item uses the term まどぎわ, and this kanji is one character in that word."],
  ["探", "grope", "core", "タン", "さぐ.る, さが.す", "探険隊", "たんけんたい", "exploration party", "探険", "扌:hand radical;罙:component", "Someone mentions a word read たんけんたい, and this kanji is the missing character in it."],
  ["著", "renowned", "core", "チョ, チャク", "あらわ.す, いちじる.しい", "著者", "ちょしゃ", "author", "著書", "著:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read ちょしゃ appears in class and everyday life, and this kanji is one part of it."],
  ["頂", "top", "core", "チョウ", "いただ.く, いただき", "頂辺", "てへん", "top", "頂点", "頂:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read てへん, and this character supplies one piece of it."],
  ["脳", "brain", "core", "ノウ, ドウ", "のうずる", "脳波", "のうは", "brain waves", "脳内", "月:flesh/body radical;𭕄:component;凶:villain", "A science diagram highlights the part of the body that directs thought and movement."],
  ["閉", "closed", "core", "ヘイ", "と.じる, と.ざす, し.める, し.まる, た.てる", "閉店", "へいてん", "closing up shop", "閉会", "門:gate radical;才:genius", "At the end of the day, the sign flips and the shop stops letting people in."],
  ["訪", "call on", "core", "ホウ", "おとず.れる, たず.ねる, と.う", "訪米", "ほうべい", "visit to the", "訪欧", "言:speech;方:direction", "A familiar term read ほうべい appears in class and everyday life, and this kanji is one part of it."],
  ["密", "secrecy", "core", "ミツ", "ひそ.か", "密集", "みっしゅう", "crowding together", "密輸", "密:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read みっしゅう, and this character supplies one piece of it."],
  ["訳", "translate", "core", "ヤク", "わけ", "訳者", "やくしゃ", "translator", "訳す", "言:speech;尺:shaku", "A lesson or news item uses the term やくしゃ, and this kanji is one character in that word."],
  ["郵", "mail", "regular", "ユウ", "—", "郵送", "ゆうそう", "mailing", "郵貯", "郵:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read ゆうそう, and this kanji is the missing character in it."],
  ["欲", "longing", "core", "ヨク", "ほっ.する, ほ.しい", "欲求", "よっきゅう", "desire", "欲望", "欲:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read よっきゅう appears in class and everyday life, and this kanji is one part of it."],
  ["翌", "the following", "core", "ヨク", "—", "翌朝", "よくちょう", "next morning", "翌月", "翌:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read よくちょう, and this character supplies one piece of it."],
  ["割", "proportion", "core", "カツ", "わ.る, わり, わ.り, わ.れる, さ.く", "割当", "わりあて", "allotment", "割引", "割:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term わりあて, and this kanji is one character in that word."],
  ["揮", "brandish", "regular", "キ", "ふる.う", "揮発油", "きはつゆ", "gasoline", "揮発性", "扌:hand radical;軍:army", "Someone mentions a word read きはつゆ, and this kanji is the missing character in it."],
  ["貴", "precious", "core", "キ", "たっと.い, とうと.い, たっと.ぶ, とうと.ぶ", "貴重", "きちょう", "precious", "高貴", "貝:shell/money;𠀐:component", "A familiar term read きちょう appears in class and everyday life, and this kanji is one part of it."],
  ["勤", "diligence", "core", "キン, ゴン", "つと.める, -づと.め, つと.まる, いそ.しむ", "勤続", "きんぞく", "continuous service", "勤務", "勤:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read きんぞく, and this character supplies one piece of it."],
  ["筋", "muscle", "core", "キン", "すじ", "筋道", "すじみち", "reason", "筋肉", "竹:bamboo;肋:rib", "A lesson or news item uses the term すじみち, and this kanji is one character in that word."],
  ["敬", "awe", "core", "ケイ, キョウ", "うやま.う", "敬遠", "けいえん", "pretending to respect", "敬語", "敬:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read けいえん, and this kanji is the missing character in it."],
  ["裁", "judge", "core", "サイ", "た.つ, さば.く", "裁判", "さいばん", "trial", "裁縫", "裁:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read さいばん appears in class and everyday life, and this kanji is one part of it."],
  ["策", "scheme", "core", "サク", "—", "策略", "さくりゃく", "stratagem", "策戦", "竹:bamboo;朿:thorn", "The clue points to a common word read さくりゃく, and this character supplies one piece of it."],
  ["詞", "words", "core", "シ", "ことば", "歌詞", "かし", "song lyrics", "動詞", "言:speech;司:director", "A lesson or news item uses the term かし, and this kanji is one character in that word."],
  ["就", "concerning", "core", "シュウ, ジュ", "つ.く, つ.ける", "就航", "しゅうこう", "entering service", "就職", "就:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read しゅうこう, and this kanji is the missing character in it."],
  ["衆", "masses", "core", "シュウ, シュ", "おお.い", "衆院", "しゅういん", "house of representatives", "衆議院", "衆:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read しゅういん appears in class and everyday life, and this kanji is one part of it."],
  ["善", "goodness", "core", "ゼン", "よ.い, い.い, よ.く, よし.とする", "善意", "ぜんい", "virtuous mind", "改善", "口:mouth;羊:sheep;䒑:grass", "A student quietly helps a classmate who is struggling without asking for praise."],
  ["創", "genesis", "core", "ソウ, ショウ", "つく.る, はじ.める, きず, けず.しける", "創造力", "そうぞうりょく", "creative power", "創造", "創:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term そうぞうりょく, and this kanji is one character in that word."],
  ["装", "attire", "core", "ソウ, ショウ", "よそお.う, よそお.い", "装飾", "そうしょく", "ornament", "装置", "装:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read そうしょく, and this kanji is the missing character in it."],
  ["尊", "revered", "core", "ソン", "たっと.い, とうと.い, たっと.ぶ, とうと.ぶ", "尊敬", "そんけい", "respect", "尊重", "寸:inch/measure radical;酋:chieftain", "A ceremony reminds everyone to treat elders and traditions with deep regard."],
  ["痛", "pain", "core", "ツウ", "いた.い, いた.む, いた.ましい, いた.める", "痛手", "いたで", "serious wound", "痛感", "疒:illness radical;甬:road with walls", "The clue points to a common word read いたで, and this character supplies one piece of it."],
  ["晩", "nightfall", "regular", "バン", "—", "晩香波", "バンクーバー", "vancouver", "晩香坡", "晩:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term バンクーバー, and this kanji is one character in that word."],
  ["補", "supplement", "core", "ホ", "おぎな.う", "補足", "ほそく", "supplement", "補聴器", "補:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read ほそく, and this kanji is the missing character in it."],
  ["棒", "rod", "regular", "ボウ", "—", "鉄棒", "てつぼう", "iron rod", "泥棒", "木:tree;奉:observance", "A familiar term read てつぼう appears in class and everyday life, and this kanji is one part of it."],
  ["絹", "silk", "regular", "ケン", "きぬ", "絹糸", "きぬいと", "silk thread", "絹布", "糹:component;肙:a small worm", "The clue points to a common word read きぬいと, and this character supplies one piece of it."],
  ["源", "source", "core", "ゲン", "みなもと", "源流", "げんりゅう", "source", "源泉", "源:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term げんりゅう, and this kanji is one character in that word."],
  ["署", "signature", "core", "ショ", "—", "警察署", "けいさつしょ", "police station", "税務署", "署:whole character form;stroke:stroke anchor;shape:overall shape", "A neighborhood map marks the local police station."],
  ["傷", "wound", "core", "ショウ", "きず, いた.む, いた.める", "負傷", "ふしょう", "injury", "傷口", "亻:person radical;𬀷:component", "A familiar term read ふしょう appears in class and everyday life, and this kanji is one part of it."],
  ["蒸", "steam", "regular", "ジョウ, セイ", "む.す, む.れる, む.らす", "蒸発", "じょうはつ", "evaporation", "蒸汽", "蒸:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read じょうはつ, and this character supplies one piece of it."],
  ["聖", "holy", "regular", "セイ, ショウ", "ひじり", "聖火", "せいか", "sacred fire", "神聖", "聖:whole character form;stroke:stroke anchor;shape:overall shape", "A torch relay and solemn ceremony make the scene feel set apart from ordinary life."],
  ["誠", "sincerity", "regular", "セイ", "まこと", "誠実", "せいじつ", "sincere", "誠意", "言:speech;成:turn into", "People trust the speaker because every promise sounds honest and wholehearted."],
  ["暖", "warmth", "core", "ダン, ノン", "あたた.か, あたた.かい, あたた.まる, あたた.める", "暖気", "のんき", "easy", "暖房", "暖:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read のんき appears in class and everyday life, and this kanji is one part of it."],
  ["腸", "intestines", "core", "チョウ", "はらわた, わた", "腸炎", "ちょうえん", "enteritis", "胃腸", "月:flesh/body radical;昜:sunlight part", "A digestion unit follows food as it moves through the lower part of the gut."],
  ["賃", "fare", "regular", "チン", "—", "賃銀", "ちんぎん", "wages", "賃金", "貝:shell/money;任:responsibility", "A lesson or news item uses the term ちんぎん, and this kanji is one character in that word."],
  ["腹", "abdomen", "regular", "フク", "はら", "腹痛", "ふくつう", "stomach ache", "腹部", "月:flesh/body radical;复:return", "After running hard, a student grabs the middle of the body and says it hurts there."],
  ["幕", "curtain", "regular", "マク, バク", "とばり", "幕末", "ばくまつ", "bakumatsu period", "幕府", "幕:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read ばくまつ appears in class and everyday life, and this kanji is one part of it."],
  ["盟", "alliance", "regular", "メイ", "—", "盟友", "めいゆう", "sworn friend", "盟主", "盟:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read めいゆう, and this character supplies one piece of it."],
  ["預", "deposit", "regular", "ヨ", "あず.ける, あず.かる", "預防", "よぼう", "prevention", "預金", "預:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term よぼう, and this kanji is one character in that word."],
  ["裏", "back", "regular", "リ", "うら", "裏金", "うらがね", "bribe", "裏口", "裏:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read うらがね, and this kanji is the missing character in it."],
  ["閣", "cabinet", "regular", "カク", "—", "内閣", "ないかく", "cabinet", "閣議", "門:gate radical;各:each", "A civics lesson covers the group of top ministers who run the government."],
  ["疑", "doubt", "regular", "ギ", "うたが.う", "疑惑", "ぎわく", "doubt", "疑念", "疑:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read ぎわく, and this character supplies one piece of it."],
  ["誤", "mistake", "regular", "ゴ", "あやま.る, -あやま.る", "誤認", "ごにん", "misrecognition", "誤解", "言:speech;吴:name of warring", "A lesson or news item uses the term ごにん, and this kanji is one character in that word."],
  ["穀", "grain", "regular", "コク", "—", "穀物", "こくもつ", "grain", "雑穀", "穀:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read こくもつ, and this kanji is the missing character in it."],
  ["誌", "journal", "regular", "シ", "—", "雑誌", "ざっし", "magazine", "日誌", "言:speech;志:intention", "A familiar term read ざっし appears in class and everyday life, and this kanji is one part of it."],
  ["磁", "magnet", "regular", "ジ", "—", "磁石", "じせき", "magnet", "磁気", "石:stone;兹:component", "The clue points to a common word read じせき, and this character supplies one piece of it."],
  ["障", "hinder", "regular", "ショウ", "さわ.る", "障礙", "しょうがい", "obstacle", "障碍者", "障:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term しょうがい, and this kanji is one character in that word."],
  ["銭", "coin", "regular", "セン, ゼン", "ぜに, すき", "銭湯", "せんとう", "public bath", "小銭", "金:metal;㦮:component", "Someone mentions a word read せんとう, and this kanji is the missing character in it."],
  ["層", "stratum", "core", "ソウ", "—", "層雲", "そううん", "stratus", "層群", "尸:body radical;曾:once", "A familiar term read そううん appears in class and everyday life, and this kanji is one part of it."],
  ["認", "acknowledge", "core", "ニン", "みと.める, したた.める", "認識", "にんしき", "recognition", "認証", "言:speech;忍:endure", "The clue points to a common word read にんしき, and this character supplies one piece of it."],
  ["暮", "evening", "regular", "ボ", "く.れる, く.らす", "暮れる", "くれる", "get dark", "暮れ", "暮:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term くれる, and this kanji is one character in that word."],
  ["模", "imitation", "core", "モ, ボ", "—", "模索", "もさく", "groping", "模範", "木:tree;莫:must not", "Someone mentions a word read もさく, and this kanji is the missing character in it."],
  ["遺", "bequeath", "core", "イ, ユイ", "のこ.す", "遺骨", "いこつ", "cremated remains", "遺蹟", "遺:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read いこつ appears in class and everyday life, and this kanji is one part of it."],
  ["劇", "drama", "core", "ゲキ", "—", "劇場", "げきじょう", "theatre", "演劇", "劇:whole character form;stroke:stroke anchor;shape:overall shape", "The lights dim, the curtain opens, and actors launch into a tense stage story."],
  ["権", "power", "core", "ケン, ゴン", "おもり, かり, はか.る", "権利", "けんり", "right", "権限", "木:tree;𮥶:component", "A civics lesson explains who gets to decide and control."],
  ["熟", "mellow", "core", "ジュク", "う.れる", "熟語", "じゅくご", "kanji compound", "熟練", "熟:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read じゅくご, and this kanji is the missing character in it."],
  ["諸", "various", "regular", "ショ", "もろ", "諸島", "しょとう", "archipelago", "諸国", "言:speech;者:someone", "A familiar term read しょとう appears in class and everyday life, and this kanji is one part of it."],
  ["蔵", "storehouse", "core", "ゾウ, ソウ", "くら, おさ.める, かく.れる", "蔵書", "ぞうしょ", "collection of books", "内蔵", "蔵:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read ぞうしょ, and this character supplies one piece of it."],
  ["誕", "nativity", "regular", "タン", "—", "誕生日", "たんじょうび", "birthday", "誕生", "言:speech;延:prolong", "A lesson or news item uses the term たんじょうび, and this kanji is one character in that word."],
  ["潮", "tide", "regular", "チョウ", "しお, うしお", "満潮", "まんちょう", "high tide", "潮風", "潮:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read まんちょう, and this kanji is the missing character in it."],
  ["敵", "enemy", "regular", "テキ", "かたき, あだ, かな.う", "敵意", "てきい", "hostility", "敵対", "敵:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read てきい appears in class and everyday life, and this kanji is one part of it."],
  ["論", "argument", "core", "ロン", "—", "論議", "ろんぎ", "discussion", "論評", "言:speech;侖:think", "The clue points to a common word read ろんぎ, and this character supplies one piece of it."],
  ["激", "violent", "core", "ゲキ", "はげ.しい", "激論", "げきろん", "heated argument", "激突", "激:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term げきろん, and this kanji is one character in that word."],
  ["憲", "constitution", "core", "ケン", "—", "憲法", "けんぽう", "constitution", "憲章", "心:heart;𫲸:component;罒:net radical variant", "Students study the highest set of national rules in civics class."],
  ["鋼", "steel", "regular", "コウ", "はがね", "鋼鈑", "こうばん", "steel sheet", "鋼板", "金:metal;岡:mount", "A familiar term read こうばん appears in class and everyday life, and this kanji is one part of it."],
  ["樹", "timber", "core", "ジュ", "き", "樹齢", "じゅれい", "age of a", "樹脂", "木:tree;尌:standing", "The clue points to a common word read じゅれい, and this character supplies one piece of it."],
  ["縦", "vertical", "regular", "ジュウ", "たて", "縦書き", "たてがき", "writing vertically", "縦横", "縦:whole character form;stroke:stroke anchor;shape:overall shape", "A student turns the notebook so the writing runs from top to bottom."],
  ["操", "maneuver", "core", "ソウ, サン", "みさお, あやつ.る", "操縦", "そうじゅう", "steering", "操業", "扌:hand radical;喿:chirping of birds", "Someone mentions a word read そうじゅう, and this kanji is the missing character in it."],
  ["糖", "sugar", "regular", "トウ", "—", "砂糖", "さとう", "sugar", "糖分", "米:rice;唐:t'ang", "A familiar term read さとう appears in class and everyday life, and this kanji is one part of it."],
  ["奮", "stirred up", "regular", "フン", "ふる.う", "奮闘", "ふんとう", "strenuous effort", "奮起", "田:field;奞:the stride made", "The clue points to a common word read ふんとう, and this character supplies one piece of it."],
  ["厳", "stern", "regular", "ゲン, ゴン", "おごそ.か, きび.しい, いか.めしい, いつくし", "厳重", "げんちょう", "strict", "厳粛", "厳:whole character form;stroke:stroke anchor;shape:overall shape", "A lesson or news item uses the term げんちょう, and this kanji is one character in that word."],
  ["縮", "shrink", "regular", "シュク", "ちぢ.む, ちぢ.まる, ちぢ.める, ちぢ.れる, ちぢ.らす", "縮小", "しゅくしょう", "reduction", "縮れる", "縮:whole character form;stroke:stroke anchor;shape:overall shape", "Someone mentions a word read しゅくしょう, and this kanji is the missing character in it."],
  ["優", "tenderness", "core", "ユウ, ウ", "やさ.しい, すぐ.れる, まさ.る", "優秀", "ゆうしゅう", "superior", "優勢", "亻:person radical;憂:melancholy", "A familiar term read ゆうしゅう appears in class and everyday life, and this kanji is one part of it."],
  ["覧", "view", "regular", "ラン", "み.る", "一覧", "いちらん", "look", "回覧", "覧:whole character form;stroke:stroke anchor;shape:overall shape", "The clue points to a common word read いちらん, and this character supplies one piece of it."],
  ["簡", "simplicity", "core", "カン, ケン", "えら.ぶ, ふだ", "簡素", "かんそ", "simple", "簡短", "竹:bamboo;間:interval", "A lesson or news item uses the term かんそ, and this kanji is one character in that word."],
  ["難", "difficult", "core", "ナン", "かた.い, -がた.い, むずか.しい, むづか.しい, むつか.しい, -にく.い", "難題", "なんだい", "difficult problem", "難関", "口:mouth;廿:twenty;夫:husband", "Someone mentions a word read なんだい, and this kanji is the missing character in it."],
  ["臨", "face", "core", "リン", "のぞ.む", "臨時", "りんじ", "temporary", "臨海", "臨:whole character form;stroke:stroke anchor;shape:overall shape", "A familiar term read りんじ appears in class and everyday life, and this kanji is one part of it."],
  ["警", "warn", "core", "ケイ", "いまし.める", "警告", "けいこく", "warning", "警察", "言:speech;敬:awe", "A loudspeaker and flashing lights tell everyone to stay alert and follow instructions."],
  ["臓", "organ", "regular", "ゾウ", "はらわた", "臓器", "ぞうき", "internal organs", "内臓", "月:flesh/body radical;蔵:storehouse", "A medical poster labels the body's important parts deep inside the torso."]
];

const G6_RECORDS = G6_SOURCE.map(([kanji,action,tier,on,kun,exampleWord,exampleReading,exampleMeaning,blank2Word,componentSpec,scenario])=>({
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

const COMPONENT_POOL = uniqueBy(G6_RECORDS.map(record=>record.components[0]&&`${record.components[0].s} (${record.components[0].d})`).filter(Boolean),item=>item);
const READING_POOL = uniqueBy(G6_RECORDS.map(record=>record.exampleReading).filter(Boolean),item=>item);
const MEANING_POOL = uniqueBy(G6_RECORDS.map(record=>record.exampleMeaning).filter(Boolean),item=>item);

function buildCommand(record,index){
  const componentLead=record.components[0]||{s:record.kanji,d:'whole character form'};
  const componentCorrect=`${componentLead.s} (${componentLead.d})`;
  return {
    id:record.id,
    action:record.action,
    tier:record.tier,
    dom:'g6',
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

const COMMANDS = G6_RECORDS.map(buildCommand);

const KANJI_G6 = {
  id:'joyo-kanji-g6',
  name:'Joyo Kanji - Grade 6',
  description:'Kanji defense for 191 Grade 6 (elementary year 6) Joyo kanji',
  icon:'臓',
  inputMode:'quiz',
  prefixLabel:null,
  title:'KANJI 六年',
  subtitle:'DEFENSE',
  startButton:'出陣',
  instructions:'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub:'Grade 6 - 191 kanji - Recognition → Recall → Compounds',
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

const VARIABLE_BANK = Object.fromEntries(G6_RECORDS.map(record=>[
  record.id,
  uniqueBy(
    [...record.components, {s:record.kanji,d:'whole character form'}],
    entry=>`${entry.s}|${entry.d}`
  ).slice(0,3)
]));

const RELATIONSHIP_BANK = {};

const EXPLANATION_GLOSSARY = G6_RECORDS.map(record=>({
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
  'g6':['Grade 6 (sixth-year elementary)'],
};

const CONFUSABLE_GROUPS = [
  '胃胸脳腸腹肺臓',
  '宇宅宗宙宝宣密',
  '担拡拝推揮探捨',
  '詞訳訪認誌誕論誠誤諸警',
  '純絹縦縮',
  '針鋼銭鏡',
  '閉閣',
  '筋簡',
  '痛病',
  '亡忘望盟',
  '呼吸',
  '縦横',
  '盛誠成',
  '認識',
  '障章',
  '善聖誠忠孝仁尊',
  '皇陛后将権憲',
  '値植',
  '俳俵',
  '暖暮',
  '預貯蓄',
  '宝実',
  '蒸蔵',
  '泉砂潮穀',
  '奏俳劇映',
  '胃胸腹脳肺臓骨筋',
  '装裏絹革',
  '庁閣署党',
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
    .map(id => COMMAND_BY_ID[id])
    .filter(Boolean)
    .map(entry => entry.latex)
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

const APPLICATION_BANK = Object.fromEntries(G6_RECORDS.map(record=>[
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
  ,"radical-flesh-g6": {
    "id": "radical-flesh-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 月/⺝ when it marks body parts?",
    "correct": "Flesh/body radical",
    "wrong": ["Moon/day radical", "Water radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-roof-g6": {
    "id": "radical-roof-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 宀?",
    "correct": "Roof/shelter radical",
    "wrong": ["Gate radical", "Thread radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-gate-g6": {
    "id": "radical-gate-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 門?",
    "correct": "Gate/door radical",
    "wrong": ["Roof radical", "Mouth radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-bamboo-g6": {
    "id": "radical-bamboo-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 竹/⺮?",
    "correct": "Bamboo radical",
    "wrong": ["Tree radical", "Grass radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-bone": {
    "id": "radical-bone",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 骨?",
    "correct": "Bone/skeleton radical",
    "wrong": ["Flesh radical", "Shell radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-leather": {
    "id": "radical-leather",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 革?",
    "correct": "Leather/hide radical",
    "wrong": ["Thread radical", "Cloth radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-illness-g6": {
    "id": "radical-illness-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 疒?",
    "correct": "Illness/sickness radical",
    "wrong": ["Heart radical", "Food radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-inch": {
    "id": "radical-inch",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 寸?",
    "correct": "Inch/measure radical",
    "wrong": ["Hand radical", "Power radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-hole": {
    "id": "radical-hole",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 穴?",
    "correct": "Hole/cave radical",
    "wrong": ["Roof radical", "Field radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-hand-g6": {
    "id": "radical-hand-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 扌?",
    "correct": "Hand/action radical",
    "wrong": ["Foot radical", "Power radical"],
    "prereqs": ["stroke-basics"]
  },
  "radical-speech-g6": {
    "id": "radical-speech-g6",
    "type": "conceptual",
    "level": 2,
    "q": "Which radical is 言/訁?",
    "correct": "Speech/language radical",
    "wrong": ["Thread radical", "Roof radical"],
    "prereqs": ["stroke-basics"]
  },
  "body-organ-concepts": {
    "id": "body-organ-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Which cluster groups stomach, lungs, brain, intestines, and similar anatomy terms?",
    "correct": "Body organs and anatomy",
    "wrong": ["Government institutions", "Performance arts"],
    "prereqs": ["radical-flesh-g6"]
  },
  "ethics-concepts": {
    "id": "ethics-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Which cluster covers loyalty, sincerity, virtue, and respect?",
    "correct": "Ethics and moral virtues",
    "wrong": ["Natural scenery", "Buildings and institutions"],
    "prereqs": ["radical-speech-g6"]
  },
  "authority-concepts": {
    "id": "authority-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Which cluster covers rulers, titles, power, and national rules?",
    "correct": "Authority and governance",
    "wrong": ["Medicine and health", "Fabric and clothing"],
    "prereqs": ["government-concepts"]
  },
  "performance-concepts": {
    "id": "performance-concepts",
    "type": "conceptual",
    "level": 3,
    "q": "Which cluster covers music, acting, drama, and screen arts?",
    "correct": "Performance and creative arts",
    "wrong": ["Body organ vocabulary", "Government vocabulary"],
    "prereqs": ["communication-concepts"]
  }
};

function wireL1toL2(PREREQ_DAG) {
  const rules = [
    [/radical.*月|⺝|flesh|meat|organ|body/i, ['radical-flesh-g6']],
    [/radical.*宀|roof|house|shelter|home/i, ['radical-roof-g6']],
    [/radical.*門|gate|door/i, ['radical-gate-g6']],
    [/radical.*竹|⺮|bamboo/i, ['radical-bamboo-g6']],
    [/radical.*骨|bone|skeleton/i, ['radical-bone']],
    [/radical.*革|leather|hide/i, ['radical-leather']],
    [/radical.*疒|illness|sick|disease|pain/i, ['radical-illness-g6']],
    [/radical.*寸|inch|measure|hand/i, ['radical-inch']],
    [/radical.*穴|hole|cave|hollow/i, ['radical-hole']],
    [/radical.*扌|hand.*radical|grip|push|pull/i, ['radical-hand-g6']],
    [/radical.*言|訁|speech|say|word|language/i, ['radical-speech-g6']],
    [/organ|stomach|lung|brain|intestine|chest|abdomen/i, ['body-organ-concepts']],
    [/virtue|moral|loyal|filial|benevolent|sacred|sincere|respect/i, ['ethics-concepts']],
    [/emperor|empress|throne|royal|authority|constitution|power/i, ['authority-concepts']],
    [/perform|play.*music|drama|theater|film|act/i, ['performance-concepts']],
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

KANJI_G6.variableBank = VARIABLE_BANK;
KANJI_G6.applicationBank = APPLICATION_BANK;
KANJI_G6.relationshipBank = RELATIONSHIP_BANK;
KANJI_G6.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G6.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G6.domLabels = DOM_LABELS;
KANJI_G6.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G6.normalizeExplanationLookup = normalizeLookup;
KANJI_G6.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G6.wireL1toL2 = wireL1toL2;

window.KANJI_G6_DATA = KANJI_G6;
})();
