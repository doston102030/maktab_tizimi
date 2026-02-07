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
                "group relative flex flex-col sm:flex-row items-center sm:justify-between p-4 sm:p-5 rounded-2xl bg-card transition-all duration-300 w-full overflow-hidden border",
                isActive
                    ? "border-primary/50 shadow-lg ring-1 ring-primary/20 scale-[1.02] z-10 bg-gradient-to-br from-card to-primary/5"
                    : "border-transparent shadow-sm hover:shadow-md hover:border-border/60 hover:bg-accent/5"
            )}
        >
            {/* Active Indicator Bar */}
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
            )}

            <div className="flex items-center gap-4 w-full sm:w-auto z-10">
                {/* Index Circle */}
                <div className={cn(
                    "flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-base sm:text-lg transition-colors",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-muted-foreground group-hover:bg-secondary/80"
                )}>
                    {index + 1}
                </div>

                {/* Lesson Name */}
                <span className={cn(
                    "text-lg sm:text-xl font-semibold truncate transition-colors",
                    isActive ? "text-primary" : "text-foreground"
                )}>
                    {lesson.name}
                </span>
            </div>

            {/* Time Range */}
            <div className={cn(
                "flex items-center gap-2 mt-2 sm:mt-0 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap z-10",
                isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "bg-secondary/30 text-muted-foreground font-medium"
            )}>
                <Clock size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <span className="text-lg sm:text-xl tracking-tight">
                    {lesson.startTime} <span className="opacity-40 mx-1">—</span> {lesson.endTime}
                </span>
            </div>
        </div>
    );
}
