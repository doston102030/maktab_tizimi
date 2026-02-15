import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

import { i18n } from '@/lib/i18n';
import type { Language } from '@/types';

export function WelcomeScreen({ onComplete, language }: { onComplete: () => void, language: Language }) {
    const t = i18n[language];
    const [isVisible, setIsVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(false);

    useEffect(() => {
        const textTimer = setTimeout(() => setTextVisible(true), 600);
        const fadeTimer = setTimeout(() => setIsVisible(false), 3200);
        const completeTimer = setTimeout(onComplete, 4200);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center bg-[#020408] transition-all duration-1000 ease-in-out",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
            )}
        >
            {/* Cinematic Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-primary/10 rounded-full blur-[60px] md:blur-[100px] animate-float-particle" />
                <div className="hidden md:block absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-float-particle animation-delay-2000" />
                <div className="hidden md:block absolute top-[40%] right-[30%] w-48 h-48 bg-blue-400/5 rounded-full blur-[80px] animate-float-particle animation-delay-4000" />
            </div>

            <div className="flex flex-col items-center gap-10 max-w-2xl px-8 text-center relative z-10">
                {/* Glowing Morphing Bell Icon */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-[80px] animate-pulse" />
                    <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-600 to-blue-700 p-0.5 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-in zoom-in-50 duration-1000">
                        <div className="w-full h-full bg-[#020408]/90 rounded-[2.4rem] flex items-center justify-center backdrop-blur-3xl">
                            <Bell size={72} className="sm:size-88 text-primary animate-wiggle drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>
                </div>

                {/* Welcome Text with Staggered Entrance */}
                <div className={cn(
                    "flex flex-col items-center gap-6 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)",
                    textVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                )}>
                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tighter">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">
                                {t.welcomeSystem.split(' ')[0]}
                            </span>
                            <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-500">
                                {t.welcomeSystem.split(' ').slice(1).join(' ')}
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 w-full justify-center">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    </div>

                    <p className="text-muted-foreground/60 text-xl sm:text-2xl font-bold tracking-[0.3em] uppercase opacity-80">
                        {t.welcomeBack}
                    </p>
                </div>
            </div>

            {/* Edge Glare Effects */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-none" />
        </div>
    );
}
