import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DayId, Language } from '@/types';
import { i18n } from '@/lib/i18n';

interface GeneralSettingsProps {
    schoolName: string;
    onSchoolNameChange: (val: string) => void;
    activeDays: DayId[];
    onToggleDay: (day: string) => void;
    onSave: () => void;
    language: Language;
}

export function GeneralSettings({ schoolName, onSchoolNameChange, activeDays, onToggleDay, onSave, language }: GeneralSettingsProps) {
    const t = i18n[language];

    // Short names for toggles
    const SHORT_DAYS = [
        { id: 'Dushanba', label: language === 'UZ' ? 'Du' : language === 'RU' ? 'Пн' : 'Mo' },
        { id: 'Seshanba', label: language === 'UZ' ? 'Se' : language === 'RU' ? 'Вт' : 'Tu' },
        { id: 'Chorshanba', label: language === 'UZ' ? 'Chor' : language === 'RU' ? 'Ср' : 'We' },
        { id: 'Payshanba', label: language === 'UZ' ? 'Pay' : language === 'RU' ? 'Чт' : 'Th' },
        { id: 'Juma', label: language === 'UZ' ? 'Ju' : language === 'RU' ? 'Пт' : 'Fr' },
        { id: 'Shanba', label: language === 'UZ' ? 'Sha' : language === 'RU' ? 'Сб' : 'Sa' },
        { id: 'Yakshanba', label: language === 'UZ' ? 'Ya' : language === 'RU' ? 'Вс' : 'Su' },
    ] as const;

    return (
        <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">{t.settings}</h2>

            <div className="space-y-4">
                {/* Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t.schoolName}</label>
                    <Input
                        value={schoolName}
                        onChange={(e) => onSchoolNameChange(e.target.value)}
                        placeholder="School Name"
                        className="max-w-md h-10 md:h-11 text-base"
                    />
                </div>

                {/* Working Days Card */}
                <div className="flex flex-col gap-4 relative pt-4 md:pt-6 border-t border-border/50">
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold">{t.workingDays}</label>
                        <div className="flex flex-wrap gap-2">
                            {SHORT_DAYS.map((day) => {
                                const isActive = activeDays.includes(day.id as DayId);
                                return (
                                    <button
                                        key={day.id}
                                        onClick={() => onToggleDay(day.id)}
                                        className={cn(
                                            "flex-1 min-w-[3rem] h-10 md:h-11 flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-sm border select-none",
                                            isActive
                                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105 font-bold"
                                                : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                                        )}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-border/50">
                        <Button
                            onClick={onSave}
                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto font-semibold px-8 h-10 md:h-11 text-base shadow-sm"
                        >
                            {t.save}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
