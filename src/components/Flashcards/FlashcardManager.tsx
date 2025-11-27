import React, { useState, useRef } from 'react';
import { useDashboard, Flashcard, Deck } from '@/context/DashboardContext';
import { Plus, Trash2, BookOpen, ChevronRight, ArrowLeft, Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyMode } from './StudyMode';
import Papa from 'papaparse';

export default function FlashcardManager() {
    const { decks, addDeck, deleteDeck, addFlashcard } = useDashboard();
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
    const [isStudyMode, setIsStudyMode] = useState(false);
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [isAddingDeck, setIsAddingDeck] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New Card State
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');

    const activeDeck = decks.find(d => d.id === activeDeckId);

    const handleAddDeck = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeckTitle.trim()) {
            addDeck(newDeckTitle);
            setNewDeckTitle('');
            setIsAddingDeck(false);
        }
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeDeckId && newCardFront.trim() && newCardBack.trim()) {
            addFlashcard(activeDeckId, { front: newCardFront, back: newCardBack });
            setNewCardFront('');
            setNewCardBack('');
            setIsAddingCard(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeDeckId) return;

        Papa.parse(file, {
            complete: (results) => {
                const rows = results.data as string[][];
                let addedCount = 0;
                rows.forEach((row) => {
                    if (row.length >= 2) {
                        const front = row[0]?.trim();
                        const back = row[1]?.trim();
                        if (front && back) {
                            addFlashcard(activeDeckId, { front, back });
                            addedCount++;
                        }
                    }
                });
                alert(`Successfully imported ${addedCount} cards!`);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            header: false,
            skipEmptyLines: true
        });
    };

    if (isStudyMode && activeDeck) {
        return <StudyMode deck={activeDeck} onClose={() => setIsStudyMode(false)} />;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    {activeDeckId && (
                        <button
                            onClick={() => setActiveDeckId(null)}
                            className="p-1 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-stone-500 dark:text-slate-400" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">
                        {activeDeck ? activeDeck.title : 'Flashcards'}
                    </h2>
                </div>

                {!activeDeckId && (
                    <button
                        onClick={() => setIsAddingDeck(true)}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Deck
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!activeDeckId ? (
                    // Deck List
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isAddingDeck && (
                            <form onSubmit={handleAddDeck} className="p-4 border border-primary/50 rounded-xl bg-primary/5">
                                <input
                                    type="text"
                                    placeholder="Deck Title"
                                    value={newDeckTitle}
                                    onChange={(e) => setNewDeckTitle(e.target.value)}
                                    className="w-full bg-transparent border-b border-primary/30 focus:outline-none focus:border-primary px-1 py-2 text-sm mb-3"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingDeck(false)}
                                        className="text-xs text-stone-500 hover:text-stone-700 dark:text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="text-xs bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/90"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        )}

                        {decks.map(deck => (
                            <div
                                key={deck.id}
                                onClick={() => setActiveDeckId(deck.id)}
                                className="group p-4 border border-stone-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-stone-50 dark:bg-slate-800/50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-slate-700 dark:text-slate-200">{deck.title}</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-500 rounded transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
                                    <span>{deck.cards.length} cards</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}

                        {decks.length === 0 && !isAddingDeck && (
                            <div className="col-span-2 text-center py-10 text-stone-400 dark:text-slate-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No decks yet. Create one to start studying!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Card List (Inside Deck)
                    <div className="space-y-4">
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setIsStudyMode(true)}
                                disabled={!activeDeck || activeDeck.cards.length === 0}
                                className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" /> Study Now
                            </button>
                            <button
                                onClick={() => setIsAddingCard(true)}
                                className="flex-1 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Card
                            </button>
                            <div className="relative">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-full px-3 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                                    title="Import CSV (Front, Back)"
                                >
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {isAddingCard && (
                            <form onSubmit={handleAddCard} className="p-4 border border-primary/50 rounded-xl bg-primary/5 mb-4">
                                <div className="space-y-3 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Front (Question)"
                                        value={newCardFront}
                                        onChange={(e) => setNewCardFront(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                        autoFocus
                                    />
                                    <textarea
                                        placeholder="Back (Answer)"
                                        value={newCardBack}
                                        onChange={(e) => setNewCardBack(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[80px]"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCard(false)}
                                        className="text-xs text-stone-500 hover:text-stone-700 dark:text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="text-xs bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/90"
                                    >
                                        Add Card
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            {activeDeck?.cards.map((card, index) => (
                                <div key={card.id} className="p-3 bg-stone-50 dark:bg-slate-800/50 rounded-lg border border-stone-100 dark:border-slate-700/50 flex justify-between items-start group">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">{card.front}</p>
                                        <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-1">{card.back}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${card.status === 'mastered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            card.status === 'learning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-stone-200 text-stone-600 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                            {card.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {activeDeck?.cards.length === 0 && !isAddingCard && (
                                <div className="text-center py-8 text-stone-400 dark:text-slate-500 text-sm">
                                    No cards in this deck yet.
                                    <br />
                                    <span className="text-xs mt-2 block">
                                        Tip: Import a CSV with "Front, Back" columns.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
