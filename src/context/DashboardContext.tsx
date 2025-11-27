"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---

export type SyllabusStatus = 'Not Started' | 'Reading' | 'Revised' | 'Mastered';

export interface SyllabusTopic {
    id: string;
    title: string;
    status: SyllabusStatus;
    subtopics?: SyllabusTopic[];
}

export interface Habit {
    id: string;
    name: string;
    completedDates: string[]; // ISO date strings YYYY-MM-DD
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface Revision {
    id: string;
    topicId: string;
    date: string; // ISO Date YYYY-MM-DD
    status: 'Pending' | 'Completed';
}

export interface Resource {
    id: string;
    topicId: string;
    type: 'note' | 'link';
    content: string; // Markdown content or URL
    title?: string;
}

export interface FocusSession {
    id: string;
    topicId: string;
    duration: number; // Minutes
    date: string; // ISO Date
}

export interface Flashcard {
    id: string;
    deckId: string;
    front: string;
    back: string;
    lastReviewed?: string;
    status: 'new' | 'learning' | 'mastered';
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    cards: Flashcard[];
}

export interface Bookmark {
    id: string;
    title: string;
    link: string;
    date: string;
    note?: string;
    source?: string;
}

interface DashboardState {
    syllabus: SyllabusTopic[];
    habits: Habit[];
    tasks: Task[];
    revisions: Revision[];
    resources: Resource[];
    focusSessions: FocusSession[];
    bookmarks: Bookmark[];
    decks: Deck[];
}

interface DashboardContextType extends DashboardState {
    updateSyllabusStatus: (topicId: string, status: SyllabusStatus) => void;
    addHabit: (name: string) => void;
    deleteHabit: (id: string) => void;
    toggleHabit: (id: string, date: string) => void;
    addTask: (text: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, text: string) => void;
    // Advanced Features
    scheduleRevision: (topicId: string) => void;
    completeRevision: (revisionId: string) => void;
    addResource: (resource: Omit<Resource, 'id'>) => void;
    updateResource: (id: string, content: string) => void;
    deleteResource: (id: string) => void;
    logFocusSession: (topicId: string, duration: number) => void;
    // Bookmarks
    addBookmark: (bookmark: Omit<Bookmark, 'id' | 'date'> & { id?: string }) => void;
    removeBookmark: (id: string) => void;
    updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
    // Flashcards
    addDeck: (title: string) => void;
    deleteDeck: (id: string) => void;
    addFlashcard: (deckId: string, card: Omit<Flashcard, 'id' | 'deckId' | 'status'>) => void;
    updateFlashcardStatus: (deckId: string, cardId: string, status: Flashcard['status']) => void;
}

// --- Initial Data ---

const INITIAL_SYLLABUS: SyllabusTopic[] = [
    {
        id: 'gs1',
        title: 'GS Paper I: Heritage, History, Geography & Society',
        status: 'Not Started',
        subtopics: [
            {
                id: 'gs1-art',
                title: 'Indian Heritage & Culture',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs1-art-arch', title: 'Architecture', status: 'Not Started' },
                    { id: 'gs1-art-lit', title: 'Literature', status: 'Not Started' },
                    { id: 'gs1-art-perf', title: 'Performing Arts', status: 'Not Started' }
                ]
            },
            {
                id: 'gs1-hist',
                title: 'History',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs1-hist-mod', title: 'Modern Indian History', status: 'Not Started' },
                    { id: 'gs1-hist-free', title: 'Freedom Struggle', status: 'Not Started' },
                    { id: 'gs1-hist-post', title: 'Post-Independence Consolidation', status: 'Not Started' },
                    { id: 'gs1-hist-world', title: 'World History', status: 'Not Started' }
                ]
            },
            {
                id: 'gs1-soc',
                title: 'Indian Society',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs1-soc-div', title: 'Diversity of India', status: 'Not Started' },
                    { id: 'gs1-soc-women', title: 'Role of Women', status: 'Not Started' },
                    { id: 'gs1-soc-urb', title: 'Urbanization', status: 'Not Started' },
                    { id: 'gs1-soc-glob', title: 'Globalization', status: 'Not Started' },
                    { id: 'gs1-soc-emp', title: 'Social Empowerment', status: 'Not Started' }
                ]
            },
            {
                id: 'gs1-geo',
                title: 'Geography',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs1-geo-phy', title: 'Physical Geography', status: 'Not Started' },
                    { id: 'gs1-geo-res', title: 'Natural Resources', status: 'Not Started' },
                    { id: 'gs1-geo-phen', title: 'Geophysical Phenomena', status: 'Not Started' }
                ]
            },
        ],
    },
    {
        id: 'gs2',
        title: 'GS Paper II: Governance, Constitution, Polity, Social Justice & IR',
        status: 'Not Started',
        subtopics: [
            {
                id: 'gs2-pol',
                title: 'Polity & Constitution',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs2-pol-const', title: 'Indian Constitution', status: 'Not Started' },
                    { id: 'gs2-pol-fed', title: 'Federal Structure', status: 'Not Started' },
                    { id: 'gs2-pol-sep', title: 'Separation of Powers', status: 'Not Started' },
                    { id: 'gs2-pol-parl', title: 'Parliament & State Legislatures', status: 'Not Started' },
                    { id: 'gs2-pol-exec', title: 'Executive & Judiciary', status: 'Not Started' },
                    { id: 'gs2-pol-rpa', title: 'Representation of People\'s Act', status: 'Not Started' },
                    { id: 'gs2-pol-bodies', title: 'Constitutional Bodies', status: 'Not Started' }
                ]
            },
            {
                id: 'gs2-gov',
                title: 'Governance',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs2-gov-pol', title: 'Government Policies', status: 'Not Started' },
                    { id: 'gs2-gov-dev', title: 'Development Processes (NGOs/SHGs)', status: 'Not Started' },
                    { id: 'gs2-gov-wel', title: 'Welfare Schemes', status: 'Not Started' },
                    { id: 'gs2-gov-soc', title: 'Social Sector (Health/Edu/HR)', status: 'Not Started' },
                    { id: 'gs2-gov-pov', title: 'Poverty & Hunger', status: 'Not Started' },
                    { id: 'gs2-gov-trans', title: 'Transparency & Accountability', status: 'Not Started' },
                    { id: 'gs2-gov-civ', title: 'Role of Civil Services', status: 'Not Started' }
                ]
            },
            {
                id: 'gs2-ir',
                title: 'International Relations',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs2-ir-neigh', title: 'India & Neighborhood', status: 'Not Started' },
                    { id: 'gs2-ir-group', title: 'Regional & Global Groupings', status: 'Not Started' },
                    { id: 'gs2-ir-inst', title: 'International Institutions', status: 'Not Started' }
                ]
            },
        ],
    },
    {
        id: 'gs3',
        title: 'GS Paper III: Technology, Economy, Environment, Security & Disaster Mgmt',
        status: 'Not Started',
        subtopics: [
            {
                id: 'gs3-eco',
                title: 'Economy',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs3-eco-plan', title: 'Planning & Growth', status: 'Not Started' },
                    { id: 'gs3-eco-budg', title: 'Government Budgeting', status: 'Not Started' },
                    { id: 'gs3-eco-crop', title: 'Agriculture & Crops', status: 'Not Started' },
                    { id: 'gs3-eco-food', title: 'Food Processing', status: 'Not Started' },
                    { id: 'gs3-eco-land', title: 'Land Reforms', status: 'Not Started' },
                    { id: 'gs3-eco-lib', title: 'Liberalization', status: 'Not Started' },
                    { id: 'gs3-eco-infra', title: 'Infrastructure', status: 'Not Started' },
                    { id: 'gs3-eco-inv', title: 'Investment Models', status: 'Not Started' }
                ]
            },
            {
                id: 'gs3-sci',
                title: 'Science & Technology',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs3-sci-dev', title: 'Developments & Applications', status: 'Not Started' },
                    { id: 'gs3-sci-ind', title: 'Indigenization', status: 'Not Started' },
                    { id: 'gs3-sci-field', title: 'IT, Space, Nano, Bio, IPR', status: 'Not Started' }
                ]
            },
            {
                id: 'gs3-env',
                title: 'Environment',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs3-env-cons', title: 'Conservation', status: 'Not Started' },
                    { id: 'gs3-env-pol', title: 'Pollution & Degradation', status: 'Not Started' },
                    { id: 'gs3-env-eia', title: 'EIA', status: 'Not Started' },
                    { id: 'gs3-env-dis', title: 'Disaster Management', status: 'Not Started' }
                ]
            },
            {
                id: 'gs3-sec',
                title: 'Security',
                status: 'Not Started',
                subtopics: [
                    { id: 'gs3-sec-ext', title: 'Extremism', status: 'Not Started' },
                    { id: 'gs3-sec-cyber', title: 'Cyber Security', status: 'Not Started' },
                    { id: 'gs3-sec-bord', title: 'Border Management', status: 'Not Started' },
                    { id: 'gs3-sec-org', title: 'Organized Crime', status: 'Not Started' }
                ]
            },
        ],
    },
    {
        id: 'gs4',
        title: 'GS Paper IV: Ethics, Integrity & Aptitude',
        status: 'Not Started',
        subtopics: [
            { id: 'gs4-eth', title: 'Ethics & Human Interface', status: 'Not Started' },
            { id: 'gs4-att', title: 'Attitude', status: 'Not Started' },
            { id: 'gs4-apt', title: 'Aptitude & Foundational Values', status: 'Not Started' },
            { id: 'gs4-ei', title: 'Emotional Intelligence', status: 'Not Started' },
            { id: 'gs4-think', title: 'Moral Thinkers', status: 'Not Started' },
            { id: 'gs4-pub', title: 'Public Service Values', status: 'Not Started' },
            { id: 'gs4-prob', title: 'Probity in Governance', status: 'Not Started' },
            { id: 'gs4-case', title: 'Case Studies', status: 'Not Started' },
        ],
    },
];

const INITIAL_HABITS: Habit[] = [
    { id: 'h1', name: 'Read The Hindu', completedDates: [] },
    { id: 'h2', name: 'Answer Writing', completedDates: [] },
];

const INITIAL_TASKS: Task[] = [
    { id: 't1', text: 'Complete History Chapter 1', completed: false },
    { id: 't2', text: 'Read Editorial', completed: false },
    { id: 't3', text: 'Solve 10 MCQs', completed: false },
];

// --- Context & Provider ---

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [syllabus, setSyllabus] = useState<SyllabusTopic[]>(INITIAL_SYLLABUS);
    const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedData = localStorage.getItem('upsc-dashboard-v1');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.syllabus && parsed.syllabus.length === 4 && parsed.syllabus[0].subtopics?.length > 3) {
                    setSyllabus(parsed.syllabus);
                }
                if (parsed.habits) setHabits(parsed.habits);
                if (parsed.tasks) setTasks(parsed.tasks);
                if (parsed.revisions) setRevisions(parsed.revisions);
                if (parsed.resources) setResources(parsed.resources);
                if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
                if (parsed.decks) setDecks(parsed.decks);

                // Migration for bookmarks
                if (parsed.bookmarks) {
                    if (Array.isArray(parsed.bookmarks)) {
                        if (parsed.bookmarks.length > 0 && typeof parsed.bookmarks[0] === 'string') {
                            const migrated = parsed.bookmarks.map((link: string) => ({
                                id: link,
                                title: 'Legacy Bookmark',
                                link: link,
                                date: new Date().toISOString()
                            }));
                            setBookmarks(migrated);
                        } else {
                            setBookmarks(parsed.bookmarks);
                        }
                    } else {
                        setBookmarks([]);
                    }
                } else {
                    setBookmarks([]);
                }
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('upsc-dashboard-v1', JSON.stringify({
                syllabus, habits, tasks, revisions, resources, focusSessions, bookmarks, decks
            }));
        }
    }, [syllabus, habits, tasks, revisions, resources, focusSessions, bookmarks, decks, isLoaded]);

    // Actions

    const updateSyllabusStatus = (topicId: string, status: SyllabusStatus) => {
        const updateRecursive = (topics: SyllabusTopic[]): SyllabusTopic[] => {
            return topics.map(topic => {
                if (topic.id === topicId) {
                    // If marked as 'Reading' or 'Revised', schedule revisions
                    if (status === 'Reading' || status === 'Revised') {
                        scheduleRevision(topicId);
                    }
                    return { ...topic, status };
                }
                if (topic.subtopics) {
                    return { ...topic, subtopics: updateRecursive(topic.subtopics) };
                }
                return topic;
            });
        };
        setSyllabus(prev => updateRecursive(prev));
    };

    const scheduleRevision = (topicId: string) => {
        const today = new Date();
        const intervals = [1, 3, 7, 30]; // Days
        const newRevisions: Revision[] = intervals.map(days => {
            const date = new Date(today);
            date.setDate(date.getDate() + days);
            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                topicId,
                date: date.toISOString().split('T')[0],
                status: 'Pending'
            };
        });

        // Filter out existing pending revisions for this topic to avoid duplicates if re-clicked
        setRevisions(prev => [
            ...prev.filter(r => r.topicId !== topicId || r.status === 'Completed'),
            ...newRevisions
        ]);
    };

    const completeRevision = (revisionId: string) => {
        setRevisions(prev => prev.map(r => r.id === revisionId ? { ...r, status: 'Completed' } : r));
    };

    const addResource = (resource: Omit<Resource, 'id'>) => {
        const newResource = { ...resource, id: Date.now().toString() };
        setResources(prev => [...prev, newResource]);
    };

    const updateResource = (id: string, content: string) => {
        setResources(prev => prev.map(r => r.id === id ? { ...r, content } : r));
    };

    const deleteResource = (id: string) => {
        setResources(prev => prev.filter(r => r.id !== id));
    };

    const logFocusSession = (topicId: string, duration: number) => {
        const session: FocusSession = {
            id: Date.now().toString(),
            topicId,
            duration,
            date: new Date().toISOString()
        };
        setFocusSessions(prev => [...prev, session]);
    };

    const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'date'> & { id?: string }) => {
        const newBookmark: Bookmark = {
            ...bookmark,
            id: bookmark.id || Date.now().toString(),
            date: new Date().toISOString()
        };
        setBookmarks(prev => [...prev, newBookmark]);
    };

    const removeBookmark = (id: string) => {
        setBookmarks(prev => prev.filter(b => b.id !== id && b.link !== id)); // Handle both ID and Link for legacy
    };

    const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
        setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const addHabit = (name: string) => {
        const newHabit: Habit = { id: Date.now().toString(), name, completedDates: [] };
        setHabits(prev => [...prev, newHabit]);
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    const toggleHabit = (id: string, date: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const isCompleted = h.completedDates.includes(date);
                const newDates = isCompleted
                    ? h.completedDates.filter(d => d !== date)
                    : [...h.completedDates, date];
                return { ...h, completedDates: newDates };
            }
            return h;
        }));
    };

    const addTask = (text: string) => {
        const newTask: Task = { id: Date.now().toString(), text, completed: false };
        setTasks(prev => [...prev, newTask]);
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const updateTask = (id: string, text: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    };

    const addDeck = (title: string) => {
        const newDeck: Deck = { id: Date.now().toString(), title, cards: [] };
        setDecks(prev => [...prev, newDeck]);
    };

    const deleteDeck = (id: string) => {
        setDecks(prev => prev.filter(d => d.id !== id));
    };

    const addFlashcard = (deckId: string, card: Omit<Flashcard, 'id' | 'deckId' | 'status'>) => {
        const newCard: Flashcard = {
            ...card,
            id: Date.now().toString(),
            deckId,
            status: 'new'
        };
        setDecks(prev => prev.map(deck =>
            deck.id === deckId
                ? { ...deck, cards: [...deck.cards, newCard] }
                : deck
        ));
    };

    const updateFlashcardStatus = (deckId: string, cardId: string, status: Flashcard['status']) => {
        setDecks(prev => prev.map(deck =>
            deck.id === deckId
                ? {
                    ...deck,
                    cards: deck.cards.map(c => c.id === cardId ? { ...c, status, lastReviewed: new Date().toISOString() } : c)
                }
                : deck
        ));
    };

    return (
        <DashboardContext.Provider value={{
            syllabus, habits, tasks, revisions, resources, focusSessions, bookmarks, decks,
            updateSyllabusStatus, addHabit, deleteHabit, toggleHabit,
            addTask, toggleTask, deleteTask, updateTask,
            scheduleRevision, completeRevision, addResource, updateResource, deleteResource, logFocusSession,
            addBookmark, removeBookmark, updateBookmark,
            addDeck, deleteDeck, addFlashcard, updateFlashcardStatus
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
