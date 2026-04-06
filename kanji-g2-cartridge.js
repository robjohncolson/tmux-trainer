// Joyo Kanji Grade 2 — Formula Defense Cartridge
// 160 kanji · compound-completion blanks · reading-in-word subconcepts
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

const BATCH1 = [
  ["刀","sword","regular","トウ","かたな","短刀","たんとう","dagger","刀工","刀:sword radical;ノ:blade stroke","A museum placard points to the short blade in a samurai display."],
  ["丸","round; circle","regular","ガン","まる","丸太","まるた","log","日の丸","丸:round shape;丶:finishing dot","A carpenter rolls a timber beam across the yard before cutting it."],
  ["弓","bow","regular","キュウ","ゆみ","弓道","きゅうどう","archery","弓矢","弓:bow shape;丨:center grip","Students line up in the gym for target practice with traditional gear."],
  ["工","craft; construction","core","コウ","—","工事","こうじ","construction work","工場","工:work shape;一:level beam","Workers in helmets block off the street while repairs continue."],
  ["才","talent","regular","サイ","—","才能","さいのう","talent","天才","扌:hand-like stroke;ノ:sweeping stroke","The teacher praises the child who solves every puzzle with ease."],
  ["万","ten thousand","core","マン, バン","—","万円","まんえん","ten thousand yen","万年筆","一:top stroke;勹:curved lower frame","A price tag at the shop shows five digits before the yen mark."],
  ["引","pull","core","イン","ひく","引力","いんりょく","gravity","引き出し","弓:bow shape;丨:pulling line","A heavy drawer slides open only after a firm tug."],
  ["牛","cow","regular","ギュウ","うし","牛肉","ぎゅうにく","beef","牛乳","牛:cow shape;丨:center stroke","A dairy truck unloads cartons before school lunch begins."],
  ["元","origin","core","ゲン, ガン","もと","元気","げんき","energetic; well","元日","二:top legs;儿:human legs","After a good nap, the child runs outside full of energy again."],
  ["戸","door","regular","コ","と","戸口","ここう","doorway","雨戸","戸:door panel;一:top lintel","Rain rattles the shutters as the family closes the wooden entry."],
  ["午","noon","regular","ゴ","—","午前","ごぜん","morning","午後","午:noon sign;十:cross stroke","The schedule on the wall separates the hours before and after midday."],
  ["公","public","core","コウ","おおやけ","公園","こうえん","park","公立","八:open split;厶:private mark","Children gather at the city playground built for everyone to use."],
  ["今","now","core","コン","いま","今週","こんしゅう","this week","今夜","人:person under roof;一:roof line","The calendar page on the fridge highlights the days coming up next."],
  ["止","stop","core","シ","とまる, とめる","中止","ちゅうし","cancellation","止まる","止:stop sign;丨:standing line","The race is called off when thunder starts rumbling overhead."],
  ["少","few; little","core","ショウ","すこし, すくない","少年","しょうねん","boy","少女","小:small shape;ノ:extra slash","Only a small group stays after class for the club meeting."],
  ["心","heart","core","シン","こころ","安心","あんしん","relief","中心","心:heart shape;丶:dots of feeling","The child finally relaxes after hearing the lost pet was found."],
  ["切","cut; important","core","セツ","きる, きれる","大切","たいせつ","important","親切","刀:sword radical;七:cutting mark","A friend notices the dropped notebook and kindly returns it."],
  ["太","thick; big","regular","タイ","ふとい, ふとる","太陽","たいよう","sun","太る","大:big person;丶:extra dot","Morning light pours through the window as the bright disk rises."],
  ["内","inside","core","ナイ","うち","内科","ないか","internal medicine","室内","冂:enclosure;人:person inside","Shoes come off before everyone steps into the room."],
  ["父","father","regular","フ","ちち","父母","ふぼ","parents","父親","父:father shape;ノ:crossing stroke","The permission slip needs a signature from one of the adults at home."],
  ["分","part; minute","core","ブン, フン","わける, わかる","分数","ぶんすう","fraction","半分","刀:sword split;八:divided parts","The math worksheet asks students to shade one part of a whole."],
  ["方","direction; way","core","ホウ","かた","方向","ほうこう","direction","夕方","方:flag shape;丶:pointing mark","An arrow on the sign shows where to go next in the station."],
  ["毛","fur; hair","regular","モウ","け","毛糸","けいと","yarn","羽毛","毛:hair tuft;ノ:soft stroke","Grandma knits a scarf from a soft bundle beside the stool."],
  ["友","friend","core","ユウ","とも","友達","ともだち","friend","親友","又:hand;𠂇:left hand shape","Two classmates wait by the gate so they can walk home together."],
  ["外","outside","core","ガイ","そと, はずれる","外国","がいこく","foreign country","外出","夕:evening;卜:outside mark","The passport line at the airport is marked for travelers from abroad."],
  ["兄","older brother","regular","ケイ, キョウ","あに","兄弟","きょうだい","siblings","お兄さん","口:mouth;儿:legs","The big boy helps tie the little boy's shoes before school."],
  ["古","old","regular","コ","ふるい","古代","こだい","ancient times","古本","十:cross top;口:mouth","The museum room displays tools from long ago behind the glass."],
  ["広","wide","regular","コウ","ひろい, ひろがる","広場","ひろば","plaza","広がる","广:wide shelter;ム:spreading base","Children scatter across the open square during recess."],
  ["市","city; market","regular","シ","いち","市場","いちば","market","市立","亠:city cap;巾:cloth market","Stalls crowd the street where shoppers compare fresh produce."],
  ["矢","arrow","regular","シ","や","矢印","やじるし","arrow mark","弓矢","矢:arrow shape;大:shaft and tip","A bright sign on the floor points everyone toward the exit."],
  ["台","stand; platform","regular","ダイ, タイ","—","台風","たいふう","typhoon","台所","厶:raised base;口:platform top","News reporters warn families to prepare before the big storm arrives."],
  ["冬","winter","core","トウ","ふゆ","冬休み","ふゆやすみ","winter vacation","冬服","夂:winter legs;丶:cold dot","Coats, scarves, and mittens hang by the door for the cold season."],
  ["半","half","core","ハン","なかば","半分","はんぶん","half","半月","八:split top;十:dividing cross","One cookie is broken cleanly into two equal pieces."],
  ["母","mother","regular","ボ","はは","母親","ははおや","mother","父母","母:mother shape;丶:breast dots","The lunch note in the bag is signed by the woman who packed it."],
  ["北","north","regular","ホク","きた","北国","きたぐに","northern land","東北","匕:opposed people;匕:back-to-back shape","The weather map shows colder air moving down from the top of the country."],
  ["用","use","core","ヨウ","もちいる","用事","ようじ","errand","用品","用:use frame;丨:center line","A parent stops at the store to pick up school supplies."],
  ["羽","feather; wing","regular","ウ","は, わ","羽毛","うもう","down feathers","一羽","羽:wing pair;習:wing base shape","A single bird drops a soft feather on the path."],
  ["回","times; turn","core","カイ","まわる, まわす","回る","まわる","turn","回数","囗:enclosure;口:center box","The top spins around again and again on the table."],
  ["会","meet; association","core","カイ, エ","あう","会話","かいわ","conversation","会場","人:gathering people;云:speaking cloud","Families chat in the hall before the program starts."],
  ["交","mix; exchange","core","コウ","まじわる, かわす","交通","こうつう","traffic","交代","亠:crossing top;父:crossed lower strokes","Cars, buses, and bikes all meet at the busy intersection."],
];

const BATCH2 = [
  ["光","light","core","コウ","ひかる, ひかり","光線","こうせん","ray","日光","儿:legs of light;⺌:small light rays","A bright beam slips through the curtains onto the floor."],
  ["考","think; consider","core","コウ","かんがえる","考える","かんがえる","think","参考","耂:old-person top;丂:breath mark","The student pauses quietly before writing an answer."],
  ["行","go; line","core","コウ, ギョウ","いく, ゆく, おこなう","旅行","りょこう","trip","歩行","行:crossroads shape;彳:step radical","The station board lists departures for the school excursion."],
  ["合","fit; join","core","ゴウ, ガッ","あう","合図","あいず","signal","合体","人:gathering top;口:mouth box","Two puzzle pieces snap together with a satisfying click."],
  ["寺","temple","regular","ジ","てら","お寺","おてら","temple","寺院","土:earth radical;寸:measuring hand","Visitors ring the bell before stepping into the quiet grounds."],
  ["自","self","core","ジ, シ","みずから","自分","じぶん","oneself","自由","自:self nose shape;目:eye-like frame","The child insists on tying the apron without any help."],
  ["色","color","core","ショク, シキ","いろ","茶色","ちゃいろ","brown","景色","色:color shape;巴:curved tail","A box of crayons spills across the art table."],
  ["西","west","regular","セイ, サイ","にし","西口","にしぐち","west exit","西風","覀:west top;儿:open bottom","The sun drops toward the side of the sky where evening begins."],
  ["多","many","core","タ","おおい","多分","たぶん","probably","多数","夕:evening duplicate;夕:stacked many","Umbrellas fill the rack so completely that none are left open."],
  ["地","ground; area","core","チ, ジ","—","地図","ちず","map","地方","土:earth radical;也:phonetic","The wall chart shows where each town and river belongs."],
  ["池","pond; pool","regular","チ","いけ","電池","でんち","battery","池水","氵:water radical;也:phonetic","The flashlight works again after a fresh cell is snapped in."],
  ["当","this; hit","core","トウ","あたる, あてる","本当","ほんとう","truth; real","当時","⺌:small top;彐:snapped base","The witness promises the story is not made up at all."],
  ["同","same","core","ドウ","おなじ","同時","どうじ","same time","同校","冂:enclosure;口:center box","Two runners reach the tape at exactly one moment."],
  ["肉","meat","regular","ニク","—","牛肉","ぎゅうにく","beef","肉屋","肉:flesh radical;人:inner strokes","The lunch tray comes with slices from the deli counter."],
  ["米","rice","regular","ベイ, マイ","こめ","白米","はくまい","white rice","米国","米:rice radical;十:grain cross","Steam rises from the bowl beside the miso soup."],
  ["毎","every","core","マイ","—","毎日","まいにち","every day","毎週","母:mother base;𠂉:person top","The class waters the plants each day after lunch."],
  ["何","what","core","カ","なに, なん","何人","なんにん","how many people","何年","亻:person radical;可:question phonetic","A worksheet asks which choice belongs in the blank."],
  ["角","horn; angle","regular","カク","かど, つの","角度","かくど","angle","三角","角:horn shape;用:inner frame","The geometry page asks students to measure the corner exactly."],
  ["汽","steam","regular","キ","—","汽車","きしゃ","steam train","汽笛","氵:water radical;气:steam shape","A whistle echoes as the old locomotive leaves the platform."],
  ["近","near","core","キン","ちかい","近道","ちかみち","shortcut","近所","辶:walk road radical;斤:axe phonetic","Neighbors wave from the house just a few doors away."],
  ["形","shape","regular","ケイ, ギョウ","かたち","人形","にんぎょう","doll","三角形","开:open frame;彡:lines","Clay on the desk is molded into a tiny figure."],
  ["言","say; word","core","ゲン, ゴン","いう","言葉","ことば","word","発言","言:speech radical;口:mouth base","A student raises a hand to speak during discussion time."],
  ["谷","valley","regular","コク","たに","谷間","たにま","valley","谷川","谷:valley shape;口:opening","The river winds between steep slopes on both sides."],
  ["作","make","core","サク, サ","つくる","作文","さくぶん","composition","作家","亻:person radical;乍:make phonetic","Pencils scratch across paper during the writing assignment."],
  ["社","shrine; company","regular","シャ","やしろ","神社","じんじゃ","shrine","社会","礻:spirit altar radical;土:earth","Visitors bow beneath the red gate before making a wish."],
  ["図","diagram; plan","regular","ズ, ト","はかる","地図","ちず","map","図工","囗:enclosure;㐅:crossed marks","The class studies a map before leaving for the field trip."],
  ["声","voice","core","セイ, ショウ","こえ","大声","おおごえ","loud voice","鳴き声","士:top support;尸:voice body","A shout from the playground carries all the way to the office."],
  ["走","run","core","ソウ","はしる","走る","はしる","run","走行","走:run shape;土:ground top","Sneakers pound the track as the race begins."],
  ["体","body","core","タイ, テイ","からだ","体力","たいりょく","stamina","体温","亻:person radical;本:origin tree","After gym class, everyone reaches for water and catches a breath."],
  ["弟","younger brother","regular","テイ, ダイ","おとうと","弟子","でし","apprentice","兄弟","弓:bow shape;丿:younger mark","The little boy hurries to catch up with his older sibling."],
  ["売","sell","core","バイ","うる, うれる","売店","ばいてん","kiosk","売場","士:top cover;儿:legs below","Tickets are sold from the small stand beside the gate."],
  ["麦","barley","regular","バク","むぎ","麦茶","むぎちゃ","barley tea","小麦","麦:barley top;夂:legs","A chilled pitcher sits on the counter after practice."],
  ["来","come","core","ライ","くる, きたる","来年","らいねん","next year","来週","木:tree base;米:grain-like top","The calendar note is pinned to the date after this one."],
  ["里","village","regular","リ","さと","古里","ふるさと","hometown","里山","田:field frame;土:ground base","A festival returns every year to the town where the grandparents live."],
  ["画","picture; draw","regular","ガ, カク","えがく","映画","えいが","movie","画家","一:top line;田:field frame","The room goes dark as the film starts on the big screen."],
  ["岩","boulder","regular","ガン","いわ","岩石","がんせき","rock","岩場","山:mountain radical;石:stone","Waves crash against the rough cliff by the shore."],
  ["京","capital","regular","キョウ, ケイ","—","東京","とうきょう","Tokyo","京風","亠:capital crown;小:small base","The bullet train display shows the route to the biggest city."],
  ["国","country","core","コク","くに","外国","がいこく","foreign country","国会","囗:enclosure;玉:jewel inside","A passport stamp marks arrival in another nation."],
  ["姉","older sister","regular","シ","あね","姉妹","しまい","sisters","お姉さん","女:woman radical;市:market phonetic","The big girl helps braid her younger sibling's hair before school."],
  ["知","know","core","チ","しる","知人","ちじん","acquaintance","知る","矢:arrow component;口:mouth","The child waves at someone already familiar from the neighborhood."],
];

const BATCH3 = [
  ["長","long; leader","core","チョウ","ながい","校長","こうちょう","principal","長男","長:long shape;丨:stretching line","The principal steps onto the stage to begin the ceremony."],
  ["直","straight; fix","regular","チョク, ジキ","なおす, なおる","直線","ちょくせん","straight line","正直","十:top cross;目:straight eye","The ruler helps draw a line without any curve at all."],
  ["店","shop","core","テン","みせ","店員","てんいん","shop clerk","売店","广:wide shelter;占:counter phonetic","A clerk behind the counter wraps the small purchase in paper."],
  ["東","east","core","トウ","ひがし","東京","とうきょう","Tokyo","東口","木:tree in sun;日:sun center","The morning sky brightens on the side where the sun rises."],
  ["歩","walk; step","core","ホ, ブ","あるく, あゆむ","歩道","ほどう","sidewalk","散歩","止:footstep top;少:small step","Children keep to the paved path beside the road."],
  ["妹","younger sister","regular","マイ","いもうと","妹さん","いもうとさん","younger sister","姉妹","女:woman radical;未:younger not-yet","The youngest girl in the family tags along behind the others."],
  ["明","bright","core","メイ, ミョウ","あかるい","明るい","あかるい","bright","明日","日:sun radical;月:moon","The room looks cheerful once the curtains are opened."],
  ["門","gate","core","モン","かど","正門","せいもん","main gate","門前","門:gate radical;日:inner opening","Students gather in front of the main entrance before the bell."],
  ["夜","night","core","ヤ","よる, よ","今夜","こんや","tonight","夜空","亠:night roof;夕:evening","The stars start to show after the sky turns dark."],
  ["科","subject","regular","カ","—","科学","かがく","science","教科書","禾:grain radical;斗:measuring scoop","The class puts on goggles before beginning the experiment."],
  ["海","sea","core","カイ","うみ","海外","かいがい","overseas","海岸","氵:water radical;毎:phonetic","The airplane route crosses the ocean to another place."],
  ["活","lively; life","core","カツ","—","生活","せいかつ","daily life","活気","氵:water radical;舌:tongue phonetic","The market feels full of energy once everyone arrives."],
  ["計","measure; plan","core","ケイ","はかる","時計","とけい","clock","合計","言:speech radical;十:counting mark","The clock on the wall ticks toward lunchtime."],
  ["後","after; behind","core","ゴ, コウ","あと, うしろ, のち","午後","ごご","afternoon","後ろ","彳:step radical;夂:going later","The meeting resumes later in the day after lunch."],
  ["思","think","core","シ","おもう","思う","おもう","think","意思","田:field-like top;心:heart","The child stares at the puzzle, trying to work it out."],
  ["室","room","core","シツ","むろ","教室","きょうしつ","classroom","室内","宀:roof radical;至:arrival","Backpacks line the wall of the study area before lessons start."],
  ["首","neck; head","regular","シュ","くび","首都","しゅと","capital city","手首","首:neck shape;目:head frame","The map marks the chief city where the government sits."],
  ["秋","autumn","core","シュウ","あき","秋分","しゅうぶん","autumn equinox","秋風","禾:grain radical;火:fire","Cool air and red leaves signal the harvest season."],
  ["春","spring","core","シュン","はる","春休み","はるやすみ","spring vacation","春風","三:three sprouting lines;日:sun","Cherry blossoms open as the weather turns gentle again."],
  ["食","eat; food","core","ショク, ジキ","たべる","食事","しょくじ","meal","食品","食:food radical;良:good inside","The family sits down together once dinner is ready."],
  ["星","star","regular","セイ, ショウ","ほし","星座","せいざ","constellation","星空","日:sun radical;生:life","Children point upward while tracing patterns in the night sky."],
  ["前","front; before","core","ゼン","まえ","前方","ぜんぽう","ahead","午前","丷:cutting top;刂:sword radical","The hikers look ahead to the trail sign in front of them."],
  ["茶","tea","regular","チャ, サ","—","お茶","おちゃ","tea","茶色","艹:grass radical;人:tea leaves below","A warm cup is set on the table beside the snack plate."],
  ["昼","noon; daytime","regular","チュウ","ひる","昼休み","ひるやすみ","lunch break","白昼","日:sun radical;尺:measuring body","The playground fills up during the break in the middle of the day."],
  ["点","point; dot","regular","テン","—","点数","てんすう","score","点火","占:fortune mark;灬:fire dots","The test paper comes back with a number written in red at the top."],
  ["南","south","regular","ナン","みなみ","南口","みなみぐち","south exit","南国","十:top cross;冂:open frame","The map route heads toward the warmer side of the country."],
  ["風","wind","core","フウ, フ","かぜ, かざ","台風","たいふう","typhoon","風船","風:wind frame;虫:swirling center","Strong gusts make the trees bend and the shutters rattle."],
  ["夏","summer","core","カ, ゲ","なつ","夏休み","なつやすみ","summer vacation","夏服","頁:head top;夂:summer legs","Cicadas buzz loudly during the hottest school break."],
  ["家","house; home","core","カ, ケ","いえ, や","家族","かぞく","family","家庭","宀:roof radical;豕:pig beneath roof","Shoes are lined neatly at the entrance before everyone steps inside."],
  ["記","write down; record","core","キ","しるす","日記","にっき","diary","記者","言:speech radical;己:self","A notebook on the desk holds a short entry about the day."],
  ["帰","return","core","キ","かえる, かえす","帰国","きこく","return to one's country","帰り道","刂:sword-like left form;帚:broom return shape","After the trip ends, the family flies back home."],
  ["原","field; original","core","ゲン","はら","草原","そうげん","grassland","原画","厂:cliff radical;白:white spring","Tall grass sways across the broad open plain."],
  ["高","high","core","コウ","たかい","高校","こうこう","high school","高原","高:tall building shape;口:middle opening","The mountain road climbs onto a plateau above the clouds."],
  ["紙","paper","core","シ","かみ","手紙","てがみ","letter","用紙","糸:thread radical;氏:clan phonetic","A handwritten note arrives in the mailbox after school."],
  ["時","time","core","ジ","とき","時間","じかん","time","時計","日:sun radical;寺:temple phonetic","The countdown on the board shows how much remains."],
  ["弱","weak","regular","ジャク","よわい, よわる","弱い","よわい","weak","弱気","弓:bow shape;ン:drooping marks","The tired battery can barely power the toy anymore."],
  ["書","write; book","core","ショ","かく","読書","どくしょ","reading books","書店","聿:writing brush;日:sun base","A stack of novels waits on the desk beside a sharpened pencil."],
  ["通","pass; commute","core","ツウ","かよう, とおる, とおす","交通","こうつう","traffic","通学","辶:walk road radical;甬:through path","Morning travelers crowd the road and the station gate."],
  ["馬","horse","regular","バ","うま, ま","馬車","ばしゃ","horse-drawn carriage","競馬","馬:horse radical;灬:legs and tail","Hooves clatter on the road as the carriage rolls past."],
  ["魚","fish","regular","ギョ","うお, さかな","金魚","きんぎょ","goldfish","魚屋","魚:fish radical;田:body frame","A small orange swimmer circles lazily inside the bowl on the shelf."],
];

const BATCH4 = [
  ["強","strong","core","キョウ, ゴウ","つよい","強い","つよい","strong","勉強","弓:bow shape;虫:stubborn middle","The rope is too tough to snap with bare hands."],
  ["教","teach","core","キョウ","おしえる, おそわる","教室","きょうしつ","classroom","教会","孝:filial top;攵:action radical","An instructor writes the next problem across the board."],
  ["黄","yellow","regular","コウ, オウ","き, こ","黄色","きいろ","yellow","黄金","黄:yellow form;田:center field","The child picks the crayon the color of a ripe lemon."],
  ["黒","black","regular","コク","くろ, くろい","黒板","こくばん","blackboard","黒字","黒:black form;灬:fire dots","Chalk dust floats in front of the board at the front of class."],
  ["細","thin; fine","regular","サイ","ほそい, こまかい","細い","ほそい","thin","細工","糸:thread radical;田:field phonetic","A very narrow wire slips easily through the bead."],
  ["週","week","core","シュウ","—","毎週","まいしゅう","every week","一週","辶:walk road radical;周:around phonetic","The club meets on the same day again and again."],
  ["雪","snow","regular","セツ","ゆき","雪国","ゆきぐに","snow country","雪山","雨:rain radical;彐:snow broom","Fresh white flakes cover the road and the rooftops overnight."],
  ["船","boat","regular","セン","ふね, ふな","船長","せんちょう","captain","船便","舟:boat radical;八:split passenger mark","The captain waves from the deck before the ferry leaves."],
  ["組","group; class","regular","ソ","くむ, くみ","一組","いちくみ","one group","組み立て","糸:thread radical;且:group phonetic","The teacher calls the first section to line up by the door."],
  ["鳥","bird","regular","チョウ","とり","小鳥","ことり","small bird","白鳥","鳥:bird radical;灬:tail feathers","A tiny creature with feathers hops along the branch outside the window."],
  ["野","field; wild","regular","ヤ","の","野球","やきゅう","baseball","野原","里:village field;予:plain phonetic","Children toss a ball across the diamond after school."],
  ["理","reason; logic","regular","リ","—","理科","りか","science","理由","王:jewel radical;里:village phonetic","The science shelf is filled with rocks, magnets, and jars."],
  ["雲","cloud","regular","ウン","くも","雲海","うんかい","sea of clouds","雲行き","雨:rain radical;云:cloud phonetic","Gray shapes drift across the mountain view before the rain starts."],
  ["絵","picture","regular","カイ, エ","え","絵本","えほん","picture book","絵画","糸:thread radical;会:meeting phonetic","An illustrated storybook lies open with colorful pages on the rug."],
  ["間","interval; space","core","カン, ケン","あいだ, ま","時間","じかん","time","人間","門:gate radical;日:sun inside","A timer on the desk marks the gap until recess begins."],
  ["場","place","core","ジョウ","ば","場所","ばしょ","place","工場","土:earth radical;昜:sunlight phonetic","Please put the chairs back where they belong after the meeting."],
  ["晴","clear weather","regular","セイ","はれる, はらす","晴天","せいてん","clear sky","快晴","日:sun radical;青:blue phonetic","Not a single cloud remains after the storm passes."],
  ["朝","morning","core","チョウ","あさ","今朝","けさ","this morning","朝日","十:morning frame;月:moon","Breakfast smells drift through the house at daybreak."],
  ["答","answer","core","トウ","こたえる, こたえ","答える","こたえる","answer","答案","⺮:bamboo radical;合:fit phonetic","The student raises a hand when ready to respond."],
  ["道","road; way","core","ドウ, トウ","みち","道具","どうぐ","tool","帰り道","辶:walk road radical;首:head phonetic","A toolbox opens with all the tools lined up neatly inside."],
  ["買","buy","core","バイ","かう","買い物","かいもの","shopping","買い手","罒:net top;貝:shell money","A shopper compares prices before heading to the register."],
  ["番","turn; number","regular","バン","—","一番","いちばん","first; best","当番","釆:separate grains;田:field","The runner in first place breaks the tape before anyone else."],
  ["園","garden; park","regular","エン","その","公園","こうえん","park","園長","囗:enclosure;袁:garden phonetic","Children race for the swings after arriving at the playground."],
  ["遠","far","core","エン","とおい","遠足","えんそく","school excursion","遠回り","辶:walk road radical;袁:long gown","The class boards a bus for a trip well beyond the school neighborhood."],
  ["楽","music; ease","core","ガク, ラク","たのしい, たのしむ","音楽","おんがく","music","楽しい","白:white top;木:tree base","Notes from the recorder lesson float down the hallway."],
  ["新","new","core","シン","あたらしい","新聞","しんぶん","newspaper","新学期","親:parent-like left;斤:axe","Fresh papers arrive on the doorstep early in the morning."],
  ["数","number; count","core","スウ, ス","かず, かぞえる","数学","すうがく","mathematics","数える","米:rice radical;攵:counting action","The class solves arithmetic problems on the worksheet."],
  ["電","electricity","core","デン","—","電話","でんわ","telephone","電車","雨:rain radical;申:lightning body","The phone rings loudly on the kitchen counter."],
  ["話","talk","core","ワ","はなす, はなし","会話","かいわ","conversation","電話","言:speech radical;舌:tongue","Two friends keep chatting long after the bell rings."],
  ["歌","song","regular","カ","うた, うたう","歌う","うたう","sing","歌手","欠:open mouth radical;哥:repeated sing block","The choir opens practice by singing together in tune."],
  ["語","language","core","ゴ","かたる","日本語","にほんご","Japanese language","語学","言:speech radical;五:number five","A label on the book spine shows which words it uses."],
  ["算","calculate","core","サン","—","計算","けいさん","calculation","算数","⺮:bamboo radical;目:eye count","The child checks the arithmetic again before writing the result."],
  ["読","read","core","ドク, トク, トウ","よむ","読書","どくしょ","reading books","音読","言:speech radical;売:sell phonetic","A student curls up in the library corner with a novel."],
  ["聞","hear; ask","core","ブン, モン","きく, きこえる","聞こえる","きこえる","be heard","新聞","門:gate radical;耳:ear","Music from the next room can be heard through the wall."],
  ["鳴","chirp; ring","regular","メイ","なく, なる, ならす","鳴る","なる","ring","鳴き声","口:mouth radical;鳥:bird","The school bell sounds and everyone starts packing up."],
  ["線","line","regular","セン","—","直線","ちょくせん","straight line","光線","糸:thread radical;泉:spring phonetic","A straight mark stretches neatly across the graph paper."],
  ["親","parent; close","core","シン","おや, したしい","両親","りょうしん","parents","親友","立:stand radical;見:see","Both parents wave from the seats before the recital begins."],
  ["頭","head","regular","トウ, ズ","あたま, かしら","先頭","せんとう","front; head","頭上","頁:head radical;豆:bean phonetic","The lead runner reaches the front of the line first."],
  ["顔","face","regular","ガン","かお","笑顔","えがお","smiling face","顔色","頁:head radical;彦:handsome phonetic","A bright smile spreads after the goal."],
  ["曜","weekday","regular","ヨウ","—","日曜日","にちようび","Sunday","木曜日","日:sun radical;翟:winged light","The family circles Sunday on the calendar for the outing."],
];

const G2_SOURCE = [...BATCH1,...BATCH2,...BATCH3,...BATCH4];

const G2_RECORDS = G2_SOURCE.map(([kanji,action,tier,on,kun,exampleWord,exampleReading,exampleMeaning,blank2Word,componentSpec,scenario])=>({
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

const COMPONENT_POOL = uniqueBy(G2_RECORDS.map(record=>record.components[0]&&`${record.components[0].s} (${record.components[0].d})`).filter(Boolean),item=>item);
const READING_POOL = uniqueBy(G2_RECORDS.map(record=>record.exampleReading).filter(Boolean),item=>item);
const MEANING_POOL = uniqueBy(G2_RECORDS.map(record=>record.exampleMeaning).filter(Boolean),item=>item);

function buildCommand(record,index){
  const componentLead=record.components[0]||{s:record.kanji,d:'whole character form'};
  const componentCorrect=`${componentLead.s} (${componentLead.d})`;
  return {
    id:record.id,
    action:record.action,
    tier:record.tier,
    dom:'g2',
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

const COMMANDS = G2_RECORDS.map(buildCommand);

const KANJI_G2 = {
  id:'joyo-kanji-g2',
  name:'Joyo Kanji - Grade 2',
  description:'Kanji defense for 160 Grade 2 (elementary year 2) Joyo kanji',
  icon:'語',
  inputMode:'quiz',
  prefixLabel:null,
  title:'KANJI 二年',
  subtitle:'DEFENSE',
  startButton:'出陣',
  instructions:'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub:'Grade 2 - 160 kanji - Recognition → Recall → Compounds',
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

const VARIABLE_BANK = Object.fromEntries(G2_RECORDS.map(record=>[
  record.id,
  uniqueBy(
    [...record.components, {s:record.kanji,d:'whole character form'}],
    entry=>`${entry.s}|${entry.d}`
  ).slice(0,3)
]));

const RELATIONSHIP_BANK = {};

const EXPLANATION_GLOSSARY = G2_RECORDS.map(record=>({
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
  'g2':['Grade 2 (second-year elementary)'],
};

const CONFUSABLE_GROUPS = [
  '刀切分',
  '父母兄姉妹弟',
  '東西南北',
  '春夏秋冬',
  '牛馬魚鳥',
  '言話語読聞声答歌鳴',
  '行来走歩通帰道',
  '朝昼夜時週曜',
  '雲雪風晴',
  '店家室門園',
  '食米肉茶麦',
  '黄黒色',
  '画図絵紙線',
  '買売計数算',
  '近遠強弱新古',
  '地場里原野',
  '会交合',
  '星光',
  '首頭顔',
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

const APPLICATION_BANK = Object.fromEntries(G2_RECORDS.map(record=>[
  record.id,
  [{scenario:record.scenario,confusionSet:CONFUSABLE_MAP[record.id].slice(0,3)}]
]));

const SHARED_PREREQ_NODES = {
  'radical-mouth':{id:'radical-mouth',type:'conceptual',level:2,q:'Which radical is 口?',correct:'Mouth (kuchi)',wrong:['Sun (nichi)','Eye (me)'],prereqs:['stroke-basics']},
  'radical-sun':{id:'radical-sun',type:'conceptual',level:2,q:'Which radical is 日?',correct:'Sun/day (nichi)',wrong:['Mouth','Eye'],prereqs:['stroke-basics']},
  'radical-eye':{id:'radical-eye',type:'conceptual',level:2,q:'Which radical is 目?',correct:'Eye (me)',wrong:['Sun','Mouth'],prereqs:['stroke-basics']},
  'radical-tree':{id:'radical-tree',type:'conceptual',level:2,q:'Which radical is 木?',correct:'Tree (ki)',wrong:['Person','Fire'],prereqs:['stroke-basics']},
  'radical-person':{id:'radical-person',type:'conceptual',level:2,q:'Which radical is 亻?',correct:'Person (left form of 人)',wrong:['Tree','Hand'],prereqs:['stroke-basics']},
  'radical-water':{id:'radical-water',type:'conceptual',level:2,q:'Which radical is 氵?',correct:'Water (left form of 水)',wrong:['Fire','Person'],prereqs:['stroke-basics']},
  'radical-fire':{id:'radical-fire',type:'conceptual',level:2,q:'Which radical is 火?',correct:'Fire (hi)',wrong:['Water','Tree'],prereqs:['stroke-basics']},
  'radical-earth':{id:'radical-earth',type:'conceptual',level:2,q:'Which radical is 土?',correct:'Earth/soil (tsuchi)',wrong:['King','Work'],prereqs:['stroke-basics']},
  'radical-grass':{id:'radical-grass',type:'conceptual',level:2,q:'Which radical is 艹?',correct:'Grass/plant (kusakanmuri)',wrong:['Bamboo','Rain'],prereqs:['stroke-basics']},
  'radical-woman':{id:'radical-woman',type:'conceptual',level:2,q:'Which radical is 女?',correct:'Woman (onna)',wrong:['Child','Person'],prereqs:['stroke-basics']},
  'radical-child':{id:'radical-child',type:'conceptual',level:2,q:'Which radical is 子?',correct:'Child (ko)',wrong:['Woman','Person'],prereqs:['stroke-basics']},
  'radical-hand':{id:'radical-hand',type:'conceptual',level:2,q:'Which radical is 扌?',correct:'Hand (left form of 手)',wrong:['Person','Water'],prereqs:['stroke-basics']},
  'radical-field':{id:'radical-field',type:'conceptual',level:2,q:'Which radical is 田?',correct:'Rice field (ta)',wrong:['Mouth','Eye'],prereqs:['stroke-basics']},
  'radical-power':{id:'radical-power',type:'conceptual',level:2,q:'Which radical is 力?',correct:'Power/strength (chikara)',wrong:['Sword','Nine'],prereqs:['stroke-basics']},
  'radical-shell':{id:'radical-shell',type:'conceptual',level:2,q:'Which radical is 貝?',correct:'Shell/money (kai)',wrong:['Eye','Field'],prereqs:['stroke-basics']},
  'radical-rain':{id:'radical-rain',type:'conceptual',level:2,q:'Which radical is 雨?',correct:'Rain/weather (ame)',wrong:['Roof','Cloud'],prereqs:['stroke-basics']},
  'radical-roof':{id:'radical-roof',type:'conceptual',level:2,q:'Which radical is 宀?',correct:'Roof (ukanmuri)',wrong:['Hole','Rain'],prereqs:['stroke-basics']},
  'radical-vehicle':{id:'radical-vehicle',type:'conceptual',level:2,q:'Which radical is 車?',correct:'Vehicle (kuruma)',wrong:['Field','East'],prereqs:['stroke-basics']},
  'radical-insect':{id:'radical-insect',type:'conceptual',level:2,q:'Which radical is 虫?',correct:'Insect (mushi)',wrong:['Wind','Shell'],prereqs:['stroke-basics']},
  'radical-metal':{id:'radical-metal',type:'conceptual',level:2,q:'Which radical is 金?',correct:'Metal/gold (kane)',wrong:['Shell','Jewel'],prereqs:['stroke-basics']},
  'radical-sword':{id:'radical-sword',type:'conceptual',level:2,q:'Which radical represents a blade or cutting?',correct:'刂 (sword/knife)',wrong:['力 (power)','十 (ten)'],prereqs:['nature-elements']},
  'radical-speech':{id:'radical-speech',type:'conceptual',level:2,q:'Which radical relates to speech or language?',correct:'言 / 訁 (speech radical)',wrong:['糸 (thread)','門 (gate)'],prereqs:['stroke-basics']},
  'radical-walk':{id:'radical-walk',type:'conceptual',level:2,q:'Which radical suggests movement or walking?',correct:'辶 (walk road radical)',wrong:['土 (earth)','月 (moon)'],prereqs:['stroke-basics']},
  'radical-gate':{id:'radical-gate',type:'conceptual',level:2,q:'Which radical is 門?',correct:'Gate (mon)',wrong:['Bird','Rice'],prereqs:['stroke-basics']},
  'radical-food':{id:'radical-food',type:'conceptual',level:2,q:'Which radical relates to eating or food?',correct:'食 / 飠 (food radical)',wrong:['言 (speech)','水 (water)'],prereqs:['stroke-basics']},
  'radical-horse':{id:'radical-horse',type:'conceptual',level:2,q:'Which radical is 馬?',correct:'Horse (uma)',wrong:['Fish','Bird'],prereqs:['stroke-basics']},
  'radical-bird':{id:'radical-bird',type:'conceptual',level:2,q:'Which radical is 鳥?',correct:'Bird (tori)',wrong:['Horse','Rice'],prereqs:['stroke-basics']},
  'radical-rice':{id:'radical-rice',type:'conceptual',level:2,q:'Which radical is 米?',correct:'Rice (kome)',wrong:['Bird','Gate'],prereqs:['stroke-basics']},
  'body-parts':{id:'body-parts',type:'conceptual',level:3,q:'Name Grade 1 body-part kanji',correct:'目 耳 口 手 足 (eye, ear, mouth, hand, foot)',wrong:['山 川 田','一 二 三'],prereqs:['radical-eye','radical-mouth','radical-hand']},
  'nature-elements':{id:'nature-elements',type:'conceptual',level:3,q:'Name the 5 classical element kanji',correct:'火 水 木 金 土 (fire, water, tree, metal, earth)',wrong:['上 下 左 右','一 二 三 四 五'],prereqs:['radical-fire','radical-water','radical-tree','radical-earth']},
  'direction-concepts':{id:'direction-concepts',type:'conceptual',level:3,q:'Name the direction/position kanji',correct:'上 下 左 右 中 東 西 南 北 (positions and cardinal directions)',wrong:['一 二 三','男 女 子'],prereqs:[]},
  'number-system':{id:'number-system',type:'conceptual',level:3,q:'Order: 十 百 千',correct:'十(10) → 百(100) → 千(1000)',wrong:['千→百→十','百→千→十'],prereqs:[]},
  'tree-density':{id:'tree-density',type:'conceptual',level:3,q:'Order by vegetation density',correct:'木(1 tree) → 林(2=grove) → 森(3=forest)',wrong:['森→林→木','林→木→森'],prereqs:['radical-tree']},
  'similar-kanji-dai':{id:'similar-kanji-dai',type:'conceptual',level:3,q:'Distinguish: 大 犬 太 天',correct:'大=big, 犬=dog(dot right), 太=fat(dot left), 天=heaven(top bar)',wrong:['All identical','Only size differs'],prereqs:[]},
  'similar-kanji-nichi':{id:'similar-kanji-nichi',type:'conceptual',level:3,q:'Distinguish: 日 目 白 田',correct:'日=sun(tall), 目=eye(wide), 白=white(top stroke), 田=field(cross)',wrong:['All identical','Only width differs'],prereqs:['radical-sun','radical-eye','radical-field']},
  'family-relationships':{id:'family-relationships',type:'conceptual',level:3,q:'Name the Grade 2 family relationship kanji',correct:'父 母 兄 姉 妹 弟 (family words)',wrong:['東 西 南 北','春 夏 秋 冬'],prereqs:['radical-woman','radical-child']},
  'time-concepts':{id:'time-concepts',type:'conceptual',level:3,q:'Name time-related Grade 2 kanji',correct:'朝 昼 夜 春 夏 秋 冬 時 週 曜 (times and seasons)',wrong:['刀 馬 魚 鳥','言 読 書 語'],prereqs:['radical-sun']},
  'communication-concepts':{id:'communication-concepts',type:'conceptual',level:3,q:'Name communication-related Grade 2 kanji',correct:'言 話 語 読 聞 声 歌 答 書 (speech, reading, writing, sound)',wrong:['牛 馬 魚 鳥','東 西 南 北'],prereqs:['radical-speech','hiragana-reading']},
  'onyomi-kunyomi':{id:'onyomi-kunyomi',type:'conceptual',level:4,q:'Difference between on\'yomi and kun\'yomi?',correct:'On = Chinese-derived reading; Kun = native Japanese reading',wrong:['They are the same','On is always used alone'],prereqs:['hiragana-reading','katakana-vowels','katakana-ka-row']},
  'compound-reading-rules':{id:'compound-reading-rules',type:'conceptual',level:4,q:'In a two-kanji compound (熟語), which reading is most common?',correct:'On\'yomi for both kanji (音読み×2)',wrong:['Kun\'yomi for both','Mix is most common'],prereqs:['onyomi-kunyomi']},
  'hiragana-reading':{id:'hiragana-reading',type:'conceptual',level:4,q:'Can you read hiragana?',correct:'Yes — basic syllabary for native Japanese words',wrong:['Hiragana is for foreign words','Same as kanji'],prereqs:['hiragana-vowels','hiragana-ka-row','hiragana-sa-row','hiragana-ta-row','hiragana-na-row']},
  'hiragana-vowels':{id:'hiragana-vowels',type:'computational',level:4,q:'What is the romaji for あ い う え お?',correct:'a i u e o',wrong:['e i u o a','ka ki ku ke ko'],prereqs:['kana-basics']},
  'hiragana-ka-row':{id:'hiragana-ka-row',type:'computational',level:4,q:'What is the romaji for か?',correct:'ka',wrong:['ga','ki'],prereqs:['kana-basics']},
  'hiragana-sa-row':{id:'hiragana-sa-row',type:'computational',level:4,q:'What is the romaji for さ?',correct:'sa',wrong:['za','shi'],prereqs:['kana-basics']},
  'hiragana-ta-row':{id:'hiragana-ta-row',type:'computational',level:4,q:'What is the romaji for た?',correct:'ta',wrong:['da','chi'],prereqs:['kana-basics']},
  'hiragana-na-row':{id:'hiragana-na-row',type:'computational',level:4,q:'What is the romaji for な?',correct:'na',wrong:['ni','nu'],prereqs:['kana-basics']},
  'hiragana-ha-row':{id:'hiragana-ha-row',type:'computational',level:4,q:'What is the romaji for は?',correct:'ha',wrong:['ba','pa'],prereqs:['kana-basics']},
  'hiragana-ma-row':{id:'hiragana-ma-row',type:'computational',level:4,q:'What is the romaji for ま?',correct:'ma',wrong:['mi','na'],prereqs:['kana-basics']},
  'hiragana-ya-row':{id:'hiragana-ya-row',type:'computational',level:4,q:'What is the romaji for や?',correct:'ya',wrong:['yu','wa'],prereqs:['kana-basics']},
  'hiragana-ra-row':{id:'hiragana-ra-row',type:'computational',level:4,q:'What is the romaji for ら?',correct:'ra',wrong:['la','ri'],prereqs:['kana-basics']},
  'hiragana-wa-n':{id:'hiragana-wa-n',type:'computational',level:4,q:'What is the romaji for ん?',correct:'n',wrong:['m','ng'],prereqs:['kana-basics']},
  'katakana-vowels':{id:'katakana-vowels',type:'computational',level:4,q:'What is the romaji for ア イ ウ エ オ?',correct:'a i u e o',wrong:['e i u o a','ka ki ku ke ko'],prereqs:['kana-basics']},
  'katakana-ka-row':{id:'katakana-ka-row',type:'computational',level:4,q:'What is the romaji for カ?',correct:'ka',wrong:['ga','sa'],prereqs:['kana-basics']},
  'katakana-sa-row':{id:'katakana-sa-row',type:'computational',level:4,q:'What is the romaji for サ?',correct:'sa',wrong:['za','ka'],prereqs:['kana-basics']},
  'katakana-ta-row':{id:'katakana-ta-row',type:'computational',level:4,q:'What is the romaji for タ?',correct:'ta',wrong:['da','ka'],prereqs:['kana-basics']},
  'katakana-na-row':{id:'katakana-na-row',type:'computational',level:4,q:'What is the romaji for ナ?',correct:'na',wrong:['ni','ma'],prereqs:['kana-basics']},
  'kana-basics':{id:'kana-basics',type:'conceptual',level:5,q:'Japanese has two phonetic scripts. What are they called?',correct:'Hiragana and Katakana',wrong:['Romaji and Kanji','Hiragana and Romaji'],prereqs:[]},
  'stroke-basics':{id:'stroke-basics',type:'conceptual',level:5,q:'What are the basic stroke types?',correct:'Horizontal, vertical, diagonal, turning, dot',wrong:['Only horizontal and vertical','Only diagonal'],prereqs:[]},
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
    [/radical.*人|person|亻/i, ['radical-person']],
    [/radical.*水|water|氵/i, ['radical-water']],
    [/radical.*火|fire/i, ['radical-fire']],
    [/radical.*土|earth/i, ['radical-earth']],
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
    [/radical.*金|metal/i, ['radical-metal']],
    [/radical.*刀|刂|sword|blade|knife/i, ['radical-sword']],
    [/radical.*言|訁|speech|language|word/i, ['radical-speech']],
    [/radical.*辶|walk|road|path/i, ['radical-walk']],
    [/radical.*門|gate/i, ['radical-gate']],
    [/radical.*食|飠|food|eat/i, ['radical-food']],
    [/radical.*馬|horse/i, ['radical-horse']],
    [/radical.*鳥|bird/i, ['radical-bird']],
    [/radical.*米|rice/i, ['radical-rice']],
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

KANJI_G2.variableBank = VARIABLE_BANK;
KANJI_G2.applicationBank = APPLICATION_BANK;
KANJI_G2.relationshipBank = RELATIONSHIP_BANK;
KANJI_G2.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G2.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G2.domLabels = DOM_LABELS;
KANJI_G2.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G2.normalizeExplanationLookup = normalizeLookup;
KANJI_G2.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G2.wireL1toL2 = wireL1toL2;

window.KANJI_G2_DATA = KANJI_G2;
})();
