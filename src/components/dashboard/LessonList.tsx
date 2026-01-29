import type { Lesson } from '@/types';
import { LessonCard } from './LessonCard';
import { BreakInfo } from './BreakInfo';
import { differenceInMinutes, parse } from 'date-fns';

interface LessonListProps {
    lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
    // Helper to calculate break duration between current lesson end and next lesson start
    const getBreakDuration = (currentEnd: string, nextStart: string) => {
        try {
            const today = new Date();
            const end = parse(currentEnd, 'HH:mm', today);
            const start = parse(nextStart, 'HH:mm', today);
            return differenceInMinutes(start, end);
        } catch {
            return 0;
        }
    };

    return (
        <div className="w-full max-w-3xl flex flex-col gap-2 pb-10">
            {lessons.map((lesson, idx) => {
                const isLast = idx === lessons.length - 1;
                const breakDuration = !isLast
                    ? getBreakDuration(lesson.endTime, lessons[idx + 1].startTime)
                    : 0;

                return (
                    <div key={lesson.id} className="flex flex-col w-full">
                        <LessonCard lesson={lesson} index={idx} />

                        {!isLast && breakDuration > 0 && (
                            <BreakInfo duration={breakDuration} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
