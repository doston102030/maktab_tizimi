import { Sun, Moon } from 'lucide-react';
import type { ShiftId, Language } from '@/types';
import { cn } from '@/lib/utils';
import { i18n } from '@/lib/i18n';

interface ShiftSelectorProps {
    selectedShift: ShiftId;
    onSelect: (shift: ShiftId) => void;
    language: Language;
}

export function ShiftSelector({ selectedShift, onSelect, language }: ShiftSelectorProps) {
    const t = i18n[language];

    return (
        <div className="bg-secondary/30 backdrop-blur-md p-1.5 rounded-full flex items-center relative w-full max-w-[320px] sm:w-auto border border-white/20 shadow-inner ring-1 ring-black/5 mx-auto">
            {/* Sliding background indicator */}
            <div className={cn(
                "absolute inset-y-2 w-[calc(50%-8px)] rounded-full bg-background shadow-md transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] border border-border/10",
                selectedShift === '1' ? "left-2" : "left-[calc(50%+4px)]"
            )} />

            <button
                onClick={() => onSelect('1')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-colors z-10",
                    selectedShift === '1' ? "text-primary drop-shadow-md animate-pulse" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Sun size={18} className={cn("transition-all duration-300", selectedShift === '1' ? "text-orange-500 fill-orange-500 scale-125 rotate-12" : "scale-100")} />
                <span>{t.shift1}</span>
            </button>

            <button
                onClick={() => onSelect('2')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-colors z-10",
                )}
            >
                <Moon size={18} className={cn("transition-all duration-300", selectedShift === '2' ? "text-blue-500 fill-blue-500 hover:scale-110" : "scale-100")} />
                <span>{t.shift2}</span>
            </button>
        </div>
    );
}
