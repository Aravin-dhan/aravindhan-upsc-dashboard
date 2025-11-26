"use client";

import React, { useState } from 'react';
import { useDashboard, SyllabusStatus, SyllabusTopic } from '@/context/DashboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, BookOpen, CheckCircle, Circle, BookMarked, Timer, Bookmark } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { TopicNotebook } from './TopicNotebook';
import { FocusTimer } from './FocusTimer';

const statusColors = {
    'Not Started': 'bg-stone-200 text-stone-600 dark:bg-slate-700 dark:text-slate-400',
    'Reading': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Revised': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Mastered': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export const SyllabusAtlas = () => {
    const { syllabus, updateSyllabusStatus, revisions, bookmarks, toggleBookmark } = useDashboard();
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [focusTopicId, setFocusTopicId] = useState<string | null>(null);

    const isRevisionDue = (topicId: string) => {
        const today = new Date().toISOString().split('T')[0];
        return revisions.some(r => r.topicId === topicId && r.status === 'Pending' && r.date <= today);
    };

    const renderTopic = (topic: SyllabusTopic, depth = 0) => {
        const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
        const isBookmarked = bookmarks.includes(topic.id);

        return (
            <Accordion.Item value={topic.id} key={topic.id} className={`border-b border-stone-100 dark:border-slate-800 last:border-0 ${depth > 0 ? 'ml-4' : ''}`}>
                <div className="flex items-center justify-between p-3 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg group">
                    <div className="flex items-center gap-3 flex-1">
                        {hasSubtopics ? (
                            <Accordion.Trigger className="p-1 hover:bg-stone-200 dark:hover:bg-slate-700 rounded transition-colors">
                                <ChevronDown className="w-4 h-4 text-stone-400 dark:text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        ) : (
                            <span className="w-6" />
                        )}

                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${depth === 0 ? 'text-stone-800 dark:text-slate-200' : 'text-stone-600 dark:text-slate-400'}`}>
                                {topic.title}
                            </span>
                            {isRevisionDue(topic.id) && (
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => toggleBookmark(topic.id)}
                            className={`p-1.5 rounded-md transition-colors ${isBookmarked ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-500 dark:hover:text-amber-400 dark:hover:bg-amber-900/20'}`}
                            title={isBookmarked ? "Remove Bookmark" : "Bookmark Topic"}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={() => setFocusTopicId(topic.id)}
                            className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                            title="Start Focus Session"
                        >
                            <Timer className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setSelectedTopicId(topic.id)}
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-500 dark:hover:text-amber-400 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                            title="Open Notebook"
                        >
                            <BookMarked className="w-4 h-4" />
                        </button>

                        <select
                            value={topic.status}
                            onChange={(e) => updateSyllabusStatus(topic.id, e.target.value as SyllabusStatus)}
                            className={`text-xs px-2 py-1 rounded-full border-none outline-none cursor-pointer font-medium transition-colors ${statusColors[topic.status]}`}
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="Reading">Reading</option>
                            <option value="Revised">Revised</option>
                            <option value="Mastered">Mastered</option>
                        </select>
                    </div>
                </div>

                {hasSubtopics && (
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="pl-2 border-l border-stone-100 dark:border-slate-800 ml-3 mb-2">
                            {topic.subtopics!.map(sub => renderTopic(sub, depth + 1))}
                        </div>
                    </Accordion.Content>
                )}
            </Accordion.Item>
        );
    };

    return (
        <div className="paper-panel rounded-xl p-6 h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-primary dark:text-amber-500 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Syllabus Atlas
                </h2>
                <div className="text-xs text-stone-500 dark:text-slate-500 font-medium px-3 py-1 bg-stone-100 dark:bg-slate-800 rounded-full">
                    UPSC CSE 2027
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <Accordion.Root type="multiple" className="space-y-1">
                    {syllabus.map(topic => renderTopic(topic))}
                </Accordion.Root>
            </div>

            {selectedTopicId && (
                <TopicNotebook
                    topicId={selectedTopicId}
                    isOpen={!!selectedTopicId}
                    onClose={() => setSelectedTopicId(null)}
                />
            )}

            {focusTopicId && (
                <FocusTimer
                    topicId={focusTopicId}
                    isOpen={!!focusTopicId}
                    onClose={() => setFocusTopicId(null)}
                />
            )}
        </div>
    );
};
