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
        <div className="bg-white/80 dark:bg-[#0a0c14]/80 backdrop-blur-xl p-1.5 rounded-2xl flex items-center relative w-full max-w-[300px] sm:w-auto border border-black/[0.03] dark:border-white/[0.05] shadow-2xl ring-1 ring-black/5 dark:ring-white/5 mx-auto">
            {/* Sliding background indicator (Modern Design) */}
            <div className={cn(
                "absolute inset-y-1.5 w-[calc(50%-6px)] rounded-xl bg-white dark:bg-gradient-to-br dark:from-[#1e2336] dark:to-[#121520] shadow-xl dark:shadow-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-black/5 dark:border-white/5",
                selectedShift === '1' ? "left-1.5" : "left-[calc(50%+3px)]"
            )} />

            <button
                onClick={() => onSelect('1')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-[0.1em] transition-all duration-300 z-10",
                    selectedShift === '1' ? "text-primary dark:text-white" : "text-muted-foreground/60 hover:text-foreground dark:hover:text-white"
                )}
            >
                <div className={cn(
                    "p-1.5 rounded-lg transition-all duration-300",
                    selectedShift === '1' ? "bg-orange-500/10 dark:bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] dark:shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-transparent"
                )}>
                    <Sun size={15} className={cn("transition-all duration-500", selectedShift === '1' ? "text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400 scale-110" : "scale-100 opacity-50")} />
                </div>
                <span>{t.shift1}</span>
            </button>

            <button
                onClick={() => onSelect('2')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-[0.1em] transition-all duration-300 z-10",
                    selectedShift === '2' ? "text-primary dark:text-white" : "text-muted-foreground/60 hover:text-foreground dark:hover:text-white"
                )}
            >
                <div className={cn(
                    "p-1.5 rounded-lg transition-all duration-300",
                    selectedShift === '2' ? "bg-indigo-500/10 dark:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "bg-transparent"
                )}>
                    <Moon size={15} className={cn("transition-all duration-500", selectedShift === '2' ? "text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400 scale-110" : "scale-100 opacity-50")} />
                </div>
                <span>{t.shift2}</span>
            </button>
        </div>
    );
}
