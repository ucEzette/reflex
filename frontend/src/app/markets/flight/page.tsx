import React from 'react';
import { VerletPlane } from '@/components/simulation/VerletPlane';
import { MarketInterface } from '@/components/simulation/MarketInterface';

export default function FlightMarketPage() {
    return (
        <main className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex flex-col pt-20">
            {/* The physics simulation background */}
            <VerletPlane src="/flysafair-physics-bg.png" cols={30} rows={20} stiffness={0.85} />

            {/* The interactive UI overlay */}
            <MarketInterface />
        </main>
    );
}
