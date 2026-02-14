import { cn } from "@/lib/utils";

interface StatusPillProps {
    status: string;
    variant?: 'active' | 'finished' | 'default';
}

export function StatusPill({ status, variant = 'default' }: StatusPillProps) {
    const isActive = variant === 'active';
    const isFinished = variant === 'finished';

    return (
        <div className="flex justify-center w-full py-4">
            <div className={cn(
                "relative flex items-center justify-center px-7 py-2.5 sm:px-10 sm:py-3.5 rounded-full text-base sm:text-lg md:text-xl font-black shadow-2xl transition-all duration-700 overflow-hidden backdrop-blur-2xl border mega-shimmer",
                isActive
                    ? "bg-foreground/95 text-background scale-105 border-primary/50 shadow-primary/30 ring-4 ring-primary/10"
                    : isFinished
                        ? "bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 shadow-red-500/10"
                        : "bg-white/80 dark:bg-card/40 text-muted-foreground border-black/[0.05] dark:border-white/10"
            )}>
                {/* Visual Effects for Active/Finished */}
                {isActive && (
                    <>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />
                        <span className="absolute inset-0 bg-primary/5 animate-pulse rounded-full" />
                    </>
                )}

                {isFinished && (
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                )}

                <span className="relative z-10 flex items-center gap-4">
                    {isActive ? (
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        </span>
                    ) : isFinished ? (
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                    ) : null}

                    <span className="tracking-tight">{status}</span>
                </span>
            </div>
        </div>
    );
}
