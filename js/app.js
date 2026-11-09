const $ = selector => document.querySelector(selector);
const THEMES = {
  dino: { paper: "#f5fcf4", grid: "#dcebd9", ink: "#354d43", muted: "#587568", accent: "#ceeab8", strong: "#5f9b6d", secondary: "#e6e5fa", highlight: "#fff0bc", world: "森林课堂", symbol: "🌿" },
  bunny: { paper: "#fff7fb", grid: "#f6dce8", ink: "#583756", muted: "#8b5d80", accent: "#ffd2e3", strong: "#bd4b81", secondary: "#e7defa", highlight: "#fff0be", world: "花园课堂", symbol: "🌸" },
  cat: { paper: "#fffbf2", grid: "#f1e5cd", ink: "#67462f", muted: "#8b684d", accent: "#ffe2a8", strong: "#aa722f", secondary: "#f8dce6", highlight: "#e0efcf", world: "阳光课堂", symbol: "☀️" },
  dog: { paper: "#fcf8f1", grid: "#e9dfcf", ink: "#604530", muted: "#82644d", accent: "#f1d3ad", strong: "#9b683d", secondary: "#dce9f7", highlight: "#fff0bf", world: "小屋课堂", symbol: "🏡" },
  bear: { paper: "#faf6f0", grid: "#e6d9ca", ink: "#594233", muted: "#7b6150", accent: "#dcc5b0", strong: "#8c6245", secondary: "#e1e7cf", highlight: "#fbe7c2", world: "蜂蜜课堂", symbol: "🍯" },
  fox: { paper: "#fff8f2", grid: "#f5deca", ink: "#663f39", muted: "#926757", accent: "#ffd1af", strong: "#b16a43", secondary: "#e9ddf4", highlight: "#fff0c7", world: "秋叶课堂", symbol: "🍂" },
  penguin: { paper: "#f3f8ff", grid: "#dce6f9", ink: "#35486b", muted: "#59709a", accent: "#c9ddfb", strong: "#557cb5", secondary: "#d9eef0", highlight: "#ffedc2", world: "冰雪课堂", symbol: "❄️" },
  panda: { paper: "#f6faf5", grid: "#dce6d7", ink: "#3d4640", muted: "#68776a", accent: "#dcecc9", strong: "#62804c", secondary: "#e4e3ef", highlight: "#f3e9ce", world: "竹林课堂", symbol: "🎋" },
  frog: { paper: "#f2fcfa", grid: "#d0ece7", ink: "#2e5350", muted: "#4b7873", accent: "#bcebdc", strong: "#36887a", secondary: "#dae6fa", highlight: "#f8f1c1", world: "池塘课堂", symbol: "🪷" },
  lion: { paper: "#fffbec", grid: "#f3e5bf", ink: "#634c30", muted: "#8b704f", accent: "#ffe29b", strong: "#a77a2b", secondary: "#efddcf", highlight: "#e0edc6", world: "草原课堂", symbol: "🌾" }
};

function stored(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
const state = {
  subject: "zh", level: 1, count: 10,
  charId: getCharacter(stored("smartkid_char", "dino")).id,
  stars: Math.max(0, Number(stored("smartkid_stars", "0")) || 0),
  items: [], index: 0, completed: new Set(), explanationStep: 0, returnScreen: "screen-home"
};
function save() {
  try {
    localStorage.setItem("smartkid_char", state.charId);
    localStorage.setItem("smartkid_stars", String(state.stars));
  } catch { /* Learning still works when browser storage is unavailable. */ }
}

// Bundled MP3s do not depend on a device's installed speech voices.
const narrator = {
  audio: new Audio(), enabled: false, sequence: 0, cancelTrack: null,
  stop() {
    this.sequence++;
    this.audio.pause();
    if (this.cancelTrack) this.cancelTrack();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if ($("#sound-status")?.textContent.startsWith("正在读")) {
      $("#sound-status").textContent = "朗读已暂停，点“听一听”可以再听一次。";
    }
  },
  async play(ids) {
    this.stop();
    this.enabled = true;
    updateSound();
    const sequence = this.sequence;
    const tracks = new Map(audioTracks().map(track => [track.id, track]));
    for (const id of ids) {
      if (sequence !== this.sequence) return;
      const track = tracks.get(id);
      $("#sound-status").textContent = `正在读：${track.text}`;
      try {
        await new Promise((resolve, reject) => {
          let timer;
          const finish = error => {
            clearTimeout(timer);
            this.audio.onended = null;
            this.audio.onerror = null;
            this.cancelTrack = null;
            error ? reject(error) : resolve();
          };
          this.cancelTrack = () => finish();
          this.audio.onended = () => finish();
          this.audio.onerror = () => finish(new Error("audio-load"));
          this.audio.src = `audio/${id}.mp3`;
          timer = setTimeout(() => finish(new Error("audio-timeout")), 15000);
          this.audio.play().catch(finish);
        });
      } catch (error) {
        if (sequence !== this.sequence) return;
        this.audio.pause();
        if (error.name === "NotAllowedError") {
          $("#sound-status").textContent = "浏览器拦截了播放，请再点一次“听一听”，并检查设备音量。";
          return;
        }
        const voices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
        const voice = voices.find(v => v.lang.toLowerCase().startsWith(track.lang.startsWith("zh") ? "zh" : "en"));
        if (voice && ids.length === 1) {
          const utterance = new SpeechSynthesisUtterance(track.text);
          utterance.voice = voice;
          utterance.lang = track.lang;
          utterance.rate = .8;
          utterance.onerror = () => { $("#sound-status").textContent = "读音播放失败，请检查网络并重新加载页面。"; };
          window.speechSynthesis.speak(utterance);
          $("#sound-status").textContent = "音频未加载，正在使用设备读音。";
        } else {
          $("#sound-status").textContent = "读音未加载，请检查网络并刷新。文字和图片仍可使用。";
        }
        return;
      }
    }
    if (sequence === this.sequence) $("#sound-status").textContent = "声音已开启。听不到时，请检查设备音量或静音模式。";
  }
};
narrator.audio.preload = "auto";

function updateSound() {
  $("#sound-button").textContent = narrator.enabled ? "🔊" : "🔈";
  $("#sound-button").setAttribute("aria-pressed", String(narrator.enabled));
  $("#sound-button").setAttribute("aria-label", narrator.enabled ? "关闭声音" : "开启声音");
}
function renderCompanions(mood = "happy") {
  document.querySelectorAll(".companion").forEach(el => {
    el.innerHTML = renderCharacter(getCharacter(state.charId), Number(el.dataset.size), mood);
  });
}
function applyTheme() {
  const theme = THEMES[state.charId];
  for (const key of ["paper", "grid", "ink", "muted", "accent", "secondary", "highlight"]) {
    document.documentElement.style.setProperty(`--${key}`, theme[key]);
  }
  document.documentElement.style.setProperty("--accent-strong", theme.strong);
  document.documentElement.dataset.character = state.charId;
  $("meta[name=theme-color]").content = theme.paper;
  $("#world-name").textContent = `${theme.symbol} ${getCharacter(state.charId).name}的${theme.world}`;
  $("#character-name").textContent = getCharacter(state.charId).name;
  renderCompanions();
}
function show(screenId) {
  narrator.stop();
  document.querySelectorAll(".screen").forEach(el => el.classList.toggle("active", el.id === screenId));
  window.scrollTo({ top: 0, behavior: "instant" });
}
function renderHome() {
  renderSettings();
  renderCompanions();
  show("screen-home");
}
function renderSettings() {
  document.querySelectorAll("[data-subject]").forEach(button => {
    const selected = button.dataset.subject === state.subject;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $("#level-row").innerHTML = SUBJECTS[state.subject].levels.map((name, index) =>
    `<button data-level="${index + 1}" aria-pressed="${state.level === index + 1}" class="${state.level === index + 1 ? "selected" : ""}">${name}</button>`
  ).join("");
  $("#level-row").querySelectorAll("button").forEach(button => {
    button.onclick = () => { state.level = Number(button.dataset.level); renderSettings(); };
  });
  document.querySelectorAll("[data-count]").forEach(button => {
    const selected = Number(button.dataset.count) === state.count;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = `${button.dataset.count} ${state.subject === "math" ? "题" : "次"}`;
  });
  $("#lesson-note").textContent = state.subject === "math"
    ? `生成 ${state.count} 道不同的加减法。不会做？小伙伴用星星讲解。`
    : `每个难度有 10 个字词，学习 ${state.count} 次；20、30 次会重复巩固。`;
}
function renderCharSelect(returnScreen) {
  state.returnScreen = returnScreen;
  $("#character-grid").innerHTML = CHARACTERS.map(ch =>
    `<button class="character-card ${ch.id === state.charId ? "selected" : ""}" data-char="${ch.id}" aria-pressed="${ch.id === state.charId}">${renderCharacter(ch, 100)}<span>${ch.name}</span><small>${THEMES[ch.id].symbol} ${THEMES[ch.id].world}</small></button>`
  ).join("");
  $("#character-grid").querySelectorAll("button").forEach(button => {
    button.onclick = () => {
      state.charId = button.dataset.char;
      save();
      applyTheme();
      show(state.returnScreen);
    };
  });
  show("screen-chars");
}
function startLesson() {
  state.items = generateLesson(state.subject, state.level, state.count);
  state.index = 0;
  state.completed = new Set();
  renderLesson();
}
function currentQuestion() { return state.items[state.index]; }
function questionTracks() {
  const q = currentQuestion();
  return state.subject === "math" ? [`n-${q.a}`, q.op === "+" ? "plus" : "minus", `n-${q.b}`, "question"] : [q.audio];
}
function renderLesson() {
  show("screen-lesson");
  renderCompanions();
  $("#lesson-title").textContent = `${SUBJECTS[state.subject].name} · ${SUBJECTS[state.subject].levels[state.level - 1]}`;
  $("#lesson-progress").textContent = `${state.index + 1} / ${state.items.length}`;
  $("#progress-bar").max = state.items.length;
  $("#progress-bar").value = state.index + 1;
  $("#previous-button").disabled = state.index === 0;
  $("#next-button").textContent = state.index === state.items.length - 1 ? "完成啦 ✓" : "下一个 →";
  $("#feedback").textContent = "";
  $("#explanation").hidden = true;
  $("#answers").innerHTML = "";
  const q = currentQuestion();
  const math = state.subject === "math";
  $("#explain-button").hidden = !math;
  $("#next-button").disabled = math && !state.completed.has(state.index);
  if (math) {
    $("#lesson-content").innerHTML = `<p class="eyebrow">小伙伴陪你加一加、减一减</p><div class="equation">${q.a} ${q.op} ${q.b} = ?</div><p class="subtitle">${q.op === "+" ? "拿来一些，合在一起。" : "拿走一些，看看还剩多少。"}</p>`;
    answerChoices(q, state.level * 10).forEach(answer => {
      const button = document.createElement("button");
      button.className = "answer";
      button.textContent = answer;
      if (state.completed.has(state.index)) {
        button.disabled = true;
        if (answer === q.answer) button.classList.add("correct");
      }
      button.onclick = () => {
        if (state.completed.has(state.index)) return;
        if (answer === q.answer) {
          markComplete();
          button.classList.add("correct");
          $("#answers").querySelectorAll("button").forEach(el => { el.disabled = true; });
          $("#feedback").textContent = `⭐ 对啦！${q.a} ${q.op} ${q.b} = ${q.answer}`;
          $("#next-button").disabled = false;
          renderCompanions("excited");
          if (narrator.enabled) narrator.play(["praise"]);
        } else {
          button.classList.add("wrong");
          $("#feedback").textContent = "🌱 没关系，点下面的星星解法，数一数再试。";
          if (narrator.enabled) narrator.play(["retry"]);
        }
      };
      $("#answers").appendChild(button);
    });
  } else {
    $("#lesson-content").innerHTML = `${renderPicture(q.picture, q.hint)}<div class="word">${q.word}</div><p class="word-hint">${q.hint}</p>`;
  }
  if (narrator.enabled) narrator.play(questionTracks());
}
function markComplete() {
  if (state.completed.has(state.index)) return;
  state.completed.add(state.index);
  state.stars++;
  $("#stars").textContent = state.stars;
  save();
}
function nextQuestion() {
  if (state.subject === "math" && !state.completed.has(state.index)) return;
  if (state.subject !== "math") markComplete();
  if (state.index < state.items.length - 1) {
    state.index++;
    renderLesson();
  } else {
    show("screen-results");
    renderCompanions("excited");
    $("#result-message").textContent = `完成 ${state.items.length} ${state.subject === "math" ? "题" : "次学习"}，收获 ${state.completed.size} 颗星星！`;
    if (narrator.enabled) narrator.play(["done"]);
  }
}

function renderExplanation() {
  narrator.stop();
  const q = currentQuestion();
  const step = state.explanationStep;
  const adding = q.op === "+";
  let text, ids;
  if (step === 0) {
    text = `① 先放好 ${q.a} 颗星星。点一点，每颗星星都会报数。`;
    ids = ["first", `n-${q.a}`, "stars"];
  } else if (step === 1) {
    text = adding ? `② 再拿来 ${q.b} 颗，绿色底的是新来的。把它们合在一起！` : `② 拿走 ${q.b} 颗。打叉的星星拿走了，不用数它们。`;
    ids = [adding ? "bring" : "take", `n-${q.b}`, "stars", adding ? "together" : "left"];
  } else {
    text = `③ ${adding ? "一共有" : "还剩"} ${q.answer} 颗！${q.a} ${q.op} ${q.b} = ${q.answer}。${q.answer === 0 ? "一颗也没有了，就是 0。" : "再点星星，一起数一次。"} `;
    ids = [adding ? "total" : "remains", `n-${q.answer}`, "stars", `n-${q.a}`, adding ? "plus" : "minus", `n-${q.b}`, "equals", `n-${q.answer}`];
  }
  $("#explanation").hidden = false;
  $("#explain-text").textContent = text;
  $("#explain-next").textContent = step === 2 ? "↻ 再讲一次" : "▶ 下一步";
  $("#star-scene").innerHTML = "";
  const number = step === 0 ? q.a : adding ? q.a + q.b : q.a;
  for (let i = 0; i < number; i++) {
    const taken = step > 0 && !adding && i >= q.answer;
    const button = document.createElement("button");
    button.className = `star-token${taken ? " taken" : ""}${step > 0 && adding && i >= q.a ? " added" : ""}`;
    button.innerHTML = `⭐<small>${i + 1}</small>`;
    button.disabled = taken;
    button.setAttribute("aria-label", taken ? "已拿走的星星" : `第 ${i + 1} 颗星星`);
    button.onclick = () => {
      button.classList.add("counted");
      narrator.play([`n-${i + 1}`]);
    };
    $("#star-scene").appendChild(button);
  }
  if (number === 0) $("#star-scene").textContent = "0 · 一颗也没有";
  if (narrator.enabled) narrator.play(ids);
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  $("#stars").textContent = state.stars;
  renderSettings();
  $("#home-button").onclick = renderHome;
  $("#finish-button").onclick = renderHome;
  $("#pick-character").onclick = () => renderCharSelect("screen-home");
  $("#lesson-character").onclick = () => renderCharSelect("screen-lesson");
  $("#sound-test").onclick = () => narrator.play(["hello"]);
  $("#sound-button").onclick = () => {
    if (!narrator.enabled) narrator.play(["hello"]);
    else {
      narrator.stop();
      narrator.enabled = false;
      updateSound();
      $("#sound-status").textContent = "声音已关闭。点“听一听”即可重新开启。";
    }
  };
  document.querySelectorAll("[data-subject]").forEach(button => {
    button.onclick = () => { state.subject = button.dataset.subject; renderSettings(); };
  });
  document.querySelectorAll("[data-count]").forEach(button => {
    button.onclick = () => { state.count = Number(button.dataset.count); renderSettings(); };
  });
  $("#start-button").onclick = startLesson;
  $("#again-button").onclick = startLesson;
  $("#listen-button").onclick = () => narrator.play(questionTracks());
  $("#next-button").onclick = nextQuestion;
  $("#previous-button").onclick = () => {
    if (state.index > 0) { state.index--; renderLesson(); }
  };
  $("#explain-button").onclick = () => { state.explanationStep = 0; renderExplanation(); };
  $("#explain-next").onclick = () => {
    state.explanationStep = (state.explanationStep + 1) % 3;
    renderExplanation();
  };
  document.addEventListener("visibilitychange", () => { if (document.hidden) narrator.stop(); });
});
