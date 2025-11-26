"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Clock } from 'lucide-react';
import { useDashboard, SyllabusTopic } from '@/context/DashboardContext';

export function RevisionQueue() {
    const { revisions, syllabus, completeRevision } = useDashboard();
    const today = new Date().toISOString().split('T')[0];

    // Get pending revisions due today or earlier
    const dueRevisions = revisions.filter(
        (r) => r.status === 'Pending' && r.date <= today
    ).sort((a, b) => a.date.localeCompare(b.date));

    // Helper to find topic title
    const getTopicTitle = (topicId: string): string => {
        let title = 'Unknown Topic';
        const findRecursive = (topics: SyllabusTopic[]) => {
            for (const t of topics) {
                if (t.id === topicId) {
                    title = t.title;
                    return;
                }
                if (t.subtopics) findRecursive(t.subtopics);
            }
        };
        findRecursive(syllabus);
        return title;
    };

    if (dueRevisions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="paper-panel p-6 rounded-xl flex flex-col items-center justify-center text-center h-full min-h-[200px]"
            >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-800">All Caught Up!</h3>
                <p className="text-sm text-slate-500 mt-1">No revisions due today. Great job!</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="paper-panel p-6 rounded-xl flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Clock className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-serif font-bold text-primary">Revision Queue</h2>
                <span className="ml-auto bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                    {dueRevisions.length} Due
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {dueRevisions.map((rev) => (
                        <motion.div
                            key={rev.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="group flex items-center gap-3 p-3 rounded-lg bg-white border border-stone-200 hover:border-amber-500/30 hover:shadow-sm transition-all"
                        >
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-slate-800 group-hover:text-amber-900 transition-colors">
                                    {getTopicTitle(rev.topicId)}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${rev.date < today
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {rev.date < today ? 'Overdue' : 'Today'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => completeRevision(rev.id)}
                                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                title="Mark Revised"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
