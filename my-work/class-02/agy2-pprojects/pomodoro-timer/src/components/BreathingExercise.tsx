import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Wind } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

type Technique = 'box' | 'relax478';
type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  isOpen,
  onClose,
}) => {
  const [technique, setTechnique] = useState<Technique>('box');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Technique timing profiles (seconds)
  const getProfile = (t: Technique) => {
    if (t === 'box') {
      return {
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 4,
        total: 16,
      };
    } else {
      return {
        inhale: 4,
        hold1: 7,
        exhale: 8,
        hold2: 0,
        total: 19,
      };
    }
  };

  const currentProfile = getProfile(technique);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(currentProfile.inhale);
    try {
      audioEngine.playChime('crystal', 0.2);
    } catch {
      // ignore
    }
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(currentProfile.inhale);
    setCyclesCompleted(0);
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition to next phase
        let nextPhase: Phase = 'inhale';
        let nextCount = 4;

        if (technique === 'box') {
          if (phase === 'inhale') {
            nextPhase = 'hold1';
            nextCount = 4;
          } else if (phase === 'hold1') {
            nextPhase = 'exhale';
            nextCount = 4;
          } else if (phase === 'exhale') {
            nextPhase = 'hold2';
            nextCount = 4;
          } else {
            nextPhase = 'inhale';
            nextCount = 4;
            setCyclesCompleted((c) => c + 1);
          }
        } else {
          // 4-7-8
          if (phase === 'inhale') {
            nextPhase = 'hold1';
            nextCount = 7;
          } else if (phase === 'hold1') {
            nextPhase = 'exhale';
            nextCount = 8;
          } else {
            nextPhase = 'inhale';
            nextCount = 4;
            setCyclesCompleted((c) => c + 1);
          }
        }

        setPhase(nextPhase);
        return nextCount;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, technique, currentProfile]);

  if (!isOpen) return null;

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold1':
      case 'hold2':
        return 'Hold Breath';
      case 'exhale':
        return 'Breathe Out';
    }
  };

  const getPhaseSubtext = () => {
    switch (phase) {
      case 'inhale':
        return 'Deeply through your nose, expanding your belly';
      case 'hold1':
      case 'hold2':
        return 'Gentle and calm, resting in stillness';
      case 'exhale':
        return 'Smooth, slow release through your mouth';
    }
  };

  // Dynamic scale for visual orb
  const getOrbScale = () => {
    if (!isActive) return 'scale-90';
    if (phase === 'inhale') return 'scale-125 duration-[4000ms]';
    if (phase === 'hold1') return 'scale-125 duration-[7000ms]';
    if (phase === 'exhale') return 'scale-90 duration-[8000ms]';
    return 'scale-90 duration-[4000ms]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            resetExercise();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Wind className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Mindful Breathing Intermission
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Reset your parasympathetic nervous system between focus sessions
        </p>

        {/* Technique Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 mb-8">
          <button
            onClick={() => {
              setTechnique('box');
              resetExercise();
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              technique === 'box'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Box Breathing (4-4-4-4)
          </button>
          <button
            onClick={() => {
              setTechnique('relax478');
              resetExercise();
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              technique === 'relax478'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            4-7-8 Deep Calm
          </button>
        </div>

        {/* Animated Breathing Orb Graphic */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* Outer glowing ripple ring */}
          <div
            className={`absolute w-56 h-56 rounded-full border-2 border-dashed border-emerald-400/40 dark:border-emerald-500/30 transition-transform ease-in-out ${getOrbScale()}`}
          />

          {/* Core Breathing Orb */}
          <div
            className={`w-44 h-44 rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-sage-400/30 backdrop-blur-xl border border-emerald-300/40 dark:border-emerald-500/30 shadow-2xl flex flex-col items-center justify-center transition-all ease-in-out ${getOrbScale()}`}
            style={{
              boxShadow: '0 0 45px -5px rgba(16, 185, 129, 0.25)',
            }}
          >
            <span className="text-4xl font-extrabold font-mono text-emerald-800 dark:text-emerald-200">
              {isActive ? countdown : '✨'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mt-1">
              {isActive ? getPhaseText() : 'Ready'}
            </span>
          </div>
        </div>

        {/* Prompt description */}
        <div className="h-12 flex flex-col items-center justify-center mb-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isActive ? getPhaseSubtext() : 'Sit comfortably, relax your shoulders, and begin.'}
          </p>
          {cyclesCompleted > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              🌿 {cyclesCompleted} breath cycles completed
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetExercise}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={isActive ? pauseExercise : startExercise}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md text-white ${
              isActive ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Breathing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
