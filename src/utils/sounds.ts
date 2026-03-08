export function playClick() {
  const ctx = new AudioContext();

  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    // Short noise burst that decays fast — mimics a mechanical click
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 8);
  }

  const source = ctx.createBufferSource();
  source.buffer = buf;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, ctx.currentTime);

  // Tiny high-pass to make it crisp
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
  source.onended = () => ctx.close();
}
