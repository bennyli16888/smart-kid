const SUBJECTS = {
  zh: { name: "语文", icon: "文", description: "看图认字 · 听听读音", levels: ["简单 · 基础汉字", "进阶 · 常见词语", "挑战 · 生活短语"] },
  math: { name: "数学", icon: "+ −", description: "加一加 · 减一减", levels: ["10以内", "20以内", "自定义"] },
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
      ["喝水", "hē shuǐ", "water"], ["吃饭", "chī fàn", "rice"], ["洗手", "xǐ shǒu", "hand"],
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

WORDS.zh[0].push(
  ["天", "tiān", "sun"], ["雨", "yǔ", "rain"], ["花", "huā", "flower"], ["鸟", "niǎo", "bird"],
  ["鱼", "yú", "fish"], ["猫", "māo", "cat"], ["狗", "gǒu", "dog"], ["车", "chē", "car"],
  ["书", "shū", "book"], ["门", "mén", "door"], ["衣", "yī", "shirt"], ["床", "chuáng", "bed"],
  ["杯", "bēi", "cup"], ["球", "qiú", "ball"], ["羊", "yáng", "sheep"], ["牛", "niú", "cow"],
  ["马", "mǎ", "horse"], ["兔", "tù", "rabbit"], ["米", "mǐ", "rice"], ["伞", "sǎn", "umbrella"]
);
WORDS.zh[1].push(
  ["牛奶", "niú nǎi", "milk"], ["鸡蛋", "jī dàn", "egg"], ["面包", "miàn bāo", "bread"],
  ["皮球", "pí qiú", "ball"], ["杯子", "bēi zi", "cup"], ["月亮", "yuè liang", "moon"],
  ["太阳", "tài yáng", "sun"], ["大树", "dà shù", "tree"], ["雨伞", "yǔ sǎn", "umbrella"],
  ["帽子", "mào zi", "hat"], ["椅子", "yǐ zi", "chair"], ["桌子", "zhuō zi", "table"],
  ["时钟", "shí zhōng", "clock"], ["牙刷", "yá shuā", "toothbrush"], ["小羊", "xiǎo yáng", "sheep"],
  ["小兔", "xiǎo tù", "rabbit"], ["西瓜", "xī guā", "watermelon"], ["草莓", "cǎo méi", "strawberry"],
  ["橙子", "chéng zi", "orange"], ["葡萄", "pú tao", "grapes"]
);
WORDS.zh[2].push(
  ["看书", "kàn shū", "book"], ["踢球", "tī qiú", "ball"], ["赏花", "shǎng huā", "flower"],
  ["看月亮", "kàn yuè liang", "moon"], ["数星星", "shǔ xīng xing", "star"],
  ["戴帽子", "dài mào zi", "hat"], ["撑雨伞", "chēng yǔ sǎn", "umbrella"],
  ["喝牛奶", "hē niú nǎi", "milk"], ["吃苹果", "chī píng guǒ", "apple"],
  ["剥香蕉", "bāo xiāng jiāo", "banana"], ["看小鸟", "kàn xiǎo niǎo", "bird"],
  ["喂小鱼", "wèi xiǎo yú", "fish"], ["坐椅子", "zuò yǐ zi", "chair"],
  ["擦桌子", "cā zhuō zi", "table"], ["关门", "guān mén", "door"],
  ["吃面包", "chī miàn bāo", "bread"], ["吃鸡蛋", "chī jī dàn", "egg"],
  ["浇花", "jiāo huā", "flower"], ["看时钟", "kàn shí zhōng", "clock"], ["抱小猫", "bào xiǎo māo", "cat"]
);
WORDS.en[0].push(
  ["sun", "太阳", "sun"], ["moon", "月亮", "moon"], ["star", "星星", "star"],
  ["tree", "树", "tree"], ["flower", "花", "flower"], ["ball", "球", "ball"],
  ["book", "书", "book"], ["car", "汽车", "car"], ["cup", "杯子", "cup"],
  ["bed", "床", "bed"], ["hat", "帽子", "hat"], ["shoes", "鞋", "shoes"],
  ["shirt", "上衣", "shirt"], ["rabbit", "兔子", "rabbit"], ["sheep", "羊", "sheep"],
  ["cow", "牛", "cow"], ["horse", "马", "horse"], ["orange", "橙子", "orange"],
  ["grapes", "葡萄", "grapes"], ["rice", "米饭", "rice"]
);
WORDS.en[1].push(
  ["mountain", "山", "mountain"], ["rain", "雨", "rain"], ["umbrella", "雨伞", "umbrella"],
  ["door", "门", "door"], ["chair", "椅子", "chair"], ["table", "桌子", "table"],
  ["clock", "钟", "clock"], ["toothbrush", "牙刷", "toothbrush"],
  ["watermelon", "西瓜", "watermelon"], ["strawberry", "草莓", "strawberry"],
  ["pear", "梨", "pear"], ["peach", "桃子", "peach"], ["cherry", "樱桃", "cherry"],
  ["hand", "手", "hand"], ["eye", "眼睛", "eye"], ["mouth", "嘴巴", "mouth"],
  ["fire", "火", "fire"], ["candy", "糖果", "candy"], ["rabbit", "兔子", "rabbit"],
  ["sheep", "羊", "sheep"]
);
WORDS.en[2].push(
  ["drink water", "喝水", "water"], ["wash hands", "洗手", "hand"],
  ["read a book", "看书", "book"], ["eat an apple", "吃苹果", "apple"],
  ["play ball", "玩球", "ball"], ["go to bed", "上床睡觉", "bed"],
  ["open the door", "开门", "door"], ["sit down", "坐下", "chair"],
  ["brush teeth", "刷牙", "toothbrush"], ["good morning", "早上好", "sun"],
  ["good night", "晚安", "moon"], ["put on a hat", "戴帽子", "hat"],
  ["a little bird", "一只小鸟", "bird"], ["a big tree", "一棵大树", "tree"],
  ["a red flower", "一朵红花", "flower"], ["a yellow banana", "一根黄香蕉", "banana"],
  ["a small fish", "一条小鱼", "fish"], ["a happy cat", "一只开心的小猫", "cat"],
  ["count the stars", "数星星", "star"], ["drink milk", "喝牛奶", "milk"]
);
const COUNTING_OBJECTS = [
  { id: "candy", name: "五彩糖果", emoji: "🍬", unit: "颗" },
  { id: "banana", name: "香蕉", emoji: "🍌", unit: "根" },
  { id: "apple", name: "苹果", emoji: "🍎", unit: "个" },
  { id: "orange", name: "橙子", emoji: "🍊", unit: "个" },
  { id: "strawberry", name: "草莓", emoji: "🍓", unit: "颗" },
  { id: "grapes", name: "葡萄", emoji: "🍇", unit: "串" },
  { id: "pear", name: "梨", emoji: "🍐", unit: "个" },
  { id: "peach", name: "桃子", emoji: "🍑", unit: "个" },
  { id: "watermelon", name: "西瓜", emoji: "🍉", unit: "块" }
];

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

function generateLesson(subject, level, count, options = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("学习数量请输入 1 到 100 的整数。");
  if (subject === "math") {
    const limit = options.limit ?? level * 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("数字范围请输入 1 到 100 的整数。");
    const pool = mathPool(limit);
    if (count > pool.length) throw new Error(`这个范围只有 ${pool.length} 道不同题目，请减少题量或扩大范围。`);
    return shuffle(pool).slice(0, count);
  }
  const pool = WORDS[subject][level - 1].map(([word, hint, picture], index) => ({
    word, hint, picture, audio: `${subject}-${level}-${index}`
  }));
  const ratio = options.repeat ? options.ratio ?? .1 : 0;
  if (options.repeat && ![.1, .2, .3].includes(ratio)) throw new Error("请选择 10%、20% 或 30% 的重复比例。");
  const repeats = Math.round(count * ratio);
  const unique = count - repeats;
  if (unique > pool.length) throw new Error(`当前材料有 ${pool.length} 个不同字词，请减少数量或勾选重复。`);
  const selected = shuffle(pool).slice(0, unique);
  return shuffle([...selected, ...Array.from({ length: repeats }, (_, i) => selected[i % selected.length])]);
}

function answerChoices(question, limit) {
  const other = shuffle(Array.from({ length: limit + 1 }, (_, i) => i).filter(i => i !== question.answer));
  return shuffle([question.answer, ...other.slice(0, 3)]);
}

function audioTracks() {
  const tracks = [];
  // Short examples give the speech model enough context for easily confused words.
  const examples = {
    "口": "口，开口的口。", "鱼": "鱼，小鱼的鱼。", "米": "米，大米的米。",
    sun: "This is the sun.", car: "This is a car.", bed: "This is a bed.", tree: "This is a tree.",
    door: "This is a door.", pear: "This is a pear.", bread: "This is bread.",
    shirt: "This is a shirt.", mouth: "This is my mouth."
  };
  for (const subject of ["zh", "en"]) WORDS[subject].forEach((level, l) => {
    level.forEach(([word], i) => tracks.push({
      id: `${subject}-${l + 1}-${i}`, text: examples[word] || word, lang: subject === "zh" ? "zh-CN" : "en"
    }));
  });
  for (let n = 0; n <= 100; n++) tracks.push({ id: `n-${n}`, text: String(n), lang: "zh-CN" });
  COUNTING_OBJECTS.forEach(item => tracks.push({ id: `object-${item.id}`, text: `${item.unit}${item.name}。`, lang: "zh-CN" }));
  const guides = {
    hello: "你好！我是你的学习小伙伴。声音准备好啦！",
    plus: "加", minus: "减去", question: "等于几呢？", equals: "等于",
    first: "先放好", bring: "再拿来", take: "拿走",
    together: "放在一起，一个一个数。", left: "看看还剩下多少？",
    total: "一共有", remains: "还剩", praise: "答对啦！太棒了！",
    retry: "没关系。我们数一数，再试一次。", done: "学完啦！休息一下，抱抱小伙伴吧。"
  };
  Object.entries(guides).forEach(([id, text]) => tracks.push({ id, text, lang: "zh-CN" }));
  return tracks;
}
