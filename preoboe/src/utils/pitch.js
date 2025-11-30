// Autocorrelation pitch detection (based on Chris Wilson's implementation)
export function autoCorrelate(buf, sampleRate) {
  // buf: Float32Array time domain signal
  const SIZE = buf.length;
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;
  let foundGoodCorrelation = false;
  let correlations = new Array(SIZE);

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // not enough signal

  let lastCorrelation = 1;
  for (let offset = 0; offset < SIZE; offset++) {
    let correlation = 0;
    for (let i = 0; i < SIZE - offset; i++) {
      correlation += Math.abs(buf[i] - buf[i + offset]);
    }
    correlation = 1 - correlation / (SIZE - offset);
    correlations[offset] = correlation;
    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      // short-circuit
      const shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
      return sampleRate / (bestOffset + 8 * shift);
    }
    lastCorrelation = correlation;
  }
  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  return -1;
}

const noteStrings = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function frequencyToNoteData(frequency) {
  if (frequency <= 0) return null;
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
  const rounded = Math.round(noteNum);
  const noteIndex = (rounded + 120) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  const noteName = `${noteStrings[noteIndex]}${octave}`;
  const cents = Math.floor((noteNum - rounded) * 100);
  return { noteName, octave, cents, noteNum, rounded, index: noteIndex };
}
