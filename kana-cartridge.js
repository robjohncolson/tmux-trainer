(function(){

function shuffleArr(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function uniqueBy(items,keyFn){const seen=new Set();return items.filter(item=>{const key=keyFn(item);if(seen.has(key))return false;seen.add(key);return true})}
function makeId(kana){return 'kana-'+[...String(kana||'')].map(ch=>ch.charCodeAt(0).toString(16)).join('-')}
function toKatakana(s){return String(s||'').replace(/[\u3041-\u3096]/g,ch=>String.fromCharCode(ch.charCodeAt(0)+0x60))}
function toHiragana(s){return String(s||'').replace(/[\u30A1-\u30F6]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0x60))}
function normalizeLookup(s){return toHiragana(String(s||'').toLowerCase()).trim().replace(/\s+/g,'').replace(/[-'".,!?()]/g,'')}
function pickDistinct(pool,correct,index,step){
  const items=pool.filter(item=>item&&item!==correct);
  if(items.length===0)return ['unknown','unknown'];
  const unique=[...new Set(items)];
  if(unique.length===1)return [unique[0],unique[0]];
  const picks=[];
  let cursor=index+1;
  const stride=step||11;
  while(picks.length<2){
    const candidate=unique[cursor%unique.length];
    if(candidate&&candidate!==correct&&!picks.includes(candidate))picks.push(candidate);
    cursor+=stride;
  }
  return picks;
}
function parseTable(text){
  return String(text||'').trim().split('\n').map(line=>line.trim()).filter(Boolean).map(line=>line.split('|').map(part=>part.trim()));
}
function parseExampleMap(text){
  const map={};
  parseTable(text).forEach(parts=>{
    const [key,w1,r1,m1,w2,r2,m2]=parts;
    map[key]=[
      {word:w1,reading:r1,meaning:m1},
      {word:w2,reading:r2,meaning:m2},
    ];
  });
  return map;
}
function detectScript(kana){return /[\u30A1-\u30FA]/.test(kana)?'katakana':'hiragana'}
function buildKanaBlank(word,kana){
  const blank='□';
  const idx=String(word||'').indexOf(kana);
  if(idx===-1)return blank+word;
  return word.slice(0,idx)+blank+word.slice(idx+kana.length);
}
function hasLongVowelMark(s){return String(s||'').includes('ー')}

const ROWS=['a-row','k-row','s-row','t-row','n-row','h-row','m-row','y-row','r-row','w-row'];
const ROW_DESCRIPTIONS={
  'a-row':'あ い う え お vowel group',
  'k-row':'か き く け こ consonant group',
  's-row':'さ し す せ そ consonant group',
  't-row':'た ち つ て と consonant group',
  'n-row':'な に ぬ ね の and ん nasal group',
  'h-row':'は ひ ふ へ ほ breathy group',
  'm-row':'ま み む め も humming group',
  'y-row':'や ゆ よ glide group',
  'r-row':'ら り る れ ろ liquid group',
  'w-row':'わ を gliding group'
};

const BASE_SYLLABLES=parseTable(String.raw`
あ|ア|a|a-row|core|あさ|asa|morning|あめ|ame|rain
い|イ|i|a-row|core|いぬ|inu|dog|いえ|ie|house
う|ウ|u|a-row|core|うみ|umi|sea|うた|uta|song
え|エ|e|a-row|core|えき|eki|station|えんぴつ|enpitsu|pencil
お|オ|o|a-row|core|おと|oto|sound|おに|oni|ogre
か|カ|ka|k-row|core|かさ|kasa|umbrella|かに|kani|crab
き|キ|ki|k-row|core|きく|kiku|listen|きた|kita|north
く|ク|ku|k-row|core|くち|kuchi|mouth|くま|kuma|bear
け|ケ|ke|k-row|core|けさ|kesa|this morning|けむり|kemuri|smoke
こ|コ|ko|k-row|core|こえ|koe|voice|こねこ|koneko|kitten
さ|サ|sa|s-row|core|さかな|sakana|fish|さくら|sakura|cherry blossom
し|シ|shi|s-row|core|しお|shio|salt|しま|shima|island
す|ス|su|s-row|core|すし|sushi|sushi|すな|suna|sand
せ|セ|se|s-row|core|せかい|sekai|world|せみ|semi|cicada
そ|ソ|so|s-row|core|そら|sora|sky|そば|soba|buckwheat noodles
た|タ|ta|t-row|core|たこ|tako|octopus|たまご|tamago|egg
ち|チ|chi|t-row|core|ちず|chizu|map|ちから|chikara|strength
つ|ツ|tsu|t-row|core|つき|tsuki|moon|つくえ|tsukue|desk
て|テ|te|t-row|core|て|te|hand|てがみ|tegami|letter
と|ト|to|t-row|core|とり|tori|bird|とけい|tokei|clock
な|ナ|na|n-row|core|なつ|natsu|summer|なまえ|namae|name
に|ニ|ni|n-row|core|にく|niku|meat|にわ|niwa|garden
ぬ|ヌ|nu|n-row|core|ぬま|numa|swamp|たぬき|tanuki|raccoon dog
ね|ネ|ne|n-row|core|ねこ|neko|cat|ねつ|netsu|fever
の|ノ|no|n-row|core|のり|nori|seaweed|のど|nodo|throat
は|ハ|ha|h-row|core|はな|hana|flower|はこ|hako|box
ひ|ヒ|hi|h-row|core|ひと|hito|person|ひこうき|hikoki|airplane
ふ|フ|fu|h-row|core|ふね|fune|boat|ふゆ|fuyu|winter
へ|ヘ|he|h-row|core|へや|heya|room|へび|hebi|snake
ほ|ホ|ho|h-row|core|ほし|hoshi|star|ほね|hone|bone
ま|マ|ma|m-row|core|まど|mado|window|まくら|makura|pillow
み|ミ|mi|m-row|core|みみ|mimi|ear|みず|mizu|water
む|ム|mu|m-row|core|むし|mushi|insect|むら|mura|village
め|メ|me|m-row|core|め|me|eye|めがね|megane|glasses
も|モ|mo|m-row|core|もり|mori|forest|もも|momo|peach
や|ヤ|ya|y-row|core|やま|yama|mountain|やさい|yasai|vegetables
ゆ|ユ|yu|y-row|core|ゆき|yuki|snow|ゆび|yubi|finger
よ|ヨ|yo|y-row|core|よる|yoru|night|よてい|yotei|schedule
ら|ラ|ra|r-row|core|らいおん|raion|lion|らくだ|rakuda|camel
り|リ|ri|r-row|core|りんご|ringo|apple|りす|risu|squirrel
る|ル|ru|r-row|core|るす|rusu|absence|はる|haru|spring
れ|レ|re|r-row|core|れいぞうこ|reizoko|refrigerator|れんしゅう|renshu|practice
ろ|ロ|ro|r-row|core|ろうそく|rosoku|candle|ろば|roba|donkey
わ|ワ|wa|w-row|core|わに|wani|crocodile|わた|wata|cotton
を|ヲ|wo|w-row|core|ほんをよむ|hon wo yomu|read a book|みずをのむ|mizu wo nomu|drink water
ん|ン|n|n-row|core|りんご|ringo|apple|ぱん|pan|bread
が|ガ|ga|k-row|regular|がくせい|gakusei|student|がぞう|gazo|image
ぎ|ギ|gi|k-row|regular|ぎんこう|ginko|bank|おにぎり|onigiri|rice ball
ぐ|グ|gu|k-row|regular|ぐんて|gunte|work gloves|てぬぐい|tenugui|hand towel
げ|ゲ|ge|k-row|regular|げんき|genki|healthy|ひげ|hige|beard
ご|ゴ|go|k-row|regular|ごはん|gohan|meal|ごみ|gomi|trash
ざ|ザ|za|s-row|regular|ざっし|zasshi|magazine|ざぶとん|zabuton|cushion
じ|ジ|ji|s-row|regular|じてんしゃ|jitensha|bicycle|じかん|jikan|time
ず|ズ|zu|s-row|regular|ずこう|zuko|art class|みず|mizu|water
ぜ|ゼ|ze|s-row|regular|ぜんぶ|zenbu|all|ぜりー|zeri|jelly
ぞ|ゾ|zo|s-row|regular|ぞう|zo|elephant|かぞく|kazoku|family
だ|ダ|da|t-row|regular|だいどころ|daidokoro|kitchen|だるま|daruma|daruma doll
ぢ|ヂ|ji|t-row|regular|ちぢむ|chidimu|shrink|はなぢ|hanaji|nosebleed
づ|ヅ|zu|t-row|regular|つづく|tsuzuku|continue|みかづき|mikazuki|crescent moon
で|デ|de|t-row|regular|でぐち|deguchi|exit|でんわ|denwa|telephone
ど|ド|do|t-row|regular|どあ|doa|door|どようび|doyobi|Saturday
ば|バ|ba|h-row|regular|ばす|basu|bus|ばら|bara|rose
び|ビ|bi|h-row|regular|びょういん|byoin|hospital|びん|bin|bottle
ぶ|ブ|bu|h-row|regular|ぶた|buta|pig|ぶどう|budo|grapes
べ|ベ|be|h-row|regular|べんとう|bento|lunchbox|べる|beru|bell
ぼ|ボ|bo|h-row|regular|ぼうし|boshi|hat|とんぼ|tonbo|dragonfly
ぱ|パ|pa|h-row|regular|ぱん|pan|bread|ぱじゃま|pajama|pajamas
ぴ|ピ|pi|h-row|regular|ぴあの|piano|piano|えんぴつ|enpitsu|pencil
ぷ|プ|pu|h-row|regular|ぷりん|purin|pudding|てんぷら|tenpura|tempura
ぺ|ペ|pe|h-row|regular|ぺん|pen|pen|ほっぺ|hoppe|cheek
ぽ|ポ|po|h-row|regular|ぽけっと|poketto|pocket|しっぽ|shippo|tail
`);

const BASE_YOON=parseTable(String.raw`
きゃ|キャ|kya|k-row|きゃく|kyaku|guest|きゃべつ|kyabetsu|cabbage
きゅ|キュ|kyu|k-row|きゅうり|kyuri|cucumber|きゅう|kyu|nine
きょ|キョ|kyo|k-row|きょう|kyo|today|きょうしつ|kyoshitsu|classroom
ぎゃ|ギャ|gya|k-row|ぎゃくてん|gyakuten|comeback|ぎゃらりー|gyarari|gallery
ぎゅ|ギュ|gyu|k-row|ぎゅうにゅう|gyunyu|milk|ぎゅうどん|gyudon|beef bowl
ぎょ|ギョ|gyo|k-row|ぎょうざ|gyoza|dumpling|ぎょうれつ|gyoretsu|line
しゃ|シャ|sha|s-row|しゃしん|shashin|photo|しゃかい|shakai|society
しゅ|シュ|shu|s-row|しゅくだい|shukudai|homework|しゅみ|shumi|hobby
しょ|ショ|sho|s-row|しょうゆ|shoyu|soy sauce|しょうが|shoga|ginger
じゃ|ジャ|ja|s-row|じゃがいも|jagaimo|potato|じゃんけん|janken|rock paper scissors
じゅ|ジュ|ju|s-row|じゅう|ju|ten|じゅぎょう|jugyo|class
じょ|ジョ|jo|s-row|じょうず|jozu|skillful|じょうほう|joho|information
ちゃ|チャ|cha|t-row|おちゃ|ocha|tea|ちゃわん|chawan|tea bowl
ちゅ|チュ|chu|t-row|ちゅうごく|chugoku|China|ちゅうしゃ|chusha|parking
ちょ|チョ|cho|t-row|ちょっと|chotto|a little|ちょうちょ|chocho|butterfly
にゃ|ニャ|nya|n-row|にゃんこ|nyanko|kitty|こんにゃく|konnyaku|konjac
にゅ|ニュ|nyu|n-row|にゅうがく|nyugaku|school entry|にゅういん|nyuin|hospitalization
にょ|ニョ|nyo|n-row|にょきにょき|nyokinyoki|sprouting|にょろにょろ|nyoronyoro|slithering
ひゃ|ヒャ|hya|h-row|ひゃく|hyaku|hundred|ひゃっかてん|hyakkaten|department store
ひゅ|ヒュ|hyu|h-row|ひゅうひゅう|hyuhyu|whizzing|ひゅーず|hyuzu|fuse
ひょ|ヒョ|hyo|h-row|ひょう|hyo|chart|ひょうし|hyoshi|rhythm
びゃ|ビャ|bya|h-row|さんびゃく|sanbyaku|three hundred|びゃくや|byakuya|white night
びゅ|ビュ|byu|h-row|でびゅう|debyu|debut|びゅうびゅう|byubyu|howling wind
びょ|ビョ|byo|h-row|びょうき|byoki|illness|びょういん|byoin|hospital
ぴゃ|ピャ|pya|h-row|はっぴゃく|happyaku|eight hundred|ろっぴゃく|roppyaku|six hundred
ぴゅ|ピュ|pyu|h-row|ぴゅあ|pyua|pure|こんぴゅーたー|konpyuta|computer
ぴょ|ピョ|pyo|h-row|ぴょんぴょん|pyonpyon|hopping|ぴょこぴょこ|pyokopyoko|popping up
みゃ|ミャ|mya|m-row|みゃく|myaku|pulse|みゃーみゃー|myamya|meowing
みゅ|ミュ|myu|m-row|みゅーじっく|myujikku|music|みゅーじあむ|myujiamu|museum
みょ|ミョ|myo|m-row|みょうじ|myoji|surname|みょうが|myoga|myoga ginger
りゃ|リャ|rya|r-row|りゃくご|ryakugo|abbreviation|りゃくず|ryakuzu|sketch map
りゅ|リュ|ryu|r-row|りゅう|ryu|dragon|りゅうがく|ryugaku|study abroad
りょ|リョ|ryo|r-row|りょうり|ryori|cooking|りょこう|ryoko|travel
`);

const KATAKANA_EXAMPLE_MAP=parseExampleMap(String.raw`
a|アイス|aisu|ice cream|アプリ|apuri|app
i|イヤホン|iyahon|earphones|イラスト|irasuto|illustration
u|ウイルス|uirusu|virus|ウクレレ|ukurere|ukulele
e|エアコン|eakon|air conditioner|エレベーター|erebeta|elevator
o|オムレツ|omuretsu|omelet|オレンジ|orenji|orange
ka|カメラ|kamera|camera|カード|kado|card
ki|キー|ki|key|キムチ|kimuchi|kimchi
ku|クラス|kurasu|class|クッキー|kukki|cookie
ke|ケーキ|keki|cake|ケチャップ|kechappu|ketchup
ko|コーヒー|kohi|coffee|コート|koto|coat
sa|サラダ|sarada|salad|サンダル|sandaru|sandals
shi|シーツ|shitsu|bedsheet|シール|shiru|sticker
su|スープ|supu|soup|スカート|sukato|skirt
se|セーター|seta|sweater|セロリ|serori|celery
so|ソファ|sofa|sofa|ソース|sosu|sauce
ta|タクシー|takushi|taxi|タオル|taoru|towel
chi|チーズ|chizu|cheese|チケット|chiketto|ticket
tsu|ツアー|tsua|tour|ツナ|tsuna|tuna
te|テレビ|terebi|television|テスト|tesuto|test
to|トマト|tomato|tomato|トラック|torakku|truck
na|ナイフ|naifu|knife|ナポリタン|naporitan|Napolitan pasta
ni|ニット|nitto|knitwear|ニンジャ|ninja|ninja
ne|ネクタイ|nekutai|necktie|ネット|netto|internet
no|ノート|noto|notebook|ノック|nokku|knock
ha|ハム|hamu|ham|ハンバーガー|hanbaga|hamburger
hi|ヒント|hinto|hint|ヒーロー|hiro|hero
fu|フォーク|foku|fork|フライ|furai|fried item
he|ヘリコプター|herikoputa|helicopter|ヘアゴム|heagomu|hair tie
ho|ホテル|hoteru|hotel|ホットケーキ|hottokeki|pancake
ma|マスク|masuku|mask|マフラー|mafura|scarf
mi|ミルク|miruku|milk|ミント|minto|mint
mu|ムース|musu|mousse|ムード|mudo|mood
me|メモ|memo|memo|メロン|meron|melon
mo|モーター|mota|motor|モデル|moderu|model
ya|ヤクルト|yakuruto|Yakult drink|ヤード|yado|yard
yu|ユニフォーム|yunifomu|uniform|ユーモア|yumoa|humor
yo|ヨーグルト|yoguruto|yogurt|ヨット|yotto|yacht
ra|ラジオ|rajio|radio|ランプ|ranpu|lamp
ri|リボン|ribon|ribbon|リモコン|rimokon|remote control
ru|ルール|ruru|rule|ルビー|rubi|ruby
re|レストラン|resutoran|restaurant|レモン|remon|lemon
ro|ロボット|robotto|robot|ロケット|roketto|rocket
wa|ワイン|wain|wine|ワッフル|waffuru|waffle
ga|ガラス|garasu|glass|ガム|gamu|gum
gi|ギター|gita|guitar|ギフト|gifuto|gift
gu|グラス|gurasu|glass cup|グミ|gumi|gummy candy
ge|ゲーム|gemu|game|ゲート|geto|gate
go|ゴール|goru|goal|ゴム|gomu|rubber band
za|ザーサイ|zasai|pickled mustard stem|ピザ|piza|pizza
ji|ジム|jimu|gym|ジーンズ|jinzu|jeans
zu|ズボン|zubon|trousers|スムーズ|sumuzu|smooth
ze|ゼリー|zeri|jelly|ゼミ|zemi|seminar
zo|ゾーン|zon|zone|アマゾン|amazon|Amazon
da|ダンス|dansu|dance|ダイヤ|daiya|diamond
de|デザート|dezato|dessert|デート|deto|date outing
do|ドア|doa|door|ドレス|doresu|dress
ba|バス|basu|bus|バター|bata|butter
bi|ビール|biru|beer|ビデオ|bideo|video
bu|ブラシ|burashi|brush|ブーツ|butsu|boots
be|ベッド|beddo|bed|ベル|beru|bell
bo|ボール|boru|ball|ボタン|botan|button
pa|パン|pan|bread|パジャマ|pajama|pajamas
pi|ピアノ|piano|piano|ピザ|piza|pizza
pu|プリン|purin|pudding|プール|puru|pool
pe|ペン|pen|pen|ペット|petto|pet
po|ポスト|posuto|postbox|ポケット|poketto|pocket
`);

const KATAKANA_YOON_EXAMPLE_MAP=parseExampleMap(String.raw`
kya|キャベツ|kyabetsu|cabbage|キャンプ|kyanpu|camp
kyu|キューブ|kyubu|cube|キュウリ|kyuri|cucumber
gya|ギャグ|gyagu|gag|ギャラリー|gyarari|gallery
gyo|ギョーザ|gyoza|dumpling|ギョロギョロ|gyorogyoro|staring around
sha|シャツ|shatsu|shirt|シャンプー|shanpu|shampoo
shu|シュークリーム|shukurimu|cream puff|シュート|shuto|shoot
sho|ショップ|shoppu|shop|ショート|shoto|short
ja|ジャム|jamu|jam|ジャケット|jaketto|jacket
ju|ジュース|jusu|juice|ジュエル|jueru|jewel
jo|ジョーク|joku|joke|ジョギング|jogingu|jogging
cha|チャイ|chai|chai tea|チャンス|chansu|chance
chu|チューリップ|churippu|tulip|チューブ|chubu|tube
cho|チョコレート|chokoreto|chocolate|チョーク|choku|chalk
nya|ニャンコ|nyanko|kitty|コンニャク|konnyaku|konjac
nyu|ニュース|nyusu|news|ニューヨーク|nyuyoku|New York
hyu|ヒューマン|hyuman|human|ヒューズ|hyuzu|fuse
byu|ビュッフェ|byuffe|buffet|ビュー|byu|view
pyu|ピュア|pyua|pure|ピューレ|pyure|puree
myu|ミュージック|myujikku|music|ミュージアム|myujiamu|museum
ryu|リュック|ryukku|backpack|リュウ|ryu|dragon
`);

function buildMnemonic(kana,row,dom,romaji){
  if(dom==='yoon')return `blend the base sound into ${romaji} with a small kana`;
  if(['pa','pi','pu','pe','po'].includes(romaji))return 'handakuten turns the h-row into a sharp p sound';
  if(['ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','de','do','ba','bi','bu','be','bo'].includes(romaji))return 'dakuten voices the base row sound';
  return detectScript(kana)==='katakana'?'angular katakana strokes mark this sound':'flowing hiragana strokes carry this sound';
}
function getKatakanaExamples(romaji,hWord1,hRead1,hMean1,hWord2,hRead2,hMean2){
  return KATAKANA_EXAMPLE_MAP[romaji]||[
    {word:toKatakana(hWord1),reading:hRead1,meaning:hMean1},
    {word:toKatakana(hWord2),reading:hRead2,meaning:hMean2},
  ];
}
function getKatakanaYoonExamples(romaji,hWord1,hRead1,hMean1,hWord2,hRead2,hMean2){
  return KATAKANA_YOON_EXAMPLE_MAP[romaji]||[
    {word:toKatakana(hWord1),reading:hRead1,meaning:hMean1},
    {word:toKatakana(hWord2),reading:hRead2,meaning:hMean2},
  ];
}

const PAIRS=[...BASE_SYLLABLES.map(parts=>({h:parts[0],k:parts[1]})),...BASE_YOON.map(parts=>({h:parts[0],k:parts[1]}))];
const COUNTERPART_BY_KANA={};
PAIRS.forEach(pair=>{COUNTERPART_BY_KANA[pair.h]=pair.k;COUNTERPART_BY_KANA[pair.k]=pair.h});

const HIRAGANA_SOURCE=BASE_SYLLABLES.map(([h,_k,romaji,row,tier,w1,r1,m1,w2,r2,m2])=>[
  h,romaji,row,'hiragana',tier,w1,r1,m1,w2,r2,m2,buildMnemonic(h,row,'hiragana',romaji)
]);
const KATAKANA_SOURCE=BASE_SYLLABLES.map(([h,k,romaji,row,tier,w1,r1,m1,w2,r2,m2])=>{
  const examples=getKatakanaExamples(romaji,w1,r1,m1,w2,r2,m2);
  return [k,romaji,row,'katakana',tier,examples[0].word,examples[0].reading,examples[0].meaning,examples[1].word,examples[1].reading,examples[1].meaning,buildMnemonic(k,row,'katakana',romaji)];
});
const YOON_SOURCE=BASE_YOON.flatMap(([h,k,romaji,row,w1,r1,m1,w2,r2,m2])=>{
  const kExamples=getKatakanaYoonExamples(romaji,w1,r1,m1,w2,r2,m2);
  return [
    [h,romaji,row,'yoon','regular',w1,r1,m1,w2,r2,m2,buildMnemonic(h,row,'yoon',romaji)],
    [k,romaji,row,'yoon','regular',kExamples[0].word,kExamples[0].reading,kExamples[0].meaning,kExamples[1].word,kExamples[1].reading,kExamples[1].meaning,buildMnemonic(k,row,'yoon',romaji)]
  ];
});

const RECORDS=[...HIRAGANA_SOURCE,...KATAKANA_SOURCE,...YOON_SOURCE].map(([kana,romaji,row,dom,tier,word1,reading1,meaning1,word2,reading2,meaning2,mnemonic])=>({
  id:makeId(kana),
  kana,
  action:romaji,
  row,
  dom,
  tier,
  word1,
  reading1,
  meaning1,
  word2,
  reading2,
  meaning2,
  mnemonic,
  script:detectScript(kana),
  counterpart:COUNTERPART_BY_KANA[kana]||null,
}));

function inferFeature(record){
  if(record.dom==='yoon')return'yoon';
  if(['pa','pi','pu','pe','po'].includes(record.action))return'handakuten';
  if(['ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','de','do','ba','bi','bu','be','bo'].includes(record.action))return'dakuten';
  return'plain';
}
RECORDS.forEach(record=>{record.feature=inferFeature(record)});

const RECORD_BY_ID=Object.fromEntries(RECORDS.map(record=>[record.id,record]));
const KANA_TO_ID=Object.fromEntries(RECORDS.map(record=>[record.kana,record.id]));
const ROW_POOL=ROWS.slice();
const WORD_POOL=uniqueBy(RECORDS.flatMap(record=>[record.word1,record.word2]).filter(Boolean),item=>item);

const CONFUSABLE_GROUPS=[];
function addKanaGroup(chars){
  const ids=chars.map(kana=>KANA_TO_ID[kana]).filter(Boolean);
  if(ids.length>1)CONFUSABLE_GROUPS.push(ids);
}

[
  ['シ','ツ'],['ソ','ン'],['ア','マ'],['ク','タ','ケ'],['ヌ','ス'],['ウ','ワ','フ'],['コ','ユ'],['ナ','メ'],['チ','テ'],['セ','ヤ'],
  ['は','ほ'],['ぬ','め'],['き','さ'],['わ','ね','れ'],['る','ろ'],['い','り'],['あ','お'],['た','な'],['う','つ'],['こ','て']
].forEach(addKanaGroup);

[
  ['か','が'],['き','ぎ'],['く','ぐ'],['け','げ'],['こ','ご'],
  ['さ','ざ'],['し','じ'],['す','ず'],['せ','ぜ'],['そ','ぞ'],
  ['た','だ'],['ち','ぢ'],['つ','づ'],['て','で'],['と','ど'],
  ['は','ば','ぱ'],['ひ','び','ぴ'],['ふ','ぶ','ぷ'],['へ','べ','ぺ'],['ほ','ぼ','ぽ'],
  ['カ','ガ'],['キ','ギ'],['ク','グ'],['ケ','ゲ'],['コ','ゴ'],
  ['サ','ザ'],['シ','ジ'],['ス','ズ'],['セ','ゼ'],['ソ','ゾ'],
  ['タ','ダ'],['チ','ヂ'],['ツ','ヅ'],['テ','デ'],['ト','ド'],
  ['ハ','バ','パ'],['ヒ','ビ','ピ'],['フ','ブ','プ'],['ヘ','ベ','ペ'],['ホ','ボ','ポ']
].forEach(addKanaGroup);

RECORDS.forEach(record=>{if(record.counterpart)addKanaGroup([record.kana,record.counterpart])});

const yoonByBase={};
RECORDS.filter(record=>record.dom==='yoon').forEach(record=>{
  const base=[...record.kana][0];
  yoonByBase[base]=yoonByBase[base]||[];
  yoonByBase[base].push(record.kana);
});
Object.values(yoonByBase).forEach(addKanaGroup);

[
  ['きゃ','ぎゃ'],['きゅ','ぎゅ'],['きょ','ぎょ'],
  ['しゃ','じゃ'],['しゅ','じゅ'],['しょ','じょ'],
  ['ひゃ','びゃ','ぴゃ'],['ひゅ','びゅ','ぴゅ'],['ひょ','びょ','ぴょ'],
  ['キャ','ギャ'],['キュ','ギュ'],['キョ','ギョ'],
  ['シャ','ジャ'],['シュ','ジュ'],['ショ','ジョ'],
  ['ヒャ','ビャ','ピャ'],['ヒュ','ビュ','ピュ'],['ヒョ','ビョ','ピョ']
].forEach(addKanaGroup);

const ROW_IDS={};
RECORDS.forEach(record=>{
  ROW_IDS[record.row]=ROW_IDS[record.row]||[];
  ROW_IDS[record.row].push(record.id);
});

const CONFUSABLE_MAP=(()=>{
  const map=Object.fromEntries(RECORDS.map(record=>[record.id,[]]));
  for(const group of CONFUSABLE_GROUPS){
    for(const id of group){
      group.forEach(peer=>{if(peer!==id&&!map[id].includes(peer))map[id].push(peer)});
    }
  }
  RECORDS.forEach(record=>{
    const rowPeers=(ROW_IDS[record.row]||[]).filter(id=>id!==record.id);
    rowPeers.forEach(peer=>{if(!map[record.id].includes(peer))map[record.id].push(peer)});
    RECORDS.forEach(peer=>{
      if(peer.id!==record.id&&peer.dom===record.dom&&!map[record.id].includes(peer.id)&&map[record.id].length<8)map[record.id].push(peer.id);
    });
    RECORDS.forEach(peer=>{
      if(peer.id!==record.id&&!map[record.id].includes(peer.id)&&map[record.id].length<10)map[record.id].push(peer.id);
    });
  });
  return map;
})();

function pickKanaDistractors(record,count){
  const picked=[];
  const used=new Set([record.kana]);
  const pools=[
    (CONFUSABLE_MAP[record.id]||[]).map(id=>RECORD_BY_ID[id]).filter(candidate=>candidate&&candidate.script===record.script),
    (CONFUSABLE_MAP[record.id]||[]).map(id=>RECORD_BY_ID[id]),
    RECORDS.filter(item=>item.script===record.script&&item.dom===record.dom),
    (ROW_IDS[record.row]||[]).map(id=>RECORD_BY_ID[id]).filter(candidate=>candidate&&candidate.script===record.script),
    RECORDS.filter(item=>item.script===record.script),
    RECORDS.filter(item=>item.dom===record.dom),
    RECORDS
  ];
  for(const pool of pools){
    for(const candidate of pool){
      if(!candidate||used.has(candidate.kana))continue;
      picked.push(candidate.kana);
      used.add(candidate.kana);
      if(picked.length>=count)return picked;
    }
  }
  return picked;
}

function pickActionDistractors(record,count){
  const picked=[];
  const usedActions=new Set([normalizeLookup(record.action)]);
  const usedIds=new Set([record.id]);
  const pools=[
    (CONFUSABLE_MAP[record.id]||[]).map(id=>RECORD_BY_ID[id]),
    (ROW_IDS[record.row]||[]).map(id=>RECORD_BY_ID[id]),
    RECORDS.filter(item=>item.dom===record.dom),
    RECORDS
  ];
  for(const pool of pools){
    for(const candidate of pool){
      if(!candidate||usedIds.has(candidate.id))continue;
      const actionKey=normalizeLookup(candidate.action);
      if(usedActions.has(actionKey))continue;
      picked.push(candidate);
      usedIds.add(candidate.id);
      usedActions.add(actionKey);
      if(picked.length>=count)return picked;
    }
  }
  return picked;
}

function buildCounterpartWrongs(record,index){
  const targetScript=record.script==='hiragana'?'katakana':'hiragana';
  const sameFamilyPool=RECORDS
    .filter(candidate=>candidate.script===targetScript&&(record.dom==='yoon'?candidate.dom==='yoon':candidate.dom!=='yoon')&&candidate.kana!==record.counterpart)
    .map(candidate=>candidate.kana);
  const fallbackPool=RECORDS
    .filter(candidate=>candidate.script===targetScript&&candidate.kana!==record.counterpart)
    .map(candidate=>candidate.kana);
  const pool=sameFamilyPool.length>=2?sameFamilyPool:[...sameFamilyPool,...fallbackPool];
  return pickDistinct(pool,record.counterpart,index,7);
}

function buildWordWrongs(record,index){
  const pool=(CONFUSABLE_MAP[record.id]||[])
    .map(id=>RECORD_BY_ID[id])
    .filter(Boolean)
    .flatMap(candidate=>[candidate.word1,candidate.word2])
    .concat(WORD_POOL)
    .filter(Boolean);
  return pickDistinct(pool,record.word1,index,9);
}

function buildRowQuestion(record){
  if(record.feature==='yoon')return `Which base row does ${record.kana} belong to in this yoon combination?`;
  if(record.feature==='dakuten')return `Which base row does ${record.kana} belong to after dakuten?`;
  if(record.feature==='handakuten')return `Which base row does ${record.kana} belong to after handakuten?`;
  return `Which row does ${record.kana} belong to?`;
}

function buildFeatureVariable(record){
  if(record.feature==='dakuten')return{s:'゛',d:'dakuten mark that voices the base consonant'};
  if(record.feature==='handakuten')return{s:'゜',d:'handakuten mark that turns the h-row into a p sound'};
  if(record.feature==='yoon')return{s:[...record.kana][1],d:'small ya yu or yo kana that blends the sound into yoon'};
  if(record.script==='hiragana')return{s:record.counterpart,d:'katakana counterpart for the same sound'};
  return{s:record.counterpart,d:'hiragana counterpart for the same sound'};
}

function buildScenario(record){
  const blank=buildKanaBlank(record.word1,record.kana);
  if(record.dom==='yoon')return `A reading card shows ${blank} meaning "${record.meaning1}". Which kana blend completes the word?`;
  if(record.script==='katakana'||hasLongVowelMark(record.word1))return `A katakana practice card shows ${blank} meaning "${record.meaning1}". Which kana completes the word?`;
  return `A beginner vocabulary card shows ${blank} meaning "${record.meaning1}". Which kana completes the word?`;
}

const COMMANDS=RECORDS.map((record,index)=>({
  id:record.id,
  action:record.action,
  tier:record.tier,
  dom:record.dom,
  row:record.row,
  script:record.script,
  counterpart:record.counterpart,
  feature:record.feature,
  hint:`Row: ${record.row} | ${record.mnemonic}`,
  explain:`${record.mnemonic}. Used in ${record.word1} (${record.reading1}) = ${record.meaning1}.`,
  latex:record.kana,
  blanks:[
    {latex:buildKanaBlank(record.word1,record.kana),answer:record.kana,choices:[record.kana,record.kana,record.kana]},
    {latex:buildKanaBlank(record.word2,record.kana),answer:record.kana,choices:[record.kana,record.kana,record.kana]},
  ],
  subconcepts:[
    {
      q:buildRowQuestion(record),
      correct:record.row,
      wrong:pickDistinct(ROW_POOL,record.row,index,5)
    },
    {
      q:record.script==='hiragana'?`What is the katakana counterpart for ${record.kana}?`:`What is the hiragana counterpart for ${record.kana}?`,
      correct:record.counterpart,
      wrong:buildCounterpartWrongs(record,index)
    },
    {
      q:`Which word contains ${record.kana}?`,
      correct:record.word1,
      wrong:buildWordWrongs(record,index)
    }
  ]
}));

const COMMAND_BY_ID=Object.fromEntries(COMMANDS.map(cmd=>[cmd.id,cmd]));

function buildBlankChoices(cmd){
  const record=RECORD_BY_ID[cmd.id];
  if(!record)return [cmd.latex,cmd.latex,cmd.latex];
  const candidates=[
    ...(CONFUSABLE_MAP[record.id]||[]).map(id=>RECORD_BY_ID[id]).filter(candidate=>candidate&&candidate.script===record.script).map(candidate=>candidate.kana),
    ...RECORDS.filter(candidate=>candidate.script===record.script&&candidate.dom===record.dom&&candidate.kana!==record.kana).map(candidate=>candidate.kana),
    ...RECORDS.filter(candidate=>candidate.script===record.script&&candidate.kana!==record.kana).map(candidate=>candidate.kana),
    ...RECORDS.filter(candidate=>candidate.kana!==record.kana).map(candidate=>candidate.kana)
  ];
  const wrongs=[];
  const used=new Set([record.kana]);
  for(const kana of candidates){
    if(!kana||used.has(kana))continue;
    wrongs.push(kana);
    used.add(kana);
    if(wrongs.length>=2)break;
  }
  return [record.kana,wrongs[0]||'?',wrongs[1]||'??'];
}

COMMANDS.forEach(cmd=>{
  cmd.blanks.forEach(blank=>{blank.choices=buildBlankChoices(cmd)});
});

COMMANDS.forEach(cmd=>{
  cmd.subconcepts.forEach((sc,i)=>{
    if((sc.wrong||[]).includes('unknown'))console.warn(`[kana] ${cmd.id} SC${i} has "unknown" wrong answer`);
  });
  cmd.blanks.forEach((blank,i)=>{
    if(blank.choices[0]!==blank.answer)console.warn(`[kana] ${cmd.id} blank${i} choices[0] does not match answer`);
    if(new Set(blank.choices).size!==blank.choices.length)console.warn(`[kana] ${cmd.id} blank${i} has duplicate choices`);
  });
});

const VARIABLE_BANK=Object.fromEntries(RECORDS.map(record=>[
  record.id,
  [
    {s:record.row,d:ROW_DESCRIPTIONS[record.row]},
    buildFeatureVariable(record)
  ]
]));

function buildConfusionSet(record){
  const picks=[];
  const used=new Set([record.id]);
  const pools=[
    (CONFUSABLE_MAP[record.id]||[]),
    (ROW_IDS[record.row]||[]),
    RECORDS.filter(item=>item.dom===record.dom).map(item=>item.id),
    RECORDS.map(item=>item.id)
  ];
  for(const pool of pools){
    for(const id of pool){
      if(id===record.id||used.has(id))continue;
      picks.push(id);
      used.add(id);
      if(picks.length>=3)return picks;
    }
  }
  return picks;
}

const APPLICATION_BANK=Object.fromEntries(RECORDS.map(record=>[
  record.id,
  [{scenario:buildScenario(record),confusionSet:buildConfusionSet(record)}]
]));

const RELATIONSHIP_BANK={};

const EXPLANATION_GLOSSARY=RECORDS.map(record=>({
  keys:[record.kana],
  title:`${record.kana} (${record.action})`,
  lines:[
    `Sound: ${record.action}.`,
    `Row: ${record.row} | Pair: ${record.counterpart||'—'}`,
    `Example: ${record.word1} (${record.reading1}) = ${record.meaning1}`
  ]
}));

const AUTO_BLANK_SPECS=[];

const DOM_LABELS={
  'hiragana':['Hiragana (ひらがな)'],
  'katakana':['Katakana (カタカナ)'],
  'yoon':['Yoon Combinations (拗音)']
};

const SOUND_RECOGNITION_NODES={
  'sound-a':{id:'sound-a',type:'conceptual',level:2,q:'Which kana makes the "a" sound (as in "father")?',correct:'あ / ア',wrong:['い / イ','う / ウ'],prereqs:['vowel-sounds']},
  'sound-i':{id:'sound-i',type:'conceptual',level:2,q:'Which kana makes the "i" sound (as in "feet")?',correct:'い / イ',wrong:['え / エ','う / ウ'],prereqs:['vowel-sounds']},
  'sound-u':{id:'sound-u',type:'conceptual',level:2,q:'Which kana makes the "u" sound (as in "rule")?',correct:'う / ウ',wrong:['お / オ','え / エ'],prereqs:['vowel-sounds']},
  'sound-e':{id:'sound-e',type:'conceptual',level:2,q:'Which kana makes the "e" sound (as in "met")?',correct:'え / エ',wrong:['あ / ア','お / オ'],prereqs:['vowel-sounds']},
  'sound-o':{id:'sound-o',type:'conceptual',level:2,q:'Which kana makes the "o" sound (as in "told")?',correct:'お / オ',wrong:['う / ウ','え / エ'],prereqs:['vowel-sounds']},
  'sound-ka':{id:'sound-ka',type:'conceptual',level:2,q:'What sound does か / カ make?',correct:'ka',wrong:['sa','ta'],prereqs:['consonant-k']},
  'sound-sa':{id:'sound-sa',type:'conceptual',level:2,q:'What sound does さ / サ make?',correct:'sa',wrong:['ka','ha'],prereqs:['consonant-s']},
  'sound-ta':{id:'sound-ta',type:'conceptual',level:2,q:'What sound does た / タ make?',correct:'ta',wrong:['na','ra'],prereqs:['consonant-t']},
  'sound-na':{id:'sound-na',type:'conceptual',level:2,q:'What sound does な / ナ make?',correct:'na',wrong:['ma','wa'],prereqs:['consonant-n']},
  'sound-ha':{id:'sound-ha',type:'conceptual',level:2,q:'What sound does は / ハ make?',correct:'ha',wrong:['sa','ma'],prereqs:['consonant-h']},
  'sound-ma':{id:'sound-ma',type:'conceptual',level:2,q:'What sound does ま / マ make?',correct:'ma',wrong:['na','ra'],prereqs:['consonant-m']},
  'sound-ra':{id:'sound-ra',type:'conceptual',level:2,q:'What sound does ら / ラ make?',correct:'ra',wrong:['na','ya'],prereqs:['consonant-r']},
  'sound-ya':{id:'sound-ya',type:'conceptual',level:2,q:'What sound does や / ヤ make?',correct:'ya',wrong:['ra','wa'],prereqs:['consonant-y']},
};

const VOICING_RECOGNITION_NODES={
  'voice-k-to-g':{id:'voice-k-to-g',type:'conceptual',level:2,q:'What happens to the K-row when dakuten is added?',correct:'K sounds become G sounds (ka→ga, ki→gi, ku→gu, ke→ge, ko→go)',wrong:['K sounds become B sounds','K sounds become P sounds'],prereqs:['dakuten-rules','consonant-k']},
  'voice-s-to-z':{id:'voice-s-to-z',type:'conceptual',level:2,q:'What happens to the S-row when dakuten is added?',correct:'S sounds become Z/J sounds (sa→za, shi→ji, su→zu, se→ze, so→zo)',wrong:['S sounds become T sounds','S sounds become P sounds'],prereqs:['dakuten-rules','consonant-s']},
  'voice-t-to-d':{id:'voice-t-to-d',type:'conceptual',level:2,q:'What happens to the T-row when dakuten is added?',correct:'T sounds become D/J/Z sounds (ta→da, chi→ji, tsu→zu, te→de, to→do)',wrong:['T sounds become K sounds','T sounds become P sounds'],prereqs:['dakuten-rules','consonant-t']},
  'voice-h-to-b':{id:'voice-h-to-b',type:'conceptual',level:2,q:'What happens to the H-row when dakuten is added?',correct:'H sounds become B sounds (ha→ba, hi→bi, fu→bu, he→be, ho→bo)',wrong:['H sounds become G sounds','H sounds become Y sounds'],prereqs:['dakuten-rules','consonant-h']},
};

const VOCAB_WORD_NODES={
  'word-greetings':{id:'word-greetings',type:'conceptual',level:3,q:'Which kana starts the greeting おはよう?',correct:'お',wrong:['あ','え'],prereqs:['vowel-sounds']},
  'word-animals':{id:'word-animals',type:'conceptual',level:3,q:'Which kana starts the word ねこ (cat)?',correct:'ね',wrong:['の','な'],prereqs:['consonant-n']},
  'word-food':{id:'word-food',type:'conceptual',level:3,q:'Which kana starts the word すし (sushi)?',correct:'す',wrong:['し','せ'],prereqs:['consonant-s']},
  'word-nature':{id:'word-nature',type:'conceptual',level:3,q:'Which kana starts the word やま (mountain)?',correct:'や',wrong:['ゆ','よ'],prereqs:['consonant-y']},
  'word-body':{id:'word-body',type:'conceptual',level:3,q:'Which kana starts the word て (hand)?',correct:'て',wrong:['た','と'],prereqs:['consonant-t']},
  'word-colors':{id:'word-colors',type:'conceptual',level:3,q:'Which kana starts the word あか (red)?',correct:'あ',wrong:['え','お'],prereqs:['vowel-sounds']},
  'word-numbers':{id:'word-numbers',type:'conceptual',level:3,q:'Which kana starts いち (one)?',correct:'い',wrong:['う','え'],prereqs:['vowel-sounds']},
  'word-loanwords':{id:'word-loanwords',type:'conceptual',level:3,q:'Which katakana starts コーヒー (coffee)?',correct:'コ',wrong:['カ','ケ'],prereqs:['consonant-k','system-recognition']},
  'word-school':{id:'word-school',type:'conceptual',level:3,q:'Which kana starts せんせい (teacher)?',correct:'せ',wrong:['さ','し'],prereqs:['consonant-s']},
  'word-family':{id:'word-family',type:'conceptual',level:3,q:'Which kana starts はは (mother)?',correct:'は',wrong:['ひ','ほ'],prereqs:['consonant-h']},
};

const CONFUSABLE_DISCRIMINATION_NODES={
  'confuse-shi-tsu':{id:'confuse-shi-tsu',type:'conceptual',level:2,q:'How do you tell シ (shi) from ツ (tsu)?',correct:'シ has side strokes that rise from left to right; ツ has top strokes that fall into the body',wrong:['They are the same character','シ has 3 strokes and ツ has 2'],prereqs:['stroke-direction']},
  'confuse-so-n':{id:'confuse-so-n',type:'conceptual',level:2,q:'How do you tell ソ (so) from ン (n)?',correct:'ソ starts from the top-right; ン starts from the top-left',wrong:['They are identical','ン adds a dakuten mark'],prereqs:['stroke-direction']},
  'confuse-ha-ho':{id:'confuse-ha-ho',type:'conceptual',level:2,q:'How do you tell は (ha) from ほ (ho)?',correct:'は has two simple right-side strokes; ほ has a crossing middle stroke and a tail',wrong:['They sound the same','は has more strokes than ほ'],prereqs:['consonant-h']},
  'confuse-nu-me':{id:'confuse-nu-me',type:'conceptual',level:2,q:'How do you tell ぬ (nu) from め (me)?',correct:'ぬ has a looped finish; め closes without the extra loop',wrong:['め is the one with the loop','They are in the same row'],prereqs:['kana-basics']},
  'confuse-ru-ro':{id:'confuse-ru-ro',type:'conceptual',level:2,q:'How do you tell る (ru) from ろ (ro)?',correct:'る curls into a small hook at the bottom; ろ ends more cleanly',wrong:['ろ is the one with the hook','They are pronounced the same'],prereqs:['consonant-r']},
  'confuse-ki-sa':{id:'confuse-ki-sa',type:'conceptual',level:2,q:'How do you tell き (ki) from さ (sa)?',correct:'き has separated horizontal strokes; さ curves down in one flowing body',wrong:['さ has more horizontal bars','They only differ by dakuten'],prereqs:['stroke-direction']},
  'confuse-wa-ne-re':{id:'confuse-wa-ne-re',type:'conceptual',level:2,q:'How do you tell わ, ね, and れ apart?',correct:'わ loops low, ね has a full looped tail, and れ has a simpler hooked ending',wrong:['They are the same shape with different sizes','Only れ belongs to a kana row'],prereqs:['stroke-direction']},
  'confuse-a-ma':{id:'confuse-a-ma',type:'conceptual',level:2,q:'How do you tell ア from マ?',correct:'ア has a single angled body; マ stacks three short strokes before the curve',wrong:['They are identical in print','マ uses dakuten'],prereqs:['stroke-direction']},
  'confuse-ku-ta-ke':{id:'confuse-ku-ta-ke',type:'conceptual',level:2,q:'How do you tell ク, タ, and ケ apart?',correct:'ク is a single hooked form, タ adds a crossing slash, and ケ has separate vertical and diagonal strokes',wrong:['They differ only by font weight','ケ is just rotated ク'],prereqs:['stroke-direction']},
  'confuse-u-wa-fu':{id:'confuse-u-wa-fu',type:'conceptual',level:2,q:'How do you tell ウ, ワ, and フ apart?',correct:'ウ has a roof with a centered drop, ワ hooks down leftward, and フ opens with two short top strokes',wrong:['They are all the same except for size','フ is the voiced version of ウ'],prereqs:['stroke-direction']},
};

const SOUND_NODE_IDS=Object.keys(SOUND_RECOGNITION_NODES);
const VOICING_NODE_IDS=Object.keys(VOICING_RECOGNITION_NODES);
const VOCAB_NODE_IDS=Object.keys(VOCAB_WORD_NODES);
const CONFUSABLE_NODE_IDS=Object.keys(CONFUSABLE_DISCRIMINATION_NODES);
const ROW_TO_SOUND_IDS={
  'k-row':['sound-ka'],
  's-row':['sound-sa'],
  't-row':['sound-ta'],
  'n-row':['sound-na'],
  'h-row':['sound-ha'],
  'm-row':['sound-ma'],
  'r-row':['sound-ra'],
  'y-row':['sound-ya'],
};
const ROW_TO_VOICING_ID={
  'k-row':'voice-k-to-g',
  's-row':'voice-s-to-z',
  't-row':'voice-t-to-d',
  'h-row':'voice-h-to-b',
};
const VOWEL_SOUND_RULES=[
  [/あ|ア/,['sound-a']],
  [/い|イ/,['sound-i']],
  [/う|ウ/,['sound-u']],
  [/え|エ/,['sound-e']],
  [/お|オ/,['sound-o']],
];
const CONFUSABLE_ROUTING_RULES=[
  [/シ|ツ|shi.*tsu|tsu.*shi/i,['confuse-shi-tsu']],
  [/ソ|ン|so.*n\b/i,['confuse-so-n']],
  [/は|ほ|ha.*ho|ho.*ha/i,['confuse-ha-ho']],
  [/ぬ|め|nu.*me|me.*nu/i,['confuse-nu-me']],
  [/る|ろ|ru.*ro|ro.*ru/i,['confuse-ru-ro']],
  [/き|さ|ki.*sa|sa.*ki/i,['confuse-ki-sa']],
  [/わ|ね|れ|wa.*ne|ne.*re|wa.*re/i,['confuse-wa-ne-re']],
  [/ア|マ/,['confuse-a-ma']],
  [/ク|タ|ケ/,['confuse-ku-ta-ke']],
  [/ウ|ワ|フ/,['confuse-u-wa-fu']],
];

const SHARED_PREREQ_NODES={
  'vowel-sounds':{id:'vowel-sounds',type:'computational',level:2,q:'What are the five Japanese vowels?',correct:'a i u e o',wrong:['a e i o u','ka ki ku ke ko'],prereqs:['kana-basics']},
  'consonant-k':{id:'consonant-k',type:'computational',level:2,q:'What sounds belong to the k-row?',correct:'ka ki ku ke ko',wrong:['sa shi su se so','ta chi tsu te to'],prereqs:['kana-basics']},
  'consonant-s':{id:'consonant-s',type:'computational',level:2,q:'What sounds belong to the s-row?',correct:'sa shi su se so',wrong:['ka ki ku ke ko','ha hi fu he ho'],prereqs:['kana-basics']},
  'consonant-t':{id:'consonant-t',type:'computational',level:2,q:'What sounds belong to the t-row?',correct:'ta chi tsu te to',wrong:['na ni nu ne no','ra ri ru re ro'],prereqs:['kana-basics']},
  'consonant-n':{id:'consonant-n',type:'computational',level:2,q:'What sounds belong to the n-row?',correct:'na ni nu ne no',wrong:['ma mi mu me mo','wa wo n'],prereqs:['kana-basics']},
  'consonant-h':{id:'consonant-h',type:'computational',level:2,q:'What sounds belong to the h-row?',correct:'ha hi fu he ho',wrong:['ba bi bu be bo','pa pi pu pe po'],prereqs:['kana-basics']},
  'consonant-m':{id:'consonant-m',type:'computational',level:2,q:'What sounds belong to the m-row?',correct:'ma mi mu me mo',wrong:['na ni nu ne no','ra ri ru re ro'],prereqs:['kana-basics']},
  'consonant-r':{id:'consonant-r',type:'computational',level:2,q:'What sounds belong to the r-row?',correct:'ra ri ru re ro',wrong:['ya yu yo','wa wo n'],prereqs:['kana-basics']},
  'consonant-y':{id:'consonant-y',type:'computational',level:2,q:'What sounds belong to the y-row?',correct:'ya yu yo',wrong:['wa wo n','ra ri ru re ro'],prereqs:['kana-basics']},
  'consonant-w':{id:'consonant-w',type:'computational',level:2,q:'What sounds belong to the w-row?',correct:'wa wo',wrong:['ya yu yo','na ni nu ne no'],prereqs:['kana-basics']},
  'dakuten-rules':{id:'dakuten-rules',type:'conceptual',level:2,q:'What does dakuten do?',correct:'Dakuten voices the consonant like k to g or s to z',wrong:['It deletes the vowel','It makes every sound silent'],prereqs:['kana-basics']},
  'handakuten-rules':{id:'handakuten-rules',type:'conceptual',level:2,q:'What does handakuten do?',correct:'Handakuten turns h-row sounds into p-row sounds',wrong:['It changes vowels to y-sounds','It marks long vowels'],prereqs:['kana-basics']},
  'yoon-rules':{id:'yoon-rules',type:'conceptual',level:2,q:'How are yoon combinations built?',correct:'Base kana plus small ya yu or yo makes one blended sound',wrong:['Two full-size kana are always read separately','Yoon only appears in katakana'],prereqs:['kana-basics']},
  'hira-kata-pairs':{id:'hira-kata-pairs',type:'conceptual',level:2,q:'How do hiragana and katakana correspond?',correct:'Each sound has a hiragana form and a matching katakana form',wrong:['Only hiragana has sound pairs','Katakana has no matching sounds'],prereqs:['kana-basics']},
  ...SOUND_RECOGNITION_NODES,
  ...VOICING_RECOGNITION_NODES,
  'stroke-direction':{id:'stroke-direction',type:'conceptual',level:3,q:'What is the usual Japanese stroke order direction?',correct:'Top to bottom and left to right',wrong:['Bottom to top and right to left','Any order is equally standard'],prereqs:['stroke-basics']},
  'system-recognition':{id:'system-recognition',type:'conceptual',level:3,q:'When is katakana usually used?',correct:'For loanwords emphasis and many onomatopoeia',wrong:['For every native grammar ending','Only for handwritten notes'],prereqs:['kana-basics']},
  ...VOCAB_WORD_NODES,
  ...CONFUSABLE_DISCRIMINATION_NODES,
  'kana-basics':{id:'kana-basics',type:'conceptual',level:5,q:'What are the two main phonetic scripts in Japanese?',correct:'Hiragana and Katakana',wrong:['Kanji and Romaji','Latin and Cyrillic'],prereqs:[]},
  'stroke-basics':{id:'stroke-basics',type:'conceptual',level:5,q:'Why does stroke order matter?',correct:'It makes kana easier to read write and remember',wrong:['It changes the meaning of every word','It only matters for punctuation'],prereqs:[]}
};

function wireL1toL2(PREREQ_DAG){
  const rules=[
    [/a-row|vowel/i,['vowel-sounds']],
    [/k-row|ka.*row/i,['consonant-k']],
    [/s-row|sa.*row/i,['consonant-s']],
    [/t-row|ta.*row/i,['consonant-t']],
    [/n-row|na.*row/i,['consonant-n']],
    [/h-row|ha.*row/i,['consonant-h']],
    [/m-row|ma.*row/i,['consonant-m']],
    [/r-row|ra.*row/i,['consonant-r']],
    [/y-row|ya.*row/i,['consonant-y']],
    [/w-row|wa.*row|wo\b/i,['consonant-w']],
    [/dakuten|voiced|゛/i,['dakuten-rules']],
    [/handakuten|semi|゜/i,['handakuten-rules']],
    [/yoon|yōon|combination|small.*(?:ya|yu|yo|ゃ|ゅ|ょ)/i,['yoon-rules']],
    [/katakana.*for|hiragana.*for|counterpart/i,['hira-kata-pairs']],
    [/stroke|write|order/i,['stroke-direction']],
    [/hiragana.*used|katakana.*used|native|foreign|loanword|script/i,['system-recognition']],
    [/what sound|what.*romaji|pronounce|how.*read/i,SOUND_NODE_IDS],
    [/what happens to the.*when dakuten is added|voicing/i,VOICING_NODE_IDS],
    [/which word|word.*contains|starts with|word.*start|vocabulary|completes/i,VOCAB_NODE_IDS],
    [/シ.*ツ|ツ.*シ|shi.*tsu|tsu.*shi/i,['confuse-shi-tsu']],
    [/ソ.*ン|ン.*ソ|so.*n\b/i,['confuse-so-n']],
    [/は.*ほ|ほ.*は|ha.*ho|ho.*ha/i,['confuse-ha-ho']],
    [/ぬ.*め|め.*ぬ|nu.*me|me.*nu/i,['confuse-nu-me']],
    [/る.*ろ|ろ.*る|ru.*ro|ro.*ru/i,['confuse-ru-ro']],
    [/き.*さ|さ.*き|ki.*sa|sa.*ki/i,['confuse-ki-sa']],
    [/わ.*ね|ね.*れ|わ.*れ|wa.*ne|ne.*re|wa.*re/i,['confuse-wa-ne-re']],
    [/ア.*マ|マ.*ア/i,['confuse-a-ma']],
    [/ク.*タ|タ.*ケ|ク.*ケ/i,['confuse-ku-ta-ke']],
    [/ウ.*ワ|ワ.*フ|ウ.*フ/i,['confuse-u-wa-fu']],
    [/word|contains|vocabulary|completes/i,['kana-basics']]
  ];
  for(const node of Object.values(PREREQ_DAG)){
    if(node.level!==1||!node.autoGen||node.prereqs.length>0)continue;
    const matched=new Set();
    const text=`${node.q||''} ${node.correct||''}`;
    for(const [re,ids] of rules){
      if(re.test(text))ids.forEach(id=>{if(PREREQ_DAG[id])matched.add(id)});
    }
    if(ROW_TO_SOUND_IDS[node.correct]){
      ROW_TO_SOUND_IDS[node.correct].forEach(id=>{if(PREREQ_DAG[id])matched.add(id)});
    }
    if(/dakuten|voiced|゛/i.test(text)&&ROW_TO_VOICING_ID[node.correct]&&PREREQ_DAG[ROW_TO_VOICING_ID[node.correct]]){
      matched.add(ROW_TO_VOICING_ID[node.correct]);
    }
    for(const [re,ids] of VOWEL_SOUND_RULES){
      if(re.test(node.q||''))ids.forEach(id=>{if(PREREQ_DAG[id])matched.add(id)});
    }
    for(const [re,ids] of CONFUSABLE_ROUTING_RULES){
      if(re.test(node.q||''))ids.forEach(id=>{if(PREREQ_DAG[id])matched.add(id)});
    }
    if(matched.size===0&&PREREQ_DAG['kana-basics'])matched.add('kana-basics');
    node.prereqs=[...matched];
  }
}

const KANA={
  id:'kana',
  name:'Hiragana & Katakana',
  description:'Master all Japanese kana — hiragana, katakana, and combination characters',
  icon:'あ',
  inputMode:'quiz',
  prefixLabel:null,
  title:'KANA かな',
  subtitle:'DEFENSE',
  startButton:'はじめ',
  instructions:'Identify kana by <b>romaji</b>, <b>row</b>, and <b>script pair</b>. Fill blanks in beginner words and distinguish confusable kana.',
  instructionsSub:'208 kana cards — hiragana, katakana, and yoon combinations',
  identifyPrompt:'What is the romaji for this character?',
  variablePrompt:'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kana?',
  applicationPrompt:'Which kana makes this sound?',
  commands:COMMANDS,

  generateQuestion(cmd){
    const difficulty=(typeof G!=='undefined'&&G&&G.difficulty)||'learn';
    const baseWeights={
      learn:{identify:0.40,fillblank:0.25,variable:0.15,application:0.10},
      practice:{identify:0.25,fillblank:0.325,variable:0.15,application:0.175},
      challenge:{identify:0.10,fillblank:0.40,variable:0.15,application:0.25},
    };
    const selected=baseWeights[difficulty]||baseWeights.learn;
    const weights={identify:selected.identify};
    if(cmd.blanks&&cmd.blanks.length)weights.fillblank=selected.fillblank;
    if(this.variableBank&&this.variableBank[cmd.id]&&this.variableBank[cmd.id].length)weights.variable=selected.variable;
    if(this.applicationBank&&this.applicationBank[cmd.id]&&this.applicationBank[cmd.id].length)weights.application=selected.application;

    const total=Object.values(weights).reduce((sum,value)=>sum+value,0)||1;
    let roll=Math.random()*total;
    let pick='identify';
    for(const [type,weight] of Object.entries(weights)){
      roll-=weight;
      if(roll<=0){pick=type;break}
    }

    if(pick==='identify'){
      const distractors=pickActionDistractors(RECORD_BY_ID[cmd.id],3);
      const options=shuffleArr([cmd.action,...distractors.map(item=>item.action)]);
      const correctIdx=options.indexOf(cmd.action);
      return{type:'identify',latex:cmd.latex,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    if(pick==='variable'){
      const vars=this.variableBank[cmd.id];
      const entry=vars[Math.floor(Math.random()*vars.length)];
      const otherDescs=[];
      for(const [id,entries] of Object.entries(this.variableBank||{})){
        if(id===cmd.id)continue;
        for(const candidate of entries){
          if(candidate.d!==entry.d&&!otherDescs.includes(candidate.d))otherDescs.push(candidate.d);
        }
      }
      const options=shuffleArr([entry.d,...shuffleArr(otherDescs).slice(0,3)]);
      const correctIdx=options.indexOf(entry.d);
      return{type:'variable',latex:cmd.latex,symbol:entry.s,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    if(pick==='application'){
      const apps=this.applicationBank[cmd.id];
      const app=apps[Math.floor(Math.random()*apps.length)];
      const options=[];
      const used=new Set();
      function addOption(text){
        if(!text||used.has(text))return;
        used.add(text);
        options.push(text);
      }
      addOption(cmd.latex);
      for(const id of app.confusionSet||[])addOption(COMMAND_BY_ID[id]&&COMMAND_BY_ID[id].latex);
      for(const kana of pickKanaDistractors(RECORD_BY_ID[cmd.id],3))addOption(kana);
      const shuffled=shuffleArr(options.slice(0,4));
      const correctIdx=shuffled.indexOf(cmd.latex);
      return{type:'application',scenario:app.scenario,options:shuffled,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }

    const blank=cmd.blanks[Math.floor(Math.random()*cmd.blanks.length)];
    const shuffled=shuffleArr([...blank.choices]);
    const correctIdx=shuffled.indexOf(blank.answer);
    return{type:'fillblank',latex:blank.latex,answer:blank.answer,choices:shuffled,correctIdx,fullLatex:cmd.latex};
  },

  formatPrompt(cmd){return cmd.latex},
  formatAnswer(cmd){return cmd.action},

  validateBlank(input,answer){
    function norm(s){return normalizeLookup(String(s||'')).replace(/[\\{}_^]/g,'')}
    return norm(input)===norm(answer);
  },
};

KANA.variableBank=VARIABLE_BANK;
KANA.applicationBank=APPLICATION_BANK;
KANA.relationshipBank=RELATIONSHIP_BANK;
KANA.explanationGlossary=EXPLANATION_GLOSSARY;
KANA.autoBlankSpecs=AUTO_BLANK_SPECS;
KANA.domLabels=DOM_LABELS;
KANA.sharedPrereqNodes=SHARED_PREREQ_NODES;
KANA.normalizeExplanationLookup=normalizeLookup;
KANA.buildExplanationBank=function(){
  const byId={},byLabel={};
  EXPLANATION_GLOSSARY.forEach((entry,i)=>{
    byId[i]=entry;
    entry.keys.forEach(k=>{byLabel[normalizeLookup(k)]=entry});
  });
  return{byId,byLabel};
};
KANA.wireL1toL2=wireL1toL2;

if(typeof process!=='undefined'&&process&&Array.isArray(process.argv)&&/(^|[\\/])kana-cartridge\.js$/.test(process.argv[2]||'')){
  window.KANA_CARTRIDGE=KANA;
}
window.KANA_DATA=KANA;

})();
