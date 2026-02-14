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
                <div className="text-3xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-sm leading-none">
                    {format(time, 'HH:mm')}
                    <span className="text-xl text-muted-foreground ml-0.5 animate-pulse relative -top-1">:</span>
                    {format(time, 'ss')}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest bg-secondary/50 px-3 py-0.5 rounded-full mt-1 backdrop-blur-md border border-white/5">
                    {format(time, 'EEEE • d MMMM', { locale: LOCALE_MAP[language] })}
                </div>
            </div>

            {/* Mobile View (Premium Aura Clock) */}
            <div className="flex md:hidden flex-col items-center justify-center relative mt-2 mb-4 w-full">
                {/* Aura Glow Layer */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-3xl animate-aura opacity-60" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tighter tabular-nums text-foreground drop-shadow-xl">
                            {format(time, 'HH:mm')}
                        </span>
                        <span className="text-lg font-black text-primary animate-pulse tabular-nums">
                            {format(time, 'ss')}
                        </span>
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.25em] -mt-1 drop-shadow-sm">
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
                <div className="px-4 sm:px-6 py-2.5 md:h-20 flex flex-col items-center justify-between gap-y-2 md:gap-y-0 relative">

                    {/* Top Row: Logo/Name + Controls (One Row on Mobile) */}
                    <div className="w-full flex items-center justify-between z-20">
                        {/* Left: Logo & School Name */}
                        <div className="flex items-center gap-2 md:gap-4 group cursor-pointer shrink-0">
                            <div className="relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
                                <Bell size={18} className="text-white animate-[shake_4s_infinite] md:w-6 md:h-6 fill-white/10" />
                                <div className="absolute inset-0 bg-white/20 rounded-xl md:rounded-2xl animate-pulse blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-sm md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 group-hover:from-primary group-hover:to-primary transition-all leading-none">
                                    {schoolName}
                                </h1>
                                <span className="text-[10px] md:text-xs font-bold text-muted-foreground/50 tracking-widest uppercase mt-1">
                                    {subtitle}
                                </span>
                            </div>
                        </div>

                        {/* Controls (Universal Style) */}
                        <div className="flex items-center gap-1.5 md:gap-2.5">
                            <button
                                onClick={toggleTheme}
                                className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.03] dark:border-white/5 active:scale-90 transition-all shadow-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
                            >
                                {theme === 'dark' ? <Sun size={18} className="text-amber-400 fill-amber-400" /> : <Moon size={18} className="text-indigo-600 fill-indigo-600" />}
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
                                className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.03] dark:border-white/5 active:scale-90 transition-all shadow-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
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
