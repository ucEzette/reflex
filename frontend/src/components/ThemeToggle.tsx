"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[120px] h-[52px] rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />;
    }

    const isDark = resolvedTheme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-[120px] h-[52px] rounded-full flex items-center p-1 overflow-hidden transition-colors duration-500 ease-in-out
                ${isDark ? "bg-[#1A1B26]" : "bg-[#87CEEB]"}
            `}
            style={{
                boxShadow: isDark
                    ? "inset 6px 6px 12px #0a0b0f, inset -6px -6px 12px #2a2b3d"
                    : "inset 6px 6px 12px #6da6be, inset -6px -6px 12px #a1f6ff",
            }}
            aria-label="Toggle Dark Mode"
        >
            {/* Hexagonal Texture Overlay */}
            <div
                className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='34.64101615137754' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L20 5.773502691896257L20 17.32050807568877L10 23.09401076758503L0 17.32050807568877L0 5.773502691896257Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Cpath d='M10 34.64101615137754L20 28.867513459481283L20 17.32050807568877L10 11.547005383792514L0 17.32050807568877L0 28.867513459481283Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '20px 34.64px',
                }}
            />

            {/* Track Background Icons */}
            <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
                <Moon className={`w-5 h-5 transition-opacity duration-300 ${isDark ? 'opacity-100 text-yellow-300' : 'opacity-0'}`} />
                <Sun className={`w-6 h-6 transition-opacity duration-300 ${!isDark ? 'opacity-100 text-yellow-100' : 'opacity-0'}`} />
            </div>

            {/* The Animated Sphere */}
            <motion.div
                animate={{
                    x: isDark ? 0 : 66,
                    rotate: isDark ? 0 : 360
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8
                }}
                className={`
                    relative w-[44px] h-[44px] rounded-full flex items-center justify-center z-10
                    ${isDark ? "bg-[#2A2B3D]" : "bg-gradient-to-br from-yellow-100 to-yellow-300"}
                `}
                style={{
                    boxShadow: isDark
                        ? "4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.05), inset 2px 2px 4px rgba(255,255,255,0.1)"
                        : "4px 4px 10px rgba(0,0,0,0.2), -2px -2px 6px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.1)",
                }}
            >
                {/* Sphere Texture Details */}
                {isDark ? (
                    <div className="absolute inset-0 rounded-full opacity-30" style={{
                        backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)"
                    }}>
                        <div className="w-2 h-2 rounded-full bg-black/20 absolute top-2 right-3 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20 absolute bottom-3 left-2 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-black/20 absolute bottom-2 right-2 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                ) : (
                    <div className="absolute inset-0 rounded-full opacity-50" style={{
                        backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 60%)"
                    }} />
                )}
            </motion.div>
        </button>
    );
}
