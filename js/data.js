const SUBJECTS = {
  zh: { name: "语文", icon: "文", description: "看图认字 · 听听读音", levels: ["简单 · 基础汉字", "进阶 · 常见词语", "挑战 · 生活短语"] },
  math: { name: "数学", icon: "+ −", description: "加一加 · 减一减", levels: ["简单 · 10以内", "进阶 · 20以内", "挑战 · 30以内"] },
  en: { name: "英语", icon: "ABC", description: "生活图片 · 单词读音", levels: ["简单 · 身边物品", "进阶 · 家与自然", "挑战 · 日常生活"] }
};

const WORDS = {
  zh: [
    [
      ["日", "rì", "sun"], ["月", "yuè", "moon"], ["水", "shuǐ", "water"], ["火", "huǒ", "fire"],
      ["山", "shān", "mountain"], ["人", "rén", "person"], ["口", "kǒu", "mouth"],
      ["手", "shǒu", "hand"], ["目", "mù", "eye"], ["木", "mù", "tree"]
    ],
    [
      ["苹果", "píng guǒ", "apple"], ["香蕉", "xiāng jiāo", "banana"], ["小猫", "xiǎo māo", "cat"],
      ["小狗", "xiǎo gǒu", "dog"], ["小鱼", "xiǎo yú", "fish"], ["小鸟", "xiǎo niǎo", "bird"],
      ["花朵", "huā duǒ", "flower"], ["星星", "xīng xing", "star"], ["汽车", "qì chē", "car"],
      ["书本", "shū běn", "book"]
    ],
    [
      ["喝水", "hē shuǐ", "water"], ["吃饭", "chī fàn", "bread"], ["洗手", "xǐ shǒu", "hand"],
      ["穿衣", "chuān yī", "shirt"], ["穿鞋", "chuān xié", "shoes"], ["开门", "kāi mén", "door"],
      ["刷牙", "shuā yá", "toothbrush"], ["睡觉", "shuì jiào", "bed"], ["下雨", "xià yǔ", "rain"],
      ["早上好", "zǎo shang hǎo", "sun"]
    ]
  ],
  en: [
    [
      ["apple", "苹果", "apple"], ["banana", "香蕉", "banana"], ["milk", "牛奶", "milk"],
      ["egg", "鸡蛋", "egg"], ["water", "水", "water"], ["bread", "面包", "bread"],
      ["cat", "猫", "cat"], ["dog", "狗", "dog"], ["fish", "鱼", "fish"], ["bird", "鸟", "bird"]
    ],
    [
      ["ball", "球", "ball"], ["book", "书", "book"], ["car", "汽车", "car"], ["cup", "杯子", "cup"],
      ["bed", "床", "bed"], ["sun", "太阳", "sun"], ["moon", "月亮", "moon"], ["star", "星星", "star"],
      ["flower", "花", "flower"], ["tree", "树", "tree"]
    ],
    [
      ["shoes", "鞋", "shoes"], ["shirt", "上衣", "shirt"], ["hat", "帽子", "hat"],
      ["chair", "椅子", "chair"], ["table", "桌子", "table"], ["door", "门", "door"],
      ["clock", "钟", "clock"], ["toothbrush", "牙刷", "toothbrush"], ["rain", "雨", "rain"],
      ["umbrella", "雨伞", "umbrella"]
    ]
  ]
};

function shuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function mathPool(limit) {
  const pool = [];
  for (let a = 0; a <= limit; a++) {
    for (let b = 1; b <= limit; b++) {
      if (a + b <= limit) pool.push({ a, b, op: "+", answer: a + b });
      if (a >= b) pool.push({ a, b, op: "−", answer: a - b });
    }
  }
  return pool;
}

function generateLesson(subject, level, count) {
  if (subject === "math") return shuffle(mathPool(level * 10)).slice(0, count);
  const pool = WORDS[subject][level - 1].map(([word, hint, picture], index) => ({
    word, hint, picture, audio: `${subject}-${level}-${index}`
  }));
  const result = [];
  while (result.length < count) {
    const round = shuffle(pool);
    if (result.length && round[0].word === result[result.length - 1].word) {
      [round[0], round[1]] = [round[1], round[0]];
    }
    result.push(...round.slice(0, count - result.length));
  }
  return result;
}

function answerChoices(question, limit) {
  const other = shuffle(Array.from({ length: limit + 1 }, (_, i) => i).filter(i => i !== question.answer));
  return shuffle([question.answer, ...other.slice(0, 3)]);
}

function audioTracks() {
  const tracks = [];
  for (const subject of ["zh", "en"]) WORDS[subject].forEach((level, l) => {
    level.forEach(([text], i) => tracks.push({ id: `${subject}-${l + 1}-${i}`, text, lang: subject === "zh" ? "zh-CN" : "en" }));
  });
  for (let n = 0; n <= 30; n++) tracks.push({ id: `n-${n}`, text: String(n), lang: "zh-CN" });
  const guides = {
    hello: "你好！我是你的学习小伙伴。声音准备好啦！",
    plus: "加", minus: "减", question: "等于几呢？", equals: "等于",
    first: "先放好", stars: "颗星星。", bring: "再拿来", take: "拿走",
    together: "放在一起，一颗一颗数。", left: "看看还剩下多少颗？",
    total: "一共有", remains: "还剩", praise: "答对啦！太棒了！",
    retry: "没关系。我们数一数，再试一次。", done: "学完啦！休息一下，抱抱小伙伴吧。"
  };
  Object.entries(guides).forEach(([id, text]) => tracks.push({ id, text, lang: "zh-CN" }));
  return tracks;
}
