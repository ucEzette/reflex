import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* The main navbar is handled at the app/layout.tsx level, so this just wraps the dashboard grid spacing */}
            <main className="flex-1 w-full bg-background relative pt-24">
                {children}
            </main>
        </div>
    );
}
