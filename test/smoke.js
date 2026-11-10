// node test/smoke.js (requires Chromium, no npm dependencies)
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent((req.url || "/").split("?")[0]));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.setHeader("Content-Type", file.endsWith(".mp3") ? "audio/mpeg" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "text/html");
  fs.createReadStream(file).pipe(res);
});

async function main() {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "smartkid-browser-"));
  const chrome = spawn("chromium-browser", [
    "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--disable-extensions",
    "--remote-debugging-port=0", `--user-data-dir=${dir}`, "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let browserLog = "";
  chrome.stderr.on("data", data => { browserLog += data; });
  let ws, closeBrowser;
  try {
    const portFile = path.join(dir, "DevToolsActivePort");
    for (let n = 0; !fs.existsSync(portFile) && n < 300; n++) {
      if (chrome.exitCode !== null) throw new Error(`Chromium exited before starting: ${browserLog}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(fs.existsSync(portFile), `Chromium did not start: ${browserLog}`);
    const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const tab = tabs.find(item => item.type === "page" && item.url === "about:blank") || tabs.find(item => item.type === "page");
    assert.ok(tab, "Chromium page target not found");
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", ({ data }) => {
      const msg = JSON.parse(data);
      if (!msg.id || !pending.has(msg.id)) return;
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
    closeBrowser = () => send("Browser.close");
    const run = async expression => {
      const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
      if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
      return response.result.value;
    };
    const url = process.env.SITE_URL || `http://127.0.0.1:${server.address().port}/index.html`;
    const navigation = await send("Page.navigate", { url });
    for (let n = 0; n < 50 && !(await run("document.readyState === 'complete' && typeof renderHome === 'function' && window.appReady")); n++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await run("window.appReady");
    assert.ok(await run("document.querySelector('#screen-home') !== null"), `Page not loaded: ${JSON.stringify(navigation)}, ${await run("location.href + ': ' + document.body?.textContent?.slice(0, 100)")}`);
    assert.equal(await run("document.querySelector('#screen-home').classList.contains('active')"), true);
    assert.equal(await run("CHARACTERS.length"), 10);
    assert.equal(await run("narrator.enabled"), false, "do not attempt autoplay on page open");
    assert.equal(await run("COUNTING_OBJECTS.length"), 9, "math explanation has nine objects");
    assert.deepEqual(await run("[...document.querySelectorAll('#voice-options [data-voice]')].map(button => [button.dataset.voice, button.disabled])"), [["XiaoYu", false], ["XiaoYou", false], ["XiaoXia", true], ["XiaoRou", true]], "only voices with uploaded audio are selectable");
    await run("window.buttonSoundCalls = 0; window.originalButtonSoundPlay = buttonSound.play; buttonSound.play = function() { if (narrator.enabled) window.buttonSoundCalls++; return window.originalButtonSoundPlay.call(this); }");
    assert.equal(await run("document.querySelector('.sound-panel, #sound-test, .voice-note')"), null, "remove the sound preview and voice description panel");
    assert.equal(await run("document.querySelector('[data-subject=songs], #song-settings')"), null, "remove the songs section");
    assert.equal(await run("document.querySelector('#screen-home #object-settings')"), null, "object choices belong in the lesson, not home settings");
    if (fs.existsSync(path.join(root, "audio/voices/XiaoYu/hello.mp3"))) {
      await run("document.querySelector('#sound-button').click()");
      for (let n = 0; n < 80 && !(await run("narrator.audio.currentTime > .1")); n++) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.equal(await run("narrator.audio.currentTime > .1"), true, `bundled audio did not actually play: ${await run("document.querySelector('#sound-status').textContent")}`);
      assert.equal(await run("narrator.audio.error === null"), true);
      await run("narrator.play(['en-1-0'])");
      assert.equal(await run("narrator.audio.currentTime > .1 && narrator.audio.error === null"), true, "English MP3 must play");
      await run("narrator.play(['n-2', 'plus', 'n-3', 'question'])");
      assert.equal(await run("narrator.audio.src.startsWith('blob:') && narrator.audio.currentTime > .1 && narrator.audio.error === null"), true, "math narration must finish as one continuous clip");
      const timing = await run("continuousAudio.prepare(['n-2', 'plus', 'n-3', 'question']).then(p => ({before: p.originalDuration, after: p.duration}))");
      assert.ok(timing.after <= timing.before + .1, "continuous narration must not introduce long pauses");
      console.log(`Math audio: ${timing.before.toFixed(2)}s → ${timing.after.toFixed(2)}s (including all words)`);
      assert.equal(await run("continuousAudio.prepare(['n-2', 'plus', 'n-3', 'question']).then(async p => p.url === (await continuousAudio.prepare(['n-2', 'plus', 'n-3', 'question'])).url)"), true, "replay reuses prepared audio");
      assert.equal(await run("document.querySelector('#voice-profile')"), null);
      assert.equal(await run("narrator.audio.playbackRate"), 1, "fixed voice must not be pitch-shifted or sped up");
      await run("window.nativeFetch = window.fetch; window.voiceFetchPaths = []; window.fetch = (input, ...args) => { window.voiceFetchPaths.push(new URL(input, location.href).pathname); return window.nativeFetch(input, ...args); }");
      await run("continuousAudio.recording('en-1-0', 'XiaoYou')");
      assert.ok(await run("window.voiceFetchPaths.includes('/audio/voices/XiaoYou/en-1-0.mp3')"), "selected voice loads its own audio directory");
      await run("window.voiceFetchPaths.length = 0; continuousAudio.recording('n-82', 'XiaoYou')");
      assert.deepEqual(await run("window.voiceFetchPaths"), ["/audio/voices/XiaoYou/n-82.mp3", "/audio/voices/XiaoYu/n-82.mp3"], "missing selected-voice tracks fall back to XiaoYu");
      await run("document.querySelector('#voice-picker-button').click()");
      assert.equal(await run("document.querySelector('#voice-menu').hidden"), false, "voice control opens its choices");
      await run("document.querySelector('[data-voice=XiaoYou]').click()");
      assert.equal(await run("state.voiceId === 'XiaoYou' && localStorage.getItem('smartkid_voice') === 'XiaoYou' && document.querySelector('#voice-menu').hidden"), true, "voice selection is saved and the menu collapses");
      await run("document.querySelector('#voice-picker-button').click(); document.querySelector('[data-voice=XiaoYu]').click()");
      assert.equal(await run("state.voiceId === 'XiaoYu' && localStorage.getItem('smartkid_voice') === 'XiaoYu'"), true, "XiaoYu remains the default voice");
      await run("window.buttonSoundCalls = 0");
      const invalidRecordings = await run(`(async () => {
        const invalid = [];
        for (const track of audioTracks()) {
          try {
            const recording = await continuousAudio.recording(track.id);
            if (recording.samples.length < 2400 || !recording.samples.some(sample => Math.abs(sample) > .01)) invalid.push(track.id);
          } catch { invalid.push(track.id); }
        }
        return invalid;
      })()`);
      assert.deepEqual(invalidRecordings, [], "every generated narration asset must decode and contain audible samples");
      await run("narrator.play(['hello']); window.OfflineDecoder = window.OfflineAudioContext; window.OfflineAudioContext = undefined; window.LegacyOfflineDecoder = window.webkitOfflineAudioContext; window.webkitOfflineAudioContext = undefined; narrator.play(['n-2'])");
      for (let n = 0; n < 40 && !(await run("new URL(narrator.audio.src).pathname.endsWith('/n-2.mp3') && narrator.audio.currentTime > .1")); n++) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.equal(await run("new URL(narrator.audio.src).pathname.endsWith('/n-2.mp3') && narrator.audio.currentTime > .1"), true, "old browsers retain original MP3 playback");
      await run("window.OfflineAudioContext = window.OfflineDecoder; window.webkitOfflineAudioContext = window.LegacyOfflineDecoder; narrator.play(['n-2'])");
      assert.equal(await run("document.querySelector('#sound-status').hidden && document.querySelector('#sound-status').textContent === ''"), true, "normal playback must not show a sound status block");
      await run("document.querySelector('#sound-button').click()");
      assert.equal(await run("narrator.enabled"), false);
      assert.equal(await run("window.buttonSoundCalls"), 1, "an enabled sound plays a click chime when muted");
      assert.equal(await run("narrator.audio.paused"), true);
      assert.equal(await run("document.querySelector('#sound-status').hidden && document.querySelector('#sound-status').textContent === ''"), true, "muting must not display the removed sound-off message");
      await run("narrator.enabled = true; updateSound(); document.querySelector('#home-button').click(); narrator.enabled = false; updateSound(); document.querySelector('#home-button').click()");
      assert.equal(await run("window.buttonSoundCalls"), 2, "ordinary buttons chime only while sound is enabled");
      await run("document.querySelector('#start-button').click(); document.querySelector('#home-button').click()");
      assert.equal(await run("window.buttonSoundCalls"), 2, "clicks while muted do not play a chime");
      await run("document.querySelector('#start-button').click(); window.savedPlay = narrator.audio.play; narrator.audio.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); document.querySelector('#listen-button').click()");
      await new Promise(resolve => setTimeout(resolve, 100));
      assert.equal(await run("document.querySelector('#sound-status').getClientRects().length > 0 && document.querySelector('#sound-status').textContent.includes('拦截')"), true, "playback errors remain visible in the lesson");
      await run("narrator.audio.play = window.savedPlay; narrator.play(questionTracks())");
      assert.equal(await run("narrator.enabled && narrator.audio.currentTime > .1 && document.querySelector('#sound-status').hidden"), true, "listen still enables playback and clears the error after removing the preview panel");
      await run("document.querySelector('#sound-button').click(); renderHome()");
      assert.equal(await run("window.buttonSoundCalls"), 3, "buttons keep playing chimes while sound is enabled");
      assert.ok(await run("buttonSound.context instanceof AudioContext"), "click chime uses the Web Audio API");
    } else {
      await run("document.querySelector('#sound-button').click()");
      assert.equal(await run("narrator.enabled"), true, "sound switch stays usable without narration assets");
      for (let n = 0; n < 40 && !(await run("document.querySelector('#sound-status').textContent.includes('新语音尚未安装')")); n++) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.equal(await run("document.querySelector('#sound-status').textContent.includes('新语音尚未安装')"), true);
      await run("document.querySelector('#sound-button').click()");
      assert.equal(await run("narrator.enabled"), false);
      assert.equal(await run("window.buttonSoundCalls"), 1, "button chime plays on mute while sound is enabled");
      assert.ok(await run("buttonSound.context instanceof AudioContext"), "click chime uses the Web Audio API");
      await run("narrator.play = () => {}");
    }
    const themes = new Set();
    for (const id of await run("CHARACTERS.map(ch => ch.id)")) {
      await run(`document.querySelector('#pick-character').click(); document.querySelector('[data-char="${id}"]').click()`);
      await new Promise(resolve => setTimeout(resolve, 300));
      assert.equal(await run("localStorage.getItem('smartkid_char')"), id);
      assert.equal(await run("document.documentElement.dataset.character"), id);
      assert.equal(await run("new Set([...document.querySelectorAll('.subject-button')].map(button => getComputedStyle(button).backgroundColor)).size"), 3, `${id}: all three subject cards must have distinct colors`);
      assert.equal(await run("new Set([...document.querySelectorAll('#count-row button')].map(button => getComputedStyle(button).backgroundColor)).size"), 3, `${id}: learning options use distinct coordinated colors`);
      themes.add(await run("getComputedStyle(document.body).backgroundColor"));
    }
    assert.equal(themes.size, 10, "all companion themes must differ");
    for (const subject of ["zh", "math", "en"]) {
      for (const level of [1, 2, 3]) {
        for (const count of [10, 20, 30]) {
          await run(`renderHome(); document.querySelector('[data-subject="${subject}"]').click(); document.querySelector('[data-level="${level}"]').click(); document.querySelector('[data-count="${count === 30 ? "custom" : count}"]').click(); document.querySelector('#custom-count').value = '30'; document.querySelector('#start-button').click()`);
          assert.equal(await run("state.items.length"), count);
          assert.equal(await run("document.querySelector('#lesson-progress').textContent"), `1 / ${count}`);
          if (subject === "math") {
            assert.equal(await run("state.items.every(q => q.a >= 0 && q.b > 0 && q.a <= state.level * 10 && q.b <= state.level * 10 && q.answer >= 0 && q.answer <= state.level * 10 && q.answer === (q.op === '+' ? q.a + q.b : q.a - q.b))"), true);
            assert.equal(await run("new Set(state.items.map(q => `${q.a}${q.op}${q.b}`)).size"), count, "math questions must not repeat");
            assert.equal(await run("new Set([...document.querySelectorAll('.answer')].map(button => getComputedStyle(button).backgroundColor)).size"), 4, "math answers use four coordinated colors");
          } else {
            assert.equal(await run("new Set(state.items.map(item => item.word)).size"), count, "words must not repeat by default");
            assert.equal(await run("document.querySelector('#lesson-content svg').getAttribute('role')"), "img");
            assert.equal(await run("document.querySelector('#explain-actions').hidden && document.querySelector('#object-settings').hidden"), true);
          }
          const before = await run("state.stars");
          await run(`for(let i=0; i<${count}; i++) {
            if(state.subject === 'math') {
              const button = [...document.querySelectorAll('.answer')].find(b => Number(b.textContent) === currentQuestion().answer);
              button.click(); button.click();
            }
            document.querySelector('#next-button').click();
          }`);
          assert.equal(await run("document.querySelector('#screen-results').classList.contains('active')"), true);
          assert.equal(await run("state.stars"), before + count, "exactly one star per item");
        }
      }
    }
    await run("renderHome(); document.querySelector('[data-subject=zh]').click(); document.querySelector('[data-count=custom]').click(); document.querySelector('#custom-count').value = '31'; document.querySelector('#start-button').click()");
    assert.equal(await run("document.querySelector('#screen-home').classList.contains('active')"), true);
    assert.equal(await run("document.querySelector('#settings-error').textContent.includes('30')"), true, "oversized unique lessons must be explained, not silently repeated");
    await run("document.querySelector('#allow-repeat').click()");
    assert.equal(await run("document.querySelector('#repeat-options').hidden"), false);
    await run("document.querySelector('[data-repeat=\"0.3\"]').click(); document.querySelector('#custom-count').value = '40'; document.querySelector('#start-button').click()");
    assert.equal(await run("state.items.length"), 40);
    assert.equal(await run("new Set(state.items.map(item => item.word)).size"), 28);
    await run("renderHome(); document.querySelector('#allow-repeat').click()");
    assert.equal(await run("document.querySelector('#repeat-options').hidden"), true);
    await run("document.querySelector('[data-subject=math]').click(); document.querySelector('[data-level=\"3\"]').click(); document.querySelector('#custom-range').value = '37'; document.querySelector('#custom-count').value = '17'; document.querySelector('#start-button').click()");
    assert.equal(await run("state.items.length"), 17);
    assert.equal(await run("state.limit"), 37);
    assert.equal(await run("state.items.every(q => q.a <= 37 && q.b <= 37 && q.answer <= 37 && q.answer >= 0)"), true);
    for (const value of ["0", "101", "2.5", ""]) {
      await run(`renderHome(); document.querySelector('#custom-range').value = '${value}'; document.querySelector('#start-button').click()`);
      assert.equal(await run("document.querySelector('#screen-home').classList.contains('active') && document.querySelector('#settings-error').textContent.includes('整数')"), true);
    }
    await run("document.querySelector('#custom-range').value = '1'; document.querySelector('#custom-count').value = '3'; document.querySelector('#start-button').click()");
    assert.equal(await run("document.querySelector('#settings-error').textContent.includes('只有 2')"), true);
    await run("document.querySelector('#custom-range').value = '37'; document.querySelector('#custom-count').value = '10'; document.querySelector('#start-button').click(); state.items[0] = {a:2,b:3,op:'+',answer:5}; renderLesson()");
    assert.equal(await run("state.objectId === 'candy' && document.querySelector('#explain-button').getAttribute('aria-label').includes('五彩糖果')"), true, "default explanation object is colorful candy");
    assert.equal(await run("document.querySelectorAll('#object-settings [data-object]').length"), 9, "lesson offers exactly nine explanation objects");
    assert.equal(await run("document.querySelector('#object-settings').hidden && document.querySelector('#change-object').getAttribute('aria-expanded') === 'false'"), true, "object choices are initially collapsed");
    assert.equal(await run("document.querySelector('#change-object').getBoundingClientRect().left >= document.querySelector('#explain-button').getBoundingClientRect().right"), true, "change-object button is to the right of explain");
    await run("document.querySelector('#change-object').click()");
    assert.equal(await run("!document.querySelector('#object-settings').hidden && document.querySelector('#change-object').getAttribute('aria-expanded') === 'true'"), true);
    await run("document.querySelector('#change-object').click()");
    assert.equal(await run("document.querySelector('#object-settings').hidden"), true, "the same button closes the choices without changing the object");
    await run("document.querySelector('#explain-button').click(); document.querySelector('#explain-next').click(); [...document.querySelectorAll('.answer')].find(b => Number(b.textContent) === currentQuestion().answer).click()");
    const lessonBeforeObjectChange = await run("({question:currentQuestion(), index:state.index, stars:state.stars, step:state.explanationStep})");
    await run("window.savedNarratorPlay = narrator.play; narrator.play = ids => { window.lastNarration = ids; }; narrator.enabled = true");
    for (const object of await run("COUNTING_OBJECTS.map(item => ({id:item.id, name:item.name, emoji:item.emoji}))")) {
      await run(`document.querySelector('#change-object').click(); document.querySelector('[data-object="${object.id}"]').click()`);
      assert.equal(await run(`state.objectId === '${object.id}' && document.querySelector('[data-object="${object.id}"]').getAttribute('aria-pressed') === 'true'`), true);
      assert.equal(await run("document.querySelector('#object-settings').hidden && document.querySelector('#change-object').getAttribute('aria-expanded') === 'false'"), true, "choosing an object collapses the choices");
      assert.equal(await run(`document.querySelector('#explain-text').textContent.includes('${object.name}')`), true);
      assert.equal(await run(`[...document.querySelectorAll('.star-token')].every(b => b.textContent.includes('${object.emoji}'))`), true);
      assert.deepEqual(await run("window.lastNarration"), ["bring", "n-3", `object-${object.id}`, "together"], "visible explanation and narration use the newly selected object");
      assert.deepEqual(await run("({question:currentQuestion(), index:state.index, stars:state.stars, step:state.explanationStep})"), lessonBeforeObjectChange, "changing objects preserves the question, reward and explanation step");
      assert.equal(await run("state.completed.has(state.index) && !document.querySelector('#next-button').disabled"), true, "changing objects must not reset a completed answer");
    }
    await run("narrator.play = window.savedNarratorPlay; narrator.enabled = false; updateSound()");
    await run("renderHome(); document.querySelector('[data-subject=math]').click(); document.querySelector('[data-level=\"1\"]').click(); document.querySelector('#start-button').click()");
    const stars = await run("state.stars");
    await run("[...document.querySelectorAll('.answer')].find(b => Number(b.textContent) !== currentQuestion().answer).click()");
    assert.equal(await run("state.stars"), stars, "wrong answer must not award stars");
    assert.equal(await run("document.querySelector('#next-button').disabled"), true);
    for (const q of [{ a: 2, b: 3, op: "+", answer: 5 }, { a: 5, b: 2, op: "−", answer: 3 }, { a: 1, b: 1, op: "−", answer: 0 }, { a: 0, b: 2, op: "+", answer: 2 }]) {
      await run(`state.items[0] = ${JSON.stringify(q)}; renderLesson(); document.querySelector('#explain-button').click()`);
      assert.equal(await run("document.querySelectorAll('.star-token').length"), q.a);
      await run("document.querySelector('#explain-next').click()");
      assert.equal(await run("document.querySelectorAll('.star-token.taken').length"), q.op === "−" ? q.b : 0);
      assert.equal(await run("document.querySelectorAll('.star-token.added').length"), q.op === "+" ? q.b : 0);
      await run("document.querySelector('#explain-next').click()");
      assert.equal(await run("document.querySelectorAll('.star-token:not(.taken)').length"), q.answer);
      assert.equal(await run("document.querySelector('#explain-text').textContent.includes('= ' + currentQuestion().answer)"), true);
    }
    await run("document.querySelector('#lesson-character').click(); document.querySelector('[data-char=bunny]').click()");
    assert.equal(await run("document.querySelector('#screen-lesson').classList.contains('active')"), true, "changing companion must preserve lesson");
    assert.equal(await run("document.documentElement.dataset.character"), "bunny");
    await run("narrator.enabled = false; updateSound(); renderHome()");
    for (const width of [320, 360, 1280]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 740, deviceScaleFactor: 2, mobile: width < 700 });
      for (const expression of ["renderHome()", "state.subject = 'math'; renderHome()", "renderCharSelect('screen-home')", "renderLesson()", "document.querySelector('#change-object').click()", "state.explanationStep = 1; renderExplanation()", "show('screen-results')"]) {
        await run(expression);
        assert.equal(await run("document.documentElement.scrollWidth <= window.innerWidth"), true, `${width}px horizontal overflow: ${expression}`);
      }
      await run("renderLesson()");
      assert.equal(await run("document.querySelector('#change-object').getBoundingClientRect().left >= document.querySelector('#explain-button').getBoundingClientRect().right"), true, `${width}px: object switch stays to the right of explain`);
    }
    if (process.env.SCREENSHOT_DIR) {
      await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await run("state.charId='dino'; applyTheme(); state.subject='math'; state.level=1; state.countMode='10'; state.objectId='candy'; renderHome()");
      await new Promise(resolve => setTimeout(resolve, 350));
      const image = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      fs.writeFileSync(path.join(process.env.SCREENSHOT_DIR, "smartkid-home.png"), Buffer.from(image.data, "base64"));
      await run("startLesson(); state.items[0]={a:2,b:3,op:'+',answer:5}; renderLesson(); document.querySelector('#explain-button').click(); document.querySelector('#change-object').click()");
      await new Promise(resolve => setTimeout(resolve, 350));
      const mathImage = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      fs.writeFileSync(path.join(process.env.SCREENSHOT_DIR, "smartkid-math-objects.png"), Buffer.from(mathImage.data, "base64"));
      await run("state.subject='en'; state.level=1; startLesson()");
      await new Promise(resolve => setTimeout(resolve, 350));
      const lessonImage = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      fs.writeFileSync(path.join(process.env.SCREENSHOT_DIR, "smartkid-english.png"), Buffer.from(lessonImage.data, "base64"));
    }
    console.log("OK: fixed narration, continuous audio, cached replay, MP3 fallback, autoplay handling, 10 colorful themes, custom lessons/ranges/repeats, in-lesson object picker, preserved explanation progress, responsive layouts");
  } finally {
    if (closeBrowser && ws?.readyState === WebSocket.OPEN) await closeBrowser();
    ws?.close();
    if (chrome.exitCode === null) await new Promise(resolve => {
      const timer = setTimeout(() => chrome.kill(), 5000);
      chrome.once("exit", () => { clearTimeout(timer); resolve(); });
    });
    server.close();
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
