import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  CloudRain, 
  Trees, 
  Waves, 
  Flame, 
  Coffee, 
  Radio, 
  Play, 
  Pause,
  Sliders
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { AmbientSoundType, AmbientTrack } from '../types';
import { useTimer } from '../context/TimerContext';

interface AmbientSoundMixerProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackStateChange: (isPlayingAny: boolean) => void;
}

const INITIAL_TRACKS: AmbientTrack[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    icon: 'CloudRain',
    description: 'Soft rhythmic raindrops and calming mist',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'forest',
    name: 'Forest Wind',
    icon: 'Trees',
    description: 'Breezy leaves and distant birdsong',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: 'Waves',
    description: 'Deep rhythmic coastal swells',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'fire',
    name: 'Fireplace',
    icon: 'Flame',
    description: 'Cozy hearth warmth and gentle ember pops',
    volume: 0.45,
    isPlaying: false,
  },
  {
    id: 'cafe',
    name: 'Warm Cafe',
    icon: 'Coffee',
    description: 'Subtle acoustic atmosphere & gentle murmur',
    volume: 0.4,
    isPlaying: false,
  },
  {
    id: 'binaural',
    name: '10Hz Alpha Waves',
    icon: 'Radio',
    description: 'Brainwave entrainment for deep calm focus',
    volume: 0.35,
    isPlaying: false,
  },
];

export const AmbientSoundMixer: React.FC<AmbientSoundMixerProps> = ({
  isOpen,
  onClose,
  onTrackStateChange,
}) => {
  const [tracks, setTracks] = useState<AmbientTrack[]>(INITIAL_TRACKS);
  const { settings, updateSettings } = useTimer();

  if (!isOpen) return null;

  const isAnyPlaying = tracks.some((t) => t.isPlaying);

  const toggleTrack = (trackId: AmbientSoundType) => {
    setTracks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === trackId) {
          const nextPlaying = !t.isPlaying;
          if (nextPlaying) {
            audioEngine.startAmbient(t.id, t.volume);
          } else {
            audioEngine.stopAmbient(t.id);
          }
          return { ...t, isPlaying: nextPlaying };
        }
        return t;
      });

      const anyActive = updated.some((t) => t.isPlaying);
      onTrackStateChange(anyActive);
      return updated;
    });
  };

  const handleVolumeChange = (trackId: AmbientSoundType, newVol: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          audioEngine.setAmbientVolume(trackId, newVol);
          return { ...t, volume: newVol };
        }
        return t;
      })
    );
  };

  const stopAll = () => {
    audioEngine.stopAllAmbient();
    setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
    onTrackStateChange(false);
  };

  const applyPreset = (preset: { id: string; name: string; trackVolumes: Partial<Record<AmbientSoundType, number>> }) => {
    audioEngine.stopAllAmbient();

    setTracks((prev) => {
      const updated = prev.map((t) => {
        const targetVol = preset.trackVolumes[t.id];
        if (targetVol !== undefined && targetVol > 0) {
          audioEngine.startAmbient(t.id, targetVol);
          return { ...t, isPlaying: true, volume: targetVol };
        } else {
          return { ...t, isPlaying: false };
        }
      });

      onTrackStateChange(true);
      return updated;
    });
  };

  const PRESETS = [
    { id: 'rainy_cafe', name: '🌧️ Rainy Cafe', trackVolumes: { rain: 0.55, cafe: 0.4 } },
    { id: 'forest_alpha', name: '🌲 Zen Forest', trackVolumes: { forest: 0.6, binaural: 0.35 } },
    { id: 'cozy_night', name: '🪵 Fireside Rain', trackVolumes: { fire: 0.5, rain: 0.4 } },
    { id: 'ocean_breeze', name: '🌊 Ocean Flow', trackVolumes: { ocean: 0.6, binaural: 0.3 } },
  ];

  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain': return <CloudRain className="w-5 h-5" />;
      case 'Trees': return <Trees className="w-5 h-5" />;
      case 'Waves': return <Waves className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      default: return <Volume2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Ambient Sound Sanctuary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthesized 100% offline via Web Audio API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Pills */}
        <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
            Quick Atmosphere Presets
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sage-100 hover:text-sage-700 dark:hover:bg-sage-900/70 dark:hover:text-sage-300 transition-all border border-slate-200/60 dark:border-slate-700/60"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Track list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`p-4 rounded-2xl border transition-all ${
                track.isPlaying
                  ? 'bg-sage-50/70 dark:bg-sage-950/40 border-sage-300 dark:border-sage-700 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      track.isPlaying
                        ? 'bg-sage-600 text-white dark:bg-sage-500'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {getTrackIcon(track.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {track.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {track.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleTrack(track.id)}
                  className={`p-2.5 rounded-xl transition-all ${
                    track.isPlaying
                      ? 'bg-sage-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={track.isPlaying ? 'Mute' : 'Play'}
                >
                  {track.isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 mt-3 px-1">
                <span className="text-[11px] text-slate-400 font-mono w-7">
                  {Math.round(track.volume * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) =>
                    handleVolumeChange(track.id, parseFloat(e.target.value))
                  }
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sage-600"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer controls: Master Volume & Stop All */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                <span>Master Volume</span>
                <span className="font-mono">{Math.round(settings.ambientMasterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.ambientMasterVolume}
                onChange={(e) =>
                  updateSettings({ ambientMasterVolume: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sage-600"
              />
            </div>
          </div>

          {isAnyPlaying && (
            <button
              onClick={stopAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 hover:bg-rose-200 transition-colors"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop All</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
