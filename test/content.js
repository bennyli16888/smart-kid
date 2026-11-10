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
      assert.equal(new Set(items.map(item => item.word)).size, count, "unchecked repetition must never duplicate words");
      for (const item of items) {
        const svg = evaluate(`renderPicture('${item.picture}', '${item.word}')`);
        assert.ok(svg.includes('<svg') && svg.includes('role="img"'));
        assert.ok(!svg.includes("undefined"));
      }
    }
  }
}
for (const subject of ["zh", "en"]) for (const level of [1, 2, 3]) {
  for (const ratio of [.1, .2, .3]) for (const count of [1, 7, 10, 20, 30]) {
    const items = evaluate(`generateLesson('${subject}', ${level}, ${count}, { repeat: true, ratio: ${ratio} })`);
    assert.equal(items.length, count);
    assert.equal(count - new Set(items.map(item => item.word)).size, Math.round(count * ratio), "exact repeat ratio including rounding");
  }
  const expanded = evaluate(`generateLesson('${subject}', ${level}, 40, { repeat: true, ratio: .3 })`);
  assert.equal(expanded.length, 40);
  assert.equal(new Set(expanded.map(item => item.word)).size, 28);
  assert.throws(() => evaluate(`generateLesson('${subject}', ${level}, 31)`), /30/);
}
for (const count of [0, -1, 2.5, 101]) assert.throws(() => evaluate(`generateLesson('zh', 1, ${count})`), /整数/);
assert.throws(() => evaluate("generateLesson('zh', 1, 10, {repeat: true, ratio: .5})"), /比例/);
for (const limit of [1, 7, 37, 100]) {
  const count = Math.min(100, limit * (limit + 1));
  const items = evaluate(`generateLesson('math', 1, ${count}, {limit: ${limit}})`);
  assert.equal(items.length, count);
  assert.equal(new Set(items.map(q => `${q.a}${q.op}${q.b}`)).size, count);
  assert.ok(items.every(q => q.a <= limit && q.b <= limit && q.answer >= 0 && q.answer <= limit));
}
assert.throws(() => evaluate("generateLesson('math', 1, 3, {limit: 1})"), /只有 2/);
for (const limit of [0, 101, 2.5]) assert.throws(() => evaluate(`generateLesson('math', 1, 10, {limit: ${limit}})`), /整数/);
const provenance = JSON.parse(fs.readFileSync(path.join(__dirname, "../audio/provenance.json"), "utf8"));
for (const track of evaluate("audioTracks()")) {
  const bytes = fs.readFileSync(path.join(__dirname, `../audio/${track.id}.mp3`));
  assert.ok(bytes.length > 500, track.id);
  assert.ok((bytes[0] === 255 && (bytes[1] & 224) === 224) || bytes.subarray(0, 3).toString() === "ID3", track.id);
  const entry = provenance.tracks[track.id];
  assert.equal(entry?.text, track.text, `locally generated narration required: ${track.id}`);
  assert.equal(entry.sha256, require("node:crypto").createHash("sha256").update(bytes).digest("hex"), track.id);
}
console.log("OK: arithmetic bounds, expanded vocabulary, exact repeat ratios, custom sizes/ranges, generated narration provenance");
