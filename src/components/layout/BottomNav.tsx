import { Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { i18n } from '@/lib/i18n';
import type { Language } from '@/types';

interface BottomNavProps {
    currentView: 'dashboard' | 'settings';
    onViewChange: (view: 'dashboard' | 'settings') => void;
    language: Language;
}

export function BottomNav({ currentView, onViewChange, language }: BottomNavProps) {
    const t = i18n[language];

    const navItems = [
        {
            id: 'dashboard',
            label: language === 'UZ' ? 'Asosiy' : language === 'RU' ? 'Главная' : 'Home',
            icon: Home,
        },
        {
            id: 'settings',
            label: t.settings,
            icon: Settings,
        },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm md:hidden">
            <div className="glass-ios rounded-[2rem] p-2 flex items-center justify-around shadow-2xl border-white/20 dark:border-white/10">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as 'dashboard' | 'settings')}
                            className={cn(
                                "relative flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-primary scale-110"
                                    : "text-muted-foreground/60 hover:text-muted-foreground active:scale-95"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-in fade-in zoom-in-95 duration-300" />
                            )}
                            <Icon
                                size={22}
                                className={cn(
                                    "transition-all duration-300",
                                    isActive ? "fill-primary/10 stroke-[2.5px]" : "stroke-[2px]"
                                )}
                            />
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                isActive ? "opacity-100" : "opacity-60"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
