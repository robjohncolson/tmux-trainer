// Jōyō Kanji Grade 1 — Formula Defense Cartridge
// 80 kanji commands with full banks
(function(){

function shuffleArr(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const KANJI_G1 = {
  id: 'joyo-kanji-g1',
  name: 'Jōyō Kanji · Grade 1',
  description: 'Kanji defense for the 80 Grade 1 (小学一年) Jōyō kanji',
  icon: '漢',
  inputMode: 'quiz',
  prefixLabel: null,
  title: 'KANJI 一年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  instructions: 'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Wrong answers spawn sub-questions on radicals and readings.',
  instructionsSub: 'Grade 1 · 80 kanji · kun\'yomi & on\'yomi',

  commands: [
    {id:'g1-ichi',action:'一 — One',tier:'core',dom:'g1',
      hint:'ひと(つ) / イチ',explain:'Single horizontal stroke — one.',
      latex:'\\Huge{一}',
      blanks:[
        {latex:'一 reading → \\boxed{\\,?\\,}',answer:'ひとつ',choices:['ひとつ','みみ','き']},
        {latex:'一 meaning → \\boxed{\\,?\\,}',answer:'one',choices:['one','school','rest']},
        {latex:'一 strokes → \\boxed{\\,?\\,}',answer:'1',choices:['1','2','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 一?',correct:'イチ',wrong:['ケン','ギョク']},
        {q:'What is the kun\'yomi of 一?',correct:'ひと(つ)',wrong:['かね','そら']},
        {q:'How many strokes in 一?',correct:'1 stroke',wrong:['2 strokes','2 strokes']}
      ]},
    {id:'g1-migi',action:'右 — Right',tier:'core',dom:'g1',
      hint:'みぎ / ウ・ユウ',explain:'Hand (ナ) + mouth (口) — the right hand.',
      latex:'\\Huge{右}',
      blanks:[
        {latex:'右 reading → \\boxed{\\,?\\,}',answer:'みぎ',choices:['みぎ','ななつ','くるま']},
        {latex:'右 meaning → \\boxed{\\,?\\,}',answer:'right',choices:['right','ear','thread']},
        {latex:'右 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 右?',correct:'ウ / ユウ',wrong:['ケン','ケン']},
        {q:'What is the kun\'yomi of 右?',correct:'みぎ',wrong:['つき','いつ(つ)']},
        {q:'How many strokes in 右?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-ame',action:'雨 — Rain',tier:'core',dom:'g1',
      hint:'あめ / ウ',explain:'Pictograph of rain falling from clouds.',
      latex:'\\Huge{雨}',
      blanks:[
        {latex:'雨 reading → \\boxed{\\,?\\,}',answer:'あめ',choices:['あめ','そら','ここのつ']},
        {latex:'雨 meaning → \\boxed{\\,?\\,}',answer:'rain',choices:['rain','mouth','jewel']},
        {latex:'雨 strokes → \\boxed{\\,?\\,}',answer:'8',choices:['8','7','9']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 雨?',correct:'ウ',wrong:['ゲツ','キュウ']},
        {q:'What is the kun\'yomi of 雨?',correct:'あめ',wrong:['かね','みぎ']},
        {q:'How many strokes in 雨?',correct:'8 strokes',wrong:['7 strokes','9 strokes']}
      ]},
    {id:'g1-en',action:'円 — Circle/Yen',tier:'core',dom:'g1',
      hint:'まる(い) / エン',explain:'Simplified 圓. Circle or yen currency.',
      latex:'\\Huge{円}',
      blanks:[
        {latex:'円 reading → \\boxed{\\,?\\,}',answer:'まるい',choices:['まるい','まなぶ','くるま']},
        {latex:'円 meaning → \\boxed{\\,?\\,}',answer:'circle',choices:['circle','child','below']},
        {latex:'円 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 円?',correct:'エン',wrong:['クウ','ギョク']},
        {q:'What is the kun\'yomi of 円?',correct:'まる(い)',wrong:['みぎ','いぬ']},
        {q:'How many strokes in 円?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-ou',action:'王 — King',tier:'core',dom:'g1',
      hint:'— / オウ',explain:'Three lines connected by vertical — king unites all.',
      latex:'\\Huge{王}',
      blanks:[
        {latex:'王 reading → \\boxed{\\,?\\,}',answer:'オウ',choices:['オウ','つき','たま']},
        {latex:'王 meaning → \\boxed{\\,?\\,}',answer:'king',choices:['king','jewel','sound']},
        {latex:'王 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 王?',correct:'オウ',wrong:['ゴ','ガク']},
        {q:'What does 王 mean?',correct:'King',wrong:['jewel','sound']},
        {q:'How many strokes in 王?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-oto',action:'音 — Sound',tier:'core',dom:'g1',
      hint:'おと / オン・イン',explain:'Stand (立) + sun (日) — sound.',
      latex:'\\Huge{音}',
      blanks:[
        {latex:'音 reading → \\boxed{\\,?\\,}',answer:'おと',choices:['おと','くち','かい']},
        {latex:'音 meaning → \\boxed{\\,?\\,}',answer:'sound',choices:['sound','five','four']},
        {latex:'音 strokes → \\boxed{\\,?\\,}',answer:'9',choices:['9','8','10']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 音?',correct:'オン / イン',wrong:['ギョク','キン']},
        {q:'What is the kun\'yomi of 音?',correct:'おと',wrong:['そら','みぎ']},
        {q:'How many strokes in 音?',correct:'9 strokes',wrong:['8 strokes','10 strokes']}
      ]},
    {id:'g1-shita',action:'下 — Below',tier:'core',dom:'g1',
      hint:'した・くだ(る) / カ・ゲ',explain:'Stroke pointing down below a line.',
      latex:'\\Huge{下}',
      blanks:[
        {latex:'下 reading → \\boxed{\\,?\\,}',answer:'した',choices:['した','いつつ','じ']},
        {latex:'下 meaning → \\boxed{\\,?\\,}',answer:'below',choices:['below','dog','circle']},
        {latex:'下 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 下?',correct:'カ / ゲ',wrong:['ゲツ','バイ']},
        {q:'What is the kun\'yomi of 下?',correct:'した / くだ(る)',wrong:['みぎ','き']},
        {q:'How many strokes in 下?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-hi',action:'火 — Fire',tier:'core',dom:'g1',
      hint:'ひ / カ',explain:'Pictograph of flames.',
      latex:'\\Huge{火}',
      blanks:[
        {latex:'火 reading → \\boxed{\\,?\\,}',answer:'ひ',choices:['ひ','まなぶ','くち']},
        {latex:'火 meaning → \\boxed{\\,?\\,}',answer:'fire',choices:['fire','dog','nine']},
        {latex:'火 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 火?',correct:'カ',wrong:['キ','イチ']},
        {q:'What is the kun\'yomi of 火?',correct:'ひ',wrong:['あめ','つき']},
        {q:'How many strokes in 火?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-hana',action:'花 — Flower',tier:'core',dom:'g1',
      hint:'はな / カ',explain:'Grass (艹) + change (化) — flowers.',
      latex:'\\Huge{花}',
      blanks:[
        {latex:'花 reading → \\boxed{\\,?\\,}',answer:'はな',choices:['はな','やま','みる']},
        {latex:'花 meaning → \\boxed{\\,?\\,}',answer:'flower',choices:['flower','child','moon']},
        {latex:'花 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 花?',correct:'カ',wrong:['オウ','ウ']},
        {q:'What is the kun\'yomi of 花?',correct:'はな',wrong:['つき','まな(ぶ)']},
        {q:'How many strokes in 花?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-kai',action:'貝 — Shell',tier:'core',dom:'g1',
      hint:'かい / バイ',explain:'Pictograph of cowrie shell — ancient currency.',
      latex:'\\Huge{貝}',
      blanks:[
        {latex:'貝 reading → \\boxed{\\,?\\,}',answer:'かい',choices:['かい','そら','やすむ']},
        {latex:'貝 meaning → \\boxed{\\,?\\,}',answer:'shell',choices:['shell','nine','circle']},
        {latex:'貝 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 貝?',correct:'バイ',wrong:['オン','カ']},
        {q:'What is the kun\'yomi of 貝?',correct:'かい',wrong:['はな','まる(い)']},
        {q:'How many strokes in 貝?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-gaku',action:'学 — Study',tier:'core',dom:'g1',
      hint:'まな(ぶ) / ガク',explain:'Child (子) under roof learning.',
      latex:'\\Huge{学}',
      blanks:[
        {latex:'学 reading → \\boxed{\\,?\\,}',answer:'まなぶ',choices:['まなぶ','ななつ','ひだり']},
        {latex:'学 meaning → \\boxed{\\,?\\,}',answer:'study',choices:['study','jewel','see']},
        {latex:'学 strokes → \\boxed{\\,?\\,}',answer:'8',choices:['8','7','9']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 学?',correct:'ガク',wrong:['キ','バイ']},
        {q:'What is the kun\'yomi of 学?',correct:'まな(ぶ)',wrong:['あめ','き']},
        {q:'How many strokes in 学?',correct:'8 strokes',wrong:['7 strokes','9 strokes']}
      ]},
    {id:'g1-ki',action:'気 — Spirit/Air',tier:'core',dom:'g1',
      hint:'き / キ・ケ',explain:'Simplified 氣. Steam rising — spirit, mood.',
      latex:'\\Huge{気}',
      blanks:[
        {latex:'気 reading → \\boxed{\\,?\\,}',answer:'き',choices:['き','やすむ','かい']},
        {latex:'気 meaning → \\boxed{\\,?\\,}',answer:'spirit',choices:['spirit','shell','mouth']},
        {latex:'気 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 気?',correct:'キ / ケ',wrong:['ケン','オン']},
        {q:'What is the kun\'yomi of 気?',correct:'き',wrong:['まな(ぶ)','ひと(つ)']},
        {q:'How many strokes in 気?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-kyuu',action:'九 — Nine',tier:'core',dom:'g1',
      hint:'ここの(つ) / キュウ・ク',explain:'Two strokes — nine.',
      latex:'\\Huge{九}',
      blanks:[
        {latex:'九 reading → \\boxed{\\,?\\,}',answer:'ここのつ',choices:['ここのつ','き','ひだり']},
        {latex:'九 meaning → \\boxed{\\,?\\,}',answer:'nine',choices:['nine','ear','circle']},
        {latex:'九 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 九?',correct:'キュウ / ク',wrong:['キュウ','ケン']},
        {q:'What is the kun\'yomi of 九?',correct:'ここの(つ)',wrong:['あめ','はな']},
        {q:'How many strokes in 九?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-yasumu',action:'休 — Rest',tier:'core',dom:'g1',
      hint:'やす(む) / キュウ',explain:'Person (亻) + tree (木) — resting against a tree.',
      latex:'\\Huge{休}',
      blanks:[
        {latex:'休 reading → \\boxed{\\,?\\,}',answer:'やすむ',choices:['やすむ','まるい','ここのつ']},
        {latex:'休 meaning → \\boxed{\\,?\\,}',answer:'rest',choices:['rest','see','rain']},
        {latex:'休 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 休?',correct:'キュウ',wrong:['イチ','ウ']},
        {q:'What is the kun\'yomi of 休?',correct:'やす(む)',wrong:['いぬ','み(る)']},
        {q:'How many strokes in 休?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-tama',action:'玉 — Jewel',tier:'core',dom:'g1',
      hint:'たま / ギョク',explain:'King (王) + dot — a precious stone.',
      latex:'\\Huge{玉}',
      blanks:[
        {latex:'玉 reading → \\boxed{\\,?\\,}',answer:'たま',choices:['たま','よっつ','くるま']},
        {latex:'玉 meaning → \\boxed{\\,?\\,}',answer:'jewel',choices:['jewel','shell','school']},
        {latex:'玉 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 玉?',correct:'ギョク',wrong:['カ','キ']},
        {q:'What is the kun\'yomi of 玉?',correct:'たま',wrong:['み(る)','おと']},
        {q:'How many strokes in 玉?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-kane',action:'金 — Gold/Money',tier:'core',dom:'g1',
      hint:'かね / キン・コン',explain:'Nuggets under a roof — gold, metal, money.',
      latex:'\\Huge{金}',
      blanks:[
        {latex:'金 reading → \\boxed{\\,?\\,}',answer:'かね',choices:['かね','ななつ','みっつ']},
        {latex:'金 meaning → \\boxed{\\,?\\,}',answer:'gold',choices:['gold','rest','nine']},
        {latex:'金 strokes → \\boxed{\\,?\\,}',answer:'8',choices:['8','7','9']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 金?',correct:'キン / コン',wrong:['ウ','バイ']},
        {q:'What is the kun\'yomi of 金?',correct:'かね',wrong:['おと','みぎ']},
        {q:'How many strokes in 金?',correct:'8 strokes',wrong:['7 strokes','9 strokes']}
      ]},
    {id:'g1-sora',action:'空 — Sky/Empty',tier:'core',dom:'g1',
      hint:'そら・あ(く) / クウ',explain:'Hole (穴) + work (工) — sky, emptiness.',
      latex:'\\Huge{空}',
      blanks:[
        {latex:'空 reading → \\boxed{\\,?\\,}',answer:'そら',choices:['そら','くち','こ']},
        {latex:'空 meaning → \\boxed{\\,?\\,}',answer:'sky',choices:['sky','below','shell']},
        {latex:'空 strokes → \\boxed{\\,?\\,}',answer:'8',choices:['8','7','9']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 空?',correct:'クウ',wrong:['キュウ','ゴ']},
        {q:'What is the kun\'yomi of 空?',correct:'そら / あ(く)',wrong:['たま','かね']},
        {q:'How many strokes in 空?',correct:'8 strokes',wrong:['7 strokes','9 strokes']}
      ]},
    {id:'g1-tsuki',action:'月 — Moon/Month',tier:'core',dom:'g1',
      hint:'つき / ゲツ・ガツ',explain:'Crescent moon pictograph. Also means month.',
      latex:'\\Huge{月}',
      blanks:[
        {latex:'月 reading → \\boxed{\\,?\\,}',answer:'つき',choices:['つき','いぬ','かい']},
        {latex:'月 meaning → \\boxed{\\,?\\,}',answer:'moon',choices:['moon','jewel','see']},
        {latex:'月 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 月?',correct:'ゲツ / ガツ',wrong:['キュウ','ケン']},
        {q:'What is the kun\'yomi of 月?',correct:'つき',wrong:['たま','き']},
        {q:'How many strokes in 月?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-inu',action:'犬 — Dog',tier:'core',dom:'g1',
      hint:'いぬ / ケン',explain:'Big (大) + dot — a dog.',
      latex:'\\Huge{犬}',
      blanks:[
        {latex:'犬 reading → \\boxed{\\,?\\,}',answer:'いぬ',choices:['いぬ','ななつ','あめ']},
        {latex:'犬 meaning → \\boxed{\\,?\\,}',answer:'dog',choices:['dog','gold','shell']},
        {latex:'犬 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 犬?',correct:'ケン',wrong:['クウ','ガク']},
        {q:'What is the kun\'yomi of 犬?',correct:'いぬ',wrong:['みぎ','そら']},
        {q:'How many strokes in 犬?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-miru',action:'見 — See',tier:'core',dom:'g1',
      hint:'み(る) / ケン',explain:'Eye (目) on legs (儿) — to see.',
      latex:'\\Huge{見}',
      blanks:[
        {latex:'見 reading → \\boxed{\\,?\\,}',answer:'みる',choices:['みる','ひ','くち']},
        {latex:'見 meaning → \\boxed{\\,?\\,}',answer:'see',choices:['see','rest','dog']},
        {latex:'見 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 見?',correct:'ケン',wrong:['キ','イチ']},
        {q:'What is the kun\'yomi of 見?',correct:'み(る)',wrong:['まる(い)','いぬ']},
        {q:'How many strokes in 見?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-go',action:'五 — Five',tier:'core',dom:'g1',
      hint:'いつ(つ) / ゴ',explain:'Crossing strokes — five.',
      latex:'\\Huge{五}',
      blanks:[
        {latex:'五 reading → \\boxed{\\,?\\,}',answer:'いつつ',choices:['いつつ','ななつ','した']},
        {latex:'五 meaning → \\boxed{\\,?\\,}',answer:'five',choices:['five','fire','sky']},
        {latex:'五 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 五?',correct:'ゴ',wrong:['ケン','カ']},
        {q:'What is the kun\'yomi of 五?',correct:'いつ(つ)',wrong:['ひと(つ)','ここの(つ)']},
        {q:'How many strokes in 五?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-kuchi',action:'口 — Mouth',tier:'core',dom:'g1',
      hint:'くち / コウ・ク',explain:'Open mouth pictograph. Common radical.',
      latex:'\\Huge{口}',
      blanks:[
        {latex:'口 reading → \\boxed{\\,?\\,}',answer:'くち',choices:['くち','かね','いぬ']},
        {latex:'口 meaning → \\boxed{\\,?\\,}',answer:'mouth',choices:['mouth','sky','thread']},
        {latex:'口 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 口?',correct:'コウ / ク',wrong:['キ','ギョク']},
        {q:'What is the kun\'yomi of 口?',correct:'くち',wrong:['はな','ひと(つ)']},
        {q:'How many strokes in 口?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-kou',action:'校 — School',tier:'regular',dom:'g1',
      hint:'— / コウ',explain:'Tree (木) + crossed (交) — school.',
      latex:'\\Huge{校}',
      blanks:[
        {latex:'校 reading → \\boxed{\\,?\\,}',answer:'コウ',choices:['コウ','みぎ','いつつ']},
        {latex:'校 meaning → \\boxed{\\,?\\,}',answer:'school',choices:['school','fire','character']},
        {latex:'校 strokes → \\boxed{\\,?\\,}',answer:'10',choices:['10','9','11']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 校?',correct:'コウ',wrong:['ガク','カ']},
        {q:'What does 校 mean?',correct:'School',wrong:['fire','character']},
        {q:'How many strokes in 校?',correct:'10 strokes',wrong:['9 strokes','11 strokes']}
      ]},
    {id:'g1-hidari',action:'左 — Left',tier:'core',dom:'g1',
      hint:'ひだり / サ',explain:'Hand (ナ) + work (工) — left hand.',
      latex:'\\Huge{左}',
      blanks:[
        {latex:'左 reading → \\boxed{\\,?\\,}',answer:'ひだり',choices:['ひだり','つき','みっつ']},
        {latex:'左 meaning → \\boxed{\\,?\\,}',answer:'left',choices:['left','fire','mountain']},
        {latex:'左 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 左?',correct:'サ',wrong:['カ','カ']},
        {q:'What is the kun\'yomi of 左?',correct:'ひだり',wrong:['み(る)','した']},
        {q:'How many strokes in 左?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-san',action:'三 — Three',tier:'core',dom:'g1',
      hint:'みっ(つ) / サン',explain:'Three horizontal strokes.',
      latex:'\\Huge{三}',
      blanks:[
        {latex:'三 reading → \\boxed{\\,?\\,}',answer:'みっつ',choices:['みっつ','かい','かね']},
        {latex:'三 meaning → \\boxed{\\,?\\,}',answer:'three',choices:['three','thread','child']},
        {latex:'三 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 三?',correct:'サン',wrong:['ゲツ','エン']},
        {q:'What is the kun\'yomi of 三?',correct:'みっ(つ)',wrong:['き','あめ']},
        {q:'How many strokes in 三?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-yama',action:'山 — Mountain',tier:'core',dom:'g1',
      hint:'やま / サン・ザン',explain:'Three mountain peaks pictograph.',
      latex:'\\Huge{山}',
      blanks:[
        {latex:'山 reading → \\boxed{\\,?\\,}',answer:'やま',choices:['やま','そら','つき']},
        {latex:'山 meaning → \\boxed{\\,?\\,}',answer:'mountain',choices:['mountain','flower','below']},
        {latex:'山 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 山?',correct:'サン / ザン',wrong:['オウ','イチ']},
        {q:'What is the kun\'yomi of 山?',correct:'やま',wrong:['き','ここの(つ)']},
        {q:'How many strokes in 山?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-ko',action:'子 — Child',tier:'core',dom:'g1',
      hint:'こ / シ・ス',explain:'Baby with outstretched arms.',
      latex:'\\Huge{子}',
      blanks:[
        {latex:'子 reading → \\boxed{\\,?\\,}',answer:'こ',choices:['こ','みる','いと']},
        {latex:'子 meaning → \\boxed{\\,?\\,}',answer:'child',choices:['child','rain','three']},
        {latex:'子 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 子?',correct:'シ / ス',wrong:['ケン','キン']},
        {q:'What is the kun\'yomi of 子?',correct:'こ',wrong:['ひ','いつ(つ)']},
        {q:'How many strokes in 子?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-shi',action:'四 — Four',tier:'core',dom:'g1',
      hint:'よっ(つ)・よん / シ',explain:'Enclosure with divided interior — four.',
      latex:'\\Huge{四}',
      blanks:[
        {latex:'四 reading → \\boxed{\\,?\\,}',answer:'よっつ',choices:['よっつ','やま','した']},
        {latex:'四 meaning → \\boxed{\\,?\\,}',answer:'four',choices:['four','moon','spirit']},
        {latex:'四 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 四?',correct:'シ',wrong:['ケン','カ']},
        {q:'What is the kun\'yomi of 四?',correct:'よっ(つ) / よん',wrong:['たま','はな']},
        {q:'How many strokes in 四?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-ito',action:'糸 — Thread',tier:'regular',dom:'g1',
      hint:'いと / シ',explain:'Twisted silk threads pictograph.',
      latex:'\\Huge{糸}',
      blanks:[
        {latex:'糸 reading → \\boxed{\\,?\\,}',answer:'いと',choices:['いと','あめ','よっつ']},
        {latex:'糸 meaning → \\boxed{\\,?\\,}',answer:'thread',choices:['thread','nine','left']},
        {latex:'糸 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 糸?',correct:'シ',wrong:['クウ','エン']},
        {q:'What is the kun\'yomi of 糸?',correct:'いと',wrong:['そら','ひ']},
        {q:'How many strokes in 糸?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-ji',action:'字 — Character',tier:'regular',dom:'g1',
      hint:'じ / ジ',explain:'Child (子) under roof (宀) — character/letter.',
      latex:'\\Huge{字}',
      blanks:[
        {latex:'字 reading → \\boxed{\\,?\\,}',answer:'じ',choices:['じ','いと','くるま']},
        {latex:'字 meaning → \\boxed{\\,?\\,}',answer:'character',choices:['character','rain','shell']},
        {latex:'字 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 字?',correct:'ジ',wrong:['キ','バイ']},
        {q:'What is the kun\'yomi of 字?',correct:'じ',wrong:['かね','みぎ']},
        {q:'How many strokes in 字?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-mimi',action:'耳 — Ear',tier:'regular',dom:'g1',
      hint:'みみ / ジ',explain:'Ear pictograph.',
      latex:'\\Huge{耳}',
      blanks:[
        {latex:'耳 reading → \\boxed{\\,?\\,}',answer:'みみ',choices:['みみ','やすむ','ひだり']},
        {latex:'耳 meaning → \\boxed{\\,?\\,}',answer:'ear',choices:['ear','mouth','school']},
        {latex:'耳 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 耳?',correct:'ジ',wrong:['イチ','キン']},
        {q:'What is the kun\'yomi of 耳?',correct:'みみ',wrong:['み(る)','まる(い)']},
        {q:'How many strokes in 耳?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-nana',action:'七 — Seven',tier:'core',dom:'g1',
      hint:'なな(つ) / シチ',explain:'Two crossing strokes — seven.',
      latex:'\\Huge{七}',
      blanks:[
        {latex:'七 reading → \\boxed{\\,?\\,}',answer:'ななつ',choices:['ななつ','まるい','じ']},
        {latex:'七 meaning → \\boxed{\\,?\\,}',answer:'seven',choices:['seven','right','sky']},
        {latex:'七 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 七?',correct:'シチ',wrong:['クウ','キ']},
        {q:'What is the kun\'yomi of 七?',correct:'なな(つ)',wrong:['あめ','き']},
        {q:'How many strokes in 七?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-kuruma',action:'車 — Car/Vehicle',tier:'core',dom:'g1',
      hint:'くるま / シャ',explain:'Cart seen from above — vehicle.',
      latex:'\\Huge{車}',
      blanks:[
        {latex:'車 reading → \\boxed{\\,?\\,}',answer:'くるま',choices:['くるま','みっつ','き']},
        {latex:'車 meaning → \\boxed{\\,?\\,}',answer:'car',choices:['car','gold','four']},
        {latex:'車 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 車?',correct:'シャ',wrong:['オン','エン']},
        {q:'What is the kun\'yomi of 車?',correct:'くるま',wrong:['まる(い)','おと']},
        {q:'How many strokes in 車?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-te',action:'手 — Hand',tier:'core',dom:'g1',
      hint:'て / シュ',explain:'Hand with fingers pictograph.',
      latex:'\\Huge{手}',
      blanks:[
        {latex:'手 reading → \\boxed{\\,?\\,}',answer:'て',choices:['て','みっつ','いぬ']},
        {latex:'手 meaning → \\boxed{\\,?\\,}',answer:'hand',choices:['hand','king','left']},
        {latex:'手 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 手?',correct:'シュ',wrong:['エン','カ']},
        {q:'What is the kun\'yomi of 手?',correct:'て',wrong:['ここの(つ)','まな(ぶ)']},
        {q:'How many strokes in 手?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-juu',action:'十 — Ten',tier:'core',dom:'g1',
      hint:'とお / ジュウ',explain:'Cross shape — ten.',
      latex:'\\Huge{十}',
      blanks:[
        {latex:'十 reading → \\boxed{\\,?\\,}',answer:'とお',choices:['とお','まるい','よっつ']},
        {latex:'十 meaning → \\boxed{\\,?\\,}',answer:'ten',choices:['ten','moon','jewel']},
        {latex:'十 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 十?',correct:'ジュウ',wrong:['キュウ','カ']},
        {q:'What is the kun\'yomi of 十?',correct:'とお',wrong:['き','いつ(つ)']},
        {q:'How many strokes in 十?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-deru',action:'出 — Exit/Go out',tier:'regular',dom:'g1',
      hint:'で(る)・だ(す) / シュツ',explain:'Stacked mountain shapes — going out.',
      latex:'\\Huge{出}',
      blanks:[
        {latex:'出 reading → \\boxed{\\,?\\,}',answer:'でる',choices:['でる','いと','ひ']},
        {latex:'出 meaning → \\boxed{\\,?\\,}',answer:'exit',choices:['exit','mouth','left']},
        {latex:'出 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 出?',correct:'シュツ',wrong:['カ','ケン']},
        {q:'What is the kun\'yomi of 出?',correct:'で(る) / だ(す)',wrong:['たま','おと']},
        {q:'How many strokes in 出?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-onna',action:'女 — Woman',tier:'core',dom:'g1',
      hint:'おんな / ジョ・ニョ',explain:'Kneeling person — woman.',
      latex:'\\Huge{女}',
      blanks:[
        {latex:'女 reading → \\boxed{\\,?\\,}',answer:'おんな',choices:['おんな','つき','くち']},
        {latex:'女 meaning → \\boxed{\\,?\\,}',answer:'woman',choices:['woman','dog','four']},
        {latex:'女 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 女?',correct:'ジョ / ニョ',wrong:['イチ','キュウ']},
        {q:'What is the kun\'yomi of 女?',correct:'おんな',wrong:['おと','そら']},
        {q:'How many strokes in 女?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-chiisai',action:'小 — Small',tier:'core',dom:'g1',
      hint:'ちい(さい)・こ / ショウ',explain:'Vertical line being divided — small.',
      latex:'\\Huge{小}',
      blanks:[
        {latex:'小 reading → \\boxed{\\,?\\,}',answer:'ちいさい',choices:['ちいさい','じ','くち']},
        {latex:'小 meaning → \\boxed{\\,?\\,}',answer:'small',choices:['small','flower','school']},
        {latex:'小 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 小?',correct:'ショウ',wrong:['バイ','イチ']},
        {q:'What is the kun\'yomi of 小?',correct:'ちい(さい) / こ',wrong:['した','はな']},
        {q:'How many strokes in 小?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-ue',action:'上 — Above',tier:'core',dom:'g1',
      hint:'うえ・あ(がる) / ジョウ',explain:'Stroke above a line — above, up.',
      latex:'\\Huge{上}',
      blanks:[
        {latex:'上 reading → \\boxed{\\,?\\,}',answer:'うえ',choices:['うえ','ひとつ','みる']},
        {latex:'上 meaning → \\boxed{\\,?\\,}',answer:'above',choices:['above','school','circle']},
        {latex:'上 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 上?',correct:'ジョウ',wrong:['オウ','ギョク']},
        {q:'What is the kun\'yomi of 上?',correct:'うえ / あ(がる)',wrong:['たま','いぬ']},
        {q:'How many strokes in 上?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-mori',action:'森 — Forest',tier:'regular',dom:'g1',
      hint:'もり / シン',explain:'Three trees (木) — dense forest.',
      latex:'\\Huge{森}',
      blanks:[
        {latex:'森 reading → \\boxed{\\,?\\,}',answer:'もり',choices:['もり','たま','よっつ']},
        {latex:'森 meaning → \\boxed{\\,?\\,}',answer:'forest',choices:['forest','moon','left']},
        {latex:'森 strokes → \\boxed{\\,?\\,}',answer:'12',choices:['12','11','13']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 森?',correct:'シン',wrong:['バイ','ゲツ']},
        {q:'What is the kun\'yomi of 森?',correct:'もり',wrong:['した','あめ']},
        {q:'How many strokes in 森?',correct:'12 strokes',wrong:['11 strokes','13 strokes']}
      ]},
    {id:'g1-hito',action:'人 — Person',tier:'core',dom:'g1',
      hint:'ひと / ジン・ニン',explain:'Standing person pictograph.',
      latex:'\\Huge{人}',
      blanks:[
        {latex:'人 reading → \\boxed{\\,?\\,}',answer:'ひと',choices:['ひと','き','はな']},
        {latex:'人 meaning → \\boxed{\\,?\\,}',answer:'person',choices:['person','school','circle']},
        {latex:'人 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 人?',correct:'ジン / ニン',wrong:['ウ','カ']},
        {q:'What is the kun\'yomi of 人?',correct:'ひと',wrong:['おと','ひと(つ)']},
        {q:'How many strokes in 人?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-mizu',action:'水 — Water',tier:'core',dom:'g1',
      hint:'みず / スイ',explain:'Flowing water pictograph.',
      latex:'\\Huge{水}',
      blanks:[
        {latex:'水 reading → \\boxed{\\,?\\,}',answer:'みず',choices:['みず','みっつ','はな']},
        {latex:'水 meaning → \\boxed{\\,?\\,}',answer:'water',choices:['water','left','rain']},
        {latex:'水 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 水?',correct:'スイ',wrong:['ウ','キュウ']},
        {q:'What is the kun\'yomi of 水?',correct:'みず',wrong:['あめ','ここの(つ)']},
        {q:'How many strokes in 水?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-tadashii',action:'正 — Correct',tier:'regular',dom:'g1',
      hint:'ただ(しい) / セイ・ショウ',explain:'One (一) + stop (止) — the correct way.',
      latex:'\\Huge{正}',
      blanks:[
        {latex:'正 reading → \\boxed{\\,?\\,}',answer:'ただしい',choices:['ただしい','した','おと']},
        {latex:'正 meaning → \\boxed{\\,?\\,}',answer:'correct',choices:['correct','gold','right']},
        {latex:'正 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 正?',correct:'セイ / ショウ',wrong:['キン','ギョク']},
        {q:'What is the kun\'yomi of 正?',correct:'ただ(しい)',wrong:['まな(ぶ)','おと']},
        {q:'How many strokes in 正?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-sei',action:'生 — Life/Birth',tier:'core',dom:'g1',
      hint:'い(きる)・う(まれる) / セイ・ショウ',explain:'Plant sprouting — life, birth.',
      latex:'\\Huge{生}',
      blanks:[
        {latex:'生 reading → \\boxed{\\,?\\,}',answer:'いきる',choices:['いきる','ひ','みぎ']},
        {latex:'生 meaning → \\boxed{\\,?\\,}',answer:'life',choices:['life','king','circle']},
        {latex:'生 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 生?',correct:'セイ / ショウ',wrong:['ケン','ギョク']},
        {q:'What is the kun\'yomi of 生?',correct:'い(きる) / う(まれる)',wrong:['みぎ','まな(ぶ)']},
        {q:'How many strokes in 生?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-ao',action:'青 — Blue/Green',tier:'regular',dom:'g1',
      hint:'あお(い) / セイ・ショウ',explain:'Growth over moon — blue-green.',
      latex:'\\Huge{青}',
      blanks:[
        {latex:'青 reading → \\boxed{\\,?\\,}',answer:'あおい',choices:['あおい','まるい','よっつ']},
        {latex:'青 meaning → \\boxed{\\,?\\,}',answer:'blue',choices:['blue','sky','left']},
        {latex:'青 strokes → \\boxed{\\,?\\,}',answer:'8',choices:['8','7','9']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 青?',correct:'セイ / ショウ',wrong:['カ','カ']},
        {q:'What is the kun\'yomi of 青?',correct:'あお(い)',wrong:['ここの(つ)','つき']},
        {q:'How many strokes in 青?',correct:'8 strokes',wrong:['7 strokes','9 strokes']}
      ]},
    {id:'g1-yuube',action:'夕 — Evening',tier:'regular',dom:'g1',
      hint:'ゆう / セキ',explain:'Crescent moon — evening.',
      latex:'\\Huge{夕}',
      blanks:[
        {latex:'夕 reading → \\boxed{\\,?\\,}',answer:'ゆう',choices:['ゆう','やま','よっつ']},
        {latex:'夕 meaning → \\boxed{\\,?\\,}',answer:'evening',choices:['evening','left','school']},
        {latex:'夕 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 夕?',correct:'セキ',wrong:['キュウ','キ']},
        {q:'What is the kun\'yomi of 夕?',correct:'ゆう',wrong:['かね','ひ']},
        {q:'How many strokes in 夕?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-ishi',action:'石 — Stone',tier:'regular',dom:'g1',
      hint:'いし / セキ・シャク',explain:'Cliff (厂) + rock (口) — stone.',
      latex:'\\Huge{石}',
      blanks:[
        {latex:'石 reading → \\boxed{\\,?\\,}',answer:'いし',choices:['いし','ななつ','こ']},
        {latex:'石 meaning → \\boxed{\\,?\\,}',answer:'stone',choices:['stone','sky','one']},
        {latex:'石 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 石?',correct:'セキ / シャク',wrong:['クウ','オン']},
        {q:'What is the kun\'yomi of 石?',correct:'いし',wrong:['き','おと']},
        {q:'How many strokes in 石?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-aka',action:'赤 — Red',tier:'regular',dom:'g1',
      hint:'あか(い) / セキ',explain:'Earth + fire — heated red glow.',
      latex:'\\Huge{赤}',
      blanks:[
        {latex:'赤 reading → \\boxed{\\,?\\,}',answer:'あかい',choices:['あかい','まなぶ','よっつ']},
        {latex:'赤 meaning → \\boxed{\\,?\\,}',answer:'red',choices:['red','one','fire']},
        {latex:'赤 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 赤?',correct:'セキ',wrong:['キュウ','ケン']},
        {q:'What is the kun\'yomi of 赤?',correct:'あか(い)',wrong:['いぬ','ひ']},
        {q:'How many strokes in 赤?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-sen',action:'千 — Thousand',tier:'core',dom:'g1',
      hint:'ち / セン',explain:'Modified ten — thousand.',
      latex:'\\Huge{千}',
      blanks:[
        {latex:'千 reading → \\boxed{\\,?\\,}',answer:'ち',choices:['ち','まなぶ','ひ']},
        {latex:'千 meaning → \\boxed{\\,?\\,}',answer:'thousand',choices:['thousand','study','spirit']},
        {latex:'千 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 千?',correct:'セン',wrong:['カ','バイ']},
        {q:'What is the kun\'yomi of 千?',correct:'ち',wrong:['み(る)','いつ(つ)']},
        {q:'How many strokes in 千?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-kawa',action:'川 — River',tier:'core',dom:'g1',
      hint:'かわ / セン',explain:'Flowing water between banks — river.',
      latex:'\\Huge{川}',
      blanks:[
        {latex:'川 reading → \\boxed{\\,?\\,}',answer:'かわ',choices:['かわ','おと','ここのつ']},
        {latex:'川 meaning → \\boxed{\\,?\\,}',answer:'river',choices:['river','rain','left']},
        {latex:'川 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 川?',correct:'セン',wrong:['ケン','エン']},
        {q:'What is the kun\'yomi of 川?',correct:'かわ',wrong:['まる(い)','き']},
        {q:'How many strokes in 川?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-saki',action:'先 — Before/Ahead',tier:'regular',dom:'g1',
      hint:'さき / セン',explain:'Legs going forward — ahead.',
      latex:'\\Huge{先}',
      blanks:[
        {latex:'先 reading → \\boxed{\\,?\\,}',answer:'さき',choices:['さき','こ','くち']},
        {latex:'先 meaning → \\boxed{\\,?\\,}',answer:'before',choices:['before','rest','spirit']},
        {latex:'先 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 先?',correct:'セン',wrong:['ギョク','クウ']},
        {q:'What is the kun\'yomi of 先?',correct:'さき',wrong:['はな','ひ']},
        {q:'How many strokes in 先?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-hayai',action:'早 — Early',tier:'regular',dom:'g1',
      hint:'はや(い) / ソウ・サッ',explain:'Sun (日) + cross (十) — sun just up.',
      latex:'\\Huge{早}',
      blanks:[
        {latex:'早 reading → \\boxed{\\,?\\,}',answer:'はやい',choices:['はやい','はな','いぬ']},
        {latex:'早 meaning → \\boxed{\\,?\\,}',answer:'early',choices:['early','moon','left']},
        {latex:'早 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 早?',correct:'ソウ / サッ',wrong:['カ','ゲツ']},
        {q:'What is the kun\'yomi of 早?',correct:'はや(い)',wrong:['みぎ','き']},
        {q:'How many strokes in 早?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-kusa',action:'草 — Grass',tier:'regular',dom:'g1',
      hint:'くさ / ソウ',explain:'Grass (艹) + early (早) — grass.',
      latex:'\\Huge{草}',
      blanks:[
        {latex:'草 reading → \\boxed{\\,?\\,}',answer:'くさ',choices:['くさ','たま','みぎ']},
        {latex:'草 meaning → \\boxed{\\,?\\,}',answer:'grass',choices:['grass','gold','study']},
        {latex:'草 strokes → \\boxed{\\,?\\,}',answer:'9',choices:['9','8','10']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 草?',correct:'ソウ',wrong:['イチ','エン']},
        {q:'What is the kun\'yomi of 草?',correct:'くさ',wrong:['いぬ','そら']},
        {q:'How many strokes in 草?',correct:'9 strokes',wrong:['8 strokes','10 strokes']}
      ]},
    {id:'g1-ashi',action:'足 — Foot/Leg',tier:'core',dom:'g1',
      hint:'あし / ソク',explain:'Leg and foot pictograph. Also "enough."',
      latex:'\\Huge{足}',
      blanks:[
        {latex:'足 reading → \\boxed{\\,?\\,}',answer:'あし',choices:['あし','ひとつ','たま']},
        {latex:'足 meaning → \\boxed{\\,?\\,}',answer:'foot',choices:['foot','below','sound']},
        {latex:'足 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 足?',correct:'ソク',wrong:['ゲツ','ケン']},
        {q:'What is the kun\'yomi of 足?',correct:'あし',wrong:['たま','ひと(つ)']},
        {q:'How many strokes in 足?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-mura',action:'村 — Village',tier:'regular',dom:'g1',
      hint:'むら / ソン',explain:'Tree (木) + inch (寸) — village.',
      latex:'\\Huge{村}',
      blanks:[
        {latex:'村 reading → \\boxed{\\,?\\,}',answer:'むら',choices:['むら','くち','そら']},
        {latex:'村 meaning → \\boxed{\\,?\\,}',answer:'village',choices:['village','one','jewel']},
        {latex:'村 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 村?',correct:'ソン',wrong:['ゲツ','オウ']},
        {q:'What is the kun\'yomi of 村?',correct:'むら',wrong:['した','いぬ']},
        {q:'How many strokes in 村?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-ookii',action:'大 — Big',tier:'core',dom:'g1',
      hint:'おお(きい) / ダイ・タイ',explain:'Person with arms wide — big.',
      latex:'\\Huge{大}',
      blanks:[
        {latex:'大 reading → \\boxed{\\,?\\,}',answer:'おおきい',choices:['おおきい','まるい','みぎ']},
        {latex:'大 meaning → \\boxed{\\,?\\,}',answer:'big',choices:['big','flower','child']},
        {latex:'大 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 大?',correct:'ダイ / タイ',wrong:['キュウ','カ']},
        {q:'What is the kun\'yomi of 大?',correct:'おお(きい)',wrong:['たま','やす(む)']},
        {q:'How many strokes in 大?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-otoko',action:'男 — Man',tier:'core',dom:'g1',
      hint:'おとこ / ダン・ナン',explain:'Field (田) + power (力) — man.',
      latex:'\\Huge{男}',
      blanks:[
        {latex:'男 reading → \\boxed{\\,?\\,}',answer:'おとこ',choices:['おとこ','かね','たま']},
        {latex:'男 meaning → \\boxed{\\,?\\,}',answer:'man',choices:['man','circle','fire']},
        {latex:'男 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 男?',correct:'ダン / ナン',wrong:['バイ','クウ']},
        {q:'What is the kun\'yomi of 男?',correct:'おとこ',wrong:['まな(ぶ)','まる(い)']},
        {q:'How many strokes in 男?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-take',action:'竹 — Bamboo',tier:'regular',dom:'g1',
      hint:'たけ / チク',explain:'Bamboo leaves pictograph.',
      latex:'\\Huge{竹}',
      blanks:[
        {latex:'竹 reading → \\boxed{\\,?\\,}',answer:'たけ',choices:['たけ','おと','した']},
        {latex:'竹 meaning → \\boxed{\\,?\\,}',answer:'bamboo',choices:['bamboo','spirit','flower']},
        {latex:'竹 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 竹?',correct:'チク',wrong:['ウ','キ']},
        {q:'What is the kun\'yomi of 竹?',correct:'たけ',wrong:['みぎ','き']},
        {q:'How many strokes in 竹?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-naka',action:'中 — Middle/Inside',tier:'core',dom:'g1',
      hint:'なか / チュウ',explain:'Line through center of box — middle.',
      latex:'\\Huge{中}',
      blanks:[
        {latex:'中 reading → \\boxed{\\,?\\,}',answer:'なか',choices:['なか','みぎ','ここのつ']},
        {latex:'中 meaning → \\boxed{\\,?\\,}',answer:'middle',choices:['middle','rain','sound']},
        {latex:'中 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 中?',correct:'チュウ',wrong:['キン','ウ']},
        {q:'What is the kun\'yomi of 中?',correct:'なか',wrong:['たま','あめ']},
        {q:'How many strokes in 中?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-mushi',action:'虫 — Insect',tier:'regular',dom:'g1',
      hint:'むし / チュウ',explain:'Worm/insect pictograph.',
      latex:'\\Huge{虫}',
      blanks:[
        {latex:'虫 reading → \\boxed{\\,?\\,}',answer:'むし',choices:['むし','こ','あめ']},
        {latex:'虫 meaning → \\boxed{\\,?\\,}',answer:'insect',choices:['insect','spirit','mountain']},
        {latex:'虫 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 虫?',correct:'チュウ',wrong:['ゲツ','キュウ']},
        {q:'What is the kun\'yomi of 虫?',correct:'むし',wrong:['ひ','まる(い)']},
        {q:'How many strokes in 虫?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-machi',action:'町 — Town',tier:'regular',dom:'g1',
      hint:'まち / チョウ',explain:'Field (田) + street (丁) — town.',
      latex:'\\Huge{町}',
      blanks:[
        {latex:'町 reading → \\boxed{\\,?\\,}',answer:'まち',choices:['まち','かい','やま']},
        {latex:'町 meaning → \\boxed{\\,?\\,}',answer:'town',choices:['town','sky','sound']},
        {latex:'町 strokes → \\boxed{\\,?\\,}',answer:'7',choices:['7','6','8']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 町?',correct:'チョウ',wrong:['エン','キュウ']},
        {q:'What is the kun\'yomi of 町?',correct:'まち',wrong:['あめ','み(る)']},
        {q:'How many strokes in 町?',correct:'7 strokes',wrong:['6 strokes','8 strokes']}
      ]},
    {id:'g1-ten',action:'天 — Heaven/Sky',tier:'core',dom:'g1',
      hint:'あめ・あま / テン',explain:'Line above big (大) — heaven.',
      latex:'\\Huge{天}',
      blanks:[
        {latex:'天 reading → \\boxed{\\,?\\,}',answer:'あめ',choices:['あめ','まるい','かい']},
        {latex:'天 meaning → \\boxed{\\,?\\,}',answer:'heaven',choices:['heaven','five','one']},
        {latex:'天 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 天?',correct:'テン',wrong:['カ','イチ']},
        {q:'What is the kun\'yomi of 天?',correct:'あめ / あま',wrong:['した','かね']},
        {q:'How many strokes in 天?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-ta',action:'田 — Rice Field',tier:'core',dom:'g1',
      hint:'た / デン',explain:'Divided rice paddy pictograph.',
      latex:'\\Huge{田}',
      blanks:[
        {latex:'田 reading → \\boxed{\\,?\\,}',answer:'た',choices:['た','き','やすむ']},
        {latex:'田 meaning → \\boxed{\\,?\\,}',answer:'rice field',choices:['rice field','rest','jewel']},
        {latex:'田 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 田?',correct:'デン',wrong:['カ','カ']},
        {q:'What is the kun\'yomi of 田?',correct:'た',wrong:['き','み(る)']},
        {q:'How many strokes in 田?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-tsuchi',action:'土 — Earth/Soil',tier:'core',dom:'g1',
      hint:'つち / ド・ト',explain:'Cross rising from ground — earth.',
      latex:'\\Huge{土}',
      blanks:[
        {latex:'土 reading → \\boxed{\\,?\\,}',answer:'つち',choices:['つち','ななつ','まなぶ']},
        {latex:'土 meaning → \\boxed{\\,?\\,}',answer:'earth',choices:['earth','left','flower']},
        {latex:'土 strokes → \\boxed{\\,?\\,}',answer:'3',choices:['3','2','4']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 土?',correct:'ド / ト',wrong:['カ','ケン']},
        {q:'What is the kun\'yomi of 土?',correct:'つち',wrong:['かね','した']},
        {q:'How many strokes in 土?',correct:'3 strokes',wrong:['2 strokes','4 strokes']}
      ]},
    {id:'g1-ni',action:'二 — Two',tier:'core',dom:'g1',
      hint:'ふた(つ) / ニ',explain:'Two horizontal strokes.',
      latex:'\\Huge{二}',
      blanks:[
        {latex:'二 reading → \\boxed{\\,?\\,}',answer:'ふたつ',choices:['ふたつ','はな','こ']},
        {latex:'二 meaning → \\boxed{\\,?\\,}',answer:'two',choices:['two','thread','jewel']},
        {latex:'二 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 二?',correct:'ニ',wrong:['バイ','キュウ']},
        {q:'What is the kun\'yomi of 二?',correct:'ふた(つ)',wrong:['ひと(つ)','ここの(つ)']},
        {q:'How many strokes in 二?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-nichi',action:'日 — Sun/Day',tier:'core',dom:'g1',
      hint:'ひ・か / ニチ・ジツ',explain:'Sun pictograph. Sun, day, Japan.',
      latex:'\\Huge{日}',
      blanks:[
        {latex:'日 reading → \\boxed{\\,?\\,}',answer:'ひ',choices:['ひ','よっつ','おと']},
        {latex:'日 meaning → \\boxed{\\,?\\,}',answer:'sun',choices:['sun','five','study']},
        {latex:'日 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 日?',correct:'ニチ / ジツ',wrong:['キュウ','イチ']},
        {q:'What is the kun\'yomi of 日?',correct:'ひ / か',wrong:['やす(む)','いぬ']},
        {q:'How many strokes in 日?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-hairu',action:'入 — Enter',tier:'core',dom:'g1',
      hint:'い(る)・はい(る) / ニュウ',explain:'Shape pointing inward — enter.',
      latex:'\\Huge{入}',
      blanks:[
        {latex:'入 reading → \\boxed{\\,?\\,}',answer:'いる',choices:['いる','かね','ななつ']},
        {latex:'入 meaning → \\boxed{\\,?\\,}',answer:'enter',choices:['enter','spirit','sound']},
        {latex:'入 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 入?',correct:'ニュウ',wrong:['ギョク','キュウ']},
        {q:'What is the kun\'yomi of 入?',correct:'い(る) / はい(る)',wrong:['おと','みぎ']},
        {q:'How many strokes in 入?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-nen',action:'年 — Year',tier:'core',dom:'g1',
      hint:'とし / ネン',explain:'Grain harvest cycle — year.',
      latex:'\\Huge{年}',
      blanks:[
        {latex:'年 reading → \\boxed{\\,?\\,}',answer:'とし',choices:['とし','ひとつ','やま']},
        {latex:'年 meaning → \\boxed{\\,?\\,}',answer:'year',choices:['year','school','nine']},
        {latex:'年 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 年?',correct:'ネン',wrong:['エン','オウ']},
        {q:'What is the kun\'yomi of 年?',correct:'とし',wrong:['たま','つき']},
        {q:'How many strokes in 年?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-shiro',action:'白 — White',tier:'core',dom:'g1',
      hint:'しろ(い) / ハク・ビャク',explain:'Ray of light — white, pure.',
      latex:'\\Huge{白}',
      blanks:[
        {latex:'白 reading → \\boxed{\\,?\\,}',answer:'しろい',choices:['しろい','みぎ','そら']},
        {latex:'白 meaning → \\boxed{\\,?\\,}',answer:'white',choices:['white','one','moon']},
        {latex:'白 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 白?',correct:'ハク / ビャク',wrong:['ケン','カ']},
        {q:'What is the kun\'yomi of 白?',correct:'しろ(い)',wrong:['いつ(つ)','つき']},
        {q:'How many strokes in 白?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-hachi',action:'八 — Eight',tier:'core',dom:'g1',
      hint:'やっ(つ) / ハチ',explain:'Spreading strokes — eight.',
      latex:'\\Huge{八}',
      blanks:[
        {latex:'八 reading → \\boxed{\\,?\\,}',answer:'やっつ',choices:['やっつ','まるい','あめ']},
        {latex:'八 meaning → \\boxed{\\,?\\,}',answer:'eight',choices:['eight','thread','moon']},
        {latex:'八 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 八?',correct:'ハチ',wrong:['カ','キ']},
        {q:'What is the kun\'yomi of 八?',correct:'やっ(つ)',wrong:['はな','おと']},
        {q:'How many strokes in 八?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-hyaku',action:'百 — Hundred',tier:'core',dom:'g1',
      hint:'もも / ヒャク',explain:'One (一) + white (白) — hundred.',
      latex:'\\Huge{百}',
      blanks:[
        {latex:'百 reading → \\boxed{\\,?\\,}',answer:'もも',choices:['もも','みっつ','まなぶ']},
        {latex:'百 meaning → \\boxed{\\,?\\,}',answer:'hundred',choices:['hundred','flower','thread']},
        {latex:'百 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 百?',correct:'ヒャク',wrong:['ウ','バイ']},
        {q:'What is the kun\'yomi of 百?',correct:'もも',wrong:['した','いつ(つ)']},
        {q:'How many strokes in 百?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-bun',action:'文 — Writing',tier:'regular',dom:'g1',
      hint:'ふみ / ブン・モン',explain:'Crossed lines — writing, literature.',
      latex:'\\Huge{文}',
      blanks:[
        {latex:'文 reading → \\boxed{\\,?\\,}',answer:'ふみ',choices:['ふみ','はな','みぎ']},
        {latex:'文 meaning → \\boxed{\\,?\\,}',answer:'writing',choices:['writing','shell','school']},
        {latex:'文 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 文?',correct:'ブン / モン',wrong:['キュウ','オン']},
        {q:'What is the kun\'yomi of 文?',correct:'ふみ',wrong:['おと','いぬ']},
        {q:'How many strokes in 文?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-ki2',action:'木 — Tree',tier:'core',dom:'g1',
      hint:'き / モク・ボク',explain:'Tree with trunk, branches, roots.',
      latex:'\\Huge{木}',
      blanks:[
        {latex:'木 reading → \\boxed{\\,?\\,}',answer:'き',choices:['き','みっつ','みみ']},
        {latex:'木 meaning → \\boxed{\\,?\\,}',answer:'tree',choices:['tree','spirit','moon']},
        {latex:'木 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 木?',correct:'モク / ボク',wrong:['ウ','オウ']},
        {q:'What is the kun\'yomi of 木?',correct:'き',wrong:['つき','やす(む)']},
        {q:'How many strokes in 木?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]},
    {id:'g1-hon',action:'本 — Book/Origin',tier:'core',dom:'g1',
      hint:'もと / ホン',explain:'Tree (木) + root mark — origin, book.',
      latex:'\\Huge{本}',
      blanks:[
        {latex:'本 reading → \\boxed{\\,?\\,}',answer:'もと',choices:['もと','みる','ななつ']},
        {latex:'本 meaning → \\boxed{\\,?\\,}',answer:'book',choices:['book','rest','three']},
        {latex:'本 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 本?',correct:'ホン',wrong:['バイ','ゲツ']},
        {q:'What is the kun\'yomi of 本?',correct:'もと',wrong:['かね','き']},
        {q:'How many strokes in 本?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-na',action:'名 — Name',tier:'regular',dom:'g1',
      hint:'な / メイ・ミョウ',explain:'Evening (夕) + mouth (口) — calling name in dark.',
      latex:'\\Huge{名}',
      blanks:[
        {latex:'名 reading → \\boxed{\\,?\\,}',answer:'な',choices:['な','いと','たま']},
        {latex:'名 meaning → \\boxed{\\,?\\,}',answer:'name',choices:['name','three','gold']},
        {latex:'名 strokes → \\boxed{\\,?\\,}',answer:'6',choices:['6','5','7']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 名?',correct:'メイ / ミョウ',wrong:['キュウ','ケン']},
        {q:'What is the kun\'yomi of 名?',correct:'な',wrong:['き','ここの(つ)']},
        {q:'How many strokes in 名?',correct:'6 strokes',wrong:['5 strokes','7 strokes']}
      ]},
    {id:'g1-me',action:'目 — Eye',tier:'core',dom:'g1',
      hint:'め / モク・ボク',explain:'Sideways eye pictograph.',
      latex:'\\Huge{目}',
      blanks:[
        {latex:'目 reading → \\boxed{\\,?\\,}',answer:'め',choices:['め','ひ','ひとつ']},
        {latex:'目 meaning → \\boxed{\\,?\\,}',answer:'eye',choices:['eye','see','four']},
        {latex:'目 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 目?',correct:'モク / ボク',wrong:['オン','ウ']},
        {q:'What is the kun\'yomi of 目?',correct:'め',wrong:['やす(む)','いぬ']},
        {q:'How many strokes in 目?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-tatsu',action:'立 — Stand',tier:'regular',dom:'g1',
      hint:'た(つ) / リツ・リュウ',explain:'Person standing on ground.',
      latex:'\\Huge{立}',
      blanks:[
        {latex:'立 reading → \\boxed{\\,?\\,}',answer:'たつ',choices:['たつ','あめ','ひ']},
        {latex:'立 meaning → \\boxed{\\,?\\,}',answer:'stand',choices:['stand','school','study']},
        {latex:'立 strokes → \\boxed{\\,?\\,}',answer:'5',choices:['5','4','6']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 立?',correct:'リツ / リュウ',wrong:['バイ','オン']},
        {q:'What is the kun\'yomi of 立?',correct:'た(つ)',wrong:['そら','たま']},
        {q:'How many strokes in 立?',correct:'5 strokes',wrong:['4 strokes','6 strokes']}
      ]},
    {id:'g1-chikara',action:'力 — Power',tier:'core',dom:'g1',
      hint:'ちから / リョク・リキ',explain:'Strong arm/plow — power.',
      latex:'\\Huge{力}',
      blanks:[
        {latex:'力 reading → \\boxed{\\,?\\,}',answer:'ちから',choices:['ちから','みる','よっつ']},
        {latex:'力 meaning → \\boxed{\\,?\\,}',answer:'power',choices:['power','below','gold']},
        {latex:'力 strokes → \\boxed{\\,?\\,}',answer:'2',choices:['2','1','3']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 力?',correct:'リョク / リキ',wrong:['キュウ','キ']},
        {q:'What is the kun\'yomi of 力?',correct:'ちから',wrong:['いつ(つ)','やす(む)']},
        {q:'How many strokes in 力?',correct:'2 strokes',wrong:['1 strokes','3 strokes']}
      ]},
    {id:'g1-hayashi',action:'林 — Grove',tier:'regular',dom:'g1',
      hint:'はやし / リン',explain:'Two trees (木) — grove.',
      latex:'\\Huge{林}',
      blanks:[
        {latex:'林 reading → \\boxed{\\,?\\,}',answer:'はやし',choices:['はやし','ななつ','よっつ']},
        {latex:'林 meaning → \\boxed{\\,?\\,}',answer:'grove',choices:['grove','dog','rest']},
        {latex:'林 strokes → \\boxed{\\,?\\,}',answer:'8',choices:['8','7','9']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 林?',correct:'リン',wrong:['キュウ','カ']},
        {q:'What is the kun\'yomi of 林?',correct:'はやし',wrong:['かね','たま']},
        {q:'How many strokes in 林?',correct:'8 strokes',wrong:['7 strokes','9 strokes']}
      ]},
    {id:'g1-roku',action:'六 — Six',tier:'core',dom:'g1',
      hint:'むっ(つ) / ロク',explain:'Roof with legs — six.',
      latex:'\\Huge{六}',
      blanks:[
        {latex:'六 reading → \\boxed{\\,?\\,}',answer:'むっつ',choices:['むっつ','ななつ','ひ']},
        {latex:'六 meaning → \\boxed{\\,?\\,}',answer:'six',choices:['six','dog','shell']},
        {latex:'六 strokes → \\boxed{\\,?\\,}',answer:'4',choices:['4','3','5']}
      ],
      subconcepts:[
        {q:'What is the on\'yomi of 六?',correct:'ロク',wrong:['バイ','キュウ']},
        {q:'What is the kun\'yomi of 六?',correct:'むっ(つ)',wrong:['みぎ','み(る)']},
        {q:'How many strokes in 六?',correct:'4 strokes',wrong:['3 strokes','5 strokes']}
      ]}
  ],

  // ══════════════════════════════════════
  //  3. QUESTION GENERATOR
  // ══════════════════════════════════════
  generateQuestion(cmd, allCommands) {
    const rand = Math.random();
    const hasBlanks = cmd.blanks && cmd.blanks.length > 0;
    const hasVars = this.variableBank && this.variableBank[cmd.id];
    const hasApp = this.applicationBank && this.applicationBank[cmd.id];
    const hasRel = this.relationshipBank && this.relationshipBank[cmd.id];

    let weights = {identify:0.40, fillblank:0.30, variable:0.10, application:0.10, relationship:0.10};
    if(!hasBlanks) weights.fillblank = 0;
    if(!hasVars) weights.variable = 0;
    if(!hasApp) weights.application = 0;
    if(!hasRel) weights.relationship = 0;

    const total = Object.values(weights).reduce((a,b)=>a+b,0);
    if(total===0) weights.identify=1;
    else Object.keys(weights).forEach(k=>weights[k]/=total);

    let cum=0, pick='identify';
    for(const [type,w] of Object.entries(weights)){
      cum+=w; if(rand<cum){pick=type;break}
    }

    switch(pick){
      case 'identify': {
        const sameDom = allCommands.filter(c=>c.dom===cmd.dom && c.id!==cmd.id);
        const pool = sameDom.length>=3 ? sameDom : allCommands.filter(c=>c.id!==cmd.id);
        const distractors = shuffleArr(pool).slice(0,3).map(c=>c.action);
        const options = shuffleArr([cmd.action,...distractors]);
        const ci = options.indexOf(cmd.action);
        return{type:'identify',latex:cmd.latex,options,correctIdx:ci,correctKey:['a','b','c','d'][ci]};
      }
      case 'fillblank': {
        const blank = cmd.blanks[Math.floor(Math.random()*cmd.blanks.length)];
        const shuffled = shuffleArr([...blank.choices]);
        const ci = shuffled.indexOf(blank.choices[0]);
        return{type:'fillblank',latex:blank.latex,answer:blank.answer,choices:shuffled,correctIdx:ci,fullLatex:cmd.latex};
      }
      case 'variable': {
        const vars = this.variableBank[cmd.id];
        const v = vars[Math.floor(Math.random()*vars.length)];
        const otherDescs = [];
        Object.entries(this.variableBank).forEach(([id,arr])=>{
          if(id!==cmd.id) arr.forEach(x=>otherDescs.push(x.d));
        });
        const dists = shuffleArr(otherDescs).slice(0,3);
        const options = shuffleArr([v.d,...dists]);
        const ci = options.indexOf(v.d);
        return{type:'variable',latex:cmd.latex,symbol:v.s,options,correctIdx:ci,correctKey:['a','b','c','d'][ci]};
      }
      case 'application': {
        const apps = this.applicationBank[cmd.id];
        const app = apps[Math.floor(Math.random()*apps.length)];
        const confusionActions = app.confusionSet.map(cid=>{
          const c = allCommands.find(x=>x.id===cid);
          return c ? c.action : cid;
        });
        const options = shuffleArr([cmd.action,...confusionActions]);
        const ci = options.indexOf(cmd.action);
        return{type:'application',scenario:app.scenario,options,correctIdx:ci,correctKey:['a','b','c','d'][ci]};
      }
      case 'relationship': {
        const rels = this.relationshipBank[cmd.id];
        const rel = rels[Math.floor(Math.random()*rels.length)];
        const allOpts = ['Increases','Decreases','Stays the same'];
        const opts = shuffleArr(allOpts);
        const normDir = rel.direction.charAt(0).toUpperCase()+rel.direction.slice(1).toLowerCase();
        const target = normDir.startsWith('C')?'Stays the same':normDir.startsWith('I')?'Increases':'Decreases';
        const ci = opts.indexOf(target);
        return{type:'relationship',latex:cmd.latex,input:rel.input,output:rel.output,direction:normDir,
          explain:rel.explain,formulaName:cmd.action,options:opts,correctIdx:ci>=0?ci:0,correctKey:['a','b','c'][ci>=0?ci:0]};
      }
    }
  },

  formatPrompt(cmd) { return cmd.action; },
  formatAnswer(cmd) { return cmd.action; },

  validateBlank(input, answer) {
    function norm(s) {
      return s.trim().toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[\\{}_]/g, '')
        .replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
        .replace(/ō/g,'ou').replace(/ū/g,'uu').replace(/ā/g,'aa');
    }
    return norm(input) === norm(answer);
  },
};

const VARIABLE_BANK = {
  'g1-ichi':[{s:'一',d:'one kanji'}],
  'g1-migi':[{s:'ナ',d:'hand component'},{s:'口',d:'mouth component'}],
  'g1-ame':[{s:'雨',d:'rain radical'}],
  'g1-en':[{s:'円',d:'circle/yen kanji'}],
  'g1-ou':[{s:'王',d:'king kanji'}],
  'g1-oto':[{s:'立',d:'standing component'},{s:'日',d:'sun component'}],
  'g1-shita':[{s:'下',d:'below kanji'}],
  'g1-hi':[{s:'火',d:'fire radical'},{s:'灬',d:'fire dots variant'}],
  'g1-hana':[{s:'艹',d:'grass radical'},{s:'化',d:'change component'}],
  'g1-kai':[{s:'貝',d:'shell/money radical'}],
  'g1-gaku':[{s:'子',d:'child component'},{s:'⺍',d:'learning crown'}],
  'g1-ki':[{s:'気',d:'spirit/air kanji'}],
  'g1-kyuu':[{s:'九',d:'nine kanji'}],
  'g1-yasumu':[{s:'亻',d:'person radical'},{s:'木',d:'tree component'}],
  'g1-tama':[{s:'王',d:'king base'},{s:'丶',d:'jewel dot'}],
  'g1-kane':[{s:'金',d:'metal radical'}],
  'g1-sora':[{s:'穴',d:'hole radical'},{s:'工',d:'work component'}],
  'g1-tsuki':[{s:'月',d:'moon/flesh radical'}],
  'g1-inu':[{s:'大',d:'big base'},{s:'丶',d:'dog dot'}],
  'g1-miru':[{s:'目',d:'eye component'},{s:'儿',d:'legs component'}],
  'g1-go':[{s:'五',d:'five kanji'}],
  'g1-kuchi':[{s:'口',d:'mouth radical'}],
  'g1-kou':[{s:'木',d:'tree radical'},{s:'交',d:'crossing component'}],
  'g1-hidari':[{s:'ナ',d:'hand'},{s:'工',d:'work'}],
  'g1-san':[{s:'三',d:'three kanji'}],
  'g1-yama':[{s:'山',d:'mountain radical'}],
  'g1-ko':[{s:'子',d:'child radical'}],
  'g1-shi':[{s:'四',d:'four kanji'}],
  'g1-ito':[{s:'糸',d:'thread radical'}],
  'g1-ji':[{s:'宀',d:'roof radical'},{s:'子',d:'child component'}],
  'g1-mimi':[{s:'耳',d:'ear radical'}],
  'g1-nana':[{s:'七',d:'seven kanji'}],
  'g1-kuruma':[{s:'車',d:'vehicle radical'}],
  'g1-te':[{s:'手',d:'hand radical'},{s:'扌',d:'hand radical left form'}],
  'g1-juu':[{s:'十',d:'ten kanji'}],
  'g1-deru':[{s:'出',d:'exit/go out kanji'}],
  'g1-onna':[{s:'女',d:'woman radical'}],
  'g1-chiisai':[{s:'小',d:'small kanji'}],
  'g1-ue':[{s:'上',d:'above kanji'}],
  'g1-mori':[{s:'木',d:'tree ×3'}],
  'g1-hito':[{s:'人',d:'person radical'},{s:'亻',d:'person left form'}],
  'g1-mizu':[{s:'水',d:'water radical'},{s:'氵',d:'water left form'}],
  'g1-tadashii':[{s:'一',d:'one'},{s:'止',d:'stop component'}],
  'g1-sei':[{s:'生',d:'life/birth kanji'}],
  'g1-ao':[{s:'青',d:'blue/green kanji'}],
  'g1-yuube':[{s:'夕',d:'evening kanji'}],
  'g1-ishi':[{s:'厂',d:'cliff'},{s:'口',d:'stone shape'}],
  'g1-aka':[{s:'赤',d:'red kanji'}],
  'g1-sen':[{s:'千',d:'thousand kanji'}],
  'g1-kawa':[{s:'川',d:'river radical'}],
  'g1-saki':[{s:'儿',d:'legs'},{s:'土',d:'earth'}],
  'g1-hayai':[{s:'日',d:'sun'},{s:'十',d:'cross'}],
  'g1-kusa':[{s:'艹',d:'grass radical'},{s:'早',d:'early component'}],
  'g1-ashi':[{s:'足',d:'foot radical'}],
  'g1-mura':[{s:'木',d:'tree radical'},{s:'寸',d:'measurement'}],
  'g1-ookii':[{s:'大',d:'big kanji'}],
  'g1-otoko':[{s:'田',d:'field'},{s:'力',d:'power'}],
  'g1-take':[{s:'竹',d:'bamboo radical'},{s:'⺮',d:'bamboo top form'}],
  'g1-naka':[{s:'中',d:'middle/inside kanji'}],
  'g1-mushi':[{s:'虫',d:'insect radical'}],
  'g1-machi':[{s:'田',d:'field'},{s:'丁',d:'block/street'}],
  'g1-ten':[{s:'大',d:'big/person'},{s:'一',d:'heaven stroke'}],
  'g1-ta':[{s:'田',d:'field radical'}],
  'g1-tsuchi':[{s:'土',d:'earth radical'}],
  'g1-ni':[{s:'二',d:'two kanji'}],
  'g1-nichi':[{s:'日',d:'sun radical'}],
  'g1-hairu':[{s:'入',d:'enter kanji'}],
  'g1-nen':[{s:'年',d:'year kanji'}],
  'g1-shiro':[{s:'白',d:'white radical'}],
  'g1-hachi':[{s:'八',d:'eight kanji'}],
  'g1-hyaku':[{s:'一',d:'one top'},{s:'白',d:'white component'}],
  'g1-bun':[{s:'文',d:'writing radical'}],
  'g1-ki2':[{s:'木',d:'tree radical'}],
  'g1-hon':[{s:'木',d:'tree base'},{s:'一',d:'root marker'}],
  'g1-na':[{s:'夕',d:'evening'},{s:'口',d:'mouth'}],
  'g1-me':[{s:'目',d:'eye radical'}],
  'g1-tatsu':[{s:'立',d:'standing radical'}],
  'g1-chikara':[{s:'力',d:'power radical'}],
  'g1-hayashi':[{s:'木',d:'tree ×2'}],
  'g1-roku':[{s:'六',d:'six kanji'}],
};

const APPLICATION_BANK = {
  'g1-ichi':[{scenario:'You start counting from the very beginning. What number comes first?',confusionSet:['g1-ni','g1-san','g1-juu']}],
  'g1-migi':[{scenario:'The teacher says to look toward the window side of the classroom.',confusionSet:['g1-hidari','g1-ue','g1-shita']}],
  'g1-ame':[{scenario:'Drops fall from the sky and puddles form on the ground.',confusionSet:['g1-sora','g1-ten','g1-mizu']}],
  'g1-en':[{scenario:'You hand coins to a shopkeeper in Tokyo.',confusionSet:['g1-kane','g1-tama','g1-hyaku']}],
  'g1-ou':[{scenario:'A ruler sits on a golden throne commanding the kingdom.',confusionSet:['g1-tama','g1-kane','g1-ookii']}],
  'g1-oto':[{scenario:'You hear a bell ringing from the temple in the distance.',confusionSet:['g1-mimi','g1-kuchi','g1-miru']}],
  'g1-shita':[{scenario:'The cat is hiding underneath the table.',confusionSet:['g1-ue','g1-naka','g1-hidari']}],
  'g1-hi':[{scenario:'You light the campfire logs for warmth at night.',confusionSet:['g1-mizu','g1-ki2','g1-tsuchi']}],
  'g1-hana':[{scenario:'In spring, colorful blooming plants fill the garden.',confusionSet:['g1-kusa','g1-ki2','g1-hayashi']}],
  'g1-kai':[{scenario:'At the beach you find small hard treasures in the sand.',confusionSet:['g1-ishi','g1-mizu','g1-kane']}],
  'g1-gaku':[{scenario:'Every day you sit at a desk, open textbooks, and learn.',confusionSet:['g1-kou','g1-hon','g1-ji']}],
  'g1-ki':[{scenario:'She radiates positive energy — you can feel her cheerful mood.',confusionSet:['g1-sora','g1-ten','g1-oto']}],
  'g1-kyuu':[{scenario:'Count past eight to reach this number before ten.',confusionSet:['g1-hachi','g1-juu','g1-hyaku']}],
  'g1-yasumu':[{scenario:'After a long hike you stop and lean against a tree.',confusionSet:['g1-tatsu','g1-deru','g1-ki2']}],
  'g1-tama':[{scenario:'A sparkling precious gem is set in a golden ring.',confusionSet:['g1-ou','g1-kane','g1-inu']}],
  'g1-kane':[{scenario:'Ancient coins were made from a shiny yellow metal.',confusionSet:['g1-en','g1-tama','g1-hyaku']}],
  'g1-sora':[{scenario:'You look up and see clouds drifting across a vast blue expanse.',confusionSet:['g1-ten','g1-ki','g1-ame']}],
  'g1-tsuki':[{scenario:'At night a bright crescent glows above the dark horizon.',confusionSet:['g1-nichi','g1-yuube','g1-nen']}],
  'g1-inu':[{scenario:'A furry four-legged friend wags its tail when you come home.',confusionSet:['g1-ookii','g1-ten','g1-tama']}],
  'g1-miru':[{scenario:'You open your eyes wide and observe the scenery carefully.',confusionSet:['g1-me','g1-mimi','g1-kuchi']}],
  'g1-go':[{scenario:'What comes after four and before six?',confusionSet:['g1-shi','g1-roku','g1-nana']}],
  'g1-kuchi':[{scenario:'You open this to speak, eat, and taste food.',confusionSet:['g1-me','g1-mimi','g1-te']}],
  'g1-kou':[{scenario:'Students gather each morning in a building for classes.',confusionSet:['g1-gaku','g1-machi','g1-mura']}],
  'g1-hidari':[{scenario:'Turn the opposite direction from right.',confusionSet:['g1-migi','g1-ue','g1-shita']}],
  'g1-san':[{scenario:'What number comes after two?',confusionSet:['g1-ni','g1-shi','g1-go']}],
  'g1-yama':[{scenario:'You need hiking boots for the tall rocky peaks.',confusionSet:['g1-kawa','g1-mori','g1-ta']}],
  'g1-ko':[{scenario:'A small young person plays in the park with parents.',confusionSet:['g1-onna','g1-otoko','g1-hito']}],
  'g1-shi':[{scenario:'What number comes after three?',confusionSet:['g1-san','g1-go','g1-roku']}],
  'g1-ito':[{scenario:'A seamstress uses this thin material to sew fabric.',confusionSet:['g1-bun','g1-ji','g1-te']}],
  'g1-ji':[{scenario:'You write these symbols to form words on paper.',confusionSet:['g1-bun','g1-hon','g1-gaku']}],
  'g1-mimi':[{scenario:'You use this body part to listen to music and voices.',confusionSet:['g1-me','g1-kuchi','g1-te']}],
  'g1-nana':[{scenario:'What number comes after six?',confusionSet:['g1-roku','g1-hachi','g1-kyuu']}],
  'g1-kuruma':[{scenario:'You drive this wheeled machine on the road.',confusionSet:['g1-ashi','g1-te','g1-chikara']}],
  'g1-te':[{scenario:'You wave, write, and grasp objects with this body part.',confusionSet:['g1-ashi','g1-me','g1-mimi']}],
  'g1-juu':[{scenario:'What number do you reach after nine?',confusionSet:['g1-kyuu','g1-hyaku','g1-sen']}],
  'g1-deru':[{scenario:'You put on shoes and walk outside through the front door.',confusionSet:['g1-hairu','g1-tatsu','g1-ashi']}],
  'g1-onna':[{scenario:'Mother and daughter are both this gender.',confusionSet:['g1-otoko','g1-ko','g1-hito']}],
  'g1-chiisai':[{scenario:'An ant compared to a cat is very ___.',confusionSet:['g1-ookii','g1-ko','g1-naka']}],
  'g1-ue':[{scenario:'The book is on top of the highest shelf.',confusionSet:['g1-shita','g1-naka','g1-migi']}],
  'g1-mori':[{scenario:'A dense area with countless trees — you cannot see far.',confusionSet:['g1-hayashi','g1-ki2','g1-yama']}],
  'g1-hito':[{scenario:'Any human being regardless of age or gender.',confusionSet:['g1-otoko','g1-onna','g1-ko']}],
  'g1-mizu':[{scenario:'You fill a glass from the tap to quench your thirst.',confusionSet:['g1-hi','g1-kawa','g1-ame']}],
  'g1-tadashii':[{scenario:'The teacher marks the answer with a circle — it is ___.',confusionSet:['g1-sei','g1-gaku','g1-hon']}],
  'g1-sei':[{scenario:'A new baby is born — a new existence begins.',confusionSet:['g1-nen','g1-hito','g1-na']}],
  'g1-ao':[{scenario:'The clear daytime overhead color; also used for green lights.',confusionSet:['g1-aka','g1-shiro','g1-sora']}],
  'g1-yuube':[{scenario:'The sun sets and the sky darkens — this time of day.',confusionSet:['g1-tsuki','g1-nichi','g1-hayai']}],
  'g1-ishi':[{scenario:'You find a hard gray object in the riverbed.',confusionSet:['g1-tsuchi','g1-yama','g1-kai']}],
  'g1-aka':[{scenario:'The color of a ripe tomato or a fire truck.',confusionSet:['g1-ao','g1-shiro','g1-hi']}],
  'g1-sen':[{scenario:'How many are in ten groups of one hundred?',confusionSet:['g1-hyaku','g1-juu','g1-en']}],
  'g1-kawa':[{scenario:'Water flows continuously between two banks toward the sea.',confusionSet:['g1-yama','g1-mizu','g1-ame']}],
  'g1-saki':[{scenario:'The leader walks in front of everyone else — going ___.',confusionSet:['g1-hayai','g1-deru','g1-ue']}],
  'g1-hayai':[{scenario:'The rooster crows and the sun is barely up — it is ___.',confusionSet:['g1-saki','g1-yuube','g1-sei']}],
  'g1-kusa':[{scenario:'Green blades grow from the ground, shorter than trees.',confusionSet:['g1-hana','g1-ki2','g1-hayashi']}],
  'g1-ashi':[{scenario:'You walk, run, and kick a ball with this body part.',confusionSet:['g1-te','g1-me','g1-chikara']}],
  'g1-mura':[{scenario:'A small settlement in the countryside, smaller than a town.',confusionSet:['g1-machi','g1-mori','g1-ta']}],
  'g1-ookii':[{scenario:'An elephant compared to a mouse is very ___.',confusionSet:['g1-chiisai','g1-naka','g1-chikara']}],
  'g1-otoko':[{scenario:'Father and son are both this gender.',confusionSet:['g1-onna','g1-ko','g1-hito']}],
  'g1-take':[{scenario:'Tall hollow-stemmed plants used to make flutes and baskets.',confusionSet:['g1-ki2','g1-kusa','g1-hayashi']}],
  'g1-naka':[{scenario:'The marble is somewhere inside the box.',confusionSet:['g1-ue','g1-shita','g1-deru']}],
  'g1-mushi':[{scenario:'Ants, beetles, and butterflies are all this type of creature.',confusionSet:['g1-inu','g1-kai','g1-take']}],
  'g1-machi':[{scenario:'A busy area with shops and streets, bigger than a hamlet.',confusionSet:['g1-mura','g1-kou','g1-ta']}],
  'g1-ten':[{scenario:'The vast domain above the earth where gods dwell.',confusionSet:['g1-sora','g1-ue','g1-ame']}],
  'g1-ta':[{scenario:'The farmer works in a wet paddy growing rice.',confusionSet:['g1-tsuchi','g1-mura','g1-machi']}],
  'g1-tsuchi':[{scenario:'Dig a hole in the ground and feel the brown dirt.',confusionSet:['g1-ta','g1-ishi','g1-yama']}],
  'g1-ni':[{scenario:'What number comes after one?',confusionSet:['g1-ichi','g1-san','g1-shi']}],
  'g1-nichi':[{scenario:'The bright orb rises in the east each morning.',confusionSet:['g1-tsuki','g1-nen','g1-shiro']}],
  'g1-hairu':[{scenario:'You push the door open and walk inside the room.',confusionSet:['g1-deru','g1-tatsu','g1-miru']}],
  'g1-nen':[{scenario:'Three hundred sixty-five days make up one ___.',confusionSet:['g1-tsuki','g1-nichi','g1-sei']}],
  'g1-shiro':[{scenario:'Fresh snow is this color — the purest and brightest.',confusionSet:['g1-aka','g1-ao','g1-nichi']}],
  'g1-hachi':[{scenario:'What number comes after seven?',confusionSet:['g1-nana','g1-kyuu','g1-juu']}],
  'g1-hyaku':[{scenario:'Ten groups of ten equal this number.',confusionSet:['g1-juu','g1-sen','g1-ichi']}],
  'g1-bun':[{scenario:'Words arranged into sentences on a page — this is ___.',confusionSet:['g1-ji','g1-hon','g1-na']}],
  'g1-ki2':[{scenario:'It has a trunk, branches, leaves, and roots in the ground.',confusionSet:['g1-hayashi','g1-mori','g1-hana']}],
  'g1-hon':[{scenario:'You turn pages and read stories printed in this object.',confusionSet:['g1-bun','g1-ji','g1-gaku']}],
  'g1-na':[{scenario:'When you introduce yourself, you say this — what people call you.',confusionSet:['g1-ji','g1-bun','g1-kuchi']}],
  'g1-me':[{scenario:'The organ you use to see, read, and look at things.',confusionSet:['g1-mimi','g1-kuchi','g1-miru']}],
  'g1-tatsu':[{scenario:'You rise from your chair and get on your feet.',confusionSet:['g1-yasumu','g1-deru','g1-hairu']}],
  'g1-chikara':[{scenario:'A weightlifter demonstrates raw physical ___.',confusionSet:['g1-ookii','g1-otoko','g1-te']}],
  'g1-hayashi':[{scenario:'A small cluster of trees, not as thick as a full wooded area.',confusionSet:['g1-mori','g1-ki2','g1-mura']}],
  'g1-roku':[{scenario:'What number comes after five?',confusionSet:['g1-go','g1-nana','g1-hachi']}],
};

const RELATIONSHIP_BANK = {
  'g1-ki2':[{input:'Number of 木 kanji combined',output:'Density of vegetation',direction:'increases',explain:'木→林→森: more trees = denser'}],
  'g1-hyaku':[{input:'Number of zeros',output:'Magnitude of number',direction:'increases',explain:'十→百→千: more zeros = larger'}],
};

const EXPLANATION_GLOSSARY = [
  {keys:['亻','ninben'],title:'Person Radical (亻)',lines:['Left-side form of 人.','Appears in: 休, 体, 何.','Always on the left.']},
  {keys:['氵','sanzui'],title:'Water Radical (氵)',lines:['Left-side form of 水.','Appears in: 海, 池, 河.','Three dots on the left.']},
  {keys:['艹','kusakanmuri'],title:'Grass Radical (艹)',lines:['Top radical for plants.','Appears in: 花, 草, 茶.','Always on top.']},
  {keys:['口','kuchi'],title:'Mouth Radical (口)',lines:['Box shape = mouth.','Appears in: 右, 名, 町.','Can appear anywhere.']},
  {keys:['日','nichi'],title:'Sun Radical (日)',lines:['Sun or day.','Appears in: 早, 百, 音.','Taller/narrower than 目.']},
  {keys:['目','me'],title:'Eye Radical (目)',lines:['Eye shape.','Appears in: 見.','Wider than 日 with more lines.']},
  {keys:['木','ki'],title:'Tree Radical (木)',lines:['Trunk + branches + roots.','Appears in: 休, 校, 村, 本.','Narrows on left side.']},
  {keys:['田','ta'],title:'Field Radical (田)',lines:['Divided rice paddy.','Appears in: 男, 町.','Square divided by cross.']},
  {keys:['扌','tehen'],title:'Hand Radical (扌)',lines:['Left form of 手.','Many action verbs.','Three strokes on left.']},
  {keys:['宀','ukanmuri'],title:'Roof Radical (宀)',lines:['Roof or building.','Appears in: 字, 空.','Always on top.']},
  {keys:['穴','anakanmuri'],title:'Hole Radical (穴)',lines:['Cave or opening.','Appears in: 空.','Roof with divide.']},
  {keys:['儿','hitoashi'],title:'Legs Radical (儿)',lines:['Human legs.','Appears in: 見, 先.','Always at bottom.']},
  {keys:['力','chikara'],title:'Power Radical (力)',lines:['Strength or effort.','Appears in: 男.','Like a strong arm.']},
  {keys:['貝','kai'],title:'Shell Radical (貝)',lines:['Shells = ancient money.','Money/value kanji.','Cowrie shell shape.']},
  {keys:['雨','ame'],title:'Rain Radical (雨)',lines:['Weather/rain.','Appears in: 雲, 雪, 電.','Always on top with drops.']},
  {keys:['車','kuruma'],title:'Vehicle Radical (車)',lines:['Wheeled vehicle.','Appears in: 転, 軽.','Cart from above.']},
  {keys:['虫','mushi'],title:'Insect Radical (虫)',lines:['Bugs and creatures.','Appears in: 蛇, 蚊.','Left side of creature kanji.']},
  {keys:['糸','ito'],title:'Thread Radical (糸)',lines:['Thread, silk, string.','Appears in: 紙, 絵, 線.','Left side of fabric kanji.']},
  {keys:['竹','take'],title:'Bamboo Radical (⺮)',lines:['Bamboo plant.','Appears in: 笛, 箱, 筆.','Simplified ⺮ on top.']},
  {keys:['山','yama'],title:'Mountain Radical (山)',lines:['Mountain peaks.','Appears in: 岩, 島.','Center peak tallest.']},
  {keys:['川','kawa'],title:'River Radical (川)',lines:['Flowing water.','Appears in: 州.','Three vertical lines.']},
  {keys:['女','onna'],title:'Woman Radical (女)',lines:['Woman shape.','Appears in: 好, 姉, 妹.','Kneeling figure.']},
  {keys:['子','ko'],title:'Child Radical (子)',lines:['Baby with arms.','Appears in: 字, 学.','Common in family kanji.']},
  {keys:['土','tsuchi'],title:'Earth Radical (土)',lines:['Earth/soil.','Appears in: 地, 場.','Cross rising from ground.']},
  {keys:['火','hi'],title:'Fire Radical (火/灬)',lines:['Flames.','Appears in: 炎, 焼.','Bottom form: 灬 (four dots).']},
  {keys:['白','shiro'],title:'White Radical (白)',lines:['White/pure.','Appears in: 百, 的.','日 with extra top stroke.']},
];

const AUTO_BLANK_SPECS = [];

const DOM_LABELS = {
  'g1': ['Grade 1 · 小学一年 · 80 kanji']
};

const SHARED_PREREQ_NODES = {
  'radical-mouth':{id:'radical-mouth',type:'conceptual',level:2,q:'Which radical is 口?',correct:'Mouth (kuchi)',wrong:['Sun (nichi)','Eye (me)'],prereqs:['stroke-basics']},
  'radical-sun':{id:'radical-sun',type:'conceptual',level:2,q:'Which radical is 日?',correct:'Sun/day (nichi)',wrong:['Mouth (kuchi)','Eye (me)'],prereqs:['stroke-basics']},
  'radical-eye':{id:'radical-eye',type:'conceptual',level:2,q:'Which radical is 目?',correct:'Eye (me)',wrong:['Sun (nichi)','Mouth (kuchi)'],prereqs:['stroke-basics']},
  'radical-tree':{id:'radical-tree',type:'conceptual',level:2,q:'Which radical is 木?',correct:'Tree (ki)',wrong:['Person (hito)','Fire (hi)'],prereqs:['stroke-basics']},
  'radical-person':{id:'radical-person',type:'conceptual',level:2,q:'Which radical is 亻?',correct:'Person (left form of 人)',wrong:['Tree (ki)','Hand (te)'],prereqs:['stroke-basics']},
  'radical-water':{id:'radical-water',type:'conceptual',level:2,q:'Which radical is 氵?',correct:'Water (left form of 水)',wrong:['Fire (hi)','Person (hito)'],prereqs:['stroke-basics']},
  'radical-fire':{id:'radical-fire',type:'conceptual',level:2,q:'Which radical is 火?',correct:'Fire (hi)',wrong:['Water (mizu)','Tree (ki)'],prereqs:['stroke-basics']},
  'radical-earth':{id:'radical-earth',type:'conceptual',level:2,q:'Which radical is 土?',correct:'Earth/soil (tsuchi)',wrong:['King (ō)','Samurai (shi)'],prereqs:['stroke-basics']},
  'radical-grass':{id:'radical-grass',type:'conceptual',level:2,q:'Which radical is 艹?',correct:'Grass/plant',wrong:['Bamboo','Rain'],prereqs:['stroke-basics']},
  'radical-woman':{id:'radical-woman',type:'conceptual',level:2,q:'Which radical is 女?',correct:'Woman (onna)',wrong:['Child (ko)','Person (hito)'],prereqs:['stroke-basics']},
  'radical-child':{id:'radical-child',type:'conceptual',level:2,q:'Which radical is 子?',correct:'Child (ko)',wrong:['Woman (onna)','Person (hito)'],prereqs:['stroke-basics']},
  'radical-hand':{id:'radical-hand',type:'conceptual',level:2,q:'Which radical is 扌?',correct:'Hand (left form of 手)',wrong:['Person','Water'],prereqs:['stroke-basics']},
  'radical-field':{id:'radical-field',type:'conceptual',level:2,q:'Which radical is 田?',correct:'Rice field (ta)',wrong:['Mouth (kuchi)','Eye (me)'],prereqs:['stroke-basics']},
  'radical-power':{id:'radical-power',type:'conceptual',level:2,q:'Which radical is 力?',correct:'Power/strength',wrong:['Sword','Nine'],prereqs:['stroke-basics']},
  'radical-shell':{id:'radical-shell',type:'conceptual',level:2,q:'Which radical is 貝?',correct:'Shell/money (kai)',wrong:['Eye','Field'],prereqs:['stroke-basics']},
  'radical-rain':{id:'radical-rain',type:'conceptual',level:2,q:'Which radical is 雨?',correct:'Rain/weather',wrong:['Roof','Cloud'],prereqs:['stroke-basics']},
  'radical-roof':{id:'radical-roof',type:'conceptual',level:2,q:'Which radical is 宀?',correct:'Roof (ukanmuri)',wrong:['Hole','Rain'],prereqs:['stroke-basics']},
  'radical-vehicle':{id:'radical-vehicle',type:'conceptual',level:2,q:'Which radical is 車?',correct:'Vehicle (kuruma)',wrong:['Field','East'],prereqs:['stroke-basics']},
  'radical-insect':{id:'radical-insect',type:'conceptual',level:2,q:'Which radical is 虫?',correct:'Insect (mushi)',wrong:['Wind','Shell'],prereqs:['stroke-basics']},
  'body-parts':{id:'body-parts',type:'conceptual',level:3,q:'Name 5 body-part kanji from Grade 1',correct:'目 耳 口 手 足',wrong:['山 川 田','一 二 三'],prereqs:['radical-eye','radical-mouth','radical-hand']},
  'nature-elements':{id:'nature-elements',type:'conceptual',level:3,q:'Name the 5 element kanji',correct:'火 水 木 土 金',wrong:['上 下 左 右','一 二 三 四 五'],prereqs:['radical-fire','radical-water','radical-tree','radical-earth']},
  'direction-concepts':{id:'direction-concepts',type:'conceptual',level:3,q:'Name the direction kanji',correct:'上 下 左 右 中',wrong:['一 二 三','男 女 子'],prereqs:[]},
  'number-system':{id:'number-system',type:'conceptual',level:3,q:'Order: 十 百 千',correct:'十(10)→百(100)→千(1000)',wrong:['千→百→十','百→千→十'],prereqs:[]},
  'tree-density':{id:'tree-density',type:'conceptual',level:3,q:'Order by density: 木 林 森',correct:'木→林→森',wrong:['森→林→木','林→木→森'],prereqs:['radical-tree']},
  'similar-kanji':{id:'similar-kanji',type:'conceptual',level:3,q:'Tell apart: 大 犬 太',correct:'大=big, 犬=dog(dot upper-right), 太=fat(dot lower-left)',wrong:['All the same','Add dots left to right'],prereqs:[]},
  'meaning-recall':{id:'meaning-recall',type:'conceptual',level:4,q:'What does a kanji meaning prompt ask you to recall?',correct:'The core meaning the character represents',wrong:['Only the stroke count','Only the on\'yomi reading'],prereqs:[]},
  'hiragana-reading':{id:'hiragana-reading',type:'conceptual',level:4,q:'Can you read hiragana?',correct:'Yes — basic syllabary for native Japanese',wrong:['Hiragana is for foreign words','Same as kanji'],prereqs:[]},
  'onyomi-kunyomi':{id:'onyomi-kunyomi',type:'conceptual',level:4,q:'Difference between on\'yomi and kun\'yomi?',correct:'On=Chinese-derived, Kun=native Japanese',wrong:['They are the same','On is always used alone'],prereqs:['hiragana-reading']},
  'stroke-basics':{id:'stroke-basics',type:'conceptual',level:5,q:'Basic stroke types in kanji?',correct:'Horizontal, vertical, diagonal, turning, dot',wrong:['Only horizontal and vertical','Only diagonal'],prereqs:[]},
};

function wireL1toL2(PREREQ_DAG) {
  const rules = [
    [/on.yomi|音読/i, ['onyomi-kunyomi']],
    [/kun.yomi|訓読/i, ['onyomi-kunyomi']],
    [/reading/i, ['onyomi-kunyomi','hiragana-reading']],
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
    [/what does .* mean|meaning/i, ['meaning-recall']],
    [/stroke/i, ['stroke-basics']],
    [/大.*犬|犬.*大|differ.*dot/i, ['similar-kanji']],
    [/木.*林.*森|grove.*forest/i, ['tree-density']],
    [/十.*百.*千|hundred.*thousand/i, ['number-system']],
  ];
  for (const node of Object.values(PREREQ_DAG)) {
    if (node.level !== 1 || !node.autoGen || node.prereqs.length > 0) continue;
    const matched = new Set();
    for (const [re, ids] of rules) {
      if (re.test(node.q) || re.test(node.correct)) {
        ids.forEach(id => { if (PREREQ_DAG[id]) matched.add(id) });
      }
    }
    if (matched.size > 0) node.prereqs = [...matched];
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
