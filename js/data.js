/* =========================================================
 * 教学内容数据：语文 / 数学 / 英语 × 年龄 3/4/5/6
 * 每个年龄段包含：
 *  cards    —— 卡片教学 [{icon, title, sub, speak, speakLang}]
 *  quiz     —— “找一找”小游戏题库 [{ask, speak, options:[{icon,label}], answer}]
 *  animate  —— 动画小课堂（数数/律动用） {type, items, speak}
 *  phrases  —— 日常生活用语 [{icon, zh, en, speak, speakLang}]
 * ========================================================= */

const PHRASES = {
  zh: [
    { icon: "🌞", zh: "早上好！", en: "", speak: "早上好！", tip: "早上起床说" },
    { icon: "🙏", zh: "谢谢你！", en: "", speak: "谢谢你！", tip: "收到帮助说" },
    { icon: "🙇", zh: "对不起。", en: "", speak: "对不起。", tip: "做错事时说" },
    { icon: "👋", zh: "再见！", en: "", speak: "再见！", tip: "分开的时候说" },
    { icon: "😊", zh: "请。", en: "", speak: "请。", tip: "请别人帮忙说" },
    { icon: "🍚", zh: "我要吃饭了。", en: "", speak: "我要吃饭了。", tip: "吃饭前说" },
    { icon: "🚽", zh: "我要上厕所。", en: "", speak: "我要上厕所。", tip: "有需要时说" },
    { icon: "💧", zh: "我想喝水。", en: "", speak: "我想喝水。", tip: "口渴的时候说" },
    { icon: "🌙", zh: "晚安！", en: "", speak: "晚安！", tip: "睡觉前说" },
    { icon: "❤️", zh: "我爱你们！", en: "", speak: "我爱你们！", tip: "对爸爸妈妈说" }
  ],
  en: [
    { icon: "🌞", zh: "早上好", en: "Good morning!", speak: "Good morning!", speakLang: "en-US", tip: "早上起床说" },
    { icon: "🙏", zh: "谢谢", en: "Thank you!", speak: "Thank you!", speakLang: "en-US", tip: "收到帮助说" },
    { icon: "👋", zh: "再见", en: "Goodbye!", speak: "Goodbye!", speakLang: "en-US", tip: "分开的时候说" },
    { icon: "😊", zh: "请", en: "Please.", speak: "Please.", speakLang: "en-US", tip: "请别人帮忙说" },
    { icon: "🙇", zh: "对不起", en: "I'm sorry.", speak: "I'm sorry.", speakLang: "en-US", tip: "做错事时说" },
    { icon: "🍎", zh: "我要苹果", en: "I want an apple.", speak: "I want an apple.", speakLang: "en-US", tip: "想吃水果说" },
    { icon: "💧", zh: "我想喝水", en: "I want some water.", speak: "I want some water.", speakLang: "en-US", tip: "口渴的时候说" },
    { icon: "❤️", zh: "我爱你", en: "I love you!", speak: "I love you!", speakLang: "en-US", tip: "对爸爸妈妈说" },
    { icon: "🌙", zh: "晚安", en: "Good night!", speak: "Good night!", speakLang: "en-US", tip: "睡觉前说" },
    { icon: "🚽", zh: "我要上厕所", en: "I need to go potty.", speak: "I need to go potty.", speakLang: "en-US", tip: "有需要时说" }
  ]
};

const CONTENT = {
  /* ---------------- 语文 ---------------- */
  zh: {
    name: "语文",
    icon: "📖",
    color: "#ff8a80",
    ages: {
      3: {
        cards: [
          { icon: "🧍", title: "人", sub: "rén", speak: "人，一个人的人" },
          { icon: "👄", title: "口", sub: "kǒu", speak: "口，嘴巴的口" },
          { icon: "✋", title: "手", sub: "shǒu", speak: "手，小手的手" },
          { icon: "🦶", title: "足", sub: "zú", speak: "足，小脚的足" },
          { icon: "👁️", title: "目", sub: "mù", speak: "目，眼睛的目" },
          { icon: "☀️", title: "日", sub: "rì", speak: "日，太阳的日" },
          { icon: "🌙", title: "月", sub: "yuè", speak: "月，月亮的月" },
          { icon: "💧", title: "水", sub: "shuǐ", speak: "水，喝水的水" },
          { icon: "🔥", title: "火", sub: "huǒ", speak: "火，小火苗的火" },
          { icon: "⛰️", title: "山", sub: "shān", speak: "山，大山的山" },
          { icon: "🪨", title: "石", sub: "shí", speak: "石，石头的石" },
          { icon: "🌾", title: "田", sub: "tián", speak: "田，稻田的田" }
        ],
        animate: { type: "words", title: "认识汉字" },
        quiz: [
          { ask: "找一找：太阳", speak: "找一找，太阳在哪里？", options: [{ icon: "☀️", label: "日" }, { icon: "🌙", label: "月" }, { icon: "💧", label: "水" }, { icon: "🔥", label: "火" }], answer: 0 },
          { ask: "找一找：水", speak: "找一找，水在哪里？", options: [{ icon: "⛰️", label: "山" }, { icon: "💧", label: "水" }, { icon: "🧍", label: "人" }, { icon: "✋", label: "手" }], answer: 1 },
          { ask: "找一找：小手", speak: "找一找，小手在哪里？", options: [{ icon: "🦶", label: "足" }, { icon: "👄", label: "口" }, { icon: "✋", label: "手" }, { icon: "👁️", label: "目" }], answer: 2 },
          { ask: "找一找：月亮", speak: "找一找，月亮在哪里？", options: [{ icon: "☀️", label: "日" }, { icon: "🔥", label: "火" }, { icon: "⛰️", label: "山" }, { icon: "🌙", label: "月" }], answer: 3 },
          { ask: "找一找：大山", speak: "找一找，大山在哪里？", options: [{ icon: "⛰️", label: "山" }, { icon: "🌾", label: "田" }, { icon: "🪨", label: "石" }, { icon: "💧", label: "水" }], answer: 0 }
        ]
      },
      4: {
        cards: [
          { icon: "🌳", title: "木", sub: "mù", speak: "木，树木的木" },
          { icon: "🌲", title: "林", sub: "lín", speak: "林，树林的林" },
          { icon: "🎋", title: "竹", sub: "zhú", speak: "竹，竹子的竹" },
          { icon: "🍚", title: "米", sub: "mǐ", speak: "米，大米的米" },
          { icon: "🐘", title: "大", sub: "dà", speak: "大，大象真大" },
          { icon: "🐜", title: "小", sub: "xiǎo", speak: "小，蚂蚁真小" },
          { icon: "⬆️", title: "上", sub: "shàng", speak: "上，上面的上" },
          { icon: "⬇️", title: "下", sub: "xià", speak: "下，下面的下" },
          { icon: "👈", title: "左", sub: "zuǒ", speak: "左，左边的左" },
          { icon: "👉", title: "右", sub: "yòu", speak: "右，右边的右" },
          { icon: "🌧️", title: "雨", sub: "yǔ", speak: "雨，下雨的雨" },
          { icon: "❄️", title: "雪", sub: "xuě", speak: "雪，雪花的雪" }
        ],
        animate: { type: "words", title: "认识汉字" },
        quiz: [
          { ask: "找一找：大", speak: "哪个是“大”字？", options: [{ icon: "🐘", label: "大" }, { icon: "🐜", label: "小" }, { icon: "⬆️", label: "上" }, { icon: "⬇️", label: "下" }], answer: 0 },
          { ask: "找一找：树木", speak: "找一找，树木的“木”在哪里？", options: [{ icon: "🎋", label: "竹" }, { icon: "🌳", label: "木" }, { icon: "🍚", label: "米" }, { icon: "🌧️", label: "雨" }], answer: 1 },
          { ask: "找一找：下雨", speak: "找一找，下雨的“雨”在哪里？", options: [{ icon: "❄️", label: "雪" }, { icon: "⬆️", label: "上" }, { icon: "🌧️", label: "雨" }, { icon: "👉", label: "右" }], answer: 2 },
          { ask: "找一找：右边", speak: "找一找，右边的“右”在哪里？", options: [{ icon: "👈", label: "左" }, { icon: "⬇️", label: "下" }, { icon: "🐜", label: "小" }, { icon: "👉", label: "右" }], answer: 3 },
          { ask: "找一找：雪花", speak: "找一找，雪花的“雪”在哪里？", options: [{ icon: "❄️", label: "雪" }, { icon: "🌧️", label: "雨" }, { icon: "🌲", label: "林" }, { icon: "🍚", label: "米" }], answer: 0 }
        ]
      },
      5: {
        cards: [
          { icon: "🌞", title: "太阳", sub: "tài yáng", speak: "太阳，红红的太阳" },
          { icon: "🌛", title: "月亮", sub: "yuè liang", speak: "月亮，弯弯的月亮" },
          { icon: "⭐", title: "星星", sub: "xīng xing", speak: "星星，闪闪的星星" },
          { icon: "🍎", title: "苹果", sub: "píng guǒ", speak: "苹果，甜甜的苹果" },
          { icon: "🐱", title: "小猫", sub: "xiǎo māo", speak: "小猫，喵喵叫" },
          { icon: "🐶", title: "小狗", sub: "xiǎo gǒu", speak: "小狗，汪汪叫" },
          { icon: "🌸", title: "花朵", sub: "huā duǒ", speak: "花朵，香香的花朵" },
          { icon: "☁️", title: "白云", sub: "bái yún", speak: "白云，软软的白云" },
          { icon: "🐟", title: "小鱼", sub: "xiǎo yú", speak: "小鱼，游啊游" },
          { icon: "🐦", title: "小鸟", sub: "xiǎo niǎo", speak: "小鸟，飞呀飞" },
          { icon: "🌈", title: "彩虹", sub: "cǎi hóng", speak: "彩虹，七种颜色" },
          { icon: "🚗", title: "汽车", sub: "qì chē", speak: "汽车，嘀嘀嘀" }
        ],
        animate: { type: "words", title: "认识词语" },
        quiz: [
          { ask: "找一找：太阳", speak: "找一找，“太阳”在哪里？", options: [{ icon: "🌞", label: "太阳" }, { icon: "🌛", label: "月亮" }, { icon: "⭐", label: "星星" }, { icon: "☁️", label: "白云" }], answer: 0 },
          { ask: "找一找：彩虹", speak: "找一找，“彩虹”在哪里？", options: [{ icon: "🚗", label: "汽车" }, { icon: "🌈", label: "彩虹" }, { icon: "🌸", label: "花朵" }, { icon: "🐟", label: "小鱼" }], answer: 1 },
          { ask: "找一找：小猫", speak: "找一找，“小猫”在哪里？", options: [{ icon: "🐶", label: "小狗" }, { icon: "🐦", label: "小鸟" }, { icon: "🐱", label: "小猫" }, { icon: "🐟", label: "小鱼" }], answer: 2 },
          { ask: "找一找：苹果", speak: "找一找，“苹果”在哪里？", options: [{ icon: "🌸", label: "花朵" }, { icon: "☁️", label: "白云" }, { icon: "🚗", label: "汽车" }, { icon: "🍎", label: "苹果" }], answer: 3 },
          { ask: "找一找：小鸟", speak: "找一找，“小鸟”在哪里？", options: [{ icon: "🐦", label: "小鸟" }, { icon: "🐱", label: "小猫" }, { icon: "🐶", label: "小狗" }, { icon: "⭐", label: "星星" }], answer: 0 }
        ]
      },
      6: {
        cards: [
          { icon: "🅱️", title: "b", sub: "声母 玻", speak: "b，广播的播" },
          { icon: "🅿️", title: "p", sub: "声母 坡", speak: "p，山坡的坡" },
          { icon: "Ⓜ️", title: "m", sub: "声母 摸", speak: "m，摸一摸的摸" },
          { icon: "🎏", title: "f", sub: "声母 佛", speak: "f，大佛" },
          { icon: "🍎", title: "a", sub: "韵母 啊", speak: "a，啊" },
          { icon: "🐓", title: "o", sub: "韵母 喔", speak: "o，公鸡打鸣喔喔喔" },
          { icon: "🦢", title: "e", sub: "韵母 鹅", speak: "e，白鹅的鹅" },
          { icon: "👕", title: "i", sub: "韵母 衣", speak: "i，衣服的衣" },
          { icon: "🏠", title: "u", sub: "韵母 乌", speak: "u，乌鸦的乌" },
          { icon: "🐟", title: "ü", sub: "韵母 迂", speak: "ü，小鱼的鱼" },
          { icon: "👨‍👩‍👧", title: "我爱我家", sub: "wǒ ài wǒ jiā", speak: "我爱我家" },
          { icon: "🏫", title: "我去上学", sub: "wǒ qù shàng xué", speak: "我去上学" }
        ],
        animate: { type: "words", title: "拼音小课堂" },
        quiz: [
          { ask: "找一找：声母 b", speak: "找一找，声母 b 在哪里？", options: [{ icon: "🅱️", label: "b" }, { icon: "🅿️", label: "p" }, { icon: "Ⓜ️", label: "m" }, { icon: "🎏", label: "f" }], answer: 0 },
          { ask: "找一找：韵母 o", speak: "找一找，韵母 o 在哪里？", options: [{ icon: "🍎", label: "a" }, { icon: "🐓", label: "o" }, { icon: "🦢", label: "e" }, { icon: "👕", label: "i" }], answer: 1 },
          { ask: "找一找：韵母 ü", speak: "找一找，韵母 ü 在哪里？", options: [{ icon: "🏠", label: "u" }, { icon: "👕", label: "i" }, { icon: "🐟", label: "ü" }, { icon: "🦢", label: "e" }], answer: 2 },
          { ask: "找一找：声母 m", speak: "找一找，声母 m 在哪里？", options: [{ icon: "🅱️", label: "b" }, { icon: "🅿️", label: "p" }, { icon: "🎏", label: "f" }, { icon: "Ⓜ️", label: "m" }], answer: 3 },
          { ask: "找一找：韵母 e", speak: "找一找，韵母 e 在哪里？", options: [{ icon: "🦢", label: "e" }, { icon: "🍎", label: "a" }, { icon: "🐓", label: "o" }, { icon: "🏠", label: "u" }], answer: 0 }
        ]
      }
    }
  },

  /* ---------------- 数学 ---------------- */
  math: {
    name: "数学",
    icon: "🔢",
    color: "#82b1ff",
    ages: {
      3: {
        cards: [
          { icon: "1️⃣", title: "1", sub: "一", speak: "1，一个苹果", extra: "🍎" },
          { icon: "2️⃣", title: "2", sub: "二", speak: "2，两只小鸟", extra: "🐦🐦" },
          { icon: "3️⃣", title: "3", sub: "三", speak: "3，三朵花", extra: "🌸🌸🌸" },
          { icon: "4️⃣", title: "4", sub: "四", speak: "4，四辆小汽车", extra: "🚗🚗🚗🚗" },
          { icon: "5️⃣", title: "5", sub: "五", speak: "5，五颗星星", extra: "⭐⭐⭐⭐⭐" },
          { icon: "🔴", title: "红色", sub: "hóng sè", speak: "红色，红苹果" },
          { icon: "🔵", title: "蓝色", sub: "lán sè", speak: "蓝色，蓝蓝的天" },
          { icon: "🟡", title: "黄色", sub: "huáng sè", speak: "黄色，黄黄的香蕉" },
          { icon: "⭕", title: "圆形", sub: "yuán xíng", speak: "圆形，圆圆的" },
          { icon: "🔺", title: "三角形", sub: "sān jiǎo xíng", speak: "三角形，三个角" }
        ],
        animate: { type: "count", icon: "🍎", title: "数苹果", max: 5 },
        quiz: [
          { ask: "数一数：几个苹果？", speak: "数一数，有几个苹果？", options: [{ icon: "1️⃣", label: "1" }, { icon: "2️⃣", label: "2" }, { icon: "3️⃣", label: "3" }], answer: 2, scene: "🍎🍎🍎" },
          { ask: "找一找：数字 2", speak: "找一找，数字 2 在哪里？", options: [{ icon: "1️⃣", label: "1" }, { icon: "2️⃣", label: "2" }, { icon: "3️⃣", label: "3" }], answer: 1 },
          { ask: "找一找：圆形", speak: "找一找，圆形在哪里？", options: [{ icon: "⭕", label: "圆形" }, { icon: "🔺", label: "三角形" }, { icon: "⬛", label: "正方形" }], answer: 0 },
          { ask: "数一数：几只小鸟？", speak: "数一数，有几只小鸟？", options: [{ icon: "2️⃣", label: "2" }, { icon: "4️⃣", label: "4" }, { icon: "5️⃣", label: "5" }], answer: 0, scene: "🐦🐦" },
          { ask: "找一找：红色", speak: "找一找，红色在哪里？", options: [{ icon: "🔵", label: "蓝色" }, { icon: "🟡", label: "黄色" }, { icon: "🔴", label: "红色" }], answer: 2 }
        ]
      },
      4: {
        cards: [
          { icon: "6️⃣", title: "6", sub: "六", speak: "6，六条小鱼", extra: "🐟🐟🐟🐟🐟🐟" },
          { icon: "7️⃣", title: "7", sub: "七", speak: "7，七只小鸭子", extra: "🦆🦆🦆🦆🦆🦆🦆" },
          { icon: "8️⃣", title: "8", sub: "八", speak: "8，八颗葡萄", extra: "🍇🍇🍇🍇🍇🍇🍇🍇" },
          { icon: "9️⃣", title: "9", sub: "九", speak: "9，九个气球", extra: "🎈🎈🎈🎈🎈🎈🎈🎈🎈" },
          { icon: "🔟", title: "10", sub: "十", speak: "10，十根小手指", extra: "🙌" },
          { icon: "⬛", title: "正方形", sub: "zhèng fāng xíng", speak: "正方形，四条边一样长" },
          { icon: "🟩", title: "绿色", sub: "lǜ sè", speak: "绿色，绿绿的小草" },
          { icon: "🟣", title: "紫色", sub: "zǐ sè", speak: "紫色，紫葡萄" },
          { icon: "🐘", title: "大", sub: "比一比", speak: "大象大，蚂蚁小" },
          { icon: "🦒", title: "高", sub: "比一比", speak: "长颈鹿高，小兔子矮" }
        ],
        animate: { type: "count", icon: "🦆", title: "数小鸭", max: 8 },
        quiz: [
          { ask: "数一数：几只小鸭？", speak: "数一数，有几只小鸭？", options: [{ icon: "4️⃣", label: "4" }, { icon: "5️⃣", label: "5" }, { icon: "6️⃣", label: "6" }, { icon: "7️⃣", label: "7" }], answer: 1, scene: "🦆🦆🦆🦆🦆" },
          { ask: "找一找：数字 8", speak: "找一找，数字 8 在哪里？", options: [{ icon: "6️⃣", label: "6" }, { icon: "9️⃣", label: "9" }, { icon: "8️⃣", label: "8" }, { icon: "🔟", label: "10" }], answer: 2 },
          { ask: "找一找：正方形", speak: "找一找，正方形在哪里？", options: [{ icon: "⭕", label: "圆形" }, { icon: "🔺", label: "三角形" }, { icon: "🌙", label: "月牙" }, { icon: "⬛", label: "正方形" }], answer: 3 },
          { ask: "哪个最大？", speak: "哪个数字最大？", options: [{ icon: "9️⃣", label: "9" }, { icon: "3️⃣", label: "3" }, { icon: "6️⃣", label: "6" }, { icon: "1️⃣", label: "1" }], answer: 0 },
          { ask: "数一数：几颗葡萄？", speak: "数一数，有几颗葡萄？", options: [{ icon: "6️⃣", label: "6" }, { icon: "7️⃣", label: "7" }, { icon: "8️⃣", label: "8" }, { icon: "5️⃣", label: "5" }], answer: 2, scene: "🍇🍇🍇🍇🍇🍇🍇🍇" }
        ]
      },
      5: {
        cards: [
          { icon: "➕", title: "1+1", sub: "= 2", speak: "1加1等于2", extra: "🍎➕🍎" },
          { icon: "➕", title: "2+1", sub: "= 3", speak: "2加1等于3", extra: "🍎🍎➕🍎" },
          { icon: "➕", title: "2+2", sub: "= 4", speak: "2加2等于4", extra: "🍎🍎➕🍎🍎" },
          { icon: "➕", title: "3+1", sub: "= 4", speak: "3加1等于4", extra: "🐟🐟🐟➕🐟" },
          { icon: "➕", title: "3+2", sub: "= 5", speak: "3加2等于5", extra: "⭐⭐⭐➕⭐⭐" },
          { icon: "➖", title: "2-1", sub: "= 1", speak: "2减1等于1", extra: "🍎🍎➖🍎" },
          { icon: "➖", title: "3-1", sub: "= 2", speak: "3减1等于2", extra: "🎈🎈🎈➖🎈" },
          { icon: "➖", title: "4-2", sub: "= 2", speak: "4减2等于2", extra: "🍬🍬🍬🍬➖🍬🍬" },
          { icon: "➖", title: "5-2", sub: "= 3", speak: "5减2等于3", extra: "🌸🌸🌸🌸🌸➖🌸🌸" },
          { icon: "🔢", title: "比大小", sub: "5 > 3", speak: "5比3大" }
        ],
        animate: { type: "count", icon: "🍬", title: "数糖果", max: 10 },
        quiz: [
          { ask: "算一算：1+1=?", speak: "算一算，1加1等于几？", options: [{ icon: "1️⃣", label: "1" }, { icon: "2️⃣", label: "2" }, { icon: "3️⃣", label: "3" }, { icon: "4️⃣", label: "4" }], answer: 1, scene: "🍎➕🍎" },
          { ask: "算一算：2+2=?", speak: "算一算，2加2等于几？", options: [{ icon: "3️⃣", label: "3" }, { icon: "5️⃣", label: "5" }, { icon: "4️⃣", label: "4" }, { icon: "6️⃣", label: "6" }], answer: 2, scene: "🍎🍎➕🍎🍎" },
          { ask: "算一算：3-1=?", speak: "算一算，3减1等于几？", options: [{ icon: "2️⃣", label: "2" }, { icon: "1️⃣", label: "1" }, { icon: "3️⃣", label: "3" }, { icon: "4️⃣", label: "4" }], answer: 0, scene: "🎈🎈🎈➖🎈" },
          { ask: "算一算：5-2=?", speak: "算一算，5减2等于几？", options: [{ icon: "1️⃣", label: "1" }, { icon: "2️⃣", label: "2" }, { icon: "4️⃣", label: "4" }, { icon: "3️⃣", label: "3" }], answer: 3, scene: "🌸🌸🌸🌸🌸➖🌸🌸" },
          { ask: "算一算：3+2=?", speak: "算一算，3加2等于几？", options: [{ icon: "5️⃣", label: "5" }, { icon: "4️⃣", label: "4" }, { icon: "6️⃣", label: "6" }, { icon: "3️⃣", label: "3" }], answer: 0, scene: "⭐⭐⭐➕⭐⭐" }
        ]
      },
      6: {
        cards: [
          { icon: "➕", title: "4+3", sub: "= 7", speak: "4加3等于7", extra: "🍓🍓🍓🍓➕🍓🍓🍓" },
          { icon: "➕", title: "5+4", sub: "= 9", speak: "5加4等于9", extra: "🐤🐤🐤🐤🐤➕🐤🐤🐤🐤" },
          { icon: "➕", title: "6+2", sub: "= 8", speak: "6加2等于8", extra: "🍇🍇🍇🍇🍇🍇➕🍇🍇" },
          { icon: "➕", title: "7+3", sub: "= 10", speak: "7加3等于10", extra: "⭐⭐⭐⭐⭐⭐⭐➕⭐⭐⭐" },
          { icon: "➖", title: "6-3", sub: "= 3", speak: "6减3等于3", extra: "🎈🎈🎈🎈🎈🎈➖🎈🎈🎈" },
          { icon: "➖", title: "8-4", sub: "= 4", speak: "8减4等于4", extra: "🍬🍬🍬🍬🍬🍬🍬🍬➖🍬🍬🍬🍬" },
          { icon: "➖", title: "9-5", sub: "= 4", speak: "9减5等于4" },
          { icon: "➖", title: "10-6", sub: "= 4", speak: "10减6等于4" },
          { icon: "🔢", title: "10以内", sub: "比一比 9 > 6", speak: "9比6大" },
          { icon: "🧮", title: "凑十", sub: "6+4=10", speak: "6和4是好朋友，凑成10" }
        ],
        animate: { type: "count", icon: "🍓", title: "数草莓", max: 10 },
        quiz: [
          { ask: "算一算：4+3=?", speak: "算一算，4加3等于几？", options: [{ icon: "6️⃣", label: "6" }, { icon: "7️⃣", label: "7" }, { icon: "8️⃣", label: "8" }, { icon: "9️⃣", label: "9" }], answer: 1, scene: "🍓🍓🍓🍓➕🍓🍓🍓" },
          { ask: "算一算：8-4=?", speak: "算一算，8减4等于几？", options: [{ icon: "3️⃣", label: "3" }, { icon: "5️⃣", label: "5" }, { icon: "4️⃣", label: "4" }, { icon: "6️⃣", label: "6" }], answer: 2, scene: "🍬🍬🍬🍬🍬🍬🍬🍬➖🍬🍬🍬🍬" },
          { ask: "算一算：7+3=?", speak: "算一算，7加3等于几？", options: [{ icon: "🔟", label: "10" }, { icon: "9️⃣", label: "9" }, { icon: "8️⃣", label: "8" }, { icon: "7️⃣", label: "7" }], answer: 0, scene: "⭐⭐⭐⭐⭐⭐⭐➕⭐⭐⭐" },
          { ask: "算一算：10-6=?", speak: "算一算，10减6等于几？", options: [{ icon: "5️⃣", label: "5" }, { icon: "6️⃣", label: "6" }, { icon: "3️⃣", label: "3" }, { icon: "4️⃣", label: "4" }], answer: 3 },
          { ask: "算一算：6+2=?", speak: "算一算，6加2等于几？", options: [{ icon: "8️⃣", label: "8" }, { icon: "7️⃣", label: "7" }, { icon: "9️⃣", label: "9" }, { icon: "🔟", label: "10" }], answer: 0, scene: "🍇🍇🍇🍇🍇🍇➕🍇🍇" }
        ]
      }
    }
  },

  /* ---------------- 英语 ---------------- */
  en: {
    name: "英语",
    icon: "🔤",
    color: "#a5d6a7",
    ages: {
      3: {
        cards: [
          { icon: "🍎", title: "Apple", sub: "苹果", speak: "Apple! Apple!", speakLang: "en-US" },
          { icon: "🍌", title: "Banana", sub: "香蕉", speak: "Banana! Banana!", speakLang: "en-US" },
          { icon: "🐱", title: "Cat", sub: "小猫", speak: "Cat! Meow!", speakLang: "en-US" },
          { icon: "🐶", title: "Dog", sub: "小狗", speak: "Dog! Woof!", speakLang: "en-US" },
          { icon: "🥛", title: "Milk", sub: "牛奶", speak: "Milk! Yummy milk!", speakLang: "en-US" },
          { icon: "🥚", title: "Egg", sub: "鸡蛋", speak: "Egg! Egg!", speakLang: "en-US" },
          { icon: "🐟", title: "Fish", sub: "小鱼", speak: "Fish! Swim swim!", speakLang: "en-US" },
          { icon: "🐦", title: "Bird", sub: "小鸟", speak: "Bird! Tweet tweet!", speakLang: "en-US" },
          { icon: "☀️", title: "Sun", sub: "太阳", speak: "Sun! Sunny sun!", speakLang: "en-US" },
          { icon: "🌙", title: "Moon", sub: "月亮", speak: "Moon! Moon!", speakLang: "en-US" }
        ],
        animate: { type: "words", title: "学英语单词" },
        quiz: [
          { ask: "找一找：Apple", speak: "Where is the apple?", speakLang: "en-US", options: [{ icon: "🍎", label: "Apple" }, { icon: "🍌", label: "Banana" }, { icon: "🥛", label: "Milk" }, { icon: "🥚", label: "Egg" }], answer: 0 },
          { ask: "找一找：Cat", speak: "Where is the cat?", speakLang: "en-US", options: [{ icon: "🐶", label: "Dog" }, { icon: "🐱", label: "Cat" }, { icon: "🐟", label: "Fish" }, { icon: "🐦", label: "Bird" }], answer: 1 },
          { ask: "找一找：Milk", speak: "Where is the milk?", speakLang: "en-US", options: [{ icon: "🥚", label: "Egg" }, { icon: "🍎", label: "Apple" }, { icon: "🥛", label: "Milk" }, { icon: "🍌", label: "Banana" }], answer: 2 },
          { ask: "找一找：Moon", speak: "Where is the moon?", speakLang: "en-US", options: [{ icon: "☀️", label: "Sun" }, { icon: "⭐", label: "Star" }, { icon: "☁️", label: "Cloud" }, { icon: "🌙", label: "Moon" }], answer: 3 },
          { ask: "找一找：Fish", speak: "Where is the fish?", speakLang: "en-US", options: [{ icon: "🐟", label: "Fish" }, { icon: "🐦", label: "Bird" }, { icon: "🐱", label: "Cat" }, { icon: "🐶", label: "Dog" }], answer: 0 }
        ]
      },
      4: {
        cards: [
          { icon: "🍎", title: "Aa", sub: "A for Apple", speak: "A! A for Apple!", speakLang: "en-US" },
          { icon: "🍌", title: "Bb", sub: "B for Banana", speak: "B! B for Banana!", speakLang: "en-US" },
          { icon: "🐱", title: "Cc", sub: "C for Cat", speak: "C! C for Cat!", speakLang: "en-US" },
          { icon: "🐶", title: "Dd", sub: "D for Dog", speak: "D! D for Dog!", speakLang: "en-US" },
          { icon: "🥚", title: "Ee", sub: "E for Egg", speak: "E! E for Egg!", speakLang: "en-US" },
          { icon: "🐟", title: "Ff", sub: "F for Fish", speak: "F! F for Fish!", speakLang: "en-US" },
          { icon: "🍇", title: "Gg", sub: "G for Grapes", speak: "G! G for Grapes!", speakLang: "en-US" },
          { icon: "🏠", title: "Hh", sub: "H for House", speak: "H! H for House!", speakLang: "en-US" },
          { icon: "🔴", title: "Red", sub: "红色", speak: "Red! Red apple!", speakLang: "en-US" },
          { icon: "🔵", title: "Blue", sub: "蓝色", speak: "Blue! Blue sky!", speakLang: "en-US" },
          { icon: "🟡", title: "Yellow", sub: "黄色", speak: "Yellow! Yellow banana!", speakLang: "en-US" },
          { icon: "🟢", title: "Green", sub: "绿色", speak: "Green! Green grass!", speakLang: "en-US" }
        ],
        animate: { type: "words", title: "认识英文字母" },
        quiz: [
          { ask: "找一找：字母 B", speak: "Find the letter B!", speakLang: "en-US", options: [{ icon: "🍎", label: "Aa" }, { icon: "🍌", label: "Bb" }, { icon: "🐱", label: "Cc" }, { icon: "🐶", label: "Dd" }], answer: 1 },
          { ask: "找一找：Red", speak: "Which one is red?", speakLang: "en-US", options: [{ icon: "🔴", label: "Red" }, { icon: "🔵", label: "Blue" }, { icon: "🟡", label: "Yellow" }, { icon: "🟢", label: "Green" }], answer: 0 },
          { ask: "找一找：字母 F", speak: "Find the letter F!", speakLang: "en-US", options: [{ icon: "🥚", label: "Ee" }, { icon: "🍇", label: "Gg" }, { icon: "🐟", label: "Ff" }, { icon: "🏠", label: "Hh" }], answer: 2 },
          { ask: "找一找：Green", speak: "Which one is green?", speakLang: "en-US", options: [{ icon: "🔵", label: "Blue" }, { icon: "🟡", label: "Yellow" }, { icon: "🔴", label: "Red" }, { icon: "🟢", label: "Green" }], answer: 3 },
          { ask: "找一找：字母 D", speak: "Find the letter D!", speakLang: "en-US", options: [{ icon: "🐶", label: "Dd" }, { icon: "🍌", label: "Bb" }, { icon: "🐱", label: "Cc" }, { icon: "🍎", label: "Aa" }], answer: 0 }
        ]
      },
      5: {
        cards: [
          { icon: "🦁", title: "Lion", sub: "狮子", speak: "Lion! Roar!", speakLang: "en-US" },
          { icon: "🐵", title: "Monkey", sub: "猴子", speak: "Monkey! Ooh ooh!", speakLang: "en-US" },
          { icon: "🐘", title: "Elephant", sub: "大象", speak: "Elephant! Big elephant!", speakLang: "en-US" },
          { icon: "🐰", title: "Rabbit", sub: "兔子", speak: "Rabbit! Hop hop!", speakLang: "en-US" },
          { icon: "🐯", title: "Tiger", sub: "老虎", speak: "Tiger! Roar!", speakLang: "en-US" },
          { icon: "🐼", title: "Panda", sub: "熊猫", speak: "Panda! Cute panda!", speakLang: "en-US" },
          { icon: "1️⃣", title: "One", sub: "一", speak: "One!", speakLang: "en-US" },
          { icon: "2️⃣", title: "Two", sub: "二", speak: "Two!", speakLang: "en-US" },
          { icon: "3️⃣", title: "Three", sub: "三", speak: "Three!", speakLang: "en-US" },
          { icon: "4️⃣", title: "Four", sub: "四", speak: "Four!", speakLang: "en-US" },
          { icon: "5️⃣", title: "Five", sub: "五", speak: "Five!", speakLang: "en-US" },
          { icon: "🔟", title: "Ten", sub: "十", speak: "Ten!", speakLang: "en-US" }
        ],
        animate: { type: "words", title: "认识动物" },
        quiz: [
          { ask: "找一找：Monkey", speak: "Where is the monkey?", speakLang: "en-US", options: [{ icon: "🦁", label: "Lion" }, { icon: "🐵", label: "Monkey" }, { icon: "🐯", label: "Tiger" }, { icon: "🐼", label: "Panda" }], answer: 1 },
          { ask: "找一找：Elephant", speak: "Where is the elephant?", speakLang: "en-US", options: [{ icon: "🐘", label: "Elephant" }, { icon: "🐰", label: "Rabbit" }, { icon: "🦁", label: "Lion" }, { icon: "🐵", label: "Monkey" }], answer: 0 },
          { ask: "找一找：Three", speak: "Find the number three!", speakLang: "en-US", options: [{ icon: "1️⃣", label: "One" }, { icon: "2️⃣", label: "Two" }, { icon: "3️⃣", label: "Three" }, { icon: "4️⃣", label: "Four" }], answer: 2 },
          { ask: "找一找：Panda", speak: "Where is the panda?", speakLang: "en-US", options: [{ icon: "🐯", label: "Tiger" }, { icon: "🦁", label: "Lion" }, { icon: "🐘", label: "Elephant" }, { icon: "🐼", label: "Panda" }], answer: 3 },
          { ask: "找一找：Five", speak: "Find the number five!", speakLang: "en-US", options: [{ icon: "5️⃣", label: "Five" }, { icon: "3️⃣", label: "Three" }, { icon: "🔟", label: "Ten" }, { icon: "4️⃣", label: "Four" }], answer: 0 }
        ]
      },
      6: {
        cards: [
          { icon: "👋", title: "Hello!", sub: "你好", speak: "Hello! How are you?", speakLang: "en-US" },
          { icon: "😊", title: "I'm fine.", sub: "我很好", speak: "I'm fine, thank you!", speakLang: "en-US" },
          { icon: "🍎", title: "I like apples.", sub: "我喜欢苹果", speak: "I like apples!", speakLang: "en-US" },
          { icon: "🐱", title: "It's a cat.", sub: "它是一只猫", speak: "It's a cat!", speakLang: "en-US" },
          { icon: "🔢", title: "How many?", sub: "有几个？", speak: "How many? One, two, three!", speakLang: "en-US" },
          { icon: "🎨", title: "What color?", sub: "什么颜色？", speak: "What color is it? It's red!", speakLang: "en-US" },
          { icon: "👨‍👩‍👧", title: "My family", sub: "我的家人", speak: "This is my family!", speakLang: "en-US" },
          { icon: "🏫", title: "Go to school", sub: "去上学", speak: "Let's go to school!", speakLang: "en-US" },
          { icon: "🧸", title: "My toy", sub: "我的玩具", speak: "This is my toy!", speakLang: "en-US" },
          { icon: "🎂", title: "Happy birthday!", sub: "生日快乐", speak: "Happy birthday to you!", speakLang: "en-US" }
        ],
        animate: { type: "words", title: "英语小句子" },
        quiz: [
          { ask: "“你好”怎么说？", speak: "How do you say hello?", speakLang: "en-US", options: [{ icon: "👋", label: "Hello!" }, { icon: "🌙", label: "Good night!" }, { icon: "🙏", label: "Thank you!" }, { icon: "👋", label: "Bye!" }], answer: 0 },
          { ask: "“我喜欢苹果”怎么说？", speak: "Which one means 'I like apples'?", speakLang: "en-US", options: [{ icon: "🐱", label: "It's a cat." }, { icon: "🍎", label: "I like apples." }, { icon: "🏫", label: "Go to school." }, { icon: "🎂", label: "Happy birthday!" }], answer: 1 },
          { ask: "问“有几个？”怎么说？", speak: "How do you ask 'how many'?", speakLang: "en-US", options: [{ icon: "🎨", label: "What color?" }, { icon: "👋", label: "Hello!" }, { icon: "🔢", label: "How many?" }, { icon: "😊", label: "I'm fine." }], answer: 2 },
          { ask: "“生日快乐”怎么说？", speak: "How do you say happy birthday?", speakLang: "en-US", options: [{ icon: "🧸", label: "My toy" }, { icon: "👨‍👩‍👧", label: "My family" }, { icon: "😊", label: "I'm fine." }, { icon: "🎂", label: "Happy birthday!" }], answer: 3 },
          { ask: "“它是一只猫”怎么说？", speak: "Which one means 'It is a cat'?", speakLang: "en-US", options: [{ icon: "🐱", label: "It's a cat." }, { icon: "🍎", label: "I like apples." }, { icon: "🔢", label: "How many?" }, { icon: "👋", label: "Hello!" }], answer: 0 }
        ]
      }
    }
  }
};

/* 鼓励语 */
const PRAISE = [
  "太棒了！", "你真聪明！", "答对啦，给你一颗星！", "好厉害呀！", "继续加油，你最棒！", "哇，太了不起了！"
];
const ENCOURAGE = [
  "没关系，再试一次！", "差一点点，再来一次吧！", "别灰心，你可以的！", "想一想，再试试看！"
];
