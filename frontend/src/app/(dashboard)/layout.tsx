import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="w-full relative pt-16">
            <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] px-4">
                {children}
            </div>
        </main>
    );
}
