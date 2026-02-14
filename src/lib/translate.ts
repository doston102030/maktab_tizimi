import { i18n } from './i18n';
import type { Language } from '@/types';

export const translateLessonName = (name: string, language: Language): string => {
    if (!name) return '';
    const t = i18n[language];

    // If it looks like "X-dars" or just contains "dars", localize it
    if (name.toLowerCase().includes('dars')) {
        const parts = name.split('-');
        const numPart = parts[0];
        const isNumeric = !isNaN(parseInt(numPart));

        if (isNumeric) {
            // Return "1-урок", "1st Lesson" etc
            if (language === 'EN') {
                const num = parseInt(numPart);
                const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
                return `${num}${suffix} ${t.lesson}`;
            }
            return `${numPart}-${t.lesson}`;
        }
    }
    return name;
};
