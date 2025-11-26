"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Trash2, Check, Calendar } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function HabitForge() {
    const { habits, addHabit, deleteHabit, toggleHabit } = useDashboard();
    const [newHabitName, setNewHabitName] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            addHabit(newHabitName.trim());
            setNewHabitName('');
        }
    };

    // Calculate last 14 days for heatmap
    const getLast14Days = () => {
        const dates = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const getCompletionRate = (date: string) => {
        if (habits.length === 0) return 0;
        const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
        return Math.round((completedCount / habits.length) * 100);
    };

    return (
        <motion.div
            className="paper-panel p-6 rounded-xl flex flex-col h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-2">
                <Flame className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-serif font-bold text-primary">Habit Forge</h2>
            </div>

            <form onSubmit={handleAddHabit} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="New habit..."
                    className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 shadow-sm"
                />
                <button
                    type="submit"
                    disabled={!newHabitName.trim()}
                    className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {habits.map((habit) => (
                        <motion.div
                            key={habit.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="group flex items-center gap-3 p-3 rounded-lg bg-white border border-stone-200 hover:border-primary/30 hover:shadow-sm transition-all"
                        >
                            <button
                                onClick={() => toggleHabit(habit.id, today)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${habit.completedDates.includes(today)
                                        ? 'bg-accent border-accent text-white'
                                        : 'border-slate-400 hover:border-accent text-transparent'
                                    }`}
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                            <span
                                className={`flex-1 text-sm transition-colors font-medium ${habit.completedDates.includes(today) ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-700'
                                    }`}
                            >
                                {habit.name}
                            </span>
                            <button
                                onClick={() => deleteHabit(habit.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Consistency Heatmap */}
            <div className="mt-auto">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Consistency (Last 14 Days)
                </h4>
                <div className="flex gap-1 justify-between">
                    {getLast14Days().map((date) => {
                        const completionRate = getCompletionRate(date);
                        return (
                            <div key={date} className="flex flex-col items-center gap-1 flex-1">
                                <div
                                    className={`w-full aspect-[4/5] rounded-sm transition-all duration-300 ${completionRate === 100 ? 'bg-emerald-600' :
                                            completionRate >= 50 ? 'bg-emerald-400' :
                                                completionRate > 0 ? 'bg-emerald-200' :
                                                    'bg-stone-200'
                                        }`}
                                    title={`${date}: ${completionRate}%`}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {date.split('-')[2]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
