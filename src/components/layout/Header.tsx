import { useState, useEffect } from 'react';
import { Sun, Moon, Settings, Globe, Atom } from 'lucide-react';
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



    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300">
            {/* Glass Background Container - Full Width & Taller */}
            <div className="w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-y-3 md:gap-y-0 relative">

                    {/* Top Row on Mobile: Logo/Name + Controls */}
                    <div className="w-full md:w-auto flex items-center justify-between z-20">
                        {/* Left: Logo & School Name */}
                        <div className="flex items-center gap-2 md:gap-4 group cursor-pointer shrink-0">
                            <div className="relative flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                                <Atom size={20} className="text-white animate-spin-slow md:w-6 md:h-6" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-sm md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all leading-none">
                                    {schoolName}
                                </h1>
                                <span className="hidden sm:block text-[10px] md:text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-80 mt-1">
                                    {subtitle}
                                </span>
                            </div>
                        </div>

                        {/* Mobile Controls (Moved here) */}
                        <div className="flex md:hidden items-center gap-1.5">
                            <button onClick={toggleTheme} className="p-2 rounded-xl bg-secondary/30 active:scale-95 transition-transform">
                                {theme === 'dark' ? <Sun size={18} className="text-amber-400 fill-amber-400" /> : <Moon size={18} className="text-indigo-400 fill-indigo-400" />}
                            </button>
                            <button onClick={() => setIsLangOpen(!isLangOpen)} className="p-2 rounded-xl bg-secondary/30 active:scale-95 transition-transform">
                                <Globe size={18} className={cn(isLangOpen ? "text-primary" : "")} />
                            </button>
                            {/* Lang Dropdown for Mobile (Simplified) */}
                            {isLangOpen && (
                                <div className="absolute top-12 right-0 bg-popover border border-border rounded-xl shadow-xl p-1 flex flex-col gap-1 z-50">
                                    {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                                        <button key={lang} onClick={() => { setLanguage(lang); setIsLangOpen(false); }} className={cn("px-3 py-2 rounded-lg text-xs font-bold", language === lang ? "bg-primary text-white" : "hover:bg-accent")}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button onClick={onSettingsClick} className="p-2 rounded-xl bg-secondary/30 active:scale-95 transition-transform">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Middle: Clock */}
                    {/* Desktop View (Absolute Center) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center pointer-events-none">
                        <div className="text-4xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-sm leading-none">
                            {format(time, 'HH:mm')}
                            <span className="text-2xl text-muted-foreground ml-0.5 animate-pulse relative -top-1">:</span>
                            {format(time, 'ss')}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest bg-secondary/50 px-3 py-0.5 rounded-full mt-1 backdrop-blur-md border border-white/5">
                            {format(time, 'EEEE • d MMMM', { locale: LOCALE_MAP[language] })}
                        </div>
                    </div>

                    {/* Mobile View (Bottom Row - Full Width & Centered) */}
                    <div className="flex md:hidden w-full flex-col items-center justify-center bg-secondary/30 backdrop-blur-md py-1.5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden">
                        {/* Shimmer Effect Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                        <div className="text-xl font-black tabular-nums tracking-wide text-foreground leading-none flex items-baseline gap-0.5 z-10">
                            {format(time, 'HH:mm')}
                            <span className="text-sm text-foreground animate-pulse relative -top-0.5">:</span>
                            {format(time, 'ss')}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mt-0.5 z-10">
                            {format(time, 'EEEE, d MMMM', { locale: LOCALE_MAP[language] })}
                        </div>
                    </div>

                    {/* Right: Controls (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-1.5 md:gap-2 z-20">
                        <button
                            onClick={toggleTheme}
                            className="p-2 md:p-2.5 rounded-xl bg-secondary/30 md:bg-secondary/50 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-all hover:scale-105 active:scale-95 group"
                            title={theme === 'dark' ? "Yorug' rejim" : "Tungi rejim"}
                        >
                            {theme === 'dark' ?
                                <Sun size={20} className="text-amber-400 fill-amber-400 group-hover:rotate-45 transition-transform" /> :
                                <Moon size={20} className="text-indigo-400 fill-indigo-400 group-hover:-rotate-12 transition-transform" />
                            }
                        </button>

                        {/* Desktop Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="p-2 md:p-2.5 rounded-xl bg-secondary/30 md:bg-secondary/50 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-all hover:scale-105 active:scale-95 group"
                                title="Tilni o'zgartirish"
                            >
                                <Globe size={20} className={cn("transition-transform duration-300 group-hover:text-primary", isLangOpen ? "rotate-180 text-primary" : "")} />
                            </button>

                            <div className={cn(
                                "absolute top-full right-0 mt-2 w-32 md:w-36 bg-popover/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 transition-all duration-300 origin-top-right z-50",
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
                                            "flex items-center gap-2 md:gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-colors",
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
                            className="p-2 md:p-2.5 rounded-xl bg-secondary/30 md:bg-secondary/50 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-all hover:rotate-90 active:scale-95 group"
                            title="Sozlamalar"
                        >
                            <Settings size={22} className="group-hover:text-primary transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
