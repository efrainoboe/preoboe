"use client";

import { useEffect, useRef, useState } from "react";

export default function useMicrophone({ fftSize = 2048 } = {}) {
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(new Error("getUserMedia not supported"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = fftSize;
      source.connect(analyser);

      analyserRef.current = analyser;
      mediaRef.current = stream;
      dataArrayRef.current = new Float32Array(analyser.fftSize);
      setIsActive(true);
    } catch (err) {
      setError(err);
      setIsActive(false);
    }
  }

  function stop() {
    try {
      if (mediaRef.current) {
        mediaRef.current.getTracks().forEach((t) => t.stop());
        mediaRef.current = null;
      }
      if (audioCtxRef.current) {
        // don't close to avoid context limit issues in some browsers; suspend instead
        audioCtxRef.current.suspend?.();
      }
    } catch (e) {
      // ignore
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsActive(false);
  }

  function getAnalyser() {
    return analyserRef.current;
  }

  function getFloatTimeDomain() {
    const analyser = analyserRef.current;
    if (!analyser || !dataArrayRef.current) return null;
    analyser.getFloatTimeDomainData(dataArrayRef.current);
    return dataArrayRef.current;
  }

  return {
    start,
    stop,
    isActive,
    error,
    getAnalyser,
    getFloatTimeDomain,
  };
}
