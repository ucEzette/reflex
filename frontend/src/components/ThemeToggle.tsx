"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[3.5em] h-[2em] rounded-[30px] bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />;
    }

    const isLight = resolvedTheme === "light";

    return (
        <div className="flex items-center justify-center pointer-events-auto">
            <label className="theme-switch">
                <input 
                    type="checkbox" 
                    checked={isLight} 
                    onChange={() => setTheme(isLight ? "dark" : "light")} 
                />
                <span className="theme-slider"></span>
            </label>
        </div>
    );
}
