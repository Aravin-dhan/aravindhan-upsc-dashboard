"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, LayoutTemplate, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

interface LayoutManagerProps {
    children: React.ReactNode[];
}

type WidgetWidth = 'small' | 'medium' | 'full';
type WidgetHeight = 'auto' | 'tall' | 'taller';

interface WidgetSize {
    width: WidgetWidth;
    height: WidgetHeight;
}

interface LayoutState {
    order: string[];
    sizes: Record<string, WidgetSize>;
}

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    isEditing: boolean;
    size: WidgetSize;
    onResize: (id: string, newSize: Partial<WidgetSize>) => void;
}

function SortableItem({ id, children, isEditing, size, onResize }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getWidthClass = (w: WidgetWidth) => {
        switch (w) {
            case 'full': return 'col-span-1 md:col-span-2 lg:col-span-3';
            case 'medium': return 'col-span-1 md:col-span-2 lg:col-span-2';
            case 'small': default: return 'col-span-1';
        }
    };

    const getHeightClass = (h: WidgetHeight) => {
        switch (h) {
            case 'taller': return 'row-span-3';
            case 'tall': return 'row-span-2';
            case 'auto': default: return 'row-span-1';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group ${getWidthClass(size.width)} ${getHeightClass(size.height)} transition-all duration-300 flex flex-col h-full overflow-hidden rounded-3xl shadow-sm border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900`}
        >
            {isEditing && (
                <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 backdrop-blur p-1 rounded-lg border border-stone-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-1">
                        <div
                            {...attributes}
                            {...listeners}
                            className="p-1.5 hover:bg-stone-100 dark:hover:bg-slate-700 rounded cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                        >
                            <GripVertical className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                        </div>
                        <div className="w-px h-4 bg-stone-200 dark:bg-slate-700 mx-1" />
                        {/* Width Controls */}
                        <button
                            onClick={() => onResize(id, { width: 'small' })}
                            className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-slate-700 ${size.width === 'small' ? 'text-primary bg-primary/10' : 'text-stone-400'}`}
                            title="Small Width"
                        >
                            <div className="w-4 h-4 border-2 border-current rounded-sm" />
                        </button>
                        <button
                            onClick={() => onResize(id, { width: 'medium' })}
                            className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-slate-700 ${size.width === 'medium' ? 'text-primary bg-primary/10' : 'text-stone-400'}`}
                            title="Medium Width"
                        >
                            <div className="w-6 h-4 border-2 border-current rounded-sm" />
                        </button>
                        <button
                            onClick={() => onResize(id, { width: 'full' })}
                            className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-slate-700 ${size.width === 'full' ? 'text-primary bg-primary/10' : 'text-stone-400'}`}
                            title="Full Width"
                        >
                            <div className="w-8 h-4 border-2 border-current rounded-sm" />
                        </button>
                    </div>

                    {/* Height Controls */}
                    <div className="flex items-center gap-1 border-t border-stone-200 dark:border-slate-700 pt-1 mt-1">
                        <button
                            onClick={() => onResize(id, { height: 'auto' })}
                            className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-slate-700 ${size.height === 'auto' ? 'text-primary bg-primary/10' : 'text-stone-400'}`}
                            title="Auto Height"
                        >
                            <div className="w-4 h-4 border-2 border-current rounded-sm" />
                        </button>
                        <button
                            onClick={() => onResize(id, { height: 'tall' })}
                            className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-slate-700 ${size.height === 'tall' ? 'text-primary bg-primary/10' : 'text-stone-400'}`}
                            title="Tall Height"
                        >
                            <div className="w-4 h-6 border-2 border-current rounded-sm" />
                        </button>
                        <button
                            onClick={() => onResize(id, { height: 'taller' })}
                            className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-slate-700 ${size.height === 'taller' ? 'text-primary bg-primary/10' : 'text-stone-400'}`}
                            title="Taller Height"
                        >
                            <div className="w-4 h-8 border-2 border-current rounded-sm" />
                        </button>
                    </div>
                </div>
            )}
            <div className="h-full w-full overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}

export function LayoutManager({ children }: LayoutManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize state
    const [layout, setLayout] = useState<LayoutState>(() => {
        // Default state
        const defaultOrder = children.map((_, i) => `item-${i}`);
        const defaultSizes: Record<string, WidgetSize> = {};
        defaultOrder.forEach(id => defaultSizes[id] = { width: 'small', height: 'auto' });

        // Try to load from localStorage (client-side only)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboard_layout_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Check if it's the old format (just string sizes) or new format
                    const isNewFormat = Object.values(parsed.sizes).some(s => typeof s === 'object');

                    if (parsed.order.length === children.length) {
                        if (isNewFormat) {
                            return parsed;
                        } else {
                            // Migrate old format
                            const migratedSizes: Record<string, WidgetSize> = {};
                            Object.keys(parsed.sizes).forEach(key => {
                                migratedSizes[key] = {
                                    width: parsed.sizes[key] as WidgetWidth,
                                    height: 'auto'
                                };
                            });
                            return { order: parsed.order, sizes: migratedSizes };
                        }
                    }
                } catch (e) {
                    console.error('Failed to load layout', e);
                }
            }
        }
        return { order: defaultOrder, sizes: defaultSizes };
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('dashboard_layout_v2', JSON.stringify(layout));
        }
    }, [layout, mounted]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLayout((prev) => {
                const oldIndex = prev.order.indexOf(active.id as string);
                const newIndex = prev.order.indexOf(over.id as string);
                return {
                    ...prev,
                    order: arrayMove(prev.order, oldIndex, newIndex)
                };
            });
        }
    };

    const handleResize = (id: string, newSize: Partial<WidgetSize>) => {
        setLayout(prev => ({
            ...prev,
            sizes: {
                ...prev.sizes,
                [id]: { ...prev.sizes[id], ...newSize }
            }
        }));
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset the layout to default?')) {
            localStorage.removeItem('dashboard_layout_v2');
            // Force reload to apply defaults cleanly
            window.location.reload();
        }
    };

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                {isEditing && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        Reset Layout
                    </button>
                )}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition-all ${isEditing
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white dark:bg-slate-800 text-stone-500 border-stone-200 hover:border-primary hover:text-primary dark:text-slate-400 dark:border-slate-700 dark:hover:text-amber-400'
                        }`}
                >
                    <LayoutTemplate className="w-4 h-4" />
                    {isEditing ? 'Done Editing' : 'Customize Layout'}
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={layout.order} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
                        {layout.order.map((id) => {
                            const index = parseInt(id.split('-')[1]);
                            // Guard against index out of bounds if children length changes
                            if (index >= children.length) return null;

                            return (
                                <SortableItem
                                    key={id}
                                    id={id}
                                    isEditing={isEditing}
                                    size={layout.sizes[id] || { width: 'small', height: 'auto' }}
                                    onResize={handleResize}
                                >
                                    {children[index]}
                                </SortableItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
