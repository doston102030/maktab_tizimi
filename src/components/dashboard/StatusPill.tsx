import { cn } from "@/lib/utils";

interface StatusPillProps {
    status: string;
    isActive?: boolean;
}

export function StatusPill({ status, isActive }: StatusPillProps) {
    return (
        <div className="flex justify-center w-full py-2">
            <div className={cn(
                "relative flex items-center justify-center px-6 py-2.5 rounded-full text-base md:text-lg font-medium shadow-lg transition-all duration-500 overflow-hidden",
                isActive
                    ? "bg-foreground text-background scale-105"
                    : "bg-card/80 text-muted-foreground backdrop-blur-sm border border-border/50"
            )}>
                {/* Active Pulse Effect */}
                {isActive && (
                    <span className="absolute inset-0 bg-primary/20 animate-pulse rounded-full" />
                )}

                <span className="relative z-10 flex items-center gap-2">
                    {isActive && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-[ping_1.5s_ease-in-out_infinite]" />
                    )}
                    {status}
                </span>
            </div>
        </div>
    );
}
