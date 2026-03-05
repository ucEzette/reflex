"use client";

import React, { useEffect } from "react";

export function GlobalPointerCapture() {
    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            // Dispatch a custom event that the canvas can listen to securely
            const customEvent = new CustomEvent('globalPointerMove', {
                detail: { x: e.clientX, y: e.clientY }
            });
            window.dispatchEvent(customEvent);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true, capture: true });

        return () => {
            window.removeEventListener('pointermove', handlePointerMove, { capture: true });
        };
    }, []);

    return null;
}
