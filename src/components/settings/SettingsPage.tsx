import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { GeneralSettings } from './GeneralSettings';
import { ScheduleSettings } from './ScheduleSettings';
import { DaySelector } from '@/components/dashboard/DaySelector';
import type { AppState, DayId, Lesson, ShiftId } from '@/types';
import { addMinutes, differenceInMinutes, parse, format, isValid as isValidDate } from 'date-fns';

interface SettingsPageProps {
    appState: AppState;
    onSave: (newState: AppState) => void;
    onBack: () => void;
}

// Fixed break duration in minutes
const FIXED_BREAK_MINUTES = 5;

// Helper: Recalculate lesson times preserving durations and enforcing 5min gap
const recalculateLessons = (lessons: Lesson[]): Lesson[] => {
    if (lessons.length === 0) return [];

    const now = new Date();
    // Helper to parse time string "HH:mm" to Date
    const toDate = (timeStr: string) => parse(timeStr, 'HH:mm', now);
    // Helper to format Date to "HH:mm"
    const toStr = (date: Date) => format(date, 'HH:mm');

    const newLessons = [...lessons];

    // Iterate from 2nd lesson onwards
    for (let i = 0; i < newLessons.length; i++) {
        // First lesson: Start time remains as set by user. 
        // We only ensure EndTime is valid relative to duration.
        // Actually, we trust the inputs for the specific lesson, BUT
        // the user might have edited THIS lesson.
        // We should calculate based on previous lesson if i > 0.

        if (i > 0) {
            const prevLesson = newLessons[i - 1];
            const prevEnd = toDate(prevLesson.endTime);

            if (isValidDate(prevEnd)) {
                // Set StartTime = PrevEnd + 5min
                const newStart = addMinutes(prevEnd, FIXED_BREAK_MINUTES);
                newLessons[i].startTime = toStr(newStart);

                // Recalculate EndTime based on CURRENT duration
                // If current duration is invalid (e.g. 0 or negative), default to 45?
                // Or just preserve the difference?

                const currentStart = toDate(lessons[i].startTime);
                const currentEnd = toDate(lessons[i].endTime);

                let duration = 45; // Default
                if (isValidDate(currentStart) && isValidDate(currentEnd)) {
                    const diff = differenceInMinutes(currentEnd, currentStart);
                    if (diff > 0) duration = diff;
                }

                const newEnd = addMinutes(newStart, duration);
                newLessons[i].endTime = toStr(newEnd);
            }
        } else {
            // For the first lesson (i=0), we don't shift its startTime automatically 
            // unless the user edited it directly (which is handled by the input change).
            // However, updates to ITS duration (end time change) will trigger the chain for i=1..n
        }
    }

    return newLessons;
};

export function SettingsPage({ appState, onSave, onBack }: SettingsPageProps) {
    // Local state for editing
    const [draftState, setDraftState] = useState<AppState>(appState);

    // State for navigating the Schedule editor
    const [editDay, setEditDay] = useState<DayId>(appState.selectedDay || 'Dushanba');

    // Handle saving
    const handleSave = () => {
        onSave(draftState);
    };

    // Check if current editDay has a schedule initialized
    useEffect(() => {
        // Schedule is now strictly initialized for all days, so this check is merely for safety/fallback if state got corrupted
        if (!draftState.schedule[editDay]) {
            // Should ideally not happen with new strict types logic
        }
    }, [editDay, draftState.schedule]);

    const currentSchedule = draftState.schedule[editDay] || {
        dayId: editDay,
        isActive: true,
        shifts: { '1': { shiftId: '1', lessons: [] }, '2': { shiftId: '2', lessons: [] } }
    };

    /* Handlers for sub-components */

    // General Updates
    const updateSchoolName = (name: string) => {
        setDraftState(prev => ({ ...prev, config: { ...prev.config, schoolName: name } }));
    };

    const toggleWorkingDay = (day: string) => {
        const d = day as DayId;
        const daySched = draftState.schedule[d];
        const currentActive = daySched?.isActive ?? false;

        setDraftState(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [d]: {
                    ...(prev.schedule[d] || { dayId: d, shifts: { '1': { shiftId: '1', lessons: [] }, '2': { shiftId: '2', lessons: [] } } }),
                    isActive: !currentActive
                }
            }
        }));
    };

    // Schedule Updates
    const updateLesson = (shift: ShiftId, lessonId: string, field: keyof Lesson, value: string) => {
        setDraftState(prev => {
            const schedule = { ...prev.schedule };
            const daySched = { ...schedule[editDay]! }; // Assumed init by effect
            const shiftSched = { ...daySched.shifts[shift] };

            // 1. Update the specific field
            let lessons = shiftSched.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l);

            // 2. Recalculate chain
            lessons = recalculateLessons(lessons);

            return {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [editDay]: {
                        ...daySched,
                        shifts: {
                            ...daySched.shifts,
                            [shift]: { ...shiftSched, lessons }
                        }
                    }
                }
            };
        });
    };

    const addLesson = (shift: ShiftId) => {
        const shiftLessons = currentSchedule.shifts[shift].lessons;

        let startTime = '08:00';
        // If there are existing lessons, start 5 mins after last one
        if (shiftLessons.length > 0) {
            const lastLesson = shiftLessons[shiftLessons.length - 1];
            const now = new Date();
            const lastEnd = parse(lastLesson.endTime, 'HH:mm', now);
            if (isValidDate(lastEnd)) {
                // Add 5 min fixed break
                const newStart = addMinutes(lastEnd, FIXED_BREAK_MINUTES);
                startTime = format(newStart, 'HH:mm');
            }
        }

        // Default duration 45 mins
        const startDt = parse(startTime, 'HH:mm', new Date());
        const endDt = addMinutes(startDt, 45);
        const endTime = format(endDt, 'HH:mm');

        const newLesson: Lesson = {
            id: crypto.randomUUID(),
            name: `${shiftLessons.length + 1}-dars`,
            startTime,
            endTime
        };

        setDraftState(prev => {
            const schedule = { ...prev.schedule };
            const daySched = { ...schedule[editDay]! };
            const shiftSched = { ...daySched.shifts[shift] };

            // Add and Recalc (just in case)
            let lessons = [...shiftSched.lessons, newLesson];
            // No strict need to recalc whole chain if we appended correctly, but good for safety
            // lessons = recalculateLessons(lessons); 

            return {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [editDay]: {
                        ...daySched,
                        shifts: {
                            ...daySched.shifts,
                            [shift]: { ...shiftSched, lessons }
                        }
                    }
                }
            };
        });
    };

    const deleteLesson = (shift: ShiftId, lessonId: string) => {
        setDraftState(prev => {
            const schedule = { ...prev.schedule };
            const daySched = { ...schedule[editDay]! };
            const shiftSched = { ...daySched.shifts[shift] };

            let lessons = shiftSched.lessons.filter(l => l.id !== lessonId);

            // Recalculate chain (snap to gap)
            lessons = recalculateLessons(lessons);

            return {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [editDay]: {
                        ...daySched,
                        shifts: {
                            ...daySched.shifts,
                            [shift]: { ...shiftSched, lessons }
                        }
                    }
                }
            };
        });
    };

    // Active days list for GeneralSettings
    const activeDays = Object.values(draftState.schedule)
        .filter(d => d.isActive).map(d => d.dayId);

    // Validation: Check if ANY active lesson has invalid time range
    const hasInvalidTime = Object.values(draftState.schedule).some(day =>
        day.isActive && Object.values(day.shifts).some(shift =>
            shift.lessons.some(l => l.startTime >= l.endTime)
        )
    );

    return (
        <div className="w-full max-w-5xl p-6 bg-background space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Sozlamalar</h1>
                <Button variant="outline" onClick={onBack}>Orqaga</Button>
            </div>

            <section className="bg-card rounded-xl border p-6 shadow-sm">
                <GeneralSettings
                    schoolName={draftState.config.schoolName}
                    onSchoolNameChange={updateSchoolName}
                    activeDays={activeDays}
                    onToggleDay={toggleWorkingDay}
                    onSave={() => {
                        handleSave();
                        toast.success("Ish kunlari saqlandi");
                    }}
                />
            </section>

            <section className="space-y-6">
                <div className="flex flex-col gap-4">
                    {/* Day Selector for editing specific day */}
                    <h3 className="text-lg font-medium">Jadval tahrirlash uchun kunni tanlang:</h3>
                    <DaySelector selectedDay={editDay} onSelect={setEditDay} />
                </div>

                <ScheduleSettings
                    selectedDayLabel={editDay}
                    lessonsShift1={currentSchedule.shifts['1'].lessons}
                    lessonsShift2={currentSchedule.shifts['2'].lessons}
                    onUpdateLesson={updateLesson}
                    onAddLesson={addLesson}
                    onDeleteLesson={deleteLesson}
                />
            </section>

            {/* Global Save */}
            <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur border-t p-4 flex justify-center z-50">
                <Button
                    size="lg"
                    className="w-full max-w-md shadow-lg transition-all"
                    onClick={() => {
                        handleSave();
                        toast.success("Tanaffus vaqtlari muvaffaqiyatli saqlandi");
                    }}
                    disabled={hasInvalidTime}
                >
                    {hasInvalidTime ? "Vaqtlarni to'g'rilang" : "Barcha O'zgarishlarni Saqlash"}
                </Button>
            </div>
        </div>
    );
}
