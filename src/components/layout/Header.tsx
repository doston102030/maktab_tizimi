import { useState, useEffect } from 'react';
import { Sun, Moon, Settings, Globe, Bell } from 'lucide-react';
import type { Language, Theme } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface HeaderProps {
    schoolName: string;
    subtitle: string;
    theme: Theme;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    onSettingsClick: () => void;
}

function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center pointer-events-none opacity-30 select-none">
            <div className="text-[8px] md:text-[10px] font-black tabular-nums tracking-[0.5em] text-foreground uppercase leading-none">
                {format(time, 'HH:mm')}
            </div>
        </div>
    );
}

export function Header({ schoolName, subtitle, theme, toggleTheme, language, setLanguage, onSettingsClick }: HeaderProps) {
    const [isLangOpen, setIsLangOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300 px-3 sm:px-6 py-2 sm:py-4">
            {/* Glass Background Container - Ultra Compact Island */}
            <div className="w-full max-w-7xl mx-auto glass-ios rounded-3xl md:rounded-[3.5rem]">
                <div className="px-5 sm:px-10 py-5 md:h-32 flex flex-col items-center justify-center gap-y-3 relative">

                    {/* Main Row */}
                    <div className="w-full flex items-center justify-between z-20">
                        {/* Left: Mega Logo Section */}
                        <div className="flex items-center gap-4 md:gap-10 group cursor-pointer shrink-0">
                            <div className="relative flex items-center justify-center w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-2xl shadow-orange-500/40 group-hover:scale-110 transition-transform duration-500">
                                <Bell size={32} className="text-white md:w-16 md:h-16 fill-white/10" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 group-hover:from-primary group-hover:to-primary transition-all leading-none">
                                    {schoolName}
                                </h1>
                                <span className="text-[10px] md:text-xl font-bold text-muted-foreground/30 tracking-[0.4em] uppercase mt-2 md:mt-4">
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
                    <Clock />
                </div>
            </div>
        </header>
    );
}
