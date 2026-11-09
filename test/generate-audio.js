// Optional asset regeneration: node test/generate-audio.js
// Only the public teaching words/phrases are sent to the pronunciation service.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const exec = promisify(execFile);
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/data.js"), "utf8") + ";this.tracks=audioTracks()", context);
const directory = path.join(__dirname, "../audio");
fs.mkdirSync(directory, { recursive: true });

async function main() {
  const queue = context.tracks.slice();
  const worker = async () => {
    while (queue.length) {
      const track = queue.shift();
      const target = path.join(directory, `${track.id}.mp3`);
      if (fs.existsSync(target)) continue;
      await exec("curl", ["--fail", "--silent", "--show-error", "--location", "--max-time", "30", "--retry", "2", "--get",
        "https://translate.google.com/translate_tts", "--data-urlencode", "ie=UTF-8",
        "--data-urlencode", "client=tw-ob", "--data-urlencode", `tl=${track.lang}`,
        "--data-urlencode", `q=${track.text}`, "--output", target]);
      const bytes = fs.readFileSync(target);
      if (bytes.length < 500 || !((bytes[0] === 255 && (bytes[1] & 224) === 224) || bytes.subarray(0, 3).toString() === "ID3")) {
        fs.unlinkSync(target);
        throw new Error(`Invalid MP3: ${track.id}`);
      }
      console.log(track.id);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  console.log(`${context.tracks.length} bundled pronunciation files ready`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
