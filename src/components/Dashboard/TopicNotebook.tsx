"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Link as LinkIcon, FileText, Youtube, ExternalLink, Plus } from 'lucide-react';
import { useDashboard, Resource } from '@/context/DashboardContext';

interface TopicNotebookProps {
    topicId: string;
    topicTitle: string;
    onClose: () => void;
}

export function TopicNotebook({ topicId, topicTitle, onClose }: TopicNotebookProps) {
    const { resources, addResource, updateResource, deleteResource } = useDashboard();
    const [activeTab, setActiveTab] = useState<'notes' | 'resources'>('notes');
    const [noteContent, setNoteContent] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkTitle, setNewLinkTitle] = useState('');

    // Load existing note
    useEffect(() => {
        const note = resources.find(r => r.topicId === topicId && r.type === 'note');
        if (note) setNoteContent(note.content);
        else setNoteContent('');
    }, [topicId, resources]);

    const handleSaveNote = () => {
        const existingNote = resources.find(r => r.topicId === topicId && r.type === 'note');
        if (existingNote) {
            updateResource(existingNote.id, noteContent);
        } else {
            addResource({
                topicId,
                type: 'note',
                content: noteContent,
                title: 'Main Note'
            });
        }
    };

    const handleAddLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLinkUrl && newLinkTitle) {
            addResource({
                topicId,
                type: 'link',
                content: newLinkUrl,
                title: newLinkTitle
            });
            setNewLinkUrl('');
            setNewLinkTitle('');
        }
    };

    const topicResources = resources.filter(r => r.topicId === topicId && r.type === 'link');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#fdfbf7] w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-slate-800">{topicTitle}</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Topic Notebook</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-200 bg-stone-50">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'notes'
                            ? 'bg-white text-primary border-t-2 border-primary'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-stone-100'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'resources'
                            ? 'bg-white text-primary border-t-2 border-primary'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-stone-100'
                            }`}
                    >
                        <LinkIcon className="w-4 h-4" />
                        Resources
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden bg-white relative">
                    {activeTab === 'notes' ? (
                        <div className="h-full flex flex-col">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="# Start typing your notes here...\n\n- Key Point 1\n- Key Point 2"
                                className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm text-slate-800 leading-relaxed custom-scrollbar"
                            />
                            <div className="p-4 border-t border-stone-200 flex justify-end bg-stone-50">
                                <button
                                    onClick={handleSaveNote}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col p-6">
                            {/* Add Link Form */}
                            <form onSubmit={handleAddLink} className="flex gap-2 mb-6 bg-stone-50 p-4 rounded-lg border border-stone-200">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                        placeholder="Resource Title (e.g., 'Mrunal Economy Video')"
                                        className="w-full px-3 py-2 rounded border border-stone-300 text-sm focus:outline-none focus:border-primary"
                                    />
                                    <input
                                        type="url"
                                        value={newLinkUrl}
                                        onChange={(e) => setNewLinkUrl(e.target.value)}
                                        placeholder="URL (YouTube, GDrive, etc.)"
                                        className="w-full px-3 py-2 rounded border border-stone-300 text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newLinkUrl || !newLinkTitle}
                                    className="self-end bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>

                            {/* Links List */}
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {topicResources.length === 0 ? (
                                    <div className="text-center text-slate-400 py-10">
                                        <LinkIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>No resources added yet.</p>
                                    </div>
                                ) : (
                                    topicResources.map((res) => (
                                        <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:border-primary/30 hover:bg-stone-50 transition-all group">
                                            <div className="flex items-center gap-3">
                                                {res.content.includes('youtube') || res.content.includes('youtu.be') ? (
                                                    <Youtube className="w-5 h-5 text-red-600" />
                                                ) : (
                                                    <LinkIcon className="w-5 h-5 text-blue-600" />
                                                )}
                                                <a
                                                    href={res.content}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-slate-700 hover:text-primary hover:underline"
                                                >
                                                    {res.title}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={res.content}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => deleteResource(res.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
