"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard, SyllabusTopic } from '@/context/DashboardContext';
import { motion } from 'framer-motion';
import { Rocket, Target, Flame, CheckCircle, Circle, Moon, Sun, Bookmark, ArrowRight } from 'lucide-react';
import { RevisionQueue } from './RevisionQueue';

export const MissionControl = () => {
    const { tasks, addTask, toggleTask, deleteTask, syllabus, bookmarks } = useDashboard();
    const [newTask, setNewTask] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check initial dark mode preference
        if (document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const examDate = new Date('2027-05-26');
            const now = new Date();
            const difference = examDate.getTime() - now.getTime();

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        };

        const timer = setInterval(calculateTimeLeft, 60000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, []);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            addTask(newTask);
            setNewTask('');
        }
    };

    // Helper to find bookmarked topics
    const getBookmarkedTopics = (): SyllabusTopic[] => {
        const found: SyllabusTopic[] = [];
        const traverse = (topics: SyllabusTopic[]) => {
            topics.forEach(topic => {
                if (bookmarks.includes(topic.id)) {
                    found.push(topic);
                }
                if (topic.subtopics) {
                    traverse(topic.subtopics);
                }
            });
        };
        traverse(syllabus);
        return found;
    };

    const bookmarkedTopics = getBookmarkedTopics();

    return (
        <div className="space-y-6">
            {/* Header & Countdown */}
            <div className="paper-panel p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Rocket className="w-32 h-32 text-primary dark:text-amber-500" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-primary dark:text-amber-500 mb-2">Aravindhan B</h1>
                        <p className="text-stone-600 dark:text-slate-400">Target: UPSC CSE 2027</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <div className="text-sm text-stone-500 dark:text-slate-500 font-medium uppercase tracking-wider">Time Remaining</div>
                            <div className="text-4xl font-mono font-bold text-stone-800 dark:text-slate-200 tracking-tight">{timeLeft}</div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-amber-400 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Daily Briefing Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                    href="https://www.thehindu.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-panel p-4 rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="font-serif font-bold text-lg">H</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-800 dark:text-slate-200">The Hindu</h3>
                        <p className="text-xs text-stone-500 dark:text-slate-500">Daily News</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-stone-400 group-hover:text-primary dark:text-slate-500 dark:group-hover:text-amber-400" />
                </a>

                <a
                    href="https://www.drishtiias.com/current-affairs-news-analysis-editorials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-panel p-4 rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="font-serif font-bold text-lg">D</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-800 dark:text-slate-200">Drishti IAS</h3>
                        <p className="text-xs text-stone-500 dark:text-slate-500">Current Affairs</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-stone-400 group-hover:text-primary dark:text-slate-500 dark:group-hover:text-amber-400" />
                </a>

                <a
                    href={`https://www.drishtiias.com/current-affairs-news-analysis-editorials/news-analysis/${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-panel p-4 rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="font-serif font-bold text-lg">{new Date().getDate()}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-800 dark:text-slate-200">Today's Analysis</h3>
                        <p className="text-xs text-stone-500 dark:text-slate-500">{new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-stone-400 group-hover:text-primary dark:text-slate-500 dark:group-hover:text-amber-400" />
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Focus */}
                <div className="paper-panel p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary dark:text-amber-500" />
                        <h2 className="text-lg font-bold text-stone-800 dark:text-slate-200">Daily Focus</h2>
                    </div>

                    <form onSubmit={handleAddTask} className="mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a critical task..."
                            className="w-full p-2 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </form>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {tasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-3 bg-stone-50 dark:bg-slate-800/50 rounded-lg group hover:shadow-sm transition-all border border-transparent hover:border-stone-100 dark:hover:border-slate-700"
                            >
                                <div className="flex items-center gap-3">
                                    <button onClick={() => toggleTask(task.id)} className="text-stone-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors">
                                        {task.completed ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <span className={`${task.completed ? 'line-through text-stone-400 dark:text-slate-600' : 'text-stone-700 dark:text-slate-300'}`}>
                                        {task.text}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-stone-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm"
                                >
                                    Delete
                                </button>
                            </motion.div>
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-stone-400 dark:text-slate-600 text-sm italic">
                                No tasks for today. Stay focused!
                            </div>
                        )}
                    </div>
                </div>

                {/* Revision Queue */}
                <RevisionQueue />
            </div>

            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
                <div className="paper-panel p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <h2 className="text-lg font-bold text-stone-800 dark:text-slate-200">Bookmarked Topics</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookmarkedTopics.map(topic => (
                            <div key={topic.id} className="p-3 bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-slate-700 rounded-lg flex items-center justify-between group">
                                <span className="text-sm font-medium text-stone-700 dark:text-slate-300 truncate pr-2">{topic.title}</span>
                                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary dark:text-slate-500 dark:group-hover:text-amber-400 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
