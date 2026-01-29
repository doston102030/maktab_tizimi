import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DayId } from '@/types';

// Short names for toggles as requested: "Yak, Dush, Sesh, Chor, Pay, Jum, Shan"
// Mapping to DayId
const SHORT_DAYS = [
    { id: 'Yakshanba', label: 'Yak' },
    { id: 'Dushanba', label: 'Dush' },
    { id: 'Seshanba', label: 'Sesh' },
    { id: 'Chorshanba', label: 'Chor' },
    { id: 'Payshanba', label: 'Pay' },
    { id: 'Juma', label: 'Jum' },
    { id: 'Shanba', label: 'Shan' },
] as const;

interface GeneralSettingsProps {
    schoolName: string;
    onSchoolNameChange: (val: string) => void;
    activeDays: DayId[]; // List of active days
    onToggleDay: (day: string) => void; // Using string to allow Yakshanba if needed
    onSave: () => void;
}

export function GeneralSettings({ schoolName, onSchoolNameChange, activeDays, onToggleDay, onSave }: GeneralSettingsProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Umumiy Sozlamalar</h2>

            <div className="space-y-4">
                {/* Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Maktab Nomi</label>
                    <Input
                        value={schoolName}
                        onChange={(e) => onSchoolNameChange(e.target.value)}
                        placeholder="Maktab nomini kiriting"
                        className="max-w-md"
                    />
                </div>

                {/* Working Days Card */}
                <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm flex flex-col gap-6 relative">
                    <div className="flex flex-col gap-4">
                        <label className="text-base font-semibold">Ish kunlari</label>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {SHORT_DAYS.map((day) => {
                                const isActive = activeDays.includes(day.id as DayId);
                                return (
                                    <button
                                        key={day.id}
                                        onClick={() => onToggleDay(day.id)}
                                        className={cn(
                                            "flex-1 min-w-[3.5rem] md:min-w-[4rem] h-10 md:h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-sm border",
                                            isActive
                                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 ring-2 ring-blue-600/20"
                                                : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                                        )}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2 border-t border-border/50">
                        <Button
                            onClick={onSave}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 md:text-lg h-auto shadow-md"
                        >
                            Saqlash
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
