interface BreakInfoProps {
    duration: number; // in minutes
    label?: string;
}

export function BreakInfo({ duration, label = "Tanaffus" }: BreakInfoProps) {
    return (
        <div className="flex flex-col items-center justify-center -my-2 relative z-0 opacity-80 hover:opacity-100 transition-opacity">
            <div className="h-6 w-0.5 bg-gradient-to-b from-border/0 via-border to-border/0" />
            <div className="bg-secondary/50 backdrop-blur-sm text-secondary-foreground px-4 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border border-white/10 shadow-sm ring-1 ring-black/5">
                {duration} min • {label}
            </div>
            <div className="h-6 w-0.5 bg-gradient-to-b from-border/0 via-border to-border/0" />
        </div>
    );
}
