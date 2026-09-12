import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Plus, Minus, RotateCcw } from 'lucide-react';

interface MetronomeProps {
  initialBpm?: number;
  isOpen: boolean;
  onClose?: () => void;
}

export const Metronome: React.FC<MetronomeProps> = ({
  initialBpm = 100,
  isOpen,
  onClose,
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const beatCountRef = useRef<number>(0);
  const tapTimesRef = useRef<number[]>([]);

  // Update bpm if initialBpm changes from external trigger (e.g. material clicked)
  useEffect(() => {
    if (initialBpm && initialBpm > 30 && initialBpm < 300) {
      setBpm(initialBpm);
    }
  }, [initialBpm]);

  // Audio click synthesizer using Web Audio API
  const playClick = (isAccent: boolean) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Higher frequency for accent on beat 1
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, ctx.currentTime);
      osc.type = isAccent ? 'triangle' : 'sine';

      gain.gain.setValueAtTime(isAccent ? 0.8 : 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext might be restricted until user interaction
    }
  };

  const tick = () => {
    const isFirstBeat = beatCountRef.current % beatsPerBar === 0;
    playClick(isFirstBeat);
    setCurrentBeat(beatCountRef.current % beatsPerBar);
    beatCountRef.current = (beatCountRef.current + 1) % beatsPerBar;
  };

  useEffect(() => {
    if (isPlaying) {
      beatCountRef.current = 0;
      tick();
      const intervalMs = (60 / bpm) * 1000;
      const intervalId = window.setInterval(() => {
        tick();
      }, intervalMs);
      timerRef.current = intervalId;

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentBeat(0);
      beatCountRef.current = 0;
    }
  }, [isPlaying, bpm, beatsPerBar, isMuted]);

  // Handle Tap Tempo
  const handleTap = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);

    // Keep only last 4 taps within 3 seconds
    if (tapTimesRef.current.length > 1) {
      const recentTaps = tapTimesRef.current.filter((t) => now - t < 3000);
      tapTimesRef.current = recentTaps;

      if (recentTaps.length >= 2) {
        const intervals = [];
        for (let i = 1; i < recentTaps.length; i++) {
          intervals.push(recentTaps[i] - recentTaps[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);
        if (calculatedBpm >= 40 && calculatedBpm <= 240) {
          setBpm(calculatedBpm);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="metronome-panel"
      className="fixed bottom-4 right-4 z-50 w-84 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 transition-all duration-200"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            Metrónomo de Estudo
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="metronome-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Ativar som' : 'Silenciar'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              id="metronome-close-btn"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Visual Beats */}
      <div className="flex justify-center items-center gap-2 mb-4">
        {Array.from({ length: beatsPerBar }).map((_, idx) => {
          const isActive = isPlaying && currentBeat === idx;
          const isAccent = idx === 0;
          return (
            <div
              key={idx}
              className={`h-3.5 transition-all duration-75 rounded-full ${
                isActive
                  ? isAccent
                    ? 'w-8 bg-amber-500 scale-110 shadow-md shadow-amber-500/30'
                    : 'w-6 bg-indigo-600 scale-105'
                  : 'w-3 bg-slate-200'
              }`}
            />
          );
        })}
      </div>

      {/* BPM Display & Steppers */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          id="bpm-decrease-btn"
          onClick={() => setBpm((prev) => Math.max(40, prev - 1))}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="text-center min-w-28">
          <div className="text-4xl font-black text-slate-900 tracking-tight font-mono">
            {bpm}
          </div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            BPM
          </div>
        </div>

        <button
          id="bpm-increase-btn"
          onClick={() => setBpm((prev) => Math.min(240, prev + 1))}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slider */}
      <div className="mb-4 px-1">
        <input
          id="bpm-slider"
          type="range"
          min="40"
          max="220"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Largo (40)</span>
          <span>Andante (80)</span>
          <span>Moderato (110)</span>
          <span>Presto (180+)</span>
        </div>
      </div>

      {/* Time signature and Tap */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[2, 3, 4, 6].map((beats) => (
            <button
              key={beats}
              id={`time-sig-${beats}`}
              onClick={() => setBeatsPerBar(beats)}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                beatsPerBar === beats
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {beats}/4
            </button>
          ))}
        </div>

        <button
          id="tap-tempo-btn"
          onClick={handleTap}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Tap Tempo
        </button>
      </div>

      {/* Play / Stop Toggle Button */}
      <button
        id="metronome-play-toggle"
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-sm transition-all ${
          isPlaying
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
        }`}
      >
        {isPlaying ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            Parar Metrónomo
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            Iniciar Metrónomo
          </>
        )}
      </button>
    </div>
  );
};
