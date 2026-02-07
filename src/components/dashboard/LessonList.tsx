import type { Lesson, Language } from '@/types';
import { LessonCard } from './LessonCard';
import { BreakInfo } from './BreakInfo';
import { differenceInMinutes, parse } from 'date-fns';
import { i18n } from '@/lib/i18n';

interface LessonListProps {
    lessons: Lesson[];
    activeLessonId?: string;
    language: Language;
}

export function LessonList({ lessons, activeLessonId, language }: LessonListProps) {
    const t = i18n[language];

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
        <div className="w-full max-w-3xl flex flex-col gap-3 pb-24 px-1">
            {lessons.map((lesson, idx) => {
                const isLast = idx === lessons.length - 1;
                const breakDuration = !isLast
                    ? getBreakDuration(lesson.endTime, lessons[idx + 1].startTime)
                    : 0;

                const isActive = lesson.id === activeLessonId;

                return (
                    <div key={lesson.id} className="flex flex-col w-full gap-3">
                        <LessonCard
                            lesson={lesson}
                            index={idx}
                            isActive={isActive}
                        />

                        {!isLast && breakDuration > 0 && (
                            <BreakInfo duration={breakDuration} label={t.break} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
