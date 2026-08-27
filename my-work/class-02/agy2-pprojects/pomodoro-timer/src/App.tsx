import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';
import { TaskProvider } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { TimerDial } from './components/TimerDial';
import { TimerControls } from './components/TimerControls';
import { TaskManager } from './components/TaskManager';
import { AmbientSoundMixer } from './components/AmbientSoundMixer';
import { BreathingExercise } from './components/BreathingExercise';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SettingsModal } from './components/SettingsModal';
import { ZenFullscreen } from './components/ZenFullscreen';
import { QuoteBanner } from './components/QuoteBanner';
import { TimerImageCard } from './components/TimerImageCard';

const MainAppContent: React.FC = () => {
  const { currentThemeConfig } = useTheme();

  // Modals state
  const [isSoundMixerOpen, setIsSoundMixerOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentThemeConfig.bgGradient} flex flex-col justify-between transition-colors duration-700`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenSoundMixer={() => setIsSoundMixerOpen(true)}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenZen={() => setIsZenOpen(true)}
        isAmbientPlaying={isAmbientPlaying}
      />

      {/* Main Workspace Container */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col items-center">
        {/* Mindful Quote Banner */}
        <QuoteBanner />

        {/* Core Layout Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start my-auto">
          {/* Left Column: Timer Sanctuary Image Card & Timer Controls */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center w-full">
            <TimerImageCard />
            <div className={`w-full rounded-3xl p-6 sm:p-8 border transition-all ${currentThemeConfig.cardBg}`}>
              <TimerDial />
              <TimerControls onOpenBreathing={() => setIsBreathingOpen(true)} />
            </div>
          </div>

          {/* Right Column: Task Management */}
          <div className="lg:col-span-6 flex flex-col w-full">
            <TaskManager />
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-2 border-t border-slate-200/40 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span>SereneFocus • A calm productivity sanctuary</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Designed for deep flow & mindfulness</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AmbientSoundMixer
        isOpen={isSoundMixerOpen}
        onClose={() => setIsSoundMixerOpen(false)}
        onTrackStateChange={setIsAmbientPlaying}
      />

      <BreathingExercise
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ZenFullscreen
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <TaskProvider>
          <MainAppContent />
        </TaskProvider>
      </TimerProvider>
    </ThemeProvider>
  );
}

export default App;
