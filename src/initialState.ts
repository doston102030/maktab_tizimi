import type { AppState, DayId, DaySchedule, Lesson } from './types';

const DAYS: DayId[] = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

const createEmptyDaySchedule = (dayId: DayId): DaySchedule => ({
    dayId,
    isActive: true, // Default active
    shifts: {
        '1': { shiftId: '1', lessons: [] },
        '2': { shiftId: '2', lessons: [] }
    }
});

const generateFullSchedule = (): Record<DayId, DaySchedule> => {
    const schedule: Partial<Record<DayId, DaySchedule>> = {};
    DAYS.forEach(day => {
        schedule[day] = createEmptyDaySchedule(day);
    });
    return schedule as Record<DayId, DaySchedule>;
};

const EMPTY_SCHEDULE = generateFullSchedule();

// Seed specific data for Payshanba as per original request, but now correctly typed within full structure
const SEEDED_PAYSHANBA_SHIFT_1: Lesson[] = [
    { id: '1', name: '1-dars', startTime: '08:00', endTime: '08:45' },
    { id: '2', name: '2-dars', startTime: '08:50', endTime: '09:35' },
    { id: '3', name: '3-dars', startTime: '09:40', endTime: '10:25' },
    { id: '4', name: '4-dars', startTime: '10:30', endTime: '11:15' },
];

const SEEDED_PAYSHANBA_SHIFT_2: Lesson[] = [
    { id: '11', name: '1-dars', startTime: '13:30', endTime: '14:15' },
    { id: '12', name: '2-dars', startTime: '14:20', endTime: '15:05' },
];

// Apply seeds
if (EMPTY_SCHEDULE['Payshanba']) {
    EMPTY_SCHEDULE['Payshanba'].shifts['1'].lessons = SEEDED_PAYSHANBA_SHIFT_1;
    EMPTY_SCHEDULE['Payshanba'].shifts['2'].lessons = SEEDED_PAYSHANBA_SHIFT_2;
}

export const INITIAL_STATE: AppState = {
    config: { schoolName: '4-maktab', subtitle: 'Maktab qo\'ng\'irog\'i' },
    schedule: EMPTY_SCHEDULE,
    selectedDay: 'Payshanba',
    selectedShift: '1',
    language: 'UZ',
    theme: 'dark',
};
