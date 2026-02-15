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
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-auto min-w-[240px] md:hidden">
            <div className="glass-ios rounded-full p-1.5 flex items-center justify-center gap-1 shadow-2xl border-white/20 dark:border-white/10">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as 'dashboard' | 'settings')}
                            className={cn(
                                "relative flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-full transition-all duration-300",
                                isActive
                                    ? "text-primary scale-105"
                                    : "text-muted-foreground/50 hover:text-muted-foreground active:scale-95"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/5 rounded-full animate-in fade-in zoom-in-95 duration-300" />
                            )}
                            <Icon
                                size={18}
                                className={cn(
                                    "transition-all duration-300 relative z-10",
                                    isActive ? "fill-primary/5 stroke-[2.5px]" : "stroke-[2px]"
                                )}
                            />
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative z-10",
                                isActive ? "opacity-100" : "opacity-50"
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
