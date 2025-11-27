import { Loader2, Newspaper } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 -m-4 p-4">
            <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] flex gap-6">

                {/* Sidebar Skeleton */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-stone-200 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-stone-300 dark:text-slate-700" />
                            <div className="h-6 w-24 bg-stone-100 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-3 rounded-xl border border-stone-100 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/50">
                                <div className="h-4 w-3/4 bg-stone-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                                <div className="h-3 w-1/2 bg-stone-100 dark:bg-slate-800 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reader Skeleton */}
                <div className="hidden lg:flex flex-[2] bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-stone-400 dark:text-slate-600 text-sm">Fetching latest news...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
