// JLPT N5 cartridge — immersion deck (kanji / vocab / verbs / particles).
// Self-contained: no dependency on the grade files. Registers via window.TD_CARTRIDGES.
// Spec: kanji-immersion-n5-spec.md §1.1-1.2, §2 (incl. [CX-8] verb rules, [CX-9] particle rules).
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
    ['一人', 'ひとり', 'いちにん', 'いちじん'],
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
    ['元気', 'げんき', 'けんき', 'げんぎ'],
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
    // adjectives / na-adjectives / special-reading words
    ['白い', 'しろい', 'はくい', 'しらい'],
    ['有名', 'ゆうめい', 'ゆめい', 'ゆうな'],
    ['大切', 'たいせつ', 'だいせつ', 'たいぜつ'],
    ['大変', 'たいへん', 'だいへん', 'たいべん'],
    ['大好き', 'だいすき', 'たいすき', 'だいずき'],
    ['大丈夫', 'だいじょうぶ', 'たいじょうぶ', 'だいじょぶ'],
    ['下手', 'へた', 'げしゅ', 'へだ'],
    ['上手', 'じょうず', 'うえて', 'じょうしゅ'],
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
  // Domain C: N5 verbs — 5-step conjugation chains ([CX-8]).
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
    return {
      masu: { correct: stem + GODAN_I[end] + 'ます', wrong: [stem + GODAN_E[end] + 'ます', dict + 'ます'] },
      te: { correct: stem + GODAN_TE[end], wrong: teWrong },
      nai: { correct: stem + GODAN_A[end] + 'ない', wrong: naiWrong },
      ta: { correct: stem + GODAN_TA[end], wrong: taWrong },
    };
  }

  function ichidanForms(dict) {
    const stem = dict.slice(0, -1);
    return {
      masu: { correct: stem + 'ます', wrong: [stem + 'ります', stem + 'います'] },
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
      // きない on ない is THE classic こない slip).
      masu: { correct: 'きます', wrong: ['くります', 'こます'] },
      te: { correct: 'きて', wrong: ['くって', 'こて'] },
      nai: { correct: 'こない', wrong: ['きない', 'くらない'] },
      ta: { correct: 'きた', wrong: ['くった', 'こた'] },
    },
    '電話する': {
      masu: { correct: '電話します', wrong: ['電話すります', '電話するます'] },
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
  // Domain D: particle cloze cards ([CX-9]).
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

  // 5-step conjugation chain (spec §2.3).
  function buildVerbChain(dict, reading, group, rw1, rw2) {
    const forms = verbForms(dict, group);
    return [
      { type: 'kanji-to-furigana', label: 'よみ', prompt: dict, correct: reading, wrong: [rw1, rw2] },
      { type: 'conj-masu', label: 'ます形', prompt: dict + '→ます形', correct: forms.masu.correct, wrong: forms.masu.wrong.slice() },
      { type: 'conj-te', label: 'て形', prompt: dict + '→て形', correct: forms.te.correct, wrong: forms.te.wrong.slice() },
      { type: 'conj-nai', label: 'ない形', prompt: dict + '→ない形', correct: forms.nai.correct, wrong: forms.nai.wrong.slice() },
      { type: 'conj-ta', label: 'た形', prompt: dict + '→た形', correct: forms.ta.correct, wrong: forms.ta.wrong.slice() },
    ];
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

    return kanjiCommands.concat(vocabCommands, verbCommands, particleCommands);
  }

  // ─────────────────────────────────────────────────────────────
  // Builder-time validation ([CX-8]): console.warn on any verb whose
  // distractors equal the correct form, mix scripts, or miss the group
  // field; plus required-coverage checks (する/くる/行って, 5 euphony families).
  // ─────────────────────────────────────────────────────────────
  const JP_SCRIPT = /^[ぁ-ゖゝゞー々\p{Script=Han}]+$/u;
  const VALID_GROUPS = new Set(['godan', 'ichidan', 'irregular']);

  function validateVerbCommands(commands) {
    const warnings = [];
    const verbCmds = commands.filter(cmd => cmd.dom === 'verbs');

    verbCmds.forEach(cmd => {
      if (!VALID_GROUPS.has(cmd.group)) warnings.push(cmd.id + ': missing or invalid group field');
      if (!Array.isArray(cmd.chain) || cmd.chain.length !== 5) {
        warnings.push(cmd.id + ': verb chain must have 5 steps');
        return;
      }
      cmd.chain.forEach((step, i) => {
        if (!step.prompt || !step.correct || !Array.isArray(step.wrong) || step.wrong.length !== 2) {
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

    // Required coverage
    const dicts = new Set(VERBS.map(row => row[0]));
    if (!dicts.has('来る')) warnings.push('coverage: 来る missing');
    if (!dicts.has('行く')) warnings.push('coverage: 行く missing');
    if (![...dicts].some(d => d.endsWith('する'))) warnings.push('coverage: する-verb missing');
    const iku = verbCmds.find(cmd => cmd.latex === '行く');
    if (iku && iku.chain[2].correct !== '行って') warnings.push('coverage: 行く て形 must be 行って');
    const endings = new Set(VERBS.filter(row => row[2] === 'godan').map(row => row[0].slice(-1)));
    ['う', 'つ', 'る', 'ぬ', 'ぶ', 'む', 'く', 'ぐ', 'す'].forEach(end => {
      if (!endings.has(end)) warnings.push('coverage: godan ' + end + '-row missing');
    });

    warnings.forEach(msg => console.warn('[jlpt-n5] ' + msg));
    return warnings.length;
  }

  // ─────────────────────────────────────────────────────────────
  // Cartridge object
  // ─────────────────────────────────────────────────────────────
  const commands = buildCommands();
  validateVerbCommands(commands);

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
    description: 'ＪＬＰＴ Ｎ５の かんじ・ことば・どうし・じょしを にほんごだけで れんしゅうするデッキ',
    icon: '⛩️',
    inputMode: 'quiz',
    prefixLabel: null,
    title: 'にほんご Ｎ５',
    subtitle: 'ディフェンス',
    startButton: '出陣',
    instructions: 'かんじとことばは よみをえらぼう。どうしは よみ→ます形→て形→ない形→た形 のじゅんでこたえよう。じょしは ［　］にはいるものをえらぼう。',
    instructionsSub: 'かんじ・ことば・どうし・じょし — ＪＬＰＴ Ｎ５',
    identifyPrompt: 'このことばのよみは？',
    variablePrompt: 'これはなんですか？',
    applicationPrompt: 'どれがあいますか？',
    progressMeter: 'domains',
    musicConfigRef: 'kanji', // adopt the kanji soundtrack (window.TD_KANJI_MUSIC from the joyo file)
    domLabels: {
      kanji: ['かんじ'],
      vocab: ['ことば'],
      verbs: ['どうし'],
      particles: ['じょし'],
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
