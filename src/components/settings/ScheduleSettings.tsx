import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ChevronsRight, Clock, Power, Sparkles } from 'lucide-react';
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
    onLoadStandard: () => void;
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
            "group relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md hover:border-primary/30 w-full overflow-hidden",
            !isActive && "opacity-60 grayscale bg-muted/30"
        )}>
            {/* Main Content */}
            <div className="flex-1 w-full grid grid-cols-[1fr,auto] sm:grid-cols-[1fr,auto,auto] gap-3 sm:gap-4 items-center">
                {/* Name */}
                <div className="col-span-2 sm:col-span-1 min-w-0">
                    <span className="text-sm sm:text-base font-bold text-foreground ml-1 truncate block">
                        {lesson.name}
                    </span>
                </div>

                {/* Time Inputs Group */}
                <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-xl border border-transparent focus-within:border-primary/30 focus-within:bg-secondary/60 transition-all justify-start sm:justify-start ring-offset-background group-hover:bg-secondary/70">
                    <div className="relative">
                        <Input
                            type="time"
                            value={lesson.startTime}
                            onChange={(e) => onUpdate(lesson.id, 'startTime', e.target.value)}
                            className={cn(
                                "w-[75px] sm:w-[95px] h-9 p-0 sm:p-1 text-center font-black tabular-nums text-sm sm:text-base bg-transparent border-none shadow-none focus-visible:ring-0",
                                index > 0 && "opacity-70 cursor-not-allowed"
                            )}
                            readOnly={index > 0}
                            tabIndex={index > 0 ? -1 : 0}
                            aria-invalid={!isValid}
                        />
                    </div>
                    <ChevronsRight size={16} className="text-primary/60 shrink-0" />
                    <div className="relative">
                        <Input
                            type="time"
                            value={lesson.endTime}
                            onChange={(e) => onUpdate(lesson.id, 'endTime', e.target.value)}
                            className={cn(
                                "w-[75px] sm:w-[95px] h-9 p-0 sm:p-1 text-center font-black tabular-nums text-sm sm:text-base bg-transparent border-none shadow-none focus-visible:ring-0",
                                !isValid && "text-destructive font-black"
                            )}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end w-full sm:w-auto gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUpdate(lesson.id, 'isActive', !isActive)}
                        className={cn(
                            "h-9 w-9 rounded-xl transition-all",
                            isActive ? "text-green-500 bg-green-500/10 hover:bg-green-500/20 shadow-sm shadow-green-500/10" : "text-muted-foreground bg-secondary/50 hover:text-primary hover:bg-primary/10"
                        )}
                        title={isActive ? "Vaqtincha o'chirish" : "Yoqish"}
                    >
                        <Power size={18} />
                    </Button>

                    {!isValid && (
                        <span className="text-xs text-destructive font-black mr-2 animate-pulse whitespace-nowrap">
                            {t.timeError}
                        </span>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(lesson.id)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-105"
                    >
                        <Trash2 size={18} />
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
        <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Icon size={18} />
                </div>
                <h4 className="font-semibold text-lg tracking-tight">{title}</h4>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-auto whitespace-nowrap">
                    {lessons.length} ta
                </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px] md:min-h-[300px] w-full min-w-0">
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
    onLoadStandard,
    selectedDayLabel,
    language
}: ScheduleSettingsProps) {
    const t = i18n[language];
    // Icons for shifts
    const SunIcon = () => <span className="text-xl">☀️</span>;
    const MoonIcon = () => <span className="text-xl">🌙</span>;
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                        {t.schedule} <span className="text-primary">—</span> {selectedDayLabel}
                    </h3>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadStandard}
                    className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold px-5 flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
                >
                    <Sparkles size={16} className="text-primary animate-pulse" />
                    Standart 5 soatlik jadval
                </Button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">
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
                <div className="hidden xl:block w-px bg-border my-4" />

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
