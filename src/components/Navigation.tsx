"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, BookOpen, Settings, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navigation = () => {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/news', label: 'News Hub', icon: Newspaper },
        { href: '/notebooks', label: 'Notebooks', icon: BookOpen },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-stone-200 dark:border-slate-800 mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-serif font-bold">
                            A
                        </div>
                        <span className="font-serif font-bold text-lg text-stone-800 dark:text-slate-200 hidden md:block">
                            UPSC Dashboard
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {links.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`relative px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${isActive
                                            ? 'text-primary dark:text-amber-500 bg-primary/5 dark:bg-amber-500/10'
                                            : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium hidden md:block">{label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-amber-500 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 dark:text-slate-400 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
