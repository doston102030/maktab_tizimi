export type Language = 'UZ' | 'RU' | 'EN';
export type Theme = 'dark' | 'light';
export type ShiftId = '1' | '2';
export type DayId = 'Dushanba' | 'Seshanba' | 'Chorshanba' | 'Payshanba' | 'Juma' | 'Shanba';

export interface Lesson {
    id: string;
    name: string; // "1-dars"
    startTime: string; // "08:00"
    endTime: string; // "08:45"
    breakMinutes?: string; // Optional break duration (minutes)
}

export interface ShiftSchedule {
    shiftId: ShiftId;
    lessons: Lesson[];
    breakDuration?: string; // Default break duration for this shift
}

export interface DaySchedule {
    dayId: DayId;
    isActive: boolean;
    shifts: {
        '1': ShiftSchedule;
        '2': ShiftSchedule;
    };
}

export interface AppConfig {
    schoolName: string;
    subtitle: string;
}

export interface AppState {
    config: AppConfig;
    schedule: Record<DayId, DaySchedule>;
    selectedDay: DayId;
    selectedShift: ShiftId;
    language: Language;
    theme: Theme;
}
