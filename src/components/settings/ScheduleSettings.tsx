import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { Lesson, ShiftId } from '@/types';

interface ScheduleSettingsProps {
    lessonsShift1: Lesson[];
    lessonsShift2: Lesson[];
    onUpdateLesson: (shift: ShiftId, lessonId: string, field: keyof Lesson, value: string) => void;
    onAddLesson: (shift: ShiftId) => void;
    onDeleteLesson: (shift: ShiftId, lessonId: string) => void;
    selectedDayLabel: string;
}

// Helper Component for Row
function LessonRow({
    lesson,
    onUpdate,
    onDelete
}: {
    lesson: Lesson;
    onUpdate: (id: string, f: keyof Lesson, v: string) => void;
    onDelete: (id: string) => void;
}) {
    const isValid = lesson.startTime < lesson.endTime;

    return (
        <div className="flex flex-col md:flex-row gap-2 md:items-center relative p-3 md:p-0 bg-secondary/10 md:bg-transparent rounded-lg border md:border-none">
            {/* Input Group */}
            <div className="flex flex-1 flex-col md:flex-row gap-2 w-full">
                {/* Name */}
                <Input
                    value={lesson.name}
                    onChange={(e) => onUpdate(lesson.id, 'name', e.target.value)}
                    className="w-full md:flex-[2] min-w-[120px]"
                    placeholder="Nomi"
                />

                {/* Time Inputs */}
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        type="time"
                        value={lesson.startTime}
                        onChange={(e) => onUpdate(lesson.id, 'startTime', e.target.value)}
                        className="flex-1 md:w-[110px]"
                        aria-invalid={!isValid}
                    />
                    <Input
                        type="time"
                        value={lesson.endTime}
                        onChange={(e) => onUpdate(lesson.id, 'endTime', e.target.value)}
                        className={`flex-1 md:w-[110px] ${!isValid ? 'border-destructive text-destructive' : ''}`}
                    />
                </div>
            </div>

            {/* Delete & Error Container */}
            <div className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto mt-1 md:mt-0">
                {!isValid && (
                    <span className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-left-2">
                        Vaqt xato!
                    </span>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(lesson.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0 ml-auto md:ml-0"
                >
                    <Trash2 size={18} />
                </Button>
            </div>
        </div>
    );
}

function ShiftColumn({
    title,
    lessons,
    onUpdate,
    onAdd,
    onDelete
}: {
    title: string,
    lessons: Lesson[],
    onUpdate: (id: string, f: keyof Lesson, v: string) => void,
    onAdd: () => void,
    onDelete: (id: string) => void
}) {
    return (
        <Card className="flex-1 rounded-xl shadow-sm border bg-card/50">
            <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 border rounded-lg p-3 sm:p-4">
                    <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-primary">
                        {title}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
                <div className="flex flex-col gap-3">
                    {lessons.map((lesson) => (
                        <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))}
                </div>

                <Button variant="outline" className="w-full dashed border-2 border-muted hover:border-primary/50 text-muted-foreground hover:text-primary mt-2 h-12" onClick={onAdd}>
                    <Plus size={16} className="mr-2" /> Dars Qo'shish
                </Button>
            </CardContent>
        </Card>
    );
}

export function ScheduleSettings({
    lessonsShift1,
    lessonsShift2,
    onUpdateLesson,
    onAddLesson,
    onDeleteLesson,
    selectedDayLabel
}: ScheduleSettingsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Jadval Sozlamalari ({selectedDayLabel})</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <ShiftColumn
                    title="1-smena"
                    lessons={lessonsShift1}
                    onUpdate={(id, f, v) => onUpdateLesson('1', id, f, v)}
                    onAdd={() => onAddLesson('1')}
                    onDelete={(id) => onDeleteLesson('1', id)}
                />
                <ShiftColumn
                    title="2-smena"
                    lessons={lessonsShift2}
                    onUpdate={(id, f, v) => onUpdateLesson('2', id, f, v)}
                    onAdd={() => onAddLesson('2')}
                    onDelete={(id) => onDeleteLesson('2', id)}
                />
            </div>
        </div>
    );
}
