const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const context = vm.createContext({ Blob, window: {} });
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/audio.js"), "utf8"), context);

async function main() {
  const samples = new Float32Array(1000);
  samples.fill(.003, 300, 400);
  samples.fill(.3, 400, 600);
  samples.fill(.003, 600, 700);
  context.recording = { sampleRate: 1000, getChannelData: () => samples };
  const trimmed = vm.runInContext("trimRecording(recording)", context);
  assert.equal(trimmed.length, 485, "remove long silence but retain phonetic safety margins");
  assert.equal(trimmed.filter(sample => sample > .002).length, 400, "quiet speech must not be removed");
  context.recording = { sampleRate: 1000, getChannelData: () => new Float32Array(100) };
  assert.equal(vm.runInContext("trimRecording(recording).length", context), 100, "do not create an invalid empty clip for silent input");
  context.samples = trimmed;
  const blob = vm.runInContext("encodeWave(samples, 1000)", context);
  const wave = Buffer.from(await blob.arrayBuffer());
  assert.equal(wave.subarray(0, 4).toString(), "RIFF");
  assert.equal(wave.readUInt32LE(40), trimmed.length * 2);
  assert.equal(wave.length, 44 + trimmed.length * 2);
  console.log("OK: trimmed silence, preserved quiet syllables, playable PCM WAV encoding");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
