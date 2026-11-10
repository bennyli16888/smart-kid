const $ = selector => document.querySelector(selector);
const THEMES = {
  dino: { paper: "#f5fcf4", grid: "#dcebd9", ink: "#354d43", muted: "#587568", accent: "#ceeab8", strong: "#5f9b6d", secondary: "#e6e5fa", highlight: "#fff0bc", song: "#f7d8df", world: "森林课堂", symbol: "🌿" },
  bunny: { paper: "#fff7fb", grid: "#f6dce8", ink: "#583756", muted: "#8b5d80", accent: "#ffd2e3", strong: "#bd4b81", secondary: "#e7defa", highlight: "#fff0be", song: "#d3eee2", world: "花园课堂", symbol: "🌸" },
  cat: { paper: "#fffbf2", grid: "#f1e5cd", ink: "#67462f", muted: "#8b684d", accent: "#ffe2a8", strong: "#aa722f", secondary: "#f8dce6", highlight: "#e0efcf", song: "#dce5fa", world: "阳光课堂", symbol: "☀️" },
  dog: { paper: "#fcf8f1", grid: "#e9dfcf", ink: "#604530", muted: "#82644d", accent: "#f1d3ad", strong: "#9b683d", secondary: "#dce9f7", highlight: "#fff0bf", song: "#eadcf4", world: "小屋课堂", symbol: "🏡" },
  bear: { paper: "#faf6f0", grid: "#e6d9ca", ink: "#594233", muted: "#7b6150", accent: "#dcc5b0", strong: "#8c6245", secondary: "#e1e7cf", highlight: "#fbe7c2", song: "#e1ddf5", world: "蜂蜜课堂", symbol: "🍯" },
  fox: { paper: "#fff8f2", grid: "#f5deca", ink: "#663f39", muted: "#926757", accent: "#ffd1af", strong: "#b16a43", secondary: "#e9ddf4", highlight: "#fff0c7", song: "#d5eaf2", world: "秋叶课堂", symbol: "🍂" },
  penguin: { paper: "#f3f8ff", grid: "#dce6f9", ink: "#35486b", muted: "#59709a", accent: "#c9ddfb", strong: "#557cb5", secondary: "#d9eef0", highlight: "#ffedc2", song: "#f6dce8", world: "冰雪课堂", symbol: "❄️" },
  panda: { paper: "#f6faf5", grid: "#dce6d7", ink: "#3d4640", muted: "#68776a", accent: "#dcecc9", strong: "#62804c", secondary: "#e4e3ef", highlight: "#f3e9ce", song: "#f4dce6", world: "竹林课堂", symbol: "🎋" },
  frog: { paper: "#f2fcfa", grid: "#d0ece7", ink: "#2e5350", muted: "#4b7873", accent: "#bcebdc", strong: "#36887a", secondary: "#dae6fa", highlight: "#f8f1c1", song: "#f7dce7", world: "池塘课堂", symbol: "🪷" },
  lion: { paper: "#fffbec", grid: "#f3e5bf", ink: "#634c30", muted: "#8b704f", accent: "#ffe29b", strong: "#a77a2b", secondary: "#efddcf", highlight: "#e0edc6", song: "#e5ddf6", world: "草原课堂", symbol: "🌾" }
};

function stored(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
const state = {
  subject: "zh", level: 1, count: 10, countMode: "10", repeat: false, ratio: .1,
  limit: 10, objectId: "candy", songLang: "zh",
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
  audio: new Audio(), enabled: false, sequence: 0, cancelTrack: null, unlocked: false,
  stop() {
    this.sequence++;
    this.audio.pause();
    if (this.cancelTrack) this.cancelTrack();
    setSoundError();
  },
  playSource(url, timeout = 15000) {
    return new Promise((resolve, reject) => {
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
      this.audio.src = url;
      timer = setTimeout(() => finish(new Error("audio-timeout")), timeout);
      this.audio.play().catch(finish);
    });
  },
  async play(ids) {
    this.stop();
    this.enabled = true;
    updateSound();
    const sequence = this.sequence;
    if (continuousAudio.supported) {
      try {
        if (!this.unlocked) {
          // Unlock the same media element inside the click, before asynchronous decoding.
          const silence = URL.createObjectURL(encodeWave(new Float32Array(240), 24000));
          try {
            this.audio.src = silence;
            await this.audio.play();
            this.unlocked = true;
          } finally { URL.revokeObjectURL(silence); }
        }
        const phrase = await continuousAudio.prepare(ids);
        if (sequence !== this.sequence) return;
        await this.playSource(phrase.url, Math.ceil(phrase.duration * 1000) + 15000);
        return;
      } catch (error) {
        if (sequence !== this.sequence) return;
        if (error.name === "NotAllowedError") {
          setSoundError("浏览器拦截了播放，请再点一次“听一听”，并检查设备音量。");
          return;
        }
        // Older browsers or decoding failures retain the original MP3 playback.
      }
    }
    for (const id of ids) {
      if (sequence !== this.sequence) return;
      try {
        await this.playSource(`audio/${id}.mp3?v=0.3`);
      } catch (error) {
        if (sequence !== this.sequence) return;
        this.audio.pause();
        if (error.name === "NotAllowedError") {
          setSoundError("浏览器拦截了播放，请再点一次“听一听”，并检查设备音量。");
          return;
        }
        setSoundError("读音未加载，请检查网络并刷新。文字和图片仍可使用。");
        return;
      }
    }
  }
};
narrator.audio.preload = "auto";

function setSoundError(message = "") {
  $("#sound-status").textContent = message;
  $("#sound-status").hidden = !message;
}
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
  for (const key of ["paper", "grid", "ink", "muted", "accent", "secondary", "highlight", "song"]) {
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
  stopSong();
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
  const songs = state.subject === "songs";
  $("#learning-settings").hidden = songs;
  $("#song-settings").hidden = !songs;
  $("#settings-error").textContent = "";
  if (songs) { renderSongs(); return; }
  const math = state.subject === "math";
  $("#level-heading").textContent = math ? "🔢 数字范围" : "🌱 选个难度";
  $("#level-row").setAttribute("aria-label", math ? "数字范围" : "难度");
  $("#level-row").innerHTML = SUBJECTS[state.subject].levels.map((name, index) =>
    `<button data-level="${index + 1}" aria-pressed="${state.level === index + 1}" class="${state.level === index + 1 ? "selected" : ""}">${name}</button>`
  ).join("");
  $("#level-row").querySelectorAll("button").forEach(button => {
    button.onclick = () => { state.level = Number(button.dataset.level); renderSettings(); };
  });
  document.querySelectorAll("[data-count]").forEach(button => {
    const selected = button.dataset.count === state.countMode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = button.dataset.count === "custom" ? "自定义" : `${button.dataset.count} ${math ? "题" : "个"}`;
  });
  $("#custom-range-field").hidden = !math || state.level !== 3;
  $("#custom-count-field").hidden = state.countMode !== "custom";
  $("#object-settings").hidden = !math;
  $("#repeat-settings").hidden = math;
  $("#allow-repeat").checked = state.repeat;
  $("#repeat-options").hidden = !state.repeat;
  document.querySelectorAll("[data-repeat]").forEach(button => {
    const selected = Number(button.dataset.repeat) === state.ratio;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $("#object-row").innerHTML = COUNTING_OBJECTS.map(item =>
    `<button data-object="${item.id}" aria-pressed="${item.id === state.objectId}" class="${item.id === state.objectId ? "selected" : ""}"><span>${item.emoji}</span>${item.name}</button>`
  ).join("");
  $("#object-row").querySelectorAll("button").forEach(button => {
    button.onclick = () => { state.objectId = button.dataset.object; renderSettings(); };
  });
  $("#lesson-note").textContent = math
    ? "数字和结果均不超过所选范围，没有负数。每次生成不同题目，可用喜欢的实物分步讲解。"
    : `本难度有 ${WORDS[state.subject][state.level - 1].length} 个字词，${state.subject === "zh" ? "语文" : "英语"}共 90 个。${state.repeat ? `重复比例 ${Math.round(state.ratio * 100)}%，其余为不同字词。` : "默认不重复；数量超过材料时会提示，不会偷偷重复。"} `;
}
const songAudio = new Audio();
songAudio.preload = "none";
let songSequence = 0;
function stopSong() {
  songSequence++;
  songAudio.pause();
}
function renderSongs() {
  stopSong();
  $("#song-player").hidden = true;
  const songs = SONGS[state.songLang];
  document.querySelectorAll("[data-song-lang]").forEach(button => {
    const lang = button.dataset.songLang;
    button.textContent = `${lang === "zh" ? "中文儿歌" : "英文儿歌"} · ${SONGS[lang].length}首`;
    button.classList.toggle("selected", lang === state.songLang);
    button.setAttribute("aria-pressed", String(lang === state.songLang));
  });
  $("#song-list").innerHTML = "";
  if (!songs.length) {
    $("#song-list").textContent = "暂未找到可核实公开分发授权的中文经典儿歌演唱录音，先不收录。";
  }
  songs.forEach((song, index) => {
    const button = document.createElement("button");
    button.textContent = `${index + 1}. ${song.title}`;
    button.onclick = async () => {
      narrator.stop();
      stopSong();
      const sequence = songSequence;
      narrator.enabled = true;
      updateSound();
      $("#song-player").hidden = false;
      $("#song-title").textContent = song.title;
      $("#song-source").textContent = `${song.author} · ${song.license} · ${song.changes}`;
      $("#song-link").href = song.source;
      $("#song-license").href = song.licenseUrl;
      $("#song-status").textContent = "正在准备儿歌…";
      songAudio.src = song.file;
      try {
        await songAudio.play();
        if (sequence === songSequence && !songAudio.paused) $("#song-status").textContent = "正在播放，点击停止可暂停。";
      } catch {
        if (sequence === songSequence) $("#song-status").textContent = "儿歌未能播放，请重试并检查音量、网络；也可查看来源页面。";
      }
    };
    $("#song-list").appendChild(button);
  });
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
  state.count = state.countMode === "custom" ? Number($("#custom-count").value) : Number(state.countMode);
  state.limit = state.level === 3 ? Number($("#custom-range").value) : state.level * 10;
  try {
    state.items = generateLesson(state.subject, state.level, state.count, {
      repeat: state.repeat, ratio: state.ratio, limit: state.limit
    });
  } catch (error) {
    $("#settings-error").textContent = error.message;
    return;
  }
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
  $("#lesson-title").textContent = `${SUBJECTS[state.subject].name} · ${state.subject === "math" ? `${state.limit}以内` : SUBJECTS[state.subject].levels[state.level - 1]}`;
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
  const object = COUNTING_OBJECTS.find(item => item.id === state.objectId);
  $("#explain-button").hidden = !math;
  $("#explain-button").textContent = `${object.emoji} 用${object.name}讲给我听`;
  $("#next-button").disabled = math && !state.completed.has(state.index);
  if (math) {
    $("#lesson-content").innerHTML = `<p class="eyebrow">小伙伴陪你加一加、减一减</p><div class="equation">${q.a} ${q.op} ${q.b} = ?</div><p class="subtitle">${q.op === "+" ? "拿来一些，合在一起。" : "拿走一些，看看还剩多少。"}</p>`;
    answerChoices(q, state.limit).forEach(answer => {
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
          $("#feedback").textContent = `🌱 没关系，点下面的${object.name}解法，数一数再试。`;
          if (narrator.enabled) narrator.play(["retry"]);
        }
      };
      $("#answers").appendChild(button);
    });
  } else {
    $("#lesson-content").innerHTML = `${renderPicture(q.picture, q.hint)}<div class="word">${q.word}</div><p class="word-hint">${q.hint}</p>`;
  }
  if (narrator.enabled) narrator.play(questionTracks());
  continuousAudio.preload(questionTracks());
  const next = state.items[state.index + 1];
  if (next) continuousAudio.preload(state.subject === "math" ? [`n-${next.a}`, next.op === "+" ? "plus" : "minus", `n-${next.b}`, "question"] : [next.audio]);
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
  const object = COUNTING_OBJECTS.find(item => item.id === state.objectId);
  const objectTrack = `object-${object.id}`;
  let text, ids;
  if (step === 0) {
    text = `① 先放好 ${q.a} ${object.unit}${object.name}。点一点，每${object.unit}都会报数。`;
    ids = ["first", `n-${q.a}`, objectTrack];
  } else if (step === 1) {
    text = adding ? `② 再拿来 ${q.b} ${object.unit}${object.name}，带彩色底的是新来的。把它们合在一起！` : `② 拿走 ${q.b} ${object.unit}${object.name}。打叉的已经拿走，不用数它们。`;
    ids = [adding ? "bring" : "take", `n-${q.b}`, objectTrack, adding ? "together" : "left"];
  } else {
    text = `③ ${adding ? "一共有" : "还剩"} ${q.answer} ${object.unit}${object.name}！${q.a} ${q.op} ${q.b} = ${q.answer}。${q.answer === 0 ? "一个也没有了，就是 0。" : "再点一点，一起数一次。"} `;
    ids = [adding ? "total" : "remains", `n-${q.answer}`, objectTrack, `n-${q.a}`, adding ? "plus" : "minus", `n-${q.b}`, "equals", `n-${q.answer}`];
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
    button.innerHTML = `${object.emoji}<small>${i + 1}</small>`;
    button.disabled = taken;
    button.setAttribute("aria-label", taken ? `已拿走的${object.name}` : `第 ${i + 1} ${object.unit}${object.name}`);
    button.onclick = () => {
      button.classList.add("counted");
      narrator.play([`n-${i + 1}`]);
    };
    $("#star-scene").appendChild(button);
  }
  if (number === 0) $("#star-scene").textContent = "0 · 一个也没有";
  if (narrator.enabled) narrator.play(ids);
  continuousAudio.preload(ids);
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  $("#stars").textContent = state.stars;
  renderSettings();
  $("#home-button").onclick = renderHome;
  $("#finish-button").onclick = renderHome;
  $("#pick-character").onclick = () => renderCharSelect("screen-home");
  $("#lesson-character").onclick = () => renderCharSelect("screen-lesson");
  continuousAudio.preload(["hello"]);
  $("#sound-button").onclick = () => {
    stopSong();
    if (!narrator.enabled) narrator.play(["hello"]);
    else {
      narrator.stop();
      narrator.enabled = false;
      updateSound();
    }
  };
  document.querySelectorAll("[data-subject]").forEach(button => {
    button.onclick = () => { stopSong(); state.subject = button.dataset.subject; renderSettings(); };
  });
  document.querySelectorAll("[data-count]").forEach(button => {
    button.onclick = () => { state.countMode = button.dataset.count; renderSettings(); };
  });
  $("#allow-repeat").onchange = event => { state.repeat = event.target.checked; renderSettings(); };
  document.querySelectorAll("[data-repeat]").forEach(button => {
    button.onclick = () => { state.ratio = Number(button.dataset.repeat); renderSettings(); };
  });
  document.querySelectorAll("[data-song-lang]").forEach(button => {
    button.onclick = () => { state.songLang = button.dataset.songLang; renderSongs(); };
  });
  $("#song-stop").onclick = () => { stopSong(); $("#song-status").textContent = "儿歌已暂停，点曲目可重新播放。"; };
  songAudio.onended = () => { $("#song-status").textContent = "这首儿歌唱完啦！"; };
  songAudio.onerror = () => { $("#song-status").textContent = "儿歌加载失败，请检查网络或查看来源页面。"; };
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
  document.addEventListener("visibilitychange", () => { if (document.hidden) { narrator.stop(); stopSong(); } });
});
