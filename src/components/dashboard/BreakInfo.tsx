interface BreakInfoProps {
    duration: number; // in minutes
}

export function BreakInfo({ duration }: BreakInfoProps) {
    return (
        <div className="flex items-center justify-center py-2">
            <div className="bg-secondary/50 text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Tanaffus: {duration} daq
            </div>
        </div>
    );
}
