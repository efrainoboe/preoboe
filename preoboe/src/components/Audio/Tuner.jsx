"use client";

import React, { useEffect, useRef, useState } from "react";
import useMicrophone from "../../hooks/useMicrophone";
import { autoCorrelate, frequencyToNoteData } from "../../utils/pitch";

export default function Tuner() {
  const { start, stop, isActive, error, getFloatTimeDomain } = useMicrophone({ fftSize: 2048 });
  const [freq, setFreq] = useState(null);
  const [note, setNote] = useState(null);
  const rafRef = useRef(null);
  const [a4, setA4] = useState(440);

  useEffect(() => {
    return () => {
      stop();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update() {
    const data = getFloatTimeDomain();
    if (data) {
      const sampleRate = (window.AudioContext || window.webkitAudioContext).prototype.sampleRate || 44100;
      const f = autoCorrelate(data, sampleRate);
      if (f && f > 0) {
        setFreq(Math.round(f));
        const noteData = frequencyToNoteData(f);
        setNote(noteData);
      } else {
        setFreq(null);
        setNote(null);
      }
    }
    rafRef.current = requestAnimationFrame(update);
  }

  function handleStart() {
    start().then(() => {
      rafRef.current = requestAnimationFrame(update);
    });
  }

  function handleStop() {
    stop();
    cancelAnimationFrame(rafRef.current);
    setFreq(null);
    setNote(null);
  }

  return (
    <div className="w-full max-w-lg rounded-lg border p-6 shadow-sm bg-white dark:bg-[#0b0b0b]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Afinador</h2>
        <div className="flex items-center gap-2">
          {!isActive ? (
            <button className="btn" onClick={handleStart}>
              Iniciar
            </button>
          ) : (
            <button className="btn" onClick={handleStop}>
              Detener
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-zinc-500">Referencia A</div>
        <div className="flex items-center gap-3 mt-1">
          <input
            type="number"
            value={a4}
            onChange={(e) => setA4(Number(e.target.value) || 440)}
            className="w-24 rounded border px-2 py-1"
          />
          <div className="text-sm text-zinc-500">Hz</div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="text-5xl font-bold h-16 flex items-center">
          {note ? note.noteName : "--"}
        </div>
        <div className="mt-2 text-sm text-zinc-500">{freq ? `${freq} Hz` : "—"}</div>

        <div className="w-full mt-6">
          <div className="h-3 bg-zinc-200 rounded relative overflow-hidden">
            <div
              className="absolute top-0 left-1/2 h-full w-0.5 bg-red-500"
              style={{ transform: "translateX(-50%)" }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-emerald-400"
              style={{ width: `${Math.min(100, Math.abs(note ? note.cents : 0) / 2)}%`, transform: note && note.cents < 0 ? "translateX(0)" : "translateX(50%)" }}
            />
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-500">{error.message}</div>}
      </div>
    </div>
  );
}
