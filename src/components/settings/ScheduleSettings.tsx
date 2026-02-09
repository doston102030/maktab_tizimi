import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ChevronsRight, Clock, Power } from 'lucide-react';
import type { Lesson, ShiftId, Language } from '@/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { i18n } from '@/lib/i18n';

interface ScheduleSettingsProps {
    lessonsShift1: Lesson[];
    lessonsShift2: Lesson[];
    onUpdateLesson: (shift: ShiftId, lessonId: string, field: keyof Lesson, value: any) => void;
    onAddLesson: (shift: ShiftId) => void;
    onDeleteLesson: (shift: ShiftId, lessonId: string) => void;
    selectedDayLabel: string;
    language: Language;
}

// Helper Component for Row
function LessonRow({
    index,
    lesson,
    onUpdate,
    onDelete,
    language
}: {
    index: number;
    lesson: Lesson;
    onUpdate: (id: string, f: keyof Lesson, v: any) => void;
    onDelete: (id: string) => void;
    language: Language;
}) {
    const t = i18n[language];
    const isValid = lesson.startTime < lesson.endTime;
    const isActive = lesson.isActive !== false; // Default true if undefined

    return (
        <div className={cn(
            "group relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:border-primary/20",
            !isActive && "opacity-60 grayscale bg-muted/30"
        )}>
            {/* Index Badge removed as requested */}

            {/* Main Content */}
            <div className="flex-1 w-full grid grid-cols-[1fr,auto] sm:grid-cols-[1fr,auto,auto] gap-2 sm:gap-3 items-center">
                {/* Name */}
                <div className="col-span-2 sm:col-span-1">
                    <span className="text-sm font-medium text-muted-foreground ml-1">
                        {lesson.name}
                    </span>
                </div>

                {/* Time Inputs Group */}
                <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-secondary/50 transition-all justify-start sm:justify-start">
                    <div className="relative">
                        <Input
                            type="time"
                            value={lesson.startTime}
                            onChange={(e) => onUpdate(lesson.id, 'startTime', e.target.value)}
                            className={cn(
                                "w-[65px] sm:w-[90px] h-8 p-0 sm:p-1 text-center font-mono text-xs sm:text-sm bg-transparent border-none shadow-none focus-visible:ring-0",
                                index > 0 && "opacity-70 cursor-not-allowed"
                            )}
                            readOnly={index > 0}
                            tabIndex={index > 0 ? -1 : 0}
                            aria-invalid={!isValid}
                        />
                    </div>
                    <ChevronsRight size={14} className="text-muted-foreground shrink-0" />
                    <div className="relative">
                        <Input
                            type="time"
                            value={lesson.endTime}
                            onChange={(e) => onUpdate(lesson.id, 'endTime', e.target.value)}
                            className={cn(
                                "w-[65px] sm:w-[90px] h-8 p-0 sm:p-1 text-center font-mono text-xs sm:text-sm bg-transparent border-none shadow-none focus-visible:ring-0",
                                !isValid && "text-destructive font-bold"
                            )}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end w-full sm:w-auto gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUpdate(lesson.id, 'isActive', !isActive)}
                        className={cn(
                            "h-8 w-8 transition-colors",
                            isActive ? "text-green-500 hover:text-green-600 hover:bg-green-100" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        )}
                        title={isActive ? "Vaqtincha o'chirish" : "Yoqish"}
                    >
                        <Power size={16} />
                    </Button>

                    {!isValid && (
                        <span className="text-xs text-destructive font-semibold mr-2 animate-pulse whitespace-nowrap">
                            {t.timeError}
                        </span>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(lesson.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ShiftColumn({
    title,
    lessons,
    onUpdate,
    onAdd,
    onDelete,
    icon: Icon,
    language
}: {
    title: string,
    lessons: Lesson[],
    onUpdate: (id: string, f: keyof Lesson, v: any) => void,
    onAdd: () => void,
    onDelete: (id: string) => void,
    icon: React.ElementType,
    language: Language
}) {
    const t = i18n[language];
    return (
        <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Icon size={18} />
                </div>
                <h4 className="font-semibold text-lg tracking-tight">{title}</h4>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-auto whitespace-nowrap">
                    {lessons.length} ta
                </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px] md:min-h-[300px]">
                {lessons.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-secondary/5 text-muted-foreground">
                        <Clock className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">{t.noLessons}</p>
                    </div>
                ) : (
                    lessons.map((lesson, idx) => (
                        <LessonRow
                            key={lesson.id}
                            index={idx}
                            lesson={lesson}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            language={language}
                        />
                    ))
                )}

                <Button
                    variant="outline"
                    className="w-full border-dashed border-2 hover:border-primary/50 text-muted-foreground hover:text-primary h-10 md:h-12 mt-auto"
                    onClick={onAdd}
                >
                    <Plus size={16} className="mr-2" /> {t.addLesson}
                </Button>
            </div>
        </div>
    );
}

export function ScheduleSettings({
    lessonsShift1,
    lessonsShift2,
    onUpdateLesson,
    onAddLesson,
    onDeleteLesson,
    language
}: ScheduleSettingsProps) {
    const t = i18n[language];
    // Icons for shifts
    const SunIcon = () => <span className="text-xl">☀️</span>;
    const MoonIcon = () => <span className="text-xl">🌙</span>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
                <ShiftColumn
                    title={t.shift1}
                    lessons={lessonsShift1}
                    onUpdate={(id, f, v) => onUpdateLesson('1', id, f, v)}
                    onAdd={() => onAddLesson('1')}
                    onDelete={(id) => onDeleteLesson('1', id)}
                    icon={SunIcon}
                    language={language}
                />

                {/* Visual Separator for Desktop */}
                <div className="hidden lg:block w-px bg-border my-4" />

                <ShiftColumn
                    title={t.shift2}
                    lessons={lessonsShift2}
                    onUpdate={(id, f, v) => onUpdateLesson('2', id, f, v)}
                    onAdd={() => onAddLesson('2')}
                    onDelete={(id) => onDeleteLesson('2', id)}
                    icon={MoonIcon}
                    language={language}
                />
            </div>
        </div>
    );
}
