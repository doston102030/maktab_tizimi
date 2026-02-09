import { useState, useEffect } from 'react';
import { SunMedium, MoonStar, SlidersHorizontal, Atom, Globe } from 'lucide-react';
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

export function Header({ schoolName, subtitle, theme, toggleTheme, language, setLanguage, onSettingsClick }: HeaderProps) {
    const [time, setTime] = useState(new Date());
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dayName = format(time, "EEEE", { locale: LOCALE_MAP[language] });

    const timeString = format(time, 'HH:mm:ss');
    const dateString = format(time, "d MMMM, yyyy", { locale: LOCALE_MAP[language] });

    return (
        <header className="sticky top-2 z-50 w-full max-w-5xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 glass rounded-full mt-2 transition-all duration-500 border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-in slide-in-from-top-4 hover:scale-[1.01] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]">
            {/* Left: School Info */}
            <div className="flex items-center gap-3 w-full md:w-auto pl-2">
                <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-full text-white shadow-lg shadow-blue-500/30 hidden md:block animate-spin-slow">
                    <Atom size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-gradient drop-shadow-sm leading-tight">
                        {schoolName}
                    </h1>
                    {subtitle && (
                        <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase hidden sm:block">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Center: Clock */}
            <div className="flex flex-col items-center justify-center -my-1">
                <div className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 drop-shadow-2xl font-mono">
                    {timeString}
                </div>
                <div className="text-[10px] md:text-xs font-bold text-primary/80 uppercase tracking-[0.2em] bg-primary/5 px-3 py-0.5 rounded-full border border-primary/10">
                    {dayName} • {dateString}
                </div>
            </div>

            {/* Right: Controls */}
            <div className="hidden md:flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-secondary/30 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-all hover:scale-110 active:scale-95 shadow-sm group"
                    title={theme === 'dark' ? "Yorug' rejim" : "Tungi rejim"}
                >
                    {theme === 'dark' ? (
                        <SunMedium size={20} className="group-hover:rotate-45 transition-transform" />
                    ) : (
                        <MoonStar size={20} className="group-hover:-rotate-12 transition-transform" />
                    )}
                </button>

                {/* Language Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="p-3 rounded-full bg-secondary/30 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-all hover:scale-110 active:scale-95 shadow-sm group"
                        title="Tilni o'zgartirish"
                    >
                        <Globe size={20} className={cn("transition-transform duration-500", isLangOpen ? "rotate-180 text-primary" : "group-hover:rotate-12")} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={cn(
                        "absolute top-full right-0 mt-3 w-32 bg-popover/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 transition-all duration-300 origin-top-right z-50",
                        isLangOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    )}>
                        {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang);
                                    setIsLangOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-colors",
                                    language === lang
                                        ? "bg-primary text-white shadow-md"
                                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className="text-base">{lang === 'UZ' ? '🇺🇿' : lang === 'RU' ? '🇷🇺' : '🇬🇧'}</span>
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onSettingsClick}
                    className="p-3 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 active:scale-95 group"
                    title="Sozlamalar"
                >
                    <SlidersHorizontal size={22} className="group-hover:text-primary transition-colors" />
                </button>
            </div>

            {/* Mobile Controls Row */}
            <div className="flex md:hidden w-full items-center justify-between pt-3 border-t border-border/40 mt-1">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg active:scale-95 transition-transform"
                >
                    {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
                    <span>Rejim</span>
                </button>

                <div className="flex gap-2">
                    {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all border shadow-sm",
                                language === lang
                                    ? "bg-primary text-white border-primary"
                                    : "bg-background/50 text-muted-foreground border-transparent"
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
