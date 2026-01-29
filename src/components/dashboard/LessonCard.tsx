import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';

interface LessonCardProps {
    lesson: Lesson;
    index: number;
    isActive?: boolean; // In case we want to highlight current lesson later, though prompt didn't explicitly ask for highlight styling, just "Lesson card styling". 
}

export function LessonCard({ lesson, index, isActive }: LessonCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center sm:justify-between p-3 sm:p-4 rounded-xl bg-card text-card-foreground shadow-sm border border-border/50 w-full max-w-3xl gap-2 sm:gap-0",
                isActive && "border-blue-500 ring-1 ring-blue-500" // Subtle highlight if needed
            )}
        >
            <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                {/* Left Label D1, D2 etc */}
                <div className="flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary text-secondary-foreground font-bold text-base sm:text-lg">
                    D{index + 1}
                </div>

                {/* Title */}
                <span className="text-lg sm:text-xl font-medium truncate">{lesson.name}</span>
            </div>

            {/* Time Range */}
            <div className="text-lg sm:text-2xl font-bold tracking-tight mt-1 sm:mt-0 whitespace-nowrap">
                {lesson.startTime} <span className="text-muted-foreground mx-1 font-normal">→</span> {lesson.endTime}
            </div>
        </div>
    );
}
