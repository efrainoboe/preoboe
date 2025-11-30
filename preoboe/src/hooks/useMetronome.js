"use client";

import { useEffect, useRef, useState } from "react";

export default function useMetronome({ tempo = 60 } = {}) {
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpmState] = useState(tempo);
  const bpmRef = useRef(tempo);
  const audioCtxRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const schedulerIntervalRef = useRef(null);
  const subdivisionRef = useRef(1);
  const timeSignatureRef = useRef(4); // beats per measure (numerator)
  const beatInMeasureRef = useRef(0);
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // seconds
  const current16thRef = useRef(0);
  const onTickRef = useRef(null);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initAudio() {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
  }

  function nextNote() {
  const secondsPerBeat = 60.0 / bpmRef.current;

  const subdivision = subdivisionRef.current;
  const step = secondsPerBeat / subdivision;

  nextNoteTimeRef.current += step;

  current16thRef.current = (current16thRef.current + 1) % subdivision;
  
  // Increment beat in measure only when we reach a new beat (subdivision = 1)
  if (current16thRef.current === 0) {
    beatInMeasureRef.current = (beatInMeasureRef.current + 1) % timeSignatureRef.current;
  }
}


  function scheduleNote(time) {
  const ctx = audioCtxRef.current;
  if (!ctx) return;

  const isMainBeat = current16thRef.current === 0;
  const isStrongBeat = isMainBeat && beatInMeasureRef.current === 0;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // sonido diferente: tiempo fuerte > tiempo débil > subdivisión
  if (isStrongBeat) {
    osc.frequency.value = 1500;
  } else if (isMainBeat) {
    osc.frequency.value = 1200;
  } else {
    osc.frequency.value = 900;
  }

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(isStrongBeat ? 0.4 : (isMainBeat ? 0.3 : 0.2), time + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

  osc.start(time);
  osc.stop(time + 0.06);

  if (onTickRef.current) onTickRef.current(time, isMainBeat, current16thRef.current, isStrongBeat, beatInMeasureRef.current);
}

function setSubdivision(n) {
  subdivisionRef.current = n; // 1, 2, 3, 4
}

function setTimeSignature(beats) {
  timeSignatureRef.current = beats;
  beatInMeasureRef.current = 0;
}



  function scheduler() {
    const ctx = audioCtxRef.current;
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(nextNoteTimeRef.current);
      nextNote();
    }
  }

  function start() {
    initAudio();
    const ctx = audioCtxRef.current;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    current16thRef.current = 0;
    setIsRunning(true);
    schedulerIntervalRef.current = setInterval(scheduler, lookahead);
  }

  function stop() {
    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
      schedulerIntervalRef.current = null;
    }
    setIsRunning(false);
  }

  function toggle() {
    if (isRunning) stop();
    else start();
  }

  function setOnTick(cb) {
    onTickRef.current = cb;
  }

  // wrapper to update ref + state so scheduler sees new BPM
  function setBpm(value) {
    const v = Number(value) || 0;
    bpmRef.current = v;
    setBpmState(v);
  }

  return {
    bpm,
    setBpm,
    isRunning,
    start,
    stop,
    toggle,
    setOnTick,
    setSubdivision,
    setTimeSignature,
    beatInMeasureRef
  };
}
