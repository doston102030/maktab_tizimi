import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';
import { Clock } from 'lucide-react';

interface LessonCardProps {
    lesson: Lesson;
    index: number;
    isActive?: boolean;
}

export function LessonCard({ lesson, index, isActive }: LessonCardProps) {
    return (
        <div
            className={cn(
                "group relative flex flex-col sm:flex-row items-center sm:justify-between p-5 sm:p-6 rounded-2xl transition-all duration-500 w-full overflow-hidden border",
                isActive
                    ? "border-primary shadow-[0_0_40px_-10px_rgba(79,70,229,0.6)] ring-2 ring-primary/40 scale-[1.03] z-20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-2xl"
                    : "glass-card border-white/20 hover:border-primary/50 hover:bg-white/40 dark:hover:bg-black/40 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:scale-[1.01] z-10"
            )}
        >
            {/* Active Indicator Bar - Glowing */}
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_10px_2px_rgba(59,130,246,0.5)]" />
            )}

            <div className="flex items-center gap-5 w-full sm:w-auto z-10">
                {/* Index Circle */}
                <div className={cn(
                    "flex shrink-0 items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-colors shadow-inner",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-blue-500/30"
                        : "bg-secondary text-muted-foreground group-hover:text-foreground group-hover:bg-secondary/80"
                )}>
                    {index + 1}
                </div>

                {/* Lesson Name */}
                <span className={cn(
                    "text-xl font-bold truncate transition-colors tracking-tight",
                    isActive ? "text-primary drop-shadow-sm" : "text-foreground group-hover:text-primary/80"
                )}>
                    {lesson.name}
                </span>
            </div>

            {/* Time Range */}
            <div className={cn(
                "flex items-center gap-2.5 mt-3 sm:mt-0 px-4 py-2 rounded-xl transition-all whitespace-nowrap z-10",
                isActive
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "bg-secondary/40 text-muted-foreground font-medium group-hover:bg-secondary/60"
            )}>
                <Clock size={18} className={isActive ? "text-primary animate-pulse" : "text-muted-foreground"} />
                <span className="text-lg tracking-tight tabular-nums">
                    {lesson.startTime} <span className="opacity-40 mx-1">—</span> {lesson.endTime}
                </span>
            </div>
        </div>
    );
}
