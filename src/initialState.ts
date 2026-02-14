import type { AppState, DayId, DaySchedule, Lesson, ShiftId } from './types';
import { parse, format, addMinutes } from 'date-fns';

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];


const generateDefaultLessons = (shift: ShiftId): Lesson[] => {
    const lessons: Lesson[] = [];
    const baseStart = shift === '1' ? '08:00' : '13:30';
    const breakPattern = [5, 5, 15, 5, 5]; // 15 min Big Break after 3rd lesson

    let lastEndTime = baseStart;

    for (let i = 0; i < 5; i++) {
        const startDt = parse(lastEndTime, 'HH:mm', new Date());
        // If it's not the first lesson, add the break from the pattern
        const lessonStartDt = i === 0 ? startDt : addMinutes(startDt, breakPattern[i - 1] || 5);
        const lessonEndDt = addMinutes(lessonStartDt, 45);

        const startTime = format(lessonStartDt, 'HH:mm');
        const endTime = format(lessonEndDt, 'HH:mm');

        lessons.push({
            id: crypto.randomUUID(),
            name: `${i + 1}-dars`,
            startTime,
            endTime,
            isActive: true
        });

        lastEndTime = endTime;
    }
    return lessons;
};

const generateFullSchedule = (): Record<DayId, DaySchedule> => {
    const schedule: Partial<Record<DayId, DaySchedule>> = {};
    DAYS.forEach(day => {
        schedule[day] = {
            dayId: day,
            isActive: day !== 'Yakshanba', // Sunday is inactive by default
            shifts: {
                '1': { shiftId: '1', lessons: day === 'Yakshanba' ? [] : generateDefaultLessons('1') },
                '2': { shiftId: '2', lessons: day === 'Yakshanba' ? [] : generateDefaultLessons('2') }
            }
        };
    });
    return schedule as Record<DayId, DaySchedule>;
};

const EMPTY_SCHEDULE = generateFullSchedule();


export const INITIAL_STATE: AppState = {
    config: { schoolName: '4-maktab', subtitle: 'Maktab qo\'ng\'irog\'i' },
    schedule: EMPTY_SCHEDULE,
    selectedDay: 'Payshanba',
    selectedShift: '1',
    language: 'UZ',
    theme: 'dark',
};
