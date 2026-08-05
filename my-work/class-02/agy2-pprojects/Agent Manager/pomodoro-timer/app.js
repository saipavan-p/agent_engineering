/**
 * Zenith Focus — Mindful Pomodoro Productivity Suite
 * Author: Antigravity AI
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. State & Storage Management
     ========================================================================== */
  const DEFAULT_SETTINGS = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomos: false,
    desktopNotifs: false,
    theme: 'sage',
    chimeSound: 'singingBowl'
  };

  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Complete deep work session',
      estPomo: 3,
      completedPomo: 1,
      category: 'Work',
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 'task-2',
      title: 'Read chapter on mindful focus',
      estPomo: 2,
      completedPomo: 0,
      category: 'Study',
      completed: false,
      createdAt: Date.now() - 1000
    }
  ];

  let settings = JSON.parse(localStorage.getItem('zf_settings')) || DEFAULT_SETTINGS;
  let tasks = JSON.parse(localStorage.getItem('zf_tasks')) || DEFAULT_TASKS;
  let history = JSON.parse(localStorage.getItem('zf_history')) || {};

  // Current Timer State
  let timerState = {
    mode: 'pomodoro', // 'pomodoro' | 'shortBreak' | 'longBreak' | 'breathwork'
    totalSeconds: settings.focusMinutes * 60,
    secondsRemaining: settings.focusMinutes * 60,
    isRunning: false,
    completedSessionsToday: 0,
    intervalId: null,
    activeTaskId: tasks.length > 0 ? tasks[0].id : null
  };

  // Breathing State
  let breathingState = {
    isRunning: false,
    phase: 'inhale', // 'inhale' | 'hold1' | 'exhale' | 'hold2'
    seconds: 4,
    timerId: null
  };

  /* ==========================================================================
     2. Web Audio API Procedural Synthesizers & Soundscapes
     ========================================================================== */
  let audioCtx = null;
  let activeAudioLayers = {
    rain: null,
    ocean: null,
    forest: null,
    hearth: null
  };

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Create White/Pink Noise Buffer
  function createNoiseBuffer() {
    if (!audioCtx) return null;
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Soundscape Synthesizers
  const Soundscapes = {
    rain: {
      source: null, gain: null, filter: null,
      start() {
        initAudioContext();
        if (!audioCtx) return;
        const noiseBuf = createNoiseBuffer();
        if (!noiseBuf) return;
        this.source = audioCtx.createBufferSource();
        this.source.buffer = noiseBuf;
        this.source.loop = true;

        this.filter = audioCtx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

        this.gain = audioCtx.createGain();
        const vol = (document.getElementById('rainVolume').value || 0) / 100 * 0.4;
        this.gain.gain.setValueAtTime(vol, audioCtx.currentTime);

        this.source.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(audioCtx.destination);
        this.source.start();
      },
      setVolume(val) {
        if (this.gain && audioCtx) {
          this.gain.gain.linearRampToValueAtTime((val / 100) * 0.4, audioCtx.currentTime + 0.1);
        }
      },
      stop() {
        if (this.source) {
          try { this.source.stop(); } catch(e){}
          this.source = null;
        }
      }
    },

    ocean: {
      source: null, gain: null, lfo: null,
      start() {
        initAudioContext();
        if (!audioCtx) return;
        const noiseBuf = createNoiseBuffer();
        if (!noiseBuf) return;
        this.source = audioCtx.createBufferSource();
        this.source.buffer = noiseBuf;
        this.source.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioCtx.currentTime);

        // LFO for rhythmic ocean swell
        this.lfo = audioCtx.createOscillator();
        this.lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(350, audioCtx.currentTime);

        this.lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        this.gain = audioCtx.createGain();
        const vol = (document.getElementById('oceanVolume').value || 0) / 100 * 0.5;
        this.gain.gain.setValueAtTime(vol, audioCtx.currentTime);

        this.source.connect(filter);
        filter.connect(this.gain);
        this.gain.connect(audioCtx.destination);

        this.source.start();
        this.lfo.start();
      },
      setVolume(val) {
        if (this.gain && audioCtx) {
          this.gain.gain.linearRampToValueAtTime((val / 100) * 0.5, audioCtx.currentTime + 0.1);
        }
      },
      stop() {
        if (this.source) {
          try { this.source.stop(); this.lfo.stop(); } catch(e){}
          this.source = null;
        }
      }
    },

    forest: {
      source: null, gain: null,
      start() {
        initAudioContext();
        if (!audioCtx) return;
        const noiseBuf = createNoiseBuffer();
        if (!noiseBuf) return;
        this.source = audioCtx.createBufferSource();
        this.source.buffer = noiseBuf;
        this.source.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
        filter.Q.setValueAtTime(3, audioCtx.currentTime);

        this.gain = audioCtx.createGain();
        const vol = (document.getElementById('forestVolume').value || 0) / 100 * 0.3;
        this.gain.gain.setValueAtTime(vol, audioCtx.currentTime);

        this.source.connect(filter);
        filter.connect(this.gain);
        this.gain.connect(audioCtx.destination);
        this.source.start();
      },
      setVolume(val) {
        if (this.gain && audioCtx) {
          this.gain.gain.linearRampToValueAtTime((val / 100) * 0.3, audioCtx.currentTime + 0.1);
        }
      },
      stop() {
        if (this.source) {
          try { this.source.stop(); } catch(e){}
          this.source = null;
        }
      }
    },

    hearth: {
      source: null, gain: null,
      start() {
        initAudioContext();
        if (!audioCtx) return;
        const noiseBuf = createNoiseBuffer();
        if (!noiseBuf) return;
        this.source = audioCtx.createBufferSource();
        this.source.buffer = noiseBuf;
        this.source.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, audioCtx.currentTime);

        this.gain = audioCtx.createGain();
        const vol = (document.getElementById('hearthVolume').value || 0) / 100 * 0.45;
        this.gain.gain.setValueAtTime(vol, audioCtx.currentTime);

        this.source.connect(filter);
        filter.connect(this.gain);
        this.gain.connect(audioCtx.destination);
        this.source.start();
      },
      setVolume(val) {
        if (this.gain && audioCtx) {
          this.gain.gain.linearRampToValueAtTime((val / 100) * 0.45, audioCtx.currentTime + 0.1);
        }
      },
      stop() {
        if (this.source) {
          try { this.source.stop(); } catch(e){}
          this.source = null;
        }
      }
    }
  };

  // Completion Notification Chimes
  function playChime(chimeType = settings.chimeSound) {
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (chimeType === 'singingBowl') {
      // Tibetan Singing Bowl (Zen resonant sine with harmonic decay)
      const freqs = [216, 432, 648];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 4.0);
      });
    } else if (chimeType === 'softBell') {
      // Soft Crystalline Bell
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (chimeType === 'zenGong') {
      // Mellow Low Gong
      const freqs = [108, 162, 216];
      freqs.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 3.5);
      });
    }
  }

  /* ==========================================================================
     3. DOM Elements Cache
     ========================================================================== */
  const timerDisplay = document.getElementById('timerDisplay');
  const timerModeBadge = document.getElementById('timerModeBadge');
  const sessionSubtext = document.getElementById('sessionSubtext');
  const timerProgress = document.getElementById('timerProgress');
  const startPauseBtn = document.getElementById('startPauseBtn');
  const startPauseText = document.getElementById('startPauseText');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const resetTimerBtn = document.getElementById('resetTimerBtn');
  const skipTimerBtn = document.getElementById('skipTimerBtn');
  
  const add1mBtn = document.getElementById('add1mBtn');
  const add5mBtn = document.getElementById('add5mBtn');
  const sub1mBtn = document.getElementById('sub1mBtn');

  const modeBtns = document.querySelectorAll('.mode-btn');

  // Spotlight Elements
  const spotlightCard = document.getElementById('spotlightCard');
  const spotlightTitle = document.getElementById('spotlightTitle');
  const spotlightTag = document.getElementById('spotlightTag');
  const spotlightPomoCount = document.getElementById('spotlightPomoCount');
  const spotlightCompleteBtn = document.getElementById('spotlightCompleteBtn');

  // Task Manager Elements
  const taskList = document.getElementById('taskList');
  const taskCountBadge = document.getElementById('taskCountBadge');
  const addTaskToggleBtn = document.getElementById('addTaskToggleBtn');
  const addTaskForm = document.getElementById('addTaskForm');
  const cancelAddTaskBtn = document.getElementById('cancelAddTaskBtn');
  const categoryFilters = document.getElementById('categoryFilters');

  // Breathing Assistant Elements
  const breathingCircle = document.getElementById('breathingCircle');
  const breathingPhase = document.getElementById('breathingPhase');
  const breathingSeconds = document.getElementById('breathingSeconds');
  const toggleBreathingBtn = document.getElementById('toggleBreathingBtn');

  // Audio Indicator
  const soundIndicator = document.getElementById('soundIndicator');

  // Modals & Theme Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeMenu = document.getElementById('themeMenu');
  const themeOpts = document.querySelectorAll('.theme-opt');

  const audioMixerBtn = document.getElementById('audioMixerBtn');
  const audioMixerModal = document.getElementById('audioMixerModal');

  const statsModalBtn = document.getElementById('statsModalBtn');
  const statsModal = document.getElementById('statsModal');

  const settingsModalBtn = document.getElementById('settingsModalBtn');
  const settingsModal = document.getElementById('settingsModal');

  const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');

  /* ==========================================================================
     4. Core Pomodoro Timer Engine
     ========================================================================== */
  const CIRCLE_RADIUS = 130;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~816.81

  function getModeDuration(mode) {
    switch (mode) {
      case 'pomodoro': return settings.focusMinutes * 60;
      case 'shortBreak': return settings.shortBreakMinutes * 60;
      case 'longBreak': return settings.longBreakMinutes * 60;
      case 'breathwork': return 4 * 60; // 4 min breathwork
      default: return 25 * 60;
    }
  }

  function getModeTitle(mode) {
    switch (mode) {
      case 'pomodoro': return 'Deep Focus';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Rest';
      case 'breathwork': return 'Mindful Reset';
      default: return 'Focus';
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTimerUI() {
    timerDisplay.textContent = formatTime(timerState.secondsRemaining);
    timerModeBadge.textContent = getModeTitle(timerState.mode);

    // Update Progress Ring
    const progressFraction = timerState.secondsRemaining / timerState.totalSeconds;
    const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progressFraction);
    timerProgress.style.strokeDashoffset = strokeDashoffset;

    // Update Subtext
    const sessionsRemaining = settings.longBreakInterval - (timerState.completedSessionsToday % settings.longBreakInterval);
    sessionSubtext.textContent = `Session #${timerState.completedSessionsToday + 1} • ${sessionsRemaining} until long break`;

    // Update Document Title
    const modeSymbol = timerState.mode === 'pomodoro' ? '🎯' : '☕';
    document.title = `${modeSymbol} (${formatTime(timerState.secondsRemaining)}) Zenith Focus`;

    // Update Start/Pause Button Icon & Text
    if (timerState.isRunning) {
      startPauseText.textContent = 'Pause';
      playPauseIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
    } else {
      startPauseText.textContent = timerState.mode === 'pomodoro' ? 'Start Focus' : 'Start Break';
      playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    }
  }

  function setTimerMode(mode) {
    pauseTimer();
    timerState.mode = mode;
    timerState.totalSeconds = getModeDuration(mode);
    timerState.secondsRemaining = timerState.totalSeconds;

    // Update Active Mode Pill
    modeBtns.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateTimerUI();
  }

  function startTimer() {
    initAudioContext();
    if (timerState.isRunning) return;

    timerState.isRunning = true;
    updateTimerUI();

    timerState.intervalId = setInterval(() => {
      if (timerState.secondsRemaining > 0) {
        timerState.secondsRemaining--;
        updateTimerUI();
      } else {
        onTimerComplete();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!timerState.isRunning) return;
    timerState.isRunning = false;
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    updateTimerUI();
  }

  function toggleTimer() {
    if (timerState.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function resetTimer() {
    pauseTimer();
    timerState.secondsRemaining = timerState.totalSeconds;
    updateTimerUI();
  }

  function skipTimer() {
    pauseTimer();
    onTimerComplete(true);
  }

  function adjustTime(deltaSeconds) {
    timerState.secondsRemaining = Math.max(0, timerState.secondsRemaining + deltaSeconds);
    timerState.totalSeconds = Math.max(timerState.secondsRemaining, timerState.totalSeconds);
    updateTimerUI();
  }

  function onTimerComplete(isSkipped = false) {
    pauseTimer();

    if (!isSkipped) {
      // Play Chime
      playChime();

      // Show Desktop Notification
      if (settings.desktopNotifs && Notification.permission === 'granted') {
        const notifTitle = timerState.mode === 'pomodoro' ? 'Focus Session Completed! 🎉' : 'Break Completed!';
        const notifBody = timerState.mode === 'pomodoro' ? 'Great work! Take a mindful break.' : 'Ready to resume focus?';
        new Notification(notifTitle, { body: notifBody, icon: '🎯' });
      }

      // Log Analytics Stats
      if (timerState.mode === 'pomodoro') {
        const durationMins = Math.round(timerState.totalSeconds / 60);
        logSessionHistory(durationMins);
        timerState.completedSessionsToday++;

        // Auto Increment Active Task Pomo Count
        if (timerState.activeTaskId) {
          const activeTask = tasks.find(t => t.id === timerState.activeTaskId);
          if (activeTask && !activeTask.completed) {
            activeTask.completedPomo++;
            if (activeTask.completedPomo >= activeTask.estPomo) {
              activeTask.completed = true;
            }
            saveTasks();
            renderTasks();
          }
        }
      }
    }

    // Auto Mode Switching Logic
    if (timerState.mode === 'pomodoro') {
      if (timerState.completedSessionsToday % settings.longBreakInterval === 0 && timerState.completedSessionsToday > 0) {
        setTimerMode('longBreak');
      } else {
        setTimerMode('shortBreak');
      }
      if (settings.autoStartBreaks) startTimer();
    } else {
      setTimerMode('pomodoro');
      if (settings.autoStartPomos) startTimer();
    }
  }

  /* ==========================================================================
     5. Task Management Engine
     ========================================================================== */
  let activeCategoryFilter = 'all';

  function saveTasks() {
    localStorage.setItem('zf_tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(t => {
      if (activeCategoryFilter === 'all') return true;
      return t.category === activeCategoryFilter;
    });

    taskCountBadge.textContent = `${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'}`;

    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <div class="empty-task-state">
          No tasks found. Add a task above to begin your focus session.
        </div>
      `;
    } else {
      filteredTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''} ${task.id === timerState.activeTaskId ? 'active-focus' : ''}`;
        
        item.innerHTML = `
          <div class="task-left">
            <div class="checkbox-custom" data-id="${task.id}">
              ${task.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
            </div>
            <div class="task-details">
              <span class="task-item-title">${escapeHTML(task.title)}</span>
              <div class="task-meta">
                <span class="task-tag">${task.category}</span>
                <span class="task-pomo-text">🍅 ${task.completedPomo} / ${task.estPomo}</span>
              </div>
            </div>
          </div>
          <div class="task-right">
            <button class="action-icon-btn pin-task-btn" data-id="${task.id}" title="Pin as Active Focus Task">
              ${task.id === timerState.activeTaskId ? '📌' : '📍'}
            </button>
            <button class="action-icon-btn delete-task-btn" data-id="${task.id}" title="Delete Task">
              🗑️
            </button>
          </div>
        `;

        taskList.appendChild(item);
      });
    }

    renderSpotlightCard();
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function renderSpotlightCard() {
    const activeTask = tasks.find(t => t.id === timerState.activeTaskId) || tasks[0];

    if (!activeTask) {
      spotlightTitle.textContent = 'No active task selected';
      spotlightTag.textContent = 'General';
      spotlightPomoCount.textContent = '🍅 0 / 0 Pomodoros';
      spotlightCompleteBtn.style.display = 'none';
    } else {
      timerState.activeTaskId = activeTask.id;
      spotlightTitle.textContent = activeTask.title;
      spotlightTag.textContent = activeTask.category;
      spotlightPomoCount.textContent = `🍅 ${activeTask.completedPomo} / ${activeTask.estPomo} Pomodoros`;
      spotlightCompleteBtn.style.display = 'flex';
      spotlightCompleteBtn.title = activeTask.completed ? 'Mark Incomplete' : 'Mark Task Complete';
    }
  }

  function addNewTask(title, estPomo, category) {
    const newTask = {
      id: 'task-' + Date.now(),
      title: title.trim(),
      estPomo: parseInt(estPomo, 10) || 1,
      completedPomo: 0,
      category,
      completed: false,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    if (!timerState.activeTaskId) {
      timerState.activeTaskId = newTask.id;
    }
    saveTasks();
    renderTasks();
  }

  /* ==========================================================================
     6. Mindful Box-Breathing Assistant
     ========================================================================== */
  function startBreathing() {
    if (breathingState.isRunning) return;
    breathingState.isRunning = true;
    toggleBreathingBtn.textContent = 'Stop Breathing';
    runBreathingCycle();
  }

  function stopBreathing() {
    breathingState.isRunning = false;
    clearTimeout(breathingState.timerId);
    toggleBreathingBtn.textContent = 'Start Breathing';
    breathingPhase.textContent = 'Inhale';
    breathingSeconds.textContent = '4';
    breathingCircle.className = 'breathing-circle-inner';
  }

  function runBreathingCycle() {
    if (!breathingState.isRunning) return;

    const phases = [
      { name: 'Inhale', class: 'inhale', duration: 4 },
      { name: 'Hold', class: 'hold', duration: 4 },
      { name: 'Exhale', class: 'exhale', duration: 4 },
      { name: 'Hold', class: 'hold', duration: 4 }
    ];

    let currentIdx = 0;

    function step() {
      if (!breathingState.isRunning) return;

      const p = phases[currentIdx];
      breathingPhase.textContent = p.name;
      breathingCircle.className = `breathing-circle-inner ${p.class}`;

      let countdown = p.duration;
      breathingSeconds.textContent = countdown;

      const countdownInterval = setInterval(() => {
        if (!breathingState.isRunning) {
          clearInterval(countdownInterval);
          return;
        }
        countdown--;
        if (countdown > 0) {
          breathingSeconds.textContent = countdown;
        } else {
          clearInterval(countdownInterval);
          currentIdx = (currentIdx + 1) % phases.length;
          step();
        }
      }, 1000);
    }

    step();
  }

  /* ==========================================================================
     7. Analytics & History Logger
     ========================================================================== */
  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  function logSessionHistory(minutes) {
    const today = getTodayKey();
    if (!history[today]) {
      history[today] = { minutes: 0, sessions: 0, tasksCompleted: 0 };
    }
    history[today].minutes += minutes;
    history[today].sessions += 1;

    localStorage.setItem('zf_history', JSON.stringify(history));
    updateAnalyticsUI();
  }

  function updateAnalyticsUI() {
    const today = getTodayKey();
    const todayData = history[today] || { minutes: 0, sessions: 0, tasksCompleted: 0 };

    document.getElementById('statTodayMinutes').textContent = `${todayData.minutes}m`;
    document.getElementById('statTodaySessions').textContent = `${todayData.sessions}`;

    // Calculate Streak
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const key = `${checkDate.getFullYear()}-${(checkDate.getMonth() + 1).toString().padStart(2, '0')}-${checkDate.getDate().toString().padStart(2, '0')}`;
      if (history[key] && history[key].sessions > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    document.getElementById('statStreak').textContent = `${streak} Day${streak === 1 ? '' : 's'}`;
    const completedTasksCount = tasks.filter(t => t.completed).length;
    document.getElementById('statTasksDone').textContent = `${completedTasksCount}`;

    renderWeeklyChart();
  }

  function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChartCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fit canvas width to container
    canvas.width = canvas.parentElement.clientWidth - 32;
    canvas.height = 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get last 7 days keys
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const mins = history[key] ? history[key].minutes : 0;
      days.push({ dayName, mins });
    }

    const maxMins = Math.max(60, ...days.map(d => d.mins));
    const paddingLeft = 30;
    const paddingBottom = 30;
    const chartWidth = canvas.width - paddingLeft - 10;
    const chartHeight = canvas.height - paddingBottom - 20;

    const barWidth = Math.min(36, chartWidth / 7 - 12);
    const stepX = chartWidth / 7;

    // Draw Bars
    days.forEach((d, idx) => {
      const x = paddingLeft + idx * stepX + (stepX - barWidth) / 2;
      const barH = (d.mins / maxMins) * chartHeight;
      const y = canvas.height - paddingBottom - barH;

      // Gradient Bar
      const grad = ctx.createLinearGradient(0, y, 0, canvas.height - paddingBottom);
      grad.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4a7c59');
      grad.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#88a782');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, Math.max(4, barH), 6);
      ctx.fill();

      // Day Label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#627567';
      ctx.font = '12px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText(d.dayName, x + barWidth / 2, canvas.height - 8);

      // Mins Value on Top
      if (d.mins > 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#243328';
        ctx.font = '11px Space Grotesk';
        ctx.fillText(`${d.mins}m`, x + barWidth / 2, y - 6);
      }
    });
  }

  /* ==========================================================================
     8. Ambient Canvas Particle Animation
     ========================================================================== */
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const numParticles = 24;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-glow').trim() || 'rgba(74, 124, 89, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ==========================================================================
     9. Event Listeners & Interactions
     ========================================================================== */
  // Mode Button Clicks
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimerMode(btn.dataset.mode);
    });
  });

  // Timer Controls
  startPauseBtn.addEventListener('click', toggleTimer);
  resetTimerBtn.addEventListener('click', resetTimer);
  skipTimerBtn.addEventListener('click', skipTimer);

  add1mBtn.addEventListener('click', () => adjustTime(60));
  add5mBtn.addEventListener('click', () => adjustTime(300));
  sub1mBtn.addEventListener('click', () => adjustTime(-60));

  // Spotlight Actions
  spotlightCompleteBtn.addEventListener('click', () => {
    if (!timerState.activeTaskId) return;
    const activeTask = tasks.find(t => t.id === timerState.activeTaskId);
    if (activeTask) {
      activeTask.completed = !activeTask.completed;
      saveTasks();
      renderTasks();
    }
  });

  // Task Add Form Toggle
  addTaskToggleBtn.addEventListener('click', () => {
    addTaskForm.classList.toggle('hidden');
    if (!addTaskForm.classList.contains('hidden')) {
      document.getElementById('taskTitleInput').focus();
    }
  });

  cancelAddTaskBtn.addEventListener('click', () => {
    addTaskForm.classList.add('hidden');
  });

  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitleInput').value;
    const estPomo = document.getElementById('taskEstPomoInput').value;
    const category = document.getElementById('taskCategoryInput').value;

    if (title) {
      addNewTask(title, estPomo, category);
      document.getElementById('taskTitleInput').value = '';
      addTaskForm.classList.add('hidden');
    }
  });

  // Task List Item Clicks
  taskList.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.checkbox-custom');
    if (checkbox) {
      const id = checkbox.dataset.id;
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      }
      return;
    }

    const pinBtn = e.target.closest('.pin-task-btn');
    if (pinBtn) {
      timerState.activeTaskId = pinBtn.dataset.id;
      renderTasks();
      return;
    }

    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
      tasks = tasks.filter(t => t.id !== deleteBtn.dataset.id);
      if (timerState.activeTaskId === deleteBtn.dataset.id) {
        timerState.activeTaskId = tasks.length > 0 ? tasks[0].id : null;
      }
      saveTasks();
      renderTasks();
      return;
    }
  });

  // Category Filter Chips
  categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.cat-chip');
    if (chip) {
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategoryFilter = chip.dataset.cat;
      renderTasks();
    }
  });

  // Mindful Breathing Toggle
  toggleBreathingBtn.addEventListener('click', () => {
    if (breathingState.isRunning) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  // Theme Dropdown & Switcher
  themeToggleBtn.addEventListener('click', () => {
    themeMenu.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-dropdown-wrapper')) {
      themeMenu.classList.remove('show');
    }
  });

  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedTheme = opt.dataset.theme;
      setTheme(selectedTheme);
      themeMenu.classList.remove('show');
    });
  });

  function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    settings.theme = themeName;
    localStorage.setItem('zf_settings', JSON.stringify(settings));

    themeOpts.forEach(opt => {
      if (opt.dataset.theme === themeName) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    renderWeeklyChart();
  }

  // Audio Mixer Modal & Sound Toggles
  audioMixerBtn.addEventListener('click', () => {
    audioMixerModal.classList.remove('hidden');
  });

  document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const soundKey = btn.dataset.sound;
      if (activeAudioLayers[soundKey]) {
        Soundscapes[soundKey].stop();
        activeAudioLayers[soundKey] = null;
        btn.classList.remove('active');
        btn.textContent = 'Off';
      } else {
        Soundscapes[soundKey].start();
        activeAudioLayers[soundKey] = true;
        btn.classList.add('active');
        btn.textContent = 'On';
      }
      updateSoundIndicator();
    });
  });

  ['rain', 'ocean', 'forest', 'hearth'].forEach(sound => {
    const slider = document.getElementById(`${sound}Volume`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        Soundscapes[sound].setVolume(e.target.value);
      });
    }
  });

  function updateSoundIndicator() {
    const hasActiveAudio = Object.values(activeAudioLayers).some(val => val === true);
    if (hasActiveAudio) {
      soundIndicator.classList.add('active');
    } else {
      soundIndicator.classList.remove('active');
    }
  }

  document.getElementById('previewChimeBtn').addEventListener('click', () => {
    const selectedChime = document.getElementById('chimeSoundSelect').value;
    playChime(selectedChime);
  });

  // Modal Closures
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.close;
      document.getElementById(targetId).classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
      }
    });
  });

  // Stats Modal Toggle
  statsModalBtn.addEventListener('click', () => {
    updateAnalyticsUI();
    statsModal.classList.remove('hidden');
  });

  // Settings Modal Toggle & Save
  settingsModalBtn.addEventListener('click', () => {
    document.getElementById('settingFocus').value = settings.focusMinutes;
    document.getElementById('settingShortBreak').value = settings.shortBreakMinutes;
    document.getElementById('settingLongBreak').value = settings.longBreakMinutes;
    document.getElementById('settingLongBreakInterval').value = settings.longBreakInterval;
    document.getElementById('settingAutoStartBreaks').checked = settings.autoStartBreaks;
    document.getElementById('settingAutoStartPomos').checked = settings.autoStartPomos;
    document.getElementById('settingDesktopNotifs').checked = settings.desktopNotifs;
    document.getElementById('chimeSoundSelect').value = settings.chimeSound;

    settingsModal.classList.remove('hidden');
  });

  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    settings.focusMinutes = parseInt(document.getElementById('settingFocus').value, 10) || 25;
    settings.shortBreakMinutes = parseInt(document.getElementById('settingShortBreak').value, 10) || 5;
    settings.longBreakMinutes = parseInt(document.getElementById('settingLongBreak').value, 10) || 15;
    settings.longBreakInterval = parseInt(document.getElementById('settingLongBreakInterval').value, 10) || 4;
    settings.autoStartBreaks = document.getElementById('settingAutoStartBreaks').checked;
    settings.autoStartPomos = document.getElementById('settingAutoStartPomos').checked;
    settings.desktopNotifs = document.getElementById('settingDesktopNotifs').checked;
    settings.chimeSound = document.getElementById('chimeSoundSelect').value;

    if (settings.desktopNotifs && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    localStorage.setItem('zf_settings', JSON.stringify(settings));
    settingsModal.classList.add('hidden');

    // Update current mode timer duration if paused
    if (!timerState.isRunning) {
      setTimerMode(timerState.mode);
    }
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tasks and focus history?')) {
      localStorage.clear();
      settings = DEFAULT_SETTINGS;
      tasks = DEFAULT_TASKS;
      history = {};
      setTheme(DEFAULT_SETTINGS.theme);
      setTimerMode('pomodoro');
      renderTasks();
      settingsModal.classList.add('hidden');
    }
  });

  // Zen Fullscreen Focus Mode
  fullscreenToggleBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => {});
      }
    }
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggleTimer();
    } else if (e.code === 'KeyR') {
      resetTimer();
    } else if (e.code === 'KeyS') {
      skipTimer();
    } else if (e.code === 'KeyF') {
      fullscreenToggleBtn.click();
    } else if (e.code === 'KeyM') {
      // Mute / Unmute ambient soundscapes
      const anyActive = Object.values(activeAudioLayers).some(v => v === true);
      document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
        if (anyActive) {
          if (btn.classList.contains('active')) btn.click();
        }
      });
    }
  });

  /* ==========================================================================
     10. Initialization
     ========================================================================== */
  setTheme(settings.theme);
  setTimerMode('pomodoro');
  renderTasks();
  initAmbientCanvas();
});
