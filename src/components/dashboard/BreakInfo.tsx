interface BreakInfoProps {
    duration: number; // in minutes
    label?: string;
}

export function BreakInfo({ duration, label = "Tanaffus" }: BreakInfoProps) {
    return (
        <div className="flex flex-col items-center justify-center -my-3 relative z-0 group py-1">
            <div className="h-4 w-[1.5px] bg-gradient-to-b from-transparent via-black/10 dark:via-white/10 to-black/10 dark:to-white/10" />
            <div className="relative">
                {/* Glow behind break pill */}
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-white/90 dark:bg-[#0d1017] backdrop-blur-md text-muted-foreground dark:text-[#8e99ae] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-black/[0.05] dark:border-white/5 shadow-xl transition-all duration-300 group-hover:text-foreground dark:group-hover:text-white group-hover:border-primary/30 group-hover:scale-105">
                    <span className="text-primary font-black">{duration} min</span> <span className="mx-1 opacity-30">•</span> {label}
                </div>
            </div>
            <div className="h-4 w-[1.5px] bg-gradient-to-b from-black/10 dark:from-white/10 via-black/10 dark:via-white/10 to-transparent" />
        </div>
    );
}
