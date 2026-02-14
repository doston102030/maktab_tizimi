import type { Lesson, Language } from '@/types';
import { LessonCard } from './LessonCard';
import { BreakInfo } from './BreakInfo';
import { differenceInMinutes, parse } from 'date-fns';
import { i18n } from '@/lib/i18n';
import { Bell } from 'lucide-react';

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
        <div className="w-full max-w-4xl flex flex-col gap-4 pb-32 px-2 perspective-[1000px]">
            {lessons.map((lesson, idx) => {
                const isLast = idx === lessons.length - 1;
                const breakDuration = !isLast
                    ? getBreakDuration(lesson.endTime, lessons[idx + 1].startTime)
                    : 0;

                const isActive = lesson.id === activeLessonId;

                return (
                    <div
                        key={lesson.id}
                        className="flex flex-col w-full gap-4 transition-all duration-500"
                        style={{
                            animation: `slideIn 0.5s ease-out forwards ${idx * 0.1}s`,
                            opacity: 0 // Start hidden for animation
                        }}
                    >
                        <style>{`
                            @keyframes slideIn {
                                from { opacity: 0; transform: translateY(20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>

                        <LessonCard
                            lesson={lesson}
                            index={idx}
                            isActive={isActive}
                            language={language}
                        >
                            {/* Aura Bell Design (Premium) */}
                            {isActive && (
                                <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 group z-20">
                                    <div className="relative">
                                        {/* Glowing Ring */}
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse scale-150" />
                                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-ios flex items-center justify-center border-primary/30 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/10">
                                            <Bell size={20} className="text-primary fill-primary/20 animate-[shake_2s_infinite]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </LessonCard>

                        {!isLast && breakDuration > 0 && (
                            <BreakInfo duration={breakDuration} label={t.break} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
