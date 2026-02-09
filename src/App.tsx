import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { ShiftSelector } from '@/components/dashboard/ShiftSelector';
import { LessonList } from '@/components/dashboard/LessonList';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { LoginPage } from '@/components/auth/LoginPage';
import type { AppState, Language } from '@/types';
import { parse, isWithinInterval, format } from 'date-fns';
import { i18n } from '@/lib/i18n';

import { INITIAL_STATE } from '@/initialState';
import type { DayId } from '@/types';

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

function getCurrentDayId(): DayId {
  const dayIndex = new Date().getDay(); // 0 = Yakshanba (Sunday)
  if (dayIndex === 0) return 'Dushanba'; // Sunday -> Show Monday
  // dayIndex 1=Mon ... 6=Sat.
  // Our array is 0=Mon ... 5=Sat.
  // So: index 1 -> array[0], index 6 -> array[5].
  const mappedIndex = dayIndex - 1;
  return DAYS[mappedIndex] || 'Dushanba';
}

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_session') === 'true';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('auth_session', 'true');
    setIsAuthenticated(true);
  };

  // ... existing state ...
  // Load from local storage or use initial
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('bell_app_state');
    const parsed = saved ? JSON.parse(saved) : INITIAL_STATE;
    // Always override selectedDay with current day on boot
    return {
      ...parsed,
      selectedDay: getCurrentDayId()
    };
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [now, setNow] = useState(new Date());

  // Timer for logic updates (every second)
  // Timer for logic updates (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());

      // Auto-update selected day if it changes (e.g. midnight crossover)
      // Only do this if user hasn't explicitly locked it? 
      // For this app, let's keep it synced to real-time for "Live" feel as requested.
      // Or at least update it if it drifts.
      const currentRealDay = getCurrentDayId();
      setState(prev => {
        if (prev.selectedDay !== currentRealDay) {
          return { ...prev, selectedDay: currentRealDay };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('bell_app_state', JSON.stringify(state));
  }, [state]);

  // Theme support
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(state.theme);
  }, [state.theme]);

  // Handlers
  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const setLanguage = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  // Logic: Get current schedule
  const currentDaySchedule = state.schedule[state.selectedDay];
  // If undefined, return empty list
  const activeLessons = currentDaySchedule?.shifts[state.selectedShift]?.lessons || [];

  // Logic: Calculate Status
  const getStatus = (): { text: string; activeLessonId?: string } => {
    // Localization helper
    const t = i18n[state.language];

    if (!activeLessons.length) return { text: t.noLessons };

    const todayStr = format(now, 'yyyy-MM-dd');

    // Sort lessons by time just in case
    const sorted = [...activeLessons].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Check if finished
    const lastLesson = sorted[sorted.length - 1];
    const lastEnd = parse(`${todayStr} ${lastLesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now > lastEnd) return { text: t.finished };

    // Check if not started
    const firstLesson = sorted[0];
    const firstStart = parse(`${todayStr} ${firstLesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now < firstStart) return { text: t.notStarted };

    // Check if inside a lesson
    for (const lesson of sorted) {
      const start = parse(`${todayStr} ${lesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
      const end = parse(`${todayStr} ${lesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
      if (isWithinInterval(now, { start, end })) {
        return { text: `${lesson.name}`, activeLessonId: lesson.id };
      }
    }

    // Must be break
    return { text: t.break };
  };

  const status = getStatus();

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center relative overflow-hidden transition-colors duration-500">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }} />

      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {!isAuthenticated ? (
        <LoginPage onLogin={handleLoginSuccess} />
      ) : (
        currentView === 'dashboard' ? (
          <>
            <Header
              schoolName={state.config.schoolName}
              subtitle={state.config.subtitle}
              theme={state.theme}
              toggleTheme={toggleTheme}
              language={state.language}
              setLanguage={setLanguage}
              onSettingsClick={() => setCurrentView('settings')}
            />

            <main className="w-full max-w-5xl px-3 sm:px-6 pb-24 space-y-6 md:space-y-12 flex flex-col items-center mt-4 md:mt-10 z-10">
              <section className="w-full animate-in slide-in-from-top-4 duration-700 fade-in">
                <DaySelector
                  selectedDay={state.selectedDay}
                  onSelect={(day) => setState(prev => ({ ...prev, selectedDay: day }))}
                  language={state.language}
                />
              </section>

              <section className="flex flex-col items-center gap-8 w-full animate-in slide-in-from-bottom-6 duration-700 delay-100 fade-in fill-mode-backwards">
                <ShiftSelector
                  selectedShift={state.selectedShift}
                  onSelect={(shift) => setState(prev => ({ ...prev, selectedShift: shift }))}
                  language={state.language}
                />

                <div className="w-full flex justify-center scale-110 active:scale-105 transition-transform duration-300">
                  <StatusPill status={status.text} isActive={!!status.activeLessonId} />
                </div>
              </section>

              <section className="w-full animate-in slide-in-from-bottom-12 duration-1000 delay-200 fade-in fill-mode-backwards">
                <LessonList
                  lessons={activeLessons}
                  activeLessonId={status.activeLessonId}
                  language={state.language}
                />
              </section>
            </main>
          </>
        ) : (
          <SettingsPage
            appState={state}
            onSave={(newState) => {
              setState(newState);
              // Saved to localstorage via effect immediately
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        ))}
    </div>
  );
}

export default App;
