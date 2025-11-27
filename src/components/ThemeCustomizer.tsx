"use client";

import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
    { name: 'Paper (Default)', primary: '24 85% 50%', background: '40 20% 98%', accent: '158 64% 52%' },
    { name: 'Rose', primary: '340 75% 55%', background: '340 20% 98%', accent: '200 64% 52%' },
    { name: 'Ocean', primary: '210 85% 50%', background: '210 20% 98%', accent: '34 64% 52%' },
    { name: 'Lavender', primary: '270 75% 55%', background: '270 20% 98%', accent: '150 64% 52%' },
];

export function ThemeCustomizer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTheme, setActiveTheme] = useState('Paper (Default)');

    const applyTheme = (theme: typeof themes[0]) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        // root.style.setProperty('--background', theme.background); // Optional: if we want to change bg too
        root.style.setProperty('--accent', theme.accent);
        setActiveTheme(theme.name);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-stone-200 dark:border-slate-700 w-64 mb-2"
                    >
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Select Theme</h3>
                        <div className="space-y-2">
                            {themes.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => applyTheme(theme)}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${activeTheme === theme.name
                                            ? 'bg-stone-100 dark:bg-slate-700 text-primary font-medium'
                                            : 'hover:bg-stone-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-stone-200"
                                            style={{ backgroundColor: `hsl(${theme.primary})` }}
                                        />
                                        {theme.name}
                                    </div>
                                    {activeTheme === theme.name && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-stone-200 dark:border-slate-700 hover:text-primary transition-colors"
                title="Customize Theme"
            >
                <Palette className="w-6 h-6" />
            </button>
        </div>
    );
}
