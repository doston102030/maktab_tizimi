import { useState, useEffect, useCallback, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Coffee } from 'lucide-react';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { ShiftSelector } from '@/components/dashboard/ShiftSelector';
import { LessonList } from '@/components/dashboard/LessonList';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { BottomNav } from '@/components/layout/BottomNav';
import type { AppState, Language, DayId } from '@/types';
import { parse, isWithinInterval, format } from 'date-fns';
import { i18n } from '@/lib/i18n';

import { INITIAL_STATE } from '@/initialState';
import { translateLessonName } from '@/lib/translate';

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

function getCurrentDayId(): DayId {
  const dayIndex = new Date().getDay();
  if (dayIndex === 0) return 'Yakshanba';
  const mappedIndex = dayIndex - 1;
  return DAYS[mappedIndex] || 'Dushanba';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_session') === 'true';
  });

  const handleLoginSuccess = useCallback(() => {
    localStorage.setItem('auth_session', 'true');
    setIsAuthenticated(true);
  }, []);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('bell_app_state');
    const parsed = saved ? JSON.parse(saved) : INITIAL_STATE;
    return {
      ...parsed,
      selectedDay: getCurrentDayId()
    };
  });

  const t = i18n[state.language];

  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);

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

  useEffect(() => {
    localStorage.setItem('bell_app_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(state.theme);
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  }, []);

  const handleSettingsClick = useCallback(() => setCurrentView('settings'), []);
  const handleBackToDashboard = useCallback(() => setCurrentView('dashboard'), []);
  const handleSelectDay = useCallback((day: DayId) => setState(prev => ({ ...prev, selectedDay: day })), []);
  const handleSelectShift = useCallback((shift: string) => setState(prev => ({ ...prev, selectedShift: shift as any })), []);
  const handleSaveState = useCallback((newState: AppState) => setState(newState), []);

  const currentDaySchedule = state.schedule[state.selectedDay];
  const activeLessons = useMemo(() =>
    currentDaySchedule?.shifts[state.selectedShift]?.lessons || [],
    [currentDaySchedule, state.selectedShift]
  );

  const status = useMemo(() => {
    const t = i18n[state.language];

    if (!activeLessons.length || !currentDaySchedule?.isActive) {
      if (state.selectedDay === 'Yakshanba') {
        return { text: "Dam olish kuni", variant: 'rest' as const };
      }
      return { text: t.noLessons, variant: 'default' as const };
    }

    const todayStr = format(now, 'yyyy-MM-dd');
    const sorted = [...activeLessons].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const lastLesson = sorted[sorted.length - 1];
    const lastEnd = parse(`${todayStr} ${lastLesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now > lastEnd) return { text: t.finished, variant: 'finished' as const };

    const firstLesson = sorted[0];
    const firstStart = parse(`${todayStr} ${firstLesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
    if (now < firstStart) return { text: t.notStarted, variant: 'default' as const };

    for (const lesson of sorted) {
      const start = parse(`${todayStr} ${lesson.startTime}`, 'yyyy-MM-dd HH:mm', now);
      const end = parse(`${todayStr} ${lesson.endTime}`, 'yyyy-MM-dd HH:mm', now);
      if (isWithinInterval(now, { start, end })) {
        return { text: translateLessonName(lesson.name, state.language), activeLessonId: lesson.id, variant: 'active' as const };
      }
    }

    return { text: t.break, variant: 'default' as const };
  }, [activeLessons, currentDaySchedule?.isActive, state.language, state.selectedDay, now]);

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center relative overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }} />

      <div className="mega-mesh" aria-hidden="true">
        {/* Light Mode Mesh */}
        <div className="mega-mesh-layer mesh-light">
          <div className="mega-mesh-orb-1" />
          <div className="mega-mesh-orb-2" />
          <div className="mega-mesh-orb-3" />
        </div>
        {/* Dark Mode Mesh */}
        <div className="mega-mesh-layer mesh-dark">
          <div className="mega-mesh-orb-1-dark" />
          <div className="mega-mesh-orb-2-dark" />
          <div className="mega-mesh-orb-3-dark" />
        </div>
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
              onSettingsClick={handleSettingsClick}
            />

            <main className="w-full max-w-3xl px-3 sm:px-6 pb-24 space-y-6 md:space-y-8 flex flex-col items-center mt-2 md:mt-4 z-10 transition-opacity duration-300">
              <section className="w-full">
                <DaySelector
                  selectedDay={state.selectedDay}
                  onSelect={handleSelectDay}
                  language={state.language}
                />
              </section>

              <section className="flex flex-col items-center gap-4 sm:gap-8 w-full">
                <ShiftSelector
                  selectedShift={state.selectedShift}
                  onSelect={handleSelectShift}
                  language={state.language}
                />

                <div className="w-full flex justify-center">
                  <StatusPill status={status.text} variant={status.variant} />
                </div>
              </section>

              <section className="w-full">
                {!currentDaySchedule?.isActive && state.selectedDay === 'Yakshanba' ? (
                  <div className="w-full animate-in zoom-in-95 duration-700 fade-in">
                    <div className="glass-card bg-background/40 border-white/10 dark:bg-[#0c101d]/40 rounded-[2.5rem] p-8 sm:p-16 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-500/20 rounded-full blur-[80px]" />
                      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-[100px]" />

                      <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20 border border-emerald-500/20 rotate-3 transition-transform duration-500">
                          <Coffee size={56} className="sm:size-72" />
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">
                          {t.holiday}
                        </div>
                        <h3 className="text-4xl sm:text-5xl font-black text-foreground uppercase tracking-tighter">
                          {t.restDay}
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-sm mx-auto leading-relaxed">
                          {t.noLessonsToday} <br />
                          <span className="text-emerald-500/80">{t.enjoyRest}</span>
                        </p>
                      </div>
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
            onSave={handleSaveState}
            onBack={handleBackToDashboard}
          />
        ))}

      {isAuthenticated && currentView !== 'settings' && (
        <BottomNav
          currentView={currentView}
          onViewChange={setCurrentView}
          language={state.language}
        />
      )}
    </div>
  );
}

export default App;
