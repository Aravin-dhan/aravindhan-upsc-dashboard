"use client";

import React, { useState } from 'react';
import { useDashboard, SyllabusTopic } from '@/context/DashboardContext';
import { Book, FileText, Link as LinkIcon, Search, ChevronRight, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopicNotebook } from '@/components/Dashboard/TopicNotebook';

export default function NotebooksPage() {
    const { syllabus, resources } = useDashboard();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<{ id: string; title: string } | null>(null);

    // Helper to count resources for a topic
    const getResourceCount = (topicId: string) => {
        const notes = resources.filter(r => r.topicId === topicId && r.type === 'note').length;
        const links = resources.filter(r => r.topicId === topicId && r.type === 'link').length;
        return { notes, links };
    };

    // Flatten syllabus to get all topics with their parent paper
    const getAllTopics = () => {
        const topics: { id: string; title: string; paper: string; paperId: string }[] = [];

        syllabus.forEach(paper => {
            const traverse = (items: SyllabusTopic[]) => {
                items.forEach(item => {
                    if (!item.subtopics) {
                        topics.push({
                            id: item.id,
                            title: item.title,
                            paper: paper.title.split(':')[0], // e.g., "GS Paper I"
                            paperId: paper.id
                        });
                    } else {
                        traverse(item.subtopics);
                    }
                });
            };
            if (paper.subtopics) traverse(paper.subtopics);
        });

        return topics;
    };

    const allTopics = getAllTopics();
    const filteredTopics = allTopics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.paper.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by Paper
    const groupedTopics = filteredTopics.reduce((acc, topic) => {
        if (!acc[topic.paper]) acc[topic.paper] = [];
        acc[topic.paper].push(topic);
        return acc;
    }, {} as Record<string, typeof filteredTopics>);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 -m-4 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-slate-100 flex items-center gap-3">
                            <Book className="w-8 h-8 text-primary" />
                            My Notebooks
                        </h1>
                        <p className="text-stone-500 dark:text-slate-400 mt-1">
                            Manage your notes and resources across all GS Papers.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {Object.entries(groupedTopics).map(([paper, topics]) => (
                        <div key={paper} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-stone-200 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300">
                                    {paper}
                                </span>
                                <div className="h-px flex-1 bg-stone-200 dark:bg-slate-800"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {topics.map(topic => {
                                    const counts = getResourceCount(topic.id);
                                    const hasContent = counts.notes > 0 || counts.links > 0;

                                    return (
                                        <motion.div
                                            key={topic.id}
                                            layoutId={`notebook-${topic.id}`}
                                            onClick={() => setSelectedTopic(topic)}
                                            whileHover={{ y: -2 }}
                                            className={`group p-5 rounded-xl border cursor-pointer transition-all ${hasContent
                                                ? 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30'
                                                : 'bg-stone-50 dark:bg-slate-900/50 border-stone-100 dark:border-slate-800/50 opacity-70 hover:opacity-100 hover:bg-white dark:hover:bg-slate-900'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2 rounded-lg ${hasContent ? 'bg-primary/10 text-primary' : 'bg-stone-100 dark:bg-slate-800 text-stone-400'}`}>
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                {(counts.notes > 0 || counts.links > 0) && (
                                                    <div className="flex gap-2 text-xs font-medium text-stone-500 dark:text-slate-400">
                                                        {counts.notes > 0 && (
                                                            <span className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                <FileText className="w-3 h-3" /> {counts.notes}
                                                            </span>
                                                        )}
                                                        {counts.links > 0 && (
                                                            <span className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                <LinkIcon className="w-3 h-3" /> {counts.links}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-stone-800 dark:text-slate-200 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                                {topic.title}
                                            </h3>

                                            <div className="flex items-center text-xs text-stone-400 dark:text-slate-500 mt-4 group-hover:text-primary/70 transition-colors">
                                                <span>Open Notebook</span>
                                                <ChevronRight className="w-3 h-3 ml-1" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredTopics.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-stone-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-stone-400" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-600 dark:text-slate-400">No topics found</h3>
                            <p className="text-stone-400 dark:text-slate-500">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>

                {/* Notebook Modal */}
                <AnimatePresence>
                    {selectedTopic && (
                        <TopicNotebook
                            topicId={selectedTopic.id}
                            topicTitle={selectedTopic.title}
                            onClose={() => setSelectedTopic(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
