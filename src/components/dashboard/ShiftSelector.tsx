import { Sun, Moon } from 'lucide-react';
import type { ShiftId } from '@/types';
import { cn } from '@/lib/utils';

interface ShiftSelectorProps {
    selectedShift: ShiftId;
    onSelect: (shift: ShiftId) => void;
}

export function ShiftSelector({ selectedShift, onSelect }: ShiftSelectorProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
                onClick={() => onSelect('1')}
                className={cn(
                    "flex items-center justify-center gap-2 px-6 py-2 md:px-8 md:py-3 rounded-full font-medium transition-all w-full sm:w-48",
                    selectedShift === '1'
                        ? "bg-blue-600 text-white shadow-md"  // Prompt implied distinct, using Blue as default active
                        : "bg-secondary text-muted-foreground hover:bg-accent"
                )}
            >
                <Sun size={18} />
                <span>1-smena</span>
            </button>

            <button
                onClick={() => onSelect('2')}
                className={cn(
                    "flex items-center justify-center gap-2 px-6 py-2 md:px-8 md:py-3 rounded-full font-medium transition-all w-full sm:w-48",
                    selectedShift === '2'
                        ? "bg-purple-600 text-white shadow-md" // Explicitly Purple
                        : "bg-secondary text-muted-foreground hover:bg-accent"
                )}
            >
                <Moon size={18} />
                <span>2-smena</span>
            </button>
        </div>
    );
}
