"use client";

import React, { useState, useEffect } from 'react';
import { Deck, Flashcard, useDashboard } from '@/context/DashboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyModeProps {
    deck: Deck;
    onClose: () => void;
}

export function StudyMode({ deck, onClose }: StudyModeProps) {
    const { updateFlashcardStatus } = useDashboard();
    const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        // Filter cards that need review (or all if just starting)
        // For now, just shuffle all cards
        const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
        setCardsToReview(shuffled);
    }, [deck]);

    const currentCard = cardsToReview[currentIndex];

    const handleRate = (status: Flashcard['status']) => {
        if (currentCard) {
            updateFlashcardStatus(deck.id, currentCard.id, status);
        }

        if (currentIndex < cardsToReview.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // Small delay for animation
        } else {
            setIsFinished(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
    };

    if (isFinished) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Session Complete!</h2>
                <p className="text-stone-500 dark:text-slate-400 mb-8">You've reviewed all {cardsToReview.length} cards in this deck.</p>
                <button
                    onClick={onClose}
                    className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    Back to Decks
                </button>
            </div>
        );
    }

    if (!currentCard) return null;

    return (
        <div className="h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm font-medium text-stone-500 dark:text-slate-400">
                    Card {currentIndex + 1} of {cardsToReview.length}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-stone-500 dark:text-slate-400" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center perspective-1000">
                <div
                    className="w-full max-w-md aspect-[3/2] relative cursor-pointer group"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <motion.div
                        className="w-full h-full absolute inset-0 backface-hidden bg-white dark:bg-slate-700 rounded-2xl shadow-xl border border-stone-200 dark:border-slate-600 flex items-center justify-center p-8 text-center"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Question</span>
                            <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                                {currentCard.front}
                            </p>
                            <p className="text-xs text-stone-400 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to flip
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="w-full h-full absolute inset-0 backface-hidden bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-xl border border-stone-200 dark:border-slate-600 flex items-center justify-center p-8 text-center"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 0 : -180 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Answer</span>
                            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                                {currentCard.back}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="h-24 flex items-center justify-center gap-4 mt-6">
                {!isFlipped ? (
                    <button
                        onClick={() => setIsFlipped(true)}
                        className="w-full max-w-xs bg-slate-800 dark:bg-slate-700 text-white py-3 rounded-xl font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-lg"
                    >
                        Show Answer
                    </button>
                ) : (
                    <div className="flex gap-4 w-full max-w-xs animate-in slide-in-from-bottom-4 duration-300">
                        <button
                            onClick={() => handleRate('learning')}
                            className="flex-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 py-3 rounded-xl font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors border border-amber-200 dark:border-amber-800/50"
                        >
                            Needs Practice
                        </button>
                        <button
                            onClick={() => handleRate('mastered')}
                            className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 py-3 rounded-xl font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800/50"
                        >
                            Got It
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
