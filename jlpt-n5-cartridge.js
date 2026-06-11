// JLPT N5 cartridge — immersion deck (kanji / vocab / verbs / adjectives / particles / counters).
// Self-contained: no dependency on the grade files. Registers via window.TD_CARTRIDGES.
// Spec: kanji-immersion-n5-spec.md §1.1-1.2, §2 (incl. [CX-8] verb rules, [CX-9] particle rules).
// Extensions beyond the spec: verb chains are 7 steps (ません形/ました形 added),
// plus an adjectives domain (conjugation chains) and a counters domain (reading traps).
// All user-facing strings are Japanese (code comments in English are fine).
(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // Domain A: the canonical 103 JLPT N5 kanji.
  // [glyph, reading (most common N5 reading), wrong1, wrong2]
  // Distractors are authored confusables from within the N5 set;
  // never a valid reading of the same kanji in another register.
  // ─────────────────────────────────────────────────────────────
  const KANJI = [
    ['一', 'いち', 'ろく', 'しち'],
    ['二', 'に', 'し', 'ご'],
    ['三', 'さん', 'せん', 'はん'],
    ['四', 'よん', 'ろく', 'なな'],
    ['五', 'ご', 'こ', 'ろく'],
    ['六', 'ろく', 'く', 'こく'],
    ['七', 'なな', 'はち', 'し'],
    ['八', 'はち', 'しち', 'ひゃく'],
    ['九', 'きゅう', 'じゅう', 'ひゃく'],
    ['十', 'じゅう', 'きゅう', 'ちゅう'],
    ['百', 'ひゃく', 'せん', 'まん'],
    ['千', 'せん', 'まん', 'ひゃく'],
    ['万', 'まん', 'せん', 'ひゃく'],
    ['円', 'えん', 'まん', 'かん'],
    ['時', 'じ', 'し', 'ち'],
    ['日', 'にち', 'げつ', 'がつ'],
    ['週', 'しゅう', 'じゅう', 'きゅう'],
    ['月', 'がつ', 'にち', 'ねん'],
    ['年', 'ねん', 'なん', 'ぜん'],
    ['火', 'か', 'すい', 'もく'],
    ['水', 'みず', 'みち', 'みみ'],
    ['木', 'き', 'ひ', 'つち'],
    ['金', 'きん', 'きた', 'けん'],
    ['土', 'ど', 'ご', 'もく'],
    ['曜', 'よう', 'こう', 'ちょう'],
    ['本', 'ほん', 'はん', 'ぶん'],
    ['人', 'ひと', 'いり', 'こ'],
    ['今', 'いま', 'かい', 'いつ'],
    ['寺', 'てら', 'そら', 'みせ'],
    ['先', 'せん', 'ぜん', 'さん'],
    ['生', 'せい', 'せん', 'じょう'],
    ['学', 'がく', 'かく', 'こう'],
    ['校', 'こう', 'がく', 'きょう'],
    ['高', 'たかい', 'やすい', 'ながい'],
    ['小', 'ちいさい', 'すくない', 'おおきい'],
    ['大', 'おおきい', 'おおい', 'ちいさい'],
    ['中', 'なか', 'そと', 'うえ'],
    ['長', 'ながい', 'たかい', 'やすい'],
    ['半', 'はん', 'ほん', 'まん'],
    ['分', 'ふん', 'ほん', 'はん'],
    ['間', 'かん', 'まん', 'はん'],
    ['上', 'うえ', 'した', 'まえ'],
    ['下', 'した', 'うえ', 'そと'],
    ['左', 'ひだり', 'みぎ', 'うしろ'],
    ['右', 'みぎ', 'ひだり', 'みみ'],
    ['前', 'まえ', 'うしろ', 'うえ'],
    ['後', 'うしろ', 'まえ', 'ひだり'],
    ['外', 'そと', 'なか', 'した'],
    ['名', 'な', 'め', 'て'],
    ['川', 'かわ', 'やま', 'てら'],
    ['山', 'やま', 'かわ', 'みち'],
    ['出', 'でる', 'はいる', 'みる'],
    ['入', 'はいる', 'でる', 'かえる'],
    ['口', 'くち', 'くに', 'つち'],
    ['目', 'め', 'みみ', 'て'],
    ['耳', 'みみ', 'みぎ', 'め'],
    ['手', 'て', 'め', 'あし'],
    ['足', 'あし', 'て', 'みみ'],
    ['空', 'そら', 'あめ', 'てん'],
    ['天', 'てん', 'そら', 'でん'],
    ['気', 'き', 'てん', 'でん'],
    ['雨', 'あめ', 'そら', 'みず'],
    ['電', 'でん', 'てん', 'せん'],
    ['車', 'くるま', 'みち', 'えき'],
    ['国', 'くに', 'くち', 'きた'],
    ['駅', 'えき', 'いき', 'えん'],
    ['道', 'みち', 'みせ', 'みず'],
    ['社', 'しゃ', 'てん', 'しょ'],
    ['店', 'みせ', 'みち', 'みず'],
    ['買', 'かう', 'かく', 'あう'],
    ['話', 'はなす', 'よむ', 'きく'],
    ['読', 'よむ', 'かく', 'きく'],
    ['聞', 'きく', 'みる', 'よむ'],
    ['書', 'かく', 'きく', 'よむ'],
    ['見', 'みる', 'きく', 'くる'],
    ['行', 'いく', 'くる', 'かえる'],
    ['来', 'くる', 'いく', 'かえる'],
    ['帰', 'かえる', 'かう', 'くる'],
    ['食', 'たべる', 'のむ', 'かう'],
    ['飲', 'のむ', 'たべる', 'よむ'],
    ['会', 'あう', 'かう', 'いう'],
    ['何', 'なに', 'なな', 'なか'],
    ['父', 'ちち', 'はは', 'つち'],
    ['母', 'はは', 'ちち', 'はち'],
    ['男', 'おとこ', 'おんな', 'おとな'],
    ['女', 'おんな', 'おとこ', 'みなみ'],
    ['子', 'こ', 'ご', 'き'],
    ['友', 'とも', 'とき', 'とし'],
    ['白', 'しろ', 'くろ', 'あか'],
    ['毎', 'まい', 'めい', 'かい'],
    ['午', 'ご', 'こ', 'ぎゅう'],
    ['休', 'やすむ', 'やすい', 'よむ'],
    ['言', 'いう', 'あう', 'いく'],
    ['語', 'ご', 'こ', 'ごう'],
    ['東', 'ひがし', 'にし', 'きた'],
    ['西', 'にし', 'ひがし', 'みなみ'],
    ['南', 'みなみ', 'きた', 'にし'],
    ['北', 'きた', 'みなみ', 'ひがし'],
    ['安', 'やすい', 'たかい', 'やすむ'],
    ['新', 'あたらしい', 'ふるい', 'あたたかい'],
    ['古', 'ふるい', 'あたらしい', 'やすい'],
    ['多', 'おおい', 'おおきい', 'すくない'],
    ['少', 'すくない', 'おおい', 'ちいさい'],
  ];

  // ─────────────────────────────────────────────────────────────
  // Domain B: N5 vocabulary written with kanji (kana-only excluded).
  // [word, reading, wrong1, wrong2]
  // Special readings (今日, 明日, 大人, 一日, 二十日, 二十歳…) are first-class.
  // Distractors avoid every valid alternate reading of the same word
  // (e.g. 明日: あす/みょうにち avoided; 一人: いちにん avoided).
  // ─────────────────────────────────────────────────────────────
  const VOCAB = [
    // time
    ['今日', 'きょう', 'こんじつ', 'いまび'],
    ['明日', 'あした', 'あしだ', 'めいにち'],
    ['昨日', 'きのう', 'さくにち', 'きょねん'],
    ['今朝', 'けさ', 'こんちょう', 'いまあさ'],
    ['今晩', 'こんばん', 'いまばん', 'こんぱん'],
    ['今週', 'こんしゅう', 'いましゅう', 'こんしゅ'],
    ['来週', 'らいしゅう', 'らいしゅ', 'くるしゅう'],
    ['先週', 'せんしゅう', 'さきしゅう', 'せんしゅ'],
    ['今月', 'こんげつ', 'こんがつ', 'いまつき'],
    ['来月', 'らいげつ', 'らいがつ', 'くげつ'],
    ['先月', 'せんげつ', 'せんがつ', 'さきつき'],
    ['今年', 'ことし', 'いまとし', 'こねん'],
    ['来年', 'らいねん', 'らいとし', 'くるねん'],
    ['去年', 'きょねん', 'きょうねん', 'さくねん'],
    ['毎日', 'まいにち', 'まいび', 'ごとにち'],
    ['毎朝', 'まいあさ', 'まいちょう', 'ごとあさ'],
    ['毎晩', 'まいばん', 'まいぼん', 'ごとばん'],
    ['毎週', 'まいしゅう', 'まいしゅ', 'ごとしゅう'],
    ['毎年', 'まいとし', 'まいどし', 'ごととし'],
    ['毎月', 'まいつき', 'まいがつ', 'ごとつき'],
    ['午前', 'ごぜん', 'ごまえ', 'こぜん'],
    ['午後', 'ごご', 'ごこう', 'ごあと'],
    ['時間', 'じかん', 'じけん', 'じがん'],
    ['半分', 'はんぶん', 'はんふん', 'はんぷん'],
    ['一時', 'いちじ', 'ひとじ', 'いちとき'],
    ['何時', 'なんじ', 'なにじ', 'なんとき'],
    ['今度', 'こんど', 'いまど', 'こんどう'],
    ['時々', 'ときどき', 'ときとき', 'じじ'],
    // days of the week
    ['月曜日', 'げつようび', 'がつようび', 'げつようか'],
    ['火曜日', 'かようび', 'ひようび', 'かようか'],
    ['水曜日', 'すいようび', 'みずようび', 'すいようか'],
    ['木曜日', 'もくようび', 'きようび', 'ぼくようび'],
    ['金曜日', 'きんようび', 'かねようび', 'こんようび'],
    ['土曜日', 'どようび', 'つちようび', 'とようび'],
    ['日曜日', 'にちようび', 'ひようび', 'にちようか'],
    ['誕生日', 'たんじょうび', 'たんせいび', 'たんじょうひ'],
    // months
    ['一月', 'いちがつ', 'ひとつき', 'いちげつ'],
    ['二月', 'にがつ', 'ふたがつ', 'にげつ'],
    ['三月', 'さんがつ', 'さんげつ', 'みがつ'],
    ['四月', 'しがつ', 'よんがつ', 'しげつ'],
    ['五月', 'ごがつ', 'ごげつ', 'いつがつ'],
    ['六月', 'ろくがつ', 'ろくげつ', 'むがつ'],
    ['七月', 'しちがつ', 'なながつ', 'しちげつ'],
    ['八月', 'はちがつ', 'はちげつ', 'やがつ'],
    ['九月', 'くがつ', 'きゅうがつ', 'くげつ'],
    ['十月', 'じゅうがつ', 'とがつ', 'じゅうげつ'],
    ['十一月', 'じゅういちがつ', 'じゅういちげつ', 'じゅうひとがつ'],
    ['十二月', 'じゅうにがつ', 'じゅうにげつ', 'じゅうふたがつ'],
    // days of the month (special readings galore)
    ['一日', 'ついたち', 'いちひ', 'ひとにち'],
    ['二日', 'ふつか', 'ににち', 'ふたか'],
    ['三日', 'みっか', 'さんにち', 'みか'],
    ['四日', 'よっか', 'ようか', 'よんにち'],
    ['五日', 'いつか', 'ごにち', 'いちか'],
    ['六日', 'むいか', 'ろくにち', 'むか'],
    ['七日', 'なのか', 'しちにち', 'ななか'],
    ['八日', 'ようか', 'よっか', 'はちにち'],
    ['九日', 'ここのか', 'きゅうにち', 'ここか'],
    ['十日', 'とおか', 'じゅうにち', 'とか'],
    ['二十日', 'はつか', 'にじゅうにち', 'ふつか'],
    ['何日', 'なんにち', 'なんび', 'なにひ'],
    // native counters / people counters
    ['一つ', 'ひとつ', 'いちつ', 'ふたつ'],
    ['二つ', 'ふたつ', 'につ', 'ひとつ'],
    ['三つ', 'みっつ', 'さんつ', 'むっつ'],
    ['四つ', 'よっつ', 'しつ', 'やっつ'],
    ['五つ', 'いつつ', 'ごつ', 'ななつ'],
    ['六つ', 'むっつ', 'ろくつ', 'みっつ'],
    ['七つ', 'ななつ', 'しちつ', 'やっつ'],
    ['八つ', 'やっつ', 'はちつ', 'よっつ'],
    ['九つ', 'ここのつ', 'きゅうつ', 'とおつ'],
    ['一人', 'ひとり', 'ひとにん', 'いちじん'],
    ['二人', 'ふたり', 'ふたにん', 'にじん'],
    ['三人', 'さんにん', 'さんじん', 'みにん'],
    ['四人', 'よにん', 'よんにん', 'しにん'],
    // people
    ['お父さん', 'おとうさん', 'おちちさん', 'おとおさん'],
    ['お母さん', 'おかあさん', 'おははさん', 'おかさん'],
    ['子ども', 'こども', 'ことも', 'しども'],
    ['女の子', 'おんなのこ', 'じょのこ', 'おんなのし'],
    ['男の子', 'おとこのこ', 'だんのこ', 'おとこのし'],
    ['女の人', 'おんなのひと', 'おんなのじん', 'じょのひと'],
    ['男の人', 'おとこのひと', 'おとこのじん', 'だんのひと'],
    ['友達', 'ともだち', 'ともたち', 'ゆうたつ'],
    ['大人', 'おとな', 'だいにん', 'おおひと'],
    ['人々', 'ひとびと', 'ひとひと', 'にんにん'],
    ['日本人', 'にほんじん', 'にほんひと', 'にほんにん'],
    ['外国人', 'がいこくじん', 'そとくにじん', 'がいこくにん'],
    ['あの人', 'あのひと', 'あのじん', 'あのにん'],
    ['名前', 'なまえ', 'めいぜん', 'なまい'],
    ['二十歳', 'はたち', 'ふたち', 'はたさい'],
    // school
    ['学生', 'がくせい', 'がくしょう', 'がっせい'],
    ['先生', 'せんせい', 'せいせん', 'せんせ'],
    ['学校', 'がっこう', 'がくこう', 'がっこ'],
    ['大学', 'だいがく', 'おおがく', 'たいがく'],
    ['小学校', 'しょうがっこう', 'こがっこう', 'しょうがくこう'],
    ['中学校', 'ちゅうがっこう', 'なかがっこう', 'ちゅうがくこう'],
    ['高校', 'こうこう', 'たかこう', 'こうごう'],
    ['大学生', 'だいがくせい', 'だいがくしょう', 'おおがくせい'],
    ['中学生', 'ちゅうがくせい', 'ちゅうがくしょう', 'なかがくせい'],
    ['高校生', 'こうこうせい', 'たかこうせい', 'こうこうしょう'],
    ['小学生', 'しょうがくせい', 'こがくせい', 'しょうがっせい'],
    ['留学生', 'りゅうがくせい', 'りゅうがくしょう', 'るがくせい'],
    ['図書館', 'としょかん', 'ずしょかん', 'としょうかん'],
    ['辞書', 'じしょ', 'じしょう', 'ずしょ'],
    ['言葉', 'ことば', 'ことは', 'げんよう'],
    ['休み', 'やすみ', 'きゅうみ', 'やすび'],
    // language
    ['英語', 'えいご', 'えいごう', 'ええご'],
    ['日本語', 'にほんご', 'にほんごう', 'にちほんご'],
    ['外国語', 'がいこくご', 'がいこくごう', 'そとくにご'],
    ['会話', 'かいわ', 'あいわ', 'かいばなし'],
    // holidays
    ['夏休み', 'なつやすみ', 'かやすみ', 'なつやすび'],
    // places
    ['日本', 'にほん', 'にちほん', 'ひもと'],
    ['東京', 'とうきょう', 'ひがしきょう', 'とうきょ'],
    ['中国', 'ちゅうごく', 'なかくに', 'ちゅうこく'],
    ['外国', 'がいこく', 'そとぐに', 'がいごく'],
    ['会社', 'かいしゃ', 'かいじゃ', 'あいしゃ'],
    ['会社員', 'かいしゃいん', 'かいしゃにん', 'あいしゃいん'],
    ['銀行', 'ぎんこう', 'きんこう', 'ぎんぎょう'],
    ['喫茶店', 'きっさてん', 'きさてん', 'きっちゃてん'],
    ['食堂', 'しょくどう', 'たべどう', 'しょくとう'],
    ['八百屋', 'やおや', 'はっぴゃくや', 'やひゃくや'],
    ['本屋', 'ほんや', 'もとや', 'ほんおく'],
    ['大使館', 'たいしかん', 'だいしかん', 'たいじかん'],
    ['お手洗い', 'おてあらい', 'おしゅあらい', 'おてあれい'],
    ['出口', 'でぐち', 'でくち', 'しゅつぐち'],
    ['入口', 'いりぐち', 'いりくち', 'にゅうぐち'],
    ['空港', 'くうこう', 'そらこう', 'くうごう'],
    // transport
    ['電車', 'でんしゃ', 'でんくるま', 'てんしゃ'],
    ['自動車', 'じどうしゃ', 'じどうくるま', 'じとうしゃ'],
    ['自転車', 'じてんしゃ', 'じでんしゃ', 'じてんくるま'],
    ['地下鉄', 'ちかてつ', 'じかてつ', 'ちかでつ'],
    ['飛行機', 'ひこうき', 'ひぎょうき', 'とびこうき'],
    // things / states
    ['天気', 'てんき', 'でんき', 'てんぎ'],
    ['電気', 'でんき', 'てんき', 'でんぎ'],
    ['病気', 'びょうき', 'びよき', 'へいき'],
    ['空気', 'くうき', 'そらき', 'くうぎ'],
    ['時計', 'とけい', 'じけい', 'ときけい'],
    ['新聞', 'しんぶん', 'しんもん', 'あたらしぶん'],
    ['手紙', 'てがみ', 'てかみ', 'しゅがみ'],
    ['切手', 'きって', 'きりて', 'せって'],
    ['お金', 'おかね', 'おきん', 'おがね'],
    ['帽子', 'ぼうし', 'ぼし', 'もうし'],
    ['食べ物', 'たべもの', 'たべぶつ', 'しょくもつ'],
    ['飲み物', 'のみもの', 'のみぶつ', 'いんもの'],
    ['買い物', 'かいもの', 'かいぶつ', 'ばいもの'],
    ['お菓子', 'おかし', 'おかこ', 'おがし'],
    ['万年筆', 'まんねんひつ', 'まんねんふで', 'ばんねんひつ'],
    // communication / activities
    ['電話', 'でんわ', 'てんわ', 'でんは'],
    ['電話番号', 'でんわばんごう', 'でんわばんご', 'てんわばんごう'],
    ['食事', 'しょくじ', 'たべじ', 'しょくごと'],
    // special-reading words (conjugating adjectives live in Domain D:
    // 白い/元気/有名/大切/大変/上手/下手 moved there as chain cards)
    ['大好き', 'だいすき', 'たいすき', 'だいずき'],
    ['大丈夫', 'だいじょうぶ', 'たいじょうぶ', 'だいじょぶ'],
    ['本当', 'ほんとう', 'もとう', 'ほんどう'],
    // misc
    ['旅行', 'りょこう', 'りょぎょう', 'たびこう'],
    ['午前中', 'ごぜんちゅう', 'ごぜんなか', 'ごぜんじゅう'],
    ['一年', 'いちねん', 'ひとねん', 'いちとし'],
    ['一週間', 'いっしゅうかん', 'いちしゅうかん', 'いっしゅうけん'],
    ['一時間', 'いちじかん', 'ひとじかん', 'いちじけん'],
    ['何時間', 'なんじかん', 'なにじかん', 'なんじけん'],
    ['百円', 'ひゃくえん', 'びゃくえん', 'はくえん'],
    ['千円', 'せんえん', 'せんねん', 'ぜんえん'],
    ['一万円', 'いちまんえん', 'いちばんえん', 'ひとまんえん'],
    ['一分', 'いっぷん', 'いちふん', 'いっふん'],
    ['五分', 'ごふん', 'ごぷん', 'ごぶん'],
    ['何分', 'なんぷん', 'なんふん', 'なにふん'],
    ['九時', 'くじ', 'きゅうじ', 'ここのじ'],
    ['四時', 'よじ', 'よんじ', 'しじ'],
    ['七時', 'しちじ', 'ななじ', 'なのじ'],
    ['何曜日', 'なんようび', 'なにようび', 'なんよう'],
    ['何年', 'なんねん', 'なにねん', 'なんとし'],
    ['何月', 'なんがつ', 'なにがつ', 'なんげつ'],
    ['何歳', 'なんさい', 'なにさい', 'なんざい'],
    ['一番', 'いちばん', 'いちまん', 'ひとばん'],
    ['一緒', 'いっしょ', 'いちしょ', 'いっしょう'],
    ['読み方', 'よみかた', 'よみほう', 'よみがた'],
    ['社長', 'しゃちょう', 'しゃなが', 'さちょう'],
    ['自分', 'じぶん', 'じふん', 'みぶん'],
    ['再来年', 'さらいねん', 'さいらいねん', 'ふたらいねん'],
    ['明後日', 'あさって', 'めいごにち', 'あすって'],
    ['上着', 'うわぎ', 'じょうぎ', 'うえぎ'],
    ['お土産', 'おみやげ', 'おみあげ', 'おみやけ'],
  ];

  // ─────────────────────────────────────────────────────────────
  // Domain C: N5 verbs — 7-step conjugation chains ([CX-8] + ません/ました).
  // [dictForm, reading, group, readingWrong1, readingWrong2]
  // Required coverage: 来る, 電話する (する exemplar), 行く (行って),
  // and all five godan て/た euphony families:
  //   う・つ・る→って / ぬ・ぶ・む→んで / く→いて / ぐ→いで / す→して
  // ─────────────────────────────────────────────────────────────
  const VERBS = [
    // ichidan
    ['食べる', 'たべる', 'ichidan', 'しょくべる', 'くべる'],
    ['見る', 'みる', 'ichidan', 'けんる', 'にる'],
    ['寝る', 'ねる', 'ichidan', 'しんる', 'ねむる'],
    ['起きる', 'おきる', 'ichidan', 'きる', 'おこる'],
    ['出る', 'でる', 'ichidan', 'だる', 'しゅつる'],
    ['着る', 'きる', 'ichidan', 'ちゃくる', 'つくる'],
    ['入れる', 'いれる', 'ichidan', 'にゅうれる', 'はいれる'],
    ['教える', 'おしえる', 'ichidan', 'きょうえる', 'おぼえる'],
    ['覚える', 'おぼえる', 'ichidan', 'かくえる', 'おしえる'],
    ['忘れる', 'わすれる', 'ichidan', 'ぼうれる', 'わかれる'],
    ['借りる', 'かりる', 'ichidan', 'しゃくりる', 'かえりる'],
    ['浴びる', 'あびる', 'ichidan', 'よくびる', 'おびる'],
    ['生まれる', 'うまれる', 'ichidan', 'せいまれる', 'なまれる'],
    ['出かける', 'でかける', 'ichidan', 'しゅっかける', 'だかける'],
    ['疲れる', 'つかれる', 'ichidan', 'ひれる', 'つかえる'],
    ['答える', 'こたえる', 'ichidan', 'とうえる', 'かんがえる'],
    // godan う (って)
    ['会う', 'あう', 'godan', 'かいう', 'あらう'],
    ['買う', 'かう', 'godan', 'ばいう', 'あう'],
    ['歌う', 'うたう', 'godan', 'かう', 'わらう'],
    ['洗う', 'あらう', 'godan', 'せんう', 'あう'],
    ['吸う', 'すう', 'godan', 'きゅう', 'ぬう'],
    ['使う', 'つかう', 'godan', 'しう', 'ちがう'],
    // godan つ (って)
    ['待つ', 'まつ', 'godan', 'たいつ', 'もつ'],
    ['立つ', 'たつ', 'godan', 'りつ', 'まつ'],
    ['持つ', 'もつ', 'godan', 'じつ', 'まつ'],
    // godan る (って)
    ['帰る', 'かえる', 'godan', 'きる', 'かわる'],
    ['入る', 'はいる', 'godan', 'にゅうる', 'いれる'],
    ['切る', 'きる', 'godan', 'せつる', 'きれる'],
    ['知る', 'しる', 'godan', 'ちる', 'きる'],
    ['座る', 'すわる', 'godan', 'ざる', 'すべる'],
    ['取る', 'とる', 'godan', 'しゅる', 'のる'],
    ['走る', 'はしる', 'godan', 'そうる', 'はいる'],
    ['分かる', 'わかる', 'godan', 'ぶんかる', 'わたる'],
    ['終わる', 'おわる', 'godan', 'しゅうわる', 'まわる'],
    ['渡る', 'わたる', 'godan', 'とる', 'わかる'],
    ['始まる', 'はじまる', 'godan', 'しまる', 'はじめる'],
    ['止まる', 'とまる', 'godan', 'とめる', 'しまる'],
    // godan ぬ (んで)
    ['死ぬ', 'しぬ', 'godan', 'にぬ', 'しむ'],
    // godan ぶ (んで)
    ['遊ぶ', 'あそぶ', 'godan', 'ゆうぶ', 'よぶ'],
    ['飛ぶ', 'とぶ', 'godan', 'ひぶ', 'よぶ'],
    // godan む (んで)
    ['読む', 'よむ', 'godan', 'どくむ', 'のむ'],
    ['飲む', 'のむ', 'godan', 'いんむ', 'よむ'],
    ['住む', 'すむ', 'godan', 'じゅうむ', 'すすむ'],
    ['休む', 'やすむ', 'godan', 'きゅうむ', 'やむ'],
    // godan く (いて) — 行く is the 行って exception
    ['書く', 'かく', 'godan', 'しょく', 'きく'],
    ['聞く', 'きく', 'godan', 'ぶんく', 'かく'],
    ['行く', 'いく', 'godan', 'こうく', 'きく'],
    ['働く', 'はたらく', 'godan', 'どうく', 'はたく'],
    ['咲く', 'さく', 'godan', 'しょうく', 'あく'],
    ['着く', 'つく', 'godan', 'ちゃく', 'とどく'],
    ['磨く', 'みがく', 'godan', 'まく', 'みかく'],
    ['置く', 'おく', 'godan', 'ちく', 'いく'],
    // godan ぐ (いで)
    ['泳ぐ', 'およぐ', 'godan', 'えいぐ', 'さわぐ'],
    // godan す (して)
    ['話す', 'はなす', 'godan', 'わす', 'だす'],
    ['出す', 'だす', 'godan', 'しゅつす', 'さす'],
    ['押す', 'おす', 'godan', 'おうす', 'おとす'],
    ['貸す', 'かす', 'godan', 'たいす', 'かえす'],
    // irregular
    ['来る', 'くる', 'irregular', 'きる', 'らいる'],
    ['電話する', 'でんわする', 'irregular', 'てんわする', 'でんはする'],
  ];

  // Godan conjugation rows.
  const GODAN_I = { 'う': 'い', 'つ': 'ち', 'る': 'り', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し' };
  const GODAN_A = { 'う': 'わ', 'つ': 'た', 'る': 'ら', 'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'く': 'か', 'ぐ': 'が', 'す': 'さ' };
  const GODAN_E = { 'う': 'え', 'つ': 'て', 'る': 'れ', 'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'く': 'け', 'ぐ': 'げ', 'す': 'せ' };
  const GODAN_TE = { 'う': 'って', 'つ': 'って', 'る': 'って', 'ぬ': 'んで', 'ぶ': 'んで', 'む': 'んで', 'く': 'いて', 'ぐ': 'いで', 'す': 'して' };
  const GODAN_TA = { 'う': 'った', 'つ': 'った', 'る': 'った', 'ぬ': 'んだ', 'ぶ': 'んだ', 'む': 'んだ', 'く': 'いた', 'ぐ': 'いだ', 'す': 'した' };

  // Class-targeted distractor patterns ([CX-8]): ichidan cards get
  // godan-pattern errors, godan cards get masu-stem/euphony/ichidan-drop
  // errors. Per-verb overrides below fix collisions with real words
  // (切ない, 行ない, 止まない) and the 行く/来る/する irregulars.
  function godanForms(dict) {
    const stem = dict.slice(0, -1);
    const end = dict.slice(-1);
    const masuStem = stem + GODAN_I[end];
    const eStem = stem + GODAN_E[end];
    const teWrong = (end === 'く') ? [stem + 'きて', stem + 'って']
      : (end === 'ぐ') ? [stem + 'ぎて', stem + 'いて']
      : (end === 'す') ? [stem + 'って', stem + 'しで']
      : (end === 'ぬ' || end === 'ぶ' || end === 'む') ? [stem + GODAN_I[end] + 'て', stem + 'んて']
      : [stem + GODAN_I[end] + 'て', stem + 'て'];
    const taWrong = (end === 'く') ? [stem + 'きた', stem + 'った']
      : (end === 'ぐ') ? [stem + 'ぎた', stem + 'いた']
      : (end === 'す') ? [stem + 'った', stem + 'しだ']
      : (end === 'ぬ' || end === 'ぶ' || end === 'む') ? [stem + GODAN_I[end] + 'た', stem + 'んた']
      : [stem + GODAN_I[end] + 'た', stem + 'た'];
    const naiWrong = (end === 'う') ? [stem + 'いない', stem + 'あない']
      : [stem + GODAN_I[end] + 'ない', stem + 'ない'];
    // ません/ました are mechanical from the ます stem; distractors mirror the
    // ます-step error classes (え-stem confusion, dict-form attach).
    return {
      masu: { correct: masuStem + 'ます', wrong: [eStem + 'ます', dict + 'ます'] },
      masen: { correct: masuStem + 'ません', wrong: [eStem + 'ません', dict + 'ません'] },
      mashita: { correct: masuStem + 'ました', wrong: [eStem + 'ました', dict + 'ました'] },
      te: { correct: stem + GODAN_TE[end], wrong: teWrong },
      nai: { correct: stem + GODAN_A[end] + 'ない', wrong: naiWrong },
      ta: { correct: stem + GODAN_TA[end], wrong: taWrong },
    };
  }

  function ichidanForms(dict) {
    const stem = dict.slice(0, -1);
    // ません/ました distractors are the godan-bleed errors on ichidan
    // (食べりません/食べりました) plus the no-drop attach (食べいません).
    return {
      masu: { correct: stem + 'ます', wrong: [stem + 'ります', stem + 'います'] },
      masen: { correct: stem + 'ません', wrong: [stem + 'りません', stem + 'いません'] },
      mashita: { correct: stem + 'ました', wrong: [stem + 'りました', stem + 'いました'] },
      te: { correct: stem + 'て', wrong: [stem + 'って', stem + 'りて'] },
      nai: { correct: stem + 'ない', wrong: [stem + 'らない', stem + 'くない'] },
      ta: { correct: stem + 'た', wrong: [stem + 'った', stem + 'りた'] },
    };
  }

  const VERB_OVERRIDES = {
    '行く': { // 行って exception; avoid 行ない (real orthography of おこない)
      te: { correct: '行って', wrong: ['行いて', '行きて'] },
      ta: { correct: '行った', wrong: ['行いた', '行きた'] },
      nai: { correct: '行かない', wrong: ['行きない', '行くない'] },
    },
    '切る': { // avoid 切ない (real word せつない)
      nai: { correct: '切らない', wrong: ['切りない', '切るない'] },
    },
    '止まる': { // avoid 止まない (real form of 止む)
      nai: { correct: '止まらない', wrong: ['止まりない', '止まるない'] },
    },
    '来る': {
      // Kana surfaces: the kanji form (来ます/来ない) hides the き/こ stem
      // irregularity — the whole point of drilling くる. Distractors are the
      // real learner errors: godan treatment (くります/くって/くらない/くった)
      // and wrong-stem picks (きります/きって on て is a misapplied っ-euphony,
      // きない on ない is THE classic こない slip). ません/ました keep the same
      // kana-surface convention: wrong-stem こ and godan-bleed くり.
      masu: { correct: 'きます', wrong: ['くります', 'こます'] },
      masen: { correct: 'きません', wrong: ['こません', 'くりません'] },
      mashita: { correct: 'きました', wrong: ['こました', 'くりました'] },
      te: { correct: 'きて', wrong: ['くって', 'こて'] },
      nai: { correct: 'こない', wrong: ['きない', 'くらない'] },
      ta: { correct: 'きた', wrong: ['くった', 'こた'] },
    },
    '電話する': {
      masu: { correct: '電話します', wrong: ['電話すります', '電話するます'] },
      masen: { correct: '電話しません', wrong: ['電話すりません', '電話するません'] },
      mashita: { correct: '電話しました', wrong: ['電話すりました', '電話するました'] },
      te: { correct: '電話して', wrong: ['電話すって', '電話するて'] },
      nai: { correct: '電話しない', wrong: ['電話さない', '電話するない'] },
      ta: { correct: '電話した', wrong: ['電話すった', '電話するた'] },
    },
  };

  function verbForms(dict, group) {
    const base = group === 'ichidan' ? ichidanForms(dict)
      : group === 'godan' ? godanForms(dict)
      : {}; // irregular: fully covered by overrides
    return Object.assign({}, base, VERB_OVERRIDES[dict] || {});
  }

  // ─────────────────────────────────────────────────────────────
  // Domain D: N5 adjectives — conjugation chains.
  // [surface, reading, class ('i'|'na'|'irregular'), readingWrong1, readingWrong2]
  // い-adjectives: 4 steps よみ→ない形→過去形→過去否定.
  // な-adjectives: 3 steps よみ→ない形→過去形.
  // 良い is the mandatory irregular (よい/よくない/よかった/よくなかった).
  // Reading distractors follow the kanji-domain idiom: sibling adjective
  // readings and on-reading bleeds; never a valid alternate reading of the
  // same surface (むつかしい, せわしい etc. excluded as distractors).
  // ─────────────────────────────────────────────────────────────
  const ADJECTIVES = [
    // い-adjectives
    ['高い', 'たかい', 'i', 'やすい', 'ながい'],
    ['安い', 'やすい', 'i', 'たかい', 'あんい'],
    ['新しい', 'あたらしい', 'i', 'ふるい', 'あたたかい'],
    ['古い', 'ふるい', 'i', 'あたらしい', 'こい'],
    ['大きい', 'おおきい', 'i', 'ちいさい', 'おおい'],
    ['小さい', 'ちいさい', 'i', 'おおきい', 'すくない'],
    ['長い', 'ながい', 'i', 'みじかい', 'たかい'],
    ['短い', 'みじかい', 'i', 'ながい', 'たんい'],
    ['白い', 'しろい', 'i', 'はくい', 'しらい'],
    ['黒い', 'くろい', 'i', 'こくい', 'しろい'],
    ['赤い', 'あかい', 'i', 'せきい', 'あおい'],
    ['青い', 'あおい', 'i', 'せいい', 'あかい'],
    ['早い', 'はやい', 'i', 'そうい', 'おそい'],
    ['遅い', 'おそい', 'i', 'ちこい', 'はやい'],
    ['多い', 'おおい', 'i', 'すくない', 'おおきい'],
    ['少ない', 'すくない', 'i', 'おおい', 'しょうない'],
    ['広い', 'ひろい', 'i', 'こうい', 'せまい'],
    ['近い', 'ちかい', 'i', 'きんい', 'とおい'],
    ['遠い', 'とおい', 'i', 'えんい', 'ちかい'],
    ['強い', 'つよい', 'i', 'きょうい', 'よわい'],
    ['弱い', 'よわい', 'i', 'じゃくい', 'つよい'],
    ['暑い', 'あつい', 'i', 'しょい', 'さむい'],
    ['寒い', 'さむい', 'i', 'かんい', 'あつい'],
    ['熱い', 'あつい', 'i', 'ねつい', 'つめたい'],
    ['冷たい', 'つめたい', 'i', 'れいたい', 'ひえたい'],
    ['楽しい', 'たのしい', 'i', 'らくしい', 'うれしい'],
    ['忙しい', 'いそがしい', 'i', 'ぼうしい', 'いそかしい'],
    ['難しい', 'むずかしい', 'i', 'なんしい', 'むずがしい'],
    // the mandatory irregular
    ['良い', 'よい', 'irregular', 'りょうい', 'よしい'],
    // な-adjectives
    ['元気', 'げんき', 'na', 'けんき', 'げんぎ'],
    ['静か', 'しずか', 'na', 'せいか', 'しすか'],
    ['有名', 'ゆうめい', 'na', 'ゆめい', 'ゆうな'],
    ['便利', 'べんり', 'na', 'びんり', 'へんり'],
    ['大変', 'たいへん', 'na', 'だいへん', 'たいべん'],
    ['大切', 'たいせつ', 'na', 'だいせつ', 'たいぜつ'],
    ['好き', 'すき', 'na', 'こうき', 'ずき'],
    ['嫌い', 'きらい', 'na', 'けんい', 'ぎらい'],
    ['上手', 'じょうず', 'na', 'うえて', 'じょうしゅ'],
    ['下手', 'へた', 'na', 'げしゅ', 'へだ'],
  ];

  // Adjective conjugation builders. Distractor classes per step:
  //   ない形:  な-bleed (高いじゃない) + direct attach (高いない) on い-adjs;
  //            い-bleed (元気くない) + な-retention (元気なじゃない) on な-adjs.
  //   過去形:  no-drop (高いかった) + polite-stem confusion (高いでした) on
  //            い-adjs; い-bleed (元気かった) + な-retention (元気なだった) on
  //            な-adjs (元気でした is grammatical polite — never a distractor).
  //   過去否定: double-conjugation (高くないかった) + な-bleed (高いじゃなかった).
  // Colloquially-grammatical strings (〜くないです, いいじゃない, 元気ない)
  // are never used as distractors.
  function iAdjForms(surface) {
    const stem = surface.slice(0, -1);
    return {
      nai: { correct: stem + 'くない', wrong: [surface + 'じゃない', surface + 'ない'] },
      ta: { correct: stem + 'かった', wrong: [surface + 'かった', surface + 'でした'] },
      nakatta: { correct: stem + 'くなかった', wrong: [stem + 'くないかった', surface + 'じゃなかった'] },
    };
  }

  function naAdjForms(surface) {
    return {
      nai: { correct: surface + 'じゃない', wrong: [surface + 'くない', surface + 'なじゃない'] },
      ta: { correct: surface + 'だった', wrong: [surface + 'かった', surface + 'なだった'] },
    };
  }

  const ADJ_OVERRIDES = {
    '良い': {
      // The irregular: conjugates on the よ stem. Distractors are the
      // regular-pattern errors (いくない, いかった) plus the textbook
      // ×いいでした; いいじゃない is colloquially grammatical — avoided.
      nai: { correct: 'よくない', wrong: ['いくない', 'いいない'] },
      ta: { correct: 'よかった', wrong: ['いかった', 'いいでした'] },
      nakatta: { correct: 'よくなかった', wrong: ['いくなかった', 'よくないかった'] },
    },
    '上手': {
      // Avoid 上手くない/上手かった — real orthography of うまくない/うまかった
      // (same real-word trap class as 切ない/行ない in VERB_OVERRIDES).
      nai: { correct: '上手じゃない', wrong: ['上手なじゃない', '上手だない'] },
      ta: { correct: '上手だった', wrong: ['上手なだった', '上手だかった'] },
    },
  };

  function adjForms(surface, cls) {
    const base = cls === 'i' ? iAdjForms(surface)
      : cls === 'na' ? naAdjForms(surface)
      : {}; // irregular: fully covered by overrides
    return Object.assign({}, base, ADJ_OVERRIDES[surface] || {});
  }

  // ─────────────────────────────────────────────────────────────
  // Domain E: particle cloze cards ([CX-9]).
  // [sentence (blank = full-width ［　］), correct, wrong1, wrong2]
  // Answers are orthographic particles (は never わ). Sentence kanji
  // restricted to the N5 set above; everything else stays in kana.
  // Distractors audited so no distractor is also grammatical in the slot.
  // ─────────────────────────────────────────────────────────────
  const PARTICLES = [
    // は — topic
    ['わたし［　］学生です', 'は', 'が', 'を'],
    ['山口さん［　］先生です', 'は', 'を', 'に'],
    ['今日［　］いい天気ですね', 'は', 'を', 'が'],
    ['これ［　］何ですか', 'は', 'が', 'の'],
    // が — subject
    ['つくえの上に何［　］ありますか', 'が', 'は', 'を'],
    ['へやにねこ［　］います', 'が', 'は', 'を'],
    ['わたしはすし［　］すきです', 'が', 'を', 'は'],
    ['日本語［　］分かります', 'が', 'を', 'に'],
    // を — object / traversal
    ['毎日パン［　］食べます', 'を', 'が', 'に'],
    ['としょかんで本［　］読みます', 'を', 'が', 'に'],
    ['水［　］飲みます', 'を', 'に', 'が'],
    ['道［　］わたります', 'を', 'に', 'で'],
    ['空［　］とびます', 'を', 'に', 'で'],
    ['ここに名前［　］書きます', 'を', 'が', 'は'],
    // に — direction / time / target / existence-location
    ['わたしは学校［　］行きます', 'に', 'を', 'で'],
    ['毎日七時［　］おきます', 'に', 'で', 'を'],
    ['友だち［　］会います', 'に', 'を', 'で'],
    ['いす［　］すわります', 'に', 'を', 'で'],
    ['電車［　］のります', 'に', 'を', 'で'],
    ['とうきょう［　］すんでいます', 'に', 'で', 'を'],
    ['つくえの上［　］本があります', 'に', 'で', 'を'],
    // で — action location / means / instrument
    ['としょかん［　］べんきょうします', 'で', 'に', 'を'],
    ['バス［　］学校へ行きます', 'で', 'に', 'を'],
    ['はし［　］ごはんを食べます', 'で', 'を', 'に'],
    ['日本語［　］話してください', 'で', 'に', 'が'],
    ['うち［　］ひるごはんを食べます', 'で', 'に', 'が'],
    ['一人［　］すんでいます', 'で', 'に', 'が'],
    // へ — direction (に excluded from distractors: also grammatical)
    ['来週日本［　］帰ります', 'へ', 'を', 'で'],
    ['どこ［　］行きますか', 'へ', 'を', 'が'],
    // と — companion / quotation / listing
    ['母［　］買いものに行きます', 'と', 'を', 'で'],
    ['「おはよう」［　］言いました', 'と', 'を', 'に'],
    ['パン［　］たまごを買いました', 'と', 'も', 'に'],
    // も — also / wh+も negation
    ['にく［　］さかなも食べます', 'も', 'と', 'を'],
    ['何［　］食べませんでした', 'も', 'が', 'を'],
    ['だれ［　］いませんでした', 'も', 'が', 'は'],
    // から — starting point
    ['学校は九時［　］三時までです', 'から', 'まで', 'に'],
    ['どこ［　］来ましたか', 'から', 'まで', 'へ'],
    ['駅［　］うちまであるきます', 'から', 'まで', 'を'],
    // まで — end point
    ['ぎんこうは三時［　］です', 'まで', 'から', 'に'],
    ['駅から学校［　］あるきます', 'まで', 'が', 'を'],
    ['九時から何時［　］はたらきますか', 'まで', 'から', 'に'],
    // より — comparison
    ['電車はバス［　］はやいです', 'より', 'から', 'と'],
    ['今日はきのう［　］あついです', 'より', 'から', 'まで'],
    // の — possession / apposition
    ['これはわたし［　］本です', 'の', 'は', 'が'],
    ['あの人は日本語［　］先生です', 'の', 'を', 'が'],
    ['これは友だち［　］かばんです', 'の', 'が', 'は'],
    // か — question
    ['これはだれの本です［　］', 'か', 'ね', 'よ'],
    ['今何時です［　］', 'か', 'ね', 'よ'],
    // ね — agreement (reply pins the answer)
    ['「いい天気です［　］。」「そうですね。」', 'ね', 'か', 'を'],
    // よ — new information (reply pins the answer)
    ['「あしたは休みですか。」「いいえ、休みじゃないです［　］。」', 'よ', 'か', 'の'],
  ];

  // ─────────────────────────────────────────────────────────────
  // Domain F: counter reading traps (1-step kanji-to-furigana).
  // [word, reading, wrong1, wrong2]
  // Deduped against KANJI/VOCAB: 一つ…九つ, 一人…四人, all months,
  // 一日…十日/二十日, 一分/五分/何分, 九時/四時/七時, 百円/千円/一万円,
  // 二十歳, 一年/一時間/一週間, 何歳 etc. already live there — skipped here.
  // 十(とお) skipped: latex would collide with the core kanji card 十.
  // Distractors are the tempting-but-wrong readings; valid alternates
  // (じっぷん/じゅうぶん for 十分, はちふん for 八分, しちふん for 七分,
  // じっさい/じっぽん, くにん for 九人, やお for 八百) are never used.
  // ─────────────────────────────────────────────────────────────
  const COUNTERS = [
    // 分 — minutes (ふん/ぷん sound changes)
    ['二分', 'にふん', 'にぷん', 'ふたふん'],
    ['三分', 'さんぷん', 'さんふん', 'みふん'],
    ['四分', 'よんぷん', 'よんふん', 'しふん'],
    ['六分', 'ろっぷん', 'ろくふん', 'ろくぷん'],
    ['七分', 'ななふん', 'ななぷん', 'なのふん'],
    ['八分', 'はっぷん', 'はっふん', 'やぷん'],
    ['九分', 'きゅうふん', 'くふん', 'きゅうぷん'],
    ['十分', 'じゅっぷん', 'じゅうふん', 'とおふん'],
    ['二十分', 'にじゅっぷん', 'にじゅうふん', 'ふたじゅっぷん'],
    ['三十分', 'さんじゅっぷん', 'さんじゅうふん', 'さんじゅぷん'],
    // 本 — long objects (ほん/ぼん/ぽん sound changes)
    ['一本', 'いっぽん', 'いちほん', 'いっほん'],
    ['二本', 'にほん', 'にぼん', 'にぽん'],
    ['三本', 'さんぼん', 'さんほん', 'さんぽん'],
    ['四本', 'よんほん', 'よんぼん', 'しほん'],
    ['五本', 'ごほん', 'ごぼん', 'ごぽん'],
    ['六本', 'ろっぽん', 'ろくほん', 'ろっほん'],
    ['八本', 'はっぽん', 'はちほん', 'はっほん'],
    ['九本', 'きゅうほん', 'くほん', 'きゅうぼん'],
    ['十本', 'じゅっぽん', 'じゅうほん', 'とおほん'],
    ['千本', 'せんぼん', 'せんほん', 'せんぽん'],
    ['何本', 'なんぼん', 'なんほん', 'なにぼん'],
    // 枚 — flat objects (regular reading; trap is まい vs めい)
    ['一枚', 'いちまい', 'ひとまい', 'いちめい'],
    ['三枚', 'さんまい', 'みまい', 'さんめい'],
    ['八枚', 'はちまい', 'やまい', 'はちめい'],
    ['何枚', 'なんまい', 'なにまい', 'なんめい'],
    // 百 — hundreds (びゃく/ぴゃく sound changes)
    ['三百', 'さんびゃく', 'さんひゃく', 'さんぴゃく'],
    ['四百', 'よんひゃく', 'しひゃく', 'よんびゃく'],
    ['六百', 'ろっぴゃく', 'ろくひゃく', 'ろくびゃく'],
    ['八百', 'はっぴゃく', 'はちひゃく', 'やひゃく'],
    // 千 — thousands (ぜん/せん sound changes)
    ['三千', 'さんぜん', 'さんせん', 'みぜん'],
    ['四千', 'よんせん', 'しせん', 'よんぜん'],
    ['八千', 'はっせん', 'はちせん', 'やせん'],
    // 歳 — age (っ sound changes; 二十歳/何歳 live in vocab)
    ['一歳', 'いっさい', 'いちさい', 'ひとさい'],
    ['八歳', 'はっさい', 'はちさい', 'やさい'],
    ['九歳', 'きゅうさい', 'くさい', 'きゅうざい'],
    ['十歳', 'じゅっさい', 'じゅうさい', 'とおさい'],
    // 人 — people (にん vs じん; 一人…四人 live in vocab)
    ['五人', 'ごにん', 'ごじん', 'いつにん'],
    ['六人', 'ろくにん', 'ろくじん', 'むにん'],
    ['八人', 'はちにん', 'はちじん', 'やにん'],
    ['九人', 'きゅうにん', 'きゅうじん', 'ここのにん'],
    ['十人', 'じゅうにん', 'じゅうじん', 'とおにん'],
    // 日 — the compound よっか traps beyond the vocab set
    ['十四日', 'じゅうよっか', 'じゅうよんにち', 'じゅうしにち'],
    ['二十四日', 'にじゅうよっか', 'にじゅうよんにち', 'にじゅうしにち'],
    // 年・時間 — the よ readings of 四
    ['四年', 'よねん', 'よんねん', 'しねん'],
    ['四時間', 'よじかん', 'よんじかん', 'しじかん'],
  ];

  // ─────────────────────────────────────────────────────────────
  // Builders
  // ─────────────────────────────────────────────────────────────
  function kanjiId(char) {
    return 'k-' + char.codePointAt(0).toString(16);
  }
  function wordId(word) {
    return 'kc-' + [...word].map(ch => ch.codePointAt(0).toString(16)).join('-');
  }
  function verbId(word) {
    return 'v-' + [...word].map(ch => ch.codePointAt(0).toString(16)).join('-');
  }
  function adjId(word) {
    return 'adj-' + [...word].map(ch => ch.codePointAt(0).toString(16)).join('-');
  }
  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }
  function shuffleArr(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
    }
    return copy;
  }

  const KANJI_ID_SET = new Set(KANJI.map(row => kanjiId(row[0])));

  function componentRequires(word) {
    return unique([...word]
      .filter(ch => /\p{Script=Han}/u.test(ch))
      .map(kanjiId)
      .filter(id => KANJI_ID_SET.has(id)));
  }

  // Single-step reading chain (spec §1.1): glyph → reading, 3 MC.
  function buildReadingChain(prompt, reading, wrong1, wrong2) {
    return [{
      type: 'kanji-to-furigana',
      label: 'よみ',
      prompt: prompt,
      correct: reading,
      wrong: [wrong1, wrong2],
    }];
  }

  // 7-step conjugation chain (spec §2.3 extended with ません形/ました形):
  // よみ→ます形→ません形→ました形→て形→ない形→た形.
  function buildVerbChain(dict, reading, group, rw1, rw2) {
    const forms = verbForms(dict, group);
    return [
      { type: 'kanji-to-furigana', label: 'よみ', prompt: dict, correct: reading, wrong: [rw1, rw2] },
      { type: 'conj-masu', label: 'ます形', prompt: dict + '→ます形', correct: forms.masu.correct, wrong: forms.masu.wrong.slice() },
      { type: 'conj-masen', label: 'ません形', prompt: dict + '→ません形', correct: forms.masen.correct, wrong: forms.masen.wrong.slice() },
      { type: 'conj-mashita', label: 'ました形', prompt: dict + '→ました形', correct: forms.mashita.correct, wrong: forms.mashita.wrong.slice() },
      { type: 'conj-te', label: 'て形', prompt: dict + '→て形', correct: forms.te.correct, wrong: forms.te.wrong.slice() },
      { type: 'conj-nai', label: 'ない形', prompt: dict + '→ない形', correct: forms.nai.correct, wrong: forms.nai.wrong.slice() },
      { type: 'conj-ta', label: 'た形', prompt: dict + '→た形', correct: forms.ta.correct, wrong: forms.ta.wrong.slice() },
    ];
  }

  // Adjective chain: い (and the 良い irregular) 4 steps
  // (よみ→ない形→過去形→過去否定); な-adjectives 3 steps (よみ→ない形→過去形).
  function buildAdjChain(surface, reading, cls, rw1, rw2) {
    const forms = adjForms(surface, cls);
    const isNa = cls === 'na';
    const steps = [
      { type: 'kanji-to-furigana', label: 'よみ', prompt: surface, correct: reading, wrong: [rw1, rw2] },
      { type: isNa ? 'na-nai' : 'adj-nai', label: 'ない形', prompt: surface + '→ない形', correct: forms.nai.correct, wrong: forms.nai.wrong.slice() },
      { type: isNa ? 'na-ta' : 'adj-ta', label: '過去形', prompt: surface + '→過去形', correct: forms.ta.correct, wrong: forms.ta.wrong.slice() },
    ];
    if (!isNa) {
      steps.push({ type: 'adj-nakatta', label: '過去否定', prompt: surface + '→過去否定', correct: forms.nakatta.correct, wrong: forms.nakatta.wrong.slice() });
    }
    return steps;
  }

  function pad3(n) {
    return String(n + 1).padStart(3, '0');
  }

  function buildCommands() {
    const kanjiCommands = KANJI.map(([glyph, reading, w1, w2]) => ({
      id: kanjiId(glyph),
      action: reading,
      displayLabel: reading,
      tier: 'core',
      dom: 'kanji',
      latex: glyph,
      hint: reading,
      explain: '「' + glyph + '」のよみは「' + reading + '」',
      chain: buildReadingChain(glyph, reading, w1, w2),
    }));

    const vocabCommands = VOCAB.map(([word, reading, w1, w2]) => {
      const requires = componentRequires(word);
      if (!requires.length) return null; // same pattern as kanji-g2-cartridge.js
      return {
        id: wordId(word),
        action: reading,
        displayLabel: reading,
        tier: 'regular',
        dom: 'vocab',
        latex: word,
        hint: reading,
        explain: '「' + word + '」のよみは「' + reading + '」',
        chain: buildReadingChain(word, reading, w1, w2),
        requires: requires,
      };
    }).filter(Boolean);

    const verbCommands = VERBS.map(([dict, reading, group, rw1, rw2]) => {
      const cmd = {
        id: verbId(dict),
        action: reading,
        displayLabel: reading,
        tier: 'regular',
        dom: 'verbs',
        group: group,
        latex: dict,
        hint: reading,
        explain: '「' + dict + '」のよみは「' + reading + '」',
        chain: buildVerbChain(dict, reading, group, rw1, rw2),
      };
      const requires = componentRequires(dict);
      if (requires.length) cmd.requires = requires;
      return cmd;
    });

    const adjectiveCommands = ADJECTIVES.map(([surface, reading, cls, rw1, rw2]) => {
      const cmd = {
        id: adjId(surface),
        action: reading,
        displayLabel: reading,
        tier: 'regular',
        dom: 'adjectives',
        group: cls,
        latex: surface,
        hint: reading,
        explain: '「' + surface + '」のよみは「' + reading + '」',
        chain: buildAdjChain(surface, reading, cls, rw1, rw2),
      };
      const requires = componentRequires(surface);
      if (requires.length) cmd.requires = requires;
      return cmd;
    });

    const particleCommands = PARTICLES.map(([sentence, correct, w1, w2], i) => ({
      id: 'p-n5-' + pad3(i),
      action: correct,
      displayLabel: correct,
      tier: 'regular',
      dom: 'particles',
      latex: sentence,
      hint: correct,
      explain: 'こたえは「' + correct + '」',
      chain: [{
        type: 'particle-cloze',
        label: 'じょし',
        prompt: sentence,
        correct: correct,
        wrong: [w1, w2],
      }],
    }));

    const counterCommands = COUNTERS.map(([word, reading, w1, w2], i) => ({
      id: 'c-n5-' + pad3(i),
      action: reading,
      displayLabel: reading,
      tier: 'regular',
      dom: 'counters',
      latex: word,
      hint: reading,
      explain: '「' + word + '」のよみは「' + reading + '」',
      chain: buildReadingChain(word, reading, w1, w2),
      requires: componentRequires(word), // every counter contains an in-set number kanji
    }));

    return kanjiCommands.concat(vocabCommands, verbCommands, adjectiveCommands, particleCommands, counterCommands);
  }

  // ─────────────────────────────────────────────────────────────
  // Builder-time validation ([CX-8], extended to adjectives + counters):
  // console.warn on duplicate ids / duplicate user-facing strings,
  // unresolved requires, malformed steps, distractors that equal the
  // correct form or mix scripts, missing class fields, off-class
  // distractor patterns; plus required-coverage checks (する/くる/行って,
  // 5 euphony families, ません/ました kana surfaces, 良い irregular).
  // ─────────────────────────────────────────────────────────────
  const JP_SCRIPT = /^[ぁ-ゖゝゞー々\p{Script=Han}]+$/u;
  const VALID_GROUPS = new Set(['godan', 'ichidan', 'irregular']);
  const VALID_ADJ_CLASSES = new Set(['i', 'na', 'irregular']);
  const VERB_STEP_TYPES = ['kanji-to-furigana', 'conj-masu', 'conj-masen', 'conj-mashita', 'conj-te', 'conj-nai', 'conj-ta'];

  function validateCommands(commands) {
    const warnings = [];

    // Global: unique ids and unique user-facing strings (latex + step
    // prompts, deduped within a command — 1-step cards repeat their latex).
    const seenIds = new Set();
    const seenStrings = new Set();
    commands.forEach(cmd => {
      if (seenIds.has(cmd.id)) warnings.push('duplicate id: ' + cmd.id);
      seenIds.add(cmd.id);
      unique([cmd.latex].concat((cmd.chain || []).map(step => step.prompt))).forEach(str => {
        if (seenStrings.has(str)) warnings.push(cmd.id + ': duplicate latex/prompt: ' + str);
        seenStrings.add(str);
      });
    });

    // Global: requires resolve to in-set kanji ids; every step is a
    // well-formed 3-choice MC with same-script, distinct answers.
    commands.forEach(cmd => {
      (cmd.requires || []).forEach(id => {
        if (!KANJI_ID_SET.has(id)) warnings.push(cmd.id + ': unresolved requires: ' + id);
      });
      if (!Array.isArray(cmd.chain) || !cmd.chain.length) {
        warnings.push(cmd.id + ': missing chain');
        return;
      }
      cmd.chain.forEach((step, i) => {
        if (!step.prompt || !step.correct || !Array.isArray(step.wrong) || step.wrong.length !== 2 || !step.wrong[0] || !step.wrong[1]) {
          warnings.push(cmd.id + ' step ' + i + ': missing prompt/correct/wrong[2]');
          return;
        }
        if (!JP_SCRIPT.test(step.correct)) warnings.push(cmd.id + ' step ' + i + ': correct mixes scripts: ' + step.correct);
        step.wrong.forEach(w => {
          if (w === step.correct) warnings.push(cmd.id + ' step ' + i + ': distractor equals correct form: ' + w);
          if (!JP_SCRIPT.test(w)) warnings.push(cmd.id + ' step ' + i + ': distractor mixes scripts: ' + w);
        });
        if (step.wrong[0] === step.wrong[1]) warnings.push(cmd.id + ' step ' + i + ': duplicate distractors');
      });
    });

    // Verbs ([CX-8]): group field, 7-step shape in the pinned order.
    const verbCmds = commands.filter(cmd => cmd.dom === 'verbs');
    verbCmds.forEach(cmd => {
      if (!VALID_GROUPS.has(cmd.group)) warnings.push(cmd.id + ': missing or invalid group field');
      if (!Array.isArray(cmd.chain) || cmd.chain.length !== 7) {
        warnings.push(cmd.id + ': verb chain must have 7 steps');
        return;
      }
      cmd.chain.forEach((step, i) => {
        if (step.type !== VERB_STEP_TYPES[i]) warnings.push(cmd.id + ' step ' + i + ': expected type ' + VERB_STEP_TYPES[i] + ', got ' + step.type);
      });
    });

    // Verb required coverage
    const dicts = new Set(VERBS.map(row => row[0]));
    if (!dicts.has('来る')) warnings.push('coverage: 来る missing');
    if (!dicts.has('行く')) warnings.push('coverage: 行く missing');
    if (![...dicts].some(d => d.endsWith('する'))) warnings.push('coverage: する-verb missing');
    const iku = verbCmds.find(cmd => cmd.latex === '行く');
    if (iku && iku.chain[4].correct !== '行って') warnings.push('coverage: 行く て形 must be 行って');
    const kuru = verbCmds.find(cmd => cmd.latex === '来る');
    if (kuru && (kuru.chain[2].correct !== 'きません' || kuru.chain[3].correct !== 'きました')) {
      warnings.push('coverage: 来る ません/ました must keep the kana surface (きません/きました)');
    }
    const endings = new Set(VERBS.filter(row => row[2] === 'godan').map(row => row[0].slice(-1)));
    ['う', 'つ', 'る', 'ぬ', 'ぶ', 'む', 'く', 'ぐ', 'す'].forEach(end => {
      if (!endings.has(end)) warnings.push('coverage: godan ' + end + '-row missing');
    });

    // Adjectives: class field, per-class chain shape, class-correct forms,
    // class-targeted distractors (authored ADJ_OVERRIDES are exempt from
    // the pattern checks — they exist to dodge real-word collisions).
    const adjCmds = commands.filter(cmd => cmd.dom === 'adjectives');
    adjCmds.forEach(cmd => {
      if (!VALID_ADJ_CLASSES.has(cmd.group)) warnings.push(cmd.id + ': missing or invalid adjective class');
      const wantLen = cmd.group === 'na' ? 3 : 4;
      if (!Array.isArray(cmd.chain) || cmd.chain.length !== wantLen) {
        warnings.push(cmd.id + ': adjective chain must have ' + wantLen + ' steps');
        return;
      }
      const overridden = Object.prototype.hasOwnProperty.call(ADJ_OVERRIDES, cmd.latex);
      if (cmd.group === 'i') {
        if (!/くない$/.test(cmd.chain[1].correct)) warnings.push(cmd.id + ': い-adj ない形 must end in くない');
        if (!/かった$/.test(cmd.chain[2].correct)) warnings.push(cmd.id + ': い-adj 過去形 must end in かった');
        if (!/くなかった$/.test(cmd.chain[3].correct)) warnings.push(cmd.id + ': い-adj 過去否定 must end in くなかった');
        if (!overridden) {
          if (!cmd.chain[1].wrong.some(w => /じゃない$/.test(w))) warnings.push(cmd.id + ': い-adj ない形 needs a な-bleed distractor');
          if (!cmd.chain[3].wrong.some(w => /ないかった$/.test(w))) warnings.push(cmd.id + ': い-adj 過去否定 needs a double-conjugation distractor');
        }
      } else if (cmd.group === 'na') {
        if (!/じゃない$/.test(cmd.chain[1].correct)) warnings.push(cmd.id + ': な-adj ない形 must end in じゃない');
        if (!/だった$/.test(cmd.chain[2].correct)) warnings.push(cmd.id + ': な-adj 過去形 must end in だった');
        if (!overridden && !cmd.chain[1].wrong.some(w => /くない$/.test(w))) warnings.push(cmd.id + ': な-adj ない形 needs an い-bleed distractor');
      }
    });

    // Adjective required coverage: the 良い irregular.
    const yoi = adjCmds.find(cmd => cmd.latex === '良い');
    if (!yoi) {
      warnings.push('coverage: 良い (irregular adjective) missing');
    } else {
      if (yoi.group !== 'irregular') warnings.push('coverage: 良い must carry class irregular');
      if (yoi.chain[0].correct !== 'よい' || yoi.chain[1].correct !== 'よくない'
        || yoi.chain[2].correct !== 'よかった' || yoi.chain[3].correct !== 'よくなかった') {
        warnings.push('coverage: 良い must conjugate on the よ stem (よい/よくない/よかった/よくなかった)');
      }
      if (yoi.chain[1].wrong.indexOf('いくない') < 0 || yoi.chain[2].wrong.indexOf('いかった') < 0) {
        warnings.push('coverage: 良い distractors must include the regular-pattern errors いくない/いかった');
      }
    }

    // Counters: id scheme, gating, 1-step reading shape.
    commands.filter(cmd => cmd.dom === 'counters').forEach(cmd => {
      if (!/^c-n5-\d{3}$/.test(cmd.id)) warnings.push(cmd.id + ': counter id must match c-n5-NNN');
      if (!Array.isArray(cmd.requires) || !cmd.requires.length) warnings.push(cmd.id + ': counter must require in-set kanji');
      if (!Array.isArray(cmd.chain) || cmd.chain.length !== 1 || cmd.chain[0].type !== 'kanji-to-furigana') {
        warnings.push(cmd.id + ': counter must be a 1-step kanji-to-furigana card');
      }
    });

    warnings.forEach(msg => console.warn('[jlpt-n5] ' + msg));
    return warnings.length;
  }

  // ─────────────────────────────────────────────────────────────
  // Cartridge object
  // ─────────────────────────────────────────────────────────────
  const commands = buildCommands();
  validateCommands(commands);

  function buildExplanationBank() {
    return { byId: {}, byLabel: {} };
  }

  // Only consulted for commands without a chain (never, here) — honest stub
  // built from chain step 0 so the shape stays valid if it is ever called.
  function generateQuestion(cmd) {
    const step = cmd && Array.isArray(cmd.chain) && cmd.chain[0];
    if (!step) return null;
    const options = shuffleArr([step.correct].concat(step.wrong));
    const idx = options.indexOf(step.correct);
    return { type: 'identify', latex: cmd.latex, options: options, correctIdx: idx, correctKey: ['a', 'b', 'c'][idx] };
  }

  const JLPT_N5 = {
    id: 'jlpt-n5',
    name: 'JLPT N5',
    description: 'ＪＬＰＴ Ｎ５の かんじ・ことば・どうし・けいようし・じょし・かぞえを にほんごだけで れんしゅうするデッキ',
    icon: '⛩️',
    inputMode: 'quiz',
    prefixLabel: null,
    title: 'にほんご Ｎ５',
    subtitle: 'ディフェンス',
    startButton: '出陣',
    instructions: 'かんじとことばとかぞえは よみをえらぼう。どうしは よみ→ます形→ません形→ました形→て形→ない形→た形 のじゅんでこたえよう。けいようしは よみ→ない形→過去形→過去否定 のじゅんでこたえよう（なけいようしは 過去形まで）。じょしは ［　］にはいるものをえらぼう。',
    instructionsSub: 'かんじ・ことば・どうし・けいようし・じょし・かぞえ — ＪＬＰＴ Ｎ５',
    identifyPrompt: 'このことばのよみは？',
    variablePrompt: 'これはなんですか？',
    applicationPrompt: 'どれがあいますか？',
    progressMeter: 'domains',
    musicConfigRef: 'kanji', // adopt the kanji soundtrack (window.TD_KANJI_MUSIC from the joyo file)
    domLabels: {
      kanji: ['かんじ'],
      vocab: ['ことば'],
      verbs: ['どうし'],
      adjectives: ['けいようし'],
      particles: ['じょし'],
      counters: ['かぞえ'],
    },
    commands: commands,
    generateQuestion: generateQuestion,
    formatPrompt: function(cmd) { return cmd.latex || cmd.action; },
    formatAnswer: function(cmd) { return cmd.displayLabel || cmd.action; },
    validateBlank: function(input, answer) { return String(input || '').trim() === String(answer || '').trim(); },
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

  window.JLPT_N5_CARTRIDGE = JLPT_N5;
  window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
  const existingIndex = window.TD_CARTRIDGES.findIndex(function(cart) {
    return cart && cart.id === JLPT_N5.id;
  });
  if (existingIndex >= 0) window.TD_CARTRIDGES[existingIndex] = JLPT_N5;
  else window.TD_CARTRIDGES.push(JLPT_N5);
})();
