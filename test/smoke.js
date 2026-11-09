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
  res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "text/html");
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
      const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
      return response.result.value;
    };
    const url = `http://127.0.0.1:${server.address().port}/index.html`;
    const navigation = await send("Page.navigate", { url });
    for (let n = 0; n < 50 && !(await run("document.readyState === 'complete' && typeof renderHome === 'function'")); n++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(await run("document.querySelector('#screen-home') !== null"), `Page not loaded: ${JSON.stringify(navigation)}, ${await run("location.href + ': ' + document.body?.textContent?.slice(0, 100)")}`);
    assert.equal(await run("document.querySelector('#screen-home').classList.contains('active')"), true);
    assert.equal(await run("CHARACTERS.length"), 10);
    await run("document.querySelector('#btn-pick-char').click()");
    assert.equal(await run("document.querySelectorAll('.char-card').length"), 10);
    await run("document.querySelectorAll('.char-card')[1].click(); renderHome()");
    assert.equal(await run("localStorage.getItem('smartkid_char')"), "bunny");

    for (const subject of ["zh", "math", "en"]) {
      for (const age of [3, 4, 5, 6]) {
        await run(`document.querySelector('[data-age="${age}"]').click(); document.querySelector('#subject-row [data-subject="${subject}"]').click(); document.querySelector('#btn-start').click()`);
        assert.equal(await run("document.querySelector('#screen-menu').classList.contains('active')"), true);
        await run("document.querySelector('[data-mode=card]').click()");
        assert.equal(await run("document.querySelector('#card-progress').textContent.trim()"), `1 / ${await run("currentContent().cards.length")}`);
        await run("document.querySelector('#flashcard').click(); document.querySelector('#card-next').click()");
        assert.equal(await run("document.querySelector('#card-progress').textContent.trim().startsWith('2 /')"), true);
        await run("renderMenu(); document.querySelector('[data-mode=animate]').click()");
        assert.equal(await run("document.querySelectorAll('#animate-stage .anim-item').length"), 1);
        await run("renderMenu(); document.querySelector('[data-mode=phrase]').click()");
        assert.ok(await run("document.querySelector('#phrase-card').textContent.length") > 10);
        await run("document.querySelector('#phrase-next').click(); renderMenu(); document.querySelector('[data-mode=quiz]').click()");
        const before = await run("state.stars");
        await run("document.querySelectorAll('#quiz-options button')[currentContent().quiz[0].answer].click(); document.querySelectorAll('#quiz-options button')[currentContent().quiz[0].answer].click()");
        assert.equal(await run("state.stars"), before + 1, "double click must not award twice");
        await run("renderHome()");
      }
    }
    await run("state.subject = 'math'; state.age = 3; renderAnimate(); renderMenu()");
    const stars = await run("state.stars");
    await new Promise(resolve => setTimeout(resolve, 1400));
    assert.equal(await run("state.stars"), stars, "leaving animation must stop rewards");
    await run("renderAnimate()");
    await new Promise(resolve => setTimeout(resolve, 5800));
    assert.equal(await run("state.stars"), stars + 1, "completed animation should award one star");
    assert.equal(await run("document.querySelectorAll('#animate-stage .anim-item').length"), 5);
    for (const width of [320, 360, 1280]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 740, deviceScaleFactor: 2, mobile: width < 700 });
      for (const expression of [
        "(renderHome(), document.documentElement.scrollWidth <= window.innerWidth)",
        "(renderMenu(), document.documentElement.scrollWidth <= window.innerWidth)",
        "(renderQuiz(), document.documentElement.scrollWidth <= window.innerWidth)"
      ]) assert.equal(await run(expression), true, `${width}px horizontal overflow`);
    }
    console.log("OK: 12 age/subject flows, four modes, 10 companions, star rewards, timer cleanup, 320/360/1280px layouts");
  } finally {
    ws?.close();
    chrome.kill();
    if (chrome.exitCode === null) await new Promise(resolve => chrome.once("exit", resolve));
    server.close();
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
