export function CardSkeleton() {
    return (
        <div className="glass-panel rounded-xl p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 skeleton-shimmer" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-white/10 rounded w-2/3 skeleton-shimmer" />
                    <div className="h-3 bg-white/5 rounded w-1/3 skeleton-shimmer" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-full skeleton-shimmer" />
                <div className="h-3 bg-white/5 rounded w-4/5 skeleton-shimmer" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="flex gap-4 px-4 py-3 border-b border-white/5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-3 bg-white/10 rounded flex-1 skeleton-shimmer" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 px-4 py-3">
                    {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-3 bg-white/5 rounded flex-1 skeleton-shimmer" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="glass-panel rounded-2xl p-6 space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-6 bg-white/10 rounded w-48 skeleton-shimmer" />
                <div className="h-8 bg-white/10 rounded w-24 skeleton-shimmer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl space-y-2">
                    <div className="h-3 bg-white/10 rounded w-20 skeleton-shimmer" />
                    <div className="h-6 bg-white/10 rounded w-28 skeleton-shimmer" />
                </div>
                <div className="p-4 bg-white/5 rounded-xl space-y-2">
                    <div className="h-3 bg-white/10 rounded w-20 skeleton-shimmer" />
                    <div className="h-6 bg-white/10 rounded w-28 skeleton-shimmer" />
                </div>
            </div>
            <div className="h-10 bg-white/10 rounded-lg w-full skeleton-shimmer" />
            <div className="space-y-3">
                <div className="h-3 bg-white/5 rounded w-full skeleton-shimmer" />
                <div className="h-3 bg-white/5 rounded w-3/4 skeleton-shimmer" />
            </div>
            <div className="h-12 bg-primary/20 rounded-xl w-full skeleton-shimmer" />
        </div>
    );
}

export function StatSkeleton() {
    return (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 animate-pulse space-y-2">
            <div className="h-3 bg-white/10 rounded w-20 skeleton-shimmer" />
            <div className="h-7 bg-white/10 rounded w-32 skeleton-shimmer" />
        </div>
    );
}
