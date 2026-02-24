import { PolicyDashboard } from "@/components/PolicyDashboard";

export default function ProfilePage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-neon-cyan/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-6xl w-full relative z-10 flex flex-col gap-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">User Profile</h1>
                        <p className="text-slate-400 max-w-2xl text-lg font-light">Manage your active parametric insurance policies and view past claims.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-panel px-6 py-4 rounded-xl flex flex-col gap-1 items-end">
                            <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Total Coverage</span>
                            <span className="text-2xl font-bold text-white">$50.00 <span className="text-sm text-slate-400">USDC</span></span>
                        </div>
                    </div>
                </div>

                {/* Dashboard component handles wallet connection internally and shows policies for the connected user */}
                <div className="w-full">
                    <PolicyDashboard />
                </div>
            </div>
        </div>
    );
}
