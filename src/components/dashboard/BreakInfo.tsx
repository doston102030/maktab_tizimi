interface BreakInfoProps {
    duration: number; // in minutes
    label?: string;
}

export function BreakInfo({ duration, label = "Tanaffus" }: BreakInfoProps) {
    return (
        <div className="flex items-center justify-center py-2 relative z-0">
            <div className="h-full absolute top-0 bottom-0 w-px bg-border/50 -z-10" />
            <div className="bg-secondary/80 backdrop-blur text-secondary-foreground px-3 py-0.5 rounded-full text-xs font-medium border border-border/50 shadow-sm">
                {label}: {duration} min
            </div>
        </div>
    );
}
