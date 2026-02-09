import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.8)] hover:scale-110 active:scale-95 transition-all duration-300 border-0 ring-1 ring-white/20 animate-shimmer font-bold tracking-wide",
                destructive: "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_-5px_rgba(225,29,72,0.5)] hover:shadow-[0_0_25px_-5px_rgba(225,29,72,0.7)] hover:scale-105",
                outline: "border-2 border-primary/50 bg-background/50 backdrop-blur-md shadow-sm hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all duration-300",
                secondary: "bg-white/80 dark:bg-black/50 text-foreground hover:bg-white dark:hover:bg-black/80 backdrop-blur-md border border-white/20 shadow-md hover:scale-105 transition-all",
                ghost: "hover:bg-primary/10 hover:text-primary transition-colors hover:scale-105",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
