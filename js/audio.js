const VOICE_PROFILES = {
  original: { rate: 1, preservesPitch: true },
  bright: { rate: 1.16, preservesPitch: false },
  soft: { rate: 1.07, preservesPitch: false }
};

function trimRecording(buffer) {
  const samples = buffer.getChannelData(0);
  const windowSize = Math.max(1, Math.round(buffer.sampleRate * .01));
  let first = samples.length, last = 0;
  for (let start = 0; start < samples.length; start += windowSize) {
    const end = Math.min(start + windowSize, samples.length);
    let energy = 0;
    for (let i = start; i < end; i++) energy += samples[i] * samples[i];
    if (Math.sqrt(energy / (end - start)) > .0015) {
      first = Math.min(first, start);
      last = end;
    }
  }
  if (first >= last) return samples.slice();
  const start = Math.max(0, first - Math.round(buffer.sampleRate * .035));
  const end = Math.min(samples.length, last + Math.round(buffer.sampleRate * .05));
  return samples.slice(start, end);
}

function encodeWave(samples, sampleRate) {
  const bytes = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(bytes);
  const text = (offset, value) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, "RIFF"); view.setUint32(4, bytes.byteLength - 8, true); text(8, "WAVE");
  text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
  }
  return new Blob([bytes], { type: "audio/wav" });
}

const continuousAudio = {
  sampleRate: 24000, recordings: new Map(), phrases: new Map(),
  get supported() { return Boolean(window.OfflineAudioContext || window.webkitOfflineAudioContext); },
  async recording(id) {
    if (!this.recordings.has(id)) {
      const pending = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(`audio/${id}.mp3`, { signal: controller.signal });
          if (!response.ok) throw new Error("audio-load");
          const Decoder = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          const decoder = new Decoder(1, 1, this.sampleRate);
          const decoded = await decoder.decodeAudioData(await response.arrayBuffer());
          return { samples: trimRecording(decoded), originalDuration: decoded.duration };
        } finally { clearTimeout(timer); }
      })();
      this.recordings.set(id, pending);
      pending.catch(() => this.recordings.delete(id));
    }
    return this.recordings.get(id);
  },
  async prepare(ids) {
    const key = ids.join("|");
    if (!this.phrases.has(key)) {
      const pending = (async () => {
        const recordings = await Promise.all(ids.map(id => this.recording(id)));
        const gap = Math.round(this.sampleRate * .03);
        const length = recordings.reduce((sum, item) => sum + item.samples.length, 0) + gap * (recordings.length - 1);
        const samples = new Float32Array(length);
        let offset = 0;
        for (const recording of recordings) {
          samples.set(recording.samples, offset);
          offset += recording.samples.length + gap;
        }
        return {
          url: URL.createObjectURL(encodeWave(samples, this.sampleRate)),
          duration: length / this.sampleRate,
          originalDuration: recordings.reduce((sum, item) => sum + item.originalDuration, 0)
        };
      })();
      this.phrases.set(key, pending);
      pending.catch(() => this.phrases.delete(key));
      // Keep reusable decoded words, but bound assembled phrases during long sessions.
      if (this.phrases.size > 40) {
        const oldest = this.phrases.keys().next().value;
        const previous = this.phrases.get(oldest);
        this.phrases.delete(oldest);
        previous.then(phrase => URL.revokeObjectURL(phrase.url), () => {});
      }
    }
    return this.phrases.get(key);
  },
  preload(ids) {
    if (this.supported) ids.forEach(id => { this.recording(id).catch(() => {}); });
  }
};
