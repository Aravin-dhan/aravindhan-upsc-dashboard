"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard, SyllabusTopic, Bookmark } from '@/context/DashboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Flame, CheckCircle, Circle, Moon, Sun, Bookmark as BookmarkIcon, ArrowRight, Trash2, Edit2, X, ExternalLink } from 'lucide-react';
import { intervalToDuration } from 'date-fns';
import { RevisionQueue } from './RevisionQueue';

export const MissionControl = () => {
    const { tasks, addTask, toggleTask, deleteTask, syllabus, bookmarks, addBookmark, removeBookmark, updateBookmark } = useDashboard();
    const [newTask, setNewTask] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Bookmark Editing State
    const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
    const [editNote, setEditNote] = useState('');

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const examDate = new Date('2027-05-26T09:00:00'); // Assuming 9 AM start
            const now = new Date();

            if (now >= examDate) {
                setTimeLeft("It's Time!");
                return;
            }

            const duration = intervalToDuration({
                start: now,
                end: examDate
            });

            const { years, months, days, hours, minutes, seconds } = duration;
            const parts = [];
            if (years) parts.push(`${years}y`);
            if (months) parts.push(`${months}m`);
            if (days) parts.push(`${days}d`);
            if (hours) parts.push(`${hours}h`);
            if (minutes) parts.push(`${minutes}m`);
            if (seconds) parts.push(`${seconds}s`);

            setTimeLeft(parts.join(' '));
        };

        const timer = setInterval(calculateTimeLeft, 1000);
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

    const handleEditBookmark = (bookmark: Bookmark) => {
        setEditingBookmark(bookmark);
        setEditNote(bookmark.note || '');
    };

    const saveBookmarkNote = () => {
        if (editingBookmark) {
            updateBookmark(editingBookmark.id, { note: editNote });
            setEditingBookmark(null);
        }
    };

    // Add Bookmark State
    const [addBookmarkModal, setAddBookmarkModal] = useState({
        isOpen: false,
        url: '',
        title: ''
    });

    const handleAddBookmarkSubmit = () => {
        if (addBookmarkModal.url) {
            addBookmark({
                title: addBookmarkModal.title || addBookmarkModal.url,
                link: addBookmarkModal.url,
                source: 'Manual',
                note: ''
            });
            setAddBookmarkModal({ isOpen: false, url: '', title: '' });
        }
    };

    return (
        <div className="h-full flex flex-col gap-4 p-4 overflow-hidden">
            {/* Header & Countdown */}
            <div className="shrink-0 relative overflow-hidden rounded-xl bg-stone-100 dark:bg-slate-800/50 p-4">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Rocket className="w-24 h-24 text-primary dark:text-amber-500" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-primary dark:text-amber-500 mb-1">Aravindhan B</h1>
                        <p className="text-xs text-stone-600 dark:text-slate-400">Target: UPSC CSE 2027</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <div className="text-[10px] text-stone-500 dark:text-slate-500 font-medium uppercase tracking-wider">Time Remaining</div>
                            <div className="text-xl font-mono font-bold text-stone-800 dark:text-slate-200 tracking-tight tabular-nums">{timeLeft}</div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className="p-1.5 rounded-full bg-white dark:bg-slate-700 text-stone-600 dark:text-amber-400 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Daily Briefing Links - Horizontal Scroll if needed */}
            <div className="shrink-0 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <a
                    href="https://www.thehindu.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-40 p-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-slate-700 flex items-center gap-2 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-stone-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                        <span className="font-serif font-bold text-sm">H</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm text-stone-800 dark:text-slate-200 truncate">The Hindu</h3>
                        <p className="text-[10px] text-stone-500 dark:text-slate-500 truncate">Daily News</p>
                    </div>
                </a>

                <a
                    href="https://www.drishtiias.com/current-affairs-news-analysis-editorials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-40 p-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-slate-700 flex items-center gap-2 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-stone-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                        <span className="font-serif font-bold text-sm">D</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm text-stone-800 dark:text-slate-200 truncate">Drishti IAS</h3>
                        <p className="text-[10px] text-stone-500 dark:text-slate-500 truncate">Current Affairs</p>
                    </div>
                </a>

                <a
                    href={`https://www.drishtiias.com/current-affairs-news-analysis-editorials/news-analysis/${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-40 p-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-slate-700 flex items-center gap-2 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-stone-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                        <span className="font-serif font-bold text-sm">{new Date().getDate()}</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm text-stone-800 dark:text-slate-200 truncate">Analysis</h3>
                        <p className="text-[10px] text-stone-500 dark:text-slate-500 truncate">{new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </a>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                {/* Daily Focus - Scrollable */}
                <div className="flex flex-col min-h-0 bg-stone-50 dark:bg-slate-800/30 rounded-xl p-3 border border-stone-100 dark:border-slate-700/50">
                    <div className="shrink-0 flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-primary dark:text-amber-500" />
                        <h2 className="text-sm font-bold text-stone-800 dark:text-slate-200">Daily Focus</h2>
                    </div>

                    <form onSubmit={handleAddTask} className="shrink-0 mb-3">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a critical task..."
                            className="w-full p-2 text-sm rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </form>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                        {tasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg group hover:shadow-sm transition-all border border-stone-100 dark:border-slate-700"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <button onClick={() => toggleTask(task.id)} className="shrink-0 text-stone-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors">
                                        {task.completed ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> : <Circle className="w-4 h-4" />}
                                    </button>
                                    <span className={`text-sm truncate ${task.completed ? 'line-through text-stone-400 dark:text-slate-600' : 'text-stone-700 dark:text-slate-300'}`}>
                                        {task.text}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="shrink-0 text-stone-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-stone-400 dark:text-slate-600 text-xs italic">
                                No tasks for today. Stay focused!
                            </div>
                        )}
                    </div>
                </div>

                {/* Revision Queue - Scrollable */}
                <div className="flex flex-col min-h-0 bg-stone-50 dark:bg-slate-800/30 rounded-xl p-3 border border-stone-100 dark:border-slate-700/50">
                    <RevisionQueue />
                </div>
            </div>

            {/* Bookmarks Section - Scrollable */}
            <div className="flex-1 min-h-0 flex flex-col bg-stone-50 dark:bg-slate-800/30 rounded-xl p-3 border border-stone-100 dark:border-slate-700/50 overflow-hidden">
                <div className="shrink-0 flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        <h2 className="text-sm font-bold text-stone-800 dark:text-slate-200">Bookmarked Items</h2>
                    </div>
                    <button
                        onClick={() => setAddBookmarkModal({ isOpen: true, url: '', title: '' })}
                        className="text-[10px] font-medium px-2 py-1 bg-primary/10 text-primary dark:text-amber-400 rounded hover:bg-primary/20 transition-colors"
                    >
                        + Add Link
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {bookmarks.map(bookmark => (
                                <div key={bookmark.id} className="p-2 bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-lg flex flex-col gap-1 group hover:shadow-sm transition-all">
                                    <div className="flex items-start justify-between gap-2">
                                        <a
                                            href={bookmark.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-stone-700 dark:text-slate-300 hover:text-primary dark:hover:text-amber-400 line-clamp-1"
                                        >
                                            {bookmark.title}
                                        </a>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditBookmark(bookmark)}
                                                className="p-0.5 text-stone-400 hover:text-primary dark:text-slate-500 dark:hover:text-amber-400"
                                                title="Add Note"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => removeBookmark(bookmark.id)}
                                                className="p-0.5 text-stone-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    {bookmark.note && (
                                        <div className="text-[10px] text-stone-500 dark:text-slate-400 bg-stone-50 dark:bg-slate-700/50 p-1.5 rounded line-clamp-2">
                                            {bookmark.note}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-1">
                                        <span className="text-[9px] text-stone-400 dark:text-slate-500">
                                            {new Date(bookmark.date).toLocaleDateString()}
                                        </span>
                                        {bookmark.source && (
                                            <span className="text-[9px] px-1 py-0.5 bg-stone-100 dark:bg-slate-700 rounded text-stone-500 dark:text-slate-400">
                                                {bookmark.source}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-stone-400 dark:text-slate-600 text-xs italic">
                            No bookmarks yet. Add important links here!
                        </div>
                    )}
                </div>
            </div>

            {/* Add Bookmark Modal */}
            <AnimatePresence>
                {addBookmarkModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 border-b border-stone-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                                <h3 className="font-bold text-stone-800 dark:text-slate-200">Add New Bookmark</h3>
                                <button
                                    onClick={() => setAddBookmarkModal({ ...addBookmarkModal, isOpen: false })}
                                    className="text-stone-400 hover:text-stone-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-slate-400 mb-1">
                                            URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={addBookmarkModal.url}
                                            onChange={(e) => setAddBookmarkModal({ ...addBookmarkModal, url: e.target.value })}
                                            placeholder="https://example.com"
                                            className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-slate-400 mb-1">
                                            Title (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={addBookmarkModal.title}
                                            onChange={(e) => setAddBookmarkModal({ ...addBookmarkModal, title: e.target.value })}
                                            placeholder="My Useful Resource"
                                            className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-stone-200 dark:border-slate-700 flex justify-end gap-3 shrink-0 bg-stone-50 dark:bg-slate-800/50">
                                <button
                                    onClick={() => setAddBookmarkModal({ ...addBookmarkModal, isOpen: false })}
                                    className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddBookmarkSubmit}
                                    disabled={!addBookmarkModal.url}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                                >
                                    Add Link
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Note Modal */}
            <AnimatePresence>
                {editingBookmark && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 border-b border-stone-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                                <h3 className="font-bold text-stone-800 dark:text-slate-200">Edit Note</h3>
                                <button
                                    onClick={() => setEditingBookmark(null)}
                                    className="text-stone-400 hover:text-stone-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-stone-500 dark:text-slate-500 uppercase tracking-wider mb-1">
                                        Bookmark
                                    </label>
                                    <p className="text-sm font-medium text-stone-800 dark:text-slate-200 line-clamp-1 break-all">
                                        {editingBookmark.title}
                                    </p>
                                    <a href={editingBookmark.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline line-clamp-1 break-all">
                                        {editingBookmark.link}
                                    </a>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-slate-400 mb-2">
                                        Note
                                    </label>
                                    <textarea
                                        value={editNote}
                                        onChange={(e) => setEditNote(e.target.value)}
                                        placeholder="Add your thoughts or summary here..."
                                        className="w-full h-32 p-3 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-stone-200 dark:border-slate-700 flex justify-end gap-3 shrink-0 bg-stone-50 dark:bg-slate-800/50">
                                <button
                                    onClick={() => setEditingBookmark(null)}
                                    className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveBookmarkNote}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
                                >
                                    Save Note
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
