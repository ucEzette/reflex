"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InstitutionalTooltipProps {
    title: string;
    content: string;
    children?: React.ReactNode;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InstitutionalTooltip({
    title,
    content,
    children,
    className,
    position = 'top'
}: InstitutionalTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: "-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+8px)]",
        bottom: "-translate-x-1/2 translate-y-full left-1/2 top-[calc(100%+8px)]",
        left: "-translate-x-full -translate-y-1/2 top-1/2 right-[calc(100%+8px)]",
        right: "translate-x-full -translate-y-1/2 top-1/2 left-[calc(100%+8px)]",
    };

    return (
        <div
            className={cn("relative inline-block", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || (
                <div className="p-1 rounded-md hover:bg-white/5 transition-colors cursor-help">
                    <Info className="w-4 h-4 text-zinc-500" />
                </div>
            )}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className={cn(
                            "absolute z-[100] w-72 p-5 rounded-2xl",
                            "bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                            positionClasses[position]
                        )}
                    >
                        <div className="space-y-2 pointer-events-none">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                {title}
                            </h4>
                            <p className="text-xs leading-relaxed text-zinc-300 font-medium">
                                {content}
                            </p>
                        </div>

                        {/* Little arrow/notch can be added here if desired */}
                        <div className={cn(
                            "absolute w-2 h-2 bg-zinc-950/80 border-white/10 rotate-45 border-b border-r",
                            position === 'top' && "left-1/2 -translate-x-1/2 -bottom-1 border-t-0 border-l-0",
                            position === 'bottom' && "left-1/2 -translate-x-1/2 -top-1 border-b-0 border-r-0 rotate-[225deg]",
                        )} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
