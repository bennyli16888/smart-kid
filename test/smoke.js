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
  ], { stdio: "ignore" });
  let ws;
  try {
    const portFile = path.join(dir, "DevToolsActivePort");
    for (let n = 0; !fs.existsSync(portFile) && n < 100; n++) {
      if (chrome.exitCode !== null) throw new Error("Chromium exited before starting");
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(fs.existsSync(portFile), "Chromium did not start");
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
    const run = async expression => {
      const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
      if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
      return response.result.value;
    };
    const url = process.env.SITE_URL || `http://127.0.0.1:${server.address().port}/index.html`;
    const navigation = await send("Page.navigate", { url });
    for (let n = 0; n < 50 && !(await run("document.readyState === 'complete' && typeof renderHome === 'function'")); n++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(await run("document.querySelector('#screen-home') !== null"), `Page not loaded: ${JSON.stringify(navigation)}, ${await run("location.href + ': ' + document.body?.textContent?.slice(0, 100)")}`);
    assert.equal(await run("document.querySelector('#screen-home').classList.contains('active')"), true);
    assert.equal(await run("CHARACTERS.length"), 10);
    assert.equal(await run("narrator.enabled"), false, "do not attempt autoplay on page open");
    await run("document.querySelector('#sound-test').click()");
    for (let n = 0; n < 80 && !(await run("narrator.audio.currentTime > .1")); n++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal(await run("narrator.audio.currentTime > .1"), true, `bundled audio did not actually play: ${await run("document.querySelector('#sound-status').textContent")}`);
    assert.equal(await run("narrator.audio.error === null"), true);
    await run("narrator.play(['en-1-0'])");
    assert.equal(await run("narrator.audio.currentTime > .1 && narrator.audio.error === null"), true, "English MP3 must play");
    await run("narrator.play(['n-2', 'plus', 'n-3', 'question'])");
    assert.equal(await run("narrator.audio.src.endsWith('/question.mp3') && narrator.audio.currentTime > .1 && narrator.audio.error === null"), true, "math narration playlist must finish");
    assert.equal(await run("document.querySelector('#sound-status').textContent.includes('声音已开启')"), true);
    await run("document.querySelector('#sound-button').click()");
    assert.equal(await run("narrator.enabled"), false);
    assert.equal(await run("narrator.audio.paused"), true);
    await run("window.savedPlay = narrator.audio.play; narrator.audio.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); document.querySelector('#sound-test').click()");
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(await run("document.querySelector('#sound-status').textContent.includes('拦截')"), true);
    await run("narrator.audio.play = window.savedPlay; narrator.enabled = false; narrator.stop()");
    const themes = new Set();
    for (const id of await run("CHARACTERS.map(ch => ch.id)")) {
      await run(`document.querySelector('#pick-character').click(); document.querySelector('[data-char="${id}"]').click()`);
      await new Promise(resolve => setTimeout(resolve, 300));
      assert.equal(await run("localStorage.getItem('smartkid_char')"), id);
      assert.equal(await run("document.documentElement.dataset.character"), id);
      themes.add(await run("getComputedStyle(document.body).backgroundColor"));
    }
    assert.equal(themes.size, 10, "all companion themes must differ");
    for (const subject of ["zh", "math", "en"]) {
      for (const level of [1, 2, 3]) {
        for (const count of [10, 20, 30]) {
          await run(`renderHome(); document.querySelector('[data-subject="${subject}"]').click(); document.querySelector('[data-level="${level}"]').click(); document.querySelector('[data-count="${count}"]').click(); document.querySelector('#start-button').click()`);
          assert.equal(await run("state.items.length"), count);
          assert.equal(await run("document.querySelector('#lesson-progress').textContent"), `1 / ${count}`);
          if (subject === "math") {
            assert.equal(await run("state.items.every(q => q.a >= 0 && q.b > 0 && q.a <= state.level * 10 && q.b <= state.level * 10 && q.answer >= 0 && q.answer <= state.level * 10 && q.answer === (q.op === '+' ? q.a + q.b : q.a - q.b))"), true);
            assert.equal(await run("new Set(state.items.map(q => `${q.a}${q.op}${q.b}`)).size"), count, "math questions must not repeat");
          } else {
            assert.equal(await run("document.querySelector('#lesson-content svg').getAttribute('role')"), "img");
            assert.equal(await run("document.querySelector('#explain-button').hidden"), true);
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
      for (const expression of ["renderHome()", "renderCharSelect('screen-home')", "renderLesson()", "state.explanationStep = 1; renderExplanation()", "show('screen-results')"]) {
        await run(expression);
        assert.equal(await run("document.documentElement.scrollWidth <= window.innerWidth"), true, `${width}px horizontal overflow: ${expression}`);
      }
    }
    if (process.env.SCREENSHOT_DIR) {
      await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await run("document.querySelector('#sound-status').textContent = '先点上面的按钮，听听小伙伴的声音。'; renderHome()");
      await new Promise(resolve => setTimeout(resolve, 350));
      const image = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      fs.writeFileSync(path.join(process.env.SCREENSHOT_DIR, "smartkid-home.png"), Buffer.from(image.data, "base64"));
      await run("state.subject='en'; state.level=1; startLesson()");
      await new Promise(resolve => setTimeout(resolve, 350));
      const lessonImage = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      fs.writeFileSync(path.join(process.env.SCREENSHOT_DIR, "smartkid-english.png"), Buffer.from(lessonImage.data, "base64"));
    }
    console.log("OK: real MP3 playback, autoplay-block handling, 10 themes, 27 subject/difficulty/count flows, math solutions, 320/360/1280px layouts");
  } finally {
    ws?.close();
    chrome.kill();
    if (chrome.exitCode === null) await new Promise(resolve => chrome.once("exit", resolve));
    server.close();
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
