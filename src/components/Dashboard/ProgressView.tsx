"use client";

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useDashboard, SyllabusTopic } from '@/context/DashboardContext';

export default function ProgressView() {
    const { syllabus } = useDashboard();

    // Calculate progress for each main section
    const data = syllabus.map(section => {
        const calculateCompletion = (topics: SyllabusTopic[]): number => {
            if (!topics || topics.length === 0) return 0;
            let completedCount = 0;
            let totalCount = 0;

            const traverse = (items: SyllabusTopic[]) => {
                items.forEach(item => {
                    if (item.subtopics && item.subtopics.length > 0) {
                        traverse(item.subtopics);
                    } else {
                        totalCount++;
                        if (item.status === 'Mastered') completedCount += 1;
                        else if (item.status === 'Revised') completedCount += 0.75;
                        else if (item.status === 'Reading') completedCount += 0.25;
                    }
                });
            };

            traverse(section.subtopics || []);
            return totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        };

        return {
            name: section.title.split(' ')[0] + ' ' + section.title.split(' ')[2], // e.g., "GS I"
            progress: calculateCompletion([section]),
            fullTitle: section.title
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-stone-200 p-3 rounded-lg shadow-lg">
                    <p className="text-slate-800 font-serif font-bold mb-1">{payload[0].payload.fullTitle}</p>
                    <p className="text-primary text-sm">
                        Progress: <span className="font-bold">{payload[0].value}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            className="paper-panel p-6 rounded-xl flex flex-col h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-2">
                <PieChartIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-serif font-bold text-primary">Progress Analytics</h2>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontFamily: 'var(--font-serif)' }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={40}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.progress === 100 ? '#059669' : // Emerald 600
                                            entry.progress > 50 ? '#0ea5e9' :   // Sky 500
                                                '#cbd5e1'                           // Slate 300
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-stone-200">
                <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 font-serif">{syllabus.length}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Papers</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 font-serif">
                        {Math.round(data.reduce((acc, curr) => acc + curr.progress, 0) / data.length)}%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 font-serif">
                        {syllabus.reduce((acc, section) => acc + (section.subtopics?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Topics</div>
                </div>
            </div>
        </motion.div>
    );
}
