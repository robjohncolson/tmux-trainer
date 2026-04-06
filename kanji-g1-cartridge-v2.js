// Jōyō Kanji Grade 1 — Formula Defense Cartridge (v2)
// 80 kanji · compound-completion blanks · reading-in-word subconcepts
// Evidence-based: retrieval practice, interleaving, cognitive load control
(function(){

function shuffleArr(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const KANJI_G1 = {
  id: 'joyo-kanji-g1',
  name: 'Jōyō Kanji · Grade 1',
  description: 'Kanji defense for 80 Grade 1 (小学一年) Jōyō kanji',
  icon: '漢',
  inputMode: 'quiz',
  prefixLabel: null,
  title: 'KANJI 一年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  instructions: 'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub: 'Grade 1 · 80 kanji · Recognition → Recall → Compounds',

  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',

  commands: [
    {id:'k-4e00',action:'one',tier:'core',dom:'l1',
      hint:'オン: イチ・イツ | くん: ひと(つ) | 例: 一日 (いちにち)',
      explain:'Single horizontal stroke. Simplest kanji; appears in many counters.',
      latex:'一',
      blanks:[
        {latex:'\\boxed{\\,?\\,}日',answer:'一',choices:['一','二','三']},
        {latex:'\\boxed{\\,?\\,}人',answer:'一',choices:['一','二','三']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'一',choices:['一','二','三']}
      ],
      subconcepts:[
        {q:'How many strokes does 一 have?',correct:'1',wrong:['2','2']},
        {q:'In 一日 (one day), what is the reading?',correct:'いちにち',wrong:['オウ','シュ']},
        {q:'What does 一人 mean?',correct:'one person',wrong:['this year','white']}
      ]},
    {id:'k-53f3',action:'right',tier:'core',dom:'l1',
      hint:'オン: ウ・ユウ | くん: みぎ | 例: 右手 (みぎて)',
      explain:'ナ (hand) + 口 (mouth). The right hand brings food to the mouth.',
      latex:'右',
      blanks:[
        {latex:'\\boxed{\\,?\\,}手',answer:'右',choices:['右','左','石']},
        {latex:'\\boxed{\\,?\\,}側',answer:'右',choices:['右','左','石']},
        {latex:'左\\boxed{\\,?\\,}',answer:'右',choices:['右','左','石']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 右?',correct:'ナ (hand shape)',wrong:['火','木']},
        {q:'In 右手 (right hand), what is the reading?',correct:'みぎて',wrong:['シュ','メイ']},
        {q:'What does 右側 mean?',correct:'right side',wrong:['blue sky','strong person']}
      ]},
    {id:'k-96e8',action:'rain',tier:'core',dom:'l1',
      hint:'オン: ウ | くん: あめ・あま | 例: 大雨 (おおあめ)',
      explain:'Rain falling from clouds. The 雨 radical tops many weather kanji.',
      latex:'雨',
      blanks:[
        {latex:'大\\boxed{\\,?\\,}',answer:'雨',choices:['雨','雲','電']},
        {latex:'\\boxed{\\,?\\,}水',answer:'雨',choices:['雨','雲','電']},
        {latex:'\\boxed{\\,?\\,}天',answer:'雨',choices:['雨','雲','電']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 雨?',correct:'雨 (rain radical)',wrong:['力','土']},
        {q:'In 大雨 (heavy rain), what is the reading?',correct:'おおあめ',wrong:['シ','ジョ']},
        {q:'What does 雨水 mean?',correct:'rainwater',wrong:['February','October']}
      ]},
    {id:'k-5186',action:'circle; yen',tier:'core',dom:'l1',
      hint:'オン: エン | くん: まる(い) | 例: 円い (まるい)',
      explain:'Simplified 圓. Used for round shapes and Japanese currency.',
      latex:'円',
      blanks:[
        {latex:'\\boxed{\\,?\\,}い',answer:'円',choices:['円','丸','内']},
        {latex:'百\\boxed{\\,?\\,}',answer:'円',choices:['円','丸','内']},
        {latex:'\\boxed{\\,?\\,}形',answer:'円',choices:['円','丸','内']}
      ],
      subconcepts:[
        {q:'How many strokes does 円 have?',correct:'4',wrong:['3','5']},
        {q:'In 円い (round), what is the reading?',correct:'まるい',wrong:['スイ','デン']},
        {q:'What does 百円 mean?',correct:'100 yen',wrong:['March','village chief']}
      ]},
    {id:'k-738b',action:'king',tier:'core',dom:'l1',
      hint:'オン: オウ | 例: 王様 (おうさま)',
      explain:'Three lines (heaven, man, earth) united by vertical stroke.',
      latex:'王',
      blanks:[
        {latex:'\\boxed{\\,?\\,}様',answer:'王',choices:['王','玉','主']},
        {latex:'女\\boxed{\\,?\\,}',answer:'王',choices:['王','玉','主']},
        {latex:'\\boxed{\\,?\\,}子',answer:'王',choices:['王','玉','主']}
      ],
      subconcepts:[
        {q:'How many strokes does 王 have?',correct:'4',wrong:['3','5']},
        {q:'In 王様 (king), what is the reading?',correct:'おうさま',wrong:['ニチ','テン']},
        {q:'What does 女王 mean?',correct:'queen',wrong:['adult','skillful']}
      ]},
    {id:'k-97f3',action:'sound',tier:'core',dom:'l1',
      hint:'オン: オン・イン | くん: おと・ね | 例: 音楽 (おんがく)',
      explain:'立 (stand) + 日 (sun). A voice rising — sound.',
      latex:'音',
      blanks:[
        {latex:'\\boxed{\\,?\\,}楽',answer:'音',choices:['音','意','暗']},
        {latex:'\\boxed{\\,?\\,}読み',answer:'音',choices:['音','意','暗']},
        {latex:'足\\boxed{\\,?\\,}',answer:'音',choices:['音','意','暗']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 音?',correct:'立 (stand)',wrong:['火','木']},
        {q:'In 音楽 (music), what is the reading?',correct:'おんがく',wrong:['ジュウ','ブン']},
        {q:'What does 音読み mean?',correct:'on-yomi reading',wrong:['June','girl/woman']}
      ]},
    {id:'k-4e0b',action:'below; down',tier:'core',dom:'l1',
      hint:'オン: カ・ゲ | くん: した・くだ(る)・さ(がる) | 例: 下手 (へた)',
      explain:'Indicator pointing downward below a baseline.',
      latex:'下',
      blanks:[
        {latex:'\\boxed{\\,?\\,}手',answer:'下',choices:['下','上','不']},
        {latex:'上\\boxed{\\,?\\,}',answer:'下',choices:['下','上','不']},
        {latex:'地\\boxed{\\,?\\,}',answer:'下',choices:['下','上','不']}
      ],
      subconcepts:[
        {q:'How many strokes does 下 have?',correct:'3',wrong:['2','4']},
        {q:'In 下手 (unskillful), what is the reading?',correct:'へた',wrong:['シ','テン']},
        {q:'What does 上下 mean?',correct:'up and down',wrong:['fireworks','stone bridge']}
      ]},
    {id:'k-706b',action:'fire',tier:'core',dom:'l1',
      hint:'オン: カ | くん: ひ・ほ | 例: 火事 (かじ)',
      explain:'Pictograph of flames. The 火/灬 radical marks heat-related kanji.',
      latex:'火',
      blanks:[
        {latex:'\\boxed{\\,?\\,}事',answer:'火',choices:['火','水','木']},
        {latex:'\\boxed{\\,?\\,}山',answer:'火',choices:['火','水','木']},
        {latex:'花\\boxed{\\,?\\,}',answer:'火',choices:['火','水','木']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 火?',correct:'火 (fire radical)',wrong:['亻','艹']},
        {q:'In 火事 (fire (disaster)), what is the reading?',correct:'かじ',wrong:['モク','ヒャク']},
        {q:'What does 火山 mean?',correct:'volcano',wrong:['April','to be enough']}
      ]},
    {id:'k-82b1',action:'flower',tier:'core',dom:'l1',
      hint:'オン: カ | くん: はな | 例: 花火 (はなび)',
      explain:'艹 (grass) + 化 (change). Plants that transform into blossoms.',
      latex:'花',
      blanks:[
        {latex:'\\boxed{\\,?\\,}火',answer:'花',choices:['花','草','苗']},
        {latex:'\\boxed{\\,?\\,}見',answer:'花',choices:['花','草','苗']},
        {latex:'生\\boxed{\\,?\\,}',answer:'花',choices:['花','草','苗']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 花?',correct:'艹 (grass radical)',wrong:['日','扌']},
        {q:'In 花火 (fireworks), what is the reading?',correct:'はなび',wrong:['ネン','カ']},
        {q:'What does 花見 mean?',correct:'flower viewing',wrong:['town mayor','left hand']}
      ]},
    {id:'k-8c9d',action:'shell',tier:'core',dom:'l1',
      hint:'オン: バイ | くん: かい | 例: 貝殻 (かいがら)',
      explain:'Pictograph of cowrie shell. Radical for money/value — ancient currency.',
      latex:'貝',
      blanks:[
        {latex:'\\boxed{\\,?\\,}殻',answer:'貝',choices:['貝','見','頁']},
        {latex:'二枚\\boxed{\\,?\\,}',answer:'貝',choices:['貝','見','頁']},
        {latex:'巻き\\boxed{\\,?\\,}',answer:'貝',choices:['貝','見','頁']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 貝?',correct:'貝 (shell/value radical)',wrong:['土','力']},
        {q:'In 貝殻 (seashell), what is the reading?',correct:'かいがら',wrong:['ジョ','ホン']},
        {q:'What does 二枚貝 mean?',correct:'bivalve',wrong:['left hand','forest road']}
      ]},
    {id:'k-5b66',action:'study; learning',tier:'core',dom:'l1',
      hint:'オン: ガク | くん: まな(ぶ) | 例: 学校 (がっこう)',
      explain:'Child (子) under a roof learning. Usually ガク in compounds.',
      latex:'学',
      blanks:[
        {latex:'\\boxed{\\,?\\,}校',answer:'学',choices:['学','字','覚']},
        {latex:'\\boxed{\\,?\\,}生',answer:'学',choices:['学','字','覚']},
        {latex:'\\boxed{\\,?\\,}年',answer:'学',choices:['学','字','覚']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 学?',correct:'⺍ (crown/learn)',wrong:['艹','扌']},
        {q:'In 学校 (school), what is the reading?',correct:'がっこう',wrong:['シュ','カ']},
        {q:'What does 学生 mean?',correct:'student',wrong:['air; atmosphere','April']}
      ]},
    {id:'k-6c17',action:'spirit; air; mood',tier:'core',dom:'l1',
      hint:'オン: キ・ケ | 例: 天気 (てんき)',
      explain:'Simplified 氣. Steam rising — energy, mood, atmosphere.',
      latex:'気',
      blanks:[
        {latex:'天\\boxed{\\,?\\,}',answer:'気',choices:['気','汽','飛']},
        {latex:'元\\boxed{\\,?\\,}',answer:'気',choices:['気','汽','飛']},
        {latex:'\\boxed{\\,?\\,}持ち',answer:'気',choices:['気','汽','飛']}
      ],
      subconcepts:[
        {q:'How many strokes does 気 have?',correct:'6',wrong:['5','7']},
        {q:'In 天気 (weather), what is the reading?',correct:'てんき',wrong:['チュウ','デン']},
        {q:'What does 元気 mean?',correct:'energetic; well',wrong:['February','insect']}
      ]},
    {id:'k-4e5d',action:'nine',tier:'core',dom:'l1',
      hint:'オン: キュウ・ク | くん: ここの(つ) | 例: 九月 (くがつ)',
      explain:'Two strokes. Appears in month/counting expressions.',
      latex:'九',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'九',choices:['九','丸','力']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'九',choices:['九','丸','力']},
        {latex:'\\boxed{\\,?\\,}州',answer:'九',choices:['九','丸','力']}
      ],
      subconcepts:[
        {q:'How many strokes does 九 have?',correct:'2',wrong:['1','3']},
        {q:'In 九月 (September), what is the reading?',correct:'くがつ',wrong:['シン','ソウ']},
        {q:'What does 九つ mean?',correct:'nine things',wrong:['Japan','Thursday']}
      ]},
    {id:'k-4f11',action:'rest',tier:'core',dom:'l1',
      hint:'オン: キュウ | くん: やす(む)・やす(まる) | 例: 休日 (きゅうじつ)',
      explain:'Person (亻) leaning against tree (木). Classic mnemonic compound.',
      latex:'休',
      blanks:[
        {latex:'\\boxed{\\,?\\,}日',answer:'休',choices:['休','体','何']},
        {latex:'\\boxed{\\,?\\,}み',answer:'休',choices:['休','体','何']},
        {latex:'\\boxed{\\,?\\,}憩',answer:'休',choices:['休','体','何']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 休?',correct:'亻 (person)',wrong:['扌','木']},
        {q:'In 休日 (holiday), what is the reading?',correct:'きゅうじつ',wrong:['ジ','ニュウ']},
        {q:'What does 休み mean?',correct:'break; vacation',wrong:['ENT clinic','music']}
      ]},
    {id:'k-7389',action:'jewel; ball',tier:'core',dom:'l1',
      hint:'オン: ギョク | くん: たま | 例: お玉 (おたま)',
      explain:'王 (king) + dot. The dot distinguishes jewel from king.',
      latex:'玉',
      blanks:[
        {latex:'お\\boxed{\\,?\\,}',answer:'玉',choices:['玉','王','主']},
        {latex:'\\boxed{\\,?\\,}入れ',answer:'玉',choices:['玉','王','主']},
        {latex:'宝\\boxed{\\,?\\,}',answer:'玉',choices:['玉','王','主']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 玉?',correct:'王 (king base)',wrong:['扌','子']},
        {q:'In お玉 (ladle), what is the reading?',correct:'おたま',wrong:['チュウ','サ']},
        {q:'What does 玉入れ mean?',correct:'ball toss game',wrong:['name','unskillful']}
      ]},
    {id:'k-91d1',action:'gold; money; metal',tier:'core',dom:'l1',
      hint:'オン: キン・コン | くん: かね・かな | 例: お金 (おかね)',
      explain:'Nuggets under a roof — gold, metal, money. Friday element.',
      latex:'金',
      blanks:[
        {latex:'お\\boxed{\\,?\\,}',answer:'金',choices:['金','銀','銅']},
        {latex:'\\boxed{\\,?\\,}曜日',answer:'金',choices:['金','銀','銅']},
        {latex:'\\boxed{\\,?\\,}色',answer:'金',choices:['金','銀','銅']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 金?',correct:'金 (metal radical)',wrong:['氵','子']},
        {q:'In お金 (money), what is the reading?',correct:'おかね',wrong:['ソン','キュウ']},
        {q:'What does 金曜日 mean?',correct:'Friday',wrong:['to stand','round']}
      ]},
    {id:'k-7a7a',action:'sky; empty',tier:'core',dom:'l1',
      hint:'オン: クウ | くん: そら・あ(く)・から | 例: 空気 (くうき)',
      explain:'Hole (穴) + work (工). An opening to the sky; emptiness.',
      latex:'空',
      blanks:[
        {latex:'\\boxed{\\,?\\,}気',answer:'空',choices:['空','穴','宝']},
        {latex:'\\boxed{\\,?\\,}港',answer:'空',choices:['空','穴','宝']},
        {latex:'青\\boxed{\\,?\\,}',answer:'空',choices:['空','穴','宝']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 空?',correct:'穴 (hole)',wrong:['日','火']},
        {q:'In 空気 (air; atmosphere), what is the reading?',correct:'くうき',wrong:['セイ','ホン']},
        {q:'What does 空港 mean?',correct:'airport',wrong:['village chief','June']}
      ]},
    {id:'k-6708',action:'moon; month',tier:'core',dom:'l1',
      hint:'オン: ゲツ・ガツ | くん: つき | 例: 月曜日 (げつようび)',
      explain:'Crescent moon. Moon = month (one lunar cycle). Monday element.',
      latex:'月',
      blanks:[
        {latex:'\\boxed{\\,?\\,}曜日',answer:'月',choices:['月','日','明']},
        {latex:'一\\boxed{\\,?\\,}',answer:'月',choices:['月','日','明']},
        {latex:'毎\\boxed{\\,?\\,}',answer:'月',choices:['月','日','明']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 月?',correct:'月 (moon/flesh radical)',wrong:['力','扌']},
        {q:'In 月曜日 (Monday), what is the reading?',correct:'げつようび',wrong:['ニ','ウ']},
        {q:'What does 一月 mean?',correct:'January',wrong:['grassland','forest road']}
      ]},
    {id:'k-72ac',action:'dog',tier:'core',dom:'l1',
      hint:'オン: ケン | くん: いぬ | 例: 子犬 (こいぬ)',
      explain:'大 (big) + dot. A large animal — dog. Compare carefully with 大.',
      latex:'犬',
      blanks:[
        {latex:'子\\boxed{\\,?\\,}',answer:'犬',choices:['犬','大','太']},
        {latex:'\\boxed{\\,?\\,}小屋',answer:'犬',choices:['犬','大','太']},
        {latex:'番\\boxed{\\,?\\,}',answer:'犬',choices:['犬','大','太']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 犬?',correct:'大 (big)',wrong:['力','日']},
        {q:'In 子犬 (puppy), what is the reading?',correct:'こいぬ',wrong:['シャ','チュウ']},
        {q:'What does 犬小屋 mean?',correct:'doghouse',wrong:['bamboo grove','August']}
      ]},
    {id:'k-898b',action:'see; look',tier:'core',dom:'l1',
      hint:'オン: ケン | くん: み(る)・み(える)・み(せる) | 例: 花見 (はなみ)',
      explain:'Eye (目) on legs (儿). To look, to see, to show.',
      latex:'見',
      blanks:[
        {latex:'花\\boxed{\\,?\\,}',answer:'見',choices:['見','貝','覚']},
        {latex:'\\boxed{\\,?\\,}学',answer:'見',choices:['見','貝','覚']},
        {latex:'\\boxed{\\,?\\,}本',answer:'見',choices:['見','貝','覚']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 見?',correct:'目 (eye)',wrong:['力','扌']},
        {q:'In 花見 (flower viewing), what is the reading?',correct:'はなみ',wrong:['ゲツ','ニチ']},
        {q:'What does 見学 mean?',correct:'field trip',wrong:['entrance','forest road']}
      ]},
    {id:'k-4e94',action:'five',tier:'core',dom:'l1',
      hint:'オン: ゴ | くん: いつ(つ) | 例: 五月 (ごがつ)',
      explain:'Crossing strokes between two lines. Appears in months/counting.',
      latex:'五',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'五',choices:['五','四','六']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'五',choices:['五','四','六']},
        {latex:'\\boxed{\\,?\\,}人',answer:'五',choices:['五','四','六']}
      ],
      subconcepts:[
        {q:'How many strokes does 五 have?',correct:'4',wrong:['3','5']},
        {q:'In 五月 (May), what is the reading?',correct:'ごがつ',wrong:['ケン','ニュウ']},
        {q:'What does 五つ mean?',correct:'five things',wrong:['elementary school','ladle']}
      ]},
    {id:'k-53e3',action:'mouth',tier:'core',dom:'l1',
      hint:'オン: コウ・ク | くん: くち | 例: 入口 (いりぐち)',
      explain:'Pictograph of an open mouth. One of the most common radicals.',
      latex:'口',
      blanks:[
        {latex:'入\\boxed{\\,?\\,}',answer:'口',choices:['口','日','目']},
        {latex:'出\\boxed{\\,?\\,}',answer:'口',choices:['口','日','目']},
        {latex:'人\\boxed{\\,?\\,}',answer:'口',choices:['口','日','目']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 口?',correct:'口 (mouth radical)',wrong:['目','扌']},
        {q:'In 入口 (entrance), what is the reading?',correct:'いりぐち',wrong:['ダイ','ネン']},
        {q:'What does 出口 mean?',correct:'exit',wrong:['adult','teacher']}
      ]},
    {id:'k-6821',action:'school',tier:'regular',dom:'l1',
      hint:'オン: コウ | 例: 学校 (がっこう)',
      explain:'木 (tree) + 交 (cross). Wooden building where people gather — school.',
      latex:'校',
      blanks:[
        {latex:'学\\boxed{\\,?\\,}',answer:'校',choices:['校','村','板']},
        {latex:'\\boxed{\\,?\\,}長',answer:'校',choices:['校','村','板']},
        {latex:'高\\boxed{\\,?\\,}',answer:'校',choices:['校','村','板']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 校?',correct:'木 (tree)',wrong:['力','土']},
        {q:'In 学校 (school), what is the reading?',correct:'がっこう',wrong:['ド','ハク']},
        {q:'What does 校長 mean?',correct:'principal',wrong:['children','September']}
      ]},
    {id:'k-5de6',action:'left',tier:'core',dom:'l1',
      hint:'オン: サ | くん: ひだり | 例: 左手 (ひだりて)',
      explain:'Hand (ナ) + work (工). The working left hand. Pair with 右.',
      latex:'左',
      blanks:[
        {latex:'\\boxed{\\,?\\,}手',answer:'左',choices:['左','右','石']},
        {latex:'\\boxed{\\,?\\,}右',answer:'左',choices:['左','右','石']},
        {latex:'\\boxed{\\,?\\,}側',answer:'左',choices:['左','右','石']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 左?',correct:'ナ (hand)',wrong:['木','女']},
        {q:'In 左手 (left hand), what is the reading?',correct:'ひだりて',wrong:['シャ','ソク']},
        {q:'What does 左右 mean?',correct:'left and right',wrong:['May','forest']}
      ]},
    {id:'k-4e09',action:'three',tier:'core',dom:'l1',
      hint:'オン: サン | くん: みっ(つ) | 例: 三月 (さんがつ)',
      explain:'Three horizontal strokes of increasing length.',
      latex:'三',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'三',choices:['三','二','四']},
        {latex:'\\boxed{\\,?\\,}人',answer:'三',choices:['三','二','四']},
        {latex:'\\boxed{\\,?\\,}角',answer:'三',choices:['三','二','四']}
      ],
      subconcepts:[
        {q:'How many strokes does 三 have?',correct:'3',wrong:['2','4']},
        {q:'In 三月 (March), what is the reading?',correct:'さんがつ',wrong:['ケン','キン']},
        {q:'What does 三人 mean?',correct:'three people',wrong:['children','purpose']}
      ]},
    {id:'k-5c71',action:'mountain',tier:'core',dom:'l1',
      hint:'オン: サン・ザン | くん: やま | 例: 山道 (やまみち)',
      explain:'Three peaks pictograph. Also the mountain radical itself.',
      latex:'山',
      blanks:[
        {latex:'\\boxed{\\,?\\,}道',answer:'山',choices:['山','出','川']},
        {latex:'火\\boxed{\\,?\\,}',answer:'山',choices:['山','出','川']},
        {latex:'富士\\boxed{\\,?\\,}',answer:'山',choices:['山','出','川']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 山?',correct:'山 (mountain radical)',wrong:['木','扌']},
        {q:'In 山道 (mountain path), what is the reading?',correct:'やまみち',wrong:['シ','ネン']},
        {q:'What does 火山 mean?',correct:'volcano',wrong:['forest','puppy']}
      ]},
    {id:'k-5b50',action:'child',tier:'core',dom:'l1',
      hint:'オン: シ・ス | くん: こ | 例: 子供 (こども)',
      explain:'Baby with outstretched arms. Key radical in family/learning kanji.',
      latex:'子',
      blanks:[
        {latex:'\\boxed{\\,?\\,}供',answer:'子',choices:['子','字','学']},
        {latex:'女\\boxed{\\,?\\,}',answer:'子',choices:['子','字','学']},
        {latex:'男\\boxed{\\,?\\,}',answer:'子',choices:['子','字','学']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 子?',correct:'子 (child radical)',wrong:['力','氵']},
        {q:'In 子供 (children), what is the reading?',correct:'こども',wrong:['カ','チュウ']},
        {q:'What does 女子 mean?',correct:'girl/woman',wrong:['Japan','this year']}
      ]},
    {id:'k-56db',action:'four',tier:'core',dom:'l1',
      hint:'オン: シ | くん: よっ(つ)・よん | 例: 四月 (しがつ)',
      explain:'Enclosure with divided interior. Appears in months/shapes.',
      latex:'四',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'四',choices:['四','三','五']},
        {latex:'\\boxed{\\,?\\,}角',answer:'四',choices:['四','三','五']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'四',choices:['四','三','五']}
      ],
      subconcepts:[
        {q:'How many strokes does 四 have?',correct:'5',wrong:['4','6']},
        {q:'In 四月 (April), what is the reading?',correct:'しがつ',wrong:['コウ','エン']},
        {q:'What does 四角 mean?',correct:'square',wrong:['white','August']}
      ]},
    {id:'k-7cf8',action:'thread; string',tier:'regular',dom:'l1',
      hint:'オン: シ | くん: いと | 例: 毛糸 (けいと)',
      explain:'Pictograph of twisted silk. Radical for fabric/string/weaving kanji.',
      latex:'糸',
      blanks:[
        {latex:'毛\\boxed{\\,?\\,}',answer:'糸',choices:['糸','系','紙']},
        {latex:'\\boxed{\\,?\\,}口',answer:'糸',choices:['糸','系','紙']},
        {latex:'一本の\\boxed{\\,?\\,}',answer:'糸',choices:['糸','系','紙']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 糸?',correct:'糸 (thread radical)',wrong:['女','口']},
        {q:'In 毛糸 (yarn), what is the reading?',correct:'けいと',wrong:['コウ','リツ']},
        {q:'What does 糸口 mean?',correct:'clue; thread end',wrong:['skillful','October']}
      ]},
    {id:'k-5b57',action:'character; letter',tier:'regular',dom:'l1',
      hint:'オン: ジ | くん: あざ | 例: 漢字 (かんじ)',
      explain:'Child (子) under roof (宀). Given a name — character/letter.',
      latex:'字',
      blanks:[
        {latex:'漢\\boxed{\\,?\\,}',answer:'字',choices:['字','学','守']},
        {latex:'文\\boxed{\\,?\\,}',answer:'字',choices:['字','学','守']},
        {latex:'数\\boxed{\\,?\\,}',answer:'字',choices:['字','学','守']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 字?',correct:'宀 (roof)',wrong:['艹','木']},
        {q:'In 漢字 (kanji), what is the reading?',correct:'かんじ',wrong:['ジョ','ハク']},
        {q:'What does 文字 mean?',correct:'character; letter',wrong:['middle school','Monday']}
      ]},
    {id:'k-8033',action:'ear',tier:'regular',dom:'l1',
      hint:'オン: ジ | くん: みみ | 例: 耳鼻科 (じびか)',
      explain:'Pictograph of an ear. Also the ear radical itself.',
      latex:'耳',
      blanks:[
        {latex:'\\boxed{\\,?\\,}鼻科',answer:'耳',choices:['耳','目','口']},
        {latex:'早\\boxed{\\,?\\,}',answer:'耳',choices:['耳','目','口']},
        {latex:'\\boxed{\\,?\\,}元',answer:'耳',choices:['耳','目','口']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 耳?',correct:'耳 (ear radical)',wrong:['目','火']},
        {q:'In 耳鼻科 (ENT clinic), what is the reading?',correct:'じびか',wrong:['リン','シュ']},
        {q:'What does 早耳 mean?',correct:'keen ears',wrong:['automobile','Monday']}
      ]},
    {id:'k-4e03',action:'seven',tier:'core',dom:'l1',
      hint:'オン: シチ | くん: なな(つ)・なの | 例: 七月 (しちがつ)',
      explain:'Two crossing strokes. July and the Tanabata festival.',
      latex:'七',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'七',choices:['七','六','八']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'七',choices:['七','六','八']},
        {latex:'\\boxed{\\,?\\,}夕',answer:'七',choices:['七','六','八']}
      ],
      subconcepts:[
        {q:'How many strokes does 七 have?',correct:'2',wrong:['1','3']},
        {q:'In 七月 (July), what is the reading?',correct:'しちがつ',wrong:['セン','キュウ']},
        {q:'What does 七つ mean?',correct:'seven things',wrong:['round','Japan']}
      ]},
    {id:'k-8eca',action:'car; vehicle',tier:'core',dom:'l1',
      hint:'オン: シャ | くん: くるま | 例: 自動車 (じどうしゃ)',
      explain:'Cart seen from above — wheels, axle, body. Vehicle radical.',
      latex:'車',
      blanks:[
        {latex:'自動\\boxed{\\,?\\,}',answer:'車',choices:['車','軽','転']},
        {latex:'電\\boxed{\\,?\\,}',answer:'車',choices:['車','軽','転']},
        {latex:'\\boxed{\\,?\\,}道',answer:'車',choices:['車','軽','転']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 車?',correct:'車 (vehicle radical)',wrong:['女','木']},
        {q:'In 自動車 (automobile), what is the reading?',correct:'じどうしゃ',wrong:['ジョウ','シュツ']},
        {q:'What does 電車 mean?',correct:'train',wrong:['music','weather']}
      ]},
    {id:'k-624b',action:'hand',tier:'core',dom:'l1',
      hint:'オン: シュ | くん: て・た | 例: 右手 (みぎて)',
      explain:'Hand with fingers. Radical form 扌 on the left of action verbs.',
      latex:'手',
      blanks:[
        {latex:'右\\boxed{\\,?\\,}',answer:'手',choices:['手','足','牛']},
        {latex:'\\boxed{\\,?\\,}紙',answer:'手',choices:['手','足','牛']},
        {latex:'上\\boxed{\\,?\\,}',answer:'手',choices:['手','足','牛']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 手?',correct:'手 (hand radical)',wrong:['木','氵']},
        {q:'In 右手 (right hand), what is the reading?',correct:'みぎて',wrong:['チュウ','セイ']},
        {q:'What does 手紙 mean?',correct:'letter',wrong:['Japan','seashell']}
      ]},
    {id:'k-5341',action:'ten',tier:'core',dom:'l1',
      hint:'オン: ジュウ・ジッ | くん: とお・と | 例: 十月 (じゅうがつ)',
      explain:'Cross shape. Base of the decimal system. October.',
      latex:'十',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'十',choices:['十','九','千']},
        {latex:'\\boxed{\\,?\\,}分',answer:'十',choices:['十','九','千']},
        {latex:'二\\boxed{\\,?\\,}',answer:'十',choices:['十','九','千']}
      ],
      subconcepts:[
        {q:'How many strokes does 十 have?',correct:'2',wrong:['1','3']},
        {q:'In 十月 (October), what is the reading?',correct:'じゅうがつ',wrong:['キュウ','セキ']},
        {q:'What does 十分 mean?',correct:'enough',wrong:['right hand','white']}
      ]},
    {id:'k-51fa',action:'exit; go out; put out',tier:'regular',dom:'l1',
      hint:'オン: シュツ・スイ | くん: で(る)・だ(す) | 例: 出口 (でぐち)',
      explain:'Stacked mountain shapes — emerging, going out. Opposite of 入.',
      latex:'出',
      blanks:[
        {latex:'\\boxed{\\,?\\,}口',answer:'出',choices:['出','入','山']},
        {latex:'\\boxed{\\,?\\,}発',answer:'出',choices:['出','入','山']},
        {latex:'\\boxed{\\,?\\,}す',answer:'出',choices:['出','入','山']}
      ],
      subconcepts:[
        {q:'How many strokes does 出 have?',correct:'5',wrong:['4','6']},
        {q:'In 出口 (exit), what is the reading?',correct:'でぐち',wrong:['シャ','サ']},
        {q:'What does 出発 mean?',correct:'departure',wrong:['July','bamboo grove']}
      ]},
    {id:'k-5973',action:'woman',tier:'core',dom:'l1',
      hint:'オン: ジョ・ニョ | くん: おんな・め | 例: 女子 (じょし)',
      explain:'Pictograph of kneeling figure. Common radical in family kanji.',
      latex:'女',
      blanks:[
        {latex:'\\boxed{\\,?\\,}子',answer:'女',choices:['女','男','母']},
        {latex:'\\boxed{\\,?\\,}性',answer:'女',choices:['女','男','母']},
        {latex:'\\boxed{\\,?\\,}の子',answer:'女',choices:['女','男','母']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 女?',correct:'女 (woman radical)',wrong:['火','土']},
        {q:'In 女子 (girl/woman), what is the reading?',correct:'じょし',wrong:['ジ','スイ']},
        {q:'What does 女性 mean?',correct:'female',wrong:['Japan','Wednesday']}
      ]},
    {id:'k-5c0f',action:'small; little',tier:'core',dom:'l1',
      hint:'オン: ショウ | くん: ちい(さい)・こ・お | 例: 小学校 (しょうがっこう)',
      explain:'A vertical line being divided — something small. Opposite of 大.',
      latex:'小',
      blanks:[
        {latex:'\\boxed{\\,?\\,}学校',answer:'小',choices:['小','大','少']},
        {latex:'\\boxed{\\,?\\,}さい',answer:'小',choices:['小','大','少']},
        {latex:'\\boxed{\\,?\\,}鳥',answer:'小',choices:['小','大','少']}
      ],
      subconcepts:[
        {q:'How many strokes does 小 have?',correct:'3',wrong:['2','4']},
        {q:'In 小学校 (elementary school), what is the reading?',correct:'しょうがっこう',wrong:['スイ','テン']},
        {q:'What does 小さい mean?',correct:'small',wrong:['heavy rain','left hand']}
      ]},
    {id:'k-4e0a',action:'above; up; on top',tier:'core',dom:'l1',
      hint:'オン: ジョウ・ショウ | くん: うえ・あ(がる)・のぼ(る) | 例: 上手 (じょうず)',
      explain:'Indicator pointing upward above a baseline. Opposite of 下.',
      latex:'上',
      blanks:[
        {latex:'\\boxed{\\,?\\,}手',answer:'上',choices:['上','下','止']},
        {latex:'\\boxed{\\,?\\,}下',answer:'上',choices:['上','下','止']},
        {latex:'以\\boxed{\\,?\\,}',answer:'上',choices:['上','下','止']}
      ],
      subconcepts:[
        {q:'How many strokes does 上 have?',correct:'3',wrong:['2','4']},
        {q:'In 上手 (skillful), what is the reading?',correct:'じょうず',wrong:['ガク','セン']},
        {q:'What does 上下 mean?',correct:'up and down',wrong:['entrance','right hand']}
      ]},
    {id:'k-68ee',action:'forest',tier:'regular',dom:'l1',
      hint:'オン: シン | くん: もり | 例: 森林 (しんりん)',
      explain:'Three trees (木×3). Denser than 林 (grove). 木→林→森.',
      latex:'森',
      blanks:[
        {latex:'\\boxed{\\,?\\,}林',answer:'森',choices:['森','林','木']},
        {latex:'\\boxed{\\,?\\,}の中',answer:'森',choices:['森','林','木']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 森?',correct:'木 (tree ×3)',wrong:['目','火']},
        {q:'In 森林 (forest), what is the reading?',correct:'しんりん',wrong:['ネン','チク']},
        {q:'What does 森の中 mean?',correct:'in the forest',wrong:['round','Wednesday']}
      ]},
    {id:'k-4eba',action:'person',tier:'core',dom:'l1',
      hint:'オン: ジン・ニン | くん: ひと | 例: 大人 (おとな)',
      explain:'Standing person. Radical 亻 on the left of person-related kanji.',
      latex:'人',
      blanks:[
        {latex:'大\\boxed{\\,?\\,}',answer:'人',choices:['人','入','大']},
        {latex:'日本\\boxed{\\,?\\,}',answer:'人',choices:['人','入','大']},
        {latex:'\\boxed{\\,?\\,}口',answer:'人',choices:['人','入','大']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 人?',correct:'人 (person radical)',wrong:['艹','木']},
        {q:'In 大人 (adult), what is the reading?',correct:'おとな',wrong:['ロク','ギョク']},
        {q:'What does 日本人 mean?',correct:'Japanese person',wrong:['Monday','forest road']}
      ]},
    {id:'k-6c34',action:'water',tier:'core',dom:'l1',
      hint:'オン: スイ | くん: みず | 例: 水曜日 (すいようび)',
      explain:'Flowing water pictograph. Radical 氵 on the left. Wednesday element.',
      latex:'水',
      blanks:[
        {latex:'\\boxed{\\,?\\,}曜日',answer:'水',choices:['水','火','氷']},
        {latex:'\\boxed{\\,?\\,}道',answer:'水',choices:['水','火','氷']},
        {latex:'\\boxed{\\,?\\,}泳',answer:'水',choices:['水','火','氷']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 水?',correct:'水 (water radical)',wrong:['火','木']},
        {q:'In 水曜日 (Wednesday), what is the reading?',correct:'すいようび',wrong:['シュ','ソン']},
        {q:'What does 水道 mean?',correct:'water supply',wrong:['teacher','name']}
      ]},
    {id:'k-6b63',action:'correct; right; proper',tier:'regular',dom:'l1',
      hint:'オン: セイ・ショウ | くん: ただ(しい)・まさ | 例: 正しい (ただしい)',
      explain:'一 (one) + 止 (stop). Stop at one way — the correct way.',
      latex:'正',
      blanks:[
        {latex:'\\boxed{\\,?\\,}しい',answer:'正',choices:['正','止','生']},
        {latex:'\\boxed{\\,?\\,}月',answer:'正',choices:['正','止','生']},
        {latex:'\\boxed{\\,?\\,}解',answer:'正',choices:['正','止','生']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 正?',correct:'一 (one)',wrong:['口','日']},
        {q:'In 正しい (correct), what is the reading?',correct:'ただしい',wrong:['リン','カ']},
        {q:'What does 正月 mean?',correct:'New Year',wrong:['100 yen','right hand']}
      ]},
    {id:'k-751f',action:'life; birth; raw',tier:'core',dom:'l1',
      hint:'オン: セイ・ショウ | くん: い(きる)・う(まれる)・なま | 例: 学生 (がくせい)',
      explain:'Plant sprouting from ground. Life, birth, raw, student.',
      latex:'生',
      blanks:[
        {latex:'学\\boxed{\\,?\\,}',answer:'生',choices:['生','正','牛']},
        {latex:'先\\boxed{\\,?\\,}',answer:'生',choices:['生','正','牛']},
        {latex:'\\boxed{\\,?\\,}活',answer:'生',choices:['生','正','牛']}
      ],
      subconcepts:[
        {q:'How many strokes does 生 have?',correct:'5',wrong:['4','6']},
        {q:'In 学生 (student), what is the reading?',correct:'がくせい',wrong:['ゲツ','セン']},
        {q:'What does 先生 mean?',correct:'teacher',wrong:['flower viewing','August']}
      ]},
    {id:'k-9752',action:'blue; green',tier:'regular',dom:'l1',
      hint:'オン: セイ・ショウ | くん: あお(い) | 例: 青空 (あおぞら)',
      explain:'Growth over moon — the blue-green of living things.',
      latex:'青',
      blanks:[
        {latex:'\\boxed{\\,?\\,}空',answer:'青',choices:['青','赤','白']},
        {latex:'\\boxed{\\,?\\,}年',answer:'青',choices:['青','赤','白']},
        {latex:'\\boxed{\\,?\\,}い',answer:'青',choices:['青','赤','白']}
      ],
      subconcepts:[
        {q:'How many strokes does 青 have?',correct:'8',wrong:['7','9']},
        {q:'In 青空 (blue sky), what is the reading?',correct:'あおぞら',wrong:['キン','ブン']},
        {q:'What does 青年 mean?',correct:'young person',wrong:['adult','mountain path']}
      ]},
    {id:'k-5915',action:'evening',tier:'regular',dom:'l1',
      hint:'オン: セキ | くん: ゆう | 例: 夕方 (ゆうがた)',
      explain:'Crescent moon pictograph — evening time. Compare with 月.',
      latex:'夕',
      blanks:[
        {latex:'\\boxed{\\,?\\,}方',answer:'夕',choices:['夕','月','外']},
        {latex:'\\boxed{\\,?\\,}日',answer:'夕',choices:['夕','月','外']},
        {latex:'\\boxed{\\,?\\,}食',answer:'夕',choices:['夕','月','外']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 夕?',correct:'夕 (evening crescent)',wrong:['氵','目']},
        {q:'In 夕方 (evening), what is the reading?',correct:'ゆうがた',wrong:['ニ','バイ']},
        {q:'What does 夕日 mean?',correct:'evening sun',wrong:['boy; male','September']}
      ]},
    {id:'k-77f3',action:'stone; rock',tier:'regular',dom:'l1',
      hint:'オン: セキ・シャク | くん: いし | 例: 石橋 (いしばし)',
      explain:'Cliff (厂) with rock (口) beneath. Stone/rock radical.',
      latex:'石',
      blanks:[
        {latex:'\\boxed{\\,?\\,}橋',answer:'石',choices:['石','右','岩']},
        {latex:'宝\\boxed{\\,?\\,}',answer:'石',choices:['石','右','岩']},
        {latex:'化\\boxed{\\,?\\,}',answer:'石',choices:['石','右','岩']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 石?',correct:'厂 (cliff)',wrong:['田','口']},
        {q:'In 石橋 (stone bridge), what is the reading?',correct:'いしばし',wrong:['シュツ','カ']},
        {q:'What does 宝石 mean?',correct:'jewel',wrong:['forest road','entrance']}
      ]},
    {id:'k-8d64',action:'red',tier:'regular',dom:'l1',
      hint:'オン: セキ・シャク | くん: あか(い) | 例: 赤ちゃん (あかちゃん)',
      explain:'Earth + fire bottom — heated red glow. Color kanji.',
      latex:'赤',
      blanks:[
        {latex:'\\boxed{\\,?\\,}ちゃん',answer:'赤',choices:['赤','青','白']},
        {latex:'\\boxed{\\,?\\,}い',answer:'赤',choices:['赤','青','白']},
        {latex:'\\boxed{\\,?\\,}字',answer:'赤',choices:['赤','青','白']}
      ],
      subconcepts:[
        {q:'How many strokes does 赤 have?',correct:'7',wrong:['6','8']},
        {q:'In 赤ちゃん (baby), what is the reading?',correct:'あかちゃん',wrong:['ケン','チョウ']},
        {q:'What does 赤い mean?',correct:'red',wrong:['music','Japan']}
      ]},
    {id:'k-5343',action:'thousand',tier:'core',dom:'l1',
      hint:'オン: セン | くん: ち | 例: 千円 (せんえん)',
      explain:'Modified 十 — thousand. Number system: 十→百→千.',
      latex:'千',
      blanks:[
        {latex:'\\boxed{\\,?\\,}円',answer:'千',choices:['千','十','百']},
        {latex:'\\boxed{\\,?\\,}人',answer:'千',choices:['千','十','百']},
        {latex:'三\\boxed{\\,?\\,}',answer:'千',choices:['千','十','百']}
      ],
      subconcepts:[
        {q:'How many strokes does 千 have?',correct:'3',wrong:['2','4']},
        {q:'In 千円 (1000 yen), what is the reading?',correct:'せんえん',wrong:['ダイ','セキ']},
        {q:'What does 千人 mean?',correct:'1000 people',wrong:['this year','forest']}
      ]},
    {id:'k-5ddd',action:'river',tier:'core',dom:'l1',
      hint:'オン: セン | くん: かわ | 例: 小川 (おがわ)',
      explain:'Three flowing lines — a river between banks. River radical.',
      latex:'川',
      blanks:[
        {latex:'小\\boxed{\\,?\\,}',answer:'川',choices:['川','山','州']},
        {latex:'\\boxed{\\,?\\,}上',answer:'川',choices:['川','山','州']},
        {latex:'山\\boxed{\\,?\\,}',answer:'川',choices:['川','山','州']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 川?',correct:'川 (river radical)',wrong:['亻','力']},
        {q:'In 小川 (stream), what is the reading?',correct:'おがわ',wrong:['モク','カ']},
        {q:'What does 川上 mean?',correct:'upstream',wrong:['adult','right hand']}
      ]},
    {id:'k-5148',action:'ahead; before; previous',tier:'regular',dom:'l1',
      hint:'オン: セン | くん: さき・ま(ず) | 例: 先生 (せんせい)',
      explain:'Legs (儿) going forward — ahead. 先生 = one who lived before.',
      latex:'先',
      blanks:[
        {latex:'\\boxed{\\,?\\,}生',answer:'先',choices:['先','千','光']},
        {latex:'\\boxed{\\,?\\,}月',answer:'先',choices:['先','千','光']},
        {latex:'\\boxed{\\,?\\,}日',answer:'先',choices:['先','千','光']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 先?',correct:'儿 (legs)',wrong:['扌','艹']},
        {q:'In 先生 (teacher), what is the reading?',correct:'せんせい',wrong:['キュウ','ウ']},
        {q:'What does 先月 mean?',correct:'last month',wrong:['one day','to be enough']}
      ]},
    {id:'k-65e9',action:'early; fast',tier:'regular',dom:'l1',
      hint:'オン: ソウ・サッ | くん: はや(い) | 例: 早起き (はやおき)',
      explain:'Sun (日) + cross (十). Sun barely up — early morning.',
      latex:'早',
      blanks:[
        {latex:'\\boxed{\\,?\\,}起き',answer:'早',choices:['早','草','朝']},
        {latex:'\\boxed{\\,?\\,}い',answer:'早',choices:['早','草','朝']},
        {latex:'\\boxed{\\,?\\,}朝',answer:'早',choices:['早','草','朝']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 早?',correct:'日 (sun)',wrong:['木','亻']},
        {q:'In 早起き (early rising), what is the reading?',correct:'はやおき',wrong:['クウ','ホン']},
        {q:'What does 早い mean?',correct:'early; fast',wrong:['blue sky','school']}
      ]},
    {id:'k-8349',action:'grass',tier:'regular',dom:'l1',
      hint:'オン: ソウ | くん: くさ | 例: 草原 (そうげん)',
      explain:'艹 (grass) + 早 (early). Early-growing plant — grass.',
      latex:'草',
      blanks:[
        {latex:'\\boxed{\\,?\\,}原',answer:'草',choices:['草','花','苗']},
        {latex:'\\boxed{\\,?\\,}花',answer:'草',choices:['草','花','苗']},
        {latex:'雑\\boxed{\\,?\\,}',answer:'草',choices:['草','花','苗']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 草?',correct:'艹 (grass radical)',wrong:['亻','土']},
        {q:'In 草原 (grassland), what is the reading?',correct:'そうげん',wrong:['ダン','サン']},
        {q:'What does 草花 mean?',correct:'flowering plant',wrong:['Saturday','right hand']}
      ]},
    {id:'k-8db3',action:'foot; leg; enough',tier:'core',dom:'l1',
      hint:'オン: ソク | くん: あし・た(りる) | 例: 足りる (たりる)',
      explain:'Leg and foot pictograph. Also means "enough" (足りる).',
      latex:'足',
      blanks:[
        {latex:'\\boxed{\\,?\\,}りる',answer:'足',choices:['足','手','走']},
        {latex:'遠\\boxed{\\,?\\,}',answer:'足',choices:['足','手','走']},
        {latex:'\\boxed{\\,?\\,}元',answer:'足',choices:['足','手','走']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 足?',correct:'足 (foot radical)',wrong:['土','子']},
        {q:'In 足りる (to be enough), what is the reading?',correct:'たりる',wrong:['モク','シ']},
        {q:'What does 遠足 mean?',correct:'excursion',wrong:['early rising','adult']}
      ]},
    {id:'k-6751',action:'village',tier:'regular',dom:'l1',
      hint:'オン: ソン | くん: むら | 例: 村長 (そんちょう)',
      explain:'木 (tree) + 寸 (measure). A settlement measured out among trees.',
      latex:'村',
      blanks:[
        {latex:'\\boxed{\\,?\\,}長',answer:'村',choices:['村','町','林']},
        {latex:'\\boxed{\\,?\\,}人',answer:'村',choices:['村','町','林']},
        {latex:'\\boxed{\\,?\\,}落',answer:'村',choices:['村','町','林']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 村?',correct:'木 (tree)',wrong:['火','田']},
        {q:'In 村長 (village chief), what is the reading?',correct:'そんちょう',wrong:['セイ','キュウ']},
        {q:'What does 村人 mean?',correct:'villager',wrong:['money','right hand']}
      ]},
    {id:'k-5927',action:'big; large',tier:'core',dom:'l1',
      hint:'オン: ダイ・タイ | くん: おお(きい) | 例: 大人 (おとな)',
      explain:'Person with arms wide — big. Compare: 犬 (dog) has a dot.',
      latex:'大',
      blanks:[
        {latex:'\\boxed{\\,?\\,}人',answer:'大',choices:['大','犬','太']},
        {latex:'\\boxed{\\,?\\,}学',answer:'大',choices:['大','犬','太']},
        {latex:'\\boxed{\\,?\\,}きい',answer:'大',choices:['大','犬','太']}
      ],
      subconcepts:[
        {q:'How many strokes does 大 have?',correct:'3',wrong:['2','4']},
        {q:'In 大人 (adult), what is the reading?',correct:'おとな',wrong:['リョク','ケン']},
        {q:'What does 大学 mean?',correct:'university',wrong:['grassland','Monday']}
      ]},
    {id:'k-7537',action:'man; male',tier:'core',dom:'l1',
      hint:'オン: ダン・ナン | くん: おとこ | 例: 男子 (だんし)',
      explain:'Field (田) + power (力). One who works the fields — man.',
      latex:'男',
      blanks:[
        {latex:'\\boxed{\\,?\\,}子',answer:'男',choices:['男','女','力']},
        {latex:'\\boxed{\\,?\\,}性',answer:'男',choices:['男','女','力']},
        {latex:'\\boxed{\\,?\\,}の子',answer:'男',choices:['男','女','力']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 男?',correct:'田 (rice field)',wrong:['艹','目']},
        {q:'In 男子 (boy; male), what is the reading?',correct:'だんし',wrong:['ソウ','バイ']},
        {q:'What does 男性 mean?',correct:'male',wrong:['this year','strong person']}
      ]},
    {id:'k-7af9',action:'bamboo',tier:'regular',dom:'l1',
      hint:'オン: チク | くん: たけ | 例: 竹林 (ちくりん)',
      explain:'Pictograph of bamboo leaves. Radical ⺮ tops many utensil kanji.',
      latex:'竹',
      blanks:[
        {latex:'\\boxed{\\,?\\,}林',answer:'竹',choices:['竹','木','草']},
        {latex:'\\boxed{\\,?\\,}の子',answer:'竹',choices:['竹','木','草']},
        {latex:'\\boxed{\\,?\\,}馬',answer:'竹',choices:['竹','木','草']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 竹?',correct:'竹 (bamboo radical)',wrong:['目','田']},
        {q:'In 竹林 (bamboo grove), what is the reading?',correct:'ちくりん',wrong:['キュウ','シチ']},
        {q:'What does 竹の子 mean?',correct:'bamboo shoot',wrong:['to be enough','round']}
      ]},
    {id:'k-4e2d',action:'middle; inside; during',tier:'core',dom:'l1',
      hint:'オン: チュウ | くん: なか | 例: 中学校 (ちゅうがっこう)',
      explain:'Line through center of box. Middle, inside, during.',
      latex:'中',
      blanks:[
        {latex:'\\boxed{\\,?\\,}学校',answer:'中',choices:['中','虫','申']},
        {latex:'日\\boxed{\\,?\\,}',answer:'中',choices:['中','虫','申']},
        {latex:'\\boxed{\\,?\\,}間',answer:'中',choices:['中','虫','申']}
      ],
      subconcepts:[
        {q:'How many strokes does 中 have?',correct:'4',wrong:['3','5']},
        {q:'In 中学校 (middle school), what is the reading?',correct:'ちゅうがっこう',wrong:['ジョウ','ニチ']},
        {q:'What does 日中 mean?',correct:'daytime; Japan-China',wrong:['elementary school','July']}
      ]},
    {id:'k-866b',action:'insect; bug',tier:'regular',dom:'l1',
      hint:'オン: チュウ | くん: むし | 例: 昆虫 (こんちゅう)',
      explain:'Worm/insect pictograph. Radical for creature kanji.',
      latex:'虫',
      blanks:[
        {latex:'昆\\boxed{\\,?\\,}',answer:'虫',choices:['虫','中','風']},
        {latex:'\\boxed{\\,?\\,}歯',answer:'虫',choices:['虫','中','風']},
        {latex:'毛\\boxed{\\,?\\,}',answer:'虫',choices:['虫','中','風']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 虫?',correct:'虫 (insect radical)',wrong:['扌','女']},
        {q:'In 昆虫 (insect), what is the reading?',correct:'こんちゅう',wrong:['テン','エン']},
        {q:'What does 虫歯 mean?',correct:'cavity',wrong:['right hand','August']}
      ]},
    {id:'k-753a',action:'town',tier:'regular',dom:'l1',
      hint:'オン: チョウ | くん: まち | 例: 町長 (ちょうちょう)',
      explain:'田 (field) + 丁 (block). A settled area with fields — town.',
      latex:'町',
      blanks:[
        {latex:'\\boxed{\\,?\\,}長',answer:'町',choices:['町','村','街']},
        {latex:'\\boxed{\\,?\\,}中',answer:'町',choices:['町','村','街']},
        {latex:'下\\boxed{\\,?\\,}',answer:'町',choices:['町','村','街']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 町?',correct:'田 (rice field)',wrong:['土','亻']},
        {q:'In 町長 (town mayor), what is the reading?',correct:'ちょうちょう',wrong:['ジ','エン']},
        {q:'What does 町中 mean?',correct:'downtown',wrong:['stone bridge','fireworks']}
      ]},
    {id:'k-5929',action:'heaven; sky',tier:'core',dom:'l1',
      hint:'オン: テン | くん: あめ・あま | 例: 天気 (てんき)',
      explain:'Line above 大 (big). What\'s above a person — heaven, sky.',
      latex:'天',
      blanks:[
        {latex:'\\boxed{\\,?\\,}気',answer:'天',choices:['天','大','犬']},
        {latex:'\\boxed{\\,?\\,}国',answer:'天',choices:['天','大','犬']},
        {latex:'\\boxed{\\,?\\,}才',answer:'天',choices:['天','大','犬']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 天?',correct:'大 (big)',wrong:['力','日']},
        {q:'In 天気 (weather), what is the reading?',correct:'てんき',wrong:['ウ','ダン']},
        {q:'What does 天国 mean?',correct:'heaven/paradise',wrong:['king','August']}
      ]},
    {id:'k-7530',action:'rice field',tier:'core',dom:'l1',
      hint:'オン: デン | くん: た | 例: 田んぼ (たんぼ)',
      explain:'Divided rice paddy seen from above. Common radical.',
      latex:'田',
      blanks:[
        {latex:'\\boxed{\\,?\\,}んぼ',answer:'田',choices:['田','甲','由']},
        {latex:'\\boxed{\\,?\\,}舎',answer:'田',choices:['田','甲','由']},
        {latex:'水\\boxed{\\,?\\,}',answer:'田',choices:['田','甲','由']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 田?',correct:'田 (field radical)',wrong:['目','木']},
        {q:'In 田んぼ (rice paddy), what is the reading?',correct:'たんぼ',wrong:['ハチ','シン']},
        {q:'What does 田舎 mean?',correct:'countryside',wrong:['elementary school','round']}
      ]},
    {id:'k-571f',action:'earth; soil; ground',tier:'core',dom:'l1',
      hint:'オン: ド・ト | くん: つち | 例: 土曜日 (どようび)',
      explain:'Cross rising from ground — earth. Saturday element. Compare 士.',
      latex:'土',
      blanks:[
        {latex:'\\boxed{\\,?\\,}曜日',answer:'土',choices:['土','士','王']},
        {latex:'\\boxed{\\,?\\,}地',answer:'土',choices:['土','士','王']},
        {latex:'\\boxed{\\,?\\,}台',answer:'土',choices:['土','士','王']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 土?',correct:'土 (earth radical)',wrong:['亻','日']},
        {q:'In 土曜日 (Saturday), what is the reading?',correct:'どようび',wrong:['カ','イチ']},
        {q:'What does 土地 mean?',correct:'land',wrong:['ENT clinic','forest']}
      ]},
    {id:'k-4e8c',action:'two',tier:'core',dom:'l1',
      hint:'オン: ニ | くん: ふた(つ) | 例: 二月 (にがつ)',
      explain:'Two horizontal strokes. February and counting.',
      latex:'二',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'二',choices:['二','一','三']},
        {latex:'\\boxed{\\,?\\,}人',answer:'二',choices:['二','一','三']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'二',choices:['二','一','三']}
      ],
      subconcepts:[
        {q:'How many strokes does 二 have?',correct:'2',wrong:['1','3']},
        {q:'In 二月 (February), what is the reading?',correct:'にがつ',wrong:['コウ','カ']},
        {q:'What does 二人 mean?',correct:'two people',wrong:['entrance','March']}
      ]},
    {id:'k-65e5',action:'sun; day',tier:'core',dom:'l1',
      hint:'オン: ニチ・ジツ | くん: ひ・か | 例: 日本 (にほん)',
      explain:'Sun pictograph. Sun, day, Japan. Sunday element.',
      latex:'日',
      blanks:[
        {latex:'\\boxed{\\,?\\,}本',answer:'日',choices:['日','月','目']},
        {latex:'\\boxed{\\,?\\,}曜日',answer:'日',choices:['日','月','目']},
        {latex:'毎\\boxed{\\,?\\,}',answer:'日',choices:['日','月','目']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 日?',correct:'日 (sun radical)',wrong:['力','火']},
        {q:'In 日本 (Japan), what is the reading?',correct:'にほん',wrong:['ハチ','コウ']},
        {q:'What does 日曜日 mean?',correct:'Sunday',wrong:['Saturday','Japan']}
      ]},
    {id:'k-5165',action:'enter; put in',tier:'core',dom:'l1',
      hint:'オン: ニュウ | くん: い(る)・はい(る)・い(れる) | 例: 入口 (いりぐち)',
      explain:'Shape pointing inward — enter. Compare carefully with 人.',
      latex:'入',
      blanks:[
        {latex:'\\boxed{\\,?\\,}口',answer:'入',choices:['入','人','出']},
        {latex:'\\boxed{\\,?\\,}学',answer:'入',choices:['入','人','出']},
        {latex:'\\boxed{\\,?\\,}れる',answer:'入',choices:['入','人','出']}
      ],
      subconcepts:[
        {q:'How many strokes does 入 have?',correct:'2',wrong:['1','3']},
        {q:'In 入口 (entrance), what is the reading?',correct:'いりぐち',wrong:['ニ','ハチ']},
        {q:'What does 入学 mean?',correct:'enrollment',wrong:['October','heavy rain']}
      ]},
    {id:'k-5e74',action:'year',tier:'core',dom:'l1',
      hint:'オン: ネン | くん: とし | 例: 今年 (ことし)',
      explain:'Grain harvest cycle — one full year of seasons.',
      latex:'年',
      blanks:[
        {latex:'今\\boxed{\\,?\\,}',answer:'年',choices:['年','午','牛']},
        {latex:'来\\boxed{\\,?\\,}',answer:'年',choices:['年','午','牛']},
        {latex:'学\\boxed{\\,?\\,}',answer:'年',choices:['年','午','牛']}
      ],
      subconcepts:[
        {q:'How many strokes does 年 have?',correct:'6',wrong:['5','7']},
        {q:'In 今年 (this year), what is the reading?',correct:'ことし',wrong:['シン','オン']},
        {q:'What does 来年 mean?',correct:'next year',wrong:['girl/woman','April']}
      ]},
    {id:'k-767d',action:'white',tier:'core',dom:'l1',
      hint:'オン: ハク・ビャク | くん: しろ(い) | 例: 白い (しろい)',
      explain:'Ray of light from the sun — white, pure. Compare: 日+stroke on top.',
      latex:'白',
      blanks:[
        {latex:'\\boxed{\\,?\\,}い',answer:'白',choices:['白','日','百']},
        {latex:'\\boxed{\\,?\\,}黒',answer:'白',choices:['白','日','百']},
        {latex:'\\boxed{\\,?\\,}紙',answer:'白',choices:['白','日','百']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 白?',correct:'白 (white radical)',wrong:['木','氵']},
        {q:'In 白い (white), what is the reading?',correct:'しろい',wrong:['サン','リン']},
        {q:'What does 白黒 mean?',correct:'black and white',wrong:['right hand','May']}
      ]},
    {id:'k-516b',action:'eight',tier:'core',dom:'l1',
      hint:'オン: ハチ | くん: やっ(つ)・よう | 例: 八月 (はちがつ)',
      explain:'Two strokes spreading apart. August and counting.',
      latex:'八',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'八',choices:['八','六','九']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'八',choices:['八','六','九']},
        {latex:'\\boxed{\\,?\\,}百屋',answer:'八',choices:['八','六','九']}
      ],
      subconcepts:[
        {q:'How many strokes does 八 have?',correct:'2',wrong:['1','3']},
        {q:'In 八月 (August), what is the reading?',correct:'はちがつ',wrong:['リョク','シ']},
        {q:'What does 八つ mean?',correct:'eight things',wrong:['bamboo grove','seashell']}
      ]},
    {id:'k-767e',action:'hundred',tier:'core',dom:'l1',
      hint:'オン: ヒャク | くん: もも | 例: 百円 (ひゃくえん)',
      explain:'一 (one) + 白 (white). Number system: 十→百→千.',
      latex:'百',
      blanks:[
        {latex:'\\boxed{\\,?\\,}円',answer:'百',choices:['百','白','千']},
        {latex:'\\boxed{\\,?\\,}人',answer:'百',choices:['百','白','千']},
        {latex:'三\\boxed{\\,?\\,}',answer:'百',choices:['百','白','千']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 百?',correct:'一 (one top)',wrong:['目','口']},
        {q:'In 百円 (100 yen), what is the reading?',correct:'ひゃくえん',wrong:['ブン','ニチ']},
        {q:'What does 百人 mean?',correct:'100 people',wrong:['teacher','ladle']}
      ]},
    {id:'k-6587',action:'writing; sentence; text',tier:'regular',dom:'l1',
      hint:'オン: ブン・モン | くん: ふみ | 例: 文字 (もじ)',
      explain:'Crossed lines — pattern, writing, literature, sentence.',
      latex:'文',
      blanks:[
        {latex:'\\boxed{\\,?\\,}字',answer:'文',choices:['文','字','本']},
        {latex:'\\boxed{\\,?\\,}化',answer:'文',choices:['文','字','本']},
        {latex:'作\\boxed{\\,?\\,}',answer:'文',choices:['文','字','本']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 文?',correct:'文 (writing radical)',wrong:['木','田']},
        {q:'In 文字 (character), what is the reading?',correct:'もじ',wrong:['カ','ソウ']},
        {q:'What does 文化 mean?',correct:'culture',wrong:['kanji','Saturday']}
      ]},
    {id:'k-6728',action:'tree; wood',tier:'core',dom:'l1',
      hint:'オン: モク・ボク | くん: き・こ | 例: 木曜日 (もくようび)',
      explain:'Trunk, branches, roots. Thursday element. 木→林→森 density.',
      latex:'木',
      blanks:[
        {latex:'\\boxed{\\,?\\,}曜日',answer:'木',choices:['木','林','森']},
        {latex:'大\\boxed{\\,?\\,}',answer:'木',choices:['木','林','森']},
        {latex:'\\boxed{\\,?\\,}造',answer:'木',choices:['木','林','森']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 木?',correct:'木 (tree radical)',wrong:['目','扌']},
        {q:'In 木曜日 (Thursday), what is the reading?',correct:'もくようび',wrong:['ギョク','モク']},
        {q:'What does 大木 mean?',correct:'large tree',wrong:['stream','children']}
      ]},
    {id:'k-672c',action:'book; origin; true',tier:'core',dom:'l1',
      hint:'オン: ホン | くん: もと | 例: 日本 (にほん)',
      explain:'木 (tree) + root mark. The origin, the real thing. Also: book.',
      latex:'本',
      blanks:[
        {latex:'日\\boxed{\\,?\\,}',answer:'本',choices:['本','木','体']},
        {latex:'\\boxed{\\,?\\,}当',answer:'本',choices:['本','木','体']},
        {latex:'\\boxed{\\,?\\,}屋',answer:'本',choices:['本','木','体']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 本?',correct:'木 (tree)',wrong:['艹','女']},
        {q:'In 日本 (Japan), what is the reading?',correct:'にほん',wrong:['コウ','セン']},
        {q:'What does 本当 mean?',correct:'really; true',wrong:['adult','Japan']}
      ]},
    {id:'k-540d',action:'name; fame',tier:'regular',dom:'l1',
      hint:'オン: メイ・ミョウ | くん: な | 例: 名前 (なまえ)',
      explain:'夕 (evening) + 口 (mouth). Calling your name in the dark.',
      latex:'名',
      blanks:[
        {latex:'\\boxed{\\,?\\,}前',answer:'名',choices:['名','夕','外']},
        {latex:'\\boxed{\\,?\\,}人',answer:'名',choices:['名','夕','外']},
        {latex:'有\\boxed{\\,?\\,}',answer:'名',choices:['名','夕','外']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 名?',correct:'夕 (evening)',wrong:['氵','子']},
        {q:'In 名前 (name), what is the reading?',correct:'なまえ',wrong:['ジュウ','カ']},
        {q:'What does 名人 mean?',correct:'master; expert',wrong:['puppy','to be enough']}
      ]},
    {id:'k-76ee',action:'eye',tier:'core',dom:'l1',
      hint:'オン: モク・ボク | くん: め・ま | 例: 目的 (もくてき)',
      explain:'Sideways eye pictograph. Wider than 日 with more inner lines.',
      latex:'目',
      blanks:[
        {latex:'\\boxed{\\,?\\,}的',answer:'目',choices:['目','日','見']},
        {latex:'\\boxed{\\,?\\,}玉',answer:'目',choices:['目','日','見']},
        {latex:'科\\boxed{\\,?\\,}',answer:'目',choices:['目','日','見']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 目?',correct:'目 (eye radical)',wrong:['氵','女']},
        {q:'In 目的 (purpose), what is the reading?',correct:'もくてき',wrong:['ソン','シン']},
        {q:'What does 目玉 mean?',correct:'eyeball',wrong:['round','baby']}
      ]},
    {id:'k-7acb',action:'stand; establish',tier:'regular',dom:'l1',
      hint:'オン: リツ・リュウ | くん: た(つ)・た(てる) | 例: 立つ (たつ)',
      explain:'Person standing on ground. Standing radical.',
      latex:'立',
      blanks:[
        {latex:'\\boxed{\\,?\\,}つ',answer:'立',choices:['立','音','辛']},
        {latex:'国\\boxed{\\,?\\,}',answer:'立',choices:['立','音','辛']},
        {latex:'\\boxed{\\,?\\,}場',answer:'立',choices:['立','音','辛']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 立?',correct:'立 (standing radical)',wrong:['女','艹']},
        {q:'In 立つ (to stand), what is the reading?',correct:'たつ',wrong:['ソウ','セイ']},
        {q:'What does 国立 mean?',correct:'national (govt-run)',wrong:['white','kanji']}
      ]},
    {id:'k-529b',action:'power; strength; force',tier:'core',dom:'l1',
      hint:'オン: リョク・リキ | くん: ちから | 例: 力持ち (ちからもち)',
      explain:'Strong arm/plow — power, strength. Radical in 男, 動, 働.',
      latex:'力',
      blanks:[
        {latex:'\\boxed{\\,?\\,}持ち',answer:'力',choices:['力','刀','九']},
        {latex:'努\\boxed{\\,?\\,}',answer:'力',choices:['力','刀','九']},
        {latex:'体\\boxed{\\,?\\,}',answer:'力',choices:['力','刀','九']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 力?',correct:'力 (power radical)',wrong:['亻','土']},
        {q:'In 力持ち (strong person), what is the reading?',correct:'ちからもち',wrong:['ソン','ソク']},
        {q:'What does 努力 mean?',correct:'effort',wrong:['stone bridge','school']}
      ]},
    {id:'k-6797',action:'grove; woods',tier:'regular',dom:'l1',
      hint:'オン: リン | くん: はやし | 例: 林道 (りんどう)',
      explain:'Two trees (木×2). Less dense than 森 (forest). 木→林→森.',
      latex:'林',
      blanks:[
        {latex:'\\boxed{\\,?\\,}道',answer:'林',choices:['林','森','木']},
        {latex:'竹\\boxed{\\,?\\,}',answer:'林',choices:['林','森','木']},
        {latex:'\\boxed{\\,?\\,}業',answer:'林',choices:['林','森','木']}
      ],
      subconcepts:[
        {q:'Which component/radical appears in 林?',correct:'木 (tree ×2)',wrong:['力','火']},
        {q:'In 林道 (forest road), what is the reading?',correct:'りんどう',wrong:['チュウ','キュウ']},
        {q:'What does 竹林 mean?',correct:'bamboo grove',wrong:['teacher','this year']}
      ]},
    {id:'k-516d',action:'six',tier:'core',dom:'l1',
      hint:'オン: ロク | くん: むっ(つ)・む | 例: 六月 (ろくがつ)',
      explain:'Roof shape with two legs. June and counting.',
      latex:'六',
      blanks:[
        {latex:'\\boxed{\\,?\\,}月',answer:'六',choices:['六','八','四']},
        {latex:'\\boxed{\\,?\\,}つ',answer:'六',choices:['六','八','四']},
        {latex:'\\boxed{\\,?\\,}百',answer:'六',choices:['六','八','四']}
      ],
      subconcepts:[
        {q:'How many strokes does 六 have?',correct:'4',wrong:['3','5']},
        {q:'In 六月 (June), what is the reading?',correct:'ろくがつ',wrong:['カ','シュツ']},
        {q:'What does 六つ mean?',correct:'six things',wrong:['town mayor','mountain path']}
      ]}
  ],

  // ══════════════════════════════════════
  //  QUESTION GENERATOR — 6 types
  // ══════════════════════════════════════
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
        // Katakana → Hiragana
        .replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
        .replace(/ō/g,'ou').replace(/ū/g,'uu').replace(/ā/g,'aa')
        .replace(/-/g,'');
    }
    return norm(input) === norm(answer);
  },
};

const VARIABLE_BANK = {
  'k-4e00':[{s:'一',d:'one — standalone radical'}],
  'k-53f3':[{s:'ナ',d:'hand shape'},{s:'口',d:'mouth'}],
  'k-96e8':[{s:'雨',d:'rain radical'}],
  'k-5186':[{s:'円',d:'circle — standalone radical'}],
  'k-738b':[{s:'王',d:'king — standalone radical'}],
  'k-97f3':[{s:'立',d:'stand'},{s:'日',d:'sun'}],
  'k-4e0b':[{s:'下',d:'below — standalone radical'}],
  'k-706b':[{s:'火',d:'fire radical'},{s:'灬',d:'fire dots'}],
  'k-82b1':[{s:'艹',d:'grass radical'},{s:'化',d:'change'}],
  'k-8c9d':[{s:'貝',d:'shell/value radical'}],
  'k-5b66':[{s:'⺍',d:'crown/learn'},{s:'子',d:'child'}],
  'k-6c17':[{s:'気',d:'spirit — standalone radical'}],
  'k-4e5d':[{s:'九',d:'nine — standalone radical'}],
  'k-4f11':[{s:'亻',d:'person'},{s:'木',d:'tree'}],
  'k-7389':[{s:'王',d:'king base'},{s:'丶',d:'dot'}],
  'k-91d1':[{s:'金',d:'metal radical'}],
  'k-7a7a':[{s:'穴',d:'hole'},{s:'工',d:'work'}],
  'k-6708':[{s:'月',d:'moon/flesh radical'}],
  'k-72ac':[{s:'大',d:'big'},{s:'丶',d:'dot'}],
  'k-898b':[{s:'目',d:'eye'},{s:'儿',d:'legs'}],
  'k-4e94':[{s:'五',d:'five — standalone radical'}],
  'k-53e3':[{s:'口',d:'mouth radical'}],
  'k-6821':[{s:'木',d:'tree'},{s:'交',d:'cross/mix'}],
  'k-5de6':[{s:'ナ',d:'hand'},{s:'工',d:'work'}],
  'k-4e09':[{s:'三',d:'three — standalone radical'}],
  'k-5c71':[{s:'山',d:'mountain radical'}],
  'k-5b50':[{s:'子',d:'child radical'}],
  'k-56db':[{s:'四',d:'four — standalone radical'}],
  'k-7cf8':[{s:'糸',d:'thread radical'}],
  'k-5b57':[{s:'宀',d:'roof'},{s:'子',d:'child'}],
  'k-8033':[{s:'耳',d:'ear radical'}],
  'k-4e03':[{s:'七',d:'seven — standalone radical'}],
  'k-8eca':[{s:'車',d:'vehicle radical'}],
  'k-624b':[{s:'手',d:'hand radical'},{s:'扌',d:'hand left form'}],
  'k-5341':[{s:'十',d:'ten — standalone radical'}],
  'k-51fa':[{s:'出',d:'exit — standalone radical'}],
  'k-5973':[{s:'女',d:'woman radical'}],
  'k-5c0f':[{s:'小',d:'small — standalone radical'}],
  'k-4e0a':[{s:'上',d:'above — standalone radical'}],
  'k-68ee':[{s:'木',d:'tree ×3'}],
  'k-4eba':[{s:'人',d:'person radical'},{s:'亻',d:'person left'}],
  'k-6c34':[{s:'水',d:'water radical'},{s:'氵',d:'water left'}],
  'k-6b63':[{s:'一',d:'one'},{s:'止',d:'stop'}],
  'k-751f':[{s:'生',d:'life — standalone radical'}],
  'k-9752':[{s:'青',d:'blue — standalone radical'}],
  'k-5915':[{s:'夕',d:'evening crescent'}],
  'k-77f3':[{s:'厂',d:'cliff'},{s:'口',d:'rock shape'}],
  'k-8d64':[{s:'赤',d:'red — standalone radical'}],
  'k-5343':[{s:'千',d:'thousand — standalone radical'}],
  'k-5ddd':[{s:'川',d:'river radical'}],
  'k-5148':[{s:'儿',d:'legs'},{s:'土',d:'earth shape'}],
  'k-65e9':[{s:'日',d:'sun'},{s:'十',d:'cross'}],
  'k-8349':[{s:'艹',d:'grass radical'},{s:'早',d:'early'}],
  'k-8db3':[{s:'足',d:'foot radical'}],
  'k-6751':[{s:'木',d:'tree'},{s:'寸',d:'inch/measure'}],
  'k-5927':[{s:'大',d:'big — standalone radical'}],
  'k-7537':[{s:'田',d:'rice field'},{s:'力',d:'power'}],
  'k-7af9':[{s:'竹',d:'bamboo radical'},{s:'⺮',d:'bamboo top'}],
  'k-4e2d':[{s:'中',d:'middle — standalone radical'}],
  'k-866b':[{s:'虫',d:'insect radical'}],
  'k-753a':[{s:'田',d:'rice field'},{s:'丁',d:'block/street'}],
  'k-5929':[{s:'大',d:'big'},{s:'一',d:'heaven stroke'}],
  'k-7530':[{s:'田',d:'field radical'}],
  'k-571f':[{s:'土',d:'earth radical'}],
  'k-4e8c':[{s:'二',d:'two — standalone radical'}],
  'k-65e5':[{s:'日',d:'sun radical'}],
  'k-5165':[{s:'入',d:'enter — standalone radical'}],
  'k-5e74':[{s:'年',d:'year — standalone radical'}],
  'k-767d':[{s:'白',d:'white radical'}],
  'k-516b':[{s:'八',d:'eight — standalone radical'}],
  'k-767e':[{s:'一',d:'one top'},{s:'白',d:'white'}],
  'k-6587':[{s:'文',d:'writing radical'}],
  'k-6728':[{s:'木',d:'tree radical'}],
  'k-672c':[{s:'木',d:'tree'},{s:'一',d:'root mark'}],
  'k-540d':[{s:'夕',d:'evening'},{s:'口',d:'mouth'}],
  'k-76ee':[{s:'目',d:'eye radical'}],
  'k-7acb':[{s:'立',d:'standing radical'}],
  'k-529b':[{s:'力',d:'power radical'}],
  'k-6797':[{s:'木',d:'tree ×2'}],
  'k-516d':[{s:'六',d:'six — standalone radical'}],
};

const APPLICATION_BANK = {
  'k-4e00':[{scenario:'A single horizontal stroke — the simplest kanji. Which kanji looks like a flat line?',confusionSet:['k-4e09','k-5341','k-4e8c']}],
  'k-53f3':[{scenario:'You write with this hand if you are not left-handed. Which kanji means the opposite of left?',confusionSet:['k-5de6','k-77f3','k-5e74']}],
  'k-96e8':[{scenario:'Drops falling from clouds. Umbrellas protect you from this. Which kanji shows precipitation?',confusionSet:['k-516b','k-767e','k-6587']}],
  'k-5186':[{scenario:'Japanese coins are this shape. The currency symbol for Japan. Which kanji represents a round coin?',confusionSet:['k-53e3','k-6821','k-5de6']}],
  'k-738b':[{scenario:'A ruler who wears a crown and sits on a throne. Which kanji represents royalty?',confusionSet:['k-7389','k-9752','k-5915']}],
  'k-97f3':[{scenario:'What you hear when someone plays piano or sings. Which kanji relates to what your ears pick up?',confusionSet:['k-516b','k-767e','k-6587']}],
  'k-4e0b':[{scenario:'The opposite of up. An elevator going to the basement. Which kanji means the lower direction?',confusionSet:['k-4e0a','k-8349','k-8db3']}],
  'k-706b':[{scenario:'It burns, it is hot, and campfires are made of it. Which kanji represents flames?',confusionSet:['k-6c34','k-6728','k-516b']}],
  'k-82b1':[{scenario:'Cherry blossoms bloom in spring. Bees visit these for pollen. Which kanji represents blooming plants?',confusionSet:['k-8349','k-6c17','k-4e5d']}],
  'k-8c9d':[{scenario:'Found on the beach, often with a pearl inside. Ancient people used these as currency. Which kanji?',confusionSet:['k-898b','k-96e8','k-5186']}],
  'k-5b66':[{scenario:'Students do this at school with books and teachers. Which kanji relates to education and studying?',confusionSet:['k-5b57','k-4e00','k-53f3']}],
  'k-6c17':[{scenario:'You cannot see it, but you feel energy and mood from it. Spirit, feeling, atmosphere. Which kanji?',confusionSet:['k-706b','k-82b1','k-8c9d']}],
  'k-4e5d':[{scenario:'The number after eight and before ten. Which kanji represents this single digit?',confusionSet:['k-516b','k-529b','k-4e0a']}],
  'k-4f11':[{scenario:'A person leaning against a tree to take a break. No work, just relaxing. Which kanji?',confusionSet:['k-516d','k-97f3','k-4e0b']}],
  'k-7389':[{scenario:'A round precious stone, smaller than a jewel. Marbles are shaped like this. Which kanji?',confusionSet:['k-738b','k-706b','k-82b1']}],
  'k-91d1':[{scenario:'You use this to buy things. Coins and bills. Shiny metal from the earth. Which kanji?',confusionSet:['k-8033','k-4e03','k-8eca']}],
  'k-7a7a':[{scenario:'Look up — there is nothing but open sky above you. Birds fly through it. Which kanji means the open sky?',confusionSet:['k-751f','k-9752','k-5915']}],
  'k-6708':[{scenario:'It shines at night, changes shape over 30 days, and controls the tides. Which kanji?',confusionSet:['k-5915','k-65e5','k-5de6']}],
  'k-72ac':[{scenario:'A loyal pet that barks, wags its tail, and fetches sticks. Which kanji represents this animal?',confusionSet:['k-5927','k-5929','k-5165']}],
  'k-898b':[{scenario:'You do this with your eyes — looking, watching, observing. Which kanji relates to using your eyes?',confusionSet:['k-8c9d','k-753a','k-5929']}],
  'k-4e94':[{scenario:'The number of fingers on one hand. After four, before six. Which kanji?',confusionSet:['k-56db','k-516d','k-5ddd']}],
  'k-53e3':[{scenario:'You eat with it, you talk with it. The opening in your face. Which kanji looks like an opening?',confusionSet:['k-7530','k-65e5','k-76ee']}],
  'k-6821':[{scenario:'A building with classrooms, a playground, and teachers. Children go here every weekday. Which kanji?',confusionSet:['k-6751','k-77f3','k-8d64']}],
  'k-5de6':[{scenario:'The opposite of right. The hand you do not usually write with. Which kanji?',confusionSet:['k-53f3','k-77f3','k-96e8']}],
  'k-4e09':[{scenario:'Three horizontal lines stacked. After two, before four. Which kanji shows this number?',confusionSet:['k-738b','k-56db','k-4e8c']}],
  'k-5c71':[{scenario:'A tall landform with a peak, covered in trees. Climbers hike up it. Which kanji looks like three peaks?',confusionSet:['k-51fa','k-5ddd','k-751f']}],
  'k-5b50':[{scenario:'A young person, someone\'s son or daughter. Parents take care of this little one. Which kanji?',confusionSet:['k-5b66','k-5b57','k-516d']}],
  'k-56db':[{scenario:'A box with lines inside. The number after three. How many legs does a table have? Which kanji?',confusionSet:['k-4e94','k-4e09','k-6c34']}],
  'k-7cf8':[{scenario:'Thin strands used for sewing or weaving fabric. Spiders make webs from it. Which kanji?',confusionSet:['k-767d','k-516b','k-767e']}],
  'k-5b57':[{scenario:'Written symbols that make up words — you are reading many of these right now. Which kanji means a written symbol?',confusionSet:['k-5b66','k-4e00','k-53f3']}],
  'k-8033':[{scenario:'The organ on each side of your head used for hearing sounds. Which kanji represents this body part?',confusionSet:['k-53e3','k-76ee','k-5c0f']}],
  'k-4e03':[{scenario:'The number of days in a week. After six, before eight. Which kanji?',confusionSet:['k-4e5d','k-516b','k-516d']}],
  'k-8eca':[{scenario:'It has wheels and carries passengers on roads. Taxis, buses, and trains are types. Which kanji?',confusionSet:['k-672c','k-540d','k-76ee']}],
  'k-624b':[{scenario:'You have two of these with five fingers each. You use them to hold, write, and wave. Which kanji?',confusionSet:['k-8db3','k-68ee','k-4eba']}],
  'k-5341':[{scenario:'Two strokes that cross — a plus sign shape. The number after nine. Which kanji?',confusionSet:['k-4e5d','k-5343','k-767e']}],
  'k-51fa':[{scenario:'Going outside, leaving a room, or coming out from hiding. The opposite of entering. Which kanji?',confusionSet:['k-5c71','k-5165','k-97f3']}],
  'k-5973':[{scenario:'A person who might become a mother. The opposite of a male person. Which kanji?',confusionSet:['k-7537','k-4e8c','k-65e5']}],
  'k-5c0f':[{scenario:'Tiny, little, not big at all. An ant is this compared to an elephant. Which kanji?',confusionSet:['k-6c34','k-5927','k-4e03']}],
  'k-4e0a':[{scenario:'The opposite of down. An elevator going to the top floor. Which kanji means the higher direction?',confusionSet:['k-4e0b','k-6b63','k-53e3']}],
  'k-68ee':[{scenario:'Three trees packed together — very dense with vegetation. Deeper and thicker than a grove. Which kanji?',confusionSet:['k-6751','k-6728','k-6797']}],
  'k-4eba':[{scenario:'A living being that walks upright on two legs. You are one. Which kanji looks like a walking figure?',confusionSet:['k-5927','k-5165','k-8d64']}],
  'k-6c34':[{scenario:'You drink it, swim in it, and it flows in rivers. Which kanji represents this liquid?',confusionSet:['k-706b','k-8eca','k-624b']}],
  'k-6b63':[{scenario:'Not wrong, not mistaken — the answer is exactly right. Which kanji means accurate or proper?',confusionSet:['k-751f','k-4e0b','k-706b']}],
  'k-751f':[{scenario:'To be born, to be alive, to grow. Fresh and raw. Which kanji relates to being alive?',confusionSet:['k-6b63','k-8eca','k-624b']}],
  'k-9752':[{scenario:'The color of a clear sky or the ocean. Also used for unripe and fresh. Which kanji?',confusionSet:['k-8d64','k-767d','k-7acb']}],
  'k-5915':[{scenario:'The sun is setting, it is getting dark. The time just before night. Which kanji?',confusionSet:['k-6708','k-540d','k-7acb']}],
  'k-77f3':[{scenario:'Hard, heavy, found on the ground. You might skip it across a lake. Which kanji?',confusionSet:['k-53f3','k-7537','k-7af9']}],
  'k-8d64':[{scenario:'The color of a tomato, a fire truck, or the Japanese flag circle. Which kanji?',confusionSet:['k-9752','k-767d','k-56db']}],
  'k-5343':[{scenario:'Ten times a hundred. A very large number but not quite ten thousand. Which kanji?',confusionSet:['k-5341','k-767e','k-4e0b']}],
  'k-5ddd':[{scenario:'Water flowing between two banks, from mountains to the sea. Which kanji looks like flowing water?',confusionSet:['k-4e09','k-5c71','k-751f']}],
  'k-5148':[{scenario:'The person who goes first, ahead of others. A teacher or someone born earlier. Which kanji?',confusionSet:['k-5343','k-6c34','k-6b63']}],
  'k-65e9':[{scenario:'The first part of the morning, before everyone else wakes up. Which kanji means soon or prompt?',confusionSet:['k-8349','k-5de6','k-4e09']}],
  'k-8349':[{scenario:'Green plants covering a field, shorter than trees. Lawns are made of this. Which kanji?',confusionSet:['k-82b1','k-97f3','k-4e0b']}],
  'k-8db3':[{scenario:'You walk and run with these. Below your legs, inside your shoes. Which kanji represents this body part?',confusionSet:['k-624b','k-68ee','k-4eba']}],
  'k-6751':[{scenario:'A small rural community, smaller than a town. Farmers live here. Which kanji?',confusionSet:['k-753a','k-6797','k-4f11']}],
  'k-5927':[{scenario:'The opposite of small. An elephant is this compared to a mouse. Which kanji means large?',confusionSet:['k-72ac','k-5929','k-4e8c']}],
  'k-7537':[{scenario:'The opposite of female. A boy, not a girl. Which kanji represents the masculine?',confusionSet:['k-5973','k-7530','k-529b']}],
  'k-7af9':[{scenario:'Tall, green, hollow stems. Pandas eat this plant. Which kanji looks like two stalks?',confusionSet:['k-8349','k-6728','k-8033']}],
  'k-4e2d':[{scenario:'Not left, not right — exactly in the center. A line through a box. Which kanji?',confusionSet:['k-866b','k-7acb','k-529b']}],
  'k-866b':[{scenario:'A small creature with six legs. Ants, beetles, and butterflies are examples. Which kanji?',confusionSet:['k-4e2d','k-56db','k-7cf8']}],
  'k-753a':[{scenario:'Bigger than a village but smaller than a city. A local neighborhood area. Which kanji?',confusionSet:['k-6751','k-4e09','k-5c71']}],
  'k-5929':[{scenario:'The sky above, where the sun and stars live. Also means nature or fate. Which kanji?',confusionSet:['k-72ac','k-5927','k-76ee']}],
  'k-7530':[{scenario:'Flat land flooded with water for growing rice. Paddies are everywhere in the Japanese countryside. Which kanji?',confusionSet:['k-767d','k-516b','k-767e']}],
  'k-571f':[{scenario:'The ground beneath your feet. Dirt, soil, earth. Plants grow in it. Which kanji?',confusionSet:['k-738b','k-7530','k-4e8c']}],
  'k-4e8c':[{scenario:'Two horizontal lines, one shorter than the other. The number after one. Which kanji?',confusionSet:['k-4e00','k-4e09','k-77f3']}],
  'k-65e5':[{scenario:'It rises in the east, shines all day, and sets in the west. Which kanji represents our star?',confusionSet:['k-6708','k-767d','k-76ee']}],
  'k-5165':[{scenario:'Going inside, walking through a door. The opposite of going out. Which kanji?',confusionSet:['k-51fa','k-4eba','k-624b']}],
  'k-5e74':[{scenario:'365 days make one. Birthdays come once per this. Which kanji measures a long time period?',confusionSet:['k-751f','k-4e0a','k-68ee']}],
  'k-767d':[{scenario:'The color of snow, milk, and paper. The lightest color. Which kanji?',confusionSet:['k-65e5','k-767e','k-7a7a']}],
  'k-516b':[{scenario:'The number after seven. An octopus has this many legs. Which kanji?',confusionSet:['k-4e5d','k-516d','k-5b66']}],
  'k-767e':[{scenario:'Ten times ten. Two digits, all zeros except the first. Which kanji represents this number?',confusionSet:['k-5343','k-767d','k-76ee']}],
  'k-6587':[{scenario:'Writing, literature, a piece of composed text. Sentences are made of these. Which kanji?',confusionSet:['k-5b57','k-672c','k-5929']}],
  'k-6728':[{scenario:'A single plant with a trunk, branches, and leaves. Which kanji looks like a trunk with branches?',confusionSet:['k-68ee','k-672c','k-6797']}],
  'k-672c':[{scenario:'The origin, the root, the real thing. Also a counter for long thin objects like pencils. Which kanji?',confusionSet:['k-5927','k-6728','k-4f11']}],
  'k-540d':[{scenario:'What people call you. Everyone has one — first and last. Which kanji relates to what you are called?',confusionSet:['k-5915','k-6c34','k-6b63']}],
  'k-76ee':[{scenario:'The organ you see with. Two of them on your face above your nose. Which kanji?',confusionSet:['k-898b','k-65e5','k-8033']}],
  'k-7acb':[{scenario:'Getting up from sitting. Being upright on your feet. Which kanji?',confusionSet:['k-97f3','k-4eba','k-6c34']}],
  'k-529b':[{scenario:'Muscles, effort, physical strength. Lifting heavy things requires this. Which kanji?',confusionSet:['k-4e5d','k-7537','k-8eca']}],
  'k-6797':[{scenario:'Two trees side by side — a grove, thinner than a dense forest. Which kanji?',confusionSet:['k-68ee','k-6751','k-6728']}],
  'k-516d':[{scenario:'The number after five. Half a dozen. How many sides does a cube have? Which kanji?',confusionSet:['k-56db','k-516b','k-82b1']}],
};

const RELATIONSHIP_BANK = {};

const EXPLANATION_GLOSSARY = [
  {keys:['一'],title:'一 (one)',lines:['one. Strokes: 1.','On: イチ, イツ | Kun: ひと(つ)','Components: standalone. Ex: 一日(one day), 一人(one person), 一つ(one thing)']},
  {keys:['右'],title:'右 (right)',lines:['right. Strokes: 5.','On: ウ, ユウ | Kun: みぎ','Components: ナ + 口. Ex: 右手(right hand), 右側(right side), 左右(left and right)']},
  {keys:['雨'],title:'雨 (rain)',lines:['rain. Strokes: 8.','On: ウ | Kun: あめ, あま','Components: 雨. Ex: 大雨(heavy rain), 雨水(rainwater), 雨天(rainy weather)']},
  {keys:['円'],title:'円 (circle)',lines:['circle; yen. Strokes: 4.','On: エン | Kun: まる(い)','Components: standalone. Ex: 円い(round), 百円(100 yen), 円形(circular shape)']},
  {keys:['王'],title:'王 (king)',lines:['king. Strokes: 4.','On: オウ','Components: standalone. Ex: 王様(king), 女王(queen), 王子(prince)']},
  {keys:['音'],title:'音 (sound)',lines:['sound. Strokes: 9.','On: オン, イン | Kun: おと, ね','Components: 立 + 日. Ex: 音楽(music), 音読み(on-yomi reading), 足音(footsteps)']},
  {keys:['下'],title:'下 (below)',lines:['below; down. Strokes: 3.','On: カ, ゲ | Kun: した, くだ(る), さ(がる)','Components: standalone. Ex: 下手(unskillful), 上下(up and down), 地下(underground)']},
  {keys:['火'],title:'火 (fire)',lines:['fire. Strokes: 4.','On: カ | Kun: ひ, ほ','Components: 火 + 灬. Ex: 火事(fire (disaster)), 火山(volcano), 花火(fireworks)']},
  {keys:['花'],title:'花 (flower)',lines:['flower. Strokes: 7.','On: カ | Kun: はな','Components: 艹 + 化. Ex: 花火(fireworks), 花見(flower viewing), 生花(flower arranging)']},
  {keys:['貝'],title:'貝 (shell)',lines:['shell. Strokes: 7.','On: バイ | Kun: かい','Components: 貝. Ex: 貝殻(seashell), 二枚貝(bivalve), 巻き貝(snail shell)']},
  {keys:['学'],title:'学 (study)',lines:['study; learning. Strokes: 8.','On: ガク | Kun: まな(ぶ)','Components: ⺍ + 子. Ex: 学校(school), 学生(student), 学年(school year)']},
  {keys:['気'],title:'気 (spirit)',lines:['spirit; air; mood. Strokes: 6.','On: キ, ケ','Components: standalone. Ex: 天気(weather), 元気(energetic; well), 気持ち(feeling)']},
  {keys:['九'],title:'九 (nine)',lines:['nine. Strokes: 2.','On: キュウ, ク | Kun: ここの(つ)','Components: standalone. Ex: 九月(September), 九つ(nine things), 九州(Kyushu)']},
  {keys:['休'],title:'休 (rest)',lines:['rest. Strokes: 6.','On: キュウ | Kun: やす(む), やす(まる)','Components: 亻 + 木. Ex: 休日(holiday), 休み(break; vacation), 休憩(rest break)']},
  {keys:['玉'],title:'玉 (jewel)',lines:['jewel; ball. Strokes: 5.','On: ギョク | Kun: たま','Components: 王 + 丶. Ex: お玉(ladle), 玉入れ(ball toss game), 宝玉(precious gem)']},
  {keys:['金'],title:'金 (gold)',lines:['gold; money; metal. Strokes: 8.','On: キン, コン | Kun: かね, かな','Components: 金. Ex: お金(money), 金曜日(Friday), 金色(gold color)']},
  {keys:['空'],title:'空 (sky)',lines:['sky; empty. Strokes: 8.','On: クウ | Kun: そら, あ(く), から','Components: 穴 + 工. Ex: 空気(air; atmosphere), 空港(airport), 青空(blue sky)']},
  {keys:['月'],title:'月 (moon)',lines:['moon; month. Strokes: 4.','On: ゲツ, ガツ | Kun: つき','Components: 月. Ex: 月曜日(Monday), 一月(January), 毎月(every month)']},
  {keys:['犬'],title:'犬 (dog)',lines:['dog. Strokes: 4.','On: ケン | Kun: いぬ','Components: 大 + 丶. Ex: 子犬(puppy), 犬小屋(doghouse), 番犬(watchdog)']},
  {keys:['見'],title:'見 (see)',lines:['see; look. Strokes: 7.','On: ケン | Kun: み(る), み(える), み(せる)','Components: 目 + 儿. Ex: 花見(flower viewing), 見学(field trip), 見本(sample)']},
  {keys:['五'],title:'五 (five)',lines:['five. Strokes: 4.','On: ゴ | Kun: いつ(つ)','Components: standalone. Ex: 五月(May), 五つ(five things), 五人(five people)']},
  {keys:['口'],title:'口 (mouth)',lines:['mouth. Strokes: 3.','On: コウ, ク | Kun: くち','Components: 口. Ex: 入口(entrance), 出口(exit), 人口(population)']},
  {keys:['校'],title:'校 (school)',lines:['school. Strokes: 10.','On: コウ','Components: 木 + 交. Ex: 学校(school), 校長(principal), 高校(high school)']},
  {keys:['左'],title:'左 (left)',lines:['left. Strokes: 5.','On: サ | Kun: ひだり','Components: ナ + 工. Ex: 左手(left hand), 左右(left and right), 左側(left side)']},
  {keys:['三'],title:'三 (three)',lines:['three. Strokes: 3.','On: サン | Kun: みっ(つ)','Components: standalone. Ex: 三月(March), 三人(three people), 三角(triangle)']},
  {keys:['山'],title:'山 (mountain)',lines:['mountain. Strokes: 3.','On: サン, ザン | Kun: やま','Components: 山. Ex: 山道(mountain path), 火山(volcano), 富士山(Mt. Fuji)']},
  {keys:['子'],title:'子 (child)',lines:['child. Strokes: 3.','On: シ, ス | Kun: こ','Components: 子. Ex: 子供(children), 女子(girl/woman), 男子(boy/man)']},
  {keys:['四'],title:'四 (four)',lines:['four. Strokes: 5.','On: シ | Kun: よっ(つ), よん','Components: standalone. Ex: 四月(April), 四角(square), 四つ(four things)']},
  {keys:['糸'],title:'糸 (thread)',lines:['thread; string. Strokes: 6.','On: シ | Kun: いと','Components: 糸. Ex: 毛糸(yarn), 糸口(clue; thread end), 一本の糸(a single thread)']},
  {keys:['字'],title:'字 (character)',lines:['character; letter. Strokes: 6.','On: ジ | Kun: あざ','Components: 宀 + 子. Ex: 漢字(kanji), 文字(character; letter), 数字(number; digit)']},
  {keys:['耳'],title:'耳 (ear)',lines:['ear. Strokes: 6.','On: ジ | Kun: みみ','Components: 耳. Ex: 耳鼻科(ENT clinic), 早耳(keen ears), 耳元(close to the ear)']},
  {keys:['七'],title:'七 (seven)',lines:['seven. Strokes: 2.','On: シチ | Kun: なな(つ), なの','Components: standalone. Ex: 七月(July), 七つ(seven things), 七夕(Star Festival)']},
  {keys:['車'],title:'車 (car)',lines:['car; vehicle. Strokes: 7.','On: シャ | Kun: くるま','Components: 車. Ex: 自動車(automobile), 電車(train), 車道(roadway)']},
  {keys:['手'],title:'手 (hand)',lines:['hand. Strokes: 4.','On: シュ | Kun: て, た','Components: 手 + 扌. Ex: 右手(right hand), 手紙(letter), 上手(skillful)']},
  {keys:['十'],title:'十 (ten)',lines:['ten. Strokes: 2.','On: ジュウ, ジッ | Kun: とお, と','Components: standalone. Ex: 十月(October), 十分(enough), 二十(twenty)']},
  {keys:['出'],title:'出 (exit)',lines:['exit; go out; put out. Strokes: 5.','On: シュツ, スイ | Kun: で(る), だ(す)','Components: standalone. Ex: 出口(exit), 出発(departure), 出す(to take out)']},
  {keys:['女'],title:'女 (woman)',lines:['woman. Strokes: 3.','On: ジョ, ニョ | Kun: おんな, め','Components: 女. Ex: 女子(girl/woman), 女性(female), 女の子(girl)']},
  {keys:['小'],title:'小 (small)',lines:['small; little. Strokes: 3.','On: ショウ | Kun: ちい(さい), こ, お','Components: standalone. Ex: 小学校(elementary school), 小さい(small), 小鳥(small bird)']},
  {keys:['上'],title:'上 (above)',lines:['above; up; on top. Strokes: 3.','On: ジョウ, ショウ | Kun: うえ, あ(がる), のぼ(る)','Components: standalone. Ex: 上手(skillful), 上下(up and down), 以上(more than)']},
  {keys:['森'],title:'森 (forest)',lines:['forest. Strokes: 12.','On: シン | Kun: もり','Components: 木. Ex: 森林(forest), 森の中(in the forest)']},
  {keys:['人'],title:'人 (person)',lines:['person. Strokes: 2.','On: ジン, ニン | Kun: ひと','Components: 人 + 亻. Ex: 大人(adult), 日本人(Japanese person), 人口(population)']},
  {keys:['水'],title:'水 (water)',lines:['water. Strokes: 4.','On: スイ | Kun: みず','Components: 水 + 氵. Ex: 水曜日(Wednesday), 水道(water supply), 水泳(swimming)']},
  {keys:['正'],title:'正 (correct)',lines:['correct; right; proper. Strokes: 5.','On: セイ, ショウ | Kun: ただ(しい), まさ','Components: 一 + 止. Ex: 正しい(correct), 正月(New Year), 正解(correct answer)']},
  {keys:['生'],title:'生 (life)',lines:['life; birth; raw. Strokes: 5.','On: セイ, ショウ | Kun: い(きる), う(まれる), なま','Components: standalone. Ex: 学生(student), 先生(teacher), 生活(daily life)']},
  {keys:['青'],title:'青 (blue)',lines:['blue; green. Strokes: 8.','On: セイ, ショウ | Kun: あお(い)','Components: standalone. Ex: 青空(blue sky), 青年(young person), 青い(blue; green)']},
  {keys:['夕'],title:'夕 (evening)',lines:['evening. Strokes: 3.','On: セキ | Kun: ゆう','Components: 夕. Ex: 夕方(evening), 夕日(evening sun), 夕食(dinner)']},
  {keys:['石'],title:'石 (stone)',lines:['stone; rock. Strokes: 5.','On: セキ, シャク | Kun: いし','Components: 厂 + 口. Ex: 石橋(stone bridge), 宝石(jewel), 化石(fossil)']},
  {keys:['赤'],title:'赤 (red)',lines:['red. Strokes: 7.','On: セキ, シャク | Kun: あか(い)','Components: standalone. Ex: 赤ちゃん(baby), 赤い(red), 赤字(deficit; red ink)']},
  {keys:['千'],title:'千 (thousand)',lines:['thousand. Strokes: 3.','On: セン | Kun: ち','Components: standalone. Ex: 千円(1000 yen), 千人(1000 people), 三千(3000)']},
  {keys:['川'],title:'川 (river)',lines:['river. Strokes: 3.','On: セン | Kun: かわ','Components: 川. Ex: 小川(stream), 川上(upstream), 山川(mountains and rivers)']},
  {keys:['先'],title:'先 (ahead)',lines:['ahead; before; previous. Strokes: 6.','On: セン | Kun: さき, ま(ず)','Components: 儿 + 土. Ex: 先生(teacher), 先月(last month), 先日(the other day)']},
  {keys:['早'],title:'早 (early)',lines:['early; fast. Strokes: 6.','On: ソウ, サッ | Kun: はや(い)','Components: 日 + 十. Ex: 早起き(early rising), 早い(early; fast), 早朝(early morning)']},
  {keys:['草'],title:'草 (grass)',lines:['grass. Strokes: 9.','On: ソウ | Kun: くさ','Components: 艹 + 早. Ex: 草原(grassland), 草花(flowering plant), 雑草(weeds)']},
  {keys:['足'],title:'足 (foot)',lines:['foot; leg; enough. Strokes: 7.','On: ソク | Kun: あし, た(りる)','Components: 足. Ex: 足りる(to be enough), 遠足(excursion), 足元(at one\'s feet)']},
  {keys:['村'],title:'村 (village)',lines:['village. Strokes: 7.','On: ソン | Kun: むら','Components: 木 + 寸. Ex: 村長(village chief), 村人(villager), 村落(village; hamlet)']},
  {keys:['大'],title:'大 (big)',lines:['big; large. Strokes: 3.','On: ダイ, タイ | Kun: おお(きい)','Components: standalone. Ex: 大人(adult), 大学(university), 大きい(big)']},
  {keys:['男'],title:'男 (man)',lines:['man; male. Strokes: 7.','On: ダン, ナン | Kun: おとこ','Components: 田 + 力. Ex: 男子(boy; male), 男性(male), 男の子(boy)']},
  {keys:['竹'],title:'竹 (bamboo)',lines:['bamboo. Strokes: 6.','On: チク | Kun: たけ','Components: 竹 + ⺮. Ex: 竹林(bamboo grove), 竹の子(bamboo shoot), 竹馬(stilts)']},
  {keys:['中'],title:'中 (middle)',lines:['middle; inside; during. Strokes: 4.','On: チュウ | Kun: なか','Components: standalone. Ex: 中学校(middle school), 日中(daytime; Japan-China), 中間(midpoint)']},
  {keys:['虫'],title:'虫 (insect)',lines:['insect; bug. Strokes: 6.','On: チュウ | Kun: むし','Components: 虫. Ex: 昆虫(insect), 虫歯(cavity), 毛虫(caterpillar)']},
  {keys:['町'],title:'町 (town)',lines:['town. Strokes: 7.','On: チョウ | Kun: まち','Components: 田 + 丁. Ex: 町長(town mayor), 町中(downtown), 下町(old downtown)']},
  {keys:['天'],title:'天 (heaven)',lines:['heaven; sky. Strokes: 4.','On: テン | Kun: あめ, あま','Components: 大 + 一. Ex: 天気(weather), 天国(heaven/paradise), 天才(genius)']},
  {keys:['田'],title:'田 (rice field)',lines:['rice field. Strokes: 5.','On: デン | Kun: た','Components: 田. Ex: 田んぼ(rice paddy), 田舎(countryside), 水田(rice paddy)']},
  {keys:['土'],title:'土 (earth)',lines:['earth; soil; ground. Strokes: 3.','On: ド, ト | Kun: つち','Components: 土. Ex: 土曜日(Saturday), 土地(land), 土台(foundation)']},
  {keys:['二'],title:'二 (two)',lines:['two. Strokes: 2.','On: ニ | Kun: ふた(つ)','Components: standalone. Ex: 二月(February), 二人(two people), 二つ(two things)']},
  {keys:['日'],title:'日 (sun)',lines:['sun; day. Strokes: 4.','On: ニチ, ジツ | Kun: ひ, か','Components: 日. Ex: 日本(Japan), 日曜日(Sunday), 毎日(every day)']},
  {keys:['入'],title:'入 (enter)',lines:['enter; put in. Strokes: 2.','On: ニュウ | Kun: い(る), はい(る), い(れる)','Components: standalone. Ex: 入口(entrance), 入学(enrollment), 入れる(to put in)']},
  {keys:['年'],title:'年 (year)',lines:['year. Strokes: 6.','On: ネン | Kun: とし','Components: standalone. Ex: 今年(this year), 来年(next year), 学年(school year)']},
  {keys:['白'],title:'白 (white)',lines:['white. Strokes: 5.','On: ハク, ビャク | Kun: しろ(い)','Components: 白. Ex: 白い(white), 白黒(black and white), 白紙(blank paper)']},
  {keys:['八'],title:'八 (eight)',lines:['eight. Strokes: 2.','On: ハチ | Kun: やっ(つ), よう','Components: standalone. Ex: 八月(August), 八つ(eight things), 八百屋(greengrocer)']},
  {keys:['百'],title:'百 (hundred)',lines:['hundred. Strokes: 6.','On: ヒャク | Kun: もも','Components: 一 + 白. Ex: 百円(100 yen), 百人(100 people), 三百(300)']},
  {keys:['文'],title:'文 (writing)',lines:['writing; sentence; text. Strokes: 4.','On: ブン, モン | Kun: ふみ','Components: 文. Ex: 文字(character), 文化(culture), 作文(essay/composition)']},
  {keys:['木'],title:'木 (tree)',lines:['tree; wood. Strokes: 4.','On: モク, ボク | Kun: き, こ','Components: 木. Ex: 木曜日(Thursday), 大木(large tree), 木造(wooden)']},
  {keys:['本'],title:'本 (book)',lines:['book; origin; true. Strokes: 5.','On: ホン | Kun: もと','Components: 木 + 一. Ex: 日本(Japan), 本当(really; true), 本屋(bookstore)']},
  {keys:['名'],title:'名 (name)',lines:['name; fame. Strokes: 6.','On: メイ, ミョウ | Kun: な','Components: 夕 + 口. Ex: 名前(name), 名人(master; expert), 有名(famous)']},
  {keys:['目'],title:'目 (eye)',lines:['eye. Strokes: 5.','On: モク, ボク | Kun: め, ま','Components: 目. Ex: 目的(purpose), 目玉(eyeball), 科目(subject (course))']},
  {keys:['立'],title:'立 (stand)',lines:['stand; establish. Strokes: 5.','On: リツ, リュウ | Kun: た(つ), た(てる)','Components: 立. Ex: 立つ(to stand), 国立(national (govt-run)), 立場(standpoint)']},
  {keys:['力'],title:'力 (power)',lines:['power; strength; force. Strokes: 2.','On: リョク, リキ | Kun: ちから','Components: 力. Ex: 力持ち(strong person), 努力(effort), 体力(stamina)']},
  {keys:['林'],title:'林 (grove)',lines:['grove; woods. Strokes: 8.','On: リン | Kun: はやし','Components: 木. Ex: 林道(forest road), 竹林(bamboo grove), 林業(forestry)']},
  {keys:['六'],title:'六 (six)',lines:['six. Strokes: 4.','On: ロク | Kun: むっ(つ), む','Components: standalone. Ex: 六月(June), 六つ(six things), 六百(600)']},
];

const AUTO_BLANK_SPECS = [];

const DOM_LABELS = {
  'g1': ['Grade 1 (first-year elementary)'],
};

const CORE_IDS = new Set([
  'k-4e00','k-4e8c','k-4e09','k-56db','k-4e94','k-516d','k-4e03','k-516b','k-4e5d','k-5341',
  'k-65e5','k-6708','k-706b','k-6c34','k-6728','k-91d1','k-571f','k-4eba','k-5b50','k-5973',
  'k-7537','k-5927','k-5c0f','k-4e0a','k-4e0b','k-4e2d','k-5c71','k-5ddd','k-96e8','k-7a7a',
  'k-76ee','k-53e3','k-624b','k-8db3','k-767d','k-8d64','k-9752',
]);

const CONFUSABLE_GROUPS = [
  ['k-4e00','k-4e8c','k-4e09','k-5341','k-767e','k-5343'],
  ['k-56db','k-4e94','k-4e03','k-516d','k-516b','k-4e5d'],
  ['k-4e0a','k-4e0b','k-5de6','k-53f3','k-4e2d','k-5148'],
  ['k-65e5','k-76ee','k-767d','k-7530'],
  ['k-65e5','k-6708','k-5915','k-5929','k-7a7a','k-96e8'],
  ['k-706b','k-6c34','k-571f','k-6728','k-91d1'],
  ['k-5c71','k-5ddd','k-571f','k-7530','k-6751','k-753a'],
  ['k-6728','k-6797','k-68ee','k-6751','k-6821','k-672c'],
  ['k-4eba','k-5927','k-5929','k-72ac','k-4f11'],
  ['k-5973','k-7537','k-5b50','k-4eba'],
  ['k-53e3','k-76ee','k-8033','k-624b','k-8db3','k-898b'],
  ['k-738b','k-7389','k-91d1','k-8c9d','k-5186'],
  ['k-5b66','k-6821','k-5b57','k-6587','k-672c','k-540d'],
  ['k-97f3','k-7acb','k-65e9','k-8349'],
  ['k-82b1','k-8349','k-7af9','k-6751','k-6797'],
  ['k-8eca','k-51fa','k-5165','k-624b','k-8db3'],
  ['k-6b63','k-4e0a','k-4e0b','k-5148'],
  ['k-751f','k-5e74','k-65e9','k-5148','k-5b66'],
  ['k-6c17','k-7a7a','k-5929','k-96e8'],
  ['k-7cf8','k-7af9','k-866b','k-8349'],
  ['k-77f3','k-53f3','k-5de6','k-738b'],
  ['k-5165','k-4eba','k-51fa'],
  ['k-8d64','k-767d','k-9752','k-7a7a'],
  ['k-529b','k-7537','k-624b','k-8db3'],
  ['k-5c0f','k-5927','k-5b50','k-4eba','k-5165'],
];

const COMMAND_BY_ID = Object.fromEntries(KANJI_G1.commands.map(cmd => [cmd.id, cmd]));
const COMMAND_IDS = KANJI_G1.commands.map(cmd => cmd.id);

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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

const VARIABLE_AUGMENTS = {
  'k-4e00':[['horizontal stroke','single horizontal line'],['top bar','top horizontal marker in larger kanji']],
  'k-96e8':[['top cover','top frame sheltering the drops below'],['inner drops','four dot-like drops showing falling water']],
  'k-5186':[['outer enclosure','round enclosing shape around the center'],['inner stroke','vertical line inside the enclosure']],
  'k-738b':[['top line','top horizontal stroke'],['three bars','three horizontal bars joined by a center line']],
  'k-4e0b':[['top line','upper horizontal reference line'],['lower mark','short stroke hanging below the line']],
  'k-8c9d':[['eye-like top','boxy top shape of the shell'],['bottom legs','two lower strokes like shell legs']],
  'k-6c17':[['slanted top','sweeping top strokes from the old steam form'],['lower spread','lower strokes spreading outward like vapor']],
  'k-4e5d':[['hook','curved hook stroke'],['sweep','long sweeping second stroke']],
  'k-91d1':[['umbrella top','roof-like top strokes over the metal form'],['bottom legs','lower split strokes under the center']],
  'k-6708':[['left edge','left vertical edge of the crescent body'],['inner lines','two inner horizontal strokes marking the phases shape']],
  'k-4e94':[['top bar','top horizontal stroke'],['middle frame','middle enclosure-like shape between the bars']],
  'k-53e3':[['left side','left vertical side of the opening'],['bottom closure','base stroke closing the box shape']],
  'k-4e09':[['top stroke','short upper horizontal line'],['bottom stroke','long lower horizontal line anchoring the character']],
  'k-5c71':[['center peak','tall middle vertical stroke like a peak'],['side peaks','two shorter side strokes like smaller peaks']],
  'k-5b50':[['top cap','top horizontal stroke with a slight hook'],['legs','bottom spreading strokes like small legs']],
  'k-56db':[['outer box','enclosing frame around the inside'],['inner legs','two inner strokes at the bottom']],
  'k-7cf8':[['top twists','small top strokes showing twisted fiber'],['hanging strands','lower strokes trailing like loose thread']],
  'k-8033':[['outer frame','long outer vertical frame'],['inner bars','three inner horizontals across the ear shape']],
  'k-4e03':[['crossing stroke','horizontal line crossed by the slanted stroke'],['hooking sweep','curved second stroke with a hook']],
  'k-8eca':[['top roof','top horizontal cover of the cart shape'],['axle cross','center cross stroke representing the axle']],
  'k-5341':[['vertical line','upright center stroke'],['crossbar','horizontal stroke crossing the center']],
  'k-51fa':[['double mountain','two stacked mountain-like shapes'],['upper peak','top central stroke rising outward']],
  'k-5973':[['bending sweep','long curved sweep forming the body'],['crossing arm','crossing stroke through the middle']],
  'k-5c0f':[['center line','central vertical stroke'],['side dots','two side strokes falling away from the center']],
  'k-4e0a':[['baseline','lower horizontal reference line'],['rising mark','short stroke extending above the line']],
  'k-68ee':[['left tree','left 木 component'],['right trees','pair of 木 components beside the center tree']],
  'k-751f':[['growing shoot','top stroke crossing a vertical like a sprout'],['ground line','bottom horizontal line as the ground']],
  'k-9752':[['top growth','top strokes above the lower section'],['lower frame','bottom enclosed shape in the lower half']],
  'k-5915':[['moon-like curve','curved opening shape of the dusk sky'],['dropping stroke','small slanting stroke at the top']],
  'k-8d64':[['earth top','upper part related to 土'],['fire legs','lower spreading strokes like a burning base']],
  'k-5343':[['top slash','short top slash before the main cross'],['cross','crossed vertical and horizontal strokes under the slash']],
  'k-5ddd':[['three streams','three vertical strokes like flowing channels'],['center stream','middle line between the side streams']],
  'k-8db3':[['mouth top','top 口 shape'],['walking bottom','lower strokes suggesting a moving leg']],
  'k-5927':[['spreading arms','left and right sweeping strokes'],['center body','vertical center stroke of the person shape']],
  'k-4e2d':[['outer box','box enclosure around the center'],['center line','vertical stroke running through the middle']],
  'k-866b':[['head','top box-like head section'],['tail stroke','bottom curved stroke like an insect tail']],
  'k-7530':[['outer plot','square field enclosure'],['cross paths','inner cross dividing the field into sections']],
  'k-571f':[['top bar','short top horizontal stroke'],['ground line','long bottom line like the ground']],
  'k-4e8c':[['top line','short upper horizontal stroke'],['bottom line','longer lower horizontal stroke']],
  'k-65e5':[['outer frame','tall outer box of the sun shape'],['middle bar','center horizontal line inside the frame']],
  'k-5165':[['left sweep','left slanting stroke opening inward'],['right sweep','right slanting stroke crossing over the left']],
  'k-5e74':[['top bend','upper slanted stroke above the crossbars'],['lower stem','center vertical stroke running downward']],
  'k-767d':[['top drop','small top stroke above the box'],['sun box','box-like lower shape under the top mark']],
  'k-516b':[['left sweep','left opening stroke'],['right sweep','right opening stroke']],
  'k-6587':[['top dot','small top mark above the crossing strokes'],['crossed legs','lower crossing strokes spreading outward']],
  'k-6728':[['trunk','center vertical trunk stroke'],['branches','left and right diagonal branches']],
  'k-76ee':[['outer lid','outer frame of the eye shape'],['inner lines','two horizontal lines inside the eye']],
  'k-7acb':[['top point','small top point above the main body'],['standing base','broad base under the upright center']],
  'k-529b':[['curved arm','long curved stroke like a flexed arm'],['hook','hooking finish at the lower end']],
  'k-6797':[['left tree','left 木 component'],['right tree','right 木 component']],
  'k-516d':[['roof','top lid-like strokes'],['open legs','two lower strokes spreading apart']],
};

const APPLICATION_SCENARIOS = {
  'k-4e00':'The attendance sheet shows 1 student at the make-up lesson.',
  'k-53f3':'Mika lifts the arm she uses for writing when the teacher calls on that side.',
  'k-96e8':'Umbrellas pop open as drops start falling over the playground.',
  'k-5186':'A snack at the school store has 100 printed after the price.',
  'k-738b':'In the storybook, the ruler of the realm sits on a throne with a crown.',
  'k-97f3':'A piano note echoes through the music room during practice.',
  'k-4e0b':'The ball rolls from the shelf to the floor.',
  'k-706b':'Campers warm their hands beside glowing coals at night.',
  'k-82b1':'Cherry blossoms open all around the park pond in spring.',
  'k-8c9d':'At the beach, a child picks a spiral treasure from the sand.',
  'k-5b66':'A child sits at a desk reading a textbook and finishing homework.',
  'k-6c17':'After a nap and a snack, the child feels cheerful and full of energy.',
  'k-4e5d':'The calendar page for September is marked with the digit 9.',
  'k-4f11':'After gym class, everyone takes a break and sits quietly.',
  'k-7389':'At sports day, children toss small round pieces into a basket.',
  'k-91d1':'The child opens a wallet to pay for juice from the vending machine.',
  'k-7a7a':'After lunch, the bento box has nothing left inside.',
  'k-6708':'The calendar flips from April to May.',
  'k-72ac':'A puppy runs across the yard wagging its tail.',
  'k-898b':'Families gather under blossoms to admire the trees together.',
  'k-4e94':'The worksheet asks students to circle the kanji that matches 5.',
  'k-53e3':'The dentist asks the child to open wide and say ah.',
  'k-6821':'Children line up at the gate each morning before classes begin.',
  'k-5de6':'The arrow points to the side opposite the hand most children use for writing.',
  'k-4e09':'The worksheet asks students to pick the kanji that matches 3.',
  'k-5c71':'A hiking trail climbs to a tall peak behind the station town.',
  'k-5b50':'A toddler holds an adult hand while crossing the street.',
  'k-56db':'The quiz card shows 4 and asks for the matching character.',
  'k-7cf8':'Grandma pulls a thin line through a needle while sewing a button.',
  'k-5b57':'A first-grader carefully copies a written symbol onto lined paper.',
  'k-8033':'The doctor checks hearing and looks on each side of the head.',
  'k-4e03':'The class matches the digit 7 with its kanji.',
  'k-8eca':'A family buckles seat belts before the trip to the zoo.',
  'k-624b':'The child raises a palm to answer the question.',
  'k-5341':'The flash card shows 10 and asks for the matching kanji.',
  'k-51fa':'When the bell rings, students leave the classroom and head into the hallway.',
  'k-5973':'The sign on the door is for girls.',
  'k-5c0f':'The kitten is the tiniest one in the box.',
  'k-4e0a':'The hat sits at the highest part of the coat rack.',
  'k-68ee':'Tall trunks surround the path so densely that sunlight barely reaches the ground.',
  'k-4eba':'Only one human figure is drawn on the sign by the elevator.',
  'k-6c34':'A glass spills across the lunch table.',
  'k-6b63':'The teacher marks the answer with a big check because it is not wrong.',
  'k-751f':'A baby chick cracks the egg and comes into the world.',
  'k-9752':'The child grabs the crayon the color of the daytime sky.',
  'k-5915':'The sun has set, streetlights turn on, and families head home for dinner.',
  'k-77f3':'Children skip flat pebbles across the pond.',
  'k-8d64':'The stop sign and a ripe apple share the same bright color.',
  'k-5343':'A price sign shows 1,000 on the board at the festival.',
  'k-5ddd':'Fish swim in the stream beside the hiking trail.',
  'k-5148':'The runner at the front reaches the tape first.',
  'k-65e9':'The child wakes before sunrise for a field trip.',
  'k-8349':'Morning dew sparkles on the lawn.',
  'k-8db3':'A muddy shoe print appears by the doorway.',
  'k-6751':'A few farmhouses cluster around the fields and shrine.',
  'k-5927':'The elephant is much bigger than the goat.',
  'k-7537':'The boys line up on one side for the relay race.',
  'k-7af9':'A panda munches tall hollow stalks at the zoo.',
  'k-4e2d':'The marble lands in the center of the circle.',
  'k-866b':'A tiny creature with six legs crawls across the leaf.',
  'k-753a':'Shops line the main street around the station.',
  'k-5929':'The weather report talks about what the clouds are doing overhead.',
  'k-7530':'Seedlings grow in flooded rectangles beside the road.',
  'k-571f':'The gardener digs into the dirt to plant seeds.',
  'k-4e8c':'The board shows the digit 2 next to three other kanji choices.',
  'k-65e5':'A bright disk rises each morning and also appears in dates on the calendar.',
  'k-5165':'Students step through the doorway into the room.',
  'k-5e74':'Everyone writes the new number on January 1 after 12 months pass.',
  'k-767d':'Fresh snow and blank paper share this color.',
  'k-516b':'The flash card with 8 is held up in front of the class.',
  'k-767e':'The toy store poster advertises an item for 100 yen.',
  'k-6587':'A student turns in a short essay made of several written lines.',
  'k-6728':'A squirrel runs up the trunk in the park.',
  'k-672c':'The student borrows a novel from the library.',
  'k-540d':'On the first day of class, everyone writes what they are called on a tag.',
  'k-76ee':'The optometrist asks the child to read the chart.',
  'k-7acb':'When the principal enters, the whole class rises from their chairs.',
  'k-529b':'The heavy box will not move without strong muscles.',
  'k-6797':'A short trail passes through a small cluster of trees.',
  'k-516d':'The teacher points to the card marked 6.',
};

for (const cmd of KANJI_G1.commands) {
  cmd.dom = 'g1';
  cmd.tier = CORE_IDS.has(cmd.id) ? 'core' : 'regular';
  if (cmd.id === 'k-4e00' && cmd.subconcepts[0]) cmd.subconcepts[0].wrong = ['2','3'];
  cmd.blanks.forEach((blank, index) => {
    blank.choices = buildBlankChoices(cmd, blank, index);
  });
}

for (const cmd of KANJI_G1.commands) {
  const extras = (VARIABLE_AUGMENTS[cmd.id] || []).map(([s, d]) => ({s, d}));
  VARIABLE_BANK[cmd.id] = uniqueBy([...(VARIABLE_BANK[cmd.id] || []), ...extras], entry => `${entry.s}|${entry.d}`).slice(0, 3);
  APPLICATION_BANK[cmd.id] = [{
    scenario: APPLICATION_SCENARIOS[cmd.id],
    confusionSet: CONFUSABLE_MAP[cmd.id].slice(0, 3),
  }];
}

const SHARED_PREREQ_NODES = {
  // L2: Radical recognition nodes
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
  // L3: Conceptual groupings
  'body-parts':{id:'body-parts',type:'conceptual',level:3,q:'Name Grade 1 body-part kanji',correct:'目 耳 口 手 足 (eye, ear, mouth, hand, foot)',wrong:['山 川 田','一 二 三'],prereqs:['radical-eye','radical-mouth','radical-hand']},
  'nature-elements':{id:'nature-elements',type:'conceptual',level:3,q:'Name the 5 classical element kanji',correct:'火 水 木 金 土 (fire, water, tree, metal, earth)',wrong:['上 下 左 右','一 二 三 四 五'],prereqs:['radical-fire','radical-water','radical-tree','radical-earth']},
  'direction-concepts':{id:'direction-concepts',type:'conceptual',level:3,q:'Name the direction/position kanji',correct:'上 下 左 右 中 (above, below, left, right, middle)',wrong:['一 二 三','男 女 子'],prereqs:[]},
  'number-system':{id:'number-system',type:'conceptual',level:3,q:'Order: 十 百 千',correct:'十(10) → 百(100) → 千(1000)',wrong:['千→百→十','百→千→十'],prereqs:[]},
  'tree-density':{id:'tree-density',type:'conceptual',level:3,q:'Order by vegetation density',correct:'木(1 tree) → 林(2=grove) → 森(3=forest)',wrong:['森→林→木','林→木→森'],prereqs:['radical-tree']},
  'similar-kanji-dai':{id:'similar-kanji-dai',type:'conceptual',level:3,q:'Distinguish: 大 犬 太 天',correct:'大=big, 犬=dog(dot right), 太=fat(dot left), 天=heaven(top bar)',wrong:['All identical','Only size differs'],prereqs:[]},
  'similar-kanji-nichi':{id:'similar-kanji-nichi',type:'conceptual',level:3,q:'Distinguish: 日 目 白 田',correct:'日=sun(tall), 目=eye(wide), 白=white(top stroke), 田=field(cross)',wrong:['All identical','Only width differs'],prereqs:['radical-sun','radical-eye','radical-field']},
  // L4: Reading foundations
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
  // L5: Leaf
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
    [/radical.*金|metal|金/i, ['radical-metal']],
    [/component/i, ['stroke-basics']],
    [/stroke/i, ['stroke-basics']],
    [/大.*犬|犬.*大|太.*天/i, ['similar-kanji-dai']],
    [/日.*目|目.*日|白.*田/i, ['similar-kanji-nichi']],
    [/木.*林.*森|grove.*forest|density/i, ['tree-density']],
    [/十.*百.*千|hundred.*thousand/i, ['number-system']],
    [/body.*part|目.*耳|hand.*foot/i, ['body-parts']],
    [/element|火.*水.*木|nature/i, ['nature-elements']],
    [/direction|上.*下|左.*右/i, ['direction-concepts']],
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

// ── Export ──
KANJI_G1.variableBank = VARIABLE_BANK;
KANJI_G1.applicationBank = APPLICATION_BANK;
KANJI_G1.relationshipBank = RELATIONSHIP_BANK;
KANJI_G1.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G1.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G1.domLabels = DOM_LABELS;
KANJI_G1.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G1.normalizeExplanationLookup = function(s) { return s.toLowerCase().trim().replace(/\s+/g,'-'); };
KANJI_G1.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[KANJI_G1.normalizeExplanationLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G1.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G1);
window.KANJI_G1_CARTRIDGE = KANJI_G1;
})();
