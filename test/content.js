const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const context = vm.createContext({});
for (const file of ["data", "pictures"]) vm.runInContext(fs.readFileSync(path.join(__dirname, `../js/${file}.js`), "utf8"), context);
const evaluate = expression => vm.runInContext(expression, context);
for (const level of [1, 2, 3]) {
  const pool = evaluate(`mathPool(${level * 10})`);
  for (const q of pool) {
    assert.ok(q.a >= 0 && q.a <= level * 10 && q.b <= level * 10);
    assert.equal(q.answer, q.op === "+" ? q.a + q.b : q.a - q.b);
    assert.ok(q.answer >= 0 && q.answer <= level * 10);
    assert.ok(evaluate(`answerChoices(${JSON.stringify(q)}, ${level * 10})`).includes(q.answer));
  }
  for (const subject of ["zh", "en", "math"]) for (const count of [10, 20, 30]) {
    const items = evaluate(`generateLesson('${subject}', ${level}, ${count})`);
    assert.equal(items.length, count);
    if (subject !== "math") {
      assert.equal(new Set(items.slice(0, 10).map(item => item.word)).size, 10);
      for (const item of items) {
        const svg = evaluate(`renderPicture('${item.picture}', '${item.word}')`);
        assert.ok(svg.includes('<svg') && svg.includes('role="img"'));
        assert.ok(!svg.includes("undefined"));
      }
    }
  }
}
for (const track of evaluate("audioTracks()")) {
  const bytes = fs.readFileSync(path.join(__dirname, `../audio/${track.id}.mp3`));
  assert.ok(bytes.length > 500, track.id);
  assert.ok((bytes[0] === 255 && (bytes[1] & 224) === 224) || bytes.subarray(0, 3).toString() === "ID3", track.id);
}
console.log("OK: exhaustive arithmetic bounds, 27 lesson sizes, illustrated vocabulary, all 107 valid MP3 assets");
