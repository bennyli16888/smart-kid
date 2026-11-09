/* =========================================================
 * 应用主逻辑：屏幕流转 / 语音 / 卡片 / 动画 / 生活用语 / 小游戏
 * ========================================================= */

const state = {
  subject: "zh",
  age: 4,
  charId: localStorage.getItem("smartkid_char") || "dino",
  stars: parseInt(localStorage.getItem("smartkid_stars") || "0", 10),
  cardIndex: 0,
  phraseIndex: 0,
  quizIndex: 0,
  soundOn: true
};

/* ---------------- 语音 ---------------- */
function speak(text, lang) {
  if (!state.soundOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang || "zh-CN";
  u.rate = 0.85;
  u.pitch = 1.25;
  speechSynthesis.speak(u);
}

/* ---------------- 工具 ---------------- */
const $ = sel => document.querySelector(sel);
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

function currentContent() {
  return CONTENT[state.subject].ages[state.age];
}
function currentChar() {
  return getCharacter(state.charId);
}

function saveProgress() {
  localStorage.setItem("smartkid_stars", String(state.stars));
  localStorage.setItem("smartkid_char", state.charId);
}

function addStar(n) {
  state.stars += (n || 1);
  saveProgress();
  renderStars();
}

function renderStars() {
  document.querySelectorAll(".star-count").forEach(el => (el.textContent = state.stars));
}

/* ---------------- 屏幕切换 ---------------- */
function show(screenId) {
  clearTimeout(show._voiceTimer);
  if (screenId !== "screen-animate") clearInterval(playCountAnimation._timer);
  if (screenId !== "screen-quiz") clearTimeout(renderQuiz._nextTimer);
  if (screenId !== "screen-chars") clearTimeout(renderCharSelect._returnTimer);
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("#" + screenId).classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------------- 陪伴角色 ---------------- */
function renderCompanion(slotSelector, mood) {
  const slot = $(slotSelector);
  if (!slot) return;
  slot.innerHTML = renderCharacter(currentChar(), slotSelector === "#home-companion" ? 130 : 92, mood || "happy");
}

function setCompanionMood(mood, backToHappy) {
  document.querySelectorAll(".companion-slot").forEach(slot => {
    slot.innerHTML = renderCharacter(currentChar(), slot.id === "home-companion" ? 130 : 92, mood);
    slot.classList.remove("bounce", "wiggle");
    void slot.offsetWidth; // 重启动画
    slot.classList.add(mood === "sad" ? "wiggle" : "bounce");
  });
  if (backToHappy !== false) {
    clearTimeout(setCompanionMood._t);
    setCompanionMood._t = setTimeout(() => {
      document.querySelectorAll(".companion-slot").forEach(slot => {
        const size = slot.id === "home-companion" ? 130 : 92;
        slot.innerHTML = renderCharacter(currentChar(), size, "happy");
      });
    }, 2200);
  }
}

/* ---------------- 星星雨 ---------------- */
function confetti() {
  const layer = $("#confetti-layer");
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.className = "confetti-star";
    s.textContent = ["⭐", "🌟", "✨", "🎉"][i % 4];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.5 + "s";
    s.style.fontSize = 18 + Math.random() * 22 + "px";
    layer.appendChild(s);
    setTimeout(() => s.remove(), 2600);
  }
}

/* =========================================================
 * 屏幕渲染
 * ========================================================= */

/* ---- 首页 ---- */
function renderHome() {
  renderCompanion("#home-companion");
  renderStars();
  $("#home-char-name").textContent = currentChar().name;

  // 年龄按钮
  document.querySelectorAll("#age-row .age-btn").forEach(btn => {
    btn.classList.toggle("selected", +btn.dataset.age === state.age);
  });
  // 科目按钮
  document.querySelectorAll("#subject-row .subject-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.subject === state.subject);
  });
  show("screen-home");
}

/* ---- 角色选择 ---- */
function renderCharSelect() {
  const grid = $("#char-grid");
  grid.innerHTML = "";
  CHARACTERS.forEach(ch => {
    const card = document.createElement("button");
    card.className = "char-card" + (ch.id === state.charId ? " selected" : "");
    card.innerHTML = `${renderCharacter(ch, 96, "happy")}<span class="char-name">${ch.name}</span>`;
    card.onclick = () => {
      state.charId = ch.id;
      saveProgress();
      speak(`我是${ch.name}，很高兴认识你！`);
      renderCharSelect();
      clearTimeout(renderCharSelect._returnTimer);
      renderCharSelect._returnTimer = setTimeout(renderHome, 900);
    };
    grid.appendChild(card);
  });
  show("screen-chars");
}

/* ---- 学习菜单（选模式） ---- */
function renderMenu() {
  const c = CONTENT[state.subject];
  $("#menu-title").innerHTML = `${c.icon} ${c.name} · ${state.age}岁`;
  renderCompanion("#menu-companion");
  renderStars();
  show("screen-menu");
}

/* ---- 卡片教学 ---- */
function renderCard() {
  const cards = currentContent().cards;
  const card = cards[state.cardIndex];
  $("#card-progress").textContent = `${state.cardIndex + 1} / ${cards.length}`;
  const el = $("#flashcard");
  el.classList.remove("flip");
  el.innerHTML = `
    <div class="card-face card-front">
      <div class="card-icon">${card.icon}</div>
      <div class="card-title">${card.title}</div>
      ${card.extra ? `<div class="card-extra">${card.extra}</div>` : ""}
    </div>
    <div class="card-face card-back">
      <div class="card-title big">${card.title}</div>
      <div class="card-sub">${card.sub || ""}</div>
      <div class="card-hint">🔊 再点一次，听一听</div>
    </div>`;
  el.onclick = () => {
    el.classList.toggle("flip");
    speak(card.speak, card.speakLang);
  };
  el.onkeydown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      el.click();
    }
  };
  renderCompanion("#card-companion");
  renderStars();
  show("screen-card");
  show._voiceTimer = setTimeout(() => speak(card.speak, card.speakLang), 300);
}

function nextCard(d) {
  const cards = currentContent().cards;
  state.cardIndex = (state.cardIndex + d + cards.length) % cards.length;
  renderCard();
}

/* ---- 动画小课堂（数数） ---- */
function renderAnimate() {
  const a = currentContent().animate;
  $("#animate-title").textContent = `🎬 ${a.title}`;
  $("#animate-stage").innerHTML = "";
  $("#animate-count").textContent = "";
  renderCompanion("#animate-companion");
  renderStars();
  show("screen-animate");
  playCountAnimation(a);
}

function playCountAnimation(a) {
  const stage = $("#animate-stage");
  stage.innerHTML = "";
  $("#animate-count").textContent = "";
  const enWords = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const words = a.type === "words" ? currentContent().cards.slice(0, 5) : null;
  const total = words ? words.length : a.max;
  let i = 0;
  clearInterval(playCountAnimation._timer);

  const step = () => {
    if (i >= total) {
      clearInterval(playCountAnimation._timer);
      $("#animate-count").textContent = words ? "🌟 太棒啦！" : a.speakLang === "en-US" ? `${a.max}! Great job!` : `一共 ${a.max} 个！`;
      speak(words ? "太棒啦！" : a.speakLang === "en-US" ? `${a.max}! Great job!` : `一共${a.max}个！太棒了！`, words ? undefined : a.speakLang);
      setCompanionMood("excited");
      addStar(1);
      confetti();
      return;
    }
    const item = document.createElement("span");
    item.className = "anim-item";
    item.textContent = words ? words[i].icon : a.icon;
    if (words) stage.innerHTML = "";
    stage.appendChild(item);
    $("#animate-count").textContent = words ? words[i].title : i + 1;
    speak(words ? words[i].speak : a.speakLang === "en-US" ? enWords[i] : String(i + 1), words ? words[i].speakLang : a.speakLang);
    i++;
  };
  step();
  playCountAnimation._timer = setInterval(step, words ? 2200 : 1100);
}

/* ---- 生活用语 ---- */
function renderPhrase() {
  const list = PHRASES[state.subject === "en" ? "en" : "zh"];
  const p = list[state.phraseIndex % list.length];
  $("#phrase-progress").textContent = `${(state.phraseIndex % list.length) + 1} / ${list.length}`;
  $("#phrase-card").innerHTML = `
    <div class="phrase-icon">${p.icon}</div>
    <div class="phrase-main">${p.en || p.zh}</div>
    ${p.en ? `<div class="phrase-zh">${p.zh}</div>` : ""}
    <div class="phrase-tip">${p.tip}</div>
    <button class="btn btn-speak" id="phrase-speak">🔊 听一听</button>`;
  $("#phrase-speak").onclick = () => speak(p.speak, p.speakLang);
  renderCompanion("#phrase-companion");
  renderStars();
  show("screen-phrase");
  show._voiceTimer = setTimeout(() => speak(p.speak, p.speakLang), 300);
}

function nextPhrase(d) {
  const list = PHRASES[state.subject === "en" ? "en" : "zh"];
  state.phraseIndex = (state.phraseIndex + d + list.length) % list.length;
  renderPhrase();
}

/* ---- 找一找小游戏 ---- */
function renderQuiz() {
  clearTimeout(renderQuiz._nextTimer);
  const quiz = currentContent().quiz;
  const q = quiz[state.quizIndex % quiz.length];
  $("#quiz-progress").textContent = `第 ${(state.quizIndex % quiz.length) + 1} 题 / 共 ${quiz.length} 题`;
  $("#quiz-ask").textContent = q.ask;
  $("#quiz-repeat").onclick = () => speak(q.speak, q.speakLang);
  const scene = $("#quiz-scene");
  scene.textContent = q.scene || "";
  scene.style.display = q.scene ? "block" : "none";

  const opts = $("#quiz-options");
  opts.innerHTML = "";
  let answered = false;
  q.options.forEach((opt, idx) => {
    const b = document.createElement("button");
    b.className = "quiz-opt";
    b.innerHTML = `<span class="quiz-opt-icon">${opt.icon}</span><span class="quiz-opt-label">${opt.label}</span>`;
    b.onclick = () => {
      if (answered) return;
      if (idx === q.answer) {
        answered = true;
        b.classList.add("correct");
        speak(rand(PRAISE));
        setCompanionMood("excited");
        addStar(1);
        confetti();
        renderQuiz._nextTimer = setTimeout(() => {
          state.quizIndex++;
          renderQuiz();
        }, 1600);
      } else {
        b.classList.add("wrong");
        speak(rand(ENCOURAGE));
        setCompanionMood("sad");
        setTimeout(() => b.classList.remove("wrong"), 700);
      }
    };
    opts.appendChild(b);
  });
  renderCompanion("#quiz-companion");
  renderStars();
  show("screen-quiz");
  show._voiceTimer = setTimeout(() => speak(q.speak, q.speakLang), 350);
}

/* =========================================================
 * 事件绑定
 * ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // 首页：年龄 / 科目
  document.querySelectorAll("#age-row .age-btn").forEach(btn => {
    btn.onclick = () => {
      state.age = +btn.dataset.age;
      renderHome();
      speak(`${state.age}岁的小朋友，我们开始吧！`);
    };
  });
  document.querySelectorAll("#subject-row .subject-btn").forEach(btn => {
    btn.onclick = () => {
      state.subject = btn.dataset.subject;
      renderHome();
    };
  });
  $("#btn-start").onclick = renderMenu;
  $("#btn-pick-char").onclick = renderCharSelect;

  // 通用返回
  document.querySelectorAll(".btn-back").forEach(b => (b.onclick = renderHome));
  document.querySelectorAll(".btn-to-menu").forEach(b => (b.onclick = renderMenu));

  // 菜单模式
  document.querySelectorAll("#screen-menu .mode-btn").forEach(btn => {
    btn.onclick = () => {
      const mode = btn.dataset.mode;
      state.cardIndex = 0; state.phraseIndex = 0; state.quizIndex = 0;
      if (mode === "card") renderCard();
      else if (mode === "animate") renderAnimate();
      else if (mode === "phrase") renderPhrase();
      else if (mode === "quiz") renderQuiz();
    };
  });

  // 卡片翻页
  $("#card-prev").onclick = () => nextCard(-1);
  $("#card-next").onclick = () => nextCard(1);

  // 动画重播
  $("#animate-replay").onclick = () => playCountAnimation(currentContent().animate);

  // 用语翻页
  $("#phrase-prev").onclick = () => nextPhrase(-1);
  $("#phrase-next").onclick = () => nextPhrase(1);

  // 音效开关
  document.querySelectorAll(".btn-sound").forEach(b => {
    b.onclick = () => {
      state.soundOn = !state.soundOn;
      document.querySelectorAll(".btn-sound").forEach(x => (x.textContent = state.soundOn ? "🔊" : "🔇"));
      if (!state.soundOn) speechSynthesis.cancel();
    };
  });

  renderHome();
});
