import { useState, useEffect } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
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

    const dateStr = format(time, "d MMMM", { locale: LOCALE_MAP[language] });
    const dayName = format(time, "EEEE", { locale: LOCALE_MAP[language] });
    // Custom format to match "Payshanba, 29 Yanvar" logic if needed, but standard date-fns valid.
    // Prompt example: "Payshanba, 29 Yanvar"
    const formattedDate = `${dayName}, ${dateStr}`;

    return (
        <header className="flex flex-col md:flex-row w-full items-center md:items-start justify-between gap-4 md:gap-0">
            {/* Left: School Info */}
            <div className="flex flex-col text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold leading-tight">{schoolName}</h1>
                <p className="text-xs md:text-sm text-muted-foreground opacity-80">{subtitle}</p>
            </div>

            {/* Center: Clock Pill */}
            <div className="bg-secondary/50 backdrop-blur px-6 py-2 md:px-8 md:py-3 rounded-full flex flex-col items-center border border-border/50 shadow-sm w-full md:w-auto max-w-xs md:max-w-none">
                <span className="text-2xl md:text-3xl font-mono font-bold tracking-widest tabular-nums">
                    {format(time, 'HH:mm:ss')}
                </span>
                <span className="text-xs md:text-sm font-medium text-muted-foreground capitalize">
                    {formattedDate}
                </span>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-accent transition-colors border border-transparent hover:border-border"
                >
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="flex bg-secondary rounded-lg p-1">
                    {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={cn(
                                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                language === lang
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {lang}
                        </button>
                    ))}
                </div>

                {/* Discreet settings trigger */}
                <button onClick={onSettingsClick} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
}
