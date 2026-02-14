import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Coffee } from 'lucide-react';
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
import { translateLessonName } from '@/lib/translate';
import type { DayId } from '@/types';

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

function getCurrentDayId(): DayId {
  const dayIndex = new Date().getDay(); // 0 = Yakshanba (Sunday)
  if (dayIndex === 0) return 'Yakshanba';
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
  const getStatus = (): { text: string; activeLessonId?: string; variant: 'active' | 'finished' | 'default' | 'rest' } => {
    // Localization helper
    const t = i18n[state.language];

    if (!activeLessons.length || !currentDaySchedule?.isActive) {
      if (state.selectedDay === 'Yakshanba') {
        return { text: "Dam olish kuni", variant: 'rest' };
      }
      return { text: t.noLessons, variant: 'default' };
    }

    const todayStr = format(now, 'yyyy-MM-dd');

    // Sort lessons by time just in case
    const sorted = [...activeLessons].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Check if finished
    const lastLesson = sorted[sorted.length - 1];
    const lastEnd = parse(`${todayStr} ${lastLesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now > lastEnd) return { text: t.finished, variant: 'finished' };

    // Check if not started
    const firstLesson = sorted[0];
    const firstStart = parse(`${todayStr} ${firstLesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now < firstStart) return { text: t.notStarted, variant: 'default' };

    // Check if inside a lesson
    for (const lesson of sorted) {
      const start = parse(`${todayStr} ${lesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
      const end = parse(`${todayStr} ${lesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
      if (isWithinInterval(now, { start, end })) {
        return { text: translateLessonName(lesson.name, state.language), activeLessonId: lesson.id, variant: 'active' };
      }
    }

    // Must be break
    return { text: t.break, variant: 'default' };
  };

  const status = getStatus();

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center relative overflow-x-hidden transition-colors duration-500">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }} />


      {/* Mega Mesh Background Layer */}
      <div className="mega-mesh">
        <div className="mega-mesh-orb-1" />
        <div className="mega-mesh-orb-2" />
        <div className="mega-mesh-orb-3" />
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

            <main className="w-full max-w-3xl px-3 sm:px-6 pb-24 space-y-6 md:space-y-8 flex flex-col items-center mt-2 md:mt-4 z-10">
              <section className="w-full animate-in slide-in-from-top-4 duration-700 fade-in">
                <DaySelector
                  selectedDay={state.selectedDay}
                  onSelect={(day) => setState(prev => ({ ...prev, selectedDay: day }))}
                  language={state.language}
                />
              </section>

              <section className="flex flex-col items-center gap-4 sm:gap-8 w-full animate-in slide-in-from-bottom-6 duration-700 delay-100 fade-in fill-mode-backwards">
                <ShiftSelector
                  selectedShift={state.selectedShift}
                  onSelect={(shift) => setState(prev => ({ ...prev, selectedShift: shift }))}
                  language={state.language}
                />

                <div className="w-full flex justify-center scale-100 active:scale-95 transition-transform duration-300">
                  <StatusPill status={status.text} variant={status.variant} />
                </div>
              </section>

              <section className="w-full animate-in slide-in-from-bottom-12 duration-1000 delay-200 fade-in fill-mode-backwards">
                {!currentDaySchedule?.isActive && state.selectedDay === 'Yakshanba' ? (
                  <div className="w-full animate-in zoom-in-95 duration-700 fade-in">
                    <div className="glass-card bg-background/40 border-white/10 dark:bg-[#0c101d]/40 rounded-[2.5rem] p-8 sm:p-16 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group shadow-2xl">
                      {/* Background Glows */}
                      <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-colors duration-700" />
                      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-700" />

                      <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20 animate-pulse border border-emerald-500/20 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                          <Coffee size={56} className="sm:size-72" />
                        </div>
                        {/* Little steam bubbles */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400/40 animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30 animate-bounce delay-300" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-bounce delay-500" />
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[0.2em] shadow-inner">
                          {state.language === 'UZ' ? 'Hordiq' : state.language === 'RU' ? 'Отдых' : 'Relax'}
                        </div>
                        <h3 className="text-4xl sm:text-5xl font-black text-foreground uppercase tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                          Dam olish kuni
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-sm mx-auto leading-relaxed">
                          Bugun maktabda darslar mavjud emas. <br />
                          <span className="text-emerald-500/80">Maroqli hordiq chiqaring!</span>
                        </p>
                      </div>

                      {/* Bottom Decorative Element */}
                      <div className="w-32 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent rounded-full" />
                    </div>
                  </div>
                ) : (
                  <LessonList
                    lessons={activeLessons}
                    activeLessonId={status.activeLessonId}
                    language={state.language}
                  />
                )}
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
