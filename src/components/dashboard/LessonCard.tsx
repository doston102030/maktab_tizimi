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
                "group relative flex flex-row items-center justify-between p-3 sm:p-4 rounded-2xl transition-all duration-500 w-full overflow-hidden border",
                isActive
                    ? "border-primary/50 shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)] bg-gradient-to-br from-primary/10 via-background to-background scale-[1.02] z-20"
                    : "bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/30 hover:bg-card/80 hover:shadow-md active:scale-[0.98] z-10"
            )}
        >
            {/* Active Indicator Bar - Glowing */}
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_2px_rgba(79,70,229,0.5)]" />
            )}

            <div className="flex items-center gap-3 w-full overflow-hidden">
                {/* Index Circle */}
                <div className={cn(
                    "flex shrink-0 items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-colors shadow-sm",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-primary/30"
                        : "bg-secondary/80 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground"
                )}>
                    {index + 1}
                </div>

                {/* Lesson Name & Details Container */}
                <div className="flex flex-col w-full overflow-hidden">
                    {/* Lesson Name */}
                    <span className={cn(
                        "text-base font-bold truncate transition-colors leading-tight",
                        isActive ? "text-primary" : "text-foreground"
                    )}>
                        {lesson.name}
                    </span>

                    {/* Time Range - Smaller and below name for compact feel */}
                    <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                        <Clock size={12} className={isActive ? "text-primary" : "text-muted-foreground"} />
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                            {lesson.startTime} - {lesson.endTime}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Icon/Indicator (Optional, kept minimal) */}
            {isActive && (
                <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            )}
        </div>
    );
}
