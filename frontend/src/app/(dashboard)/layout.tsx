"use client";

import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 w-full bg-background relative pt-16">
                <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
}
