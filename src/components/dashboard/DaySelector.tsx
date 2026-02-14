import type { DayId, Language } from '@/types';
import { cn } from '@/lib/utils';
import { i18n } from '@/lib/i18n';

// Map DayId to i18n keys
const DAY_KEYS: Record<DayId, keyof typeof i18n['UZ']> = {
    'Dushanba': 'dushanba',
    'Seshanba': 'seshanba',
    'Chorshanba': 'chorshanba',
    'Payshanba': 'payshanba',
    'Juma': 'juma',
    'Shanba': 'shanba',
    'Yakshanba': 'yakshanba'
};

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

interface DaySelectorProps {
    selectedDay: DayId;
    onSelect: (day: DayId) => void;
    language: Language;
}

export function DaySelector({ selectedDay, onSelect, language }: DaySelectorProps) {
    const t = i18n[language];

    // Detect today's day (0-6, where 0 is Sunday, 1 is Monday)
    const todayIndex = new Date().getDay();
    const dayToIndex: Record<DayId, number> = {
        'Dushanba': 1, 'Seshanba': 2, 'Chorshanba': 3,
        'Payshanba': 4, 'Juma': 5, 'Shanba': 6, 'Yakshanba': 0
    };

    // Color mapping for each day
    const getDayColor = (day: DayId, isActive: boolean) => {
        const isToday = dayToIndex[day] === todayIndex;

        if (isActive) {
            return "bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] border-emerald-400/30";
        }

        // Non-active states with subtle color-themed appearance
        if (isToday) return "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20";

        const inactiveColors: Record<DayId, string> = {
            'Dushanba': "bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10",
            'Seshanba': "bg-orange-500/5 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/10",
            'Chorshanba': "bg-purple-500/5 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10",
            'Payshanba': "bg-pink-500/5 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/10",
            'Juma': "bg-sky-500/5 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-500/10",
            'Shanba': "bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/10",
            'Yakshanba': "bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10"
        };
        return inactiveColors[day];
    };

    return (
        <div className="w-full">
            {/* Desktop: Centered Flex | Mobile: Centered wrapping buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full px-1">
                {DAYS.map((day) => {
                    const isActive = selectedDay === day;
                    const label = t[DAY_KEYS[day]];
                    const colorClasses = getDayColor(day, isActive);

                    return (
                        <button
                            key={day}
                            onClick={() => onSelect(day)}
                            className={cn(
                                "relative group flex items-center justify-center min-w-[3.8rem] sm:min-w-[110px] px-3.5 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-sm font-bold transition-all duration-500 border overflow-hidden mega-shimmer",
                                isActive
                                    ? `${colorClasses} text-white scale-105 z-10 ring-2 ring-white/10`
                                    : `${colorClasses} hover:scale-105 active:scale-95 shadow-lg backdrop-blur-xl bg-opacity-40`
                            )}
                        >
                            {/* Animated Background Highlight on Hover (Non-active) */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-gradient-to-br from-current to-transparent opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500" />
                            )}

                            {/* Mobile/Desktop: Full Name (Responsive Size) */}
                            <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-tight sm:tracking-widest relative z-10 leading-none">
                                {label}
                            </span>

                            {/* Floating Orb Indicator for Active State */}
                            {isActive && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping absolute inset-0" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
