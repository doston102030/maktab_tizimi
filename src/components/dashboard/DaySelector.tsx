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
    'Shanba': 'shanba'
};

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

interface DaySelectorProps {
    selectedDay: DayId;
    onSelect: (day: DayId) => void;
    language: Language;
}

export function DaySelector({ selectedDay, onSelect, language }: DaySelectorProps) {
    const t = i18n[language];

    // Helper to get short name based on language
    const getShortName = (day: DayId) => {
        const fullLabel = t[DAY_KEYS[day]];
        if (language === 'UZ') {
            // Dushanba -> Du, Seshanba -> Se, etc.
            // Special handling for shared prefixes if needed, but 2 chars is standard
            return fullLabel.slice(0, 2);
        } else if (language === 'RU') {
            // Понедельник -> Пн
            return fullLabel.slice(0, 2);
        } else {
            // Monday -> Mon
            return fullLabel.slice(0, 3);
        }
    };

    return (
        <div className="w-full">
            {/* Mobile: Grid 3 cols (2 rows) / Desktop: Flex Center */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap items-center sm:justify-center w-full px-1 sm:px-0">
                {DAYS.map((day) => {
                    const isActive = selectedDay === day;
                    const label = t[DAY_KEYS[day]];
                    const shortLabel = getShortName(day);

                    return (
                        <button
                            key={day}
                            onClick={() => onSelect(day)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full sm:w-auto py-2 sm:px-6 sm:py-3 rounded-xl text-xs font-medium transition-all duration-300 border backdrop-blur-sm",
                                isActive
                                    ? "bg-gradient-to-br from-primary to-indigo-600 text-white border-transparent shadow-[0_0_10px_-3px_rgba(79,70,229,0.5)] z-10 ring-1 ring-primary/20 scale-[1.02]"
                                    : "bg-card/40 text-muted-foreground border-white/10 hover:bg-card/60 hover:text-foreground hover:scale-[1.02] active:scale-95 shadow-sm"
                            )}
                        >
                            {/* Mobile: Short Name with Icon-like feel */}
                            <span className="sm:hidden text-xs font-bold uppercase tracking-wider">{shortLabel}</span>
                            {/* Desktop: Full Name */}
                            <span className="hidden sm:inline-block whitespace-nowrap text-base">{label}</span>

                            {/* Active Dot for Mobile */}
                            {isActive && <div className="sm:hidden w-1 h-1 rounded-full bg-white mt-0.5" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
