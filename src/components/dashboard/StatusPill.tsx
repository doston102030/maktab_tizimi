export function StatusPill({ status }: { status: string }) {
    // Provided example: "Darslar tugadi"
    // Needs "Rounded, centered, subtle background"
    return (
        <div className="flex justify-center w-full py-2 md:py-4">
            <div className="bg-muted text-muted-foreground px-4 py-1.5 md:px-6 md:py-2 rounded-full text-base md:text-lg font-medium shadow-sm text-center">
                {status}
            </div>
        </div>
    );
}
