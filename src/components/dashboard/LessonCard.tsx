import React from 'react';
import { cn } from '@/lib/utils';
import type { Lesson, Language } from '@/types';
import { Clock } from 'lucide-react';
import { translateLessonName } from '@/lib/translate';

interface LessonCardProps {
    lesson: Lesson;
    index: number;
    language: Language;
    isActive?: boolean;
    children?: React.ReactNode;
}

export function LessonCard({ lesson, index, language, isActive, children }: LessonCardProps) {

    // Dynamic translation for lesson names (handles "1-dars", "2-dars" etc)
    const displayName = React.useMemo(() =>
        translateLessonName(lesson.name, language),
        [lesson.name, language]);
    const getIndexColor = (idx: number, active: boolean) => {
        const colors = [
            { gradient: "from-[#7c3aed] to-[#6d28d9]", shadow: "shadow-purple-500/25", glow: "dark:shadow-[0_0_20px_rgba(124,58,237,0.3)]" },
            { gradient: "from-[#2563eb] to-[#1d4ed8]", shadow: "shadow-blue-500/25", glow: "dark:shadow-[0_0_20px_rgba(37,99,235,0.3)]" },
            { gradient: "from-[#e11d48] to-[#be123c]", shadow: "shadow-red-500/25", glow: "dark:shadow-[0_0_20px_rgba(225,29,72,0.3)]" },
            { gradient: "from-[#f59e0b] to-[#d97706]", shadow: "shadow-amber-500/25", glow: "dark:shadow-[0_0_20px_rgba(245,158,11,0.3)]" },
            { gradient: "from-[#10b981] to-[#047857]", shadow: "shadow-emerald-500/25", glow: "dark:shadow-[0_0_20px_rgba(16,185,129,0.3)]" },
            { gradient: "from-[#06b6d4] to-[#0e7490]", shadow: "shadow-cyan-500/25", glow: "dark:shadow-[0_0_20px_rgba(6,182,212,0.3)]" },
            { gradient: "from-[#db2777] to-[#be185d]", shadow: "shadow-pink-500/25", glow: "dark:shadow-[0_0_20px_rgba(219,39,119,0.3)]" },
        ];
        const config = colors[idx % colors.length];

        if (active) {
            return cn(
                "bg-gradient-to-br text-white rotate-3 ring-4 ring-primary/20 scale-110",
                config.gradient,
                "shadow-2xl",
                config.glow
            );
        }
        return cn(
            "bg-gradient-to-br text-white/95 group-hover:text-white group-hover:rotate-0 -rotate-2 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500",
            config.gradient,
            config.shadow,
            config.glow
        );
    };

    return (
        <div
            className={cn(
                "group relative flex flex-row items-center justify-between ps-6 pe-4 sm:ps-8 sm:pe-5 py-4 sm:py-5 rounded-[2.5rem] transition-all duration-500 w-full overflow-hidden border mega-shimmer",
                isActive
                    ? "border-primary/50 bg-gradient-to-r from-white via-blue-50 to-white dark:from-[#0c101d] dark:via-[#0a0c14] dark:to-[#0c101d] shadow-[0_30px_60px_-15px_rgba(37,99,235,0.25)] dark:shadow-[0_30px_60px_-15px_rgba(124,58,237,0.5)] scale-[1.03] z-20 translate-x-1"
                    : "bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl border-black/[0.05] dark:border-white/[0.03] hover:border-primary/30 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-xl active:scale-[0.98] z-10"
            )}
        >
            {/* Mega Iridescent Aura */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 opacity-50 mix-blend-overlay animate-pulse" />
            )}
            {/* Ultra Modern Neon Accent Layer */}
            {isActive && (
                <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-[40px] -ml-12 -mb-12 pointer-events-none" />
                </>
            )}

            {/* Asymmetrical Active Bar */}
            {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-gradient-to-b from-primary to-indigo-400 shadow-[0_0_20px_rgba(124,58,237,0.6)]" />
            )}

            <div className="flex items-center gap-4 w-full overflow-hidden">
                {/* Index Circle */}
                <div className={cn(
                    "flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl font-black text-base transition-all duration-500",
                    getIndexColor(index, !!isActive)
                )}>
                    {index + 1}
                </div>

                {/* Lesson Name & Details Container */}
                <div className="flex flex-col w-full overflow-hidden ps-1">
                    {/* Lesson Name */}
                    <span className={cn(
                        "text-lg sm:text-xl font-black truncate transition-all leading-tight tracking-tight",
                        isActive ? "text-primary dark:text-white" : "text-foreground/90"
                    )}>
                        {displayName}
                    </span>

                    {/* Time Range - Balanced size */}
                    <div className="flex items-center gap-2 mt-1.5 opacity-100">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em]",
                            isActive ? "bg-primary text-white" : "bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground"
                        )}>
                            <Clock size={11} className={isActive ? "text-white" : "text-muted-foreground/60"} />
                            <span className="tabular-nums">
                                {lesson.startTime} - {lesson.endTime}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {children}

            {/* Status Icon/Indicator (Optional, kept minimal) */}
            {isActive && (
                <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            )}
        </div>
    );
}
