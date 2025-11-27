"use client";

import React, { useEffect, useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { ExternalLink, Bookmark, RefreshCw, Newspaper, Settings, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
}

interface FeedResult {
    id: string;
    source: string;
    items: NewsItem[];
    error?: boolean;
}

export default function NewsFeed() {
    const { bookmarks, addBookmark, removeBookmark } = useDashboard();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('All');
    const [isManageOpen, setIsManageOpen] = useState(false);

    // Default enabled sources (names)
    const [enabledSources, setEnabledSources] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rss');
            const data = await res.json();

            if (data.items && Array.isArray(data.items)) {
                setNewsItems(data.items);

                // Extract unique sources
                const uniqueSources = Array.from(new Set(data.items.map((item: NewsItem) => item.source))) as string[];

                // Initialize enabled sources if empty
                if (enabledSources.length === 0 && uniqueSources.length > 0) {
                    const saved = localStorage.getItem('rss_preferences_v2');
                    if (saved) {
                        setEnabledSources(JSON.parse(saved));
                    } else {
                        setEnabledSources(uniqueSources);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch news', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchNews();
    }, []);

    useEffect(() => {
        if (mounted && enabledSources.length > 0) {
            localStorage.setItem('rss_preferences_v2', JSON.stringify(enabledSources));
        }
    }, [enabledSources, mounted]);

    const toggleSource = (source: string) => {
        setEnabledSources(prev =>
            prev.includes(source)
                ? prev.filter(s => s !== source)
                : [...prev, source]
        );
    };

    // Filter items based on enabled sources
    const visibleItems = newsItems.filter(item => enabledSources.includes(item.source));

    // Filter by active tab (category/source)
    const displayedItems = activeTab === 'All'
        ? visibleItems
        : visibleItems.filter(item => item.source === activeTab);

    // Get all available sources from the fetched items
    const allSources = Array.from(new Set(newsItems.map(item => item.source)));

    if (!mounted) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-6 h-[600px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">Daily Briefing</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsManageOpen(true)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors text-stone-500 dark:text-slate-400"
                        title="Manage Feeds"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 text-stone-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Manage Feeds Modal Overlay */}
            <AnimatePresence>
                {isManageOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Manage Sources</h3>
                            <button
                                onClick={() => setIsManageOpen(false)}
                                className="p-1 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full"
                            >
                                <X className="w-5 h-5 text-stone-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {allSources.map(source => (
                                <div
                                    key={source}
                                    onClick={() => toggleSource(source)}
                                    className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-slate-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{source}</span>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${enabledSources.includes(source)
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-stone-300 dark:border-slate-600'
                                        }`}>
                                        {enabledSources.includes(source) && <Check className="w-3 h-3" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-slate-700">
                            <button
                                onClick={() => setIsManageOpen(false)}
                                className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                <button
                    onClick={() => setActiveTab('All')}
                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === 'All'
                        ? 'bg-primary text-white'
                        : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600'
                        }`}
                >
                    All
                </button>
                {enabledSources.map(source => (
                    <button
                        key={source}
                        onClick={() => setActiveTab(source)}
                        className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === source
                            ? 'bg-primary text-white'
                            : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {source}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {loading && newsItems.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-stone-100 dark:bg-slate-800 rounded w-full mb-1"></div>
                                <div className="h-3 bg-stone-100 dark:bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    displayedItems.map((item, index) => (
                        <motion.div
                            key={`${item.link}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group p-4 bg-stone-50 dark:bg-slate-700/30 rounded-xl border border-stone-100 dark:border-slate-700 hover:border-primary/30 transition-all"
                        >
                            <div className="flex justify-between items-start gap-3 mb-2">
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-2"
                                >
                                    {item.title}
                                </a>
                                <button
                                    onClick={() => {
                                        const existing = bookmarks.find(b => b.link === item.link);
                                        if (existing) {
                                            removeBookmark(existing.id);
                                        } else {
                                            addBookmark({
                                                title: item.title,
                                                link: item.link,
                                                source: item.source
                                            });
                                        }
                                    }}
                                    className={`shrink-0 p-1 rounded-full transition-colors ${bookmarks.some(b => b.link === item.link)
                                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                        : 'text-stone-400 hover:bg-stone-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${bookmarks.some(b => b.link === item.link) ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 mb-3">
                                {item.contentSnippet}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium px-2 py-0.5 bg-stone-200 dark:bg-slate-600 text-stone-600 dark:text-slate-300 rounded-full">
                                    {item.source}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                    {new Date(item.pubDate).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}

                {!loading && displayedItems.length === 0 && (
                    <div className="text-center py-10 text-stone-400 dark:text-slate-500">
                        <p>No news items found. Try enabling more feeds.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
