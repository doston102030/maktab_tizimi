import { useState, useEffect } from 'react';
import { Sun, Moon, Settings, Globe, Bell } from 'lucide-react';
import type { Language, Theme } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { LOCALE_MAP } from '@/lib/i18n';

interface HeaderProps {
    schoolName: string;
    subtitle: string;
    theme: Theme;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    onSettingsClick: () => void;
}

function Clock({ language }: { language: Language }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            {/* Desktop View (Absolute Center) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center pointer-events-none">
                <div className="text-2xl font-black tabular-nums tracking-tighter text-foreground/80 drop-shadow-sm leading-none">
                    {format(time, 'HH:mm')}
                    <span className="text-sm text-muted-foreground/60 mx-0.5 animate-pulse">:</span>
                    {format(time, 'ss')}
                </div>
                <div className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1.5 opacity-60">
                    {format(time, 'EEEE • d MMMM', { locale: LOCALE_MAP[language] })}
                </div>
            </div>

            {/* Mobile View (Premium Aura Clock) */}
            <div className="flex md:hidden flex-col items-center justify-center relative mt-1 mb-1 w-full translate-y-1">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tighter tabular-nums text-foreground opacity-90">
                            {format(time, 'HH:mm')}
                        </span>
                        <span className="text-xs font-black text-primary animate-pulse tabular-nums">
                            {format(time, 'ss')}
                        </span>
                    </div>
                    {/* Added missing mobile date */}
                    <div className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-0.5">
                        {format(time, 'EEEE • d MMMM', { locale: LOCALE_MAP[language] })}
                    </div>
                </div>
            </div>
        </>
    );
}

export function Header({ schoolName, subtitle, theme, toggleTheme, language, setLanguage, onSettingsClick }: HeaderProps) {
    const [isLangOpen, setIsLangOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300 px-3 sm:px-6 py-2 sm:py-4">
            {/* Glass Background Container - Compact Floating Island */}
            <div className="w-full max-w-7xl mx-auto glass-ios rounded-3xl md:rounded-[2.5rem]">
                <div className="px-3 md:px-8 py-3 md:h-28 flex flex-col items-center justify-between gap-y-1 md:gap-y-0 relative">

                    {/* Top Row: Logo/Name + Controls (One Row on Mobile) */}
                    <div className="w-full flex items-center justify-between z-20 gap-1.5">
                        {/* Left: Logo & School Name */}
                        <div className="flex items-center gap-2 md:gap-8 group cursor-pointer shrink min-w-0">
                            <div className="relative flex items-center justify-center w-11 h-11 md:w-16 md:h-16 rounded-xl md:rounded-[1.25rem] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-xl group-hover:scale-105 transition-transform duration-500 shrink-0">
                                <Bell size={22} className="text-white animate-[shake_4s_infinite] md:w-10 md:h-10 fill-white/10" />
                                <div className="absolute inset-0 bg-white/20 rounded-xl md:rounded-[1.25rem] animate-pulse blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <h1 className="text-base md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 group-hover:from-primary group-hover:to-primary transition-all leading-none truncate">
                                    {schoolName}
                                </h1>
                                <span className="text-[9px] md:text-sm font-bold text-muted-foreground/50 tracking-[0.1em] md:tracking-[0.2em] uppercase mt-0.5 md:mt-2 truncate">
                                    {subtitle}
                                </span>
                            </div>
                        </div>

                        {/* Controls (Universal Style) */}
                        <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
                            <button
                                onClick={toggleTheme}
                                className="w-8 h-8 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.03] dark:border-white/5 active:scale-90 transition-all shadow-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
                            >
                                {theme === 'dark' ? <Sun size={16} className="md:w-[18px] md:h-[18px] text-amber-400 fill-amber-400" /> : <Moon size={16} className="md:w-[18px] md:h-[18px] text-indigo-600 fill-indigo-600" />}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className={cn(
                                        "w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.03] dark:border-white/5 active:scale-90 transition-all shadow-sm hover:bg-black/[0.06] dark:hover:bg-white/10",
                                        isLangOpen && "bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/40"
                                    )}
                                >
                                    <Globe size={18} className={cn("transition-colors", isLangOpen ? "text-primary" : "text-foreground/80")} />
                                </button>

                                {isLangOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                        <div className="absolute top-11 md:top-13 right-0 bg-background/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[100px]">
                                            {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => { setLanguage(lang); setIsLangOpen(false); }}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all",
                                                        language === lang ? "bg-primary text-white shadow-lg" : "hover:bg-primary/10 text-muted-foreground"
                                                    )}
                                                >
                                                    <span>{lang === 'UZ' ? '🇺🇿' : lang === 'RU' ? '🇷🇺' : '🇬🇧'}</span>
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={onSettingsClick}
                                className="hidden md:flex w-9 h-9 md:w-11 md:h-11 items-center justify-center rounded-xl md:rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.03] dark:border-white/5 active:scale-90 transition-all shadow-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
                            >
                                <Settings size={18} className="text-foreground/80" />
                            </button>
                        </div>
                    </div>

                    {/* Optimized Clock Component */}
                    <Clock language={language} />
                </div>
            </div>
        </header>
    );
}
