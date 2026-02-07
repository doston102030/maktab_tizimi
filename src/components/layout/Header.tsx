import { useState, useEffect } from 'react';
import { Moon, Sun, Settings, BellRing } from 'lucide-react';
import type { Language, Theme } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uz, ru, enUS } from 'date-fns/locale';

interface HeaderProps {
    schoolName: string;
    subtitle: string;
    theme: Theme;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    onSettingsClick: () => void;
}

const LOCALE_MAP = {
    'UZ': uz,
    'RU': ru,
    'EN': enUS
};

export function Header({ schoolName, subtitle, theme, toggleTheme, language, setLanguage, onSettingsClick }: HeaderProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateStr = format(time, "d MMMM, yyyy", { locale: LOCALE_MAP[language] });
    const dayName = format(time, "EEEE", { locale: LOCALE_MAP[language] });

    return (
        <header className="sticky top-0 z-50 w-full px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-background/60 backdrop-blur-xl border-b shadow-sm transition-all duration-300">
            {/* Left: School Info */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-primary/10 p-2 rounded-xl text-primary hidden md:block">
                    <BellRing size={24} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg md:text-xl font-bold leading-none tracking-tight text-foreground/90">{schoolName}</h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">{subtitle}</p>
                </div>
                {/* Mobile Settings Trigger */}
                <button onClick={onSettingsClick} className="ml-auto p-2 md:hidden text-muted-foreground hover:text-foreground">
                    <Settings size={20} />
                </button>
            </div>

            {/* Center: Clock Display */}
            <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 drop-shadow-sm tabular-nums leading-none pb-1">
                    {format(time, 'HH:mm:ss')}
                </span>
                <span className="text-sm md:text-base font-medium text-muted-foreground capitalize">
                    {dayName}, {dateStr}
                </span>
            </div>

            {/* Right: Controls (Hidden on mobile mostly, except theme) */}
            <div className="hidden md:flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all hover:scale-105 active:scale-95"
                    title={theme === 'dark' ? "Yorug' rejim" : "Tungi rejim"}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="flex bg-secondary/50 p-1 rounded-full border border-border/50">
                    {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={cn(
                                "px-3 py-1 text-xs font-bold rounded-full transition-all duration-200",
                                language === lang
                                    ? "bg-background text-primary shadow-sm scale-105"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {lang}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onSettingsClick}
                    className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                    title="Sozlamalar"
                >
                    <Settings size={22} />
                </button>
            </div>

            {/* Mobile Controls Row */}
            <div className="flex md:hidden w-full items-center justify-between pt-2 border-t border-border/50 mt-1">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>Rejim</span>
                </button>

                <div className="flex gap-2">
                    {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={cn(
                                "px-2 py-1 text-xs font-bold rounded-md transition-all border",
                                language === lang
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-transparent text-muted-foreground border-transparent"
                            )}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
