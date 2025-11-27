"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Newspaper, Bookmark, ChevronRight, ExternalLink, ArrowLeft, BookOpen, Loader2, Copy, Check, AlignLeft, AlignJustify, Type, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    imageUrl?: string;
    category?: string;
}

export default function NewsPage() {
    const { addBookmark, removeBookmark, bookmarks } = useDashboard();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
    const [readerContent, setReaderContent] = useState<string | null>(null);
    const [readerLoading, setReaderLoading] = useState(false);
    const [activeSource, setActiveSource] = useState<string>('All');
    const [copied, setCopied] = useState(false);

    // Reader Preferences
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [readerSettings, setReaderSettings] = useState({
        font: 'serif', // serif, sans, mono
        size: 'medium', // small, medium, large, xl
        theme: 'light', // light, sepia, dark
        width: 'medium', // narrow, medium, wide
        lineHeight: 'normal', // compact, normal, loose
        align: 'left' // left, justify
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('readerSettings');
        if (savedSettings) {
            try {
                setReaderSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse saved reader settings", e);
            }
        }
    }, []);

    // Save settings to localStorage on change
    useEffect(() => {
        localStorage.setItem('readerSettings', JSON.stringify(readerSettings));
    }, [readerSettings]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        // Only set full loading on initial fetch, not refresh
        if (news.length === 0) setLoading(true);
        try {
            const res = await fetch('/api/rss');
            if (res.ok) {
                const data = await res.json();
                setNews(data.items);
            }
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNews();
    };

    const handleArticleClick = async (article: NewsItem) => {
        setSelectedArticle(article);
        setReaderLoading(true);
        setReaderContent(null);

        try {
            const res = await fetch(`/api/read?url=${encodeURIComponent(article.link)}`);
            if (res.ok) {
                const data = await res.json();
                const content = data.content || (data.textContent ? `<p>${data.textContent}</p>` : null);

                if (content) {
                    setReaderContent(content);
                } else {
                    setReaderContent('<p>Could not extract content from this article. Please view the original.</p>');
                }
            } else {
                throw new Error('Failed to fetch');
            }
            setReaderLoading(false);

        } catch (e) {
            console.error("Reader mode error:", e);
            setReaderContent(`
                <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 text-center">
                    <p class="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load Reader View</p>
                    <p class="text-sm text-stone-500 dark:text-slate-400">The article might be behind a paywall or inaccessible.</p>
                </div>
            `);
            setReaderLoading(false);
        }
    };

    const isBookmarked = (link: string) => bookmarks.some(b => b.link === link);

    const toggleBookmark = (article: NewsItem) => {
        if (isBookmarked(article.link)) {
            const bookmark = bookmarks.find(b => b.link === article.link);
            if (bookmark) removeBookmark(bookmark.id);
        } else {
            addBookmark({
                title: article.title,
                link: article.link,
                source: article.source,
                note: ''
            });
        }
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredNews = activeSource === 'All'
        ? news
        : news.filter(item => item.source === activeSource);

    const sources = ['All', ...Array.from(new Set(news.map(item => item.source)))];

    // Helper classes for reader settings
    const getFontClass = () => {
        switch (readerSettings.font) {
            case 'sans': return 'font-sans';
            case 'mono': return 'font-mono';
            default: return 'font-serif';
        }
    };

    const getSizeClass = () => {
        switch (readerSettings.size) {
            case 'small': return 'prose-sm';
            case 'large': return 'prose-lg';
            case 'xl': return 'prose-xl';
            default: return 'prose-base';
        }
    };

    const getThemeClass = () => {
        switch (readerSettings.theme) {
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
            case 'dark': return 'bg-slate-900 text-slate-300';
            default: return 'bg-white text-stone-900';
        }
    };

    const getWidthClass = () => {
        switch (readerSettings.width) {
            case 'narrow': return 'max-w-xl';
            case 'wide': return 'max-w-4xl';
            default: return 'max-w-2xl';
        }
    };

    const getLineHeightClass = () => {
        switch (readerSettings.lineHeight) {
            case 'compact': return 'leading-tight';
            case 'loose': return 'leading-loose';
            default: return 'leading-normal';
        }
    };

    const getAlignClass = () => {
        return readerSettings.align === 'justify' ? 'text-justify' : 'text-left';
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 -m-4 p-4">
            <style jsx global>{`
                .prose figcaption {
                    font-family: var(--font-sans);
                    font-style: italic;
                    color: ${readerSettings.theme === 'dark' ? '#94a3b8' : '#78716c'};
                    font-size: 0.875em;
                    text-align: center;
                    margin-top: 0.5em;
                }
                .prose img {
                    border-radius: 0.5rem;
                    margin-left: auto;
                    margin-right: auto;
                }
            `}</style>
            <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] flex gap-6">

                {/* Sidebar / Feed List */}
                <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm overflow-hidden ${selectedArticle ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-stone-200 dark:border-slate-800 flex justify-between items-center">
                        <h1 className="text-xl font-serif font-bold text-stone-800 dark:text-slate-100 flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-primary" />
                            News Hub
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className={`p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all ${refreshing ? 'animate-spin text-primary' : ''}`}
                                title="Refresh Feeds"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <select
                                value={activeSource}
                                onChange={(e) => setActiveSource(e.target.value)}
                                className="text-sm bg-stone-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary"
                            >
                                {sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            filteredNews.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleArticleClick(item)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedArticle?.link === item.link
                                        ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/20'
                                        : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-primary dark:text-amber-500 bg-primary/10 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                    {item.source}
                                                </span>
                                                {item.category && (
                                                    <span className="text-[10px] uppercase tracking-wider font-medium text-stone-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                        {item.category}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-stone-400 dark:text-slate-500 whitespace-nowrap ml-auto">
                                                    {new Date(item.pubDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className={`font-bold mb-2 line-clamp-2 ${selectedArticle?.link === item.link ? 'text-primary dark:text-amber-500' : 'text-stone-800 dark:text-slate-200'
                                                }`}>
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-stone-500 dark:text-slate-400 line-clamp-2 mb-3">
                                                {item.contentSnippet?.replace(/<[^>]*>/g, '')}
                                            </p>
                                        </div>
                                        {item.imageUrl && (
                                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-slate-800">
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBookmark(item); }}
                                            className={`p-1.5 rounded-full transition-colors ${isBookmarked(item.link)
                                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                                : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isBookmarked(item.link) ? 'fill-current' : ''}`} />
                                        </button>
                                        <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Read <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reader View */}
                <AnimatePresence mode="wait">
                    {selectedArticle ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex-[2] rounded-2xl border border-stone-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col relative z-20 transition-colors duration-300 ${getThemeClass()}`}
                        >
                            {/* Reader Toolbar */}
                            <div className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm ${readerSettings.theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-stone-200 bg-white/90'}`}>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedArticle(null)}
                                        className="lg:hidden p-2 -ml-2 opacity-70 hover:opacity-100"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    {/* Text Settings Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setSettingsOpen(!settingsOpen)}
                                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                            title="Text Options"
                                        >
                                            <Type className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {settingsOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-stone-200 dark:border-slate-700 p-4 z-50 text-stone-800 dark:text-slate-200"
                                                >
                                                    {/* Font Selection */}
                                                    <div className="mb-4">
                                                        <label className="text-xs font-medium text-stone-500 dark:text-slate-400 mb-2 block">FONT</label>
                                                        <div className="flex bg-stone-100 dark:bg-slate-700 rounded-lg p-1">
                                                            {['sans', 'serif', 'mono'].map(font => (
                                                                <button
                                                                    key={font}
                                                                    onClick={() => setReaderSettings(prev => ({ ...prev, font }))}
                                                                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${readerSettings.font === font
                                                                        ? 'bg-white dark:bg-slate-600 shadow-sm font-bold'
                                                                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    {font === 'sans' ? 'Ag' : font === 'serif' ? 'Ag' : 'Ag'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Size Selection */}
                                                    <div className="mb-4">
                                                        <label className="text-xs font-medium text-stone-500 dark:text-slate-400 mb-2 block">SIZE</label>
                                                        <div className="flex items-center justify-between bg-stone-100 dark:bg-slate-700 rounded-lg p-2">
                                                            <button onClick={() => setReaderSettings(prev => ({ ...prev, size: 'small' }))} className="text-xs p-1 hover:bg-black/5 rounded">A</button>
                                                            <button onClick={() => setReaderSettings(prev => ({ ...prev, size: 'medium' }))} className="text-sm p-1 hover:bg-black/5 rounded font-medium">A</button>
                                                            <button onClick={() => setReaderSettings(prev => ({ ...prev, size: 'large' }))} className="text-lg p-1 hover:bg-black/5 rounded font-bold">A</button>
                                                            <button onClick={() => setReaderSettings(prev => ({ ...prev, size: 'xl' }))} className="text-xl p-1 hover:bg-black/5 rounded font-extrabold">A</button>
                                                        </div>
                                                    </div>

                                                    {/* Theme Selection */}
                                                    <div className="mb-4">
                                                        <label className="text-xs font-medium text-stone-500 dark:text-slate-400 mb-2 block">THEME</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setReaderSettings(prev => ({ ...prev, theme: 'light' }))}
                                                                className={`w-8 h-8 rounded-full bg-white border border-stone-300 ${readerSettings.theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                                                            />
                                                            <button
                                                                onClick={() => setReaderSettings(prev => ({ ...prev, theme: 'sepia' }))}
                                                                className={`w-8 h-8 rounded-full bg-[#f4ecd8] border border-[#e0d6b8] ${readerSettings.theme === 'sepia' ? 'ring-2 ring-primary' : ''}`}
                                                            />
                                                            <button
                                                                onClick={() => setReaderSettings(prev => ({ ...prev, theme: 'dark' }))}
                                                                className={`w-8 h-8 rounded-full bg-slate-900 border border-slate-700 ${readerSettings.theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Width Selection */}
                                                    <div className="mb-4">
                                                        <label className="text-xs font-medium text-stone-500 dark:text-slate-400 mb-2 block">WIDTH</label>
                                                        <div className="flex bg-stone-100 dark:bg-slate-700 rounded-lg p-1">
                                                            {['narrow', 'medium', 'wide'].map(width => (
                                                                <button
                                                                    key={width}
                                                                    onClick={() => setReaderSettings(prev => ({ ...prev, width }))}
                                                                    className={`flex-1 py-1.5 text-[10px] uppercase font-medium rounded-md transition-all ${readerSettings.width === width
                                                                        ? 'bg-white dark:bg-slate-600 shadow-sm'
                                                                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    {width}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Line Height & Alignment */}
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-xs font-medium text-stone-500 dark:text-slate-400 mb-2 block">SPACING</label>
                                                            <div className="flex bg-stone-100 dark:bg-slate-700 rounded-lg p-1">
                                                                {['compact', 'normal', 'loose'].map(lh => (
                                                                    <button
                                                                        key={lh}
                                                                        onClick={() => setReaderSettings(prev => ({ ...prev, lineHeight: lh }))}
                                                                        className={`flex-1 py-1.5 flex justify-center rounded-md transition-all ${readerSettings.lineHeight === lh
                                                                            ? 'bg-white dark:bg-slate-600 shadow-sm'
                                                                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                                                                            }`}
                                                                        title={lh}
                                                                    >
                                                                        <div className={`w-4 h-3 border-t border-b border-current ${lh === 'compact' ? 'h-2' : lh === 'loose' ? 'h-4' : 'h-3'}`}></div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs font-medium text-stone-500 dark:text-slate-400 mb-2 block">ALIGN</label>
                                                            <div className="flex bg-stone-100 dark:bg-slate-700 rounded-lg p-1">
                                                                <button
                                                                    onClick={() => setReaderSettings(prev => ({ ...prev, align: 'left' }))}
                                                                    className={`flex-1 py-1.5 flex justify-center rounded-md transition-all ${readerSettings.align === 'left'
                                                                        ? 'bg-white dark:bg-slate-600 shadow-sm'
                                                                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    <AlignLeft className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setReaderSettings(prev => ({ ...prev, align: 'justify' }))}
                                                                    className={`flex-1 py-1.5 flex justify-center rounded-md transition-all ${readerSettings.align === 'justify'
                                                                        ? 'bg-white dark:bg-slate-600 shadow-sm'
                                                                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    <AlignJustify className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={() => copyLink(selectedArticle.link)}
                                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-stone-500 dark:text-slate-400"
                                        title="Copy Link"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => toggleBookmark(selectedArticle)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isBookmarked(selectedArticle.link)
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        <Bookmark className={`w-4 h-4 ${isBookmarked(selectedArticle.link) ? 'fill-current' : ''}`} />
                                        {isBookmarked(selectedArticle.link) ? 'Saved' : 'Save'}
                                    </button>
                                    <a
                                        href={selectedArticle.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Original
                                    </a>
                                </div>
                            </div>

                            {/* Reader Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12" onClick={() => setSettingsOpen(false)}>
                                <div className={`mx-auto transition-all duration-300 ${getWidthClass()}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-sm font-bold text-primary dark:text-amber-500 uppercase tracking-wider">
                                            {selectedArticle.source}
                                        </span>
                                        {selectedArticle.category && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-current opacity-60">
                                                {selectedArticle.category}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className={`font-bold mb-4 leading-tight ${readerSettings.font === 'serif' ? 'font-serif' : readerSettings.font === 'mono' ? 'font-mono' : 'font-sans'} ${readerSettings.size === 'xl' ? 'text-5xl' : readerSettings.size === 'large' ? 'text-4xl' : 'text-3xl'}`}>
                                        {selectedArticle.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm opacity-60 mb-8 pb-8 border-b border-current">
                                        <span>{new Date(selectedArticle.pubDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>Reader Mode</span>
                                    </div>

                                    {readerLoading ? (
                                        <div className="space-y-4 animate-pulse opacity-50">
                                            <div className="h-4 bg-current rounded w-full opacity-20"></div>
                                            <div className="h-4 bg-current rounded w-5/6 opacity-20"></div>
                                            <div className="h-4 bg-current rounded w-4/6 opacity-20"></div>
                                            <div className="h-32 bg-current rounded w-full my-8 opacity-10"></div>
                                            <div className="h-4 bg-current rounded w-full opacity-20"></div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`prose dark:prose-invert max-w-none ${getFontClass()} ${getSizeClass()} ${getLineHeightClass()} ${getAlignClass()} ${readerSettings.theme === 'sepia' ? 'prose-stone' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: readerContent || '' }}
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="hidden lg:flex flex-[2] bg-stone-100 dark:bg-slate-900/50 rounded-2xl border border-stone-200 dark:border-slate-800 items-center justify-center text-stone-400 dark:text-slate-600 flex-col gap-4">
                            <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-slate-800 flex items-center justify-center">
                                <BookOpen className="w-10 h-10 opacity-50" />
                            </div>
                            <p className="font-medium">Select an article to read</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
