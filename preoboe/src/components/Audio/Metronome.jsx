"use client";

import React, { useEffect, useState } from "react";
import useMetronome from "../../hooks/useMetronome";

export default function Metronome() {
  const { bpm, setBpm, isRunning, toggle, setOnTick, setSubdivision, setTimeSignature } = useMetronome({ tempo: 80 });
  const [flash, setFlash] = useState(false);
  const [isMainBeat, setIsMainBeat] = useState(true);
  const [subdivision, setSubdivisionState] = useState(1);
  const [timeSignature, setTimeSignatureState] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isStrongBeat, setIsStrongBeat] = useState(false);
  const [beatInMeasure, setBeatInMeasure] = useState(0);

  useEffect(() => {
    setOnTick((time, mainBeat, beatIndex, strongBeat, beatInMeasureParam) => {
      // flash UI briefly
      setIsMainBeat(mainBeat);
      setCurrentBeat(beatIndex);
      setIsStrongBeat(strongBeat);
      setBeatInMeasure(beatInMeasureParam);
      setFlash(true);
      setTimeout(() => setFlash(false), 80);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubdivisionChange = (value) => {
    const newSubdivision = Number(value);
    setSubdivisionState(newSubdivision);
    setSubdivision(newSubdivision);
  };

  const handleTimeSignatureChange = (value) => {
    const newTimeSignature = Number(value);
    setTimeSignatureState(newTimeSignature);
    setTimeSignature(newTimeSignature);
  };

  return (
    <div className="w-full max-w-lg rounded-lg border p-6 shadow-sm bg-white dark:bg-[#0b0b0b]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Metrónomo</h2>
        <button className="btn" onClick={toggle}>
          {isRunning ? "Detener" : "Iniciar"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm">Compás</label>
          <select
            value={timeSignature}
            onChange={(e) => handleTimeSignatureChange(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value={1}>1/4</option>
            <option value={2}>2/4</option>
            <option value={3}>3/4</option>
            <option value={4}>4/4</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Subdivisión</label>
          <select
            onChange={(e) => handleSubdivisionChange(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value={1}>Negra (1)</option>
            <option value={2}>Corcheas (2)</option>
            <option value={3}>Tresillos (3)</option>
            <option value={4}>Semicorcheas (4)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm">BPM: {bpm}</label>
          <div className="text-sm font-mono">{bpm}</div>
        </div>
        <input
          type="range"
          min="30"
          max="220"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="text-center text-sm text-gray-600">Compás {timeSignature}/4</div>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: timeSignature }).map((_, beatIndex) => (
            <div
              key={`beat-${beatIndex}`}
              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                flash && isMainBeat && beatInMeasure === beatIndex
                  ? beatIndex === 0
                    ? "bg-emerald-500 text-white"
                    : "bg-yellow-500 text-white"
                  : beatIndex === 0
                  ? "bg-emerald-200 text-emerald-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {beatIndex + 1}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: subdivision }).map((_, index) => (
            <div
              key={`sub-${index}`}
              className={`h-8 w-8 rounded-full transition-colors ${
                flash && currentBeat === index
                  ? isStrongBeat
                    ? "bg-emerald-400"
                    : "bg-red-400"
                  : "bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
