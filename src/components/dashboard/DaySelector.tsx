import type { DayId } from '@/types';
import { cn } from '@/lib/utils';

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

interface DaySelectorProps {
    selectedDay: DayId;
    onSelect: (day: DayId) => void;
}

export function DaySelector({ selectedDay, onSelect }: DaySelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full justify-center">
            {DAYS.map((day) => {
                const isActive = selectedDay === day;
                return (
                    <button
                        key={day}
                        onClick={() => onSelect(day)}
                        className={cn(
                            "relative px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all flex-1 md:flex-none min-w-[100px] md:min-w-[110px] text-center justify-center flex",
                            isActive
                                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                : "bg-secondary text-secondary-foreground hover:bg-accent"
                        )}
                    >
                        {day}
                        {isActive && (
                            <span className="absolute top-1 right-1 md:top-2 md:right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
