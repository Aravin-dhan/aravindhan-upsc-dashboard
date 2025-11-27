"use client";

import { useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import confetti from 'canvas-confetti';

export function PremiumEffects() {
    const { tasks } = useDashboard();
    const prevCompletedCount = useRef(0);

    useEffect(() => {
        const completedCount = tasks.filter(t => t.completed).length;

        // Trigger confetti if completed count increased
        if (completedCount > prevCompletedCount.current && prevCompletedCount.current !== 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#10b981', '#3b82f6'] // Amber, Emerald, Blue
            });

            // Play sound (optional, simple beep or custom sound)
            // const audio = new Audio('/sounds/success.mp3');
            // audio.play().catch(e => console.log('Audio play failed', e));
        }

        prevCompletedCount.current = completedCount;
    }, [tasks]);

    return null; // This component renders nothing visually
}
