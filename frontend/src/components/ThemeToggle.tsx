"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[68px] h-[36px] rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <div className="flex items-center justify-center pointer-events-auto">
            {/* 1. Outer recessed container (The "bevel" that makes it look sunken into the navbar) */}
            <div
                className={`
                    relative w-[68px] h-[36px] rounded-full flex items-center justify-center
                    transition-colors duration-500
                    ${isDark ? 'bg-[#161b22] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]' : 'bg-[#E0E5EC] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}
                `}
            >
                {/* 2. The Toggle Track (Inner recessed pill) */}
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`
                        relative w-[60px] h-[28px] rounded-full overflow-hidden
                        transition-colors duration-500 cursor-pointer outline-none
                        ${isDark ? 'bg-[#1A2C44]' : 'bg-[#96CBF4]'}
                        shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.2)]
                    `}
                    aria-label="Toggle Dark Mode"
                >
                    {/* 3. Track Texture (The subtle grid pattern seen in the video) */}
                    <div
                        className="absolute inset-0 opacity-20 mix-blend-overlay"
                        style={{
                            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                            backgroundSize: '4px 4px'
                        }}
                    />

                    {/* 4. The 3D Sphere (The "Blue Ball") */}
                    <motion.div
                        initial={false}
                        animate={{
                            x: isDark ? 2 : 34,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                        }}
                        className={`
                            absolute top-[2px] left-0
                            w-[24px] h-[24px] rounded-full
                            bg-[#4895EF]
                            shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]
                            flex items-center justify-center
                        `}
                    >
                        {/* 5. Sphere Hex/Dimple Texture (Essential for the "exact" look) */}
                        <div
                            className="absolute inset-0 rounded-full opacity-40 overflow-hidden"
                            style={{
                                backgroundImage: `
                                    radial-gradient(circle at center, transparent 1px, rgba(0,0,0,0.15) 1.5px),
                                    radial-gradient(circle at center, transparent 1px, rgba(255,255,255,0.1) 1.5px)
                                `,
                                backgroundPosition: '0 0, 2px 2px',
                                backgroundSize: '4px 4px'
                            }}
                        />

                        {/* 6. Dynamic Sphere Highlights */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none" />
                    </motion.div>
                </button>
            </div>
        </div>
    );
}
