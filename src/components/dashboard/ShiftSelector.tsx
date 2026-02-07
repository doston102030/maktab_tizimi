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
        <div className="bg-secondary/50 p-1.5 rounded-full flex items-center relative w-full max-w-sm sm:w-auto border border-border/50 shadow-inner">
            {/* Sliding background indicator could be done with Framer Motion, but CSS is simpler for now */}
            <div className={cn(
                "absolute inset-y-1.5 w-[calc(50%-6px)] rounded-full bg-background shadow-sm transition-all duration-300 ease-spring",
                selectedShift === '1' ? "left-1.5" : "left-[calc(50%+3px)]"
            )} />

            <button
                onClick={() => onSelect('1')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors z-10",
                    selectedShift === '1' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Sun size={16} className={selectedShift === '1' ? "text-orange-500 fill-orange-500/20" : ""} />
                <span>{t.shift1}</span>
            </button>

            <button
                onClick={() => onSelect('2')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors z-10",
                    selectedShift === '2' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Moon size={16} className={selectedShift === '2' ? "text-blue-500 fill-blue-500/20" : ""} />
                <span>{t.shift2}</span>
            </button>
        </div>
    );
}
