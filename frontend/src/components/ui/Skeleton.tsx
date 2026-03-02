"use client";

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular' | 'card';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export function Skeleton({ className = '', variant = 'rectangular', width, height, count = 1 }: SkeletonProps) {
    const baseStyle: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '14px' : variant === 'circular' ? '40px' : '20px'),
        borderRadius: variant === 'circular' ? '50%' : variant === 'card' ? '12px' : '6px',
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`skeleton-shimmer ${className}`}
                    style={baseStyle}
                />
            ))}
        </>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={36} height={36} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height={10} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <Skeleton height={32} />
                <Skeleton height={32} />
                <Skeleton height={32} />
            </div>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                    <Skeleton variant="text" width="70%" height={10} />
                    <Skeleton variant="text" width="50%" height={24} />
                </div>
            ))}
        </div>
    );
}
