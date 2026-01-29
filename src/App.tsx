import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { ShiftSelector } from '@/components/dashboard/ShiftSelector';
import { LessonList } from '@/components/dashboard/LessonList';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { LoginPage } from '@/components/auth/LoginPage'; // Import Login
import type { AppState, Language } from '@/types';
import { parse, isWithinInterval, format } from 'date-fns';

import { INITIAL_STATE } from '@/initialState';

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
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [now, setNow] = useState(new Date());

  // Timer for logic updates (every second)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
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
    if (!activeLessons.length) return { text: 'Darslar mavjud emas' };

    const todayStr = format(now, 'yyyy-MM-dd');

    // Sort lessons by time just in case
    const sorted = [...activeLessons].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Check if finished
    const lastLesson = sorted[sorted.length - 1];
    const lastEnd = parse(`${todayStr} ${lastLesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now > lastEnd) return { text: 'Darslar tugadi' };

    // Check if not started
    const firstLesson = sorted[0];
    const firstStart = parse(`${todayStr} ${firstLesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now < firstStart) return { text: 'Darslar boshlanmadi' };

    // Check if inside a lesson
    for (const lesson of sorted) {
      const start = parse(`${todayStr} ${lesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
      const end = parse(`${todayStr} ${lesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
      if (isWithinInterval(now, { start, end })) {
        return { text: `${lesson.name} davom etmoqda`, activeLessonId: lesson.id };
      }
    }

    // Must be break
    return { text: 'Tanaffus' };
  };

  const status = getStatus();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-2 sm:p-4 transition-colors duration-300">
      <Toaster position="top-right" />

      {!isAuthenticated ? (
        <LoginPage onLogin={handleLoginSuccess} />
      ) : (
        currentView === 'dashboard' ? (
          <div className="w-full max-w-5xl space-y-4 md:space-y-6 flex flex-col items-center">
            <Header
              schoolName={state.config.schoolName}
              subtitle={state.config.subtitle}
              theme={state.theme}
              toggleTheme={toggleTheme}
              language={state.language}
              setLanguage={setLanguage}
              onSettingsClick={() => setCurrentView('settings')}
            />

            <div className="flex flex-col items-center gap-4 md:gap-6 w-full px-2 sm:px-4">
              <DaySelector
                selectedDay={state.selectedDay}
                onSelect={(day) => setState(prev => ({ ...prev, selectedDay: day }))}
              />

              <ShiftSelector
                selectedShift={state.selectedShift}
                onSelect={(shift) => setState(prev => ({ ...prev, selectedShift: shift }))}
              />

              <StatusPill status={status.text} />

              <LessonList lessons={activeLessons} />
              {/* Note: I didn't pass activeLessonId to LessonList yet, but LessonList renders cards.
                The LessonCard supports 'isActive' prop. 
                I should update LessonList to accept activeLessonId prop if I want highlighting.
                Prompt says "Lesson card styling... Subtle shadow...". 
                It doesn't explicitly require highlighting active lesson, 
                but "Status pill" shows status.
                I'll stick to strict UI props from earlier.
            */}
            </div>
          </div>
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
