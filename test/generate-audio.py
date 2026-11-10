"""Generate site narration locally; no text is sent to a speech service."""
import argparse
import gc
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

os.environ.setdefault("HF_HUB_DISABLE_XET", "1")

import imageio_ffmpeg
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT = Path(__file__).resolve().parents[1]
DESIGN = "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
BASE = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"
REFERENCE_TEXT = (
    "你好！我是你的学习小伙伴。一起快乐地学中文，数一数，再试一次。"
    "Hello! Let's learn and play together!"
)
VOICE_DESCRIPTION = (
    "一个虚构的儿童学习伙伴的合成童声，清亮活泼、友善温暖，"
    "自然的儿童音色，语气有好奇心和鼓励感，发音清楚，语速适中，"
    "情绪起伏自然，不夸张、不尖锐。标准普通话和清晰的英语。"
    "不模仿任何真实人物。"
)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--only", help="Generate comma-separated track IDs")
    parser.add_argument("--force", action="store_true", help="Regenerate matching tracks")
    args = parser.parse_args()
    torch.set_num_threads(args.threads)
    torch.manual_seed(42)
    tracks = json.loads(subprocess.check_output([
        "node", "-e",
        "const fs=require('node:fs'),vm=require('node:vm');"
        "const c=vm.createContext({});"
        "vm.runInContext(fs.readFileSync('js/data.js','utf8'),c);"
        "console.log(JSON.stringify(vm.runInContext('audioTracks()',c)))"
    ], cwd=ROOT, text=True))
    if args.only:
        selected = set(args.only.split(","))
        tracks = [track for track in tracks if track["id"] in selected]
        if {track["id"] for track in tracks} != selected:
            parser.error("Unknown audio track")
    directory = ROOT / "audio"
    provenance_file = directory / "provenance.json"
    provenance = json.loads(provenance_file.read_text()) if provenance_file.exists() else {
        "design_model": DESIGN, "narration_model": BASE,
        "model_license": "Apache-2.0",
        "model_source": "https://huggingface.co/" + BASE,
        "voice_description": VOICE_DESCRIPTION,
        "reference_text": REFERENCE_TEXT,
        "note": "Original synthetic voice; no recording of a real person was used.",
        "tracks": {}
    }
    remaining = []
    for track in tracks:
        target = directory / (track["id"] + ".mp3")
        previous = provenance["tracks"].get(track["id"], {})
        if (not args.force and previous.get("text") == track["text"]
                and previous.get("spoken_text") == spoken_text(track) and target.exists()
                and previous.get("sha256") == hashlib.sha256(target.read_bytes()).hexdigest()):
            continue
        remaining.append(track)
    if not remaining:
        print("All requested tracks already generated.", flush=True)
        return
    reference = directory / "voice-reference.wav"
    if not reference.exists():
        print("Loading voice design model on CPU…", flush=True)
        model = Qwen3TTSModel.from_pretrained(
            DESIGN, device_map="cpu", dtype=torch.float32, attn_implementation="eager"
        )
        with torch.inference_mode():
            wavs, rate = model.generate_voice_design(
                text=REFERENCE_TEXT, language="Auto", instruct=VOICE_DESCRIPTION,
                max_new_tokens=600
            )
        sf.write(reference, wavs[0], rate)
        del model
        gc.collect()
        print("Original synthetic reference saved.", flush=True)
    print("Loading reusable narration model on CPU…", flush=True)
    model = Qwen3TTSModel.from_pretrained(
        BASE, device_map="cpu", dtype=torch.float32, attn_implementation="eager"
    )
    print("Preparing the fixed voice reference…", flush=True)
    prompt = model.create_voice_clone_prompt(
        ref_audio=str(reference), ref_text=REFERENCE_TEXT
    )
    print("Fixed voice reference ready.", flush=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    remaining.sort(key=lambda track: (track["lang"], len(track["text"])))
    for start in range(0, len(remaining), 16):
        batch = remaining[start:start + 16]
        torch.manual_seed(42 + start)
        print(f"{start + 1}–{start + len(batch)}/{len(remaining)}: "
              + ", ".join(track["id"] for track in batch), flush=True)
        with torch.inference_mode():
            wavs, rate = model.generate_voice_clone(
                text=[spoken_text(track) for track in batch],
                language=["Chinese" if track["lang"].startswith("zh") else "English" for track in batch],
                voice_clone_prompt=prompt,
                max_new_tokens=max(80, min(600, max(len(track["text"]) for track in batch) * 15))
            )
        if len(wavs) != len(batch):
            raise RuntimeError("Model returned an incomplete audio batch")
        for track, wav in zip(batch, wavs):
            target = directory / (track["id"] + ".mp3")
            with tempfile.TemporaryDirectory(prefix="smartkid-tts-") as temp:
                source = Path(temp) / "recording.wav"
                encoded = Path(temp) / "recording.mp3"
                sf.write(source, wav, rate)
                subprocess.run([
                    ffmpeg, "-y", "-loglevel", "error", "-i", str(source),
                    "-ar", "24000", "-ac", "1", "-codec:a", "libmp3lame",
                    "-b:a", "96k", str(encoded)
                ], check=True)
                target.write_bytes(encoded.read_bytes())
            provenance["tracks"][track["id"]] = {
                "text": track["text"], "spoken_text": spoken_text(track), "lang": track["lang"],
                "sha256": hashlib.sha256(target.read_bytes()).hexdigest()
            }
            provenance_file.write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n")
    print("Narration generation complete.", flush=True)


def spoken_text(track):
    if not track["id"].startswith("n-"):
        text = track["text"]
        if text[-1] not in ".!?。！？":
            text += "。" if track["lang"].startswith("zh") else "."
        return text
    number = int(track["text"])
    digits = "零一二三四五六七八九"
    if number < 10:
        return digits[number] + "。"
    if number == 100:
        return "一百。"
    tens, units = divmod(number, 10)
    return (digits[tens] if tens > 1 else "") + "十" + (digits[units] if units else "") + "。"


if __name__ == "__main__":
    main()
