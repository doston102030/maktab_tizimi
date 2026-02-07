import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { GeneralSettings } from './GeneralSettings';
import { ScheduleSettings } from './ScheduleSettings';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { DeviceSettings } from './DeviceSettings';
import type { AppState, DayId, Lesson, ShiftId } from '@/types';
import { addMinutes, differenceInMinutes, parse, format, isValid as isValidDate } from 'date-fns';
import { i18n } from '@/lib/i18n';

interface SettingsPageProps {
    appState: AppState;
    onSave: (newState: AppState) => void;
    onBack: () => void;
}

// Break pattern: after 1st lesson (5min), 2nd (10min), 3rd (10min), 4th (5min), 5th (5min)
const BREAKS = [5, 10, 10, 5, 5];

// Helper: Recalculate lesson times preserving durations and enforcing variable gaps
const recalculateLessons = (lessons: Lesson[]): Lesson[] => {
    if (lessons.length === 0) return [];

    const now = new Date();
    // Helper to parse time string "HH:mm" to Date
    const toDate = (timeStr: string) => parse(timeStr, 'HH:mm', now);
    // Helper to format Date to "HH:mm"
    const toStr = (date: Date) => format(date, 'HH:mm');

    // Create a new array with new object references to avoid mutating state
    const newLessons = lessons.map(lesson => ({ ...lesson }));

    // Iterate from 2nd lesson onwards
    for (let i = 0; i < newLessons.length; i++) {
        if (i > 0) {
            const prevLesson = newLessons[i - 1];
            const prevEnd = toDate(prevLesson.endTime);

            if (isValidDate(prevEnd)) {
                // Determine break duration based on previous lesson index (0-based)
                // i=1 (2nd lesson) means break after lesson index 0 (1st lesson)
                // Break logic: 
                // After Lesson 1 (index 0): BREAKS[0] = 5
                // After Lesson 2 (index 1): BREAKS[1] = 10
                // After Lesson 3 (index 2): BREAKS[2] = 10
                // ... fallback to 5 if undefined
                const breakDuration = BREAKS[i - 1] ?? 5;

                const newStart = addMinutes(prevEnd, breakDuration);
                newLessons[i].startTime = toStr(newStart);

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
        }
    }

    return newLessons;
};

export function SettingsPage({ appState, onSave, onBack }: SettingsPageProps) {
    const t = i18n[appState.language];

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
            // Deep copy structure to ensure independence
            const newSchedule = { ...prev.schedule };

            // Ensure day exists
            if (!newSchedule[editDay]) return prev;

            const newDaySched = { ...newSchedule[editDay]! };
            const newShifts = { ...newDaySched.shifts };

            // Ensure target shift is independent
            const targetShift = { ...newShifts[shift] };

            // 1. Update the specific lesson
            let newLessons = targetShift.lessons.map(l =>
                l.id === lessonId ? { ...l, [field]: value } : { ...l }
            );

            // Special handling: If startTime changed, preserve duration (default 45) and update endTime
            // This allows moving the whole block by changing the first lesson's start time
            if (field === 'startTime') {
                const updatedLesson = newLessons.find(l => l.id === lessonId);
                if (updatedLesson) {
                    const now = new Date();
                    const toDate = (t: string) => parse(t, 'HH:mm', now);
                    const newStart = toDate(value);

                    if (isValidDate(newStart)) {
                        // Enforce 45min duration when manually changing Start Time
                        // This prevents "invalid time" state and allows the shift to move
                        const newEnd = addMinutes(newStart, 45);
                        updatedLesson.endTime = format(newEnd, 'HH:mm');
                    }
                }
            }

            // 2. Recalculate chain (only if time changed)
            if (field === 'startTime' || field === 'endTime') {
                newLessons = recalculateLessons(newLessons);
            }

            // 3. Re-assemble state tree with new references
            targetShift.lessons = newLessons;
            newShifts[shift] = targetShift;
            newDaySched.shifts = newShifts;
            newSchedule[editDay] = newDaySched;

            return {
                ...prev,
                schedule: newSchedule
            };
        });
    };

    const addLesson = (shift: ShiftId) => {
        const shiftLessons = currentSchedule.shifts[shift].lessons;

        let startTime = shift === '1' ? '08:00' : '13:30'; // Default based on shift (13:30 for 2nd shift)
        // If there are existing lessons, start after last one with correct break
        if (shiftLessons.length > 0) {
            const lastLesson = shiftLessons[shiftLessons.length - 1];
            const lastIndex = shiftLessons.length - 1; // 0-based index of last lesson
            const now = new Date();
            const lastEnd = parse(lastLesson.endTime, 'HH:mm', now);
            if (isValidDate(lastEnd)) {
                // Determine break based on index of the LESSON THAT JUST ENDED
                const breakDuration = BREAKS[lastIndex] ?? 5;
                const newStart = addMinutes(lastEnd, breakDuration);
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

        <div className="min-h-screen bg-background pb-32">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-4xl mx-auto flex h-14 md:h-16 items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-lg">⚙️</span>
                        </div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">{t.settings}</h1>
                    </div>
                    <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-primary">
                        {t.back}
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6 md:space-y-8">
                {/* General Settings Section */}
                <section className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 transition-all hover:shadow-md">
                    <GeneralSettings
                        schoolName={draftState.config.schoolName}
                        onSchoolNameChange={updateSchoolName}
                        activeDays={activeDays}
                        onToggleDay={toggleWorkingDay}
                        onSave={() => {
                            handleSave();
                            toast.success(t.saved);
                        }}
                        language={appState.language}
                    />
                </section>

                {/* Schedule Editor Section */}
                <section className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">{t.schedule}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t.schedule} sozlamalari
                            </p>
                        </div>
                        <div className="w-full sm:w-auto">
                            <DaySelector selectedDay={editDay} onSelect={setEditDay} language={appState.language} />
                        </div>
                    </div>

                    <div className="bg-card/50 rounded-2xl border shadow-sm p-2 sm:p-6 transition-all">
                        <ScheduleSettings
                            selectedDayLabel={editDay}
                            lessonsShift1={currentSchedule.shifts['1'].lessons}
                            lessonsShift2={currentSchedule.shifts['2'].lessons}
                            onUpdateLesson={updateLesson}
                            onAddLesson={addLesson}
                            onDeleteLesson={deleteLesson}
                            language={appState.language}
                        />
                    </div>
                </section>

                {/* Device Settings Section */}
                <section className="bg-gradient-to-br from-card to-secondary/30 rounded-2xl border shadow-sm p-4 md:p-6">
                    <DeviceSettings appState={draftState} selectedDay={editDay} language={appState.language} />
                </section>
            </main>

            {/* Floating Save Bar */}
            <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50 pointer-events-none">
                <div className="bg-background/80 backdrop-blur-lg border shadow-xl rounded-full p-2 pr-6 pl-6 flex items-center gap-4 pointer-events-auto max-w-md w-full animate-in slide-in-from-bottom-6 duration-500">
                    <span className="text-sm font-medium text-muted-foreground flex-1 truncate">
                        {hasInvalidTime ? t.timeError : "O'zgarishlarni saqlashni unutmang"}
                    </span>
                    <Button
                        size="lg"
                        className={`rounded-full px-8 font-semibold shadow-lg transition-all ${hasInvalidTime ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                            }`}
                        onClick={() => {
                            handleSave();
                            toast.success(t.saved);
                        }}
                        disabled={hasInvalidTime}
                    >
                        {hasInvalidTime ? t.timeError : t.save}
                    </Button>
                </div>
            </div>
        </div>
    );
}





