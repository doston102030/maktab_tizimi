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
            {/* Mobile: Grid / Desktop: Flex with Scroll/Wrap */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full sm:justify-center">
                {DAYS.map((day) => {
                    const isActive = selectedDay === day;
                    const label = t[DAY_KEYS[day]];
                    const shortLabel = getShortName(day);

                    return (
                        <button
                            key={day}
                            onClick={() => onSelect(day)}
                            className={cn(
                                "relative px-2 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-full text-sm font-medium transition-all duration-300 border shadow-sm",
                                isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105 font-bold"
                                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {/* Mobile: Short Name, Desktop: Full Name */}
                            <span className="sm:hidden text-xs uppercase tracking-wider">{shortLabel}</span>
                            <span className="hidden sm:inline-block whitespace-nowrap">{label}</span>

                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary/50 rounded-full sm:hidden" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
