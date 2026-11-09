/* =========================================================
 * 10 个原创萌系陪伴角色（纯 SVG 绘制，无版权问题）
 * 每个角色由参数化模板生成，支持表情：
 *   mood = "happy"（默认微笑）/ "excited"（大笑+星星眼）/ "sad"（鼓励）
 * ========================================================= */

const CHARACTERS = [
  { id: "dino",    name: "小恐龙", body: "#7ed957", belly: "#d9f7c4", ear: "spikes", accent: "#4caf50", cheek: "#ffb3c7", tail: true },
  { id: "bunny",   name: "小兔子", body: "#ffffff", belly: "#ffe3ee", ear: "long",   accent: "#ff9fbe", cheek: "#ffc4d6", inner: "#ffc4d6", stroke: "#e8b7c9" },
  { id: "cat",     name: "小猫咪", body: "#ffcf7d", belly: "#fff2d9", ear: "pointy", accent: "#f5a623", cheek: "#ffb3c7", inner: "#ffe1ad" },
  { id: "dog",     name: "小狗狗", body: "#d9a066", belly: "#f7e3c4", ear: "floppy", accent: "#a06a32", cheek: "#ffb3c7" },
  { id: "bear",    name: "小熊熊", body: "#b08968", belly: "#ecd9bf", ear: "round",  accent: "#7f5539", cheek: "#ffb3c7" },
  { id: "fox",     name: "小狐狸", body: "#ff9f4d", belly: "#fff2e0", ear: "pointy", accent: "#e0741c", cheek: "#ffc9b3", inner: "#ffe1c9" },
  { id: "penguin", name: "小企鹅", body: "#5c7cfa", belly: "#ffffff", ear: "none",   accent: "#3b5bdb", cheek: "#ffb3c7", beak: true },
  { id: "panda",   name: "小熊猫", body: "#ffffff", belly: "#ffffff", ear: "round",  accent: "#444444", cheek: "#ffb3c7", panda: true, stroke: "#dddddd" },
  { id: "frog",    name: "小青蛙", body: "#8ce26b", belly: "#e2fbd4", ear: "bugeyes", accent: "#51a832", cheek: "#ffb3c7" },
  { id: "lion",    name: "小狮子", body: "#ffcf5c", belly: "#fff3cf", ear: "mane",   accent: "#e8963c", cheek: "#ffb3c7" }
];

/* 生成角色 SVG 字符串 */
function renderCharacter(ch, size, mood) {
  size = size || 120;
  mood = mood || "happy";
  const s = ch.stroke || "#65516f";
  const sw = 3;

  /* ---- 耳朵/头顶装饰 ---- */
  let ears = "";
  if (ch.ear === "long") {          // 兔子长耳朵
    ears = `
      <ellipse cx="75" cy="26" rx="14" ry="34" fill="${ch.body}" stroke="${s}" stroke-width="${sw}" transform="rotate(-12 75 26)"/>
      <ellipse cx="125" cy="26" rx="14" ry="34" fill="${ch.body}" stroke="${s}" stroke-width="${sw}" transform="rotate(12 125 26)"/>
      <ellipse cx="75" cy="30" rx="7" ry="24" fill="${ch.inner}" transform="rotate(-12 75 30)"/>
      <ellipse cx="125" cy="30" rx="7" ry="24" fill="${ch.inner}" transform="rotate(12 125 30)"/>`;
  } else if (ch.ear === "pointy") { // 猫/狐狸尖耳朵
    ears = `
      <polygon points="58,48 70,12 92,40" fill="${ch.body}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>
      <polygon points="142,48 130,12 108,40" fill="${ch.body}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>
      <polygon points="65,42 72,24 84,38" fill="${ch.inner || ch.accent}"/>
      <polygon points="135,42 128,24 116,38" fill="${ch.inner || ch.accent}"/>`;
  } else if (ch.ear === "round") {  // 熊/熊猫圆耳朵
    const ef = ch.panda ? ch.accent : ch.body;
    ears = `
      <circle cx="62" cy="40" r="18" fill="${ef}" stroke="${s}" stroke-width="${sw}"/>
      <circle cx="138" cy="40" r="18" fill="${ef}" stroke="${s}" stroke-width="${sw}"/>
      <circle cx="62" cy="40" r="9" fill="${ch.panda ? "#666" : ch.belly}"/>
      <circle cx="138" cy="40" r="9" fill="${ch.panda ? "#666" : ch.belly}"/>`;
  } else if (ch.ear === "floppy") { // 狗垂耳朵
    ears = `
      <ellipse cx="52" cy="70" rx="16" ry="30" fill="${ch.accent}" transform="rotate(18 52 70)"/>
      <ellipse cx="148" cy="70" rx="16" ry="30" fill="${ch.accent}" transform="rotate(-18 148 70)"/>`;
  } else if (ch.ear === "spikes") { // 恐龙背刺
    ears = `
      <polygon points="100,6 88,30 112,30" fill="${ch.accent}" stroke-linejoin="round"/>
      <polygon points="72,16 62,38 84,36" fill="${ch.accent}" stroke-linejoin="round"/>
      <polygon points="128,16 138,38 116,36" fill="${ch.accent}" stroke-linejoin="round"/>`;
  } else if (ch.ear === "bugeyes") { // 青蛙凸眼座
    ears = `
      <circle cx="72" cy="34" r="17" fill="${ch.body}"/>
      <circle cx="128" cy="34" r="17" fill="${ch.body}"/>`;
  } else if (ch.ear === "mane") {   // 狮子鬃毛
    let petals = "";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const x = 100 + Math.cos(a) * 56;
      const y = 88 + Math.sin(a) * 52;
      petals += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="${ch.accent}"/>`;
    }
    ears = petals;
  }

  /* ---- 眼睛 ---- */
  let eyes = "";
  const eyeY = ch.ear === "bugeyes" ? 34 : 84;
  const eyeLX = ch.ear === "bugeyes" ? 72 : 78;
  const eyeRX = ch.ear === "bugeyes" ? 128 : 122;
  if (mood === "excited") {
    // 星星眼
    eyes = starEye(eyeLX, eyeY) + starEye(eyeRX, eyeY);
  } else if (mood === "sad") {
    eyes = `
      <path d="M ${eyeLX - 8} ${eyeY} q 8 -10 16 0" stroke="#4a3728" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M ${eyeRX - 8} ${eyeY} q 8 -10 16 0" stroke="#4a3728" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  } else {
    const dot = ch.panda ? "#222" : "#4a3728";
    // 熊猫黑眼圈
    if (ch.panda) {
      eyes = `
        <ellipse cx="${eyeLX}" cy="${eyeY}" rx="13" ry="16" fill="${ch.accent}" transform="rotate(-14 ${eyeLX} ${eyeY})"/>
        <ellipse cx="${eyeRX}" cy="${eyeY}" rx="13" ry="16" fill="${ch.accent}" transform="rotate(14 ${eyeRX} ${eyeY})"/>`;
    }
    eyes += `
      <circle cx="${eyeLX}" cy="${eyeY}" r="7" fill="${dot}"/>
      <circle cx="${eyeRX}" cy="${eyeY}" r="7" fill="${dot}"/>
      <circle cx="${eyeLX + 2.5}" cy="${eyeY - 2.5}" r="2.4" fill="#fff"/>
      <circle cx="${eyeRX + 2.5}" cy="${eyeY - 2.5}" r="2.4" fill="#fff"/>`;
  }

  /* ---- 嘴巴 ---- */
  let mouth = "";
  if (ch.beak) { // 企鹅嘴
    mouth = `<polygon points="100,96 90,106 110,106" fill="#ffab40" stroke-linejoin="round"/>`;
    if (mood === "excited") mouth += `<ellipse cx="100" cy="112" rx="8" ry="6" fill="#ff8f00"/>`;
  } else if (mood === "excited") {
    mouth = `<path d="M 84 100 q 16 20 32 0 z" fill="#b3541e" stroke="#4a3728" stroke-width="3" stroke-linejoin="round"/>`;
  } else if (mood === "sad") {
    mouth = `<path d="M 88 108 q 12 -8 24 0" stroke="#4a3728" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else {
    mouth = `
      <path d="M 92 100 q 8 8 16 0" stroke="#4a3728" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="100" cy="95" r="4.5" fill="${ch.panda ? "#444" : "#4a3728"}"/>`;
  }

  /* ---- 腮红 ---- */
  const blush = `
    <ellipse cx="60" cy="104" rx="9" ry="6" fill="${ch.cheek}" opacity="0.8"/>
    <ellipse cx="140" cy="104" rx="9" ry="6" fill="${ch.cheek}" opacity="0.8"/>`;

  /* ---- 身体与肚皮 ---- */
  const body = `
    <ellipse cx="100" cy="96" rx="58" ry="54" fill="${ch.body}" stroke="${s}" stroke-width="${sw}"/>
    <ellipse cx="100" cy="112" rx="32" ry="26" fill="${ch.belly}"/>`;

  /* ---- 恐龙尾巴（装饰用，画在身体后面） ---- */
  const tail = ch.tail ? `<path d="M 152 118 q 26 4 22 26 q -14 -10 -30 -10 z" fill="${ch.accent}"/>` : "";

  return `
  <svg viewBox="0 -12 200 178" width="${size}" height="${size * 0.89}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ch.name}">
    ${tail}${ears}${body}${blush}${eyes}${mouth}
  </svg>`;
}

function starEye(cx, cy) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 11 : 4.6;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="#ffca28" stroke="#e8960c" stroke-width="1.5" stroke-linejoin="round"/>`;
}

function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
