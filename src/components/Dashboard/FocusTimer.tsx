"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Timer, Coffee } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface FocusTimerProps {
    topicId?: string;
    topicTitle?: string;
    onClose: () => void;
}

export function FocusTimer({ topicId, topicTitle, onClose }: FocusTimerProps) {
    const { logFocusSession } = useDashboard();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [sessionDuration, setSessionDuration] = useState(25);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === 'focus' && topicId) {
                logFocusSession(topicId, sessionDuration);
                // Play sound or notification here
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, topicId, sessionDuration, logFocusSession]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
        setSessionDuration(mode === 'focus' ? 25 : 5);
    };

    const switchMode = (newMode: 'focus' | 'break') => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
        setSessionDuration(newMode === 'focus' ? 25 : 5);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-[#fdfbf7] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 text-center relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <Square className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">
                        {mode === 'focus' ? 'Deep Focus' : 'Take a Break'}
                    </h2>
                    {topicTitle && mode === 'focus' && (
                        <p className="text-sm text-primary font-medium bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-100">
                            Working on: {topicTitle}
                        </p>
                    )}
                </div>

                <div className="text-7xl font-mono font-bold text-slate-800 mb-8 tracking-wider">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={toggleTimer}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full bg-stone-100 text-slate-600 hover:bg-stone-200 flex items-center justify-center transition-all"
                    >
                        <Timer className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => switchMode('focus')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'focus'
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-500 hover:bg-stone-100'
                            }`}
                    >
                        Pomodoro (25m)
                    </button>
                    <button
                        onClick={() => switchMode('break')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'break'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-500 hover:bg-stone-100'
                            }`}
                    >
                        <Coffee className="w-4 h-4" />
                        Break (5m)
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
