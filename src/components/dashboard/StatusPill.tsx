import { cn } from "@/lib/utils";

interface StatusPillProps {
    status: string;
    isActive?: boolean;
}

export function StatusPill({ status, isActive }: StatusPillProps) {
    return (
        <div className="flex justify-center w-full py-4">
            <div className={cn(
                "relative flex items-center justify-center px-6 py-2 sm:px-8 sm:py-3 rounded-full text-base sm:text-lg md:text-xl font-bold shadow-xl transition-all duration-500 overflow-hidden backdrop-blur-md border",
                isActive
                    ? "bg-foreground/90 text-background scale-105 sm:scale-110 border-primary/50 shadow-primary/25 ring-2 sm:ring-4 ring-primary/10"
                    : "bg-card/40 text-muted-foreground border-white/10 hover:bg-card/60"
            )}>
                {/* Active Pulse Effect */}
                {isActive && (
                    <>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                        <span className="absolute inset-0 bg-primary/10 animate-pulse rounded-full" />
                    </>
                )}

                <span className="relative z-10 flex items-center gap-3">
                    {isActive && (
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    )}
                    {status}
                </span>
            </div>
        </div>
    );
}
